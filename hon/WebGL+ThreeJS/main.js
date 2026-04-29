/**
 * WebGL Interactive Playground
 * 
 * A high-performance, mobile-optimized interactive experience combining:
 * 1. Dynamic SVG Mesh Gradient (reactive to pointer)
 * 2. Three.js 3D Scene (interactive 3D object)
 * 
 * Optimizations:
 * - requestAnimationFrame for 60FPS
 * - Efficient geometry and material caching
 * - Touch gesture support
 * - Responsive scaling
 */

import * as THREE from 'three';

// ==========================================
// Configuration
// ==========================================
const CONFIG = {
    // Gradient configuration
    gradient: {
        nodeRadius: 180,
        disturbanceRange: 80,
        returnSpeed: 0.15,
        pointerInfluence: 120,
    },
    // Three.js configuration
    scene: {
        rotationSpeed: 0.005,
        objectScale: 1.5,
    },
    // Performance
    pixelRatio: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance
    targetFPS: 60,
};

// ==========================================
// State Management
// ==========================================
const state = {
    // Pointer input
    pointer: { x: 0, y: 0, isActive: false },
    // Gradient nodes (original positions for interpolation)
    gradientNodesOriginal: [],
    // Animation frame ID
    animationFrameId: null,
    // Scene objects
    scene: null,
    camera: null,
    renderer: null,
    object3d: null,
    // Touch controls
    touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    },
    // Orbit control
    orbitRotation: { x: 0, y: 0 },
};

// ==========================================
// Mesh Gradient - Initialization & Control
// ==========================================

/**
 * Initialize gradient node tracking
 * Store original positions for smooth interpolation
 */
function initGradientNodes() {
    const nodes = document.querySelectorAll('.gradient-node');
    state.gradientNodesOriginal = Array.from(nodes).map((node) => ({
        id: node.id,
        cx: parseFloat(node.getAttribute('cx')),
        cy: parseFloat(node.getAttribute('cy')),
        originalCx: parseFloat(node.getAttribute('cx')),
        originalCy: parseFloat(node.getAttribute('cy')),
        element: node,
    }));
}

/**
 * Update gradient node positions based on pointer movement
 * Creates a smooth, interactive disturbance effect
 */
function updateGradientNodes() {
    if (!state.pointer.isActive) {
        // Smoothly return nodes to original positions
        state.gradientNodesOriginal.forEach((node) => {
            node.cx += (node.originalCx - node.cx) * CONFIG.gradient.returnSpeed;
            node.cy += (node.originalCy - node.cy) * CONFIG.gradient.returnSpeed;

            node.element.setAttribute('cx', node.cx);
            node.element.setAttribute('cy', node.cy);
        });
        return;
    }

    // Apply pointer influence to gradient nodes
    state.gradientNodesOriginal.forEach((node) => {
        const dx = state.pointer.x - node.cx;
        const dy = state.pointer.y - node.cy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.gradient.pointerInfluence) {
            const influence = (1 - distance / CONFIG.gradient.pointerInfluence) * 0.5;
            const moveX = (dx / (distance || 1)) * CONFIG.gradient.disturbanceRange * influence;
            const moveY = (dy / (distance || 1)) * CONFIG.gradient.disturbanceRange * influence;

            node.cx += moveX;
            node.cy += moveY;
        }

        // Smoothly blend toward original position
        node.cx += (node.originalCx - node.cx) * CONFIG.gradient.returnSpeed;
        node.cy += (node.originalCy - node.cy) * CONFIG.gradient.returnSpeed;

        node.element.setAttribute('cx', node.cx);
        node.element.setAttribute('cy', node.cy);
    });
}

// ==========================================
// Three.js Scene - Initialization
// ==========================================

/**
 * Initialize Three.js scene with optimizations for mobile
 */
function initThreeScene() {
    const canvas = document.getElementById('canvas');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x000000);
    state.scene.fog = new THREE.Fog(0x000000, 50, 100);

    // Camera (PerspectiveCamera for better visual impact)
    const aspect = width / height;
    state.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    state.camera.position.z = 3;

    // Renderer with alpha for gradient visibility
    state.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'mediump', // Mobile optimization
    });

    state.renderer.setPixelRatio(CONFIG.pixelRatio);
    state.renderer.setSize(width, height);
    state.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Create 3D object
    create3DObject();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    state.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    state.scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    return canvas;
}

/**
 * Create interactive 3D object
 * Using IcosahedronGeometry with MeshPhysicalMaterial for visual appeal
 * 
 * Customize here:
 * - Change geometry: e.g., new THREE.TorusKnotGeometry()
 * - Change material colors: modify MeshPhysicalMaterial properties
 * - Change scale: modify CONFIG.scene.objectScale or state.object3d.scale
 */
function create3DObject() {
    // Geometry: IcosahedronGeometry with smooth subdivisions
    const geometry = new THREE.IcosahedronGeometry(1, 4);

    // Material: MeshPhysicalMaterial with iridescent effect
    // Change these colors to customize the 3D object appearance:
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x06ffa5,
        emissive: 0xff006e,
        metalness: 0.6,
        roughness: 0.3,
        ior: 1.5,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        wireframe: false,
    });

    state.object3d = new THREE.Mesh(geometry, material);
    state.object3d.scale.set(CONFIG.scene.objectScale, CONFIG.scene.objectScale, CONFIG.scene.objectScale);
    state.scene.add(state.object3d);

    // Store original geometry to prevent memory leaks
    geometry.dispose();
}

/**
 * Handle window resize with debouncing
 */
let resizeTimeout;
function onWindowResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        state.camera.aspect = width / height;
        state.camera.updateProjectionMatrix();

        state.renderer.setSize(width, height);
        state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 200);
}

// ==========================================
// Animation Loop
// ==========================================

/**
 * Main animation loop
 * Uses requestAnimationFrame for smooth 60FPS performance
 */
function animate() {
    state.animationFrameId = requestAnimationFrame(animate);

    // Update gradient
    updateGradientNodes();

    // Update 3D object rotation
    if (state.object3d) {
        // Auto-rotate
        state.object3d.rotation.x += CONFIG.scene.rotationSpeed;
        state.object3d.rotation.y += CONFIG.scene.rotationSpeed * 1.3;

        // Respond to touch/pointer movement (orbit effect)
        state.object3d.rotation.x += state.orbitRotation.x * 0.02;
        state.object3d.rotation.y += state.orbitRotation.y * 0.02;

        // Dampening for smooth interaction
        state.orbitRotation.x *= 0.9;
        state.orbitRotation.y *= 0.9;
    }

    // Render scene
    state.renderer.render(state.scene, state.camera);
}

// ==========================================
// Event Handlers - Pointer Input
// ==========================================

/**
 * Handle pointer/mouse move
 * Updates both gradient and 3D object controls
 */
function onPointerMove(event) {
    // Normalize coordinates to SVG viewBox (0-1200, 0-800)
    const svg = document.querySelector('.mesh-gradient');
    const rect = svg.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;

    state.pointer.x = relX * 1200;
    state.pointer.y = relY * 800;
    state.pointer.isActive = true;

    // Update 3D orbit control
    state.orbitRotation.y += (event.clientX - state.touches.currentX) * 0.5;
    state.orbitRotation.x += (event.clientY - state.touches.currentY) * 0.5;

    state.touches.currentX = event.clientX;
    state.touches.currentY = event.clientY;
}

/**
 * Handle pointer down
 */
function onPointerDown(event) {
    state.pointer.isActive = true;
    state.touches.startX = event.clientX;
    state.touches.startY = event.clientY;
    state.touches.currentX = event.clientX;
    state.touches.currentY = event.clientY;
}

/**
 * Handle pointer up
 */
function onPointerUp(event) {
    state.pointer.isActive = false;
}

/**
 * Handle touch move (mobile)
 */
function onTouchMove(event) {
    if (event.touches.length === 0) return;

    const touch = event.touches[0];
    const svg = document.querySelector('.mesh-gradient');
    const rect = svg.getBoundingClientRect();
    const relX = (touch.clientX - rect.left) / rect.width;
    const relY = (touch.clientY - rect.top) / rect.height;

    state.pointer.x = relX * 1200;
    state.pointer.y = relY * 800;
    state.pointer.isActive = true;

    // Update 3D orbit control for touch
    state.orbitRotation.y += (touch.clientX - state.touches.currentX) * 0.5;
    state.orbitRotation.x += (touch.clientY - state.touches.currentY) * 0.5;

    state.touches.currentX = touch.clientX;
    state.touches.currentY = touch.clientY;
}

/**
 * Handle touch end (mobile)
 */
function onTouchEnd(event) {
    if (event.touches.length === 0) {
        state.pointer.isActive = false;
    }
}

// ==========================================
// Initialization
// ==========================================

/**
 * Initialize the entire playground
 */
function init() {
    // Initialize gradient
    initGradientNodes();

    // Initialize Three.js scene
    initThreeScene();

    // Attach event listeners
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchstart', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    // Start animation loop
    animate();

    console.log('🎨 WebGL Playground initialized!');
    console.log('💡 Customize gradient colors in index.html <stop> elements');
    console.log('💡 Customize 3D object in main.js create3DObject() function');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==========================================
// Cleanup (optional - for Single Page App)
// ==========================================

window.addEventListener('beforeunload', () => {
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
    }
    if (state.renderer) {
        state.renderer.dispose();
    }
});
