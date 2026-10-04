import { create } from "zustand";
import { BALANCE } from "./balance";
import { getBoss, type AppId } from "./bosses";
import { getEvent, pickEvent } from "./events";

export type Phase = "title" | "playing" | "promotion" | "cutscene" | "gameOver" | "victory";
export type QteType = null | "message" | "call" | "sneak";

export interface TeamsMessage {
  id: string;
  bossIndex: 0 | 1 | 2;
  text: string;
  timestamp: number;
  sender: "boss" | "player";
  session?: number;
}

interface GameState {
  phase: Phase;
  bossIndex: 0 | 1 | 2;
  xp: number;
  energy: number;
  completed: string[];
  openApps: AppId[];
  minimizedApps: AppId[];
  focusedApp: AppId | null;
  scrollSeconds: number;
  totalSeconds: number;
  idleSeconds: number;
  activeQte: QteType;
  qteStep: "incoming" | "unmute";
  caughtMessage: string | null;
  managementNotices: number;
  activeEventId: string | null;
  activeMessageText: string | null;
  activeSession: number | null;
  usedEventIds: string[];
  muted: boolean;
  cutsceneKind: "slap" | "wake";
  teamsMessages: TeamsMessage[];
  teamsActiveDm: 0 | 1 | 2 | null;
  start: () => void;
  openApp: (app: AppId) => void;
  focusApp: (app: AppId) => void;
  minimizeApp: (app: AppId) => void;
  closeApp: (app: AppId) => void;
  completeTask: (id: string) => void;
  tick: () => void;
  triggerQte: (qte: Exclude<QteType, null>) => void;
  advanceQte: () => void;
  failQte: () => void;
  dismissCaught: () => void;
  beginPromotion: () => void;
  finishCutscene: () => void;
  restart: () => void;
  toggleMute: () => void;
  openTeamsDm: (bossIdx: 0 | 1 | 2) => void;
  setTeamsActiveDm: (bossIdx: 0 | 1 | 2 | null) => void;
  sendTeamsMessage: (bossIdx: 0 | 1 | 2, text: string) => void;
}

const initial = {
  phase: "title" as Phase,
  bossIndex: 0 as const,
  xp: 0,
  energy: BALANCE.bossStartEnergy,
  completed: [] as string[],
  openApps: [] as AppId[],
  minimizedApps: [] as AppId[],
  focusedApp: null as AppId | null,
  scrollSeconds: 0,
  totalSeconds: 0,
  idleSeconds: 0,
  activeQte: null as QteType,
  qteStep: "incoming" as const,
  caughtMessage: null as string | null,
  managementNotices: 0,
  activeEventId: null,
  activeMessageText: null,
  activeSession: null,
  usedEventIds: [] as string[],
  muted: false,
  cutsceneKind: "slap" as const,
  teamsMessages: [] as TeamsMessage[],
  teamsActiveDm: null as 0 | 1 | 2 | null,
};

let msgCounter = 0;
let sessionCounter = 0;
let replyTimers: number[] = [];

export const useGameStore = create<GameState>((set, get) => ({
  ...initial,
  start: () => set({ phase: "playing" }),
  openApp: (app) => set((state) => ({
    openApps: state.openApps.includes(app) ? state.openApps : [...state.openApps, app],
    minimizedApps: state.minimizedApps.filter((item) => item !== app),
    focusedApp: app,
  })),
  focusApp: (app) => set({ focusedApp: app, minimizedApps: get().minimizedApps.filter((item) => item !== app) }),
  minimizeApp: (app) => set((state) => ({ minimizedApps: [...new Set([...state.minimizedApps, app])], focusedApp: state.focusedApp === app ? null : state.focusedApp, scrollSeconds: app === "break" ? 0 : state.scrollSeconds })),
  closeApp: (app) => set((state) => ({ openApps: state.openApps.filter((item) => item !== app), minimizedApps: state.minimizedApps.filter((item) => item !== app), focusedApp: state.focusedApp === app ? null : state.focusedApp, scrollSeconds: app === "break" ? 0 : state.scrollSeconds })),
  completeTask: (id) => set((state) => {
    const valid = getBoss(state.bossIndex).missions.some((mission) => mission.id === id);
    if (!valid || state.completed.includes(id) || state.phase !== "playing") return state;
    const xp = Math.min(100, state.xp + BALANCE.taskXp);
    return { completed: [...state.completed, id], xp, energy: Math.max(0, state.energy - BALANCE.taskEnergy), phase: xp >= 100 ? "promotion" : state.phase };
  }),
  tick: () => set((state) => {
    if (state.phase !== "playing" || state.activeQte) return state;
    const resting = state.focusedApp === "break" && !state.minimizedApps.includes("break");
    const energy = Math.max(0, Math.min(100, state.energy + (resting ? BALANCE.scrollRecoveryPerSecond : -BALANCE.passiveDrainPerSecond)));
    if (energy <= 0) return { energy: 0, phase: "cutscene", cutsceneKind: "wake", activeQte: null };
    const scrollSeconds = resting ? state.scrollSeconds + 1 : 0;
    const totalSeconds = state.totalSeconds + 1;
    const idle = !resting && state.focusedApp === null;
    const idleSeconds = idle ? state.idleSeconds + 1 : 0;
    const boss = getBoss(state.bossIndex);
    let activeQte: QteType = null;
    let newTeamsMessages = state.teamsMessages;
    let activeMessageText: string | null = null;
    let activeEventId: string | null = null;
    let activeSession = state.activeSession;
    let usedEventIds = state.usedEventIds;
    
    const workMessageInterval = boss.messageEvery * 2;
    const idleMessageInterval = 10;
    
    const deliverMessage = (context?: "afk") => {
      const event = pickEvent(boss.id, usedEventIds, context);
      activeQte = "message";
      activeEventId = event.id;
      activeMessageText = event.prompt;
      activeSession = ++sessionCounter;
      usedEventIds = [...usedEventIds, event.id];
      newTeamsMessages = [
        ...state.teamsMessages,
        { id: `msg-${++msgCounter}`, bossIndex: state.bossIndex, text: event.prompt, timestamp: Date.now(), sender: "boss", session: activeSession },
      ];
    };
    
    if (resting && boss.sneakEvery && scrollSeconds > 0 && scrollSeconds % boss.sneakEvery === 0) activeQte = "sneak";
    else if (resting && boss.callEvery && scrollSeconds > 0 && scrollSeconds % boss.callEvery === 0) activeQte = "call";
    else if (idle && idleSeconds >= idleMessageInterval && idleSeconds % idleMessageInterval === 0) deliverMessage("afk");
    else if ((resting && scrollSeconds > 0 && scrollSeconds % boss.messageEvery === 0) || (!resting && totalSeconds > 0 && totalSeconds % workMessageInterval === 0)) deliverMessage();
    return { energy, scrollSeconds, totalSeconds, idleSeconds, activeQte, qteStep: "incoming", activeEventId, activeMessageText, activeSession, teamsMessages: newTeamsMessages, usedEventIds };
  }),
  triggerQte: (activeQte) => set({ activeQte, qteStep: "incoming" }),
  advanceQte: () => set((state) => state.activeQte === "call" && state.qteStep === "incoming" ? { qteStep: "unmute" } : { activeQte: null, activeEventId: null, activeMessageText: null, activeSession: null, scrollSeconds: 0 }),
  failQte: () => set((state) => ({
    activeQte: null,
    activeEventId: null,
    activeMessageText: null,
    activeSession: null,
    qteStep: "incoming",
    scrollSeconds: 0,
    energy: Math.max(0, state.energy - 25),
    caughtMessage: "Per my last message… this has been noted.",
    managementNotices: Math.min(3, state.managementNotices + 1),
  })),
  dismissCaught: () => set((state) => ({
    caughtMessage: null,
    ...(state.managementNotices >= 3 ? { phase: "gameOver" as const } : {}),
  })),
  beginPromotion: () => set({ phase: "cutscene", cutsceneKind: "slap" }),
  finishCutscene: () => set((state) => {
    if (state.cutsceneKind === "wake") return { phase: "gameOver" };
    if (state.bossIndex === 2) return { phase: "victory" };
    const bossIndex = (state.bossIndex + 1) as 1 | 2;
    return { phase: "playing", bossIndex, xp: 0, energy: BALANCE.bossStartEnergy, completed: [], openApps: [], minimizedApps: [], focusedApp: null, scrollSeconds: 0, totalSeconds: 0, idleSeconds: 0, activeQte: null, activeEventId: null, activeMessageText: null, activeSession: null, usedEventIds: [] };
  }),
  restart: () => {
    replyTimers.forEach((timer) => window.clearTimeout(timer));
    replyTimers = [];
    sessionCounter = 0;
    set({ ...initial });
  },
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  openTeamsDm: (bossIdx) => set((state) => ({
    openApps: state.openApps.includes("teams") ? state.openApps : [...state.openApps, "teams"],
    minimizedApps: state.minimizedApps.filter((item) => item !== "teams"),
    focusedApp: "teams",
    teamsActiveDm: bossIdx,
  })),
  setTeamsActiveDm: (bossIdx) => set({ teamsActiveDm: bossIdx }),
  sendTeamsMessage: (bossIdx, text) => {
    const state = get();
    const isReplyingToBoss = state.activeQte === "message" && state.bossIndex === bossIdx;
    const event = getEvent(state.activeEventId);
    const answer = event?.answers.find((option) => option.text === text) ?? null;
    const failed = isReplyingToBoss && answer?.quality === "bad";
    const session = state.activeSession;
    const followUp = isReplyingToBoss && event ? (answer?.reply ?? "Noted.") : null;

    const nextMessages: TeamsMessage[] = [
      ...state.teamsMessages,
      { id: `msg-${++msgCounter}`, bossIndex: bossIdx, text, timestamp: Date.now(), sender: "player", ...(session != null ? { session } : {}) },
    ];

    if (followUp) {
      const reply = followUp;
      const delay = 1000 + Math.random() * 1000;
      const timer = window.setTimeout(() => {
        set((current) => ({
          teamsMessages: [
            ...current.teamsMessages,
            { id: `msg-${++msgCounter}`, bossIndex: bossIdx, text: reply, timestamp: Date.now(), sender: "boss", ...(session != null ? { session } : {}) },
          ],
        }));
      }, delay);
      replyTimers.push(timer);
    }

    set({
      teamsMessages: nextMessages,
      ...(isReplyingToBoss ? {
        activeQte: null,
        activeEventId: null,
        activeMessageText: null,
        activeSession: null,
        scrollSeconds: 0,
        ...(failed ? {
          energy: Math.max(0, state.energy - 25),
          caughtMessage: answer!.reply,
          managementNotices: Math.min(3, state.managementNotices + 1),
        } : {}),
      } : {}),
    });
  },
}));
