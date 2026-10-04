import { useEffect, useMemo, useState } from "react";
import { getBoss, type AppId, type MissionTask } from "@/game/bosses";
import { useGameStore } from "@/game/store";
import { XpWindow } from "./XpWindow";
import { TeamsApp } from "./TeamsApp";

const APP_META: Record<AppId, { title: string; icon: string }> = {
  files: { title: "Documents", icon: "📁" },
  sheets: { title: "Quarterly_Forecast.xls - Sheets 2003", icon: "▦" },
  notes: { title: "Untitled - Notepad", icon: "📝" },
  break: { title: "Break Room", icon: "▶" },
  recycle: { title: "Recycle Bin", icon: "♻" },
  teams: { title: "Microsoft Teams", icon: "T" },
};

function currentTask(app: MissionTask["app"], bossIndex: 0 | 1 | 2, completed: string[]) {
  return getBoss(bossIndex).missions.find((mission) => mission.app === app && !completed.includes(mission.id));
}

function FileApp({ task }: { task: MissionTask | undefined }) {
  const complete = useGameStore((state) => state.completeTask);
  const [selected, setSelected] = useState<string | null>(null);
  const expected = task?.instruction.includes("Finance") ? "Finance" : task?.instruction.includes("HR") ? "HR" : "Misc";
  const file = task?.instruction.match(/Sort (.+) into/)?.[1] ?? "Inbox_Zero_Plan.docx";
  if (!task) return <EmptyApp />;
  return <div className="files-app">
    <aside><strong>File and Folder Tasks</strong><button type="button">Make a new folder</button><button type="button">Publish this folder</button></aside>
    <main>
      <p className="app-instruction">{task.instruction}</p>
      <button type="button" className={`loose-file ${selected ? "selected" : ""}`} onClick={() => setSelected(file)}>📄<span>{file}</span></button>
      <div className="folder-row">
        {["Finance", "HR", "Misc"].map((folder) => <button key={folder} type="button" className="folder" onClick={() => { if (selected && folder === expected) complete(task.id); }}>📁<span>{folder}</span></button>)}
      </div>
      <p className="status-line">Select the document, then choose its approved retention folder.</p>
    </main>
  </div>;
}

function SheetsApp({ task }: { task: MissionTask | undefined }) {
  const complete = useGameStore((state) => state.completeTask);
  const [value, setValue] = useState("38,500");
  if (!task) return <EmptyApp />;
  const deleteRows = task.instruction.includes("red rows");
  return <div className="sheet-app">
    <div className="sheet-toolbar"><strong>Arial</strong><span>10</span><b>B</b><i>I</i><button type="button" onClick={() => deleteRows && complete(task.id)}>✕ Delete rows</button></div>
    <div className="formula-bar">fx&nbsp;&nbsp; {value}</div>
    <p className="app-instruction">{task.instruction}</p>
    <div className="grid" role="grid">
      {Array.from({ length: 25 }, (_, index) => {
        const row = Math.floor(index / 5) + 1;
        const col = String.fromCharCode(65 + index % 5);
        const red = deleteRows && row === 4;
        return index === 12 && !deleteRows ? <input key={index} aria-label="Cell C3" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && value.replace(/,/g, "") === "42000") complete(task.id); }} /> : <div key={index} className={red ? "risk-row" : ""}>{col}{row === 1 ? "" : row}</div>;
      })}
    </div>
  </div>;
}

function NotesApp({ task }: { task: MissionTask | undefined }) {
  const complete = useGameStore((state) => state.completeTask);
  const target = task?.instruction ?? "";
  const [value, setValue] = useState("");
  useEffect(() => setValue(""), [task?.id]);
  if (!task) return <EmptyApp />;
  // Bug fix: only count as "correct" up to target.length — extra chars don't count
  const trimmed = value.slice(0, target.length);
  const correct = [...trimmed].filter((char, index) => char === target[index]).length;
  const isComplete = value === target;
  return (
    <div className="notes-app">
      <p className="typing-target">Please retype exactly:</p>
      <blockquote>{target}</blockquote>
      <textarea
        autoFocus
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          // Only complete when the string is an exact match (length + content)
          if (next === target) complete(task.id);
        }}
        spellCheck={false}
      />
      <div className={`status-line${isComplete ? " notes-complete" : ""}`}>
        {isComplete ? "✓ Complete!" : `${correct} / ${target.length} correct characters`}
      </div>
    </div>
  );
}

function BreakRoom() {
  const slides = useMemo(() => [
    { title: "Quarterly serenity", caption: "A loading bar reaches 99% and stops.", author: "@office_zen", likes: "12.4K", comments: "342", emoji: "📊" },
    { title: "Lunch desk tour", caption: "One yogurt. Three status meetings.", author: "@desk_diaries", likes: "8.7K", comments: "156", emoji: "🍱" },
    { title: "Inbox archaeology", caption: "Email threads older than the intern.", author: "@corporate_lore", likes: "31.2K", comments: "1.2K", emoji: "📧" },
    { title: "Leadership quote", caption: "There is no I in unpaid overtime.", author: "@hustle_culture", likes: "45.8K", comments: "2.3K", emoji: "💼" },
    { title: "Meeting recovery", caption: "That meeting could have been an email.", author: "@zoom_fatigue", likes: "67.1K", comments: "4.1K", emoji: "🎯" },
    { title: "Coffee run protocol", caption: "Third cup before 10 AM. New personal best.", author: "@caffeine_coder", likes: "22.3K", comments: "890", emoji: "☕" },
  ], []);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [transitioning, setTransitioning] = useState(false);

  const navigate = (dir: 1 | -1) => {
    if (transitioning) return;
    setTransitioning(true);
    setIndex((i) => (i + dir + slides.length) % slides.length);
    setTimeout(() => setTransitioning(false), 450);
  };

  const toggleLike = (i: number) => {
    setLiked((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });
  };

  const slide = slides[index]!;

  return (
    <div
      className="break-app"
      tabIndex={0}
      onWheel={(event) => { if (event.deltaY > 0) navigate(1); else navigate(-1); }}
      onKeyDown={(event) => { if (event.key === "ArrowDown") navigate(1); if (event.key === "ArrowUp") navigate(-1); }}
    >
      {/* Ambient background */}
      <div className="reel-bg" data-slide={index}>
        <div className="reel-bg-grain" />
        <div className="reel-bg-vignette" />
      </div>

      {/* Floating ambient particles */}
      <div className="reel-particles" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="reel-particle" style={{ left: `${8 + (i * 7.5) % 84}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${6 + (i % 4) * 2}s` }} />
        ))}
      </div>

      {/* Status bar */}
      <div className="reel-status-bar">
        <span>9:41</span>
        <span className="reel-status-label">Reels</span>
        <div className="reel-status-icons">
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Main content area */}
      <div className={`reel-content ${transitioning ? "reel-transitioning" : ""}`}>
        <div className="reel-emoji-backdrop" aria-hidden="true">{slide.emoji}</div>

        {/* Bottom overlay info */}
        <div className="reel-info">
          <div className="reel-author-row">
            <div className="reel-avatar">{slide.author[1]?.toUpperCase()}</div>
            <span className="reel-author-name">{slide.author}</span>
            <button type="button" className="reel-follow-btn">Follow</button>
          </div>
          <h3 className="reel-title">{slide.title}</h3>
          <p className="reel-caption">{slide.caption}</p>
          <div className="reel-music-row">
            <span className="reel-music-icon">♫</span>
            <span className="reel-music-text">Original Audio — {slide.author}</span>
            <div className="reel-disc">
              <span className="reel-disc-inner">{slide.emoji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side action buttons */}
      <div className="reel-actions">
        <button type="button" className={`reel-action-btn ${liked.has(index) ? "reel-liked" : ""}`} onClick={() => toggleLike(index)}>
          <span className="reel-action-icon">{liked.has(index) ? "❤️" : "🤍"}</span>
          <span className="reel-action-label">{slide.likes}</span>
        </button>
        <button type="button" className="reel-action-btn">
          <span className="reel-action-icon">💬</span>
          <span className="reel-action-label">{slide.comments}</span>
        </button>
        <button type="button" className="reel-action-btn">
          <span className="reel-action-icon">↗️</span>
          <span className="reel-action-label">Share</span>
        </button>
        <button type="button" className="reel-action-btn">
          <span className="reel-action-icon">⋯</span>
        </button>
      </div>

      {/* Navigation dots */}
      <div className="reel-nav-dots">
        {slides.map((_, i) => (
          <button key={i} type="button" className={`reel-dot ${i === index ? "reel-dot-active" : ""}`} onClick={() => { setIndex(i); }} aria-label={`Go to slide ${i + 1}`} />
        ))}
      </div>

      {/* Scroll hint arrows */}
      <div className="reel-scroll-hint">
        <button type="button" className="reel-scroll-arrow" onClick={() => navigate(-1)} aria-label="Previous" disabled={transitioning}>
          <span>‹</span>
        </button>
        <button type="button" className="reel-scroll-arrow" onClick={() => navigate(1)} aria-label="Next" disabled={transitioning}>
          <span>›</span>
        </button>
      </div>

      {/* Bottom navigation bar */}
      <div className="reel-bottom-nav">
        <div className="reel-nav-item reel-nav-active">
          <span>🏠</span>
          <span>Home</span>
        </div>
        <div className="reel-nav-item">
          <span>🔍</span>
          <span>Explore</span>
        </div>
        <div className="reel-nav-item reel-nav-create">
          <span>＋</span>
        </div>
        <div className="reel-nav-item">
          <span>📥</span>
          <span>Inbox</span>
        </div>
        <div className="reel-nav-item">
          <span>👤</span>
          <span>Profile</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="reel-progress">
        <div className="reel-progress-fill" />
      </div>

      {/* Energy indicator */}
      <div className="energy-float">
        <span className="energy-float-icon">⚡</span>
        +3 energy/sec
      </div>
    </div>
  );
}

function EmptyApp() { return <div className="empty-app"><span>✓</span><strong>All assigned work is complete.</strong><p>Please wait quietly for additional responsibilities.</p></div>; }

export function TaskApps() {
  const bossIndex = useGameStore((state) => state.bossIndex);
  const completed = useGameStore((state) => state.completed);
  const openApps = useGameStore((state) => state.openApps);
  return <>{openApps.map((app, index) => {
    const meta = APP_META[app];
    const common = { app, title: meta.title, icon: meta.icon, x: 210 + index * 34, y: 142 + index * 24 };
    if (app === "files") return <XpWindow key={app} {...common}><FileApp task={currentTask("files", bossIndex, completed)} /></XpWindow>;
    if (app === "sheets") return <XpWindow key={app} {...common} width={650}><SheetsApp task={currentTask("sheets", bossIndex, completed)} /></XpWindow>;
    if (app === "notes") return <XpWindow key={app} {...common}><NotesApp task={currentTask("notes", bossIndex, completed)} /></XpWindow>;
    if (app === "break") return <XpWindow key={app} {...common} width={400} height={700}><BreakRoom /></XpWindow>;
    if (app === "teams") return <XpWindow key={app} {...common} width={760} height={520}><TeamsApp /></XpWindow>;
    return <XpWindow key={app} {...common} width={390} height={230}><div className="recycle-app">🗑️<strong>Your dignity</strong><span>0 bytes</span></div></XpWindow>;
  })}</>;
}
