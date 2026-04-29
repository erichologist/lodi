# Quick Start Guide - Three.js Mobile Playground

## 🚀 Get Up & Running in 2 Minutes

### Step 1: Open the Project
```bash
cd /Users/ehughes/Desktop/three-mobile-playground
```

### Step 2: Start Local Server
```bash
# Option A: Python 3 (Recommended)
python3 -m http.server 8000

# Option B: Node.js (if installed)
npx http-server -p 8000

# Option C: Live Server (VS Code extension)
# Open in VS Code, click "Go Live" button
```

### Step 3: View in Browser
- **Desktop**: Open `http://localhost:8000`
- **Mobile**: Open `http://<your-ip>:8000` (find IP: `ifconfig | grep inet`)

### Step 4: Test Touch Controls
1. **Rotate**: Drag one finger across screen
2. **Zoom**: Pinch with two fingers
3. **Pan**: Two-finger swipe
4. **Play with sliders**: Adjust speed and zoom

## 📊 What You'll See

✅ **3 Rotating 3D Objects**
- Blue sphere (icosahedron)
- Pink box
- Orange torus (donut shape)

✅ **Performance Metrics** (top-right corner)
- FPS counter
- Draw call count
- Geometry counter

✅ **Mobile Controls** (top-left & bottom)
- Reset camera button
- Animation toggle
- Speed slider
- Zoom slider

## 🔧 File Overview

| File | Purpose |
|------|---------|
| `index.html` | HTML structure + CSS styling |
| `main.js` | Core Three.js application |
| `extensions.js` | Optional advanced features |
| `README.md` | Full documentation |
| `TESTING.md` | Testing guidelines |

## 🎮 Controls Reference

```
Gesture                     Action
────────────────────────────────────────
👆 One finger drag          Rotate camera
🤚 Two finger pinch         Zoom in/out
↔️ Two finger pan           Move camera
↻ Reset button              Reset view
⏵ Animate button            Toggle rotation
Sliders                     Control speed/zoom
```

## 💡 Tips

- **First time?** Touch the screen to see gesture hints
- **Performance low?** Disable animation, reduce speed
- **Want to customize?** Edit `main.js` to add objects/colors
- **Mobile testing?** Use Chrome DevTools with USB debugging

## 🔗 Key Features

### ✅ Mobile Optimized
- Works on iPhone & Android
- Touch-friendly interface
- No external dependencies
- Responsive design

### ✅ High Performance
- < 100 draw calls
- 60 FPS target
- GPU optimized shaders
- Level of Detail system

### ✅ Production Ready
- Clean code structure
- Comprehensive documentation
- Real-time performance monitoring
- Error handling

## 🐛 Troubleshooting

### "White/black canvas"
- Check browser console for errors
- Clear browser cache (Ctrl+Shift+Del)
- Try a different browser

### "Touch doesn't work"
- Make sure you're on a touchscreen device
- Check if browser DevTools is open (can interfere)
- Try a fresh page reload

### "Low FPS on mobile"
- Click "Animate" to toggle rotation
- Reduce "Speed" slider
- Check device temperature (might be throttling)

### "Objects not visible"
- Try the "Reset" button
- Check if device orientation is landscape
- Zoom slider might be set too far

## 🎨 Quick Customization

### Change object colors
In `main.js`, find `createMobileShaderMaterial()` calls:
```javascript
// Change hex color
createMobileShaderMaterial(0xFF0000)  // Red instead of blue
```

### Change background
In `main.js`, find `app.scene.background`:
```javascript
app.scene.background = new THREE.Color(0xFF0000);  // Red background
```

### Add more objects
In `createDemoObjects()`, add:
```javascript
const geom = createLODGeometry('box');
const mat = createMobileShaderMaterial(0x00FF00);
const mesh = new THREE.Mesh(geom, mat);
app.scene.add(mesh);
```

## 📱 Mobile Testing Checklist

- [ ] Works on iPhone (iOS 14+)
- [ ] Works on Android (Chrome, Firefox)
- [ ] Touch gestures respond quickly
- [ ] No lag or stuttering
- [ ] Stats panel shows 50+ FPS
- [ ] UI buttons are easy to tap
- [ ] Device doesn't overheat

## 🚀 Next Steps

### Learn More
- Read `README.md` for full documentation
- Check `TESTING.md` for performance guidance
- Review `extensions.js` for advanced features

### Extend Features
- Add custom geometries
- Implement physics simulation
- Add model loading (glTF)
- Create interactive animations

### Deploy Online
- Use GitHub Pages
- Deploy to Vercel/Netlify
- Host on AWS/GCP
- Use PWA manifest for app installation

## 📚 Resources

- **Three.js Docs**: https://threejs.org/docs
- **WebGL Optimization**: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
- **Mobile Performance**: https://developers.google.com/web/fundamentals/performance
- **Touch API**: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

## ✨ Have Fun!

This is your interactive 3D playground. Feel free to:
- Experiment with the code
- Add your own objects
- Test on different devices
- Create something amazing!

**Happy coding! 🎉**

---
*For issues or questions, check the full README.md or TESTING.md files.*
