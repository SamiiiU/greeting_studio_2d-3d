/**
 * TextReveal.jsx
 * Renders "Eid Mubarak from Sami" as 3D text using troika-three-text
 * (via @react-three/drei's <Text>).
 *
 * KEY FIX: troika-three-text does NOT expose a .material ref the normal way.
 * The correct way to control opacity is troika's own `fillOpacity` prop.
 * We drive it with React state updated by a GSAP tween so React re-renders
 * the Text with the new opacity value each frame — no material hacking needed.
 */
import React, { useRef, useEffect, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'

export default function TextReveal({ position }) {
  const groupRef = useRef()

  // ── Animated values as React state so troika re-renders correctly ──────────
  const [opacity, setOpacity] = useState(0)   // drives fillOpacity on both texts
  const [scale, setScale] = useState(0.01) // drives group scale

  // GSAP animates plain JS objects; onUpdate pushes values into React state
  useEffect(() => {
    const vals = { opacity: 0, scale: 0.01 }

    const tl = gsap.timeline({ delay: 0.15 })

    // Scale up with a springy ease
    tl.to(vals, {
      scale: 1,
      duration: 0.75,
      ease: 'back.out(1.6)',
      onUpdate: () => setScale(vals.scale),
    })

    // Fade in text (starts same time as scale)
    tl.to(vals, {
      opacity: 1,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: () => setOpacity(vals.opacity),
    }, '<0.1') // slightly after scale starts

    return () => tl.kill()
  }, [])

  // Gentle floating bob on Y axis
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.06
    }
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>

      {/* ── "Eid Mubarak" — main gold title ─────────────────────────── */}
      <Text
        position={[0, 0.42, 0.22]}
        fontWeight={700}
        fontSize={0.70}
        color="#fbbf24"
        fillOpacity={opacity}          // ← troika native opacity prop ✓
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.03}
        outlineWidth={0.014}
        outlineOpacity={opacity}
        outlineBlur={0.004}
        strokeWidth={0.004}
        strokeColor="#fff7d6"
        strokeOpacity={opacity * 0.75}
        textAlign="center"
        maxWidth={7}
      >
        Eid Mubarak
      </Text>

      {/* ── "from Sami" — elegant subtitle ──────────────────────────── */}
      <Text
        position={[0, -0.46, 0.22]}
        fontSize={0.60}
        fontWeight={600}
        color="#e8e4f0"
        fillOpacity={opacity * 0.85}   // ← slightly more subtle than title
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
        textAlign="center"
        maxWidth={7}
        outlineWidth={0.006}
        outlineColor="#2f1b59"
        outlineOpacity={opacity * 0.8}
        strokeWidth={0.0025}
        strokeColor="#ffffff"
        strokeOpacity={opacity * 0.55}
      >
        {'from Sami'}
      </Text>

    </group>
  )
}
