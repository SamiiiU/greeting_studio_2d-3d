/**
 * geometryUtils.js
 * Pure helper functions for 3D scene math.
 */
import * as THREE from 'three'

/**
 * Convert a 2D canvas pixel coordinate to a 3D world point on the z=0 plane.
 *
 * @param {number} screenX    - pixel x on the canvas element
 * @param {number} screenY    - pixel y on the canvas element
 * @param {number} canvasW    - canvas element width  (offsetWidth)
 * @param {number} canvasH    - canvas element height (offsetHeight)
 * @param {THREE.Camera} cam  - the scene camera
 * @returns {THREE.Vector3}   - world position
 */
export function screenToWorld(screenX, screenY, canvasW, canvasH, cam) {
  // Convert to NDC [-1, 1]
  const ndc = new THREE.Vector3(
    (screenX / canvasW) * 2 - 1,
    -(screenY / canvasH) * 2 + 1,
    0.5,
  )
  // Unproject through the camera frustum
  ndc.unproject(cam)
  const dir = ndc.sub(cam.position).normalize()
  // Intersect with z=0 plane
  const distance = -cam.position.z / dir.z
  return cam.position.clone().addScaledVector(dir, distance)
}

/**
 * Maps the drawn pixel size to a reasonable world-unit scale.
 * Divides pixel dimensions by a calibration constant so a "medium" draw
 * produces a nicely visible object.
 */
export const PIXEL_TO_WORLD = 160 // pixels per world unit
