# 🎨 WebGL Interactive Playground

A high-performance, mobile-optimized interactive experience combining an animated mesh gradient background with a Three.js 3D scene.

## Features

✨ **Interactive Mesh Gradient**
- 5 dynamic color nodes that respond to pointer movement
- Smooth blend transitions with Gaussian blur
- Touch and mouse support

🎯 **Three.js 3D Scene**
- Animated icosahedron with physical material
- Auto-rotation + orbit controls
- Transparent rendering (gradient shows through)
- Optimized for mobile devices

⚡ **Performance**
- Solid 60 FPS on desktop and mobile
- Efficient geometry caching
- GPU-accelerated rendering
- Responsive canvas scaling

📱 **Mobile-First Design**
- Touch gesture support
- Optimized pixel ratio (max 2x)
- Works seamlessly on portrait devices
- Power-efficient material settings

## Quick Start

### Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

Output is in the `dist/` folder.

## Customization

### Change Gradient Colors

Edit `index.html` - locate the `<defs>` section and modify the `<stop>` elements:

```html
<stop offset="0%" stop-color="#ff006e" />
<stop offset="100%" stop-color="#8338ec" />
```

Current gradient uses 5 nodes with colors:
- **Node 0:** `#ff006e` (Hot Pink)
- **Node 1:** `#8338ec` (Purple)
- **Node 2:** `#3a86ff` (Blue)
- **Node 3:** `#fb5607` (Orange)
- **Node 4:** `#06ffa5` (Mint Green)

### Change 3D Object Material

Edit `main.js` - find the `create3DObject()` function:

```javascript
const material = new THREE.MeshPhysicalMaterial({
    color: 0x06ffa5,              // Change primary color (hex)
    emissive: 0xff006e,            // Change emissive glow color
    metalness: 0.6,                // 0-1: How metallic (0 = matte, 1 = mirror)
    roughness: 0.3,                // 0-1: How rough (0 = shiny, 1 = matte)
    ior: 1.5,                       // Index of refraction (1-2.33)
    clearcoat: 0.8,                // 0-1: Clearcoat intensity
    clearcoatRoughness: 0.2,        // 0-1: Clearcoat roughness
    wireframe: false,               // Set to true for wireframe mode
});
```

### Change 3D Object Geometry

In `main.js`, replace the geometry in `create3DObject()`:

```javascript
// Current:
const geometry = new THREE.IcosahedronGeometry(1, 4);

// Try these alternatives:
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
const geometry = new THREE.BoxGeometry(2, 2, 2, 32, 32, 32);
const geometry = new THREE.OctahedronGeometry(1, 4);
const geometry = new THREE.DodecahedronGeometry(1, 0);
const geometry = new THREE.TetrahedronGeometry(1, 0);
```

### Adjust Animation Speed

In `main.js`, modify the `CONFIG` object:

```javascript
CONFIG = {
    scene: {
        rotationSpeed: 0.005,     // Increase for faster rotation
        objectScale: 1.5,          // Change object size
    },
    gradient: {
        disturbanceRange: 80,      // How far nodes move
        returnSpeed: 0.15,         // How quickly they return
        pointerInfluence: 120,     // Detection radius
    },
};
```

## Project Structure

```
.
├── index.html          # Entry point with SVG gradient markup
├── style.css           # Responsive layout and performance hints
├── main.js             # Three.js scene + animation loop + controls
├── vite.config.js      # Vite bundler configuration
├── package.json        # Dependencies
└── dist/               # Production build output
```

## Browser Support

- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Uses `mediump` precision on WebGL renderer for mobile efficiency
- Pixel ratio capped at 2x to reduce memory usage
- SVG blur filter optimized with 40px sigma
- requestAnimationFrame ensures 60 FPS smooth animation
- Efficient touch event handling with passive listeners

## License

Free to use and modify. Created as an interactive WebGL/Three.js demonstration.
