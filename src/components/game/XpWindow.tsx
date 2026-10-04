import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AppId } from "@/game/bosses";
import { useGameStore } from "@/game/store";

interface XpWindowProps {
  app: AppId;
  title: string;
  icon: string;
  children: ReactNode;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  showMenu?: boolean;
}

export function XpWindow({ app, title, icon, children, width = 590, height = 410, x = 260, y = 150, showMenu = true }: XpWindowProps) {
  const focusedApp = useGameStore((state) => state.focusedApp);
  const focusApp = useGameStore((state) => state.focusApp);
  const minimizeApp = useGameStore((state) => state.minimizeApp);
  const closeApp = useGameStore((state) => state.closeApp);
  const minimizedApps = useGameStore((state) => state.minimizedApps);
  const [position, setPosition] = useState({ x, y });
  const dragging = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - width, event.clientX - dragging.current.dx)),
        y: Math.max(0, Math.min(window.innerHeight - height - 32, event.clientY - dragging.current.dy)),
      });
    };
    const up = () => { dragging.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [height, width]);

  if (minimizedApps.includes(app)) return null;
  const focused = focusedApp === app;

  return (
    <section
      className={`xp-window${showMenu ? "" : " xp-window-no-menu"}`}
      data-focused={focused}
      onMouseDown={() => focusApp(app)}
      style={{ width, height, transform: `translate(${position.x}px, ${position.y}px)`, zIndex: focused ? 40 : 20 }}
      aria-label={title}
    >
      <header
        className="xp-titlebar"
        onMouseDown={(event) => {
          focusApp(app);
          dragging.current = { dx: event.clientX - position.x, dy: event.clientY - position.y };
        }}
      >
        <div className="xp-title"><span aria-hidden="true">{icon}</span>{title}</div>
        <div className="xp-window-actions">
          <button type="button" aria-label={`Minimize ${title}`} onMouseDown={(event) => event.stopPropagation()} onClick={() => minimizeApp(app)}>_</button>
          <button type="button" aria-label={`Close ${title}`} className="xp-close" onMouseDown={(event) => event.stopPropagation()} onClick={() => closeApp(app)}>×</button>
        </div>
      </header>
      {showMenu && <div className="xp-menu">File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help</div>}
      <div className="xp-window-body">{children}</div>
    </section>
  );
}
