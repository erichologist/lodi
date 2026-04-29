# 🚀 Quick Start Guide

## Project Files Overview

```
/Users/ehughes/.lody/chats/84656c7c-97fa-4baa-934d-d4cde0783c13/
├── index.html                 # Main entry point
├── style.css                  # Responsive styling
├── main.js                    # Three.js scene + animation loop
├── vite.config.js             # Build configuration
├── package.json               # Dependencies
├── standalone.html            # Single-file version (CDN-based)
├── README.md                  # Full documentation
└── dist/                      # Production build (ready to deploy)
    ├── index.html
    └── assets/
        ├── index-*.js         # Bundled + minified code (508KB)
        └── index-*.css        # Compiled CSS
```

## Three Ways to Run

### Option 1: Development Server (Recommended for Development)
```bash
cd /Users/ehughes/.lody/chats/84656c7c-97fa-4baa-934d-d4cde0783c13
npm run dev
# Opens at http://localhost:5173
```
- Hot module reloading
- Fast refresh on changes
- Full sourcemaps for debugging

### Option 2: Standalone HTML (One File, No Build)
Open `standalone.html` directly in your browser:
- Works offline
- No build step needed
- Loads Three.js from CDN
- Perfect for quick testing

### Option 3: Production Build (Optimized)
```bash
npm run build
npm run preview
# Opens production version at http://localhost:4173
```
- Minified & optimized (128KB gzipped)
- Ready for deployment
- Built output in `dist/` folder

---

## What You Get

### 🎨 Interactive Mesh Gradient
- 5 dynamic color nodes with Gaussian blur
- Responds to mouse/touch movements
- Smooth interpolation for silky-smooth motion
- Colors: Hot Pink, Purple, Blue, Orange, Mint Green

### 🎯 Three.js 3D Scene
- Icosahedron geometry with physical material
- Auto-rotating with orbit controls
- Metallic + clearcoat material for visual depth
- Transparent canvas lets gradient show through

### ⚡ Performance
- Solid 60 FPS on desktop & mobile
- Efficient requestAnimationFrame loop
- GPU-accelerated rendering
- Responsive scaling on all screen sizes

---

## Customization

### Change Gradient Colors
Edit `index.html` - Find the `<circle>` elements and change the `fill` attribute:
```html
<circle id="node-0" cx="300" cy="250" r="180" fill="#ff006e" opacity="0.6" />
```

### Change 3D Object Material
Edit `main.js` - Locate `create3DObject()`:
```javascript
const material = new THREE.MeshPhysicalMaterial({
    color: 0x06ffa5,              // Primary color
    emissive: 0xff006e,            // Emissive glow
    metalness: 0.6,                // Metallic effect
    roughness: 0.3,                // Surface roughness
});
```

### Change 3D Geometry
In `create3DObject()`, replace:
```javascript
const geometry = new THREE.IcosahedronGeometry(1, 4);
```

Try:
- `new THREE.TorusKnotGeometry(1, 0.4, 100, 16)`
- `new THREE.BoxGeometry(2, 2, 2, 32, 32, 32)`
- `new THREE.DodecahedronGeometry(1, 0)`
- `new THREE.OctahedronGeometry(1, 4)`

### Adjust Animation Speed
In `main.js`, modify `CONFIG`:
```javascript
CONFIG = {
    scene: {
        rotationSpeed: 0.005,     // ← Increase for faster spin
        objectScale: 1.5,          // ← Change object size
    },
    gradient: {
        disturbanceRange: 80,      // ← How far nodes move
        returnSpeed: 0.15,         // ← How quickly they return
    },
};
```

---

## Browser Compatibility

✅ Chrome/Edge 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ iOS Safari (iPad/iPhone)  
✅ Chrome Mobile  

---

## Performance Tips

1. **Mobile Optimization:** 
   - Pixel ratio is capped at 2x to save memory
   - `mediump` precision for faster calculations
   - Efficient touch event handling

2. **Desktop Performance:**
   - requestAnimationFrame ensures 60 FPS
   - Geometry cached and not recreated each frame
   - Efficient SVG blur with 40px sigma

3. **Deploy to Production:**
   - Use `dist/` folder (508KB, 128KB gzipped)
   - All assets are bundled and minified
   - Ready for static hosting (GitHub Pages, Netlify, Vercel, etc.)

---

## Troubleshooting

**Canvas not rendering?**
- Check browser console for errors (F12)
- Ensure WebGL is supported: https://get.webgl.org/

**Performance issues on mobile?**
- Reduce `CONFIG.gradient.disturbanceRange` in `main.js`
- Lower `CONFIG.pixelRatio` if needed

**Gradient not interactive?**
- Ensure `touch-action: none` is set in CSS
- Check that pointer events are firing in console

---

## Next Steps

1. ✅ **Run it:** `npm run dev`
2. 🎨 **Customize colors:** Edit gradient nodes
3. 🔧 **Tweak animation:** Modify CONFIG values
4. 🚀 **Deploy:** Use `dist/` folder

Enjoy your WebGL playground! 🎉
