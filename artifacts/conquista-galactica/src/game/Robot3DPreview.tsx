import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Robot, RobotChassis } from './gameStore';

const ChassisMesh: React.FC<{ chassis: RobotChassis; color: string; height: number }> = ({
  chassis,
  color,
  height,
}) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.4;
  });

  const mat = <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} emissive={color} emissiveIntensity={0.15} />;
  const accent = <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.6} />;

  // Different chassis silhouettes
  switch (chassis) {
    case 'wheeled':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.4, 0]}><boxGeometry args={[1.4, height * 0.6, 1]} />{mat}</mesh>
          <mesh position={[0, height * 0.85, 0]}><sphereGeometry args={[0.35, 16, 16]} />{accent}</mesh>
          {[[-0.7,0.1,0.5],[0.7,0.1,0.5],[-0.7,0.1,-0.5],[0.7,0.1,-0.5]].map((p,i)=>(
            <mesh key={i} position={p as [number,number,number]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.25,0.25,0.2,16]} /><meshStandardMaterial color="#222"/></mesh>
          ))}
        </group>
      );
    case 'tracked':
    case 'tank':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.5, 0]}><boxGeometry args={[1.8, height * 0.4, 1.4]} />{mat}</mesh>
          <mesh position={[0, height * 0.85, 0]}><boxGeometry args={[0.8, 0.4, 0.8]} />{accent}</mesh>
          <mesh position={[0, height * 0.95, 0.6]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 1.2, 8]} /><meshStandardMaterial color="#444"/></mesh>
          <mesh position={[-0.9, 0.2, 0]}><boxGeometry args={[0.3, 0.4, 1.8]} /><meshStandardMaterial color="#111"/></mesh>
          <mesh position={[0.9, 0.2, 0]}><boxGeometry args={[0.3, 0.4, 1.8]} /><meshStandardMaterial color="#111"/></mesh>
        </group>
      );
    case 'biped':
    case 'humanoid':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.9, 0]}><sphereGeometry args={[0.3, 16, 16]} />{mat}</mesh>
          <mesh position={[0, height * 0.55, 0]}><boxGeometry args={[0.7, 0.8, 0.4]} />{mat}</mesh>
          <mesh position={[-0.45, height * 0.55, 0]}><boxGeometry args={[0.2, 0.8, 0.2]} />{mat}</mesh>
          <mesh position={[0.45, height * 0.55, 0]}><boxGeometry args={[0.2, 0.8, 0.2]} />{mat}</mesh>
          <mesh position={[-0.2, height * 0.15, 0]}><boxGeometry args={[0.25, 0.7, 0.25]} />{mat}</mesh>
          <mesh position={[0.2, height * 0.15, 0]}><boxGeometry args={[0.25, 0.7, 0.25]} />{mat}</mesh>
          <mesh position={[0, height * 0.95, 0.25]}><sphereGeometry args={[0.07, 8, 8]} />{accent}</mesh>
        </group>
      );
    case 'quadruped':
    case 'spider':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.5, 0]}><boxGeometry args={[1.4, 0.5, 0.9]} />{mat}</mesh>
          <mesh position={[0, height * 0.8, 0]}><sphereGeometry args={[0.3, 16, 16]} />{accent}</mesh>
          {[[-0.6,0,0.4],[0.6,0,0.4],[-0.6,0,-0.4],[0.6,0,-0.4]].map((p,i)=>(
            <mesh key={i} position={[p[0], height * 0.25, p[2]]}><boxGeometry args={[0.15, 0.5, 0.15]} />{mat}</mesh>
          ))}
        </group>
      );
    case 'hexapod':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.5, 0]}><boxGeometry args={[1.6, 0.4, 0.8]} />{mat}</mesh>
          {Array.from({ length: 6 }).map((_, i) => {
            const side = i % 2 === 0 ? -0.5 : 0.5;
            const z = (Math.floor(i / 2) - 1) * 0.4;
            return <mesh key={i} position={[side, height * 0.25, z]}><boxGeometry args={[0.12, 0.5, 0.12]} />{mat}</mesh>;
          })}
        </group>
      );
    case 'drone_quad':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.5, 0]}><boxGeometry args={[0.6, 0.2, 0.6]} />{mat}</mesh>
          {[[-0.5,0.1,-0.5],[0.5,0.1,-0.5],[-0.5,0.1,0.5],[0.5,0.1,0.5]].map((p,i)=>(
            <group key={i} position={[p[0], height * 0.5, p[2]]}>
              <mesh><cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />{mat}</mesh>
              <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.35, 0.35, 0.02, 16]} /><meshStandardMaterial color="#00d4ff" transparent opacity={0.4}/></mesh>
            </group>
          ))}
        </group>
      );
    case 'drone_fixed':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.5, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.3, 1.6, 12]} />{mat}</mesh>
          <mesh position={[0, height * 0.5, 0]}><boxGeometry args={[0.3, 0.08, 1.6]} />{mat}</mesh>
        </group>
      );
    case 'submarine':
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.5, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.35, 1.2, 8, 16]} />{mat}</mesh>
          <mesh position={[0, height * 0.8, 0]}><boxGeometry args={[0.2, 0.3, 0.4]} />{accent}</mesh>
        </group>
      );
    case 'snake':
      return (
        <group ref={ref}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[(i - 4) * 0.25, height * 0.3, Math.sin(i) * 0.15]}>
              <sphereGeometry args={[0.2, 12, 12]} />{mat}
            </mesh>
          ))}
        </group>
      );
    default:
      return (
        <group ref={ref}>
          <mesh position={[0, height * 0.5, 0]}><boxGeometry args={[1, height, 1]} />{mat}</mesh>
        </group>
      );
  }
};

export const Robot3DPreview: React.FC<{ robot: Pick<Robot, 'chassis' | 'color' | 'height'> }> = ({ robot }) => {
  return (
    <Canvas camera={{ position: [3, 2.5, 4], fov: 50 }} style={{ background: '#0a0f1c' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#00d4ff" />
      <gridHelper args={[6, 12, '#1a2540', '#0f1a30']} />
      <ChassisMesh chassis={robot.chassis} color={robot.color} height={robot.height} />
      <OrbitControls enablePan={false} minDistance={2} maxDistance={10} />
    </Canvas>
  );
};