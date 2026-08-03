// ============================================================
// Antigravity Slope Field — Three.js Loading Sequence
// A GPU-accelerated particle morphing intro for Steve Wong's portfolio
// ============================================================

(function () {
    'use strict';

    // --- Configuration ---
    const PARTICLE_COUNT = 15000;
    const BG_PARTICLE_COUNT = 15000;
    const SHAPE_SCALE = 12;

    // --- DOM References ---
    const container = document.getElementById('loading-canvas-container');
    const canvas = document.getElementById('antigravity-canvas');
    const skipBtn = document.getElementById('skip-intro');

    if (!container || !canvas) return;

    // ============================================================
    // 1. SIMPLEX NOISE (Compact 3D implementation)
    // ============================================================
    const SimplexNoise = (function () {
        const grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        const p = [];
        for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
        const perm = new Array(512);
        for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

        function dot3(g, x, y, z) { return g[0] * x + g[1] * y + g[2] * z; }

        return function noise3D(xin, yin, zin) {
            const F3 = 1.0 / 3.0, G3 = 1.0 / 6.0;
            const s = (xin + yin + zin) * F3;
            const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
            const t = (i + j + k) * G3;
            const X0 = i - t, Y0 = j - t, Z0 = k - t;
            const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;

            let i1, j1, k1, i2, j2, k2;
            if (x0 >= y0) {
                if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
                else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
                else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
            } else {
                if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
                else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
                else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            }

            const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
            const x2 = x0 - i2 + 2.0 * G3, y2 = y0 - j2 + 2.0 * G3, z2 = z0 - k2 + 2.0 * G3;
            const x3 = x0 - 1.0 + 3.0 * G3, y3 = y0 - 1.0 + 3.0 * G3, z3 = z0 - 1.0 + 3.0 * G3;

            const ii = i & 255, jj = j & 255, kk = k & 255;
            const gi0 = perm[ii + perm[jj + perm[kk]]] % 12;
            const gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12;
            const gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12;
            const gi3 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12;

            let n0, n1, n2, n3;
            let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
            n0 = t0 < 0 ? 0.0 : (t0 *= t0, t0 * t0 * dot3(grad3[gi0], x0, y0, z0));
            let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
            n1 = t1 < 0 ? 0.0 : (t1 *= t1, t1 * t1 * dot3(grad3[gi1], x1, y1, z1));
            let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
            n2 = t2 < 0 ? 0.0 : (t2 *= t2, t2 * t2 * dot3(grad3[gi2], x2, y2, z2));
            let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
            n3 = t3 < 0 ? 0.0 : (t3 *= t3, t3 * t3 * dot3(grad3[gi3], x3, y3, z3));

            return 32.0 * (n0 + n1 + n2 + n3);
        };
    })();

    // ============================================================
    // 2. PARAMETRIC SHAPE GENERATORS
    // ============================================================

    function createEmptyArray(count) {
        return new Float32Array(count * 3);
    }

    // 1. Water Bottle (from Water bottle.jpeg)
    function generateBottle(particleCount) {
        const arr = createEmptyArray(particleCount);
        for (let i = 0; i < particleCount; i++) {
            let y = (Math.random() - 0.5) * 30;
            let theta = Math.random() * Math.PI * 2;
            let r = 6;

            if (y > 10 && y <= 12) {
                r = 6 - (y - 10) * 1.5;
            } else if (y > 12 && y <= 14) {
                r = 3;
            } else if (y > 14) {
                r = 3.5;
                if (theta > 0 && theta < Math.PI / 2 && y > 14.5) {
                    r = 3.5 + (Math.random() * 2);
                }
            }

            let radius = Math.random() > 0.8 ? r * Math.random() : r;

            arr[i * 3] = radius * Math.cos(theta);
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = radius * Math.sin(theta);
        }
        return arr;
    }

    // 2. BSA Fleur-de-lis (from bsa logo.webp)
    function generateScoutLogo(particleCount) {
        const arr = createEmptyArray(particleCount);
        for (let i = 0; i < particleCount; i++) {
            let section = Math.random();
            let x, y, z = (Math.random() - 0.5) * 2;

            if (section < 0.4) {
                let h = Math.random() * 20 - 10;
                let w = (10 - Math.abs(h)) * 0.4 * (Math.random() - 0.5);
                x = w; y = h;
            } else if (section < 0.7) {
                let side = section < 0.55 ? -1 : 1;
                let t = Math.random() * Math.PI;
                x = side * (3 + 5 * Math.sin(t)) + (Math.random() - 0.5);
                y = -8 + 15 * Math.cos(t * 0.7) + (Math.random() - 0.5);
            } else if (section < 0.85) {
                x = (Math.random() - 0.5) * 12;
                y = -4 + (Math.random() - 0.5) * 2;
                z += 1.5;
            } else {
                let side = section < 0.925 ? -1 : 1;
                x = side * (2 + Math.random() * 4);
                y = -10 - Math.random() * 4;
            }

            arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
        }
        return arr;
    }

    // 3. Object Detection Bounding Box (from computer vision.jpeg)
    function generateCVBox(particleCount) {
        const arr = createEmptyArray(particleCount);
        for (let i = 0; i < particleCount; i++) {
            let type = Math.random();
            let x, y, z;

            if (type < 0.3) {
                let edge = Math.random();
                let val = (Math.random() - 0.5) * 20;
                if (edge < 0.33) { x = val; y = 10 * Math.sign(Math.random()-0.5); z = 10 * Math.sign(Math.random()-0.5); }
                else if (edge < 0.66) { y = val; x = 10 * Math.sign(Math.random()-0.5); z = 10 * Math.sign(Math.random()-0.5); }
                else { z = val; x = 10 * Math.sign(Math.random()-0.5); y = 10 * Math.sign(Math.random()-0.5); }
            } else if (type < 0.4) {
                x = -10 + Math.random() * 6;
                y = 10 + Math.random() * 2;
                z = 10;
            } else {
                let r = Math.random() * 7;
                let theta = Math.random() * Math.PI * 2;
                let phi = Math.acos((Math.random() * 2) - 1);
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta) - 2;
                z = r * Math.cos(phi);
            }

            arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
        }
        return arr;
    }

    // 4. Observatory Telescope (from telescope 3d model.jpg)
    function generateTelescope(particleCount) {
        const arr = createEmptyArray(particleCount);
        for (let i = 0; i < particleCount; i++) {
            let part = Math.random();
            let x, y, z;

            if (part < 0.3) {
                let theta = Math.random() * Math.PI * 2;
                let r = 8 + (Math.random() * 2);
                y = -15 + Math.random() * 10;
                x = r * Math.cos(theta);
                z = r * Math.sin(theta);
            } else if (part < 0.5) {
                x = (Math.random() - 0.5) * 16;
                y = -5 + Math.random() * 8;
                z = (Math.random() > 0.5 ? -1 : 1) * 6;
            } else if (part < 0.8) {
                let length = (Math.random() - 0.5) * 20;
                let theta = Math.random() * Math.PI * 2;
                let r = 6;
                let tubeX = length * 0.707;
                let tubeY = length * 0.707;
                x = tubeX + r * Math.cos(theta) * 0.707;
                y = tubeY - r * Math.cos(theta) * 0.707;
                z = r * Math.sin(theta);
            } else {
                let theta = Math.random() * Math.PI * 2;
                let r = 6.5;
                x = 10 + r * Math.cos(theta) * 0.707;
                y = 10 - r * Math.cos(theta) * 0.707;
                z = r * Math.sin(theta);
            }

            arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
        }
        return arr;
    }

    // Canvas-based text generator for Steve Wong
    function getTextPositions(text, scale) {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const c = document.createElement('canvas');
        c.width = 800; c.height = 800;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 800, 800);
        ctx.fillStyle = '#fff';
        ctx.font = '900 130px "Inter", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(text, 400, 400);
        const imgData = ctx.getImageData(0, 0, 800, 800).data;
        const px = [];
        for (let y = 0; y < 800; y += 3) {
            for (let x = 0; x < 800; x += 3) {
                if (imgData[(y * 800 + x) * 4] > 50) px.push({ x: (x-400)*0.1, y: -(y-400)*0.1 });
            }
        }
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (px.length > 0) {
                const p = px[Math.floor(Math.random() * px.length)];
                positions[i*3] = (p.x + (Math.random()-0.5)*0.5) * SHAPE_SCALE * scale;
                positions[i*3+1] = (p.y + (Math.random()-0.5)*0.5) * SHAPE_SCALE * scale;
                positions[i*3+2] = (Math.random()-0.5) * 4 * scale;
            } else {
                positions[i*3] = (Math.random()-0.5)*50;
                positions[i*3+1] = (Math.random()-0.5)*50;
                positions[i*3+2] = (Math.random()-0.5)*50;
            }
        }
        return positions;
    }

    // ============================================================
    // 3. THREE.JS SCENE SETUP
    // ============================================================

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d1117, 0.012);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0d1117, 1);

    // ============================================================
    // 4. PARTICLE SYSTEM WITH CUSTOM SHADERS
    // ============================================================

    const geometry = new THREE.BufferGeometry();

    // Initial random "chaos" state
    const startPositions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const randomSeed = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        startPositions[i * 3] = (Math.random() - 0.5) * 60;
        startPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        startPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        targetPositions[i * 3] = startPositions[i * 3];
        targetPositions[i * 3 + 1] = startPositions[i * 3 + 1];
        targetPositions[i * 3 + 2] = startPositions[i * 3 + 2];
        randomSeed[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(startPositions, 3));
    geometry.setAttribute('aTarget', new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomSeed, 1));

    // GLSL Simplex noise (compact)
    const noiseGLSL = `
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;

            i = mod289(i);
            vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);

            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);

            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);

            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
    `;

    const vertexShader = `
        ${noiseGLSL}

        uniform float uTime;
        uniform float uProgress;
        uniform float uDriftStrength;
        uniform float uScale;
        attribute vec3 aTarget;
        attribute float aRandom;

        varying float vAlpha;
        varying float vRandom;

        void main() {
            // Interpolate between current position and target shape
            vec3 pos = mix(position, aTarget, uProgress) * uScale;

            // Slope field drift — fades as particles lock into shape
            float driftFactor = uDriftStrength;
            float noiseScale = 0.04;
            float timeScale = 0.3;

            float nx = snoise(pos * noiseScale + vec3(uTime * timeScale, 0.0, 0.0));
            float ny = snoise(pos * noiseScale + vec3(0.0, uTime * timeScale, 100.0));
            float nz = snoise(pos * noiseScale + vec3(0.0, 0.0, uTime * timeScale + 200.0));

            pos.x += nx * 8.0 * driftFactor;
            pos.y += ny * 8.0 * driftFactor;
            pos.z += nz * 4.0 * driftFactor;

            // Subtle continuous breathing even when formed
            float breathe = snoise(pos * 0.1 + uTime * 0.15) * 0.5 * uProgress;
            pos += vec3(breathe);

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

            // Size attenuation
            float size = mix(2.0, 3.5, uProgress);
            gl_PointSize = size * (50.0 / -mvPosition.z);

            gl_Position = projectionMatrix * mvPosition;

            // Alpha based on distance and progress
            vAlpha = mix(0.3, 0.85, uProgress) + aRandom * 0.15;
            vRandom = aRandom;
        }
    `;

    const fragmentShader = `
        uniform vec3 uColor;
        varying float vAlpha;
        varying float vRandom;

        void main() {
            // Soft dash/vector shape
            vec2 center = gl_PointCoord - vec2(0.5);

            // Rotate to create angled dashes
            float angle = vRandom * 3.14159;
            float cosA = cos(angle);
            float sinA = sin(angle);
            vec2 rotated = vec2(
                center.x * cosA - center.y * sinA,
                center.x * sinA + center.y * cosA
            );

            // Dash shape: narrow rectangle with soft edges
            float dashX = smoothstep(0.5, 0.35, abs(rotated.x));
            float dashY = smoothstep(0.15, 0.05, abs(rotated.y));
            float alpha = dashX * dashY * vAlpha;

            if (alpha < 0.01) discard;

            gl_FragColor = vec4(uColor, alpha);
        }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uProgress: { value: 0.0 },
            uDriftStrength: { value: 1.0 },
            uScale: { value: 1.0 },
            uColor: { value: new THREE.Color(0x58a6ff) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ============================================================
    // 4b. BACKGROUND SLOPE FIELD PARTICLES
    // ============================================================

    const bgGeometry = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(BG_PARTICLE_COUNT * 3);
    const bgRandomSeed = new Float32Array(BG_PARTICLE_COUNT);

    // Spread background particles in a wide, flat field around the scene
    for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
        bgPositions[i * 3] = (Math.random() - 0.5) * 120;
        bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 15; // pushed slightly behind
        bgRandomSeed[i] = Math.random();
    }

    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeometry.setAttribute('aRandom', new THREE.BufferAttribute(bgRandomSeed, 1));

    // Background vertex shader — always drifting, smaller points
    const bgVertexShader = `
        ${noiseGLSL}

        uniform float uTime;
        attribute float aRandom;

        varying float vAlpha;
        varying float vRandom;

        void main() {
            vec3 pos = position;

            // Continuous slope field drift (never locks into shape)
            float noiseScale = 0.02;
            float timeScale = 0.2;

            float nx = snoise(pos * noiseScale + vec3(uTime * timeScale, 0.0, 50.0));
            float ny = snoise(pos * noiseScale + vec3(0.0, uTime * timeScale, 150.0));
            float nz = snoise(pos * noiseScale + vec3(0.0, 0.0, uTime * timeScale + 250.0));

            pos.x += nx * 3.0;
            pos.y += ny * 3.0;
            pos.z += nz * 1.5;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

            // Small points for background
            gl_PointSize = 1.8 * (50.0 / -mvPosition.z);

            gl_Position = projectionMatrix * mvPosition;

            vAlpha = 0.15 + aRandom * 0.1;
            vRandom = aRandom;
        }
    `;

    const bgMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x58a6ff) }
        },
        vertexShader: bgVertexShader,
        fragmentShader: fragmentShader,  // Reuse the same dash fragment shader
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const bgParticles = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(bgParticles);

    // ============================================================
    // 5. SHAPE UPDATE UTILITY
    // ============================================================

    function updatePositionsToShape(shapeArray) {
        const posAttr = geometry.attributes.position;
        const tgtAttr = geometry.attributes.aTarget;

        // Current interpolated positions become new "from" positions
        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
            const from = posAttr.array[i];
            const to = tgtAttr.array[i];
            const progress = material.uniforms.uProgress.value;
            posAttr.array[i] = from + (to - from) * progress;
        }
        posAttr.needsUpdate = true;

        // Set new targets
        for (let i = 0; i < tgtAttr.array.length; i++) {
            tgtAttr.array[i] = shapeArray[i] || (Math.random() - 0.5) * 50;
        }
        tgtAttr.needsUpdate = true;

        // Reset progress to 0 for new morph
        material.uniforms.uProgress.value = 0;
    }

    // ============================================================
    // 6. GENERATE ALL SHAPES
    // ============================================================

    const bottleShape = generateBottle(PARTICLE_COUNT);
    const scoutShape = generateScoutLogo(PARTICLE_COUNT);
    const cvBoxShape = generateCVBox(PARTICLE_COUNT);
    const telescopeShape = generateTelescope(PARTICLE_COUNT);
    const textShape = getTextPositions('Steve Wong', 0.2);

    // ============================================================
    // 7. ANIMATION LOOP
    // ============================================================

    const clock = new THREE.Clock();
    let animationId;

    function animate() {
        animationId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsed;
        bgMaterial.uniforms.uTime.value = elapsed;

        // Sync background color with foreground
        bgMaterial.uniforms.uColor.value.copy(material.uniforms.uColor.value);

        // Gentle oscillating rotation so text remains front-facing
        if (!window.isAligning) {
            particles.rotation.y = Math.sin(elapsed * 0.15) * 0.2;
        }

        // Background oscillates ±15 degrees (0.2618 radians)
        bgParticles.rotation.y = Math.sin(elapsed * 0.3) * 0.2618;
        bgParticles.rotation.x = Math.sin(elapsed * 0.2 + 1.0) * 0.08;

        renderer.render(scene, camera);
    }
    animate();

    // ============================================================
    // 8. GSAP TIMELINE — THE NARRATIVE SEQUENCE
    // ============================================================

    const tl = gsap.timeline({
        delay: 0.5
    });

    // We start with a bit of drift, then settle
    material.uniforms.uDriftStrength.value = 1.0;

    // --- Scene 1: Water Bottle (Fluidity/Aquatics) — Water Blue ---
    tl.add(() => updatePositionsToShape(bottleShape))
        .to(material.uniforms.uColor.value, { r: 0.1, g: 0.5, b: 0.9, duration: 0.5 })
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.0,
            ease: "power2.inOut"
        }, "<")
        .to(material.uniforms.uDriftStrength, {
            value: 0.1,
            duration: 2.0,
            ease: "power2.inOut"
        }, "<")
        .to(camera.position, { z: 40, duration: 2.0, ease: "power2.inOut" }, "<");

    tl.to({}, { duration: 1.5 }); // Hold

    // --- Transition 1 (Explode): Bottle → BSA Scout Logo — Scout Red ---
    tl.to(material.uniforms.uDriftStrength, { value: 8.0, duration: 1.0, ease: "power2.in" })
        .to(material.uniforms.uColor.value, { r: 0.9, g: 0.2, b: 0.2, duration: 1.0 }, "<");

    tl.add(() => updatePositionsToShape(scoutShape))
        .to(material.uniforms.uProgress, { value: 1.0, duration: 1.5, ease: "power2.out" })
        .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 1.5, ease: "power2.out" }, "<")
        .to(camera.position, { z: 45, y: 0, duration: 1.5, ease: "power2.out" }, "<");

    tl.to({}, { duration: 1.5 }); // Hold

    // --- Transition 2 (Implode → Explode): Scout Logo → CV Bounding Box — Green ---
    tl.to(material.uniforms.uScale, { value: 0.01, duration: 1.0, ease: "power3.in" })
        .to(material.uniforms.uColor.value, { r: 0.2, g: 0.9, b: 0.4, duration: 1.0 }, "<");

    tl.add(() => {
        updatePositionsToShape(cvBoxShape);
        material.uniforms.uDriftStrength.value = 15.0;
    })
        .to(material.uniforms.uScale, { value: 1.0, duration: 0.5, ease: "power4.out" })
        .to(material.uniforms.uProgress, { value: 1.0, duration: 1.5, ease: "power2.out" }, "<")
        .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 1.5, ease: "power2.out" }, "<")
        .to(camera.position, { z: 40, y: 0, duration: 1.5, ease: "power2.out" }, "<");

    tl.to(camera.position, { z: 15, duration: 2.0, ease: "power4.in" }); // Zoom into bounding box

    // --- Transition 3 (Explode): CV Box → Telescope — Purple ---
    tl.to(material.uniforms.uDriftStrength, { value: 10.0, duration: 1.0, ease: "power2.in" })
        .to(material.uniforms.uColor.value, { r: 0.73, g: 0.54, b: 1.0, duration: 1.0 }, "<");

    tl.add(() => updatePositionsToShape(telescopeShape))
        .to(material.uniforms.uProgress, { value: 1.0, duration: 2.0, ease: "power2.out" })
        .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 2.0, ease: "power2.out" }, "<")
        .to(camera.position, { z: 50, x: 0, y: 0, duration: 2.0, ease: "elastic.out(1, 0.5)" }, "<");

    tl.to({}, { duration: 1.5 }); // Hold

    // --- Transition 4 (Implode → Explode): Telescope → Steve Wong Text — Blue ---
    tl.to(material.uniforms.uScale, { value: 0.01, duration: 1.0, ease: "power3.in" })
        .to(material.uniforms.uColor.value, { r: 0.345, g: 0.651, b: 1.0, duration: 1.0 }, "<");

    tl.add(() => {
        updatePositionsToShape(textShape);
        material.uniforms.uDriftStrength.value = 12.0;
    })
        .to(material.uniforms.uScale, { value: 1.0, duration: 0.5, ease: "power4.out" })
        .to(material.uniforms.uProgress, { value: 1.0, duration: 2.0, ease: "power2.out" }, "<")
        .to(material.uniforms.uDriftStrength, { value: 0.05, duration: 2.0, ease: "power2.out" }, "<")
        .to(camera.position, { z: 65, y: 0, duration: 2.0, ease: "power2.out" }, "<");

    tl.to({}, { duration: 1.5 }); // Hold on text longer

    // --- Scene 6: Shrink and align exactly to the DOM text ---
    tl.to({}, { 
        duration: 2.0, 
        onStart: () => {
            window.isAligning = true; // Stop the auto-rotation in the render loop
            
            const span = document.querySelector('.hero h1 span') || document.querySelector('.hero h1');
            if (!span) return;
            const rect = span.getBoundingClientRect();
            
            // Screen center of the DOM element
            const targetScreenX = rect.left + rect.width / 2;
            const targetScreenY = rect.top + rect.height / 2;
            
            // Convert to Normalized Device Coordinates (-1 to 1)
            const ndcX = (targetScreenX / window.innerWidth) * 2 - 1;
            const ndcY = -(targetScreenY / window.innerHeight) * 2 + 1;
            
            // Calculate visible world boundaries at z=0 from camera at z=65
            const vFOV = THREE.MathUtils.degToRad(camera.fov);
            const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
            const width = height * camera.aspect;
            
            // The exact world position to move the particles to
            const targetWorldX = ndcX * (width / 2);
            const targetWorldY = ndcY * (height / 2);
            
            // Calculate precise scale to match DOM text width
            // The 3D text is ~168 world units wide at uScale = 1.0
            const particleWorldWidth = 168; 
            const fractionOfScreen = particleWorldWidth / width;
            const targetScale = (rect.width / window.innerWidth) / fractionOfScreen;
            
            // Animate particles to the exact location, scale, and rotation
            gsap.to(particles.position, { x: targetWorldX, y: targetWorldY, duration: 2.0, ease: "power2.inOut" });
            gsap.to(particles.rotation, { y: 0, x: 0, z: 0, duration: 2.0, ease: "power2.inOut" });
            gsap.to(material.uniforms.uScale, { value: targetScale, duration: 2.0, ease: "power2.inOut" });
            
            // Fade out the background particles completely
            gsap.to(bgMaterial.uniforms.uColor.value, { r: 0, g: 0, b: 0, duration: 1.5 });
        }
    });

    // Crossfade the overlay out right as it perfectly lands
    tl.to(container, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: cleanup
    }, "-=0.5");

    // ============================================================
    // 9. REVEAL PORTFOLIO & CLEANUP
    // ============================================================

    function cleanup() {
        container.style.display = 'none';

        // Stop the animation loop
        if (animationId) cancelAnimationFrame(animationId);

        // Dispose Three.js resources
        geometry.dispose();
        material.dispose();
        bgGeometry.dispose();
        bgMaterial.dispose();
        renderer.dispose();
        scene.remove(particles);
        scene.remove(bgParticles);

        // Remove canvas from DOM
        if (canvas.parentNode) canvas.remove();
    }

    // ============================================================
    // 10. SKIP BUTTON & RESIZE HANDLER
    // ============================================================

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            tl.kill();
            gsap.to(container, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                onComplete: cleanup
            });
        });
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();
