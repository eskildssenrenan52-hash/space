import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, Galaxy, Star, Planet, Ship, Vector3, vec3ToThree } from './gameStore';
import { useColonyStore } from './colonyStore';
import { PilotInScene, usePilotStore } from './PilotMode';
import { NebulaClouds, GalaxyHyperlanes, DustMotes, SupernovaFlashes } from './GalaxyFX';

// ============================================================================
// Reusable immersive helpers (fresnel atmosphere, procedural cloud/surface,
// nebula backdrop) — pure three, client-only inside <Canvas>.
// ============================================================================

const ATMO_VERT = `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const ATMO_FRAG = `
uniform vec3 uColor;
uniform float uPower;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), uPower);
  gl_FragColor = vec4(uColor, rim);
}`;

const Atmosphere: React.FC<{ radius: number; color: string; power?: number; opacity?: number }> = ({ radius, color, power = 3.0, opacity = 1 }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: ATMO_VERT,
    fragmentShader: ATMO_FRAG,
    uniforms: { uColor: { value: new THREE.Color(color) }, uPower: { value: power } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  }), [color, power]);
  return (
    <mesh scale={[radius, radius, radius]}>
      <sphereGeometry args={[1, 48, 48]} />
      <primitive object={mat} attach="material" opacity={opacity} />
    </mesh>
  );
};

let _surfaceCache: Record<string, THREE.Texture> = {};
function surfaceTexture(color: string, kind: 'land' | 'cloud'): THREE.Texture {
  const key = color + kind;
  if (_surfaceCache[key]) return _surfaceCache[key];
  const size = 256;
  const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d')!;
  const base = new THREE.Color(color);
  if (kind === 'cloud') {
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 6 + Math.random() * 26;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    ctx.fillStyle = `#${base.getHexString()}`; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * size, y = Math.random() * size, r = 1 + Math.random() * 9;
      const shade = (Math.random() - 0.5) * 0.5;
      const c = base.clone().offsetHSL(0, (Math.random() - 0.5) * 0.1, shade);
      ctx.fillStyle = `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},0.5)`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  _surfaceCache[key] = tex;
  return tex;
}

const NebulaBackground: React.FC = () => {
  const tex = useMemo(() => {
    const size = 512;
    const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, size, size);
    const blobs = [['#1b2a6b', 0.5], ['#3b1f5e', 0.4], ['#0a3a4a', 0.35], ['#5e1f3f', 0.3]] as const;
    blobs.forEach(([col]) => {
      for (let i = 0; i < 6; i++) {
        const x = Math.random() * size, y = Math.random() * size, r = 60 + Math.random() * 160;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, col + '88'); g.addColorStop(1, col + '00');
        ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      }
    });
    const t = new THREE.CanvasTexture(cv);
    return t;
  }, []);
  return (
    <mesh scale={[900, 900, 900]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
};

// Galaxy Mesh Component
const GalaxyMesh: React.FC<{ galaxy: Galaxy; selected: boolean; onClick: () => void }> = ({ galaxy, selected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.rotation.y += 0.001;
    }
  });

  const color = new THREE.Color(galaxy.color);

  return (
    <group position={[galaxy.position.x / 10, galaxy.position.y / 10, galaxy.position.z / 10]}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[galaxy.size / 10, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Core */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={galaxy.explored ? color : '#666666'}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[galaxy.size / 10 + 1, galaxy.size / 10 + 1.5, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, galaxy.size / 10 + 2, 0]} center distanceFactor={10}>
        <div className="bg-black/80 px-2 py-1 rounded text-white text-xs whitespace-nowrap">
          {galaxy.name}
          {galaxy.id === 'galaxy_0' && <span className="text-green-400 ml-1">(ORIGIN)</span>}
        </div>
      </Html>
    </group>
  );
};

// Star Mesh Component
const StarMesh: React.FC<{ star: Star; selected: boolean; onClick: () => void }> = ({ star, selected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const color = new THREE.Color(star.color);

  return (
    <group position={[star.position.x, star.position.y, star.position.z]}>
      {/* Point Light */}
      <pointLight ref={lightRef} color={color} intensity={2} distance={30} />

      {/* Star mesh */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[star.size * 0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Glow */}
      <mesh>
        <sphereGeometry args={[star.size * 0.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[star.size * 0.8, star.size, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

// Planet Mesh Component
const PlanetMesh: React.FC<{ planet: Planet; selected: boolean; onClick: () => void; orbitCenter: Vector3 }> =
  ({ planet, selected, onClick, orbitCenter }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
      if (groupRef.current) {
        groupRef.current.rotation.y = planet.angle;
      }
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
    });

    const position = useMemo(() => {
      const x = orbitCenter.x + Math.cos(planet.angle) * planet.orbitRadius;
      const z = orbitCenter.z + Math.sin(planet.angle) * planet.orbitRadius;
      return new THREE.Vector3(x, orbitCenter.y, z);
    }, [orbitCenter, planet.angle, planet.orbitRadius]);

    const color = new THREE.Color(planet.color);

    return (
      <group ref={groupRef} position={[orbitCenter.x, orbitCenter.y, orbitCenter.z]}>
        {/* Orbit line */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>

        {/* Planet */}
        <mesh ref={meshRef} position={[Math.cos(planet.angle) * planet.orbitRadius, 0, Math.sin(planet.angle) * planet.orbitRadius]} onClick={onClick}>
          <sphereGeometry args={[planet.size * 0.5, 32, 32]} />
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Atmosphere */}
        {planet.atmosphere && (
          <mesh position={[Math.cos(planet.angle) * planet.orbitRadius, 0, Math.sin(planet.angle) * planet.orbitRadius]}>
            <sphereGeometry args={[planet.size * 0.55, 16, 16]} />
            <meshBasicMaterial
              color={planet.atmosphereType === 'toxic' ? '#9B59B6' : '#87CEEB'}
              transparent
              opacity={0.2}
            />
          </mesh>
        )}

        {/* Rings */}
        {planet.rings && (
          <mesh
            rotation={[Math.PI / 3, 0, 0]}
            position={[Math.cos(planet.angle) * planet.orbitRadius, 0, Math.sin(planet.angle) * planet.orbitRadius]}
          >
            <ringGeometry args={[planet.size * 0.7, planet.size * 1.2, 32]} />
            <meshBasicMaterial color="#D2B48C" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Selection ring */}
        {selected && (
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            position={[Math.cos(planet.angle) * planet.orbitRadius, 0, Math.sin(planet.angle) * planet.orbitRadius]}
          >
            <ringGeometry args={[planet.size * 0.6, planet.size * 0.7, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={1} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Colony indicator */}
        {planet.colonies.length > 0 && (
          <mesh position={[Math.cos(planet.angle) * planet.orbitRadius, planet.size * 0.7, Math.sin(planet.angle) * planet.orbitRadius]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        )}
      </group>
    );
  };

// Ship Mesh Component
const ShipMesh: React.FC<{ ship: Ship; selected: boolean; onClick: () => void }> = ({ ship, selected, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slight hover animation
      groupRef.current.position.y = ship.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const color = new THREE.Color(ship.inTransit ? '#00BFFF' : '#4A90D9');

  return (
    <group ref={groupRef} position={[ship.position.x, ship.position.y, ship.position.z]}>
      {/* Main body */}
      <mesh onClick={onClick}>
        <coneGeometry args={[ship.size * 0.3, ship.size, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Wings */}
      <mesh position={[ship.size * 0.3, -ship.size * 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[ship.size * 0.4, ship.size * 0.1, ship.size * 0.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-ship.size * 0.3, -ship.size * 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[ship.size * 0.4, ship.size * 0.1, ship.size * 0.2]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Engine glow */}
      {ship.inTransit && (
        <mesh position={[0, -ship.size * 0.6, 0]}>
          <coneGeometry args={[ship.size * 0.2, ship.size * 0.5, 8]} />
          <meshBasicMaterial color="#00BFFF" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ship.size * 0.8, ship.size, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, ship.size + 0.5, 0]} center distanceFactor={10}>
        <div className="bg-black/80 px-2 py-1 rounded text-white text-xs whitespace-nowrap">
          {ship.name}
        </div>
      </Html>
    </group>
  );
};

// Camera Controller — smooth lerp to target instead of snapping.
const CameraController: React.FC = () => {
  const { camera } = useThree();
  const { currentView, selectedStar, selectedPlanet, selectedGalaxy, selectedShip } = useGameStore();
  const pilotEnabled = usePilotStore(s => s.enabled);

  const desiredPos = useRef(new THREE.Vector3(0, 200, 600));
  const desiredLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const target = new THREE.Vector3(0, 0, 0);
    if (currentView === 'galaxy' && selectedGalaxy) {
      target.set(selectedGalaxy.position.x / 10, selectedGalaxy.position.y / 10, selectedGalaxy.position.z / 10);
      desiredPos.current.set(target.x + 30, target.y + 20, target.z + 30);
    } else if (currentView === 'system' && selectedStar) {
      target.set(selectedStar.position.x, selectedStar.position.y, selectedStar.position.z);
      desiredPos.current.set(target.x + 8, target.y + 14, target.z + 22);
    } else if (currentView === 'planet' && selectedPlanet) {
      // approach from a tilted angle for a cinematic close-up
      desiredPos.current.set(6.5, 3.2, 7.5);
    } else if (currentView === 'ship' && selectedShip) {
      desiredPos.current.set(selectedShip.position.x + 5, selectedShip.position.y + 3, selectedShip.position.z + 5);
    }
    desiredLook.current.copy(target);
  }, [currentView, selectedStar, selectedPlanet, selectedGalaxy, selectedShip]);

  useFrame((_, dt) => {
    if (pilotEnabled) return; // chase camera takes over
    const k = 1 - Math.exp(-dt * 3.2); // critically-damped feel, framerate-independent
    camera.position.lerp(desiredPos.current, k);
    currentLook.current.lerp(desiredLook.current, k);
    camera.lookAt(currentLook.current);
  });

  return null;
};

// Main Galaxy Scene
export const GalaxyScene: React.FC = () => {
  const { galaxies, selectedGalaxy, selectGalaxy, currentView, setCurrentView, selectStar } = useGameStore();
  const pilotEnabled = usePilotStore(s => s.enabled);

  if (currentView !== 'galaxy') return null;

  return (
    <>
      <CameraController />
      <NebulaBackground />
      <Stars radius={300} depth={100} count={6000} factor={4} fade speed={0.5} />
      <NebulaClouds count={14} radius={420} scale={220} seed={42} />
      <GalaxyHyperlanes scale={0.1} />
      <SupernovaFlashes count={4} radius={500} />
      <DustMotes count={500} spread={420} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#88aaff" distance={400} />

      {galaxies.slice(0, 20).map(galaxy => (
        <GalaxyMesh
          key={galaxy.id}
          galaxy={galaxy}
          selected={selectedGalaxy?.id === galaxy.id}
          onClick={() => {
            selectGalaxy(galaxy);
            setCurrentView('system');
          }}
        />
      ))}

      <OrbitControls
        enabled={!pilotEnabled}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={12000}
        minDistance={0.5}
        zoomSpeed={1.4}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
};

// System Scene
export const SystemScene: React.FC = () => {
  const { stars, selectedStar, selectedPlanet, selectStar, selectPlanet, setCurrentView, currentView } = useGameStore();
  const pilotEnabled = usePilotStore(s => s.enabled);

  if (currentView !== 'system') return null;

  const displayedStars = stars.slice(0, 50);

  return (
    <>
      <CameraController />
      <NebulaBackground />
      <Stars radius={200} depth={50} count={4000} factor={3} fade />
      <NebulaClouds count={8} radius={260} scale={140} seed={7} />
      <SupernovaFlashes count={2} radius={260} />
      <DustMotes count={260} spread={200} />
      <ambientLight intensity={0.2} />

      {displayedStars.map(star => (
        <group key={star.id}>
          <StarMesh
            star={star}
            selected={selectedStar?.id === star.id}
            onClick={() => selectStar(star)}
          />
          {star.planets.slice(0, 8).map(planet => (
            <PlanetMesh
              key={planet.id}
              planet={planet}
              selected={selectedPlanet?.id === planet.id}
              onClick={() => {
                selectPlanet(planet);
                setCurrentView('planet');
              }}
              orbitCenter={star.position}
            />
          ))}
        </group>
      ))}

      <OrbitControls
        enabled={!pilotEnabled}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={4000}
        minDistance={0.3}
        zoomSpeed={1.6}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
};

// Planet Scene (close-up)
const PlanetGlobe: React.FC<{ planet: Planet }> = ({ planet }) => {
  const surfRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const surf = useMemo(() => surfaceTexture(planet.color, 'land'), [planet.color]);
  const clouds = useMemo(() => surfaceTexture(planet.color, 'cloud'), [planet.color]);
  const colonized = planet.colonies.length > 0;

  useFrame((_, dt) => {
    if (surfRef.current) surfRef.current.rotation.y += dt * 0.04;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.06;
  });

  const atmoColor = planet.atmosphereType === 'toxic' ? '#b06bd6'
    : planet.type === 'ocean' || planet.type === 'terrestrial' ? '#7ec8ff'
    : planet.type === 'lava' ? '#ff7a4d' : '#9fd0ff';

  return (
    <group>
      <mesh ref={surfRef}>
        <sphereGeometry args={[3, 96, 96]} />
        <meshStandardMaterial
          map={surf}
          color={planet.color}
          roughness={planet.type === 'ocean' ? 0.35 : 0.85}
          metalness={planet.type === 'lava' ? 0.4 : 0.05}
          emissive={planet.type === 'lava' ? '#ff5722' : colonized ? '#ffcc66' : '#000000'}
          emissiveIntensity={planet.type === 'lava' ? 0.5 : colonized ? 0.12 : 0}
        />
      </mesh>

      {/* cloud layer */}
      {planet.atmosphere && (
        <mesh ref={cloudRef} scale={[1.02, 1.02, 1.02]}>
          <sphereGeometry args={[3, 64, 64]} />
          <meshStandardMaterial map={clouds} transparent opacity={0.45} depthWrite={false} />
        </mesh>
      )}

      {/* fresnel atmosphere rim */}
      {planet.atmosphere && <Atmosphere radius={3.35} color={atmoColor} power={3.2} />}
      <Atmosphere radius={3.7} color={atmoColor} power={5.0} />
    </group>
  );
};

export const PlanetScene: React.FC = () => {
  const { selectedPlanet, showShipInterior, currentView } = useGameStore();
  const setViewingCity = useColonyStore(s => s.setViewingCity);
  const cities = useColonyStore(s => s.cities);

  if (showShipInterior || !selectedPlanet || currentView !== 'planet') return null;

  return (
    <>
      <NebulaBackground />
      <Stars radius={120} depth={50} count={3000} factor={3} fade />
      <ambientLight intensity={0.25} />
      <directionalLight position={[12, 6, 8]} intensity={2.4} color="#fff4e0" />
      <pointLight position={[-10, -4, -6]} intensity={0.5} color="#3a6ea5" />

      <PlanetGlobe planet={selectedPlanet} />

      {/* Rings */}
      {selectedPlanet.rings && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[4, 6, 96]} />
          <meshBasicMaterial color="#D2B48C" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Colony markers — click to enter the 3D city */}
      {selectedPlanet.colonies.map((colony, i) => {
        const angle = i * 2.2;
        const px = Math.cos(angle) * 2.6, pz = Math.sin(angle) * 2.6;
        const hasCity = !!cities[colony.id];
        return (
          <group key={colony.id} position={[px, 0.6, pz]}>
            <mesh>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={1.5} />
            </mesh>
            <Html center distanceFactor={6}>
              <button
                onClick={() => hasCity && setViewingCity(colony.id)}
                className="bg-black/80 hover:bg-cyan-700/80 px-2 py-1 rounded text-white text-xs whitespace-nowrap border border-cyan-500/40"
              >
                🏙️ {colony.name}{hasCity ? ' · Ver 3D' : ''}
              </button>
            </Html>
          </group>
        );
      })}

      <OrbitControls enablePan={false} enableZoom enableRotate maxDistance={40} minDistance={3.1} zoomSpeed={1.5} enableDamping dampingFactor={0.08} autoRotate autoRotateSpeed={0.25} />
    </>
  );
};

// Ships Scene
export const ShipsScene: React.FC = () => {
  const { playerShips, selectedShip, selectShip, showShipInterior, currentView } = useGameStore();
  const pilotEnabled = usePilotStore(s => s.enabled);

  if (showShipInterior || currentView === 'galaxy') return null;

  return (
    <>
      <Stars radius={100} depth={30} count={1000} factor={2} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {playerShips.map(ship => (
        <ShipMesh
          key={ship.id}
          ship={ship}
          selected={selectedShip?.id === ship.id}
          onClick={() => selectShip(ship)}
        />
      ))}

      <OrbitControls
        enabled={!pilotEnabled}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={300}
        minDistance={0.4}
        zoomSpeed={1.4}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
};

// Main 3D Canvas Wrapper
export const GameCanvas3D: React.FC = () => {
  const { currentView, showShipInterior } = useGameStore();

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 200, 600], fov: 60, near: 0.1, far: 20000 }}
        style={{ background: '#000005' }}
      >
        <React.Suspense fallback={null}>
          <GalaxyScene />
          <SystemScene />
          <PlanetScene />
          <ShipsScene />
          <PilotInScene />
        </React.Suspense>
      </Canvas>
    </div>
  );
};
