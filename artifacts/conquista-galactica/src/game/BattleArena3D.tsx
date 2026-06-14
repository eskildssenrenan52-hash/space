// ============================================================================
// BATTLE ARENA 3D — Cinematic 3D replay of `currentReplay` battles.
// Shows two fleets (player vs enemy), animated laser fire, explosions and
// a contested planet in the background. Reads the existing frame log and
// progresses through it with playable speed control.
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { X, Play, Pause, Star as StarIcon, Trophy, Swords } from 'lucide-react';
import { useEmpireStore } from './empireStore';
import { LAYER_INFO, type BattleLayer } from './data/warData';
import { NebulaClouds, DustMotes, SupernovaFlashes } from './GalaxyFX';

// ---------------------------------------------------------------------------
// Reusable ship mesh (small fighter triangle with engine glow)
// ---------------------------------------------------------------------------
interface FighterProps {
  base: THREE.Vector3;
  faction: 'player' | 'enemy';
  alive: boolean;
  bobSeed: number;
}
const Fighter: React.FC<FighterProps> = ({ base, faction, alive, bobSeed }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.6 + bobSeed;
    ref.current.position.set(base.x + Math.sin(t) * 0.4, base.y + Math.cos(t * 0.7) * 0.3, base.z + Math.cos(t * 0.5) * 0.4);
    ref.current.rotation.y = faction === 'player' ? Math.PI / 2 + Math.sin(t) * 0.1 : -Math.PI / 2 - Math.sin(t) * 0.1;
    ref.current.visible = alive;
  });
  const c = faction === 'player' ? '#22d3ee' : '#f43f5e';
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.35, 1.1, 6]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.05, faction === 'player' ? -0.6 : 0.6]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={faction === 'player' ? '#67e8f9' : '#fda4af'} transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Laser beam — a stretched glowing cylinder that fades out
// ---------------------------------------------------------------------------
interface Laser { id: number; from: THREE.Vector3; to: THREE.Vector3; color: string; life: number; }
const LaserBeam: React.FC<{ laser: Laser; onDone: () => void }> = ({ laser, onDone }) => {
  const ref = useRef<THREE.Mesh>(null);
  const t0 = useRef<number | null>(null);
  const dir = useMemo(() => new THREE.Vector3().subVectors(laser.to, laser.from), [laser]);
  const len = dir.length();
  const mid = useMemo(() => new THREE.Vector3().addVectors(laser.from, laser.to).multiplyScalar(0.5), [laser]);
  const quat = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const d = dir.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(up, d);
    return q;
  }, [dir]);

  useFrame(({ clock }) => {
    if (t0.current === null) t0.current = clock.elapsedTime;
    const t = (clock.elapsedTime - t0.current) / laser.life;
    if (!ref.current) return;
    if (t >= 1) { onDone(); return; }
    const k = 1 - t;
    ref.current.scale.set(0.05 + k * 0.06, 1, 0.05 + k * 0.06);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = k;
  });

  return (
    <mesh ref={ref} position={mid.toArray()} quaternion={quat}>
      <cylinderGeometry args={[1, 1, len, 8, 1]} />
      <meshBasicMaterial color={laser.color} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// Explosion sprite — expanding bright sphere that fades
// ---------------------------------------------------------------------------
interface Explosion { id: number; pos: THREE.Vector3; color: string; life: number; size: number; }
const ExplosionFx: React.FC<{ ex: Explosion; onDone: () => void }> = ({ ex, onDone }) => {
  const ref = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const t0 = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (t0.current === null) t0.current = clock.elapsedTime;
    const t = (clock.elapsedTime - t0.current) / ex.life;
    if (t >= 1) { onDone(); return; }
    const k = 1 - t;
    if (ref.current) {
      ref.current.scale.setScalar(ex.size * (0.2 + t * 1.3));
      (ref.current.material as THREE.MeshBasicMaterial).opacity = k * 0.9;
    }
    if (ring.current) {
      ring.current.scale.setScalar(ex.size * (0.4 + t * 2.0));
      (ring.current.material as THREE.MeshBasicMaterial).opacity = k * 0.6;
    }
  });
  return (
    <group position={ex.pos.toArray()}>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={ex.color} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 36]} />
        <meshBasicMaterial color={ex.color} transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Contested planet — sits in the backdrop, colored by current battle layer
// ---------------------------------------------------------------------------
const LAYER_TINT: Record<BattleLayer, string> = {
  space:      '#4f7cff',
  atmosphere: '#82b6ff',
  landing:    '#ff9560',
  urban:      '#ff5060',
};
const ContestedPlanet: React.FC<{ layer: BattleLayer }> = ({ layer }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.06; });
  const tint = LAYER_TINT[layer];
  return (
    <group position={[0, -2, -30]}>
      <mesh ref={ref}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial color={tint} roughness={0.9} emissive={tint} emissiveIntensity={0.15} />
      </mesh>
      <mesh scale={[10.3, 10.3, 10.3]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color={tint} transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Arena scene — orchestrates ships, lasers, explosions based on current frame
// ---------------------------------------------------------------------------
interface FrameLite { layer: BattleLayer; text: string; }

const ArenaScene: React.FC<{ frame: FrameLite | null; frameKey: number; outcome: string }> = ({ frame, frameKey, outcome }) => {
  const PLAYER_SHIPS = 7;
  const ENEMY_SHIPS  = 7;
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [enemyAlive, setEnemyAlive] = useState<boolean[]>(() => Array(ENEMY_SHIPS).fill(true));
  const [playerAlive, setPlayerAlive] = useState<boolean[]>(() => Array(PLAYER_SHIPS).fill(true));
  const nextId = useRef(0);

  const playerPos = useMemo(() =>
    Array.from({ length: PLAYER_SHIPS }, (_, i) => new THREE.Vector3(-14 + (i % 4) * 1.6, Math.floor(i / 4) * 1.6 + 1, (i % 2 ? 1 : -1) * 1.5)),
  []);
  const enemyPos = useMemo(() =>
    Array.from({ length: ENEMY_SHIPS }, (_, i) => new THREE.Vector3(14 - (i % 4) * 1.6, Math.floor(i / 4) * 1.6 + 1, (i % 2 ? 1 : -1) * 1.5)),
  []);

  // Spawn lasers & explosions whenever a new frame is shown
  useEffect(() => {
    if (!frame) return;
    const isPlayerOffense = /atacante|invas|lança|destró|destrói|abate|elimina|conquist|toma|destrói|destruiu|loot|saque|vitória/i.test(frame.text)
                            || frame.layer !== 'space' || (frameKey % 2 === 0);
    const aggressorBase  = isPlayerOffense ? playerPos : enemyPos;
    const defenderBase   = isPlayerOffense ? enemyPos  : playerPos;
    const aggressorAlive = isPlayerOffense ? playerAlive : enemyAlive;
    const defenderAlive  = isPlayerOffense ? enemyAlive  : playerAlive;
    const newLasers: Laser[] = [];
    const newExplosions: Explosion[] = [];
    const aggressorColor = isPlayerOffense ? '#22d3ee' : '#f43f5e';

    // 3-6 simultaneous beams
    const shots = 3 + Math.floor(Math.random() * 4);
    for (let s = 0; s < shots; s++) {
      const aIdx = pickAlive(aggressorAlive);
      const dIdx = pickAlive(defenderAlive);
      if (aIdx < 0 || dIdx < 0) continue;
      newLasers.push({
        id: nextId.current++,
        from: aggressorBase[aIdx].clone(),
        to:   defenderBase[dIdx].clone(),
        color: aggressorColor,
        life: 0.6,
      });
      // 50% chance the beam destroys a defender
      if (Math.random() < 0.5) {
        defenderAlive[dIdx] = false;
        newExplosions.push({
          id: nextId.current++,
          pos: defenderBase[dIdx].clone(),
          color: isPlayerOffense ? '#fda4af' : '#67e8f9',
          life: 1.1,
          size: 1.0 + Math.random() * 0.6,
        });
      }
    }
    setLasers(l => [...l, ...newLasers]);
    setExplosions(e => [...e, ...newExplosions]);
    if (isPlayerOffense) setEnemyAlive([...defenderAlive]);
    else setPlayerAlive([...defenderAlive]);

    // Respawn after a beat so battle persists
    const respawn = setTimeout(() => {
      setEnemyAlive(p => p.map(v => v || Math.random() < 0.35));
      setPlayerAlive(p => p.map(v => v || Math.random() < 0.6));
    }, 900);
    return () => clearTimeout(respawn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey]);

  const layer: BattleLayer = frame?.layer ?? 'space';

  return (
    <>
      <color attach="background" args={['#02030a']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[20, 30, 20]} intensity={1.2} color="#fff5da" />
      <pointLight position={[0, 4, 10]} intensity={0.8} color={LAYER_TINT[layer]} distance={60} />

      <Stars radius={250} depth={80} count={4000} factor={4} fade speed={1} />
      <NebulaClouds count={6} radius={140} scale={90} seed={777} />
      <SupernovaFlashes count={2} radius={120} />
      <DustMotes count={250} spread={120} />
      <ContestedPlanet layer={layer} />

      {playerPos.map((p, i) => (
        <Fighter key={`p${i}`} base={p} faction="player" alive={playerAlive[i]} bobSeed={i * 1.2} />
      ))}
      {enemyPos.map((p, i) => (
        <Fighter key={`e${i}`} base={p} faction="enemy" alive={enemyAlive[i]} bobSeed={i * 0.9 + 3} />
      ))}

      {lasers.map(l => (
        <LaserBeam key={l.id} laser={l} onDone={() => setLasers(arr => arr.filter(x => x.id !== l.id))} />
      ))}
      {explosions.map(ex => (
        <ExplosionFx key={ex.id} ex={ex} onDone={() => setExplosions(arr => arr.filter(x => x.id !== ex.id))} />
      ))}

      <OrbitControls enablePan={false} enableZoom maxDistance={60} minDistance={12} autoRotate autoRotateSpeed={0.4} enableDamping dampingFactor={0.08} />
      {/* Outcome banner — billboarded plane (kept off; HTML overlay handles text) */}
      <Banner3D outcome={outcome} />
    </>
  );
};

function pickAlive(arr: boolean[]): number {
  const alive = arr.map((v, i) => (v ? i : -1)).filter(i => i >= 0);
  if (alive.length === 0) return -1;
  return alive[Math.floor(Math.random() * alive.length)];
}

const Banner3D: React.FC<{ outcome: string }> = ({ outcome }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => { if (ref.current) ref.current.lookAt(camera.position); });
  const color = outcome === 'victory' ? '#22c55e' : outcome === 'partial' ? '#f59e0b' : '#ef4444';
  return (
    <mesh ref={ref} position={[0, 12, -10]}>
      <planeGeometry args={[0.001, 0.001]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// Public component — fixed overlay replacing the old 2D replay modal
// ---------------------------------------------------------------------------
export const BattleArena3D: React.FC = () => {
  const replay = useEmpireStore(s => s.currentReplay);
  const clearReplay = useEmpireStore(s => s.clearReplay);
  const [idx, setIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);

  useEffect(() => { setIdx(0); setPlaying(true); }, [replay?.id]);
  useEffect(() => {
    if (!replay || !playing) return;
    if (idx >= replay.frames.length - 1) return;
    const id = setTimeout(() => setIdx(i => Math.min(replay.frames.length - 1, i + 1)), 1500 / speed);
    return () => clearTimeout(id);
  }, [replay, idx, speed, playing]);

  if (!replay) return null;
  const frame = replay.frames[idx] ?? null;
  const outcomeColor = replay.outcome === 'victory' ? 'from-emerald-500 to-cyan-500'
                     : replay.outcome === 'partial' ? 'from-amber-500 to-orange-500'
                     : 'from-rose-500 to-red-600';

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex flex-col">
      {/* Top bar */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-cyan-500/30 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
        <Swords className="text-cyan-300" size={20} />
        <div className="text-white font-bold">Arena 3D — {replay.targetName}</div>
        <div className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase text-white bg-gradient-to-r ${outcomeColor}`}>
          {replay.outcome}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} size={16} className={i <= replay.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-emerald-300">
          <Trophy size={14} /> Saque: <b>{replay.lootGained}c</b>
        </div>
        <button onClick={clearReplay} className="ml-3 p-2 rounded-lg text-gray-300 transition-all hover:brightness-125"
                style={{ background: 'rgba(255,255,255,0.06)' }}><X size={18} /></button>
      </div>

      <div className="flex-1 flex">
        {/* 3D arena */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [0, 6, 28], fov: 55, near: 0.1, far: 2000 }}>
            <React.Suspense fallback={null}>
              <ArenaScene frame={frame} frameKey={idx} outcome={replay.outcome} />
            </React.Suspense>
          </Canvas>
          {/* HUD overlay */}
          {frame && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/70 border border-cyan-500/40 backdrop-blur text-white font-mono text-sm shadow-[0_0_24px_rgba(34,211,238,.25)] animate-in fade-in">
              <span className="mr-2 text-base">{LAYER_INFO[frame.layer].icon}</span>
              <span className="text-cyan-300 mr-2 uppercase tracking-widest text-[10px]">{LAYER_INFO[frame.layer].name}</span>
              <span>{frame.text}</span>
            </div>
          )}
          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.7) 100%)' }} />
        </div>

        {/* Side log */}
        <div className="w-80 flex flex-col" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', background: 'rgba(2,4,14,0.92)' }}>
          <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-cyan-300/80" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Diário de combate</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-[11px]">
            {replay.frames.slice(0, idx + 1).map((f, i) => (
              <div
                key={i}
                className={`flex gap-2 ${i === idx ? 'text-cyan-200 bg-cyan-500/10 rounded px-1.5 py-0.5 animate-in fade-in' : 'text-gray-500'}`}
              >
                <span>{LAYER_INFO[f.layer].icon}</span>
                <span className="flex-1">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="h-14 px-4 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(2,4,14,0.98)' }}>
        <button
          onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pausar' : 'Reproduzir'}
        </button>
        <button onClick={() => setIdx(0)} className="px-3 py-1.5 rounded-lg text-gray-200 text-xs transition-all hover:brightness-125"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>Reiniciar</button>
        <input
          type="range" min={0} max={replay.frames.length - 1} value={idx}
          onChange={e => setIdx(+e.target.value)}
          className="flex-1 accent-cyan-500"
        />
        <span className="text-[11px] text-gray-400 font-mono w-14 text-right">{idx + 1}/{replay.frames.length}</span>
        <div className="flex gap-1 ml-2">
          {[0.5, 1, 2, 4].map(sp => (
            <button key={sp} onClick={() => setSpeed(sp)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${speed === sp ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    style={speed !== sp ? { background: 'rgba(255,255,255,0.07)' } : {}}>
              {sp}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleArena3D;