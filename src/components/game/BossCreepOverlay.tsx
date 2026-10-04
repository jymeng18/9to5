import { useEffect, useRef, useState } from "react";
import {
  BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC,
  BOSS_WEBCAM_STICKER_SRC,
} from "@/game/bossEvent";

type BossCreepOverlayProps = {
  active: boolean;
  duration?: number;
  onCaught: () => void;
};

export function BossCreepOverlay({
  active,
  duration = 8000,
  onCaught,
}: BossCreepOverlayProps) {
  const [progress, setProgress] = useState(0);
  const caught = useRef(false);
  const onCaughtRef = useRef(onCaught);
  onCaughtRef.current = onCaught;

  useEffect(() => {
    if (!active) {
      setProgress(0);
      caught.current = false;
      return;
    }

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const nextProgress = Math.min((now - start) / duration, 1);
      setProgress(nextProgress);
      if (nextProgress >= 1) {
        if (!caught.current) {
          caught.current = true;
          onCaughtRef.current();
        }
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration]);

  if (!active) return null;

  const eased = Math.pow(progress, 1.6);
  const bossY = 105 - 68 * eased;
  const beat = 1.3 - 0.8 * progress;

  return (
    <div className="boss-creep" aria-hidden="true">
      <div
        className="boss-creep__dim"
        style={{ background: `rgba(0, 0, 0, ${0.2 + 0.65 * progress})` }}
      />
      <div
        className="boss-creep__vignette"
        style={{
          background: `radial-gradient(ellipse at 50% 55%, transparent ${55 - 25 * progress}%, rgba(20, 0, 0, ${0.35 + 0.5 * progress}) 100%)`,
          animationDuration: `${beat}s`,
        }}
      />
      <div
        className="boss-creep__figure"
        style={{
          transform: `translateY(${bossY}%)`,
          filter: `blur(${(1 - progress) * 3}px)`,
        }}
      >
        <img
          src={BOSS_WEBCAM_STICKER_SRC || BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC}
          alt=""
        />
      </div>
      <div className="boss-creep__hint">
        {progress < 0.5 ? "Something feels off…" : "Are those… footsteps?"}
      </div>
    </div>
  );
}
