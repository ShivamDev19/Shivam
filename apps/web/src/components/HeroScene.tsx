'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

export type Tier = 'low' | 'mid' | 'high';
// Geometry detail, DPR cap and animation speed per device class.
const Q = { low: { tube: 96, radial: 10, dpr: 1.25, speed: 0.6, fov: 50 }, mid: { tube: 160, radial: 16, dpr: 1.5, speed: 0.8, fov: 46 }, high: { tube: 256, radial: 24, dpr: 2, speed: 1, fov: 45 } };

function Knot({ tier, reduced }: { tier: Tier; reduced: boolean }) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const { viewport } = useThree();
  const q = Q[tier];
  const scale = Math.min(1.1, Math.max(0.7, Math.min(viewport.width, viewport.height) / 4.4));
  useFrame((s, dt) => {
    if (reduced) return;
    if (mesh.current) mesh.current.rotation.y += dt * 0.22 * q.speed;
    if (group.current) {
      const k = Math.min(1, dt * 2.5);
      group.current.rotation.x += (s.pointer.y * -0.35 - group.current.rotation.x) * k;
      group.current.rotation.y += (s.pointer.x * 0.45 - group.current.rotation.y) * k;
    }
  });
  return (
    <group ref={group} scale={scale}>
      <Float speed={reduced ? 0 : 1.2 * q.speed} rotationIntensity={0.15} floatIntensity={0.6}>
        <mesh ref={mesh} rotation={[0.5, 0, 0.2]}>
          <torusKnotGeometry args={[1, 0.3, q.tube, q.radial, 2, 3]} />
          <meshStandardMaterial color="#14151b" metalness={0.92} roughness={0.22} />
        </mesh>
        {tier !== 'low' && (
          <mesh rotation={[0.5, 0, 0.2]} scale={1.04}>
            <torusKnotGeometry args={[1, 0.3, 120, 8, 2, 3]} />
            <meshBasicMaterial color="#6f86ff" wireframe transparent opacity={0.18} />
          </mesh>
        )}
      </Float>
    </group>
  );
}

export default function HeroScene({ tier, reduced }: { tier: Tier; reduced: boolean }) {
  const q = Q[tier];
  return (
    <Canvas
      dpr={[1, q.dpr]}
      camera={{ position: [0, 0, 6], fov: q.fov }}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ touchAction: 'pan-y' }}
      aria-hidden
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 4, 5]} intensity={3} color="#7f93ff" />
      <directionalLight position={[-5, -3, 2]} intensity={2.2} color="#ffb347" />
      <Knot tier={tier} reduced={reduced} />
    </Canvas>
  );
}
