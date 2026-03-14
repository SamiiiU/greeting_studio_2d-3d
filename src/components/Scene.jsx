/**
 * Scene.jsx
 * Root 3D scene — establishes lighting, environment, and floating particle
 * background. All 3D objects (cubes, spheres) are rendered as children.
 */
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Float } from '@react-three/drei'
import * as THREE from 'three'

// ── Ambient floating particles (gold dust) ────────────────────────────────
function GoldParticles({ count = 80 }) {
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [count])

  const speeds = useMemo(
    () => Array.from({ length: count }, () => (Math.random() * 0.3 + 0.1)),
    [count]
  )

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      // Gentle float upward, wrap around
      pos.array[i * 3 + 1] += speeds[i] * 0.003
      if (pos.array[i * 3 + 1] > 7) pos.array[i * 3 + 1] = -7
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#fbbf24"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  )
}

// ── Crescent moon decoration ──────────────────────────────────────────────
function CrescentDecor() {
  return (
    <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.3}>
      <mesh position={[-7, 3, -5]} rotation={[0, 0.3, 0.2]}>
        {/* Crescent = big sphere minus small offset sphere (using scale trick) */}
        <torusGeometry args={[0.7, 0.18, 16, 64, Math.PI * 1.3]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
    </Float>
  )
}

export default function Scene({ children }) {
  return (
    <>
      {/* ── Lighting ───────────────────────────────────────────────────── */}
      <ambientLight intensity={0.35} color="#b8a4e8" />

      {/* Main warm key light */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.8}
        color="#fff4d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Cool fill from below-left */}
      <directionalLight position={[-6, -3, 4]} intensity={0.4} color="#4a2d8a" />

      {/* Gold spotlight for drama */}
      <spotLight
        position={[0, 10, 2]}
        angle={0.35}
        penumbra={0.6}
        intensity={2.5}
        color="#fde68a"
        castShadow
      />

      {/* ── Background effects ─────────────────────────────────────────── */}
      <color attach="background" args={['#08080e']} />
      <fog attach="fog" args={['#08080e', 18, 38]} />

      <Stars radius={60} depth={40} count={3000} factor={2} fade speed={0.5} />
      <GoldParticles />
      <CrescentDecor />

      {/* ── Scene objects (cubes, spheres) ─────────────────────────────── */}
      {children}
    </>
  )
}
