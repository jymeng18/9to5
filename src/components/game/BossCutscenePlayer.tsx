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

  useEffect(() => {
    setNeedsPlay(false);
    if (!src || !videoRef.current) return;
    void videoRef.current.play().catch(() => setNeedsPlay(true));
  }, [src]);

  if (!src) {
    return (
      <div className="boss-cutscene-stage">
        <section className="xp-dialog boss-cutscene-missing" role="alert">
          <header>Cutscene player</header>
          <div>
            <span className="dialog-icon" aria-hidden="true">
              🎬
            </span>
            <p>
              MP4 source not configured.
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
      <div className="boss-cutscene-frame">
        <video
          ref={videoRef}
          src={src}
          playsInline
          onEnded={onClose}
          onError={onClose}
        />
      </div>
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
