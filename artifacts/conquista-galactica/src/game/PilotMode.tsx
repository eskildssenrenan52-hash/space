// ============================================================================
// PILOT MODE — fly the player's spaceship. Throttle-based propulsion, mouse
// look (drag) + keyboard, inertial dampeners, boost, brake, speed-reactive
// FOV / chase camera, attitude HUD and crosshair. Disable orbit controls in
// the host scene while this mode is active.
// ============================================================================
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';
import { Rocket, Gauge, Zap, Anchor, Camera } from 'lucide-react';

interface PilotState {
  enabled: boolean;
  throttle: number;       // 0..1 desired thrust
  velocityKps: number;    // current speed for HUD
  boosting: boolean;
  dampener: boolean;      // inertial dampener auto-stop
  camMode: 'chase' | 'cockpit' | 'cinematic';
  toggle: () => void;
  setEnabled: (b: boolean) => void;
  setThrottle: (s: number) => void;
  setBoost: (b: boolean) => void;
  setDampener: (b: boolean) => void;
  setVelocityKps: (v: number) => void;
  cycleCam: () => void;
}

export const usePilotStore = create<PilotState>((set) => ({
  enabled: false,
  throttle: 0.5,
  velocityKps: 0,
  boosting: false,
  dampener: true,
  camMode: 'chase',
  toggle: () => set((s) => ({ enabled: !s.enabled })),
  setEnabled: (b) => set({ enabled: b }),
  setThrottle: (s) => set({ throttle: Math.max(0, Math.min(1, s)) }),
  setBoost: (b) => set({ boosting: b }),
  setDampener: (b) => set({ dampener: b }),
  setVelocityKps: (v) => set({ velocityKps: v }),
  cycleCam: () => set((s) => {
    const order: PilotState['camMode'][] = ['chase', 'cockpit', 'cinematic'];
    return { camMode: order[(order.indexOf(s.camMode) + 1) % order.length] };
  }),
}));

// Shared pilot transform — outside React so frame-tight updates stay cheap.
const pilot = {
  pos: new THREE.Vector3(0, 4, 24),
  quat: new THREE.Quaternion(),
  vel: new THREE.Vector3(),
  angVel: new THREE.Vector3(), // pitch, yaw, roll angular velocity
};
const keys: Record<string, boolean> = {};
const mouse = { dx: 0, dy: 0, look: false };

let inputBound = false;
function ensureInput() {
  if (inputBound || typeof window === 'undefined') return;
  inputBound = true;
  const dn = (e: KeyboardEvent) => {
    const enabled = usePilotStore.getState().enabled;
    if (enabled && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyS','KeyA','KeyD','KeyQ','KeyE','KeyX','KeyZ','KeyC','KeyV'].includes(e.code)) e.preventDefault();
    keys[e.code] = true;
    if (e.code === 'KeyP') usePilotStore.getState().toggle();
    if (e.code === 'KeyV' && enabled) usePilotStore.getState().cycleCam();
    if (e.code === 'KeyZ' && enabled) usePilotStore.getState().setDampener(!usePilotStore.getState().dampener);
    if (e.code === 'KeyX' && enabled) {
      // full brake: zero throttle and clear velocity
      usePilotStore.getState().setThrottle(0);
      pilot.vel.multiplyScalar(0.05);
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') usePilotStore.getState().setBoost(true);
  };
  const up = (e: KeyboardEvent) => {
    keys[e.code] = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') usePilotStore.getState().setBoost(false);
  };
  const md = (e: MouseEvent) => {
    if (!usePilotStore.getState().enabled) return;
    // right or middle-click drag = mouse look
    if (e.button === 2 || e.button === 1) { mouse.look = true; e.preventDefault(); }
  };
  const mu = (e: MouseEvent) => { if (e.button === 2 || e.button === 1) mouse.look = false; };
  const mm = (e: MouseEvent) => {
    if (!mouse.look) return;
    mouse.dx += e.movementX;
    mouse.dy += e.movementY;
  };
  const wh = (e: WheelEvent) => {
    if (!usePilotStore.getState().enabled) return;
    const t = usePilotStore.getState().throttle;
    usePilotStore.getState().setThrottle(t - Math.sign(e.deltaY) * 0.05);
    e.preventDefault();
  };
  const ctx = (e: Event) => { if (usePilotStore.getState().enabled) e.preventDefault(); };
  window.addEventListener('keydown', dn, { passive: false });
  window.addEventListener('keyup', up);
  window.addEventListener('mousedown', md);
  window.addEventListener('mouseup', mu);
  window.addEventListener('mousemove', mm);
  window.addEventListener('wheel', wh, { passive: false });
  window.addEventListener('contextmenu', ctx);
}

// ---------------------------------------------------------------------------
// In-canvas: ship mesh + flight + chase camera
// ---------------------------------------------------------------------------
const PilotShipMesh: React.FC = () => {
  const group = useRef<THREE.Group>(null);
  const engineL = useRef<THREE.Mesh>(null);
  const engineR = useRef<THREE.Mesh>(null);
  const engineC = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const navL = useRef<THREE.PointLight>(null);
  const navR = useRef<THREE.PointLight>(null);
  const t0 = useRef(0);

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.position.copy(pilot.pos);
    group.current.quaternion.copy(pilot.quat);
    const { boosting, throttle, camMode } = usePilotStore.getState();
    // In cockpit view, fade out the visible ship so the canopy doesn't block sight
    group.current.visible = camMode !== 'cockpit';

    t0.current += dt;
    const flick = 0.7 + Math.random() * 0.3;
    const intensity = (boosting ? 3.0 : 1.0) * (0.35 + throttle) * flick;
    const setOpacity = (m: THREE.Mesh | null, base: number) => {
      if (!m) return;
      (m.material as THREE.MeshBasicMaterial).opacity = Math.min(1, base * intensity);
    };
    setOpacity(engineL.current, 0.65);
    setOpacity(engineR.current, 0.65);
    setOpacity(engineC.current, 0.8);
    if (haloRef.current) {
      haloRef.current.rotation.z += dt * (1 + throttle * 4);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = Math.min(1, throttle * 0.6 + (boosting ? 0.5 : 0));
    }
    // blinking nav lights
    const blink = (Math.sin(t0.current * 4) + 1) * 0.5;
    if (navL.current) navL.current.intensity = 0.8 + blink * 1.2;
    if (navR.current) navR.current.intensity = 0.8 + (1 - blink) * 1.2;
  });

  return (
    <group ref={group}>
      {/* main fuselage — elongated diamond */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.5, 2.2, 10]} />
        <meshStandardMaterial color="#dde9f5" metalness={0.9} roughness={0.18} emissive="#0b2a52" emissiveIntensity={0.25} />
      </mesh>
      {/* belly plate */}
      <mesh position={[0, -0.18, -0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.42, 1.8, 8]} />
        <meshStandardMaterial color="#3a5572" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* canopy */}
      <mesh position={[0, 0.2, 0.25]} castShadow>
        <sphereGeometry args={[0.28, 18, 14, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
        <meshStandardMaterial color="#0ff" emissive="#0ff" emissiveIntensity={1.1} metalness={0.7} roughness={0.05} transparent opacity={0.55} />
      </mesh>
      {/* canopy frame */}
      <mesh position={[0, 0.2, 0.25]}>
        <torusGeometry args={[0.27, 0.015, 8, 24]} />
        <meshStandardMaterial color="#9fd1ff" metalness={0.9} roughness={0.1} emissive="#1c7fbf" emissiveIntensity={0.6} />
      </mesh>
      {/* main wings (swept) */}
      <mesh position={[0.7, -0.05, -0.1]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.65]} />
        <meshStandardMaterial color="#8fb6da" metalness={0.85} roughness={0.22} emissive="#0b2647" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-0.7, -0.05, -0.1]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.65]} />
        <meshStandardMaterial color="#8fb6da" metalness={0.85} roughness={0.22} emissive="#0b2647" emissiveIntensity={0.15} />
      </mesh>
      {/* wing tip cannons */}
      <mesh position={[1.15, -0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#26354a" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[-1.15, -0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#26354a" metalness={0.95} roughness={0.2} />
      </mesh>
      {/* vertical stabilizer */}
      <mesh position={[0, 0.3, -0.7]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.45]} />
        <meshStandardMaterial color="#8fb6da" metalness={0.85} roughness={0.22} />
      </mesh>
      {/* nose antenna */}
      <mesh position={[0, 0.08, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.04, 0.4, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={1} roughness={0.05} />
      </mesh>
      {/* engine housings */}
      <mesh position={[0.32, -0.12, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.45, 12]} />
        <meshStandardMaterial color="#465a78" metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh position={[-0.32, -0.12, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.45, 12]} />
        <meshStandardMaterial color="#465a78" metalness={0.95} roughness={0.18} />
      </mesh>
      {/* engine glows + trails */}
      <Trail width={0.95} length={8} color={'#7df9ff'} attenuation={(t) => t * t}>
        <mesh ref={engineL} position={[0.32, -0.12, -1.05]}>
          <sphereGeometry args={[0.14, 14, 14]} />
          <meshBasicMaterial color="#7df9ff" transparent opacity={0.9} />
        </mesh>
      </Trail>
      <Trail width={0.95} length={8} color={'#7df9ff'} attenuation={(t) => t * t}>
        <mesh ref={engineR} position={[-0.32, -0.12, -1.05]}>
          <sphereGeometry args={[0.14, 14, 14]} />
          <meshBasicMaterial color="#7df9ff" transparent opacity={0.9} />
        </mesh>
      </Trail>
      <Trail width={0.5} length={12} color={'#a78bfa'} attenuation={(t) => t * t}>
        <mesh ref={engineC} position={[0, -0.18, -1.15]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.9} />
        </mesh>
      </Trail>
      {/* afterburner halo (visible on boost) */}
      <mesh ref={haloRef} position={[0, -0.14, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.36, 22]} />
        <meshBasicMaterial color="#7df9ff" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      {/* nav lights */}
      <mesh position={[1.18, -0.04, -0.05]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ff4d4d" />
      </mesh>
      <pointLight ref={navL} color="#ff4d4d" intensity={1} distance={4} position={[1.18, -0.04, -0.05]} />
      <mesh position={[-1.18, -0.04, -0.05]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#4dff7a" />
      </mesh>
      <pointLight ref={navR} color="#4dff7a" intensity={1} distance={4} position={[-1.18, -0.04, -0.05]} />
      {/* underglow */}
      <pointLight color="#7df9ff" intensity={1.8} distance={12} position={[0, -0.15, -0.8]} />
    </group>
  );
};

// Hyperspace streaks: small streaks anchored to ship that elongate with speed/boost
const HyperStreaks: React.FC = () => {
  const inst = useRef<THREE.InstancedMesh>(null);
  const COUNT = 220;
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < COUNT; i++) {
      // around the ship in a torus volume
      const r = 8 + Math.random() * 26;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 18;
      arr.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!inst.current) return;
    const speed = pilot.vel.length();
    const { boosting } = usePilotStore.getState();
    const len = THREE.MathUtils.clamp(speed * 0.04 + (boosting ? 8 : 0), 0.2, 28);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(pilot.quat);

    for (let i = 0; i < COUNT; i++) {
      const p = positions[i];
      // recycle particles that fall behind
      const rel = p.clone().sub(pilot.pos);
      const along = rel.dot(fwd);
      if (along < -20) {
        const r = 8 + Math.random() * 26;
        const a = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 18;
        const newRel = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r + 28);
        p.copy(pilot.pos.clone().add(newRel));
      } else if (along > 40) {
        const r = 8 + Math.random() * 26;
        const a = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 18;
        const newRel = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r - 20);
        p.copy(pilot.pos.clone().add(newRel));
      }
      // orient streak along ship's forward axis
      tmp.position.copy(p);
      tmp.quaternion.copy(pilot.quat);
      tmp.scale.set(0.05, 0.05, len);
      tmp.updateMatrix();
      inst.current.setMatrixAt(i, tmp.matrix);
    }
    inst.current.instanceMatrix.needsUpdate = true;
    const mat = inst.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.clamp(speed * 0.005 + (boosting ? 0.4 : 0), 0, 0.85);
    void dt;
  });

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#bdf2ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
};

const ChaseCamera: React.FC<{ followDistance?: number }> = ({ followDistance = 6 }) => {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());
  const baseFov = useRef<number | null>(null);

  useFrame((_, dt) => {
    const { boosting, camMode } = usePilotStore.getState();
    const speed = pilot.vel.length();

    let backOffset: THREE.Vector3;
    let lookOffset: THREE.Vector3;
    let followK = 9, lookK = 12;

    if (camMode === 'cockpit') {
      // first-person inside the canopy
      backOffset = new THREE.Vector3(0, 0.18, 0.25).applyQuaternion(pilot.quat);
      lookOffset = new THREE.Vector3(0, 0.18, 8).applyQuaternion(pilot.quat);
      followK = 30; lookK = 30; // tight to head
    } else if (camMode === 'cinematic') {
      // wide tracking shot, banked slightly
      const dyn = followDistance * 1.8 + Math.min(speed * 0.08, 6) + (boosting ? 3 : 0);
      backOffset = new THREE.Vector3(2.5, 2.4 + Math.min(speed * 0.01, 1.5), -dyn).applyQuaternion(pilot.quat);
      lookOffset = new THREE.Vector3(0, 0, 4).applyQuaternion(pilot.quat);
      followK = 4; lookK = 6;
    } else {
      // chase
      const dyn = followDistance + Math.min(speed * 0.06, 4) + (boosting ? 2 : 0);
      backOffset = new THREE.Vector3(0, 1.8 + Math.min(speed * 0.01, 1.2), -dyn).applyQuaternion(pilot.quat);
      lookOffset = new THREE.Vector3(0, 0, 6).applyQuaternion(pilot.quat);
    }
    desired.current.copy(pilot.pos).add(backOffset);
    lookAt.current.copy(pilot.pos).add(lookOffset);
    // tiny camera shake on boost
    if (boosting) {
      desired.current.x += (Math.random() - 0.5) * 0.08;
      desired.current.y += (Math.random() - 0.5) * 0.08;
    }
    const k = 1 - Math.exp(-dt * followK);
    camera.position.lerp(desired.current, k);
    currentLook.current.lerp(lookAt.current, 1 - Math.exp(-dt * lookK));
    camera.lookAt(currentLook.current);

    // FOV boost on high speed / boost — adds sense of velocity
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.isPerspectiveCamera) {
      if (baseFov.current === null) baseFov.current = cam.fov;
      const target = baseFov.current + Math.min(speed * 0.25, 18) + (boosting ? 8 : 0);
      cam.fov += (target - cam.fov) * (1 - Math.exp(-dt * 5));
      cam.updateProjectionMatrix();
    }
  });
  return null;
};

const Flight: React.FC = () => {
  useFrame((_, dt) => {
    const st = usePilotStore.getState();

    // ---------- THROTTLE (W increases, S decreases, X brake handled in key) ----
    let throttle = st.throttle;
    if (keys['KeyW']) throttle = Math.min(1, throttle + 0.8 * dt);
    if (keys['KeyS']) throttle = Math.max(0, throttle - 0.8 * dt);
    if (throttle !== st.throttle) st.setThrottle(throttle);

    // ---------- ANGULAR INPUT (mouse drag + keys) -----------------------------
    // mouse: pitch from dy, yaw from dx
    const mouseSens = 0.0025;
    const tgtPitch = -mouse.dy * mouseSens / Math.max(dt, 0.0001);
    const tgtYaw   = -mouse.dx * mouseSens / Math.max(dt, 0.0001);
    mouse.dx = 0; mouse.dy = 0;

    const kPitch = (keys['ArrowDown'] ? 1 : 0) - (keys['ArrowUp'] ? 1 : 0);
    const kYaw   = (keys['ArrowLeft'] ? 1 : 0) - (keys['ArrowRight'] ? 1 : 0);
    const kRoll  = (keys['KeyQ'] ? 1 : 0) - (keys['KeyE'] ? 1 : 0);

    // smoothly accelerate angular velocity towards target
    const aimP = kPitch * 2.4 + tgtPitch;
    const aimY = kYaw   * 2.4 + tgtYaw;
    const aimR = kRoll  * 2.6;
    const angK = 1 - Math.exp(-dt * 9);
    pilot.angVel.x += (aimP - pilot.angVel.x) * angK;
    pilot.angVel.y += (aimY - pilot.angVel.y) * angK;
    pilot.angVel.z += (aimR - pilot.angVel.z) * angK;

    const rotQ = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(pilot.angVel.x * dt, pilot.angVel.y * dt, pilot.angVel.z * dt, 'XYZ')
    );
    pilot.quat.multiply(rotQ);
    pilot.quat.normalize();

    // bank into yaw for cinematic feel (auto-roll when turning with mouse/arrows)
    const bankAmount = THREE.MathUtils.clamp(-pilot.angVel.y * 0.35, -0.6, 0.6);
    const localZ = new THREE.Vector3(0, 0, 1).applyQuaternion(pilot.quat);
    const upVec = new THREE.Vector3(0, 1, 0);
    const bankQ = new THREE.Quaternion().setFromAxisAngle(localZ, bankAmount * dt * 2);
    pilot.quat.multiply(bankQ);
    void upVec;

    // ---------- THRUST -------------------------------------------------------
    const strafe = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
    const lift = (keys['Space'] ? 1 : 0) - ((keys['ControlLeft'] || keys['ControlRight']) ? 1 : 0);

    const baseThrust = 60;                       // main engine power
    const boost = st.boosting ? 4.0 : 1;
    const fwdAccel = baseThrust * throttle * boost;
    const lateral = baseThrust * 0.45;

    const accel = new THREE.Vector3(strafe * lateral, lift * lateral, fwdAccel)
      .multiplyScalar(dt)
      .applyQuaternion(pilot.quat);
    pilot.vel.add(accel);

    // ---------- DAMPENER / DRAG ----------------------------------------------
    // inertial dampener: gently align velocity with current forward direction
    if (st.dampener) {
      const fwdDir = new THREE.Vector3(0, 0, 1).applyQuaternion(pilot.quat);
      const fwdSpeed = pilot.vel.dot(fwdDir);
      const lateralVel = pilot.vel.clone().sub(fwdDir.clone().multiplyScalar(fwdSpeed));
      lateralVel.multiplyScalar(Math.exp(-dt * 3.5));
      pilot.vel.copy(fwdDir.multiplyScalar(fwdSpeed)).add(lateralVel);
    }
    // global drag (very small in space, larger when dampener on & throttle low)
    const drag = st.dampener ? (0.4 + (1 - throttle) * 0.8) : 0.08;
    pilot.vel.multiplyScalar(Math.exp(-dt * drag));

    // cap top speed
    const maxV = 220 * (st.boosting ? 2.5 : 1);
    if (pilot.vel.length() > maxV) pilot.vel.setLength(maxV);

    pilot.pos.add(pilot.vel.clone().multiplyScalar(dt));

    // publish speed for HUD (~10x per second is enough)
    st.setVelocityKps(pilot.vel.length());
  });
  return null;
};

export const PilotInScene: React.FC = () => {
  const enabled = usePilotStore(s => s.enabled);
  useEffect(() => { if (enabled) ensureInput(); }, [enabled]);
  if (!enabled) return null;
  return (
    <>
      <Flight />
      <ChaseCamera />
      <PilotShipMesh />
      <HyperStreaks />
    </>
  );
};

// ---------------------------------------------------------------------------
// HUD (DOM)
// ---------------------------------------------------------------------------
export const PilotHUD: React.FC = () => {
  const { enabled, toggle, throttle, setThrottle, boosting, dampener, setDampener, velocityKps, camMode, cycleCam } = usePilotStore();
  useEffect(() => ensureInput(), []);

  return (
    <>
      <button
        onClick={toggle}
        title="Modo Piloto (P)"
        className={`fixed left-1/2 -translate-x-1/2 top-[60px] z-40 px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all
          ${enabled
            ? 'bg-cyan-500 text-white border-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.6)]'
            : 'text-cyan-300 border-cyan-500/40'}`}
          style={enabled ? {} : { background: 'rgba(4,8,20,0.9)' }}
      >
        <Rocket size={14} /> {enabled ? 'PILOTANDO · P p/ sair' : 'MODO PILOTO (P)'}
      </button>

      {enabled && (
        <>
          {/* center crosshair + speed readout */}
          <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border border-cyan-400/70 shadow-[0_0_18px_rgba(34,211,238,0.6)]" />
              <div className="absolute inset-0 m-auto w-1 h-1 bg-cyan-300 rounded-full" />
              <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-14 h-px bg-cyan-400/70" />
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-14 h-px bg-cyan-400/70" />
            </div>
          </div>

          <div className="fixed left-4 bottom-20 z-40 border border-cyan-500/40 rounded-xl p-3 backdrop-blur w-72 text-xs text-cyan-100 shadow-2xl font-mono" style={{ background: 'rgba(2,4,14,0.92)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge size={14} className="text-cyan-300" />
              <span className="font-bold tracking-wider">THROTTLE</span>
              <span className="ml-auto text-[10px] text-cyan-300">{Math.round(throttle * 100)}%</span>
              {boosting && <span className="text-[10px] text-amber-300 animate-pulse flex items-center gap-1"><Zap size={10}/>BOOST</span>}
            </div>
            <input
              type="range" min={0} max={1} step={0.02}
              value={throttle}
              onChange={(e) => setThrottle(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-cyan-300/80">VEL <b className="text-cyan-200">{velocityKps.toFixed(1)}</b> u/s</span>
              <button
                onClick={() => setDampener(!dampener)}
                className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${dampener ? 'bg-cyan-700/40 border-cyan-400/60 text-cyan-100' : 'text-gray-400'}`}
                style={dampener ? {} : { background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' }}
                title="Inertial Dampener (Z)"
              >
                <Anchor size={10}/> DAMPENER {dampener ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-cyan-200/80">
              <div><b className="text-cyan-300">W/S</b> +/- throttle</div>
              <div><b className="text-cyan-300">A/D</b> strafe lateral</div>
              <div><b className="text-cyan-300">␣ / Ctrl</b> subir / descer</div>
              <div><b className="text-cyan-300">Q/E</b> roll esquerda/direita</div>
              <div><b className="text-cyan-300">↑↓ ←→</b> pitch / yaw</div>
              <div><b className="text-cyan-300">Mouse R</b> arrastar p/ olhar</div>
              <div><b className="text-cyan-300">Roda</b> ajuste fino throttle</div>
              <div><b className="text-cyan-300">Shift</b> turbo · <b className="text-cyan-300">X</b> freio</div>
              <div className="col-span-2"><b className="text-cyan-300">Z</b> dampener · <b className="text-cyan-300">V</b> câmera · <b className="text-cyan-300">P</b> sair</div>
            </div>
            <button
              onClick={cycleCam}
              className="mt-2 w-full text-[10px] py-1 rounded text-cyan-200 border border-cyan-500/30 flex items-center justify-center gap-1 transition-all hover:brightness-125"
              style={{ background: 'rgba(6,182,212,0.08)' }}
              title="Alternar câmera (V)"
            >
              <Camera size={11}/> CÂMERA: <b className="uppercase">{camMode}</b>
            </button>
          </div>
        </>
      )}
    </>
  );
};
