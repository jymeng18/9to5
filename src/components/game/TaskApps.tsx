import { useEffect, useMemo, useState } from "react";
import { getBoss, type AppId, type MissionTask } from "@/game/bosses";
import { useGameStore } from "@/game/store";
import { XpWindow } from "./XpWindow";

const APP_META: Record<AppId, { title: string; icon: string }> = {
  files: { title: "Documents", icon: "📁" },
  sheets: { title: "Quarterly_Forecast.xls - Sheets 2003", icon: "▦" },
  notes: { title: "Untitled - Notepad", icon: "📝" },
  break: { title: "Break Room", icon: "▶" },
  recycle: { title: "Recycle Bin", icon: "♻" },
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
  const correct = [...value].filter((char, index) => char === target[index]).length;
  return <div className="notes-app"><p className="typing-target">Please retype exactly:</p><blockquote>{target}</blockquote><textarea autoFocus value={value} onChange={(event) => { const next = event.target.value; setValue(next); if (next === target) complete(task.id); }} spellCheck={false} /><div className="status-line">{correct} / {target.length} correct characters</div></div>;
}

function BreakRoom() {
  const slides = useMemo(() => [
    ["Quarterly serenity", "A loading bar reaches 99% and stops."],
    ["Lunch desk tour", "One yogurt. Three status meetings."],
    ["Inbox archaeology", "Email threads older than the intern."],
    ["Leadership quote", "There is no I in unpaid overtime."],
  ], []);
  const [index, setIndex] = useState(0);
  return <div className="break-app" tabIndex={0} onWheel={(event) => setIndex((index + (event.deltaY > 0 ? 1 : slides.length - 1)) % slides.length)} onKeyDown={(event) => { if (event.key === "ArrowDown") setIndex((index + 1) % slides.length); if (event.key === "ArrowUp") setIndex((index + slides.length - 1) % slides.length); }}>
    <div className="phone-video video-variant" data-slide={index}><div className="video-copy"><small>BREAK ROOM SHORTS</small><strong>{slides[index]?.[0] ?? "Quarterly serenity"}</strong><span>{slides[index]?.[1] ?? "A loading bar reaches 99% and stops."}</span></div><div className="video-controls"><button type="button" aria-label="Previous short" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>▲</button><button type="button" aria-label="Next short" onClick={() => setIndex((index + 1) % slides.length)}>▼</button></div></div>
    <div className="energy-float">+3 energy/sec</div>
    <p>Scroll discreetly. Management visibility may vary.</p>
  </div>;
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
    if (app === "break") return <XpWindow key={app} {...common} width={480} height={520}><BreakRoom /></XpWindow>;
    return <XpWindow key={app} {...common} width={390} height={230}><div className="recycle-app">🗑️<strong>Your dignity</strong><span>0 bytes</span></div></XpWindow>;
  })}</>;
}
