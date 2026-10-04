import { createElement } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { BossCreepOverlay } from "@/components/game/BossCreepOverlay";
import { BossWebcamPrompt } from "@/components/game/BossWebcamPrompt";
import {
  BOSS_TURN_COUNTDOWN_MS,
  BOSS_WEBCAM_STICKER_SRC,
} from "@/game/bossEvent";
import { useGameStore } from "@/game/store";

describe("boss webcam event", () => {
  beforeEach(() => {
    useGameStore.getState().restart();
  });

  it("uses the friend sticker during the ten-second creep event", () => {
    const { container, unmount } = render(
      createElement(BossCreepOverlay, {
        active: true,
        onCaught: () => undefined,
      }),
    );

    expect(BOSS_TURN_COUNTDOWN_MS).toBe(10_000);
    expect(
      container.querySelector(".boss-creep__figure img")?.getAttribute("src"),
    ).toBe(BOSS_WEBCAM_STICKER_SRC);
    unmount();
  });

  it("keeps a faint friend presence behind the webcam prompt", () => {
    const { container, unmount } = render(
      createElement(BossWebcamPrompt, {
        muted: true,
        onOpen: () => undefined,
      }),
    );

    expect(
      container.querySelector(".boss-prompt-presence img")?.getAttribute("src"),
    ).toBe(BOSS_WEBCAM_STICKER_SRC);
    const actions = container.querySelectorAll(
      ".boss-webcam-prompt footer button",
    );
    expect(actions).toHaveLength(1);
    expect(actions[0]?.textContent).toBe("Open webcam");
    unmount();
  });

  it("selects the in-time cutscene after a detected turn", () => {
    expect(useGameStore.getState().bossEventStage).toBe("idle");

    useGameStore.getState().startBossEvent();
    expect(useGameStore.getState().bossEventStage).toBe("creeping");

    useGameStore.getState().showBossPrompt();
    expect(useGameStore.getState().bossEventStage).toBe("prompt");

    useGameStore.getState().openBossWebcam();
    expect(useGameStore.getState().bossEventStage).toBe("webcam");

    useGameStore.getState().completeBossTurn();
    expect(useGameStore.getState().bossEventStage).toBe("cutscene");
    expect(useGameStore.getState().bossCutsceneOutcome).toBe("inTime");
  });

  it("selects the too-late cutscene when the timer expires", () => {
    useGameStore.getState().startBossEvent();
    useGameStore.getState().showBossPrompt();
    useGameStore.getState().openBossWebcam();
    useGameStore.getState().failBossTurn();

    expect(useGameStore.getState().bossEventStage).toBe("cutscene");
    expect(useGameStore.getState().bossCutsceneOutcome).toBe("tooLate");

    useGameStore.getState().dismissBossEvent();
    expect(useGameStore.getState().bossEventStage).toBe("idle");
    expect(useGameStore.getState().bossCutsceneOutcome).toBeNull();
  });
});
