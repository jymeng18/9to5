import { createFileRoute } from "@tanstack/react-router";

import { BossTestEntry } from "@/components/game/BossTestEntry";

export const Route = createFileRoute("/richard")({
  head: () => ({ meta: [{ title: "Richard test — 9to5" }] }),
  component: RichardTest,
});

function RichardTest() {
  return <BossTestEntry bossIndex={2} />;
}
