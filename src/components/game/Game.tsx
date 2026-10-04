import { useEffect, useRef, useState } from "react";
import { getBoss, type AppId } from "@/game/bosses";
import {
  BOSS_TURN_IN_TIME_CUTSCENE_SRC,
  BOSS_TURN_TOO_LATE_CUTSCENE_SRC,
} from "@/game/bossEvent";
import {
  armBossEventAudio,
  startBossEventFootsteps,
  stopBossEventFootsteps,
} from "@/game/bossEventAudio";
import { setBackgroundMusicDesired } from "@/game/backgroundMusic";
import { useGameStore } from "@/game/store";
import { playTeamsNotification } from "@/game/teamsAudio";
import wallpaper from "@/assets/corporate-office.jpg";
import notepadIcon from "@/assets/xp/notepad.png";
import computerIcon from "@/assets/xp/computer.png";
import { BossCreepOverlay } from "./BossCreepOverlay";
import { BossCutscenePlayer } from "./BossCutscenePlayer";
import { BossWebcamPrompt } from "./BossWebcamPrompt";
import { PhaseOverlay, QteOverlay, SleepyOverlay } from "./GameOverlays";
import { TaskApps } from "./TaskApps";
import { WebcamTurnWindow } from "./WebcamTurnWindow";

const icons: Array<{ app: AppId; label: string; image?: string; glyph?: string }> = [
  { app: "files", label: "Documents", image: computerIcon },
  { app: "sheets", label: "Sheets 2003", glyph: "▦" },
  { app: "notes", label: "Notepad", image: notepadIcon },
  { app: "break", label: "Break Room", glyph: "▶" },
  { app: "recycle", label: "Recycle Bin", glyph: "♻" },
  { app: "teams", label: "Teams", glyph: "T" },
];

export function Game() {
  const phase = useGameStore((state) => state.phase);
  const start = useGameStore((state) => state.start);
  if (phase === "title")
    return (
      <LoginScreen
        onStart={() => {
          setBackgroundMusicDesired(true);
          start();
        }}
      />
    );
  return <Desktop />;
}

function LoginScreen({ onStart }: { onStart: () => void }) {
  return <main className="login-screen"><div className="login-top" /><div className="login-center"><section className="login-brand"><div className="flag-logo"><span /><span /><span /><span /></div><h1>9to5<sup>™</sup></h1><p>corporate edition</p></section><div className="login-divider" /><section className="user-login"><button type="button" className="user-tile" onClick={onStart}><span className="employee-photo">👔</span><span><strong>New Hire</strong><small>Reports to: Mike</small></span><b>➜</b></button><p>To begin, click your user name</p></section></div><footer className="login-footer"><button type="button">⏻ Turn off computer</button><p>After you log on, you can spend the next eight hours<br />demonstrating visible productivity.</p></footer></main>;
}

function Desktop() {
  const bossIndex = useGameStore((state) => state.bossIndex);
  const phase = useGameStore((state) => state.phase);
  const xp = useGameStore((state) => state.xp);
  const energy = useGameStore((state) => state.energy);
  const completed = useGameStore((state) => state.completed);
  const openApps = useGameStore((state) => state.openApps);
  const minimizedApps = useGameStore((state) => state.minimizedApps);
  const focusedApp = useGameStore((state) => state.focusedApp);
  const openApp = useGameStore((state) => state.openApp);
  const focusApp = useGameStore((state) => state.focusApp);
  const tick = useGameStore((state) => state.tick);
  const muted = useGameStore((state) => state.muted);
  const toggleMute = useGameStore((state) => state.toggleMute);
  const caughtMessage = useGameStore((state) => state.caughtMessage);
  const managementNotices = useGameStore((state) => state.managementNotices);
  const activeQte = useGameStore((state) => state.activeQte);
  const teamsMessages = useGameStore((state) => state.teamsMessages);
  const dismissCaught = useGameStore((state) => state.dismissCaught);
  const bossEventStage = useGameStore((state) => state.bossEventStage);
  const bossCutsceneOutcome = useGameStore((state) => state.bossCutsceneOutcome);
  const startBossEvent = useGameStore((state) => state.startBossEvent);
  const showBossPrompt = useGameStore((state) => state.showBossPrompt);
  const openBossWebcam = useGameStore((state) => state.openBossWebcam);
  const completeBossTurn = useGameStore((state) => state.completeBossTurn);
  const failBossTurn = useGameStore((state) => state.failBossTurn);
  const dismissBossEvent = useGameStore((state) => state.dismissBossEvent);
  const finishBossEvent = useGameStore((state) => state.finishBossEvent);
  const [startOpen, setStartOpen] = useState(false);
  const boss = getBoss(bossIndex);
  const mutedRef = useRef(muted);
  const bossMessageCountRef = useRef(0);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer); }, [tick]);
  const eventActive = activeQte !== null || caughtMessage !== null;
  const musicShouldPlay = !muted && phase === "playing" && !eventActive && bossEventStage === "idle";
  useEffect(() => { setBackgroundMusicDesired(musicShouldPlay); }, [musicShouldPlay]);
  useEffect(() => {
    const bossMessageCount = teamsMessages.reduce((total, message) => total + (message.sender === "boss" ? 1 : 0), 0);
    if (bossMessageCount > bossMessageCountRef.current) playTeamsNotification(mutedRef.current);
    bossMessageCountRef.current = bossMessageCount;
  }, [teamsMessages]);
  useEffect(() => {
    if (bossEventStage === "creeping" && !muted) {
      startBossEventFootsteps(false);
    } else {
      stopBossEventFootsteps();
    }
    return stopBossEventFootsteps;
  }, [bossEventStage, muted]);
  const hour = 9 + Math.floor((xp / 100) * 8);

  return <main className="desktop" style={{ backgroundImage: `url(${wallpaper})` }} onMouseDown={() => setStartOpen(false)}>
    <div className="desktop-shade" />
    <aside className="desktop-icons">{icons.map((item) => <button type="button" key={item.app} className="desktop-icon" onDoubleClick={() => openApp(item.app)} onClick={(event) => { if (event.detail === 1) focusApp(item.app); }}><span className={`desktop-glyph ${item.app}`}>{item.image ? <img src={item.image} alt="" width={32} height={32} /> : item.glyph}</span><span>{item.label}</span></button>)}</aside>
    <section className={`career-window ${xp === 100 ? "full" : ""}`}><header><div className="boss-avatar tiny"><img src={boss.photo} alt={boss.name} /></div><strong>Career Progress</strong></header><div className="career-body"><Progress label="XP" value={xp} tone="green" /><Progress label="Energy" value={energy} tone={energy < 25 ? "red" : "amber"} /><div className="meter-row strike-row"><span>Strikes</span><div className="strike-hearts" role="img" aria-label={`${managementNotices} of 3 strikes used`}>{[0, 1, 2].map((index) => <span key={index} className={`strike-heart${index < managementNotices ? " lost" : ""}`} aria-hidden="true">♥</span>)}</div><b>{managementNotices}/3</b></div><p>Reporting to: <strong>{boss.name}, {boss.title}</strong></p></div></section>
    <section className="priorities"><header>Today's Priorities</header><p>{boss.title}'s critical path</p><ul>{boss.missions.map((mission) => <li key={mission.id} className={completed.includes(mission.id) ? "done" : ""}><span>{completed.includes(mission.id) ? "☑" : "☐"}</span><button type="button" onClick={() => openApp(mission.app)}>{mission.label}</button></li>)}</ul><footer>{completed.length} of 5 complete</footer></section>
    {bossIndex === 0 && bossEventStage === "idle" && (
      <button
        type="button"
        className="boss-event-test-trigger"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => {
          armBossEventAudio();
          startBossEvent();
        }}
      >
        Test full boss sneak sequence
      </button>
    )}
    <TaskApps />
    <SleepyOverlay />
    <QteOverlay />
    <BossCreepOverlay
      active={bossEventStage === "creeping"}
      duration={8000}
      onCaught={() => {
        stopBossEventFootsteps();
        showBossPrompt();
      }}
    />
    {bossEventStage === "prompt" && (
      <BossWebcamPrompt muted={muted} onOpen={openBossWebcam} />
    )}
    {bossEventStage === "webcam" && (
      <div className="boss-webcam-scrim">
        <WebcamTurnWindow
          onTurnDetected={completeBossTurn}
          onTimedOut={failBossTurn}
          onClose={dismissBossEvent}
        />
      </div>
    )}
    {bossEventStage === "cutscene" && bossCutsceneOutcome && (
      <BossCutscenePlayer
        outcome={bossCutsceneOutcome}
        src={
          bossCutsceneOutcome === "inTime"
            ? BOSS_TURN_IN_TIME_CUTSCENE_SRC
            : BOSS_TURN_TOO_LATE_CUTSCENE_SRC
        }
        variableName={
          bossCutsceneOutcome === "inTime"
            ? "BOSS_TURN_IN_TIME_CUTSCENE_SRC"
            : "BOSS_TURN_TOO_LATE_CUTSCENE_SRC"
        }
        onClose={finishBossEvent}
      />
    )}
    {caughtMessage && (
      <div className="qte-scrim dramatic-scrim" role="presentation">
        <section className="caught-modal" role="alertdialog" aria-modal="true" aria-labelledby="caught-modal-title" aria-describedby="caught-modal-description">
          <header className="caught-modal-titlebar">
            <span className="caught-title-icon">9to5</span>
            <strong id="caught-modal-title">Management Notice</strong>
            <button type="button" aria-label="Acknowledge management notice" onClick={dismissCaught}>×</button>
          </header>
          <div className="caught-modal-body">
            <p className="caught-sentence">Management has flagged your last reply.</p>
            <p id="caught-modal-description" className="caught-message">"{caughtMessage}"</p>
            <p className="caught-record">Management notice {managementNotices} of 3</p>
            <p className="caught-penalty">{managementNotices >= 3 ? "Three notices recorded. Your employment is terminated." : `${3 - managementNotices} warning${managementNotices === 2 ? "" : "s"} remaining before termination.`}</p>
          </div>
          <div className="caught-modal-footer">
            <span>Management has recorded this notice.</span>
            <button type="button" onClick={dismissCaught}>OK</button>
          </div>
        </section>
      </div>
    )}
    {startOpen && <section className="start-menu" onMouseDown={(event) => event.stopPropagation()}><header><span className="employee-photo mini">👔</span><strong>New Hire</strong></header><div className="start-columns"><div>{icons.slice(0, 4).map((item) => <button type="button" key={item.app} onClick={() => { openApp(item.app); setStartOpen(false); }}><span>{item.glyph ?? "▣"}</span><b>{item.label}</b></button>)}</div><aside><button type="button">My Performance</button><button type="button">Recent Deliverables</button><button type="button">Squads</button><hr /><button type="button">Corporate Help</button><button type="button">Search</button></aside></div><footer>🔒 Log Off&nbsp;&nbsp;&nbsp; ⏻ Turn Off</footer></section>}
    <footer className="taskbar" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="start-button" onClick={() => setStartOpen((value) => !value)}><span>◫</span> start</button><div className="taskbar-apps">{openApps.map((app) => <button type="button" key={app} className={focusedApp === app && !minimizedApps.includes(app) ? "active" : ""} onClick={() => focusApp(app)}>{icons.find((item) => item.app === app)?.glyph ?? "▣"} {icons.find((item) => item.app === app)?.label}</button>)}</div><div className="tray"><button type="button" aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>{muted ? "🔇" : "🔊"}</button><span title={`Energy ${Math.round(energy)} percent`}>🔋 {Math.round(energy)}%</span><time>{hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}</time></div></footer>
    <PhaseOverlay />
    <div className="narrow-warning"><section className="xp-dialog"><header>9to5</header><div><span className="dialog-icon">⚠</span><p>This workstation requires a desktop display of at least 1024 pixels.</p></div><footer><button type="button">OK</button></footer></section></div>
  </main>;
}

function Progress({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="meter-row"><span>{label}</span><div className="xp-meter" aria-label={`${label}: ${Math.round(value)} percent`}><div className={tone} style={{ width: `${value}%` }}>{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div></div><b>{Math.round(value)}%</b></div>;
}
