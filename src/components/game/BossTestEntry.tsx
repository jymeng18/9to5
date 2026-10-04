import { useEffect, useState } from "react";

import { useGameStore } from "@/game/store";
import { Game } from "./Game";

type BossTestEntryProps = {
  bossIndex: 0 | 1 | 2;
};

export function BossTestEntry({ bossIndex }: BossTestEntryProps) {
  const startAtBoss = useGameStore((state) => state.startAtBoss);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startAtBoss(bossIndex);
    setReady(true);
    return () => useGameStore.getState().restart();
  }, [bossIndex, startAtBoss]);

  return ready ? <Game /> : null;
}
