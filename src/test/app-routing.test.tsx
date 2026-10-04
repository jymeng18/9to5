import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { nextCameraRun } from "@/game/bossWebcamLab";
import { useGameStore } from "@/game/store";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches the game page instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it.each(["/boss-webcam-lab", "/gary", "/denise", "/richard"])(
    "registers direct test route %s",
    (path) => {
      const router = createRouter({
        routeTree,
        context: { queryClient: new QueryClient() },
      });

      const matches = router.matchRoutes(path);

      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    },
  );

  it("starts each direct boss entry with clean playing state", () => {
    for (const bossIndex of [0, 1, 2] as const) {
      useGameStore.setState({
        phase: "gameOver",
        bossIndex: 2,
        completed: ["stale-task"],
        bossEventStage: "cutscene",
        bossCutsceneOutcome: "tooLate",
        managementNotices: 3,
      });

      useGameStore.getState().startAtBoss(bossIndex);

      expect(useGameStore.getState()).toMatchObject({
        phase: "playing",
        bossIndex,
        completed: [],
        bossEventStage: "idle",
        bossCutsceneOutcome: null,
        managementNotices: 0,
      });
    }
  });

  it("advances the camera run after a lab outcome so preview can restart", () => {
    expect(nextCameraRun(null)).toBe(1);
    expect(nextCameraRun(3)).toBe(4);
  });

  it("does not register the removed boss-event page", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/boss-event");

    expect(matches.at(-1)?.routeId).toBe(rootRouteId);
  });
});
