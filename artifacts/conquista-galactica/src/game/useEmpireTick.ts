import { useEffect, useRef } from 'react';
import { useEmpireStore } from './empireStore';
import { useGameStore } from './gameStore';
import { useColonyStore } from './colonyStore';
import { useColonizationStore } from './colonizationStore';

/**
 * Drives the global simulation clock. The base game shipped with advanceTime
 * defined but never called, so the universe was frozen. This hook ticks the
 * core game store, the empire systems (industry, market, missions, builds) and
 * the colony/city/mining economy.
 */
export function useEmpireTick() {
  const lastRef = useRef<number>(performance.now());

  useEffect(() => {
    // ensure empire data is initialized once
    useEmpireStore.getState().initEmpire();
    useColonyStore.getState().sync();

    let raf = 0;
    let syncAcc = 0;
    const loop = () => {
      const now = performance.now();
      const delta = Math.min(2, (now - lastRef.current) / 1000) * 30; // scaled game delta
      lastRef.current = now;
      useGameStore.getState().advanceTime(delta);
      useEmpireStore.getState().tick(delta);
      useColonyStore.getState().tick(delta);
      useColonizationStore.getState().tick(delta);
      // keep colony store in sync with newly founded colonies (~1s)
      syncAcc += delta;
      if (syncAcc > 30) { syncAcc = 0; useColonyStore.getState().sync(); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}
