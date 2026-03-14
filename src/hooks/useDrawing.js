/**
 * useDrawing.js
 * Manages the state for the 2D rubber-band drawing overlay.
 * Tracks mouse-down origin, current drag position, and the final
 * committed shape so App can convert it to a 3D object.
 */
import { useState, useCallback } from 'react'

const INITIAL_DRAW = {
  isDrawing: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
}

export function useDrawing() {
  const [drawState, setDrawState] = useState(INITIAL_DRAW)
  // The last committed shape; consumed by App to spawn a 3D object
  const [committedShape, setCommittedShape] = useState(null)

  /** Called on canvas mousedown — records the anchor point */
  const startDraw = useCallback((x, y) => {
    setDrawState({ isDrawing: true, startX: x, startY: y, currentX: x, currentY: y })
  }, [])

  /** Called on mousemove — updates the live drag endpoint */
  const updateDraw = useCallback((x, y) => {
    setDrawState(prev => prev.isDrawing ? { ...prev, currentX: x, currentY: y } : prev)
  }, [])

  /**
   * Called on mouseup — finalises the shape.
   * Returns the shape descriptor or null if the drag was too small.
   */
  const endDraw = useCallback((tool) => {
    setDrawState(prev => {
      if (!prev.isDrawing) return prev

      const dx = prev.currentX - prev.startX
      const dy = prev.currentY - prev.startY
      const w = Math.abs(dx)
      const h = Math.abs(dy)
      const r = Math.sqrt(dx * dx + dy * dy)

      // Ignore tiny accidental clicks (< 10px)
      if (w < 10 && h < 10) return { ...INITIAL_DRAW }

      const shape =
        tool === 'square'
          ? {
              type: 'square',
              // normalised origin at top-left
              x: Math.min(prev.startX, prev.currentX),
              y: Math.min(prev.startY, prev.currentY),
              // centre of the drawn rect (used for 3D placement)
              centerX: prev.startX + dx / 2,
              centerY: prev.startY + dy / 2,
              width: w,
              height: h,
            }
          : {
              type: 'circle',
              centerX: prev.startX,
              centerY: prev.startY,
              radius: r,
            }

      setCommittedShape(shape)
      return { ...INITIAL_DRAW }
    })
  }, [])

  /** Clears the committed shape after it has been consumed */
  const clearCommitted = useCallback(() => setCommittedShape(null), [])

  return { drawState, committedShape, startDraw, updateDraw, endDraw, clearCommitted }
}
