// Advanced Extensions for Three.js Mobile Playground
// These are optional enhancements you can integrate into main.js

// ==================== ADVANCED FEATURES ====================

/**
 * EXTENSION 1: Particle System (Low overhead)
 * Add this to createDemoObjects() to add particles
 */
export function createParticleSystem() {
    const particleCount = 500; // Keep low for mobile
    const particleGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
        
        velocities[i3] = (Math.random() - 0.5) * 0.1;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x2196F3,
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6,
    });
    
    const particles = new THREE.Points(particleGeometry, material);
    return { particles, velocities };
}

/**
 * EXTENSION 2: Accelerometer/Gyroscope Controls
 * Use device motion to tilt camera on mobile
 */
export class MotionControls {
    constructor(camera) {
        this.camera = camera;
        this.alpha = 0;
        this.beta = 0;
        this.gamma = 0;
        
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+
            this.requestPermission();
        } else if (typeof DeviceOrientationEvent !== 'undefined') {
            // Android
            window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
        }
    }
    
    requestPermission() {
        DeviceOrientationEvent.requestPermission()
            .then(permission => {
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
                }
            })
            .catch(console.error);
    }
    
    onDeviceOrientation(event) {
        this.alpha = THREE.MathUtils.degToRad(event.alpha || 0);
        this.beta = THREE.MathUtils.degToRad(event.beta || 0);
        this.gamma = THREE.MathUtils.degToRad(event.gamma || 0);
        
        // Apply subtle camera tilt based on device orientation
        const euler = new THREE.Euler(this.beta * 0.3, this.alpha * 0.3, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(euler);
    }
}

/**
 * EXTENSION 3: Advanced Touch Gesture Detection
 * Detect swipe, long-press, rotation gestures
 */
export class AdvancedTouchGestureDetector {
    constructor(element) {
        this.element = element;
        this.touches = {};
        this.callbacks = {
            onSwipe: null,
            onLongPress: null,
            onRotation: null,
        };
        
        this.setupListeners();
    }
    
    setupListeners() {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    handleTouchStart(e) {
        for (let touch of e.touches) {
            this.touches[touch.identifier] = {
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now(),
                currentX: touch.clientX,
                currentY: touch.clientY,
            };
        }
    }
    
    handleTouchMove(e) {
        for (let touch of e.touches) {
            if (this.touches[touch.identifier]) {
                this.touches[touch.identifier].currentX = touch.clientX;
                this.touches[touch.identifier].currentY = touch.clientY;
            }
        }
    }
    
    handleTouchEnd(e) {
        for (let touch of e.changedTouches) {
            if (this.touches[touch.identifier]) {
                const t = this.touches[touch.identifier];
                const deltaX = t.currentX - t.startX;
                const deltaY = t.currentY - t.startY;
                const deltaTime = Date.now() - t.startTime;
                
                // Detect swipe
                if (Math.abs(deltaX) > 50 && deltaTime < 300) {
                    const direction = deltaX > 0 ? 'right' : 'left';
                    if (this.callbacks.onSwipe) this.callbacks.onSwipe(direction);
                }
                
                // Detect long press
                if (deltaTime > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                    if (this.callbacks.onLongPress) this.callbacks.onLongPress();
                }
                
                delete this.touches[touch.identifier];
            }
        }
    }
}

/**
 * EXTENSION 4: Post-Processing Effects (Low Cost)
 * Add simple bloom or color correction
 */
export function createSimpleBloom(renderer, scene, camera) {
    // For mobile, use a simple color grading approach
    // instead of full post-processing
    
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: null },
            uBloomStrength: { value: 0.3 },
        },
        vertexShader: `
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            precision mediump float;
            
            uniform sampler2D tDiffuse;
            uniform float uBloomStrength;
            
            varying vec2 vUv;
            
            void main() {
                vec4 color = texture2D(tDiffuse, vUv);
                
                // Simple bloom via color brightening
                vec3 bright = max(color.rgb - vec3(0.7), vec3(0.0)) * uBloomStrength;
                
                gl_FragColor = vec4(color.rgb + bright, color.a);
            }
        `,
    });
    
    return shaderMaterial;
}

/**
 * EXTENSION 5: Mobile-Optimized Model Loader
 * Load glTF models with LOD support
 */
export async function loadGLTFWithLOD(url, scene) {
    // Requires: import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@r160/examples/jsm/loaders/GLTFLoader.js';
    
    // const loader = new GLTFLoader();
    // const gltf = await new Promise((resolve, reject) => {
    //     loader.load(url, resolve, undefined, reject);
    // });
    
    // gltf.scene.traverse(child => {
    //     if (child.isMesh) {
    //         child.geometry = optimizeGeometry(child.geometry);
    //     }
    // });
    
    // return gltf.scene;
}

/**
 * EXTENSION 6: Battery Status & Adaptive Quality
 * Reduce quality on low battery
 */
export class BatteryAwareRenderer {
    constructor(renderer) {
        this.renderer = renderer;
        this.batteryLevel = 100;
        this.isLowBattery = false;
        
        this.requestBatteryStatus();
    }
    
    async requestBatteryStatus() {
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            battery.addEventListener('levelchange', () => {
                this.batteryLevel = Math.round(battery.level * 100);
                this.isLowBattery = this.batteryLevel < 20;
                this.adaptQuality();
            });
        }
    }
    
    adaptQuality() {
        if (this.isLowBattery) {
            // Reduce pixel ratio
            this.renderer.setPixelRatio(1);
            // Could also reduce animation speed, disable shadows, etc.
        } else {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    }
}

/**
 * EXTENSION 7: Network-Aware Loading
 * Adapt quality based on connection speed
 */
export class NetworkAwareLoader {
    static getConnectionType() {
        if (!navigator.connection) return 'unknown';
        
        const type = navigator.connection.effectiveType;
        // '4g', '3g', '2g', 'slow-2g'
        
        return {
            type,
            isSlowNetwork: type === '2g' || type === 'slow-2g',
            isMobileNetwork: true,
        };
    }
    
    static getRecommendedQuality() {
        const connection = this.getConnectionType();
        
        if (connection.isSlowNetwork) {
            return {
                lodQuality: 'low',
                shadowsEnabled: false,
                particlesEnabled: false,
            };
        }
        
        return {
            lodQuality: 'high',
            shadowsEnabled: true,
            particlesEnabled: true,
        };
    }
}

/**
 * EXTENSION 8: Haptic Feedback
 * Trigger vibration on interaction
 */
export function triggerHapticFeedback() {
    if (navigator.vibrate) {
        // Gentle tap: 10ms
        navigator.vibrate(10);
    }
}

export function triggerHapticPattern(pattern = [100, 50, 100]) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

/**
 * EXTENSION 9: Connection Loss Recovery
 * Pause rendering if connection lost
 */
export class ConnectionAwareApp {
    constructor() {
        this.isConnected = navigator.onLine;
        window.addEventListener('online', () => {
            this.isConnected = true;
            console.log('Connection restored');
        });
        window.addEventListener('offline', () => {
            this.isConnected = false;
            console.log('Connection lost');
        });
    }
}

/**
 * EXTENSION 10: Screenshot Capture
 * Allow users to capture 3D renders
 */
export function captureScreenshot(renderer, filename = 'screenshot.png') {
    const canvas = renderer.domElement;
    const image = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    link.click();
}

// ==================== USAGE EXAMPLES ====================

/*

// In main.js, to use extensions:

// 1. Add particle system
const { particles, velocities } = createParticleSystem();
app.scene.add(particles);

// 2. Add motion controls
const motionControls = new MotionControls(app.camera);

// 3. Add gesture detection
const gestures = new AdvancedTouchGestureDetector(document);
gestures.callbacks.onSwipe = (direction) => {
    console.log('Swiped:', direction);
    triggerHapticFeedback();
};

// 4. Add battery aware rendering
const batteryAware = new BatteryAwareRenderer(app.renderer);

// 5. Check network quality
const networkQuality = NetworkAwareLoader.getRecommendedQuality();
console.log('Recommended quality:', networkQuality);

// 6. Take screenshot
document.getElementById('captureBtn').addEventListener('click', () => {
    captureScreenshot(app.renderer, 'my-3d-scene.png');
});

*/
