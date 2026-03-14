/**
 * Sphere.jsx
 * Renders a sphere that, when clicked, triggers an expanding bloom-burst:
 * - The outer shell scales outward and fades out (like an explosion)
 * - An inner burst ring radiates outward
 * - The 3D text reveals at the sphere's centre
 *
 * The sphere is built as two shells (outer + inner glow) so we have
 * separate objects to animate independently for a layered effect.
 */
import React, { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import TextReveal from './TextReveal'

// Thin ring mesh surrounding the sphere to act as a burst halo
function BurstRing({ radius, visible }) {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (meshRef.current && visible) {
      meshRef.current.rotation.z = clock.elapsedTime * 0.5
      meshRef.current.rotation.x = clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={meshRef} visible={visible}>
      <torusGeometry args={[radius * 1.15, 0.02, 8, 64]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#fbbf24"
        emissiveIntensity={1.2}
        transparent
        opacity={0.4}
      />
    </mesh>
  )
}

export default function Sphere({ position, radius }) {
  const outerRef = useRef()
  const innerRef = useRef()
  const ringRef = useRef()
  const groupRef = useRef()
  const lastTouchTapRef = useRef(0)
  const [blasted, setBlasted] = useState(false)
  const [showText, setShowText] = useState(false)

  // ── Auto-rotation ──────────────────────────────────────────────────────────
  useFrame(() => {
    if (groupRef.current && !blasted) {
      groupRef.current.rotation.y += 0.005
      groupRef.current.rotation.x += 0.002
    }
  })

  // ── Blast / bloom animation ────────────────────────────────────────────────
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (blasted) return
    setBlasted(true)

    const tl = gsap.timeline({ onComplete: () => setShowText(true) })

    // Stop rotation
    if (groupRef.current) {
      gsap.to(groupRef.current.rotation, { x: 0, y: 0, duration: 0.15, ease: 'power2.out' })
    }

    // Outer shell: expand + fade
    if (outerRef.current) {
      tl.to(outerRef.current.scale, {
        x: 3.5, y: 3.5, z: 3.5,
        duration: 1.0,
        ease: 'power3.out',
      }, 0)
      tl.to(outerRef.current.material, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
      }, 0.1)
    }

    // Inner shell: smaller faster bloom
    if (innerRef.current) {
      tl.to(innerRef.current.scale, {
        x: 5, y: 5, z: 5,
        duration: 0.7,
        ease: 'expo.out',
      }, 0)
      tl.to(innerRef.current.material, {
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
      }, 0)
    }

    // Ring halo: expand and fade outward
    if (ringRef.current) {
      tl.to(ringRef.current.scale, {
        x: 6, y: 6, z: 6,
        duration: 1.1,
        ease: 'power2.out',
      }, 0)
      tl.to(ringRef.current.material, {
        opacity: 0,
        duration: 0.9,
        ease: 'power1.in',
      }, 0.15)
    }
  }, [blasted])

  const handlePointerOver = useCallback(() => {
    if (blasted) return
    if (outerRef.current?.material) outerRef.current.material.emissive = new THREE.Color(0x221100)
    document.body.style.cursor = 'pointer'
  }, [blasted])

  const handlePointerOut = useCallback(() => {
    if (outerRef.current?.material) outerRef.current.material.emissive = new THREE.Color(0x000000)
    document.body.style.cursor = 'default'
  }, [])

  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === 'touch') {
      const now = performance.now()
      const DOUBLE_TAP_MS = 320
      if (now - lastTouchTapRef.current <= DOUBLE_TAP_MS) {
        handleClick(e)
      }
      lastTouchTapRef.current = now
      return
    }
    handleClick(e)
  }, [handleClick])

  return (
    <group ref={groupRef} position={position}>
      {!showText && (
        <>
          {/* Outer shell */}
          <mesh
            ref={outerRef}
            onPointerDown={handlePointerDown}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial
              color="#7c3aed"
              metalness={0.7}
              roughness={0.2}
              transparent
              opacity={1}
            />
          </mesh>

          {/* Inner glow shell (slightly smaller, emissive) */}
          <mesh ref={innerRef} onPointerDown={handlePointerDown}>
            <sphereGeometry args={[radius * 0.78, 24, 24]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.6}
              transparent
              opacity={0.45}
            />
          </mesh>

          {/* Equatorial halo ring */}
          <mesh ref={ringRef} onPointerDown={handlePointerDown}>
            <torusGeometry args={[radius * 1.1, radius * 0.04, 8, 64]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.8}
              transparent
              opacity={0.55}
            />
          </mesh>
        </>
      )}

      {showText && <TextReveal position={[0, 0, 0]} />}
    </group>
  )
}
