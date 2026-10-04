import { createElement } from "react";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BossCreepOverlay } from "@/components/game/BossCreepOverlay";
import { BossCutscenePlayer } from "@/components/game/BossCutscenePlayer";
import { BossWebcamPrompt } from "@/components/game/BossWebcamPrompt";
import {
  BOSS_TURN_COUNTDOWN_MS,
  BOSS_WEBCAM_STICKER_SRC,
} from "@/game/bossEvent";
import { getBoss } from "@/game/bosses";
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

  it("starts immediately when the fourth final-boss task is accepted", () => {
    const missions = getBoss(2).missions;
    useGameStore.setState({ phase: "playing", bossIndex: 2 });

    missions
      .slice(0, 3)
      .forEach(({ id }) => useGameStore.getState().completeTask(id));
    expect(useGameStore.getState().bossEventStage).toBe("idle");

    useGameStore.getState().completeTask(missions[3]!.id);

    expect(useGameStore.getState().completed).toHaveLength(missions.length - 1);
    expect(useGameStore.getState().bossEventStage).toBe("creeping");
    expect(useGameStore.getState().phase).toBe("playing");

    useGameStore.getState().dismissBossEvent();
    useGameStore.getState().completeTask(missions[3]!.id);
    expect(useGameStore.getState().bossEventStage).toBe("idle");
  });

  it("does not start for earlier bosses or another final-boss task count", () => {
    for (const bossIndex of [0, 1] as const) {
      useGameStore.getState().restart();
      useGameStore.setState({ phase: "playing", bossIndex });
      getBoss(bossIndex)
        .missions.slice(0, 4)
        .forEach(({ id }) => useGameStore.getState().completeTask(id));
      expect(useGameStore.getState().bossEventStage).toBe("idle");
    }

    const missions = getBoss(2).missions;
    useGameStore.getState().restart();
    useGameStore.setState({
      phase: "playing",
      bossIndex: 2,
      completed: missions.slice(0, 4).map(({ id }) => id),
      xp: 80,
    });
    useGameStore.getState().completeTask(missions[4]!.id);
    expect(useGameStore.getState().bossEventStage).toBe("idle");
  });

  it("ignores invalid and duplicate completions without triggering", () => {
    const missions = getBoss(2).missions;
    useGameStore.setState({ phase: "playing", bossIndex: 2 });
    missions
      .slice(0, 3)
      .forEach(({ id }) => useGameStore.getState().completeTask(id));

    useGameStore.getState().completeTask("not-a-mission");
    useGameStore.getState().completeTask(missions[0]!.id);

    expect(useGameStore.getState().completed).toHaveLength(3);
    expect(useGameStore.getState().bossEventStage).toBe("idle");
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

  it("uses the completion path immediately when a configured cutscene fails", () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined);
    const onClose = vi.fn();
    const { container, unmount } = render(
      createElement(BossCutscenePlayer, {
        outcome: "inTime",
        src: "/configured.mp4",
        variableName: "BOSS_TURN_IN_TIME_CUTSCENE_SRC",
        onClose,
      }),
    );

    fireEvent.error(container.querySelector("video")!);

    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    play.mockRestore();
  });

  it("returns to play with the final task after the in-time cutscene", () => {
    const missions = getBoss(2).missions;
    useGameStore.setState({
      phase: "playing",
      bossIndex: 2,
      completed: missions.slice(0, 4).map(({ id }) => id),
      bossEventStage: "webcam",
    });

    useGameStore.getState().completeBossTurn();
    useGameStore.getState().finishBossEvent();

    expect(useGameStore.getState().phase).toBe("playing");
    expect(useGameStore.getState().completed).toHaveLength(4);
    expect(useGameStore.getState().bossEventStage).toBe("idle");
    expect(useGameStore.getState().bossCutsceneOutcome).toBeNull();
  });

  it("routes the too-late cutscene completion to the blue screen", () => {
    useGameStore.setState({ phase: "playing", bossIndex: 2 });
    useGameStore.getState().startBossEvent();
    useGameStore.getState().showBossPrompt();
    useGameStore.getState().openBossWebcam();
    useGameStore.getState().failBossTurn();

    expect(useGameStore.getState().bossEventStage).toBe("cutscene");
    expect(useGameStore.getState().bossCutsceneOutcome).toBe("tooLate");

    useGameStore.getState().finishBossEvent();
    expect(useGameStore.getState().phase).toBe("gameOver");
    expect(useGameStore.getState().bossEventStage).toBe("idle");
    expect(useGameStore.getState().bossCutsceneOutcome).toBeNull();
  });
});
