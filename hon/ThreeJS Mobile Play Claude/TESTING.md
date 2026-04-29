# Three.js Mobile Playground - Testing & Performance Guide

## Device Testing Matrix

### Recommended Test Devices

#### Premium Android
- Device: Google Pixel 6 Pro or OnePlus 9 Pro
- Expected: Smooth 60 FPS, full quality rendering
- GPU: Adreno 660 or Snapdragon

#### Mid-Range Android
- Device: Samsung Galaxy A51 or Motorola G Power
- Expected: 45-50 FPS, potentially lower LOD
- GPU: Mali-G72

#### iPhone
- Device: iPhone 12 or newer
- Expected: Smooth 60 FPS, optimized battery usage
- GPU: Apple A14 or newer

#### Budget/Older Devices
- Device: iPhone XS / Samsung Galaxy S10
- Expected: 30-40 FPS, may need animation disable
- GPU: Older Mali/Adreno

## Testing Checklist

### 1. Rendering Quality
- [ ] Canvas fills entire viewport without black bars
- [ ] Objects render without stretching
- [ ] Text in UI remains readable
- [ ] No visual artifacts or flickering
- [ ] Shadows render correctly
- [ ] Colors appear vibrant but not washed out

### 2. Touch Interactions
- [ ] Single finger rotation works smoothly
- [ ] Two-finger pinch zoom responds immediately
- [ ] Two-finger pan works in all directions
- [ ] Damping creates natural momentum
- [ ] No lag between touch input and camera response
- [ ] Gesture hint appears on first touch

### 3. UI Controls
- [ ] Reset button returns camera to start position
- [ ] Animate toggle enables/disables rotation
- [ ] Speed slider affects rotation speed 0-2x
- [ ] Zoom slider adjusts camera distance
- [ ] All buttons are easily tappable (44x44px+)
- [ ] Sliders are smooth and responsive

### 4. Performance Monitoring
- [ ] FPS displays 55-60 on modern devices
- [ ] Draw calls remain under 10
- [ ] Geometry count shows 4 objects
- [ ] Stats update smoothly
- [ ] Memory usage appears stable

### 5. Responsive Design
- [ ] Works in portrait orientation
- [ ] Works in landscape orientation
- [ ] Works on tablets (iPad, Galaxy Tab)
- [ ] No content cutoff in notch/safe areas
- [ ] Controls reposition correctly on orientation change

### 6. Browser Compatibility
- [ ] Chrome Android 90+
- [ ] Firefox Android 88+
- [ ] Safari iOS 14+
- [ ] Samsung Internet 14+
- [ ] Opera Android 70+

### 7. Power & Thermal
- [ ] Device doesn't heat up excessively
- [ ] Battery drain is moderate
- [ ] App doesn't cause throttling
- [ ] App pauses when browser tab is backgrounded

## Performance Benchmarks

### Expected FPS by Device Class

```
Device Class        Single-Finger Rotate    Two-Finger Zoom    Idle
────────────────────────────────────────────────────────────────
Flagship (2022+)    60 FPS                  60 FPS             60 FPS
Mid-Range (2021)    50-55 FPS               45-50 FPS          60 FPS
Budget (2020)       40-45 FPS               35-40 FPS          55 FPS
Budget (2019)       30-35 FPS               25-30 FPS          50 FPS
```

### Expected Draw Calls
- All devices: 4-6 draw calls (well under 100 limit)
- No performance degradation with more objects
- LOD system helps with distant objects

### Expected Memory Usage
- Initial load: 15-25 MB
- After 5 min idle: 20-30 MB
- Peak during interaction: 25-35 MB
- Should not increase over time (no leaks)

## Profiling Tools

### Chrome DevTools (Desktop)

1. **Performance Tab**
   - Record interaction for 10 seconds
   - Look for consistent 60 FPS timeline
   - Check for dropped frames during gestures

2. **Rendering Tab**
   - Enable "Paint flashing" - should be minimal
   - Monitor "Rendering speed"
   - Check WebGL draw calls

3. **Memory Tab**
   - Take heap snapshot at start
   - Record memory over 2 minutes
   - Check for memory leaks

### Remote Debugging (Mobile)

**Android Chrome:**
```bash
# Enable Developer Options
# Go to: chrome://inspect

# Then:
1. Connect USB
2. Open chrome://inspect
3. Click "Inspect" on your app
4. Use Chrome DevTools remotely
```

**iOS Safari:**
```bash
# macOS only:
1. Connect iPhone via USB
2. Open Safari > Develop > [Device Name]
3. Select your tab
4. Use Web Inspector
```

### Three.js Profiler

The included `updateStats()` function provides:
- FPS monitoring (updated every 10 frames)
- Draw call counting
- Geometry counting
- Vertex counting

Add this to `main.js` for advanced profiling:
```javascript
const stats = new Stats();
stats.domElement.style.cssText = 'position:absolute;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
document.body.appendChild(stats.domElement);

// In animate loop:
stats.begin();
// ... render code ...
stats.end();
```

## Optimization Techniques Applied

### Current Implementation
✅ Canvas sizing with devicePixelRatio (capped at 2x)
✅ mediump precision shaders
✅ Level of Detail (3 levels per geometry)
✅ Fog-based culling
✅ Minimal lighting (1 directional + 1 ambient)
✅ Touch damping for smooth interaction
✅ Visibility API for pausing when tab hidden

### If Performance Issues Occur

**FPS drops below 45:**
```javascript
// Disable shadows
renderer.shadowMap.enabled = false;

// Use lower pixel ratio
renderer.setPixelRatio(1);

// Simplify geometries
// Reduce LOD subdivisions: 4→2, 6→4

// Reduce object count
// Remove torus or sphere
```

**High memory usage:**
```javascript
// Reduce shadow map size
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;

// Remove fog for better culling
app.scene.fog = null;

// Reduce number of objects
```

**Touch lag:**
```javascript
// Increase damping factor (feels more responsive)
app.controls.dampingFactor = 0.1;

// Reduce animation speed
app.animationSpeed *= 0.5;
```

## Testing Checklist Template

```markdown
### Device: _________________ 
**OS**: _________________ **Browser**: _________________
**Date**: _________________ **Tester**: _________________

**Rendering**
- [ ] No stretching or distortion
- [ ] Smooth 3D rotation
- [ ] Shadows visible
- [ ] FPS: _____ (target: 50+)

**Touch Controls**
- [ ] Single finger: Responsive
- [ ] Two finger zoom: Works
- [ ] Two finger pan: Works
- [ ] Damping: Natural

**UI Controls**
- [ ] Reset button: Works
- [ ] Animate toggle: Works
- [ ] Speed slider: Works
- [ ] Zoom slider: Works
- [ ] Stats panel: Readable

**Performance**
- [ ] No lag or stutter
- [ ] Device not overheating
- [ ] Battery impact: Minimal
- [ ] Memory stable

**Issues Found**
1. _______________
2. _______________
3. _______________

**Notes**
___________________________
___________________________
```

## Continuous Testing Strategy

### Weekly Mobile Testing
- Test on 2-3 different devices minimum
- Check FPS on 60FPS-capable vs 90FPS+ displays
- Test in various lighting conditions

### Monthly Deep Dive
- Full memory profiling
- Heat/thermal testing
- Battery drain testing
- Network conditions (if added)

### Before Release
- Test on 5+ different devices
- Document baseline FPS by device
- Get approval from team
- Create device-specific recommendations

## Known Limitations

### Hardware Limits
- Devices < 2GB RAM: May experience slowdowns
- Older GPUs: May need LOD quality reduction
- Low-end integrated graphics: May need effect disabling

### Browser Limits
- WebGL 1.0 only (wider compatibility)
- No WebGL 2.0 features
- No WASM acceleration
- Limited memory (60-100MB typical)

### Touch Limits
- Maximum 10 simultaneous touches (not used)
- Gesture detection latency: 50-100ms
- Pinch zoom limited to ~5x zoom

## Success Criteria

✅ **Target Achieved When:**
- 60 FPS on 90% of tested devices
- <10 draw calls consistently
- Touch response < 100ms
- No memory leaks over 10 minutes
- Smooth interaction on all touch gestures
- Stats panel readable on small screens
- Works on devices from 2019+
