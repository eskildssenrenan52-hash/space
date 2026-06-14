// ============================================================================
// GALAXY FX — Nebula clouds, animated hyperlanes between explored galaxies,
// supernovae flashes, dust motes. All R3F components, mount inside <Canvas>.
// ============================================================================
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './gameStore';

// ---------------------------------------------------------------------------
// Procedural radial nebula sprite texture
// ---------------------------------------------------------------------------
const nebulaTexCache: Record<string, THREE.Texture> = {};
function nebulaSprite(color: string): THREE.Texture {
  if (nebulaTexCache[color]) return nebulaTexCache[color];
  const size = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  // multi-blob radial gradient → soft cloud
  for (let i = 0; i < 14; i++) {
    const x = size / 2 + (Math.random() - 0.5) * size * 0.7;
    const y = size / 2 + (Math.random() - 0.5) * size * 0.7;
    const r = 40 + Math.random() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color + 'cc');
    g.addColorStop(0.4, color + '55');
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // soft star specks
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.5})`;
    ctx.fillRect(x, y, 1, 1);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  nebulaTexCache[color] = t;
  return t;
}

interface NebProps {
  count?: number;
  radius?: number;
  scale?: number;
  seed?: number;
}

export const NebulaClouds: React.FC<NebProps> = ({ count = 10, radius = 350, scale = 180, seed = 1 }) => {
  const palette = ['#5a86ff', '#a36bff', '#ff5fa8', '#22d3ee', '#7cffb2', '#ffb347'];
  const clouds = useMemo(() => {
    const rng = mulberry32(seed * 7919);
    return Array.from({ length: count }, (_, i) => {
      const phi = rng() * Math.PI * 2;
      const cosTheta = rng() * 2 - 1;
      const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
      const r = radius * (0.55 + rng() * 0.45);
      return {
        pos: new THREE.Vector3(Math.cos(phi) * sinTheta * r, cosTheta * r * 0.35, Math.sin(phi) * sinTheta * r),
        color: palette[i % palette.length],
        scale: scale * (0.55 + rng() * 1.0),
        rot: rng() * Math.PI * 2,
        speed: 0.04 + rng() * 0.07,
      };
    });
  }, [count, radius, scale, seed]);

  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      const cloud = clouds[i];
      if (!cloud) return;
      c.rotation.z += dt * cloud.speed * 0.2;
      const s = cloud.scale * (1 + Math.sin(performance.now() * 0.0004 + i) * 0.04);
      c.scale.setScalar(s);
    });
  });

  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.pos.toArray()} rotation={[0, 0, c.rot]}>
          <spriteMaterial
            map={nebulaSprite(c.color)}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Hyperlanes — animated dashed lines between known galaxies/stars
// ---------------------------------------------------------------------------
interface LaneProps {
  points: Array<[number, number, number]>;
  color?: string;
}

const Hyperlane: React.FC<LaneProps & { speed?: number }> = ({ points, color = '#7dd3fc', speed = 0.8 }) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      arr.push(...points[i], ...points[i + 1]);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, [points]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current = (t.current + dt * speed * 0.3) % 1;
    if (pulseRef.current) {
      const p = curve.getPointAt(t.current);
      pulseRef.current.position.copy(p);
      const s = 0.6 + Math.sin(t.current * Math.PI * 2) * 0.3;
      pulseRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={geom}>
        <lineDashedMaterial color={color} dashSize={2} gapSize={1.5} transparent opacity={0.35} />
      </lineSegments>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
    </group>
  );
};

export const GalaxyHyperlanes: React.FC<{ scale?: number }> = ({ scale = 0.1 }) => {
  const galaxies = useGameStore(s => s.galaxies);
  const origin = galaxies[0];
  if (!origin) return null;
  const op: [number, number, number] = [origin.position.x * scale, origin.position.y * scale, origin.position.z * scale];

  return (
    <>
      {galaxies.slice(1, 14).map(g => {
        const tp: [number, number, number] = [g.position.x * scale, g.position.y * scale, g.position.z * scale];
        const mp: [number, number, number] = [(op[0] + tp[0]) / 2, (op[1] + tp[1]) / 2 + 4, (op[2] + tp[2]) / 2];
        return (
          <Hyperlane
            key={g.id}
            points={[op, mp, tp]}
            color={g.explored ? '#7dd3fc' : '#a78bfa'}
            speed={g.explored ? 1.2 : 0.6}
          />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Drifting dust motes — foreground particle field
// ---------------------------------------------------------------------------
export const DustMotes: React.FC<{ count?: number; spread?: number }> = ({ count = 400, spread = 200 }) => {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const palette = [new THREE.Color('#88aaff'), new THREE.Color('#ffaad4'), new THREE.Color('#aaffe0')];
    for (let i = 0; i < count; i++) {
      p[i * 3]     = (Math.random() - 0.5) * spread;
      p[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.5;
      p[i * 3 + 2] = (Math.random() - 0.5) * spread;
      const col = palette[i % palette.length];
      c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
    }
    return { positions: p, colors: c };
  }, [count, spread]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.6} vertexColors transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// ---------------------------------------------------------------------------
// Supernova flash — random rare bright pulses in the backdrop
// ---------------------------------------------------------------------------
export const SupernovaFlashes: React.FC<{ count?: number; radius?: number }> = ({ count = 3, radius = 300 }) => {
  const flashes = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius * 0.4,
        (Math.random() - 0.5) * radius,
      ),
      period: 6 + Math.random() * 10,
      offset: Math.random() * 6,
      color: ['#fff8c4', '#c4f0ff', '#ffd6c4'][Math.floor(Math.random() * 3)],
    })), [count, radius]);

  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    flashes.forEach((f, i) => {
      const m = refs.current[i];
      if (!m) return;
      const phase = ((clock.elapsedTime + f.offset) % f.period) / f.period;
      const k = phase < 0.08 ? Math.sin(phase / 0.08 * Math.PI) : 0;
      m.scale.setScalar(0.4 + k * 8);
      (m.material as THREE.MeshBasicMaterial).opacity = k;
    });
  });

  return (
    <>
      {flashes.map((f, i) => (
        <mesh
          key={i}
          position={f.pos.toArray()}
          ref={el => { refs.current[i] = el; }}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={f.color} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}