import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { BossCutscenePlayer } from "@/components/game/BossCutscenePlayer";
import { WebcamTurnWindow } from "@/components/game/WebcamTurnWindow";
import type { BossSide } from "@/components/game/useHeadTurn";
import {
  BOSS_PEEK_LEFT_TILT_DEGREES,
  BOSS_PEEK_RIGHT_TILT_DEGREES,
  BOSS_TURN_IN_TIME_CUTSCENE_SRC,
  BOSS_TURN_TOO_LATE_CUTSCENE_SRC,
  BOSS_WEBCAM_STICKER_SRC,
} from "@/game/bossEvent";
import type { BossCutsceneOutcome } from "@/game/store";

export const Route = createFileRoute("/boss-webcam-lab")({
  head: () => ({
    meta: [{ title: "BossCam tuning lab — 9to5" }],
  }),
  component: BossWebcamLab,
});

function BossWebcamLab() {
  const navigate = useNavigate();
  const [side, setSide] = useState<BossSide>("right");
  const [run, setRun] = useState(0);
  const [result, setResult] = useState("Camera starting…");
  const [cutscenePreview, setCutscenePreview] =
    useState<BossCutsceneOutcome | null>(null);

  const selectSide = (nextSide: BossSide) => {
    setSide(nextSide);
    setResult(`${nextSide === "right" ? "Right" : "Left"} preview starting…`);
    setRun((current) => current + 1);
  };

  return (
    <main className="boss-webcam-lab">
      <aside className="xp-window boss-webcam-lab__panel">
        <header className="xp-titlebar">
          <div className="xp-title">
            <span aria-hidden="true">🛠️</span>
            BossCam tuning lab
          </div>
        </header>
        <div className="boss-webcam-lab__panel-body">
          <p>
            Force the visible side you want to tune. This uses the normal
            mirrored webcam feed; MediaPipe is used only for turn detection.
          </p>
          <div className="boss-webcam-lab__side-controls">
            <button
              type="button"
              aria-pressed={side === "left"}
              onClick={() => selectSide("left")}
            >
              Show left
            </button>
            <button
              type="button"
              aria-pressed={side === "right"}
              onClick={() => selectSide("right")}
            >
              Show right
            </button>
            <button
              type="button"
              onClick={() => {
                setResult("Preview restarting…");
                setRun((current) => current + 1);
              }}
            >
              Restart camera
            </button>
            <button type="button" onClick={() => setCutscenePreview("inTime")}>
              Preview Happy ending
            </button>
            <button type="button" onClick={() => setCutscenePreview("tooLate")}>
              Preview Sad ending
            </button>
          </div>
          <p className="boss-webcam-lab__result" role="status">
            {result}
          </p>
          <dl>
            <div>
              <dt>Left tilt</dt>
              <dd>{BOSS_PEEK_LEFT_TILT_DEGREES}°</dd>
            </div>
            <div>
              <dt>Right tilt</dt>
              <dd>{BOSS_PEEK_RIGHT_TILT_DEGREES}°</dd>
            </div>
            <div>
              <dt>Sticker</dt>
              <dd>{BOSS_WEBCAM_STICKER_SRC || "placeholder"}</dd>
            </div>
          </dl>
          <p>
            Edit <code>src/game/bossEvent.ts</code>. Set
            <code>BOSS_WEBCAM_STICKER_SRC</code> to your transparent PNG/WebP
            path. Use <code>BOSS_PEEK_RIGHT_TILT_DEGREES</code> only if the
            right-side tilt needs adjustment. Save, then use
            <strong> Restart camera</strong> if hot reload does not restart it.
          </p>
        </div>
      </aside>

      <div className="boss-webcam-lab__preview" key={`${side}-${run}`}>
        <WebcamTurnWindow
          countdownMs={60_000}
          forcedBossSide={side}
          onTurnDetected={() => setResult("In-time turn detected.")}
          onTimedOut={() => setResult("The 60-second lab timer expired.")}
          onClose={() => void navigate({ to: "/" })}
        />
      </div>

      {cutscenePreview && (
        <BossCutscenePlayer
          outcome={cutscenePreview}
          src={
            cutscenePreview === "inTime"
              ? BOSS_TURN_IN_TIME_CUTSCENE_SRC
              : BOSS_TURN_TOO_LATE_CUTSCENE_SRC
          }
          variableName={
            cutscenePreview === "inTime"
              ? "BOSS_TURN_IN_TIME_CUTSCENE_SRC"
              : "BOSS_TURN_TOO_LATE_CUTSCENE_SRC"
          }
          onClose={() => setCutscenePreview(null)}
        />
      )}
    </main>
  );
}
