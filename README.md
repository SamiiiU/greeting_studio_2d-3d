# Eid Greeting 3D App

Interactive Eid greeting experience built with React, Vite, React Three Fiber, Drei, and GSAP.
Users draw shapes on a 2D overlay, those shapes are converted to 3D objects, and clicking objects reveals animated Eid text.

## 1) User Manual

### Start the app
1. Install dependencies:
    ```bash
    npm install
    ```
2. Run development mode:
    ```bash
    npm run dev
    ```
3. Open the URL shown in terminal (usually `http://localhost:5173`).

### Use the app
1. Select a tool from the toolbar:
    - `square` tool creates a Cube.
    - `circle` tool creates a Sphere.
2. Click and drag on the screen to draw.
3. Release mouse to spawn the 3D object.
4. Click the spawned object to play reveal animation.
5. Greeting text appears at the object center.

### Toolbar controls
- Tool select: switch between square/circle drawing.
- Clear: removes all spawned objects.

## 2) Developer Documentation

### Tech stack
- React 18 + Vite 5
- three + @react-three/fiber + @react-three/drei
- gsap for reveal/explosion animations
- troika text via Drei `Text`

### Project structure
```text
src/
   App.jsx
   main.jsx
   index.css
   components/
      Canvas.jsx
      Scene.jsx
      Toolbar.jsx
      DrawingLayer.jsx
      Cube.jsx
      Sphere.jsx
      TextReveal.jsx
   hooks/
      useDrawing.js
   utils/
      geometryUtils.js
```

### Core flow
1. `DrawingLayer.jsx` captures drag start/move/end in screen pixels.
2. `useDrawing.js` builds a committed shape model.
3. `App.jsx` converts shape pixel center/size into world-space values.
4. `Cube.jsx` / `Sphere.jsx` render and animate on click.
5. `TextReveal.jsx` handles text fade/scale reveal.

### Coordinate conversion
- Conversion from 2D overlay to world coordinates is done with helper functions in `geometryUtils.js`.
- Size scaling uses `PIXEL_TO_WORLD` so object size remains visually consistent.

## 3) Available Scripts

```bash
npm run dev      # start local dev server
npm run build    # production build
npm run preview  # preview production build locally
```

## 4) Troubleshooting

### Dev server fails to start
- Check Node version (`node -v`), recommended: Node 18+.
- Reinstall dependencies:
   ```bash
   rm -r node_modules package-lock.json
   npm install
   npm run dev
   ```

### Port already in use
- Start Vite on another port:
   ```bash
   npm run dev -- --port 5174
   ```

### Object/text overlap visual issues
- Ensure object meshes are unmounted after reveal states (`showText`) in object components.
- Keep text on a slightly forward `z` position in `TextReveal.jsx` if needed.

## 5) Notes for HCI/CG Demo

- This app demonstrates direct manipulation (draw-to-create), spatial mapping (2D→3D), and animated feedback.
- Cube and sphere reveal patterns provide visual affordance and interaction confirmation.
