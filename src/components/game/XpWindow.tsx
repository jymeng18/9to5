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

const TASKBAR_HEIGHT = 32;
const EDGE_GUTTER = 16;
const BOTTOM_GUTTER = 10;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(Math.max(min, max), value));
}

function fitToViewport(width: number, height: number) {
  if (typeof window === "undefined") return { width, height };
  return {
    width: Math.min(width, Math.max(240, window.innerWidth - EDGE_GUTTER)),
    height: Math.min(height, Math.max(200, window.innerHeight - TASKBAR_HEIGHT - BOTTOM_GUTTER)),
  };
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
    const keepInView = () => {
      const fit = fitToViewport(width, height);
      setPosition((current) => {
        const nextX = clamp(current.x, 0, window.innerWidth - fit.width);
        const nextY = clamp(current.y, 0, window.innerHeight - TASKBAR_HEIGHT - fit.height);
        return nextX === current.x && nextY === current.y ? current : { x: nextX, y: nextY };
      });
    };
    keepInView();
    window.addEventListener("resize", keepInView);
    return () => window.removeEventListener("resize", keepInView);
  }, [height, width]);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!dragging.current) return;
      const fit = fitToViewport(width, height);
      setPosition({
        x: clamp(event.clientX - dragging.current.dx, 0, window.innerWidth - fit.width),
        y: clamp(event.clientY - dragging.current.dy, 0, window.innerHeight - TASKBAR_HEIGHT - fit.height),
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
      style={{
        width: `min(${width}px, calc(100vw - ${EDGE_GUTTER}px))`,
        height: `min(${height}px, calc(100vh - ${TASKBAR_HEIGHT + BOTTOM_GUTTER}px))`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: focused ? 40 : 20,
      }}
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
