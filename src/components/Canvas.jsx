/**
 * Canvas.jsx
 * Wraps React Three Fiber's <Canvas> and sets up the camera.
 * The camera is fixed in place; we rely on object world-positions
 * derived from the 2D drawing coordinates.
 */
import React, { useRef } from 'react'
import { Canvas as R3FCanvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import Scene from './Scene'

export default function RTFCanvas({ cameraRef, children }) {
  return (
    <R3FCanvas
      shadows
      style={{ position: 'absolute', inset: 0 }}
      camera={{ position: [0, 0, 10], fov: 55, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: 2, // ACESFilmicToneMapping
        toneMappingExposure: 1.1,
        outputColorSpace: 'srgb',
      }}
      onCreated={({ camera }) => {
        // Expose the camera so parent components can do 2D→3D unprojection
        if (cameraRef) cameraRef.current = camera
      }}
    >
      <PerformanceMonitor />
      <Scene>
        {children}
      </Scene>
    </R3FCanvas>
  )
}
