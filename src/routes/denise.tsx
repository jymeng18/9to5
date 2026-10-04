import { createFileRoute } from "@tanstack/react-router";

import { BossTestEntry } from "@/components/game/BossTestEntry";

export const Route = createFileRoute("/denise")({
  head: () => ({ meta: [{ title: "Denise test — 9to5" }] }),
  component: DeniseTest,
});

function DeniseTest() {
  return <BossTestEntry bossIndex={1} />;
}
