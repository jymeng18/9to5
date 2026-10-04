import { createFileRoute } from "@tanstack/react-router";

import { BossTestEntry } from "@/components/game/BossTestEntry";

export const Route = createFileRoute("/gary")({
  head: () => ({ meta: [{ title: "Gary test — 9to5" }] }),
  component: GaryTest,
});

function GaryTest() {
  return <BossTestEntry bossIndex={0} />;
}
