import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, Room, Ship, RoomIssue, IssueType, RoomType } from './gameStore';

// Room colors based on type
const roomColors: Record<RoomType, string> = {
  bridge: '#4A90D9',
  engineering: '#8B4513',
  reactor: '#FFD700',
  hangar: '#A0A0A0',
  medbay: '#00CED1',
  quarters: '#DEB887',
  cargo: '#696969',
  life_support: '#87CEEB',
  lab: '#9370DB',
  comms: '#32CD32',
  brig: '#708090',
  recreation: '#FF6347',
  defense: '#DC143C',
  kitchen: '#FFA500',
  hydroponics: '#228B22',
  armory: '#4B0082',
  shield_control: '#4169E1',
  navigation: '#20B2AA',
  warp_drive: '#9932CC',
  sensor_array: '#00FA9A'
};

// Issue colors
const issueColors: Record<IssueType, string> = {
  fire: '#FF4500',
  leak: '#1E90FF',
  electrical: '#FFD700',
  life_support: '#00CED1',
  structural: '#FF8C00',
  radiation: '#00FF00',
  malfunction: '#A0A0A0',
  blockage: '#DC143C'
};

// Single Room 3D mesh
const RoomMesh: React.FC<{
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ room, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const issueRef = useRef<THREE.Mesh>(null);

  // Get room color
  const baseColor = roomColors[room.type] || '#808080';
  const statusOpacity = room.status === 'operational' ? 0 : room.status === 'degraded' ? 0.3 : 0.6;

  // Pulsing animation for issues
  useFrame((state) => {
    if (room.currentIssue && issueRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.3 + 0.7;
      (issueRef.current.material as THREE.Material & { opacity: number }).opacity = pulse * 0.5;
      issueRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
    if (glowRef.current && room.status !== 'operational') {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      (glowRef.current.material as THREE.Material & { opacity: number }).opacity = pulse * 0.3;
    }
    if (meshRef.current && isSelected) {
      const bob = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.04;
      meshRef.current.scale.setScalar(bob);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const roomWidth = room.size.x * 0.3;
  const roomHeight = room.size.y * 0.3;
  const roomDepth = room.size.z * 0.3;

  return (
    <group position={[room.position.x * 0.3, room.position.y * 0.3, room.position.z * 0.3]}>
      {/* Main room box */}
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <boxGeometry args={[roomWidth, roomHeight, roomDepth]} />
        <meshStandardMaterial
          color={baseColor}
          transparent
          opacity={isSelected ? 0.95 : 0.75}
          metalness={0.55}
          roughness={0.35}
          emissive={isSelected ? '#22d3ee' : baseColor}
          emissiveIntensity={isSelected ? 0.45 : 0.12}
        />
      </mesh>

      {/* Room edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth)]} />
        <lineBasicMaterial color={isSelected ? '#22d3ee' : '#7dd3fc'} linewidth={2} transparent opacity={isSelected ? 1 : 0.55} />
      </lineSegments>

      {/* Status glow overlay */}
      {room.status !== 'operational' && (
        <mesh ref={glowRef}>
          <boxGeometry args={[roomWidth + 0.05, roomHeight + 0.05, roomDepth + 0.05]} />
          <meshBasicMaterial
            color={room.status === 'critical' ? '#ff0000' : '#ffff00'}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Issue indicator (3D-only beacon — details live in the right HUD sidebar) */}
      {room.currentIssue && (
        <group position={[0, roomHeight / 2 + 0.5, 0]}>
          <mesh ref={issueRef}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial
              color={issueColors[room.currentIssue.type]}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* vertical beacon beam */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
            <meshBasicMaterial
              color={issueColors[room.currentIssue.type]}
              transparent opacity={0.5}
            />
          </mesh>
        </group>
      )}

      {/* Health bar */}
      <group position={[0, -roomHeight / 2 + 0.1, roomDepth / 2 + 0.05]}>
        <mesh>
          <boxGeometry args={[roomWidth * 0.9, 0.08, 0.02]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[(room.health / 100 - 1) * roomWidth * 0.45, 0, 0]}>
          <boxGeometry args={[(room.health / 100) * roomWidth * 0.9, 0.08, 0.02]} />
          <meshBasicMaterial color={room.health > 70 ? '#00ff00' : room.health > 40 ? '#ffff00' : '#ff0000'} />
        </mesh>
      </group>
    </group>
  );
};

// Ship hull visualization
const ShipHull: React.FC<{ ship: Ship }> = ({ ship }) => {
  const hullSize = {
    x: ship.size * 4,
    y: ship.size * 1.5,
    z: ship.size * 2
  };

  return (
    <group>
      {/* Main hull */}
      <mesh>
        <boxGeometry args={[hullSize.x, hullSize.y, hullSize.z]} />
        <meshStandardMaterial
          color="#2a2a3a"
          transparent
          opacity={0.3}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Hull outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(hullSize.x, hullSize.y, hullSize.z)]} />
        <lineBasicMaterial color="#4A90D9" linewidth={1} />
      </lineSegments>

      {/* Bridge at front */}
      <mesh position={[hullSize.x / 2 + 0.5, hullSize.y / 4, 0]}>
        <sphereGeometry args={[ship.size * 0.5, 16, 16]} />
        <meshStandardMaterial color="#4A90D9" transparent opacity={0.5} />
      </mesh>

      {/* Engine at back */}
      <mesh position={[-hullSize.x / 2 - 0.3, -hullSize.y / 8, 0]}>
        <cylinderGeometry args={[ship.size * 0.3, ship.size * 0.4, ship.size * 0.5, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-hullSize.x / 2 - 0.3, -hullSize.y / 8, ship.size * 0.3]}>
        <cylinderGeometry args={[ship.size * 0.2, ship.size * 0.3, ship.size * 0.4, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-hullSize.x / 2 - 0.3, -hullSize.y / 8, -ship.size * 0.3]}>
        <cylinderGeometry args={[ship.size * 0.2, ship.size * 0.3, ship.size * 0.4, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Deck floor with animated holographic grid + corner lights
const DeckEnvironment: React.FC<{ ship: Ship }> = ({ ship }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const halo1 = useRef<THREE.Mesh>(null);
  const halo2 = useRef<THREE.Mesh>(null);
  const w = ship.size * 4.5;
  const d = ship.size * 2.6;

  useFrame((s) => {
    if (ringRef.current) ringRef.current.rotation.z += 0.003;
    if (halo1.current)  halo1.current.rotation.y = s.clock.elapsedTime * 0.15;
    if (halo2.current)  halo2.current.rotation.y = -s.clock.elapsedTime * 0.1;
  });

  // Procedural holo-grid texture for the deck
  const deckTex = useMemo(() => {
    const size = 512;
    const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#04080f'; ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(120, 220, 255, 0.55)'; ctx.lineWidth = 1.2;
    const step = 32;
    for (let i = 0; i <= size; i += step) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(180, 120, 255, 0.35)'; ctx.lineWidth = 0.6;
    for (let i = 0; i <= size; i += step / 4) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    return tex;
  }, []);

  return (
    <group>
      {/* Deck floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -ship.size * 0.85, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={deckTex} emissive={'#0a2e55'} emissiveIntensity={0.6} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Glowing deck outline ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -ship.size * 0.84, 0]}>
        <ringGeometry args={[Math.min(w, d) * 0.5 - 0.1, Math.min(w, d) * 0.5, 96]} />
        <meshBasicMaterial color={'#5cd8ff'} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating holo halos above the deck */}
      <mesh ref={halo1} position={[0, ship.size * 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[w * 0.32, 0.015, 8, 96]} />
        <meshBasicMaterial color={'#7ad9ff'} transparent opacity={0.7} />
      </mesh>
      <mesh ref={halo2} position={[0, ship.size * 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[w * 0.4, 0.01, 8, 96]} />
        <meshBasicMaterial color={'#c08bff'} transparent opacity={0.5} />
      </mesh>

      {/* Corner accent lights */}
      {[[ w / 2 - 0.3, -ship.size * 0.5,  d / 2 - 0.3],
        [-w / 2 + 0.3, -ship.size * 0.5,  d / 2 - 0.3],
        [ w / 2 - 0.3, -ship.size * 0.5, -d / 2 + 0.3],
        [-w / 2 + 0.3, -ship.size * 0.5, -d / 2 + 0.3]].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <pointLight color={i % 2 ? '#a065ff' : '#5cd8ff'} intensity={0.9} distance={6} />
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color={i % 2 ? '#c08bff' : '#7ad9ff'} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Ambient floating dust / particles inside the hull
const HullParticles: React.FC<{ ship: Ship }> = ({ ship }) => {
  const ref = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 180;
    const arr = new Float32Array(count * 3);
    const w = ship.size * 4, h = ship.size * 1.5, d = ship.size * 2;
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * w;
      arr[i * 3 + 1] = (Math.random() - 0.5) * h;
      arr[i * 3 + 2] = (Math.random() - 0.5) * d;
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [ship.size]);

  useFrame((s) => {
    if (!ref.current) return;
    const pos = (ref.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += Math.sin(t + i) * 0.0008;
    }
    (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color={'#9fdcff'} size={0.04} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
};

// Ship Interior 3D Scene
const ShipInteriorScene: React.FC = () => {
  const { selectedShip, selectedRoom, selectRoom, repairRoom } = useGameStore();

  if (!selectedShip) return null;

  return (
    <>
      <ambientLight intensity={0.35} color={'#7aa8ff'} />
      <pointLight position={[10, 10, 10]} intensity={1.1} />
      <pointLight position={[-10, 5, -10]} intensity={0.7} color="#7d4ed1" />
      <directionalLight position={[6, 12, 4]} intensity={0.6} color={'#cfe6ff'} />
      <fog attach="fog" args={['#04060d', 12, 40]} />
      <Stars radius={80} depth={20} count={1200} factor={1.5} fade />

      {/* Immersive deck environment + particles */}
      <DeckEnvironment ship={selectedShip} />
      <HullParticles ship={selectedShip} />

      {/* Ship hull */}
      <ShipHull ship={selectedShip} />

      {/* Rooms */}
      {selectedShip.rooms.map((room, index) => (
        <RoomMesh
          key={room.id}
          room={room}
          isSelected={selectedRoom?.id === room.id}
          onSelect={() => selectRoom(room)}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={30}
        minDistance={2}
        autoRotate
        autoRotateSpeed={0.25}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// HUD pieces: cockpit-style holographic overlays around the 3D viewport.
// ---------------------------------------------------------------------------
const ROOM_GROUPS: { label: string; types: RoomType[]; color: string }[] = [
  { label: 'Comando',        types: ['bridge', 'navigation', 'comms', 'sensor_array'],            color: '#22d3ee' },
  { label: 'Engenharia',     types: ['engineering', 'reactor', 'warp_drive', 'shield_control'],   color: '#a78bfa' },
  { label: 'Vida & Tripulação', types: ['life_support', 'quarters', 'medbay', 'kitchen', 'hydroponics', 'recreation'], color: '#34d399' },
  { label: 'Tática',         types: ['defense', 'armory', 'hangar', 'brig'],                       color: '#f87171' },
  { label: 'Apoio',          types: ['cargo', 'lab'],                                              color: '#fbbf24' },
];

const StatusDot: React.FC<{ status: Room['status'] }> = ({ status }) => (
  <span
    className="inline-block w-2 h-2 rounded-full"
    style={{
      background: status === 'operational' ? '#22c55e' : status === 'degraded' ? '#fbbf24' : '#ef4444',
      boxShadow: status !== 'operational' ? '0 0 8px currentColor' : undefined,
      color: status === 'critical' ? '#ef4444' : status === 'degraded' ? '#fbbf24' : '#22c55e',
      animation: status !== 'operational' ? 'pulse 1.4s infinite' : undefined,
    }}
  />
);

// Curved holographic stat bar (segmented arc style)
const StatGauge: React.FC<{ label: string; value: number; max: number; color: string; icon?: string }> = ({ label, value, max, color, icon }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const segs = 14;
  const filled = Math.round(pct * segs);
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-gray-400">
        <span style={{ color }}>{icon} {label}</span>
        <span className="font-mono text-white">{Math.floor(value)}/{max}</span>
      </div>
      <div className="flex gap-[2px] h-2.5">
        {Array.from({ length: segs }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              background: i < filled ? color : 'rgba(255,255,255,0.07)',
              boxShadow: i < filled ? `0 0 6px ${color}` : undefined,
              opacity: i < filled ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const RoomCard: React.FC<{ room: Room; isSelected: boolean; onSelect: () => void }> = ({ room, isSelected, onSelect }) => {
  const eff = Math.round(room.efficiency * 100);
  const effColor = eff > 70 ? '#22c55e' : eff > 40 ? '#fbbf24' : '#ef4444';
  return (
    <button
      onClick={onSelect}
      className={`group w-full text-left px-2 py-1.5 rounded-md border transition-all relative overflow-hidden
        ${isSelected
          ? 'border-cyan-300 bg-cyan-500/15 shadow-[0_0_16px_rgba(34,211,238,0.35)]'
          : 'border-cyan-500/10 hover:border-cyan-400/40 hover:bg-cyan-500/5'}`}
      style={isSelected ? {} : { background: 'rgba(2,4,12,0.7)' }}
    >
      <div className="flex items-center gap-2">
        <StatusDot status={room.status} />
        <span className="text-[11px] text-gray-100 font-medium truncate flex-1 capitalize">{room.name.replace(/_/g, ' ')}</span>
        <span className="text-[10px] font-mono" style={{ color: effColor }}>{eff}%</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <div className="h-0.5 rounded flex-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full" style={{ width: `${room.health}%`, background: room.health > 60 ? '#22c55e' : room.health > 30 ? '#fbbf24' : '#ef4444' }} />
        </div>
        {room.currentIssue && (
          <span className="text-[9px] font-bold px-1 rounded" style={{
            background: `${issueColors[room.currentIssue.type]}30`,
            color: issueColors[room.currentIssue.type],
          }}>{room.currentIssue.type.replace('_', ' ').toUpperCase()}</span>
        )}
      </div>
    </button>
  );
};

const SelectedRoomPanel: React.FC<{ ship: Ship; room: Room; onRepair: () => void; onClose: () => void }> = ({ ship, room, onRepair, onClose }) => {
  const issue = room.currentIssue;
  return (
    <div className="backdrop-blur-md border border-cyan-400/50 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.25)] overflow-hidden" style={{ background: 'rgba(2,4,14,0.97)' }}>
      <div className="px-3 py-2 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-transparent flex items-center gap-2">
        <StatusDot status={room.status} />
        <span className="text-sm font-bold text-cyan-200 tracking-wider capitalize flex-1">{room.name.replace(/_/g, ' ')}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-0.5">✕</button>
      </div>
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-cyan-500/15 rounded p-2">
            <div className="text-[9px] uppercase tracking-widest text-gray-500">Saúde</div>
            <div className="text-lg font-bold text-white">{Math.floor(room.health)}<span className="text-xs text-gray-500">/100</span></div>
          </div>
          <div className="bg-black/40 border border-cyan-500/15 rounded p-2">
            <div className="text-[9px] uppercase tracking-widest text-gray-500">Eficiência</div>
            <div className="text-lg font-bold" style={{ color: room.efficiency > 0.7 ? '#22c55e' : room.efficiency > 0.4 ? '#fbbf24' : '#ef4444' }}>
              {Math.round(room.efficiency * 100)}<span className="text-xs text-gray-500">%</span>
            </div>
          </div>
        </div>

        {issue ? (
          <div
            className={`border rounded-lg p-2 ${
              issue.severity === 'critical' ? 'border-red-500/60 bg-red-500/10'
              : issue.severity === 'major' ? 'border-orange-500/60 bg-orange-500/10'
              : 'border-yellow-500/60 bg-yellow-500/10'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: issueColors[issue.type] }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: issueColors[issue.type], boxShadow: `0 0 8px ${issueColors[issue.type]}` }} />
              {issue.type.replace('_', ' ')}
              <span className="text-gray-400 text-[10px]">[{issue.severity}]</span>
            </div>
            <p className="text-gray-300 text-[11px] mt-1">{issue.description}</p>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>Reparo</span>
                <span>{Math.floor((issue.repairProgress / issue.repairRequired) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded bg-gradient-to-r from-cyan-400 to-cyan-200 transition-all"
                  style={{ width: `${(issue.repairProgress / issue.repairRequired) * 100}%`, boxShadow: '0 0 8px #22d3ee' }} />
              </div>
            </div>
            <button
              onClick={onRepair}
              className="w-full mt-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black text-xs font-bold py-1.5 rounded-md transition-all shadow-[0_0_16px_rgba(34,211,238,0.5)]"
            >
              ⚒ REPARAR AGORA
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Compartimento operando normalmente.
          </div>
        )}

        <div className="text-[10px] text-gray-500 grid grid-cols-2 gap-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div>Tipo: <span className="text-gray-300 capitalize">{room.type.replace('_', ' ')}</span></div>
          <div>Nave: <span className="text-gray-300">{ship.name}</span></div>
        </div>
      </div>
    </div>
  );
};

// Cockpit corner brackets (SVG) drawn around the canvas viewport
const CockpitCorners: React.FC = () => (
  <svg className="absolute inset-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="cockpitGlow" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    {/* Top-left */}
    <path d="M0,8 L0,0 L8,0" stroke="url(#cockpitGlow)" strokeWidth="0.25" fill="none" vectorEffect="non-scaling-stroke" />
    <path d="M92,0 L100,0 L100,8" stroke="url(#cockpitGlow)" strokeWidth="0.25" fill="none" vectorEffect="non-scaling-stroke" />
    <path d="M100,92 L100,100 L92,100" stroke="url(#cockpitGlow)" strokeWidth="0.25" fill="none" vectorEffect="non-scaling-stroke" />
    <path d="M8,100 L0,100 L0,92" stroke="url(#cockpitGlow)" strokeWidth="0.25" fill="none" vectorEffect="non-scaling-stroke" />
  </svg>
);

// Ship Interior 3D Canvas — AAA cockpit shell
export const ShipInterior3DView: React.FC = () => {
  const { showShipInterior, selectedShip, selectedRoom, playerShips, selectShip, selectRoom, repairRoom, toggleShipInterior } = useGameStore();

  if (!showShipInterior) return null;

  const groupedRooms = selectedShip
    ? ROOM_GROUPS.map(g => ({
        ...g,
        rooms: selectedShip.rooms.filter(r => g.types.includes(r.type)),
      })).filter(g => g.rooms.length > 0)
    : [];

  const ungrouped = selectedShip
    ? selectedShip.rooms.filter(r => !ROOM_GROUPS.some(g => g.types.includes(r.type)))
    : [];

  const activeAlerts = selectedShip?.alerts.filter(a => !a.resolved) ?? [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #06091a 0%, #000 80%)' }}>
      {/* TOP HUD BAR — curved gradient with ship identity + status gauges */}
      <div className="absolute top-0 left-0 right-0 h-20 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/60 via-cyan-950/20 to-transparent border-b border-cyan-500/30" />
        <div className="absolute inset-0 px-4 flex items-center gap-4 pointer-events-auto">
          <button
            onClick={toggleShipInterior}
            className="px-3 py-1.5 rounded-md border border-cyan-500/40 text-cyan-200 text-xs font-bold hover:border-cyan-300 hover:bg-cyan-500/10 transition-all backdrop-blur-md"
            style={{ background: 'rgba(2,4,14,0.75)' }}
          >
            ✕ FECHAR
          </button>

          {selectedShip && (
            <>
              <div className="flex items-center gap-2 pl-3 border-l border-cyan-500/20">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22d3ee', boxShadow: '0 0 10px #22d3ee', animation: 'pulse 1.5s infinite' }} />
                <div>
                  <div className="font-bold text-white tracking-widest text-base leading-none">{selectedShip.name}</div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-cyan-300/70 mt-0.5">
                    {selectedShip.type} · Eficiência {selectedShip.overallEfficiency.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-5">
                <StatGauge label="HULL"   value={selectedShip.health}   max={selectedShip.maxHealth}   color="#22d3ee" icon="◆" />
                <StatGauge label="SHIELD" value={selectedShip.shield}   max={selectedShip.maxShield}   color="#60a5fa" icon="⬡" />
                <StatGauge label="FUEL"   value={selectedShip.fuel}     max={selectedShip.maxFuel}     color="#fbbf24" icon="⚡" />
                <StatGauge label="CREW"   value={selectedShip.crew.length} max={selectedShip.maxCrew}  color="#a78bfa" icon="◉" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* SHIP SELECTOR — top-right strip */}
      {playerShips.length > 1 && (
        <div className="absolute top-24 right-3 z-40 flex flex-col gap-1 max-h-[60vh] overflow-y-auto backdrop-blur-md border border-cyan-500/30 rounded-lg p-2" style={{ background: 'rgba(2,4,14,0.88)' }}>
          <div className="text-[9px] uppercase tracking-widest text-cyan-300/70 px-1 mb-1">Frota ({playerShips.length})</div>
          {playerShips.map(ship => (
            <button
              key={ship.id}
              onClick={() => { selectShip(ship); selectRoom(null); }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all
                ${selectedShip?.id === ship.id
                  ? 'bg-cyan-500/20 border border-cyan-300 text-cyan-100'
                  : 'border border-transparent text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-200'}`}
            >
              {ship.name}
            </button>
          ))}
        </div>
      )}

      {/* LEFT SIDEBAR — system groups */}
      <div className="absolute top-24 left-3 bottom-24 w-[260px] z-40 flex flex-col gap-2">
        <div className="backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 flex-shrink-0" style={{ background: 'rgba(2,4,14,0.88)' }}>
          <div className="text-[10px] uppercase tracking-widest text-cyan-300/70">Sistemas da Nave</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {selectedShip?.rooms.length ?? 0} compartimentos
            <span className="ml-2 text-[10px] font-normal text-gray-400">{activeAlerts.length} alerta(s)</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto backdrop-blur-md border border-cyan-500/20 rounded-xl p-2 space-y-3 min-h-0" style={{ background: 'rgba(2,4,14,0.75)' }}>
          {groupedRooms.map(g => (
            <div key={g.label}>
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${g.color}, transparent)` }} />
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color: g.color }}>{g.label}</span>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${g.color}, transparent)` }} />
              </div>
              <div className="space-y-1">
                {g.rooms.map(r => (
                  <RoomCard key={r.id} room={r} isSelected={selectedRoom?.id === r.id} onSelect={() => selectRoom(r)} />
                ))}
              </div>
            </div>
          ))}
          {ungrouped.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-500 mb-1 px-1">Outros</div>
              <div className="space-y-1">
                {ungrouped.map(r => (
                  <RoomCard key={r.id} room={r} isSelected={selectedRoom?.id === r.id} onSelect={() => selectRoom(r)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR — selected room + active alerts */}
      <div className="absolute top-24 right-3 bottom-24 w-[300px] z-40 flex flex-col gap-2"
           style={{ marginTop: playerShips.length > 1 ? 200 : 0 }}>
        {selectedShip && selectedRoom && (
          <SelectedRoomPanel
            ship={selectedShip}
            room={selectedRoom}
            onRepair={() => repairRoom(selectedShip.id, selectedRoom.id)}
            onClose={() => selectRoom(null)}
          />
        )}

        {activeAlerts.length > 0 && (
          <div className="backdrop-blur-md border border-red-500/40 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(2,4,14,0.92)' }}>
            <div className="px-3 py-2 bg-gradient-to-r from-red-500/20 to-transparent border-b border-red-500/30 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px #ef4444' }} />
              <span className="text-xs font-bold text-red-300 tracking-wider uppercase">{activeAlerts.length} Alertas Ativos</span>
            </div>
            <div className="p-2 space-y-1 max-h-[280px] overflow-y-auto">
              {activeAlerts.slice(0, 8).map(alert => {
                const room = selectedShip?.rooms.find(r => r.id === alert.roomId);
                return (
                  <button
                    key={alert.id}
                    onClick={() => room && selectRoom(room)}
                    className={`w-full text-left text-[11px] px-2 py-1.5 rounded transition-colors
                      ${alert.severity === 'critical' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200'
                        : alert.severity === 'warning' ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200'
                        : 'text-gray-300'}`}
                    style={alert.severity !== 'critical' && alert.severity !== 'warning' ? { background: 'rgba(255,255,255,0.06)' } : {}}
                  >
                    <div className="font-bold capitalize">{room?.name.replace(/_/g, ' ')}</div>
                    <div className="opacity-80">{alert.message}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM TELEMETRY STRIP */}
      <div className="absolute bottom-0 left-0 right-0 h-16 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/60 via-cyan-950/20 to-transparent border-t border-cyan-500/30" />
        <div className="absolute inset-0 px-4 flex items-center justify-between text-[10px] font-mono text-cyan-300/80 pointer-events-auto">
          <div className="flex items-center gap-4">
            <span>🖱️ <span className="text-gray-400">arrastar:</span> orbitar</span>
            <span>🖱️ <span className="text-gray-400">scroll:</span> zoom</span>
            <span>🖱️ <span className="text-gray-400">clique:</span> selecionar</span>
          </div>
          <div className="flex items-center gap-4 text-cyan-200/90 uppercase tracking-widest">
            <span>◆ COCKPIT ATIVO</span>
            <span className="text-cyan-400">●</span>
            <span>STARDATE 3287.{(Date.now() / 1000 % 100).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Cockpit framing */}
      <CockpitCorners />

      {/* 3D Canvas — fills the whole viewport, UI floats above */}
      <Canvas
        camera={{ position: [10, 6, 14], fov: 50, near: 0.1, far: 200 }}
        style={{ background: 'radial-gradient(ellipse at center, #06091a 0%, #000 80%)' }}
        dpr={[1, 2]}
      >
        <React.Suspense fallback={null}>
          <ShipInteriorScene />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default ShipInterior3DView;
