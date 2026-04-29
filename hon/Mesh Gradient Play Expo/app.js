class MeshGradientApp {
    constructor() {
        this.canvas = document.getElementById('gradientCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        this.state = {
            isAnimating: true,
            speed: 1,
            timeScale: 1,
            density: 6,
            warp: 50,
            distortion: 0.5,
            blur: 0,
            noise: 0,
            glow: false,
            saturate: false,
            mode: 'smooth',
            colors: [
                { h: 260, s: 100, l: 60 },
                { h: 200, s: 100, l: 50 },
                { h: 320, s: 100, l: 55 },
                { h: 140, s: 100, l: 45 },
            ]
        };

        this.time = 0;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fps = 60;
        this.frameTime = 0;
        this.meshVertices = [];

        this.setupCanvas();
        this.setupControls();
        this.setupPresets();
        this.initMesh();
        this.animate();

        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.initMesh();
    }

    initMesh() {
        const cols = this.state.density + 1;
        const rows = this.state.density + 1;
        const cellW = this.canvas.width / this.state.density;
        const cellH = this.canvas.height / this.state.density;

        this.meshVertices = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.meshVertices.push({
                    x: x * cellW,
                    y: y * cellH,
                    ox: x * cellW,
                    oy: y * cellH,
                });
            }
        }
    }

    updateMesh() {
        const cols = this.state.density + 1;
        const rows = this.state.density + 1;
        const cellW = this.canvas.width / this.state.density;
        const cellH = this.canvas.height / this.state.density;
        const maxWarp = (Math.max(cellW, cellH) * this.state.warp) / 100;
        const t = (this.time * this.state.speed * this.state.timeScale) / 1000;

        let idx = 0;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const v = this.meshVertices[idx];
                let dx = 0, dy = 0;

                switch (this.state.mode) {
                    case 'smooth':
                        dx = Math.sin(x * 0.2 + t) * Math.cos(y * 0.15 + t * 0.7);
                        dy = Math.cos(x * 0.15 + t * 0.8) * Math.sin(y * 0.2 + t * 0.5);
                        break;
                    case 'chaotic':
                        dx = Math.sin(x * 0.3 + t * 2) * Math.cos(y * 0.2 + t * 1.5) * Math.sin(t * 0.5);
                        dy = Math.cos(x * 0.2 + t * 1.7) * Math.sin(y * 0.3 + t * 2.1);
                        break;
                    case 'pulse':
                        const pulse = Math.sin(t) * 0.5 + 0.5;
                        dx = Math.sin(x * 0.1 + t) * pulse;
                        dy = Math.cos(y * 0.1 + t) * pulse;
                        break;
                    case 'spiral':
                        const angle = Math.atan2(y - this.state.density / 2, x - this.state.density / 2);
                        const dist = Math.hypot(y - this.state.density / 2, x - this.state.density / 2);
                        dx = Math.cos(angle + t) * Math.sin(dist * 0.1 + t);
                        dy = Math.sin(angle + t) * Math.cos(dist * 0.1 + t);
                        break;
                    case 'vortex':
                        const cx = this.state.density / 2;
                        const cy = this.state.density / 2;
                        const vx = x - cx;
                        const vy = y - cy;
                        const r = Math.hypot(vx, vy);
                        const a = Math.atan2(vy, vx) + t * (1 - r / (this.state.density / 2));
                        dx = Math.cos(a) * 0.5;
                        dy = Math.sin(a) * 0.5;
                        break;
                }

                v.x = v.ox + dx * maxWarp * this.state.distortion;
                v.y = v.oy + dy * maxWarp * this.state.distortion;
                idx++;
            }
        }
    }

    getColorAt(px, py) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const dx = (px - cx) / this.canvas.width;
        const dy = (py - cy) / this.canvas.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const idx = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * this.state.colors.length) % this.state.colors.length;
        const c = this.state.colors[idx];

        const t = this.time * this.state.speed * this.state.timeScale / 2000;
        let h = (c.h + Math.sin(t) * 15 + Math.sin(dist * 3 + t) * 10) % 360;
        let s = c.s * (0.7 + Math.cos(dist + t) * 0.3);
        let l = c.l * (0.6 + Math.sin(dist * 2 + t * 1.5) * 0.4);

        if (this.state.saturate) {
            s = Math.min(100, s * 1.3);
            l = Math.max(30, Math.min(70, l));
        }

        return `hsl(${Math.round(h)}, ${Math.round(Math.max(0, Math.min(100, s)))}%, ${Math.round(Math.max(0, Math.min(100, l)))}%)`;
    }

    render() {
        this.updateMesh();

        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let py = 0; py < this.canvas.height; py++) {
            for (let px = 0; px < this.canvas.width; px++) {
                const color = this.getColorAt(px, py);
                const rgb = this.hslToRgb(color);

                const idx = (py * this.canvas.width + px) * 4;
                data[idx] = rgb.r;
                data[idx + 1] = rgb.g;
                data[idx + 2] = rgb.b;
                data[idx + 3] = 255;
            }
        }

        this.ctx.putImageData(imageData, 0, 0);

        if (this.state.blur > 0) {
            this.ctx.filter = `blur(${this.state.blur}px)`;
            this.ctx.drawImage(this.canvas, 0, 0);
            this.ctx.filter = 'none';
        }

        if (this.state.noise > 0) this.applyNoise();
        if (this.state.glow) this.applyGlow();
    }

    applyNoise() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const n = (Math.random() - 0.5) * 255 * this.state.noise;
            data[i] = Math.max(0, Math.min(255, data[i] + n));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyGlow() {
        const temp = document.createElement('canvas');
        temp.width = this.canvas.width;
        temp.height = this.canvas.height;
        temp.getContext('2d').drawImage(this.canvas, 0, 0);
        this.ctx.globalAlpha = 0.4;
        this.ctx.filter = 'blur(25px)';
        this.ctx.drawImage(temp, 0, 0);
        this.ctx.filter = 'none';
        this.ctx.globalAlpha = 1;
    }

    hslToRgb(hsl) {
        const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) return { r: 0, g: 0, b: 0 };

        let h = parseInt(match[1]) / 360;
        let s = parseInt(match[2]) / 100;
        let l = parseInt(match[3]) / 100;

        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    setupControls() {
        // Animation
        document.getElementById('speedSlider').addEventListener('input', e => {
            this.state.speed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.state.speed.toFixed(1);
        });

        document.getElementById('timeScaleSlider').addEventListener('input', e => {
            this.state.timeScale = parseFloat(e.target.value);
            document.getElementById('timeScaleValue').textContent = this.state.timeScale.toFixed(1);
        });

        // Mesh
        document.getElementById('densitySlider').addEventListener('input', e => {
            this.state.density = parseInt(e.target.value);
            document.getElementById('densityValue').textContent = this.state.density;
            this.initMesh();
        });

        document.getElementById('warpSlider').addEventListener('input', e => {
            this.state.warp = parseInt(e.target.value);
            document.getElementById('warpValue').textContent = this.state.warp;
        });

        document.getElementById('distortionSlider').addEventListener('input', e => {
            this.state.distortion = parseFloat(e.target.value);
            document.getElementById('distortionValue').textContent = this.state.distortion.toFixed(2);
        });

        document.getElementById('modeSelect').addEventListener('change', e => {
            this.state.mode = e.target.value;
        });

        // Effects
        document.getElementById('blurSlider').addEventListener('input', e => {
            this.state.blur = parseInt(e.target.value);
            document.getElementById('blurValue').textContent = this.state.blur;
        });

        document.getElementById('noiseSlider').addEventListener('input', e => {
            this.state.noise = parseFloat(e.target.value);
            document.getElementById('noiseValue').textContent = this.state.noise.toFixed(2);
        });

        // Colors
        this.updateColorControls();
    }

    updateColorControls() {
        const grid = document.getElementById('colorGrid');
        grid.innerHTML = '';

        this.state.colors.forEach((c, i) => {
            const div = document.createElement('div');
            div.className = 'color-input';
            
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.background = this.hslToString(c);
            
            const input = document.createElement('input');
            input.type = 'color';
            input.value = this.hslToHex(c);
            input.addEventListener('input', e => {
                const rgb = this.hexToRgb(e.target.value);
                this.state.colors[i] = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
                swatch.style.background = e.target.value;
            });
            
            div.appendChild(swatch);
            div.appendChild(input);
            grid.appendChild(div);
        });
    }

    setupPresets() {
        const presets = [
            { name: 'Sunset', colors: [{ h: 0, s: 100, l: 50 }, { h: 30, s: 100, l: 50 }, { h: 60, s: 100, l: 50 }, { h: 15, s: 100, l: 45 }] },
            { name: 'Ocean', colors: [{ h: 200, s: 100, l: 50 }, { h: 180, s: 100, l: 45 }, { h: 240, s: 100, l: 55 }, { h: 160, s: 100, l: 40 }] },
            { name: 'Aurora', colors: [{ h: 200, s: 100, l: 50 }, { h: 280, s: 100, l: 55 }, { h: 140, s: 100, l: 45 }, { h: 100, s: 100, l: 50 }] },
            { name: 'Cyber', colors: [{ h: 280, s: 100, l: 50 }, { h: 320, s: 100, l: 55 }, { h: 60, s: 100, l: 50 }, { h: 180, s: 100, l: 45 }] },
            { name: 'Forest', colors: [{ h: 120, s: 100, l: 40 }, { h: 100, s: 80, l: 45 }, { h: 140, s: 90, l: 35 }, { h: 80, s: 70, l: 50 }] },
            { name: 'Pastels', colors: [{ h: 280, s: 100, l: 70 }, { h: 60, s: 100, l: 75 }, { h: 200, s: 100, l: 70 }, { h: 0, s: 100, l: 75 }] },
        ];

        const grid = document.getElementById('presetGrid');
        grid.innerHTML = '';
        presets.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'button-base button-secondary preset-btn';
            btn.textContent = p.name;
            btn.onclick = () => {
                this.state.colors = p.colors.map(c => ({ ...c }));
                this.updateColorControls();
            };
            grid.appendChild(btn);
        });
    }

    toggleAnimation() {
        this.state.isAnimating = !this.state.isAnimating;
        const toggle = document.getElementById('playToggle');
        toggle.classList.toggle('active');
        document.getElementById('playStatus').textContent = this.state.isAnimating ? 'Playing' : 'Paused';
    }

    toggleGlow() {
        this.state.glow = !this.state.glow;
        document.getElementById('glowToggle').classList.toggle('active');
    }

    toggleSaturate() {
        this.state.saturate = !this.state.saturate;
        document.getElementById('saturateToggle').classList.toggle('active');
    }

    randomizeColors() {
        this.state.colors = this.state.colors.map(() => ({
            h: Math.random() * 360,
            s: 50 + Math.random() * 50,
            l: 40 + Math.random() * 30
        }));
        this.updateColorControls();
    }

    hslToHex(hsl) {
        const rgb = this.hslToRgb(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
        return '#' + [rgb.r, rgb.g, rgb.b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    hslToString(hsl) {
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
    }

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    downloadPNG() {
        const link = document.createElement('a');
        link.href = this.canvas.toDataURL('image/png');
        link.download = `mesh-gradient-${Date.now()}.png`;
        link.click();
    }

    downloadGIF() {
        alert('GIF export coming soon! For now, use your screen recording tool.');
    }

    copyCode() {
        const code = this.generateCode();
        document.getElementById('exportCode').value = code;
        document.getElementById('codeModal').classList.add('active');
    }

    generateCode() {
        return `// Mesh Gradient Configuration
const config = {
  density: ${this.state.density},
  speed: ${this.state.speed},
  timeScale: ${this.state.timeScale},
  warp: ${this.state.warp},
  distortion: ${this.state.distortion},
  mode: '${this.state.mode}',
  blur: ${this.state.blur},
  noise: ${this.state.noise},
  glow: ${this.state.glow},
  colors: ${JSON.stringify(this.state.colors, null, 2)}
};`;
    }

    copyToClipboard() {
        const text = document.getElementById('exportCode').value;
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    }

    resetDefaults() {
        if (confirm('Reset to defaults?')) {
            this.state = {
                isAnimating: true,
                speed: 1,
                timeScale: 1,
                density: 6,
                warp: 50,
                distortion: 0.5,
                blur: 0,
                noise: 0,
                glow: false,
                saturate: false,
                mode: 'smooth',
                colors: [
                    { h: 260, s: 100, l: 60 },
                    { h: 200, s: 100, l: 50 },
                    { h: 320, s: 100, l: 55 },
                    { h: 140, s: 100, l: 45 },
                ]
            };

            document.getElementById('speedSlider').value = 1;
            document.getElementById('timeScaleSlider').value = 1;
            document.getElementById('densitySlider').value = 6;
            document.getElementById('warpSlider').value = 50;
            document.getElementById('distortionSlider').value = 0.5;
            document.getElementById('blurSlider').value = 0;
            document.getElementById('noiseSlider').value = 0;
            document.getElementById('modeSelect').value = 'smooth';
            document.getElementById('playToggle').classList.add('active');
            document.getElementById('glowToggle').classList.remove('active');
            document.getElementById('saturateToggle').classList.remove('active');

            this.initMesh();
            this.updateColorControls();
            this.setupControls();
        }
    }

    openPreview() {
        alert('Preview mode: Full screen gradient display');
    }

    updateStats(deltaTime) {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;

        if (elapsed > 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            document.getElementById('fpsStat').textContent = this.fps;
            document.getElementById('frameStat').textContent = this.frameTime.toFixed(0) + 'ms';

            const indicator = document.getElementById('indicator');
            const status = document.getElementById('statusText');
            indicator.className = 'status-indicator';
            
            if (this.fps >= 55) {
                indicator.classList.add('indicator-good');
                status.textContent = 'Good';
            } else if (this.fps >= 30) {
                indicator.classList.add('indicator-fair');
                status.textContent = 'Fair';
            } else {
                indicator.classList.add('indicator-poor');
                status.textContent = 'Poor';
            }

            this.frameCount = 0;
            this.lastFrameTime = now;
        }
    }

    animate() {
        const start = performance.now();

        if (this.state.isAnimating) {
            this.time += 16;
        }

        this.render();

        const end = performance.now();
        this.frameTime = end - start;
        this.updateStats(this.frameTime);

        requestAnimationFrame(() => this.animate());
    }
}

const app = new MeshGradientApp();
