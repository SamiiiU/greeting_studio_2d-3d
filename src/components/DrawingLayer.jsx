/**
 * DrawingLayer.jsx
 * A transparent HTML5 canvas that sits on top of the Three.js canvas.
 * Captures pointer events for rubber-band shape drawing and renders the
 * live preview. Passes finalised shapes up to the parent via callbacks.
 */
import React, { useRef, useEffect, useCallback } from 'react'

export default function DrawingLayer({
  activeTool,
  drawState,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) {
  const canvasRef = useRef(null)

  // ── Rubber-band preview renderer ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!drawState.isDrawing) return

    const { startX, startY, currentX, currentY } = drawState

    ctx.save()
    ctx.strokeStyle = 'rgba(251,191,36,0.85)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.shadowColor = 'rgba(251,191,36,0.6)'
    ctx.shadowBlur = 8

    if (activeTool === 'square') {
      const x = Math.min(startX, currentX)
      const y = Math.min(startY, currentY)
      const w = Math.abs(currentX - startX)
      const h = Math.abs(currentY - startY)
      ctx.strokeRect(x, y, w, h)

      // Corner accent dots
      ctx.setLineDash([])
      ctx.fillStyle = '#fbbf24'
      ;[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy]) => {
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill()
      })
    } else {
      // Circle tool
      const dx = currentX - startX
      const dy = currentY - startY
      const radius = Math.sqrt(dx * dx + dy * dy)
      ctx.beginPath()
      ctx.arc(startX, startY, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Centre dot
      ctx.setLineDash([])
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath(); ctx.arc(startX, startY, 3, 0, Math.PI * 2); ctx.fill()
    }

    ctx.restore()
  }, [drawState, activeTool])

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const sync = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // ── Event helpers ──────────────────────────────────────────────────────────
  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handlePointerDown = useCallback((e) => {
    if (!activeTool) return
    e.preventDefault()
    if (canvasRef.current?.setPointerCapture) {
      canvasRef.current.setPointerCapture(e.pointerId)
    }
    const { x, y } = pos(e)
    onMouseDown(x, y)
  }, [activeTool, onMouseDown])

  const handlePointerMove = useCallback((e) => {
    if (!drawState.isDrawing) return
    e.preventDefault()
    const { x, y } = pos(e)
    onMouseMove(x, y)
  }, [drawState.isDrawing, onMouseMove])

  const handlePointerUp = useCallback((e) => {
    if (!drawState.isDrawing) return
    e.preventDefault()
    const { x, y } = pos(e)
    onMouseUp(x, y)
    if (canvasRef.current?.releasePointerCapture) {
      canvasRef.current.releasePointerCapture(e.pointerId)
    }
  }, [drawState.isDrawing, onMouseUp])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        cursor: activeTool ? 'crosshair' : 'default',
        touchAction: activeTool ? 'none' : 'auto',
        // Only block pointer events while a tool is active
        pointerEvents: activeTool ? 'all' : 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  )
}
