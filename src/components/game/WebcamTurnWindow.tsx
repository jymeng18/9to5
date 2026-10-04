import { useRef } from "react";
import { BOSS_TURN_COUNTDOWN_MS } from "@/game/bossEvent";
import { useHeadTurn, type BossSide } from "./useHeadTurn";

type WebcamTurnWindowProps = {
  onTurnDetected: () => void;
  onTimedOut: () => void;
  onClose: () => void;
  countdownMs?: number;
  forcedBossSide?: BossSide;
};

export function WebcamTurnWindow({
  onTurnDetected,
  onTimedOut,
  onClose,
  countdownMs = BOSS_TURN_COUNTDOWN_MS,
  forcedBossSide,
}: WebcamTurnWindowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { phase, remainingMs, error, retry } = useHeadTurn({
    videoRef,
    canvasRef,
    enabled: true,
    countdownMs,
    onTurn: onTurnDetected,
    onTimeout: onTimedOut,
    forcedBossSide,
  });
  const progress = Math.max(0, Math.min(1, remainingMs / countdownMs));
  const instruction = error
    ? "Allow camera access, then retry to begin."
    : phase === "armed"
      ? `Turn now — look behind you before ${countdownMs / 1000} seconds runs out!`
      : "Face the screen and hold still. The timer starts when you are ready.";

  return (
    <section
      className="xp-window boss-webcam"
      aria-labelledby="boss-webcam-title"
    >
      <header className="xp-titlebar">
        <div className="xp-title" id="boss-webcam-title">
          <span aria-hidden="true">📹</span>
          BossCam — Conference Room B
        </div>
        <div className="xp-window-actions">
          <button
            type="button"
            className="xp-close"
            aria-label="Close BossCam"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      <div className="boss-webcam__body">
        <section
          className="boss-webcam__objective"
          data-active={phase === "armed"}
          aria-label="Webcam objective"
        >
          <span>OBJECTIVE</span>
          <strong>TURN YOUR HEAD — LOOK BEHIND YOU!</strong>
          <small>{instruction}</small>
        </section>
        <div className="boss-webcam__preview">
          <video ref={videoRef} muted playsInline aria-hidden="true" />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            aria-label="Mirrored webcam preview with the friend sticker"
          />
          <div className="boss-webcam__timer" role="timer">
            <strong>{(remainingMs / 1000).toFixed(1)}s</strong>
            <span>{phase === "armed" ? "TURN AROUND" : "WAITING"}</span>
          </div>
        </div>
        <div className="boss-webcam__countdown" aria-hidden="true">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        {error && (
          <section className="boss-webcam__error" role="alert">
            <strong>Camera unavailable.</strong>
            <span>{error}</span>
          </section>
        )}
        <footer className="boss-webcam__actions">
          {error && (
            <>
              <button type="button" onClick={retry}>
                Retry camera
              </button>
              <button type="button" onClick={onTurnDetected}>
                Test in-time outcome
              </button>
              <button type="button" onClick={onTimedOut}>
                Test timeout outcome
              </button>
            </>
          )}
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </section>
  );
}
