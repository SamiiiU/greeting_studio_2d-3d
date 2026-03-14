/**
 * Cube.jsx
 * Renders a cube built from SIX SEPARATE PlaneGeometry meshes (one per face)
 * grouped together. When clicked, GSAP blasts each face outward from the
 * cube centre, then fades out, revealing the 3D text inside.
 *
 * Why six planes instead of BoxGeometry?
 * BoxGeometry is a single mesh — we can't move its individual faces independently.
 * By using 6 PlaneGeometry meshes positioned/rotated to form a box, we can
 * animate each face as its own object and blast them outward.
 */
import React, { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import TextReveal from './TextReveal'

// ── Materials — one per face so each can be individually faded ────────────
function useCubeMaterials() {
  return useMemo(() => {
    const colors = [
      '#fbbf24', '#f59e0b', '#7c3aed', '#6d28d9', '#a78bfa', '#8b5cf6',
    ]
    return colors.map(c =>
      new THREE.MeshStandardMaterial({
        color: c,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      })
    )
  }, [])
}

// ── Individual face config ─────────────────────────────────────────────────
// Each face: [translation offset relative to cube centre (half-width), euler rotation,
//             blast direction (unit vector multiplied by blast distance)]
function getFaceConfigs(hw, hh, hd) {
  return [
    // right (+X)
    { pos: [hw, 0, 0],  rot: [0, Math.PI / 2, 0],  blast: [1, 0, 0] },
    // left  (-X)
    { pos: [-hw, 0, 0], rot: [0, -Math.PI / 2, 0], blast: [-1, 0, 0] },
    // top   (+Y)
    { pos: [0, hh, 0],  rot: [-Math.PI / 2, 0, 0], blast: [0, 1, 0] },
    // bottom(-Y)
    { pos: [0, -hh, 0], rot: [Math.PI / 2, 0, 0],  blast: [0, -1, 0] },
    // front (+Z)
    { pos: [0, 0, hd],  rot: [0, 0, 0],             blast: [0, 0, 1] },
    // back  (-Z)
    { pos: [0, 0, -hd], rot: [0, Math.PI, 0],       blast: [0, 0, -1] },
  ]
}

export default function Cube({ position, width, height }) {
  const groupRef = useRef()        // entire cube group (for rotation)
  const faceRefs = useRef([])      // ref array, one per face mesh
  const lastTouchTapRef = useRef(0)
  const [blasted, setBlasted] = useState(false)
  const [showText, setShowText] = useState(false)

  // World-unit dimensions (pixel sizes already converted by parent)
  const w = width, h = height, d = width  // depth = width (square face)
  const hw = w / 2, hh = h / 2, hd = d / 2

  const materials = useCubeMaterials() // eslint-disable-line

  const faceConfigs = useMemo(() => getFaceConfigs(hw, hh, hd), [hw, hh, hd])

  // ── Auto-rotation ──────────────────────────────────────────────────────────
  useFrame(() => {
    if (groupRef.current && !blasted) {
      groupRef.current.rotation.y += 0.004
      groupRef.current.rotation.x += 0.001
    }
  })

  // ── Blast animation ────────────────────────────────────────────────────────
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (blasted) return
    setBlasted(true)

    // Stop rotation by removing useFrame participation (handled by blasted flag)
    const BLAST_DIST = Math.max(w, h, d) * 2.5

    const tl = gsap.timeline({
      onComplete: () => setShowText(true),
    })

    faceRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const dir = faceConfigs[i].blast

      // Move outward
      tl.to(mesh.position, {
        x: mesh.position.x + dir[0] * BLAST_DIST,
        y: mesh.position.y + dir[1] * BLAST_DIST,
        z: mesh.position.z + dir[2] * BLAST_DIST,
        duration: 0.9,
        ease: 'power3.out',
      }, 0) // all at t=0 → simultaneous blast

      // Slight random spin per face for drama
      tl.to(mesh.rotation, {
        x: mesh.rotation.x + (Math.random() - 0.5) * Math.PI,
        y: mesh.rotation.y + (Math.random() - 0.5) * Math.PI,
        duration: 0.9,
        ease: 'power2.out',
      }, 0)

      // Fade out each face
      tl.to(mesh.material, {
        opacity: 0,
        duration: 0.5,
        ease: 'power1.in',
      }, 0.4)
    })

    // Also stop parent group rotation abruptly
    if (groupRef.current) {
      gsap.to(groupRef.current.rotation, {
        x: 0, y: 0, z: 0,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  }, [blasted, faceConfigs, w, h, d])

  // ── Hover glow effect ──────────────────────────────────────────────────────
  const handlePointerOver = useCallback(() => {
    if (blasted) return
    faceRefs.current.forEach(m => {
      if (m?.material) m.material.emissive = new THREE.Color(0x332200)
    })
    document.body.style.cursor = 'pointer'
  }, [blasted])

  const handlePointerOut = useCallback(() => {
    faceRefs.current.forEach(m => {
      if (m?.material) m.material.emissive = new THREE.Color(0x000000)
    })
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
          {/* Six individual face planes */}
          {faceConfigs.map((cfg, i) => (
            <mesh
              key={i}
              ref={el => (faceRefs.current[i] = el)}
              position={cfg.pos}
              rotation={cfg.rot}
              material={materials[i]}
              onPointerDown={handlePointerDown}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              {/* Use the matching dimension pair for each face */}
              <planeGeometry args={
                i < 2 ? [d, h]  // left/right face: depth × height
                : i < 4 ? [w, d] // top/bottom face: width × depth
                : [w, h]          // front/back face: width × height
              } />
            </mesh>
          ))}

          {/* Soft inner glow orb */}
          <mesh>
            <sphereGeometry args={[Math.min(hw, hh, hd) * 0.6, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.15}
              transparent
              opacity={0.08}
            />
          </mesh>
        </>
      )}

      {/* 3D text after blast */}
      {showText && <TextReveal position={[0, 0, 0]} />}
    </group>
  )
}
