// ============================================================================
// TROOP 3D PREVIEW — Distinct 3D model per visual kind with auto-rotation,
// glow ring, hover light. Used by Barracks cards and War plan.
// ============================================================================
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { UnitType, Visual3D } from './data/warData';

const accentMat = (color: string, glow = 0.6) =>
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} metalness={0.6} roughness={0.25} />;

const bodyMat = (color: string) =>
  <meshStandardMaterial color={color} metalness={0.75} roughness={0.35} emissive={color} emissiveIntensity={0.12} />;

const dark = <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />;

// ---------------------------------------------------------------------------
// Individual visuals — each carefully shaped to feel distinct
// ---------------------------------------------------------------------------
const Interceptor: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh rotation={[0, 0, 0]}><coneGeometry args={[0.35, 1.6, 8]} />{bodyMat(c)}</mesh>
    <mesh position={[0, -0.2, -0.2]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.08, 1.6, 0.45]} />{bodyMat(c)}</mesh>
    <mesh position={[0, -0.05, -0.75]}><sphereGeometry args={[0.22, 16, 16]} />{accentMat(c, 1.2)}</mesh>
  </group>
);

const Destroyer: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><boxGeometry args={[2.4, 0.55, 0.9]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.2, 0.35, 0.6]} />{bodyMat(c)}</mesh>
    {[-0.8, 0, 0.8].map((x, i) => (
      <mesh key={i} position={[x, 0.6, 0]}><cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />{accentMat(c)}</mesh>
    ))}
    <mesh position={[-1.4, 0, 0]}><sphereGeometry args={[0.22, 12, 12]} />{accentMat('#67e8f9', 1.4)}</mesh>
    <mesh position={[1.4, 0, 0]}><sphereGeometry args={[0.22, 12, 12]} />{accentMat('#67e8f9', 1.4)}</mesh>
  </group>
);

const Cruiser: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><cylinderGeometry args={[0.4, 0.55, 2.8, 12]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.3, 0.4, 1.2, 12]} />{bodyMat(c)}</mesh>
    <mesh position={[0, -1.5, 0]}><coneGeometry args={[0.55, 0.6, 12]} />{bodyMat(c)}</mesh>
    {[-0.5, 0.5].map((x, i) => (
      <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.05, 1.6, 0.3]} />{bodyMat(c)}</mesh>
    ))}
    <mesh position={[0, 1.5, 0]}><sphereGeometry args={[0.25, 16, 16]} />{accentMat(c, 1.5)}</mesh>
  </group>
);

const Dreadnought: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><boxGeometry args={[3.2, 0.8, 1.4]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.6, 0]}><boxGeometry args={[2.2, 0.45, 0.9]} />{bodyMat(c)}</mesh>
    <mesh position={[1.7, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.28, 0.8, 12]} />{accentMat(c, 1.5)}</mesh>
    <mesh position={[-1.7, 0.1, 0]}><boxGeometry args={[0.4, 0.4, 0.8]} />{bodyMat(c)}</mesh>
    {[[-1, 0.85, 0.45], [1, 0.85, 0.45], [-1, 0.85, -0.45], [1, 0.85, -0.45]].map((p, i) => (
      <mesh key={i} position={p as [number, number, number]}><sphereGeometry args={[0.12, 8, 8]} />{accentMat('#fde68a', 1.6)}</mesh>
    ))}
    <mesh position={[0, 0.9, 0]}><sphereGeometry args={[0.25, 16, 16]} />{accentMat(c, 2)}</mesh>
  </group>
);

const Fighter: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><boxGeometry args={[1.4, 0.18, 0.4]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}><boxGeometry args={[0.25, 0.15, 1.6]} />{bodyMat(c)}</mesh>
    <mesh position={[0.6, 0.05, 0]}><sphereGeometry args={[0.13, 12, 12]} />{accentMat('#67e8f9', 1.4)}</mesh>
    <mesh position={[-0.5, -0.1, 0]} rotation={[0, 0, 0]}><coneGeometry args={[0.18, 0.5, 8]} />{bodyMat(c)}</mesh>
  </group>
);

const Gunship: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><capsuleGeometry args={[0.35, 1.0, 8, 12]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />{dark}</mesh>
    <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.4, 1.4, 0.02, 24]} /><meshStandardMaterial color={c} transparent opacity={0.25} /></mesh>
    <mesh position={[0, -0.65, 0]}><boxGeometry args={[0.9, 0.08, 0.18]} />{dark}</mesh>
    <mesh position={[0.5, -0.5, 0.25]}><boxGeometry args={[0.2, 0.1, 0.4]} />{accentMat(c, 1.2)}</mesh>
    <mesh position={[-0.5, -0.5, 0.25]}><boxGeometry args={[0.2, 0.1, 0.4]} />{accentMat(c, 1.2)}</mesh>
  </group>
);

const Bomber: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><boxGeometry args={[2.6, 0.15, 0.6]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0, 0]}><boxGeometry args={[0.5, 0.25, 1.4]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.18, 0.1]}><sphereGeometry args={[0.18, 12, 12]} />{accentMat('#67e8f9', 1)}</mesh>
    {[-1.0, 1.0].map((x, i) => (
      <mesh key={i} position={[x, -0.1, 0]}><cylinderGeometry args={[0.12, 0.12, 0.5, 12]} />{dark}</mesh>
    ))}
  </group>
);

const StealthWing: React.FC<{ c: string }> = ({ c }) => (
  <group rotation={[0, 0, 0]}>
    <mesh rotation={[0, 0, 0]}>
      <coneGeometry args={[1.4, 0.2, 3]} />
      <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.15} emissive={c} emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[0, 0.08, -0.2]}><boxGeometry args={[0.4, 0.06, 0.7]} /><meshStandardMaterial color="#0f172a" /></mesh>
    <mesh position={[0, 0.04, 0.5]}><sphereGeometry args={[0.1, 12, 12]} />{accentMat(c, 2)}</mesh>
  </group>
);

const Dropship: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><boxGeometry args={[1.8, 0.9, 1.2]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.55, 0]}><boxGeometry args={[1.0, 0.2, 0.9]} />{bodyMat(c)}</mesh>
    {[[-0.95, 0.3, 0], [0.95, 0.3, 0]].map((p, i) => (
      <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.18, 0.6, 8]} />{accentMat(c, 1)}</mesh>
    ))}
    <mesh position={[0, -0.55, 0]}><boxGeometry args={[1.4, 0.08, 1.0]} />{dark}</mesh>
  </group>
);

const Lander: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh><cylinderGeometry args={[0.55, 0.75, 1.4, 12]} />{bodyMat(c)}</mesh>
    <mesh position={[0, -0.85, 0]}><coneGeometry args={[0.75, 0.5, 12]} />{accentMat(c, 1.5)}</mesh>
    <mesh position={[0, 0.85, 0]}><sphereGeometry args={[0.55, 16, 16]} />{bodyMat(c)}</mesh>
    {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((r, i) => (
      <mesh key={i} position={[Math.cos(r) * 0.65, -0.4, Math.sin(r) * 0.65]} rotation={[0, r, 0]}><boxGeometry args={[0.08, 0.6, 0.2]} />{dark}</mesh>
    ))}
  </group>
);

const OrbitalParatrooper: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 0.9, 0]}><sphereGeometry args={[0.7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={c} transparent opacity={0.4} /></mesh>
    {[-Math.PI / 4, Math.PI / 4].map((r, i) => (
      <mesh key={i} position={[Math.sin(r) * 0.4, 0.4, 0]}><cylinderGeometry args={[0.01, 0.01, 0.9, 4]} />{dark}</mesh>
    ))}
    <mesh position={[0, -0.05, 0]}><sphereGeometry args={[0.18, 12, 12]} />{bodyMat(c)}</mesh>
    <mesh position={[0, -0.4, 0]}><boxGeometry args={[0.35, 0.5, 0.25]} />{bodyMat(c)}</mesh>
    {[-0.2, 0.2].map((x, i) => (
      <mesh key={i} position={[x, -0.85, 0]}><boxGeometry args={[0.12, 0.4, 0.15]} />{dark}</mesh>
    ))}
  </group>
);

const Marine: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.22, 16, 16]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.55, 0.7, 0.32]} />{bodyMat(c)}</mesh>
    <mesh position={[0.45, 0.5, 0.15]} rotation={[Math.PI / 4, 0, 0]}><boxGeometry args={[0.08, 0.6, 0.08]} />{dark}</mesh>
    <mesh position={[-0.32, 0.45, 0]}><boxGeometry args={[0.14, 0.65, 0.14]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.12, -0.1, 0]}><boxGeometry args={[0.2, 0.55, 0.2]} />{bodyMat(c)}</mesh>
    <mesh position={[0.12, -0.1, 0]}><boxGeometry args={[0.2, 0.55, 0.2]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 1.05, 0.18]}><sphereGeometry args={[0.05, 8, 8]} />{accentMat('#f87171', 2)}</mesh>
  </group>
);

const Commando: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.22, 16, 16]} />{accentMat('#1e1b4b')}</mesh>
    <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.5, 0.7, 0.3]} />{bodyMat(c)}</mesh>
    <mesh position={[0.4, 0.5, 0.3]} rotation={[Math.PI / 3, 0, 0]}><boxGeometry args={[0.06, 0.8, 0.06]} />{dark}</mesh>
    <mesh position={[-0.3, 0.45, 0]}><boxGeometry args={[0.12, 0.6, 0.12]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.1, -0.1, 0]}><boxGeometry args={[0.18, 0.5, 0.18]} />{bodyMat(c)}</mesh>
    <mesh position={[0.1, -0.1, 0]}><boxGeometry args={[0.18, 0.5, 0.18]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.95, 0.18]}><sphereGeometry args={[0.06, 8, 8]} />{accentMat(c, 2.5)}</mesh>
  </group>
);

const Warbot: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 1.0, 0]}><boxGeometry args={[0.45, 0.35, 0.4]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 1.07, 0.21]}><boxGeometry args={[0.32, 0.12, 0.04]} />{accentMat(c, 2)}</mesh>
    <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.7, 0.7, 0.42]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.5, 0.5, 0]}><boxGeometry args={[0.2, 0.7, 0.2]} />{bodyMat(c)}</mesh>
    <mesh position={[0.5, 0.5, 0]}><boxGeometry args={[0.2, 0.7, 0.2]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.18, -0.15, 0]}><boxGeometry args={[0.25, 0.55, 0.25]} />{bodyMat(c)}</mesh>
    <mesh position={[0.18, -0.15, 0]}><boxGeometry args={[0.25, 0.55, 0.25]} />{bodyMat(c)}</mesh>
    <mesh position={[0.7, 0.55, 0.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />{accentMat(c, 1.5)}</mesh>
  </group>
);

const Tank: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 0.2, 0]}><boxGeometry args={[1.8, 0.45, 1.3]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.65, 0]}><boxGeometry args={[1.1, 0.35, 0.9]} />{bodyMat(c)}</mesh>
    <mesh position={[0.7, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.08, 0.08, 1.4, 12]} />{dark}</mesh>
    {[[-0.95, 0, 0.55], [-0.95, 0, -0.55], [0.95, 0, 0.55], [0.95, 0, -0.55]].map((p, i) => (
      <mesh key={i} position={p as [number, number, number]}><boxGeometry args={[0.25, 0.5, 0.4]} />{dark}</mesh>
    ))}
    <mesh position={[0, 1, 0]}><sphereGeometry args={[0.08, 8, 8]} />{accentMat(c, 2)}</mesh>
  </group>
);

const Mech: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 1.6, 0]}><boxGeometry args={[0.55, 0.4, 0.5]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 1.65, 0.27]}><boxGeometry args={[0.4, 0.12, 0.04]} />{accentMat(c, 2)}</mesh>
    <mesh position={[0, 0.95, 0]}><boxGeometry args={[1.0, 0.85, 0.6]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.75, 1.0, 0]}><boxGeometry args={[0.35, 0.7, 0.35]} />{bodyMat(c)}</mesh>
    <mesh position={[0.75, 1.0, 0]}><boxGeometry args={[0.35, 0.7, 0.35]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.95, 0.55, 0.25]}><cylinderGeometry args={[0.13, 0.13, 0.7, 12]} />{accentMat(c, 1.4)}</mesh>
    <mesh position={[0.95, 0.55, 0.25]}><cylinderGeometry args={[0.13, 0.13, 0.7, 12]} />{accentMat(c, 1.4)}</mesh>
    <mesh position={[-0.28, 0.15, 0]}><boxGeometry args={[0.35, 0.75, 0.35]} />{bodyMat(c)}</mesh>
    <mesh position={[0.28, 0.15, 0]}><boxGeometry args={[0.35, 0.75, 0.35]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.28, -0.4, 0]}><boxGeometry args={[0.4, 0.2, 0.5]} />{dark}</mesh>
    <mesh position={[0.28, -0.4, 0]}><boxGeometry args={[0.4, 0.2, 0.5]} />{dark}</mesh>
  </group>
);

const Artillery: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 0.25, 0]}><boxGeometry args={[1.4, 0.4, 1.0]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.8, 0.3, 0.7]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2.3, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 2.4, 12]} />{dark}</mesh>
    <mesh position={[0, 1.55, 1.0]}><cylinderGeometry args={[0.14, 0.14, 0.3, 12]} />{accentMat(c, 1.5)}</mesh>
    {[[-0.65, 0, 0.55], [-0.65, 0, -0.55], [0.65, 0, 0.55], [0.65, 0, -0.55]].map((p, i) => (
      <mesh key={i} position={p as [number, number, number]}><boxGeometry args={[0.25, 0.5, 0.3]} />{dark}</mesh>
    ))}
  </group>
);

const Titan: React.FC<{ c: string }> = ({ c }) => (
  <group>
    <mesh position={[0, 2.4, 0]}><boxGeometry args={[0.75, 0.55, 0.65]} />{bodyMat(c)}</mesh>
    <mesh position={[0, 2.5, 0.36]}><boxGeometry args={[0.55, 0.18, 0.04]} />{accentMat(c, 2.5)}</mesh>
    <mesh position={[0, 1.55, 0]}><boxGeometry args={[1.5, 1.2, 0.85]} />{bodyMat(c)}</mesh>
    <mesh position={[-1.05, 1.7, 0]}><boxGeometry args={[0.55, 1.0, 0.5]} />{bodyMat(c)}</mesh>
    <mesh position={[1.05, 1.7, 0]}><boxGeometry args={[0.55, 1.0, 0.5]} />{bodyMat(c)}</mesh>
    <mesh position={[-1.35, 1.05, 0.3]}><cylinderGeometry args={[0.18, 0.18, 1.0, 12]} />{accentMat(c, 1.8)}</mesh>
    <mesh position={[1.35, 1.05, 0.3]}><cylinderGeometry args={[0.18, 0.18, 1.0, 12]} />{accentMat(c, 1.8)}</mesh>
    <mesh position={[0, 1.95, 0.5]}><cylinderGeometry args={[0.1, 0.1, 0.6, 12]} />{accentMat('#fde68a', 2.5)}</mesh>
    <mesh position={[-0.4, 0.4, 0]}><boxGeometry args={[0.5, 1.0, 0.5]} />{bodyMat(c)}</mesh>
    <mesh position={[0.4, 0.4, 0]}><boxGeometry args={[0.5, 1.0, 0.5]} />{bodyMat(c)}</mesh>
    <mesh position={[-0.4, -0.35, 0]}><boxGeometry args={[0.6, 0.3, 0.7]} />{dark}</mesh>
    <mesh position={[0.4, -0.35, 0]}><boxGeometry args={[0.6, 0.3, 0.7]} />{dark}</mesh>
  </group>
);

// ---------------------------------------------------------------------------
// Visual dispatcher
// ---------------------------------------------------------------------------
const VISUAL_REGISTRY: Record<Visual3D, React.FC<{ c: string }>> = {
  interceptor: Interceptor,
  destroyer: Destroyer,
  cruiser: Cruiser,
  dreadnought: Dreadnought,
  fighter: Fighter,
  bomber: Bomber,
  gunship: Gunship,
  stealth_wing: StealthWing,
  dropship: Dropship,
  lander: Lander,
  orbital_paratrooper: OrbitalParatrooper,
  marine: Marine,
  commando: Commando,
  warbot: Warbot,
  tank: Tank,
  mech: Mech,
  titan: Titan,
  artillery: Artillery,
};

const SpinningModel: React.FC<{ visual: Visual3D; color: string; speed?: number }> = ({ visual, color, speed = 0.55 }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * speed; });
  const Mesh = VISUAL_REGISTRY[visual] ?? Marine;
  return <group ref={ref}><Mesh c={color} /></group>;
};

// Soft hover ring beneath the unit, tinted to unit color
const HoloPlatform: React.FC<{ color: string }> = ({ color }) => (
  <group position={[0, -0.95, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.1, 1.4, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <circleGeometry args={[1.05, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  </group>
);

export interface Troop3DPreviewProps {
  unit: Pick<UnitType, 'visual' | 'color' | 'rarity'>;
  compact?: boolean;
  interactive?: boolean;
}

const RARITY_BG: Record<string, string> = {
  common:    'radial-gradient(circle at center, #1e293b 0%, #020617 70%)',
  rare:      'radial-gradient(circle at center, #0c4a6e 0%, #020617 70%)',
  epic:      'radial-gradient(circle at center, #4a044e 0%, #1a032e 70%)',
  legendary: 'radial-gradient(circle at center, #7c2d12 0%, #1c0a02 70%)',
};

export const Troop3DPreview: React.FC<Troop3DPreviewProps> = ({ unit, compact, interactive }) => {
  const camera = useMemo(() => ({ position: [3, 1.8, 4] as [number, number, number], fov: compact ? 38 : 45 }), [compact]);
  return (
    <Canvas camera={camera} style={{ background: RARITY_BG[unit.rarity] ?? RARITY_BG.common }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.45} />
      <pointLight position={[5, 5, 5]} intensity={1.1} color={unit.color} />
      <pointLight position={[-4, 2, -4]} intensity={0.5} color="#67e8f9" />
      <directionalLight position={[0, 6, 0]} intensity={0.3} />
      {!compact && <Stars radius={40} depth={20} count={400} factor={2} fade speed={0.5} />}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.45}>
        <SpinningModel visual={unit.visual} color={unit.color} />
      </Float>
      <HoloPlatform color={unit.color} />
      {interactive && <OrbitControls enablePan={false} minDistance={2.5} maxDistance={9} autoRotate autoRotateSpeed={0.6} />}
    </Canvas>
  );
};
