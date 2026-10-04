import { useEffect, useState } from "react";
import {
  BOSS_WEBCAM_PROMPT,
  BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC,
  BOSS_WEBCAM_STICKER_SRC,
} from "@/game/bossEvent";
import { playBossEventTextBlip } from "@/game/bossEventAudio";

type BossWebcamPromptProps = {
  muted: boolean;
  onOpen: () => void;
};

export function BossWebcamPrompt({ muted, onOpen }: BossWebcamPromptProps) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (length >= BOSS_WEBCAM_PROMPT.length) return;
    const timer = window.setTimeout(() => {
      const character = BOSS_WEBCAM_PROMPT[length];
      if (character && character.trim() && length % 2 === 0) {
        playBossEventTextBlip(muted, length);
      }
      setLength((current) => current + 1);
    }, 42);
    return () => window.clearTimeout(timer);
  }, [length, muted]);

  const complete = length >= BOSS_WEBCAM_PROMPT.length;

  return (
    <div className="boss-prompt-scrim">
      <div className="boss-prompt-presence" aria-hidden="true">
        <img
          src={BOSS_WEBCAM_STICKER_SRC || BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC}
          alt=""
        />
      </div>
      <section
        className="boss-webcam-prompt xp-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header>New Hire</header>
        <div>
          <span className="dialog-icon" aria-hidden="true">
            💭
          </span>
          <p aria-live="polite">
            {BOSS_WEBCAM_PROMPT.slice(0, length)}
            {!complete && <span className="typewriter-caret">▌</span>}
          </p>
        </div>
        <footer>
          <button type="button" onClick={onOpen} disabled={!complete}>
            Open webcam
          </button>
        </footer>
      </section>
    </div>
  );
}
