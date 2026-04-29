# Three.js Mobile Interactive Playground

A production-ready, touch-optimized Three.js application designed specifically for mobile devices. Includes responsive rendering, gesture controls, performance optimization, and an intuitive mobile UI overlay.

## 🎯 Key Features

### 1. **Mobile-First Rendering**
- ✅ Responsive canvas with `renderer.setPixelRatio(window.devicePixelRatio)`
- ✅ Automatic camera aspect ratio updates on resize
- ✅ Capped pixel ratio at 2x for mobile GPU optimization
- ✅ No stretching or distortion on any device orientation

### 2. **Touch Interaction**
- ✅ **One-finger rotate**: Orbit around 3D objects
- ✅ **Two-finger pinch/zoom**: Zoom in and out smoothly
- ✅ **Two-finger pan**: Move camera laterally
- ✅ Built-in gesture hint that appears on first touch
- ✅ Smooth damping for natural feel (dampingFactor: 0.05)

### 3. **Performance Optimization**
- ✅ **<100 draw calls**: Only 4 objects + ground plane
- ✅ **mediump shader precision**: Optimized for mobile GPUs
- ✅ **Level of Detail (LOD) system**: 
  - Low poly (2 subdivisions) at distance > 150 units
  - Medium poly (4 subdivisions) at distance > 75 units
  - High poly (6 subdivisions) when close
- ✅ **Real-time performance monitoring**: FPS, draw calls, geometry count
- ✅ Geometry culling with fog (near: 100, far: 300)
- ✅ Optimized shadow map (1024x1024, PCF)

### 4. **Mobile UI Overlay**
- ✅ Touch-friendly buttons (min 44x44px for iOS HIG)
- ✅ Responsive sliders for speed and zoom control
- ✅ Live performance stats panel
- ✅ No interference with canvas touch events (pointer-events separation)
- ✅ Landscape orientation support

### 5. **Modern Three.js (r160+)**
- ✅ ES6 module imports
- ✅ Latest ShaderMaterial syntax with mediump precision
- ✅ Three.js r160 compatible (CDN loaded)

## 📋 Project Structure

```
three-mobile-playground/
├── index.html          # Main HTML with mobile meta tags and UI overlay
├── main.js            # Core application logic and 3D scene
└── README.md          # This file
```

## 🚀 Quick Start

### Option 1: Local Development (Recommended)
```bash
# Navigate to project
cd /Users/ehughes/Desktop/three-mobile-playground

# Start a simple HTTP server (Python 3)
python3 -m http.server 8000

# Open in browser
# Desktop: http://localhost:8000
# Mobile: http://<your-machine-ip>:8000
```

### Option 2: Direct Browser
Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge).

### Option 3: Mobile Testing
1. Ensure your desktop and mobile device are on the same network
2. Find your machine's IP: `ifconfig | grep inet`
3. Open `http://<your-ip>:8000` on mobile device
4. Test touch gestures

## 🎮 Controls

| Gesture | Action |
|---------|--------|
| 👆 **One Finger Drag** | Rotate camera around objects |
| 🤚 **Two Finger Pinch** | Zoom in/out |
| ↔️ **Two Finger Pan** | Pan camera left/right |
| **↻ Reset Button** | Return camera to default view |
| **⏵ Animate Toggle** | Start/stop object rotation |
| **Speed Slider** | Adjust rotation speed (0-100) |
| **Zoom Slider** | Adjust zoom level (1x-5x) |

## 📊 Performance Metrics

The stats panel (top-right) displays:
- **FPS**: Frames per second (target: 60)
- **Draws**: Draw call count (optimized <100)
- **Geo**: Number of geometries in scene
- **Mem**: Memory usage (tracked separately)

### Target Specifications
- **Draw Calls**: < 100 ✓ (Currently: 4 objects)
- **Shader Precision**: mediump ✓ (Mobile optimized)
- **Frame Rate**: 60 FPS target ✓
- **Responsive**: All screen sizes ✓

## 🔧 Technical Details

### Responsive Canvas Setup
```javascript
// Set pixel ratio (capped at 2x for performance)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Handle resize events
app.camera.aspect = window.innerWidth / window.innerHeight;
app.camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
```

### Custom Mobile Shaders
All objects use mediump precision fragment/vertex shaders:
```glsl
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Optimized lighting calculation
    vec3 lightDir = normalize(uLightPos - vPosition);
    float diffuse = max(dot(vNormal, lightDir), 0.2);
    
    vec3 color = uColor * (0.7 + 0.3 * diffuse);
    gl_FragColor = vec4(color, 1.0);
}
```

### Touch Event Handling
```javascript
// OrbitControls with touch support
controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
};

// Prevent UI interference
document.querySelectorAll('button, input').forEach(el => {
    el.addEventListener('touchstart', e => e.stopPropagation());
});
```

### LOD Implementation
```javascript
const lodGroup = new THREE.LOD();
lodGroup.addLevel(lowPolyGeom, 150);     // Far
lodGroup.addLevel(mediumPolyGeom, 75);   // Medium
lodGroup.addLevel(highPolyGeom, 0);      // Close
```

## 🎨 Customization

### Change Background Color
In `main.js`, update the scene color:
```javascript
app.scene.background = new THREE.Color(0x0a0e27); // Change hex value
```

### Add More Objects
Create additional geometries in `createDemoObjects()`:
```javascript
const geom = createLODGeometry('icosphere');
const mat = createMobileShaderMaterial(0xFF0000);
const mesh = new THREE.Mesh(geom, mat);
app.scene.add(mesh);
app.objects.push(mesh);
```

### Adjust Performance Settings
Modify `CONFIG` at the top of `main.js`:
```javascript
const CONFIG = {
    targetFPS: 60,
    maxDrawCalls: 100,
    lodThresholds: [50, 100, 200],  // Adjust LOD distances
    touchSensitivity: 1.0,
    pinchSensitivity: 0.01,
};
```

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (iOS 14+)
- ✅ Edge 90+

## 📱 Mobile Device Testing

### iOS (Safari)
- Test on iPhone 12+ recommended
- Supports pinch-to-zoom natively
- Install as web app: Share > Add to Home Screen

### Android (Chrome)
- Test on Pixel 4+ or equivalent
- Full touch gesture support
- Can be installed as PWA

## ⚡ Performance Tips

1. **Reduce geometry complexity** for older devices
2. **Disable shadows** in shadow mapping for lower-end phones
3. **Limit LOD levels** if GPU is struggling
4. **Use fewer objects** (demo has 3 rotating objects + ground)
5. **Monitor FPS** and adjust animation speed accordingly

## 🐛 Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| Flickering on iOS | Ensure viewport-fit=cover in meta tag |
| Lag on rotation | Reduce dampingFactor or lower LOD quality |
| Zoom feels jerky | Adjust pinchSensitivity in CONFIG |
| High memory usage | Reduce number of objects or geometry size |

## 📚 Dependencies

- **Three.js r160** (ES6 Module, CDN)
- **OrbitControls.js** (Three.js example)
- No build tools required! (Uses ES6 modules directly)

## 🔍 Code Architecture

```
main.js
├── CONFIG                     // Performance settings
├── app {}                     // Application state
├── Utility Functions
│   ├── createMobileShaderMaterial()
│   ├── createLODGeometry()
│   ├── countDrawCalls()
│   └── updateStats()
├── Initialization
│   ├── initScene()
│   ├── createDemoObjects()
│   ├── handleResize()
│   └── setupUIControls()
├── Animation Loop
│   └── animate()
└── Event Listeners
    ├── resize
    ├── touchmove
    ├── touchstart
    └── visibilitychange
```

## 📈 Future Enhancements

- [ ] Particle system with performance constraints
- [ ] Multi-touch gesture library
- [ ] Progressive Web App (PWA) manifest
- [ ] Accelerometer/gyroscope controls
- [ ] Model loading (.gltf/.glb)
- [ ] Post-processing effects (optimized)
- [ ] Mobile touch haptics feedback
- [ ] Battery optimization mode

## 📝 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

To improve this playground:
1. Test on real mobile devices
2. Profile performance with Chrome DevTools
3. Suggest optimizations for lower-end devices

---

**Last Updated**: 2026-04-28  
**Version**: 1.0.0  
**Three.js Version**: r160+
