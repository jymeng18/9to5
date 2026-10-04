export type BossId = "manager" | "seniorManager" | "vp";
export type AppId = "files" | "sheets" | "notes" | "break" | "recycle" | "teams";
export type BossActivity = "reels" | "idle" | "work";
export type ReplyCategory = BossActivity;

export interface MissionTask {
  id: string;
  app: Exclude<AppId, "break" | "recycle" | "teams">;
  label: string;
  instruction: string;
}

export interface Boss {
  id: BossId;
  name: string;
  title: string;
  initials: string;
  messageEvery: number;
  callEvery?: number;
  sneakEvery?: number;
  reactionWindow: number;
  messages: string[];
  activityMessages: Record<BossActivity, string[]>;
  missions: MissionTask[];
}

const task = (
  id: string,
  app: MissionTask["app"],
  label: string,
  instruction: string,
): MissionTask => ({ id, app, label, instruction });

export const BOSSES: Boss[] = [
  {
    id: "manager",
    name: "Gary",
    title: "Manager",
    initials: "GM",
    messageEvery: 15,
    reactionWindow: 14,
    messages: [
      "Quick sync? Need to leverage your bandwidth ASAP.",
      "Are we aligned on the north star here?",
      "Please advise on next steps before EOD.",
    ],
    activityMessages: {
      reels: ["You have been on Reels for a while. Is that helping the deliverable?", "Are you watching videos during work hours?"],
      idle: ["I do not see any activity. Please confirm what you are working on.", "Checking in. What is currently in progress?"],
      work: ["Please send me a quick update on your current deliverable.", "How is the workstream progressing?"],
    },
    missions: [
      task("m-file-1", "files", "File expense reports", "Sort Q3_expenses_FINAL.xlsx into Finance."),
      task("m-sheet-1", "sheets", "Correct forecast", "Update cell C3 to 42,000 and press Enter."),
      task("m-note-1", "notes", "Draft alignment note", "Per my last email, let's circle back."),
      task("m-file-2", "files", "Archive onboarding form", "Sort New_Hire_Form.docx into HR."),
      task("m-note-2", "notes", "Confirm bandwidth", "I have capacity to action this deliverable."),
    ],
  },
  {
    id: "seniorManager",
    name: "Denise",
    title: "Senior Manager",
    initials: "DS",
    messageEvery: 12,
    callEvery: 25,
    reactionWindow: 12,
    messages: [
      "Let's operationalize this learning immediately.",
      "I need a pre-read for the pre-read by noon.",
      "Can you socialize this across the workstream?",
    ],
    activityMessages: {
      reels: ["Are those Reels part of the research plan?", "I am seeing leisure activity during a work block. Please explain."],
      idle: ["There has been no visible activity. Should I expect an update?", "Please confirm ownership of the next action."],
      work: ["Can you socialize a status update across the workstream?", "Please send the current state and next steps."],
    },
    missions: [
      task("s-sheet-1", "sheets", "Fix revenue model", "Update cell C3 to 42,000 and press Enter."),
      task("s-note-1", "notes", "Manage expectations", "Let's take this offline and align on deliverables."),
      task("s-file-1", "files", "File policy deck", "Sort People_Strategy_v7.pptx into HR."),
      task("s-sheet-2", "sheets", "Remove risk flags", "Delete the red rows."),
      task("s-note-2", "notes", "Document ownership", "I will own the action items and circle back EOD."),
    ],
  },
  {
    id: "vp",
    name: "Richard",
    title: "Vice President",
    initials: "RV",
    messageEvery: 10,
    callEvery: 20,
    sneakEvery: 30,
    reactionWindow: 10,
    messages: [
      "Visibility is accountability. Where is the deck?",
      "This needs executive-ready thinking, not activity.",
      "I am adding the leadership team for awareness.",
    ],
    activityMessages: {
      reels: ["The leadership team can see that you are watching Reels. Explain the business value.", "This is not executive-ready activity."],
      idle: ["Visibility is accountability. Why is there no activity?", "I need a status update, not silence."],
      work: ["Where is the executive-ready update?", "Please provide the current status and any risks."],
    },
    missions: [
      task("v-note-1", "notes", "Write transformation memo", "We will unlock enterprise value through disciplined execution."),
      task("v-sheet-1", "sheets", "Normalize the outlook", "Delete the red rows."),
      task("v-file-1", "files", "Archive legal feedback", "Sort Contract_Comments_FINAL2.docx into Misc."),
      task("v-note-2", "notes", "Signal accountability", "Please consider this my formal commitment to the workstream."),
      task("v-sheet-2", "sheets", "Correct board number", "Update cell C3 to 42,000 and press Enter."),
    ],
  },
];

export function getBoss(index: 0 | 1 | 2): Boss {
  switch (index) {
    case 1: return BOSSES[1] ?? BOSSES[0] ?? fallbackBoss;
    case 2: return BOSSES[2] ?? BOSSES[0] ?? fallbackBoss;
    default: return BOSSES[0] ?? fallbackBoss;
  }
}

const fallbackBoss: Boss = {
  id: "manager",
  name: "Gary",
  title: "Manager",
  initials: "GM",
  messageEvery: 12,
  reactionWindow: 5,
  messages: ["Please advise."],
  activityMessages: { reels: ["Please stop watching videos."], idle: ["Please advise."], work: ["Please advise."] },
  missions: [],
};

export function getBossMessage(boss: Boss, activity: BossActivity): string {
  const messages = boss.activityMessages[activity];
  return messages[Math.floor(Date.now() / 1000) % messages.length] ?? boss.messages[0] ?? "Please advise.";
}
