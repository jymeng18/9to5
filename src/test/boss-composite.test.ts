import { describe, expect, it } from "vitest";

import {
  chooseVisibleStickerSide,
  getBossPeekGeometry,
} from "@/components/game/useHeadTurn";
import { BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC } from "@/game/bossEvent";

describe("boss webcam sticker", () => {
  it("places the sticker opposite the mirrored face position", () => {
    expect(chooseVisibleStickerSide(0.25)).toBe("left");
    expect(chooseVisibleStickerSide(0.75)).toBe("right");
  });

  it("keeps most of the sticker outside the edge and tilts inward", () => {
    const left = getBossPeekGeometry("left", 640, 480);
    const right = getBossPeekGeometry("right", 640, 480);

    expect(left.x).toBeLessThan(0);
    expect(left.x + left.width).toBeLessThan(left.width / 2);
    expect(left.angle).toBeGreaterThan(0);
    expect(right.x + right.width).toBeGreaterThan(640);
    expect(640 - right.x).toBeLessThan(right.width / 2);
    expect(right.angle).toBeLessThan(0);
  });

  it("uses the configured sticker aspect ratio", () => {
    const square = getBossPeekGeometry("left", 640, 480, 1);

    expect(square.width).toBe(square.height);
  });

  it("provides a visible sticker placeholder", () => {
    expect(BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC).toContain("data:image/svg+xml");
    expect(decodeURIComponent(BOSS_WEBCAM_STICKER_PLACEHOLDER_SRC)).toContain(
      "YOUR STICKER",
    );
  });
});
