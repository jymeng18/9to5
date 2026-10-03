import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "9to5 — Corporate Edition" },
      { name: "description", content: "Clock in, complete critical deliverables, avoid management, and climb the corporate ladder." },
      { property: "og:title", content: "9to5 — Corporate Edition" },
      { property: "og:description", content: "A Windows XP workplace satire about visible productivity and career survival." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Game />;
}
