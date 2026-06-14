// ============================================================================
// CITY SCENE — realistic procedural 3D city with a real construction mode.
// Players pick a district from a categorized tree, hover the city grid to see
// a ghost preview, and click to place. Placed buildings grow in with an
// animation and are visible immediately on the 3D plane.
// ============================================================================
import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  useColonyStore, popCapOf, DISTRICTS, DIM_INFO,
  CITY_CELL, CITY_GRID_HALF,
  type City, type District, type Dimension, type PlacedBuilding,
} from './colonyStore';
import { useGameStore } from './gameStore';
import { useEmpireStore } from './empireStore';
import { MAT_BY_ID } from './data/industryData';
import { X, Building2, Hammer, Coins, Sparkles, Trash2, Lock, Bot, Zap, Bell } from 'lucide-react';

// simple seeded RNG so each city is stable
function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BSpec {
  x: number; z: number; w: number; d: number; h: number;
  kind: 'tower' | 'block' | 'park' | 'industry' | 'dome';
  color: string;
}

const Building: React.FC<{ b: BSpec }> = ({ b }) => {
  if (b.kind === 'park') {
    return (
      <group position={[b.x, 0, b.z]}>
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[b.w, 0.1, b.d]} />
          <meshStandardMaterial color="#1f7a3d" roughness={1} />
        </mesh>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} castShadow position={[(i % 2 - 0.5) * b.w * 0.5, 0.5, (Math.floor(i / 2) - 0.5) * b.d * 0.5]}>
            <coneGeometry args={[0.35, 1, 6]} />
            <meshStandardMaterial color="#2e9e52" roughness={1} />
          </mesh>
        ))}
      </group>
    );
  }
  if (b.kind === 'dome') {
    return (
      <mesh castShadow position={[b.x, 0, b.z]}>
        <sphereGeometry args={[b.w * 0.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={b.color} metalness={0.6} roughness={0.2} emissive={b.color} emissiveIntensity={0.15} />
      </mesh>
    );
  }
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh castShadow receiveShadow position={[0, b.h / 2, 0]}>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshStandardMaterial
          color={b.color}
          metalness={b.kind === 'industry' ? 0.3 : 0.55}
          roughness={b.kind === 'industry' ? 0.8 : 0.25}
          emissive={'#7dd3fc'}
          emissiveIntensity={0.06}
        />
      </mesh>
      {/* lit windows strip */}
      {b.kind !== 'industry' && (
        <mesh position={[0, b.h / 2, b.d / 2 + 0.01]}>
          <planeGeometry args={[b.w * 0.85, b.h * 0.9]} />
          <meshStandardMaterial color="#0b1d2e" emissive="#fde68a" emissiveIntensity={0.5} roughness={0.4} transparent opacity={0.55} />
        </mesh>
      )}
      {b.kind === 'industry' && (
        <mesh castShadow position={[b.w * 0.3, b.h + 0.6, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 1.2, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      )}
    </group>
  );
};

function genCity(city: City): BSpec[] {
  // Ambient procedural fill — small low-rise blocks far from the playable grid.
  // The interactive placed buildings live in their own layer above.
  const rnd = mulberry(city.id.split('_').reduce((a, c) => a + c.charCodeAt(0), 7) + city.level * 13);
  const span = Math.min(34, 18 + city.level * 1.1);
  const count = Math.min(220, 30 + city.level * 8 + Math.floor(city.population / 5000));
  const hasIndustry = city.buildings.some(b => b.id === 'factory_district' || b.id.includes('factory'));
  const hasPark = city.buildings.some(b => b.dim === 'ecology');
  const palette = ['#94a3b8', '#cbd5e1', '#a3b8cc', '#8fa3b8', '#b8c4d4'];
  const out: BSpec[] = [];
  const grid = 2.0;
  // exclusion radius around interactive grid (CITY_GRID_HALF * CITY_CELL)
  const exclude = (CITY_GRID_HALF + 1) * CITY_CELL;
  for (let i = 0; i < count; i++) {
    const gx = Math.round((rnd() - 0.5) * 2 * span / grid) * grid;
    const gz = Math.round((rnd() - 0.5) * 2 * span / grid) * grid;
    if (Math.abs(gx) < exclude && Math.abs(gz) < exclude) continue; // keep play area clear
    if (out.some(b => Math.abs(b.x - gx) < grid * 0.9 && Math.abs(b.z - gz) < grid * 0.9)) continue;
    const distCenter = Math.sqrt(gx * gx + gz * gz) / span;
    const r = rnd();
    let kind: BSpec['kind'] = 'block';
    if (r > 0.92 && hasPark) kind = 'park';
    else if (r > 0.86 && hasIndustry && distCenter > 0.5) kind = 'industry';
    else if (distCenter < 0.35 && r > 0.4) kind = 'tower';
    else if (r > 0.95) kind = 'dome';
    const baseH = kind === 'tower' ? 3 + rnd() * (4 + city.level * 0.4) : kind === 'industry' ? 1.6 + rnd() * 1.6 : 1.0 + rnd() * 2.4;
    out.push({
      x: gx, z: gz, w: 1.1 + rnd() * 0.6, d: 1.1 + rnd() * 0.6,
      h: baseH * (1 - distCenter * 0.3), kind,
      color: kind === 'industry' ? '#64748b' : palette[Math.floor(rnd() * palette.length)],
    });
  }
  return out;
}

const Rotator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.03; });
  return <group ref={ref}>{children}</group>;
};

// ---------------------------------------------------------------------------
// Visual recipe for each district kind — color, footprint, animation style.
// ---------------------------------------------------------------------------
const DIM_COLOR: Record<Dimension, string> = {
  economy: '#fbbf24', energy: '#38bdf8', security: '#f87171',
  ecology: '#4ade80', health: '#f472b6',
};

interface DistrictVisual {
  kind: 'tower' | 'block' | 'dome' | 'park' | 'industry' | 'reactor';
  color: string;
  emissive: string;
  heightUnits: number; // multiples of cell
  glow?: boolean;
}

function visualFor(d: District): DistrictVisual {
  const c = DIM_COLOR[d.dim];
  switch (d.id) {
    case 'housing':         return { kind: 'block',    color: '#cbd5e1', emissive: '#fde68a', heightUnits: 1.4 };
    case 'arcology':        return { kind: 'tower',    color: '#dbeafe', emissive: '#7dd3fc', heightUnits: 4.2, glow: true };
    case 'market':          return { kind: 'block',    color: '#fde68a', emissive: '#fbbf24', heightUnits: 1.8 };
    case 'bank':            return { kind: 'tower',    color: '#facc15', emissive: '#fbbf24', heightUnits: 3.4, glow: true };
    case 'reactor':         return { kind: 'reactor',  color: '#0ea5e9', emissive: '#22d3ee', heightUnits: 2.4, glow: true };
    case 'fusion':          return { kind: 'reactor',  color: '#38bdf8', emissive: '#a5f3fc', heightUnits: 3.0, glow: true };
    case 'garrison':        return { kind: 'block',    color: '#9ca3af', emissive: '#ef4444', heightUnits: 1.2 };
    case 'shield':          return { kind: 'dome',     color: '#3b82f6', emissive: '#60a5fa', heightUnits: 2.6, glow: true };
    case 'park':            return { kind: 'park',     color: '#22c55e', emissive: '#22c55e', heightUnits: 0.4 };
    case 'recycler':        return { kind: 'industry', color: '#16a34a', emissive: '#4ade80', heightUnits: 1.8 };
    case 'hospital':        return { kind: 'block',    color: '#fce7f3', emissive: '#f472b6', heightUnits: 2.2 };
    case 'factory_district':return { kind: 'industry', color: '#64748b', emissive: '#fb923c', heightUnits: 1.6 };
    default:                return { kind: 'block',    color: '#94a3b8', emissive: c,         heightUnits: 1.4 };
  }
}

// A placed building — animates in from below with a holo-tint ring.
const PlacedDistrict: React.FC<{ pb: PlacedBuilding; onRemove: () => void; constructionMode: boolean }> = ({ pb, onRemove, constructionMode }) => {
  const district = useMemo(() => DISTRICTS.find(d => d.id === pb.districtId), [pb.districtId]);
  const v = useMemo(() => district ? visualFor(district) : null, [district]);
  const ref = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    if (!ref.current || !v) return;
    const age = (Date.now() - pb.placedAt) / 1000;
    // grow-in 0.0..1.0 over 0.9s with easing
    const grow = Math.min(1, age / 0.9);
    const ease = 1 - Math.pow(1 - grow, 3);
    ref.current.scale.set(ease, Math.max(0.001, ease), ease);
    // glow ring fades out after 1.5s
    if (ringRef.current) {
      const ringAlpha = Math.max(0, 1 - age / 1.5);
      (ringRef.current.material as THREE.Material & { opacity: number }).opacity = ringAlpha * 0.7;
      ringRef.current.scale.setScalar(0.8 + age * 0.6);
    }
    if (hover) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.04;
    } else {
      ref.current.position.y = 0;
    }
  });

  if (!district || !v) return null;
  const wx = pb.x * CITY_CELL;
  const wz = pb.z * CITY_CELL;
  const h = v.heightUnits * CITY_CELL * 0.6;
  const w = CITY_CELL * 0.82;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (constructionMode) onRemove();
  };

  return (
    <group position={[wx, 0, wz]}>
      {/* growing ring effect right after placement */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[w * 0.5, w * 0.85, 32]} />
        <meshBasicMaterial color={v.emissive} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      <group ref={ref}
             onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
             onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
             onClick={handleClick}>
        {v.kind === 'park' && (
          <>
            <mesh position={[0, 0.05, 0]} receiveShadow>
              <boxGeometry args={[w, 0.1, w]} />
              <meshStandardMaterial color="#1f7a3d" roughness={1} />
            </mesh>
            {Array.from({ length: 5 }).map((_, i) => {
              const a = (i / 5) * Math.PI * 2;
              return (
                <mesh key={i} castShadow position={[Math.cos(a) * w * 0.3, 0.6, Math.sin(a) * w * 0.3]}>
                  <coneGeometry args={[0.32, 1.1, 7]} />
                  <meshStandardMaterial color="#2e9e52" roughness={1} />
                </mesh>
              );
            })}
          </>
        )}

        {v.kind === 'dome' && (
          <>
            <mesh position={[0, 0.05, 0]} receiveShadow>
              <boxGeometry args={[w, 0.1, w]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh castShadow>
              <sphereGeometry args={[w * 0.55, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshPhysicalMaterial color={v.color} metalness={0.4} roughness={0.05}
                transmission={0.45} thickness={0.4}
                emissive={v.emissive} emissiveIntensity={0.4} />
            </mesh>
          </>
        )}

        {v.kind === 'reactor' && (
          <>
            <mesh position={[0, h * 0.5, 0]} castShadow>
              <cylinderGeometry args={[w * 0.45, w * 0.5, h, 28]} />
              <meshStandardMaterial color={v.color} metalness={0.7} roughness={0.25}
                emissive={v.emissive} emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[0, h + 0.15, 0]}>
              <torusGeometry args={[w * 0.5, 0.06, 10, 32]} />
              <meshBasicMaterial color={v.emissive} />
            </mesh>
            <pointLight position={[0, h * 0.6, 0]} color={v.emissive} intensity={0.9} distance={6} />
          </>
        )}

        {v.kind === 'industry' && (
          <>
            <mesh position={[0, h * 0.5, 0]} castShadow>
              <boxGeometry args={[w, h, w]} />
              <meshStandardMaterial color={v.color} metalness={0.3} roughness={0.8} />
            </mesh>
            <mesh position={[w * 0.25, h + 0.7, w * 0.2]} castShadow>
              <cylinderGeometry args={[0.18, 0.22, 1.4, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[w * 0.25, h + 1.55, w * 0.2]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshBasicMaterial color={v.emissive} transparent opacity={0.7} />
            </mesh>
          </>
        )}

        {(v.kind === 'block' || v.kind === 'tower') && (
          <>
            <mesh position={[0, h * 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h, w]} />
              <meshStandardMaterial color={v.color}
                metalness={0.55} roughness={0.2}
                emissive={v.emissive} emissiveIntensity={v.glow ? 0.25 : 0.08} />
            </mesh>
            {/* Window strips on all four sides */}
            {([
              { p: [0, h * 0.5,  w / 2 + 0.01], r: [0, 0, 0] },
              { p: [0, h * 0.5, -w / 2 - 0.01], r: [0, Math.PI, 0] },
              { p: [ w / 2 + 0.01, h * 0.5, 0], r: [0, Math.PI / 2, 0] },
              { p: [-w / 2 - 0.01, h * 0.5, 0], r: [0, -Math.PI / 2, 0] },
            ] as const).map((face, i) => (
              <mesh key={i} position={face.p as unknown as [number, number, number]} rotation={face.r as unknown as [number, number, number]}>
                <planeGeometry args={[w * 0.78, h * 0.85]} />
                <meshStandardMaterial color="#0b1d2e"
                  emissive={v.emissive} emissiveIntensity={0.5}
                  roughness={0.4} transparent opacity={0.55} />
              </mesh>
            ))}
            {v.kind === 'tower' && (
              <mesh position={[0, h + 0.4, 0]}>
                <coneGeometry args={[w * 0.25, 0.8, 8]} />
                <meshStandardMaterial color={v.emissive} emissive={v.emissive} emissiveIntensity={0.6} />
              </mesh>
            )}
          </>
        )}

        {/* Selection/hover halo */}
        {(hover || constructionMode) && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[w * 0.55, w * 0.7, 24]} />
            <meshBasicMaterial
              color={constructionMode && hover ? '#ef4444' : v.emissive}
              transparent opacity={constructionMode && hover ? 0.85 : 0.5}
              side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
};

// Ghost preview that follows mouse on the grid plane
const GhostBuilding: React.FC<{ districtId: string | null; valid: boolean; cell: { x: number; z: number } | null }> = ({ districtId, valid, cell }) => {
  const district = useMemo(() => districtId ? DISTRICTS.find(d => d.id === districtId) : null, [districtId]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const p = 0.6 + Math.sin(s.clock.elapsedTime * 4) * 0.2;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = p;
    }
  });
  if (!district || !cell) return null;
  const v = visualFor(district);
  const w = CITY_CELL * 0.82;
  const h = v.heightUnits * CITY_CELL * 0.6;
  const color = valid ? v.emissive : '#ef4444';
  return (
    <group position={[cell.x * CITY_CELL, 0, cell.z * CITY_CELL]}>
      <mesh ref={ref} position={[0, h * 0.5, 0]}>
        <boxGeometry args={[w, h, w]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} wireframe={false} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[w * 0.55, w * 0.75, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Interactive grid: ground catches pointer to snap to cell, click triggers placement
const ConstructionGrid: React.FC<{
  cityId: string;
  armedDistrictId: string | null;
  occupied: Set<string>;
  onPlaced: () => void;
}> = ({ cityId, armedDistrictId, occupied, onPlaced }) => {
  const [cell, setCell] = useState<{ x: number; z: number } | null>(null);
  const placeBuilding = useColonyStore(s => s.placeBuilding);
  const span = CITY_GRID_HALF * CITY_CELL * 2;

  const updateCell = (e: ThreeEvent<PointerEvent>) => {
    if (!armedDistrictId) return;
    const p = e.point;
    const cx = Math.round(p.x / CITY_CELL);
    const cz = Math.round(p.z / CITY_CELL);
    if (Math.abs(cx) > CITY_GRID_HALF || Math.abs(cz) > CITY_GRID_HALF) {
      setCell(null);
    } else {
      setCell({ x: cx, z: cz });
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!armedDistrictId || !cell) return;
    if (occupied.has(`${cell.x},${cell.z}`)) return;
    const ok = placeBuilding(cityId, armedDistrictId, cell.x, cell.z);
    if (ok) onPlaced();
  };

  const cellKey = cell ? `${cell.x},${cell.z}` : '';
  const valid = !!cell && !occupied.has(cellKey);

  return (
    <>
      {/* Invisible interaction plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        onPointerMove={updateCell}
        onPointerLeave={() => setCell(null)}
        onClick={handleClick}
        visible={!!armedDistrictId}
      >
        <planeGeometry args={[span, span]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>

      {/* Visible grid lines when in construction mode */}
      {armedDistrictId && (
        <group position={[0, 0.01, 0]}>
          {Array.from({ length: CITY_GRID_HALF * 2 + 2 }).map((_, i) => {
            const o = (i - CITY_GRID_HALF - 0.5) * CITY_CELL;
            return (
              <React.Fragment key={i}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[o, 0, 0]}>
                  <planeGeometry args={[0.04, span]} />
                  <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, o]}>
                  <planeGeometry args={[span, 0.04]} />
                  <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
                </mesh>
              </React.Fragment>
            );
          })}
          {/* Outer border */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[span * 0.5 - 0.05, span * 0.5, 4]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      <GhostBuilding districtId={armedDistrictId} valid={valid} cell={cell} />
    </>
  );
};

const Scene: React.FC<{
  city: City;
  armedDistrictId: string | null;
  onPlaced: () => void;
}> = ({ city, armedDistrictId, onPlaced }) => {
  const buildings = useMemo(() => genCity(city), [city.id, city.level, Math.floor(city.population / 4000)]);
  const removePlaced = useColonyStore(s => s.removePlacedBuilding);
  const occupied = useMemo(
    () => new Set((city.placedBuildings || []).map(p => `${p.x},${p.z}`)),
    [city.placedBuildings]
  );

  return (
    <>
      <color attach="background" args={['#06091a']} />
      <fog attach="fog" args={['#06091a', 45, 110]} />
      <hemisphereLight args={['#bcd7ff', '#1a2238', 0.55]} />
      <directionalLight position={[20, 30, 10]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} color="#fff2d6" />
      <pointLight position={[0, 14, 0]} intensity={0.6} color="#7dd3fc" distance={60} />

      {/* Static ground + ambient skyline (no longer rotates while building) */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <circleGeometry args={[44, 64]} />
          <meshStandardMaterial color="#11203a" roughness={0.9} metalness={0.15} />
        </mesh>
        {/* glowing roads grid (background) */}
        {Array.from({ length: 17 }).map((_, i) => {
          const p = (i - 8) * 5.0;
          return (
            <React.Fragment key={i}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p, 0.015, 0]}>
                <planeGeometry args={[0.14, 80]} />
                <meshStandardMaterial color="#1e3a5f" emissive="#38bdf8" emissiveIntensity={0.3} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, p]}>
                <planeGeometry args={[80, 0.14]} />
                <meshStandardMaterial color="#1e3a5f" emissive="#38bdf8" emissiveIntensity={0.3} />
              </mesh>
            </React.Fragment>
          );
        })}
        {buildings.map((b, i) => <Building key={i} b={b} />)}

        {/* Construction grid + ghost preview */}
        <ConstructionGrid
          cityId={city.id}
          armedDistrictId={armedDistrictId}
          occupied={occupied}
          onPlaced={onPlaced}
        />

        {/* Player-placed districts */}
        {(city.placedBuildings || []).map(pb => (
          <PlacedDistrict
            key={pb.instanceId}
            pb={pb}
            onRemove={() => removePlaced(city.id, pb.instanceId)}
            constructionMode={!!armedDistrictId}
          />
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={14} maxDistance={70}
        autoRotate={!armedDistrictId}
        autoRotateSpeed={0.25}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// Construction overlay UI — category tree on the left
// ---------------------------------------------------------------------------
const CATEGORY_ORDER: Dimension[] = ['health', 'energy', 'economy', 'security', 'ecology'];
const CATEGORY_LABEL: Record<Dimension, string> = {
  health: 'Habitação & Saúde',
  energy: 'Energia',
  economy: 'Economia & Indústria',
  security: 'Segurança',
  ecology: 'Ecologia',
};

const DistrictTile: React.FC<{
  district: District;
  armed: boolean;
  onArm: () => void;
}> = ({ district, armed, onArm }) => {
  const inventory = useEmpireStore(s => s.inventory);
  const credits = useGameStore(s => s.credits);
  const v = visualFor(district);
  const canMats = district.materials.every(m => (inventory[m.mat] || 0) >= m.qty);
  const canCred = credits >= district.credits;
  const can = canMats && canCred;

  return (
    <button
      onClick={onArm}
      disabled={!can}
      className={`group w-full text-left p-2.5 rounded-lg border transition-all relative overflow-hidden
        ${armed
          ? 'border-cyan-300 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
          : can
            ? 'border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-500/10'
            : 'opacity-50 cursor-not-allowed'}`}
      style={armed ? {} : { background: can ? 'rgba(4,8,20,0.75)' : 'rgba(4,8,20,0.5)', borderColor: can ? undefined : 'rgba(255,255,255,0.05)' }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: v.emissive, boxShadow: `0 0 12px ${v.emissive}` }}
      />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{district.icon}</span>
        <span className="text-sm font-bold text-white flex-1">{district.name}</span>
        {!can && <Lock size={12} className="text-gray-500" />}
      </div>
      <div className="text-[10px] text-gray-400 leading-snug mb-1.5">{district.desc}</div>
      <div className="flex items-center gap-2 text-[10px]">
        <span className={`flex items-center gap-0.5 ${canCred ? 'text-amber-300' : 'text-red-400'}`}>
          <Coins size={10} /> {district.credits.toLocaleString()}
        </span>
        <span className="text-cyan-300">+{district.support}{DIM_INFO[district.dim].icon}</span>
        {district.popCap > 0 && <span className="text-pink-300">+{district.popCap.toLocaleString()}👥</span>}
        {district.ecoPenalty && <span className="text-orange-400">-{district.ecoPenalty}🌱</span>}
      </div>
      {district.materials.length > 0 && (
        <div className="text-[9px] text-gray-500 mt-1 truncate">
          {district.materials.map(m => {
            const have = inventory[m.mat] || 0;
            return (
              <span key={m.mat} className={have >= m.qty ? 'text-gray-400' : 'text-red-400'}>
                {m.qty}× {MAT_BY_ID[m.mat]?.namePt || m.mat}{' '}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
};

export const CityScene: React.FC = () => {
  const viewingCityId = useColonyStore(s => s.viewingCityId);
  const city = useColonyStore(s => (viewingCityId ? s.cities[viewingCityId] : null));
  const setViewingCity = useColonyStore(s => s.setViewingCity);
  const credits = useGameStore(s => s.credits);
  const autoOn = useColonyStore(s => city ? !!s.autoManage[city.id] : false);
  const toggleAutoManage = useColonyStore(s => s.toggleAutoManage);
  const quickFixCity = useColonyStore(s => s.quickFixCity);
  const notifications = useGameStore(s => s.notifications);
  const [activeCat, setActiveCat] = useState<Dimension>('health');
  const [armedDistrictId, setArmedDistrictId] = useState<string | null>(null);
  const constructionMode = !!armedDistrictId;

  if (!city) return null;

  const cap = popCapOf(city);
  const placedCount = (city.placedBuildings || []).length;
  const districtsForCat = DISTRICTS.filter(d => d.dim === activeCat);
  const recentEvents = notifications.slice(-6).reverse();

  return (
    <div className="fixed inset-0 z-[60]" style={{ background: '#030610' }}>
      <Canvas shadows camera={{ position: [28, 22, 28], fov: 50 }}>
        <React.Suspense fallback={null}>
          <Scene city={city} armedDistrictId={armedDistrictId} onPlaced={() => { /* keep armed for chaining */ }} />
        </React.Suspense>
      </Canvas>

      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-3 pointer-events-auto">
          <div className="backdrop-blur-md border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-[0_0_30px_rgba(34,211,238,0.15)]" style={{ background: 'rgba(2,4,14,0.88)' }}>
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg">
              <Building2 size={20} /> {city.name}
              {city.isCapital && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">CAPITAL</span>}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-bold">NÍVEL {city.level}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-300 mt-1">
              <span>👥 {Math.floor(city.population).toLocaleString()} / {cap.toLocaleString()}</span>
              <span className="text-amber-300">💰 {Math.floor(credits).toLocaleString()}c</span>
              <span className="text-cyan-300">🏗️ {placedCount} construções</span>
            </div>
            {/* compact dim bars */}
            <div className="grid grid-cols-5 gap-2 mt-2 min-w-[420px]">
              {(['economy','energy','security','ecology','health'] as Dimension[]).map(d => (
                <div key={d} title={DIM_INFO[d].name}>
                  <div className="flex items-center justify-between text-[9px] text-gray-400">
                    <span>{DIM_INFO[d].icon}</span><span>{Math.round(city[d])}</span>
                  </div>
                  <div className="h-1 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded" style={{ width: `${city[d]}%`, background: DIM_INFO[d].color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setViewingCity(null)}
            className="flex items-center gap-1.5 backdrop-blur-md hover:brightness-125 text-gray-200 rounded-lg px-3 py-2 text-sm transition-all"
            style={{ background: 'rgba(2,4,14,0.88)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <X size={16} /> Voltar
          </button>
        </div>
      </div>

      {/* Quick actions + events feed — right side */}
      <div className="absolute top-32 right-3 w-[280px] flex flex-col gap-2 pointer-events-auto">
        <div className="backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-[0_0_30px_rgba(34,211,238,0.15)] space-y-2" style={{ background: 'rgba(2,4,14,0.92)' }}>
          <div className="text-[10px] uppercase tracking-widest text-cyan-300/70">Comando rápido</div>
          <button
            onClick={() => quickFixCity(city.id)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-amber-600/25 hover:bg-amber-600/45 text-amber-100 text-xs font-bold border border-amber-500/40"
          >
            <Zap size={14} /> Reforçar pior dimensão
          </button>
          <button
            onClick={() => toggleAutoManage(city.id)}
            className={`w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-bold border transition-colors ${
              autoOn
                ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-100 border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                : 'text-gray-200'
            }`}
          style={autoOn ? {} : { background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <Bot size={14} /> Governo IA: {autoOn ? 'ATIVO' : 'desligado'}
          </button>
        </div>

        <div className="flex-1 backdrop-blur-md border border-cyan-500/30 rounded-xl p-2.5 min-h-0 max-h-[360px] flex flex-col" style={{ background: 'rgba(2,4,14,0.88)' }}>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-cyan-300/70 mb-1.5">
            <Bell size={11} /> Eventos ao vivo
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {recentEvents.length === 0 && (
              <div className="text-[11px] text-gray-500 italic">Sem eventos recentes.</div>
            )}
            {recentEvents.map(n => (
              <div key={n.id} className={`text-[10px] leading-snug px-2 py-1 rounded border ${
                n.type === 'danger' ? 'bg-red-900/30 border-red-500/30 text-red-100'
                : n.type === 'warning' ? 'bg-amber-900/30 border-amber-500/30 text-amber-100'
                : n.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-100'
                : 'text-gray-200'
              }`}>
                {n.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Construction panel — left side */}
      <div className="absolute top-32 left-3 bottom-3 w-[340px] flex flex-col gap-2 pointer-events-auto">
        <div className="bg-gray-950/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
          <div className="flex items-center gap-2 mb-2">
            <Hammer size={16} className="text-cyan-300" />
            <span className="text-sm font-bold text-cyan-200 tracking-wider uppercase">Construção</span>
            {armedDistrictId && (
              <button
                onClick={() => setArmedDistrictId(null)}
                className="ml-auto text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/40"
              >Cancelar</button>
            )}
          </div>
          {armedDistrictId ? (
            <div className="text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 mb-2 flex items-center gap-1.5">
              <Sparkles size={12} /> Clique em uma célula vazia da grade para construir.
            </div>
          ) : (
            <div className="text-[11px] text-gray-400 bg-gray-900/60 rounded-lg p-2 mb-2">
              Escolha uma categoria abaixo e selecione um distrito para começar a construir.
            </div>
          )}

          {/* Category tabs */}
          <div className="grid grid-cols-5 gap-1 mb-2">
            {CATEGORY_ORDER.map(d => {
              const isActive = activeCat === d;
              return (
                <button
                  key={d}
                  onClick={() => setActiveCat(d)}
                  title={CATEGORY_LABEL[d]}
                  className={`p-1.5 rounded-lg text-xs transition-all flex flex-col items-center gap-0.5
                    ${isActive
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      : 'bg-gray-900/70 border border-gray-800 text-gray-400 hover:border-gray-600'}`}
                  style={isActive ? { color: DIM_INFO[d].color } : undefined}
                >
                  <span className="text-base leading-none">{DIM_INFO[d].icon}</span>
                  <span className="text-[8px] uppercase tracking-wider truncate w-full text-center">{DIM_INFO[d].name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* District list (scrollable) */}
        <div className="flex-1 overflow-y-auto bg-gray-950/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-2 space-y-1.5 min-h-0">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 px-1 mb-1">
            {CATEGORY_LABEL[activeCat]} · {districtsForCat.length} opções
          </div>
          {districtsForCat.map(d => (
            <DistrictTile
              key={d.id}
              district={d}
              armed={armedDistrictId === d.id}
              onArm={() => setArmedDistrictId(armedDistrictId === d.id ? null : d.id)}
            />
          ))}
        </div>
      </div>

      {/* Help overlay bottom-right */}
      <div className="absolute bottom-3 right-3 bg-gray-950/85 backdrop-blur-md border border-cyan-500/30 rounded-lg px-3 py-2 text-[10px] text-gray-400 font-mono pointer-events-none">
        <div>🖱️ ARRASTAR: orbitar</div>
        <div>🔄 SCROLL: zoom</div>
        {constructionMode && <div className="text-cyan-300">🖱️ CLIQUE NA GRADE: construir</div>}
        {constructionMode && <div className="text-red-300">🖱️ CLIQUE NO PRÉDIO: demolir</div>}
      </div>
    </div>
  );
};

export default CityScene;
