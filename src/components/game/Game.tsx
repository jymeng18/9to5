import { useEffect, useState } from "react";
import { getBoss, type AppId } from "@/game/bosses";
import { useGameStore } from "@/game/store";
import wallpaper from "@/assets/corporate-office.jpg";
import notepadIcon from "@/assets/xp/notepad.png";
import computerIcon from "@/assets/xp/computer.png";
import { PhaseOverlay, QteOverlay, SleepyOverlay } from "./GameOverlays";
import { TaskApps } from "./TaskApps";

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
  if (phase === "title") return <LoginScreen onStart={start} />;
  return <Desktop />;
}

function LoginScreen({ onStart }: { onStart: () => void }) {
  return <main className="login-screen"><div className="login-top" /><div className="login-center"><section className="login-brand"><div className="flag-logo"><span /><span /><span /><span /></div><h1>9to5<sup>™</sup></h1><p>corporate edition</p></section><div className="login-divider" /><section className="user-login"><button type="button" className="user-tile" onClick={onStart}><span className="employee-photo">👔</span><span><strong>New Hire</strong><small>Reports to: Gary</small></span><b>➜</b></button><p>To begin, click your user name</p></section></div><footer className="login-footer"><button type="button">⏻ Turn off computer</button><p>After you log on, you can spend the next eight hours<br />demonstrating visible productivity.</p></footer></main>;
}

function Desktop() {
  const bossIndex = useGameStore((state) => state.bossIndex);
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
  const dismissCaught = useGameStore((state) => state.dismissCaught);
  const [startOpen, setStartOpen] = useState(false);
  const boss = getBoss(bossIndex);
  useEffect(() => { const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer); }, [tick]);
  const hour = 9 + Math.floor((xp / 100) * 8);

  return <main className="desktop" style={{ backgroundImage: `url(${wallpaper})` }} onMouseDown={() => setStartOpen(false)}>
    <div className="desktop-shade" />
    <aside className="desktop-icons">{icons.map((item) => <button type="button" key={item.app} className="desktop-icon" onDoubleClick={() => openApp(item.app)} onClick={(event) => { if (event.detail === 1) focusApp(item.app); }}><span className={`desktop-glyph ${item.app}`}>{item.image ? <img src={item.image} alt="" width={32} height={32} /> : item.glyph}</span><span>{item.label}</span></button>)}</aside>
    <section className={`career-window ${xp === 100 ? "full" : ""}`}><header><div className="boss-avatar tiny">{boss.initials}</div><strong>Career Progress</strong></header><div className="career-body"><Progress label="XP" value={xp} tone="green" /><Progress label="Energy" value={energy} tone={energy < 25 ? "red" : "amber"} /><p>Reporting to: <strong>{boss.name}, {boss.title}</strong></p></div></section>
    <section className="priorities"><header>Today's Priorities</header><p>{boss.title}'s critical path</p><ul>{boss.missions.map((mission) => <li key={mission.id} className={completed.includes(mission.id) ? "done" : ""}><span>{completed.includes(mission.id) ? "☑" : "☐"}</span><button type="button" onClick={() => openApp(mission.app)}>{mission.label}</button></li>)}</ul><footer>{completed.length} of 5 complete</footer></section>
    <TaskApps />
    <SleepyOverlay />
    <QteOverlay />
    {caughtMessage && (
      <div className="qte-scrim dramatic-scrim">
        <div className="caught-modal">
          <div className="caught-modal-header">
            <span className="warning-icon">⚠</span>
            <h1>OFFICIAL REPRIMAND</h1>
          </div>
          <div className="caught-modal-body">
            <p className="caught-sentence">MANAGEMENT HAS LOGGED AN INFRACTION</p>
            <p className="caught-message">"{caughtMessage}"</p>
            <p className="caught-penalty">ENERGY PENALTY APPLIED.</p>
          </div>
          <div className="caught-modal-footer">
            <button type="button" onClick={dismissCaught}>ACKNOWLEDGE & RETURN TO WORK</button>
          </div>
        </div>
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
