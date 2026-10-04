import { useEffect, useState } from "react";
import { getBoss } from "@/game/bosses";
import { useGameStore } from "@/game/store";

export function QteOverlay() {
  const activeQte = useGameStore((state) => state.activeQte);
  const qteStep = useGameStore((state) => state.qteStep);
  const bossIndex = useGameStore((state) => state.bossIndex);
  const advance = useGameStore((state) => state.advanceQte);
  const fail = useGameStore((state) => state.failQte);
  const minimize = useGameStore((state) => state.minimizeApp);
  const openTeamsDm = useGameStore((state) => state.openTeamsDm);
  const activeMessageText = useGameStore((state) => state.activeMessageText);
  const [left, setLeft] = useState(getBoss(bossIndex).reactionWindow);
  const boss = getBoss(bossIndex);

  useEffect(() => {
    setLeft(boss.reactionWindow);
    if (!activeQte) return;
    const timer = window.setInterval(() => setLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [activeQte, boss.reactionWindow, qteStep]);
  useEffect(() => { if (activeQte && left <= 0) fail(); }, [activeQte, fail, left]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (activeQte === "sneak" && event.key === "Escape") { minimize("break"); advance(); }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [activeQte, advance, minimize]);

  if (!activeQte) return null;

  if (activeQte === "message") {
    const msgText = activeMessageText ?? "Please advise.";
    return (
      <aside className="squads-toast">
        <div className="squads-head">
          <span>T</span>
          <div>
            <strong>Microsoft Teams</strong>
            <small>New message</small>
          </div>
          <b className={`squads-countdown${left <= 3 ? " urgent" : ""}`} aria-label={`${left} seconds remaining`}>
            <i>{left}</i><small>SEC</small>
          </b>
        </div>
        <div className="boss-avatar small"><img src={boss.photo} alt={boss.name} /></div>
        <div>
          <strong>{boss.name} <small>· {boss.title}</small></strong>
          <p>{msgText}</p>
          <div className="squads-toast-actions">
            <button type="button" onClick={() => openTeamsDm(bossIndex)}>
              💬 Open Teams to Reply
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (activeQte === "call") return <div className="qte-scrim"><section className="call-dialog"><div className="squads-head"><span>T</span><strong>Microsoft Teams — Incoming call</strong><b>{left}s</b></div><div className="boss-avatar call-avatar"><img src={boss.photo} alt={boss.name} /></div><h2>{boss.name}</h2><p>{qteStep === "incoming" ? "wants to connect" : "You're on mute… actually, never mind."}</p>{qteStep === "incoming" ? <div className="call-actions"><button type="button" className="answer" onClick={advance}>☎ Answer</button><button type="button" className="decline" onClick={fail}>✕ Decline</button></div> : <button type="button" className="unmute" onClick={advance}>🎙 Unmute</button>}</section></div>;

  return <div className="sneak-overlay"><div className="reflection" data-side={bossIndex % 2 ? "left" : "right"}><div className="boss-avatar reflection-face"><img src={boss.photo} alt={boss.name} /></div><strong>{boss.name.toUpperCase()}</strong></div><div className="sneak-warning"><b>{left}s</b><span>PRESS ESC — MINIMIZE BREAK ROOM</span></div><button type="button" onClick={() => { minimize("break"); advance(); }}>Minimize now</button></div>;
}

export function SleepyOverlay() {
  const energy = useGameStore((state) => state.energy);
  if (energy >= 35) return null;
  const level = energy <= 10 ? "critical" : energy <= 20 ? "heavy" : "low";
  return <div className="sleepy-overlay" data-level={level} aria-hidden="true"><div className="eyelid top" /><div className="eyelid bottom" /></div>;
}

export function PhaseOverlay() {
  const phase = useGameStore((state) => state.phase);
  const bossIndex = useGameStore((state) => state.bossIndex);
  const cutsceneKind = useGameStore((state) => state.cutsceneKind);
  const beginPromotion = useGameStore((state) => state.beginPromotion);
  const finishCutscene = useGameStore((state) => state.finishCutscene);
  const restart = useGameStore((state) => state.restart);
  const muted = useGameStore((state) => state.muted);
  const boss = getBoss(bossIndex);
  if (phase === "playing" || phase === "title") return null;
  if (phase === "promotion") return <div className="qte-scrim"><section className="xp-dialog promotion-dialog"><header>Career Development</header><div><span className="dialog-icon">🏆</span><p>Promotion available.<br />Address the issue with your manager?</p></div><footer><button type="button" onClick={beginPromotion}>Slap</button></footer></section></div>;
  if (phase === "cutscene" && cutsceneKind === "slap") return <div className="cutscene slap-cutscene"><video className="cutscene-video" src={boss.cutscene} autoPlay playsInline muted={muted} onEnded={finishCutscene} /><button type="button" onClick={finishCutscene}>Continue promotion ▶▶</button></div>;
  if (phase === "cutscene") return <div className={`cutscene ${cutsceneKind}`}><div className="cutscene-boss"><div className="boss-avatar giant"><img src={boss.photo} alt={boss.name} /></div><span>{boss.name}<br />{boss.title}</span></div><div className="comic-burst">WAKE UP!</div><button type="button" onClick={finishCutscene}>Continue ▶▶</button></div>;
  if (phase === "gameOver") return <div className="bsod" role="button" tabIndex={0} onClick={restart} onKeyDown={restart}><div><h1>9to5</h1><p>A fatal error has occurred: YOU ARE FIRED.</p><p>Your energy reached zero while performing an essential business function. Unsaved dignity has been lost.</p><p>Press any key to restart your career _</p></div></div>;
  return <div className="victory"><section className="gold-window"><header>Executive Promotion Wizard</header><div className="ceo-seal">CEO</div><h1>You are now CEO.</h1><p>It looks like you've fully assimilated.</p><small>Congratulations. The cycle is now yours to perpetuate.</small><button type="button" onClick={restart}>Play again</button></section></div>;
}
