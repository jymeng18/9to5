import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { nextCameraRun } from "@/game/bossWebcamLab";
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

  it("registers the focused boss webcam tuning lab", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/boss-webcam-lab");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
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
