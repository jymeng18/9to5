import { useEffect, useRef, useState } from "react";
import type { BossCutsceneOutcome } from "@/game/store";

type BossCutscenePlayerProps = {
  outcome: BossCutsceneOutcome;
  src: string;
  variableName: string;
  onClose: () => void;
};

export function BossCutscenePlayer({
  outcome,
  src,
  variableName,
  onClose,
}: BossCutscenePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setNeedsPlay(false);
    setFailed(false);
    if (!src || !videoRef.current) return;
    void videoRef.current.play().catch(() => setNeedsPlay(true));
  }, [src]);

  if (!src || failed) {
    return (
      <div className="boss-cutscene-stage">
        <section className="xp-dialog boss-cutscene-missing" role="alert">
          <header>Cutscene player</header>
          <div>
            <span className="dialog-icon" aria-hidden="true">
              🎬
            </span>
            <p>
              {failed
                ? "The configured MP4 could not be played."
                : "MP4 source not configured."}
              <small>
                Set <code>{variableName}</code> in{" "}
                <code>src/game/bossEvent.ts</code>.
              </small>
            </p>
          </div>
          <footer>
            <button type="button" onClick={onClose}>
              OK
            </button>
          </footer>
        </section>
      </div>
    );
  }

  return (
    <section className="boss-cutscene-stage" aria-label={`${outcome} cutscene`}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        controls
        onEnded={onClose}
        onError={() => setFailed(true)}
      />
      {needsPlay && (
        <button
          type="button"
          className="boss-cutscene-play"
          onClick={() => {
            void videoRef.current?.play();
            setNeedsPlay(false);
          }}
        >
          Play cutscene
        </button>
      )}
      <button type="button" className="boss-cutscene-skip" onClick={onClose}>
        Skip ▶▶
      </button>
    </section>
  );
}
