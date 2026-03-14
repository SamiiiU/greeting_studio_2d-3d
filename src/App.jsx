/**
 * App.jsx
 * Root component orchestrating:
 *  1. Toolbar — tool selection
 *  2. DrawingLayer — 2D canvas overlay for rubber-band preview
 *  3. R3FCanvas — Three.js scene
 *  4. Shape state — list of spawned 3D objects
 *
 * Flow:
 *   User picks tool → draws on DrawingLayer overlay →
 *   useDrawing commits shape → App converts pixels to world coords →
 *   Cube or Sphere component is added to scene
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import DrawingLayer from './components/DrawingLayer'
import RTFCanvas from './components/Canvas'
import Cube from './components/Cube'
import Sphere from './components/Sphere'
import { useDrawing } from './hooks/useDrawing'
import { screenToWorld, PIXEL_TO_WORLD } from './utils/geometryUtils'

// ── Intro hint overlay ─────────────────────────────────────────────────────
function IntroHint({ visible }) {
  if (!visible) return null
  return (
    <div className="fade-up" style={{
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 15,
      textAlign: 'center',
      pointerEvents: 'none',
    }}>
      <p style={{
        fontFamily: '"Cinzel Decorative", serif',
        fontSize: '11px',
        letterSpacing: '0.2em',
        color: 'rgba(251,191,36,0.5)',
        textTransform: 'uppercase',
      }}>
        Select a tool above, then drag to draw
      </p>
      <p style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'rgba(232,228,240,0.3)',
        marginTop: '4px',
      }}>
        Click the shape to open your Eid gift ✦
      </p>
    </div>
  )
}

let idCounter = 0
const nextId = () => `obj_${++idCounter}`

export default function App() {
  const [activeTool, setActiveTool] = useState(null)
  const [objects, setObjects]       = useState([])    // spawned 3D objects
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaderExiting, setIsLoaderExiting] = useState(false)
  const [isAppVisible, setIsAppVisible] = useState(false)
  const cameraRef = useRef(null)                       // camera ref for unprojection
  const canvasContainerRef = useRef(null)

  const {
    drawState,
    committedShape,
    startDraw,
    updateDraw,
    endDraw,
    clearCommitted,
  } = useDrawing()

  // ── Convert committed 2D shape → 3D object descriptor ─────────────────
  useEffect(() => {
    if (!committedShape || !cameraRef.current || !canvasContainerRef.current) return

    const cam = cameraRef.current
    const el  = canvasContainerRef.current
    const cw  = el.offsetWidth
    const ch  = el.offsetHeight

    if (committedShape.type === 'square') {
      const worldPos = screenToWorld(committedShape.centerX, committedShape.centerY, cw, ch, cam)
      const wWorld   = committedShape.width  / PIXEL_TO_WORLD
      const hWorld   = committedShape.height / PIXEL_TO_WORLD

      setObjects(prev => [...prev, {
        id: nextId(),
        type: 'cube',
        position: [worldPos.x, worldPos.y, 0],
        width: Math.max(wWorld, 0.4),
        height: Math.max(hWorld, 0.4),
      }])
    } else {
      // circle
      const worldPos  = screenToWorld(committedShape.centerX, committedShape.centerY, cw, ch, cam)
      const rWorld    = committedShape.radius / PIXEL_TO_WORLD

      setObjects(prev => [...prev, {
        id: nextId(),
        type: 'sphere',
        position: [worldPos.x, worldPos.y, 0],
        radius: Math.max(rWorld, 0.25),
      }])
    }

    clearCommitted()
  }, [committedShape, clearCommitted])

  // ── Drawing event handlers ─────────────────────────────────────────────
  const handleMouseDown = useCallback((x, y) => startDraw(x, y), [startDraw])
  const handleMouseMove = useCallback((x, y) => updateDraw(x, y), [updateDraw])
  const handleMouseUp   = useCallback((x, y) => {
    updateDraw(x, y)
    endDraw(activeTool)
  }, [updateDraw, endDraw, activeTool])

  const handleClear = useCallback(() => setObjects([]), [])

  // ── Intro loading screen ───────────────────────────────────────────────
  useEffect(() => {
    let rafId
    let hideTimer
    let revealTimer
    const durationMs = 1900
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min((elapsed / durationMs) * 100, 100)
      setLoadingProgress(progress)

      if (progress < 100) {
        rafId = requestAnimationFrame(tick)
      } else {
        setIsLoaderExiting(true)
        setIsAppVisible(true)
        hideTimer = window.setTimeout(() => setIsLoading(false), 700)
      }
    }

    revealTimer = window.setTimeout(() => {
      rafId = requestAnimationFrame(tick)
    }, 120)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (hideTimer) window.clearTimeout(hideTimer)
      if (revealTimer) window.clearTimeout(revealTimer)
    }
  }, [])

  return (
    <div
      ref={canvasContainerRef}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <div className={`app-stage ${isAppVisible ? 'app-stage-visible' : ''}`}>
        {/* ── Three.js canvas (bottom-most layer) ─────────────────────── */}
        <RTFCanvas cameraRef={cameraRef}>
          {objects.map(obj =>
            obj.type === 'cube' ? (
              <Cube
                key={obj.id}
                position={obj.position}
                width={obj.width}
                height={obj.height}
              />
            ) : (
              <Sphere
                key={obj.id}
                position={obj.position}
                radius={obj.radius}
              />
            )
          )}
        </RTFCanvas>

        {/* ── 2D drawing overlay ──────────────────────────────────────── */}
        <DrawingLayer
          activeTool={activeTool}
          drawState={drawState}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <Toolbar
          activeTool={activeTool}
          onToolChange={tool => setActiveTool(prev => prev === tool ? null : tool)}
          objectCount={objects.length}
          onClear={handleClear}
        />

        {/* ── Intro hint ──────────────────────────────────────────────── */}
        <IntroHint visible={objects.length === 0} />
      </div>

      {isLoading && (
        <div className={`loading-overlay ${isLoaderExiting ? 'loading-overlay-exit' : ''}`}>
          <div className="loading-panel">
            <div className="loading-title">Loading Experience</div>
            <div className="loading-bar-track">
              <div
                className="loading-bar-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
