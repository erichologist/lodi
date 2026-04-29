import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r160/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@r160/examples/jsm/controls/OrbitControls.js';

// ==================== CONFIGURATION ====================
const CONFIG = {
    targetFPS: 60,
    maxDrawCalls: 100,
    lodThresholds: [50, 100, 200],
    touchSensitivity: 1.0,
    pinchSensitivity: 0.01,
};

// ==================== APPLICATION STATE ====================
const app = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    objects: [],
    animationEnabled: true,
    animationSpeed: 1.0,
    zoomLevel: 1.0,
    stats: {
        fps: 60,
        drawCalls: 0,
        geometries: 0,
        vertices: 0,
        memory: 0,
    },
    lastFrameTime: Date.now(),
    frameCount: 0,
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create custom shader material with mediump precision for mobile
 */
function createMobileShaderMaterial(color = 0x2196F3) {
    return new THREE.ShaderMaterial({
        precision: 'mediump',
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uTime: { value: 0 },
            uLightPos: { value: new THREE.Vector3(5, 5, 5) },
        },
        vertexShader: `
            precision mediump float;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * vec4(vPosition, 1.0);
            }
        `,
        fragmentShader: `
            precision mediump float;
            
            uniform vec3 uColor;
            uniform float uTime;
            uniform vec3 uLightPos;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vec3 lightDir = normalize(uLightPos - vPosition);
                float diffuse = max(dot(vNormal, lightDir), 0.2);
                
                vec3 color = uColor * (0.7 + 0.3 * diffuse);
                color += vec3(0.1) * sin(uTime + length(vPosition));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        side: THREE.DoubleSide,
    });
}

/**
 * Create LOD geometry (Low poly, Medium poly, High poly)
 */
function createLODGeometry(type = 'icosphere') {
    const lodGroup = new THREE.LOD();
    
    if (type === 'icosphere') {
        const low = new THREE.IcosahedronGeometry(1, 2);      // Subdivisions: 2
        const medium = new THREE.IcosahedronGeometry(1, 4);   // Subdivisions: 4
        const high = new THREE.IcosahedronGeometry(1, 6);     // Subdivisions: 6
        
        lodGroup.addLevel(low, 150);      // Use low poly when > 150 units away
        lodGroup.addLevel(medium, 75);    // Use medium poly when > 75 units away
        lodGroup.addLevel(high, 0);       // Use high poly when close
        
        return { geometry: low, lodGroup, fullGeometry: high };
    }
    
    if (type === 'box') {
        const low = new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);
        const medium = new THREE.BoxGeometry(2, 2, 2, 4, 4, 4);
        const high = new THREE.BoxGeometry(2, 2, 2, 8, 8, 8);
        
        lodGroup.addLevel(low, 150);
        lodGroup.addLevel(medium, 75);
        lodGroup.addLevel(high, 0);
        
        return { geometry: low, lodGroup, fullGeometry: high };
    }
    
    if (type === 'torus') {
        const low = new THREE.TorusGeometry(1.5, 0.4, 8, 16);
        const medium = new THREE.TorusGeometry(1.5, 0.4, 16, 32);
        const high = new THREE.TorusGeometry(1.5, 0.4, 32, 64);
        
        lodGroup.addLevel(low, 150);
        lodGroup.addLevel(medium, 75);
        lodGroup.addLevel(high, 0);
        
        return { geometry: low, lodGroup, fullGeometry: high };
    }
}

/**
 * Calculate draw calls (render calls)
 */
function countDrawCalls(scene) {
    let count = 0;
    scene.traverse((object) => {
        if (object.isMesh && object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            count += materials.length;
        }
    });
    return count;
}

/**
 * Update performance stats
 */
function updateStats() {
    const now = Date.now();
    const deltaTime = (now - app.lastFrameTime) / 1000;
    app.lastFrameTime = now;
    
    app.frameCount++;
    if (app.frameCount % 10 === 0) {
        app.stats.fps = Math.round(1 / deltaTime);
    }
    
    app.stats.drawCalls = countDrawCalls(app.scene);
    
    // Count geometries
    app.stats.geometries = 0;
    app.stats.vertices = 0;
    app.scene.traverse((object) => {
        if (object.isMesh && object.geometry) {
            app.stats.geometries++;
            if (object.geometry.attributes.position) {
                app.stats.vertices += object.geometry.attributes.position.count;
            }
        }
    });
    
    // Update UI
    document.getElementById('fps').textContent = app.stats.fps;
    document.getElementById('drawCalls').textContent = app.stats.drawCalls;
    document.getElementById('geometries').textContent = app.stats.geometries;
}

// ==================== INITIALIZATION ====================

/**
 * Initialize Three.js scene
 */
function initScene() {
    // Scene
    app.scene = new THREE.Scene();
    app.scene.background = new THREE.Color(0x0a0e27);
    app.scene.fog = new THREE.Fog(0x0a0e27, 100, 300);
    
    // Camera - optimized for mobile aspect ratio
    const canvas = document.getElementById('canvas');
    const width = window.innerWidth;
    const height = window.innerHeight;
    app.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    app.camera.position.set(0, 3, 5);
    
    // Renderer - mobile optimized
    app.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
    });
    app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    app.renderer.setSize(width, height);
    app.renderer.outputColorSpace = THREE.SRGBColorSpace;
    app.renderer.shadowMap.enabled = true;
    app.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    
    // Lighting - minimal for performance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    app.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    app.scene.add(directionalLight);
    
    // Controls - touch enabled
    app.controls = new OrbitControls(app.camera, app.renderer.domElement);
    app.controls.enableDamping = true;
    app.controls.dampingFactor = 0.05;
    app.controls.autoRotate = false;
    app.controls.autoRotateSpeed = 2;
    app.controls.enableZoom = true;
    app.controls.enablePan = true;
    app.controls.enableRotate = true;
    app.controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
    };
    
    // Create initial objects
    createDemoObjects();
}

/**
 * Create demo 3D objects with LOD
 */
function createDemoObjects() {
    // Central rotating sphere
    const sphere1 = createLODGeometry('icosphere');
    const mat1 = createMobileShaderMaterial(0x2196F3);
    const mesh1 = new THREE.Mesh(sphere1.geometry, mat1);
    mesh1.position.set(-3, 0, 0);
    mesh1.castShadow = true;
    mesh1.receiveShadow = true;
    mesh1.userData = { type: 'sphere1', rotation: true, speed: 1 };
    app.scene.add(mesh1);
    app.objects.push(mesh1);
    
    // Box with rotation
    const box = createLODGeometry('box');
    const mat2 = createMobileShaderMaterial(0xFF6B9D);
    const mesh2 = new THREE.Mesh(box.geometry, mat2);
    mesh2.position.set(0, 0, 0);
    mesh2.castShadow = true;
    mesh2.receiveShadow = true;
    mesh2.userData = { type: 'box', rotation: true, speed: 0.7 };
    app.scene.add(mesh2);
    app.objects.push(mesh2);
    
    // Torus
    const torus = createLODGeometry('torus');
    const mat3 = createMobileShaderMaterial(0xFFA500);
    const mesh3 = new THREE.Mesh(torus.geometry, mat3);
    mesh3.position.set(3, 0, 0);
    mesh3.castShadow = true;
    mesh3.receiveShadow = true;
    mesh3.userData = { type: 'torus', rotation: true, speed: 1.3 };
    app.scene.add(mesh3);
    app.objects.push(mesh3);
    
    // Ground plane
    const groundGeom = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1a1f3a,
        roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    app.scene.add(ground);
}

/**
 * Handle window resize with proper camera and renderer updates
 */
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update camera
    app.camera.aspect = width / height;
    app.camera.updateProjectionMatrix();
    
    // Update renderer
    app.renderer.setSize(width, height);
    app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * Setup UI controls
 */
function setupUIControls() {
    const resetBtn = document.getElementById('resetBtn');
    const animBtn = document.getElementById('toggleAnimBtn');
    const speedSlider = document.getElementById('speedSlider');
    const zoomSlider = document.getElementById('zoomSlider');
    const gestureHint = document.getElementById('gestureHint');
    
    // Reset camera
    resetBtn.addEventListener('click', () => {
        app.camera.position.set(0, 3, 5);
        app.controls.target.set(0, 0, 0);
        app.controls.reset();
    });
    
    // Toggle animation
    animBtn.addEventListener('click', () => {
        app.animationEnabled = !app.animationEnabled;
        animBtn.style.opacity = app.animationEnabled ? '1' : '0.5';
    });
    
    // Animation speed
    speedSlider.addEventListener('input', (e) => {
        app.animationSpeed = parseFloat(e.target.value) / 50;
    });
    
    // Zoom control
    zoomSlider.addEventListener('input', (e) => {
        const zoomFactor = parseFloat(e.target.value) / 100;
        const distance = 10 * zoomFactor;
        app.camera.position.multiplyScalar(distance / app.camera.position.length());
    });
    
    // Show gesture hint on first touch
    let touchStarted = false;
    document.addEventListener('touchstart', () => {
        if (!touchStarted) {
            touchStarted = true;
            gestureHint.classList.add('visible');
            setTimeout(() => gestureHint.classList.remove('visible'), 3000);
        }
    }, { once: true });
    
    // Prevent UI buttons from interfering with canvas touch
    document.querySelectorAll('button, input[type="range"]').forEach(el => {
        el.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        el.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
        el.addEventListener('touchend', (e) => e.stopPropagation(), { passive: true });
    });
}

// ==================== ANIMATION LOOP ====================

/**
 * Animation frame loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    app.controls.update();
    
    // Animate objects
    if (app.animationEnabled) {
        const time = Date.now() * 0.001;
        app.objects.forEach((obj) => {
            if (obj.userData.rotation) {
                obj.rotation.x += 0.005 * app.animationSpeed * obj.userData.speed;
                obj.rotation.y += 0.008 * app.animationSpeed * obj.userData.speed;
                obj.rotation.z += 0.003 * app.animationSpeed * obj.userData.speed;
            }
        });
    }
    
    // Update shader time uniforms
    app.objects.forEach((obj) => {
        if (obj.material && obj.material.uniforms && obj.material.uniforms.uTime) {
            obj.material.uniforms.uTime.value = Date.now() * 0.001;
        }
    });
    
    // Update stats and render
    updateStats();
    app.renderer.render(app.scene, app.camera);
}

// ==================== EVENT LISTENERS ====================

window.addEventListener('resize', handleResize, false);

// Prevent double-tap zoom on iOS
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// ==================== STARTUP ====================

window.addEventListener('DOMContentLoaded', () => {
    initScene();
    setupUIControls();
    animate();
});

// Handle visibility changes to pause rendering
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, reduce update frequency
        app.renderer.setAnimationLoop(null);
    } else {
        // Page is visible, resume animation
        animate();
    }
});
