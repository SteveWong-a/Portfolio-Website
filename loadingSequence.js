// ============================================================
// Antigravity Slope Field — Three.js Loading Sequence
// A GPU-accelerated particle morphing intro for Steve Wong's portfolio
// ============================================================

(function () {
    'use strict';

    // --- Configuration ---
    const PARTICLE_COUNT = 15000;
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

    function generateBottle(count) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const t = Math.random();
            const angle = Math.random() * Math.PI * 2;
            let x, y, z, radius;

            if (t < 0.6) {
                // Body cylinder
                y = (t / 0.6) * 2.0 - 1.0; // -1 to 1
                radius = 0.4 + Math.sin((y + 1) * Math.PI * 0.5) * 0.05;
                x = Math.cos(angle) * radius;
                z = Math.sin(angle) * radius;
                // Fill interior sparsely
                const fillRand = Math.random();
                x *= fillRand * 0.3 + 0.7;
                z *= fillRand * 0.3 + 0.7;
            } else if (t < 0.85) {
                // Neck taper
                const nt = (t - 0.6) / 0.25;
                y = 1.0 + nt * 0.8;
                radius = 0.4 - nt * 0.2;
                x = Math.cos(angle) * radius;
                z = Math.sin(angle) * radius;
            } else {
                // Cap / top
                const ct = (t - 0.85) / 0.15;
                y = 1.8 + ct * 0.3;
                radius = 0.2;
                x = Math.cos(angle) * radius * (1.0 - ct * 0.3);
                z = Math.sin(angle) * radius * (1.0 - ct * 0.3);
            }

            positions[i * 3] = x * SHAPE_SCALE;
            positions[i * 3 + 1] = y * SHAPE_SCALE - SHAPE_SCALE * 0.5;
            positions[i * 3 + 2] = z * SHAPE_SCALE;
        }
        return positions;
    }

    function generateSwimmer(count) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const part = Math.random();
            let x, y, z;
            const angle = Math.random() * Math.PI * 2;
            const rand = Math.random();

            if (part < 0.15) {
                // Head
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.random() * Math.PI;
                const r = 0.3 * Math.cbrt(Math.random());
                x = r * Math.sin(theta) * Math.cos(phi) + 1.8;
                y = r * Math.sin(theta) * Math.sin(phi) + 0.3;
                z = r * Math.cos(theta);
            } else if (part < 0.4) {
                // Torso (horizontal ellipsoid for swimming pose)
                const tLen = rand * 1.6;
                const tRad = 0.25 * Math.sqrt(1 - Math.pow((tLen / 1.6 - 0.5) * 2, 2));
                x = tLen;
                y = Math.cos(angle) * tRad;
                z = Math.sin(angle) * tRad;
            } else if (part < 0.55) {
                // Right arm (extended forward)
                const aLen = rand * 1.2;
                x = 1.4 + aLen * 0.8;
                y = 0.5 + aLen * 0.4;
                z = Math.cos(angle) * 0.08;
            } else if (part < 0.7) {
                // Left arm (back stroke position)
                const aLen = rand * 1.0;
                x = 0.6 - aLen * 0.5;
                y = 0.3 + aLen * 0.5;
                z = Math.cos(angle) * 0.08;
            } else if (part < 0.85) {
                // Right leg
                const lLen = rand * 1.2;
                x = -lLen * 0.3;
                y = -0.15 - lLen * 0.15;
                z = 0.15 + Math.cos(angle) * 0.07;
            } else {
                // Left leg
                const lLen = rand * 1.2;
                x = -lLen * 0.3;
                y = -0.1 + lLen * 0.1;
                z = -0.15 + Math.cos(angle) * 0.07;
            }

            positions[i * 3] = x * SHAPE_SCALE - SHAPE_SCALE * 0.8;
            positions[i * 3 + 1] = y * SHAPE_SCALE;
            positions[i * 3 + 2] = z * SHAPE_SCALE;
        }
        return positions;
    }

    function generateCamera(count) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const part = Math.random();
            let x, y, z;
            const angle = Math.random() * Math.PI * 2;

            if (part < 0.45) {
                // Camera body (box)
                x = (Math.random() - 0.5) * 1.6;
                y = (Math.random() - 0.5) * 1.0;
                z = (Math.random() - 0.5) * 0.8;
                // Push to surface
                const face = Math.floor(Math.random() * 6);
                if (face === 0) x = 0.8;
                else if (face === 1) x = -0.8;
                else if (face === 2) y = 0.5;
                else if (face === 3) y = -0.5;
                else if (face === 4) z = 0.4;
                else z = -0.4;
            } else if (part < 0.8) {
                // Lens cylinder
                const lLen = Math.random() * 0.9;
                const lRad = 0.35 - lLen * 0.08;
                x = 0.8 + lLen;
                y = Math.cos(angle) * lRad;
                z = Math.sin(angle) * lRad;
            } else if (part < 0.9) {
                // Viewfinder bump
                x = (Math.random() - 0.5) * 0.4;
                y = 0.5 + Math.random() * 0.35;
                z = (Math.random() - 0.5) * 0.3;
            } else {
                // Flash hotshoe
                x = -0.3 + Math.random() * 0.15;
                y = 0.5 + Math.random() * 0.15;
                z = (Math.random() - 0.5) * 0.2;
            }

            positions[i * 3] = x * SHAPE_SCALE;
            positions[i * 3 + 1] = y * SHAPE_SCALE;
            positions[i * 3 + 2] = z * SHAPE_SCALE;
        }
        return positions;
    }

    function generateTelescope(count) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const part = Math.random();
            let x, y, z;
            const angle = Math.random() * Math.PI * 2;

            if (part < 0.55) {
                // Main tube (tilted 30 degrees)
                const tLen = Math.random() * 3.0;
                const tRad = 0.25 + (tLen / 3.0) * 0.15;
                const fillRand = Math.random() * 0.3 + 0.7;
                const localX = Math.cos(angle) * tRad * fillRand;
                const localY = Math.sin(angle) * tRad * fillRand;
                // Tilt along the x/y axis
                x = tLen * Math.cos(0.5) + localX;
                y = tLen * Math.sin(0.5) + localY;
                z = Math.cos(angle) * tRad * 0.3;
            } else if (part < 0.7) {
                // Tripod leg 1
                const legLen = Math.random() * 2.0;
                x = -legLen * 0.5;
                y = -legLen;
                z = 0.3 + Math.random() * 0.05;
            } else if (part < 0.85) {
                // Tripod leg 2
                const legLen = Math.random() * 2.0;
                x = -legLen * 0.3;
                y = -legLen;
                z = -0.3 + Math.random() * 0.05;
            } else {
                // Tripod leg 3 (back leg)
                const legLen = Math.random() * 2.0;
                x = 0.3 + legLen * 0.2;
                y = -legLen;
                z = Math.random() * 0.05;
            }

            positions[i * 3] = x * SHAPE_SCALE * 0.7;
            positions[i * 3 + 1] = y * SHAPE_SCALE * 0.7 + SHAPE_SCALE * 0.3;
            positions[i * 3 + 2] = z * SHAPE_SCALE * 0.7;
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
        attribute vec3 aTarget;
        attribute float aRandom;

        varying float vAlpha;
        varying float vRandom;

        void main() {
            // Interpolate between current position and target shape
            vec3 pos = mix(position, aTarget, uProgress);

            // Slope field drift — fades as particles lock into shape
            float driftFactor = (1.0 - uProgress) * uDriftStrength;
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
    const swimmerShape = generateSwimmer(PARTICLE_COUNT);
    const cameraShape = generateCamera(PARTICLE_COUNT);
    const telescopeShape = generateTelescope(PARTICLE_COUNT);

    // ============================================================
    // 7. ANIMATION LOOP
    // ============================================================

    const clock = new THREE.Clock();
    let animationId;

    function animate() {
        animationId = requestAnimationFrame(animate);
        material.uniforms.uTime.value = clock.getElapsedTime();

        // Gentle rotation of the whole particle system
        particles.rotation.y += 0.001;

        renderer.render(scene, camera);
    }
    animate();

    // ============================================================
    // 8. GSAP TIMELINE — THE NARRATIVE SEQUENCE
    // ============================================================

    const tl = gsap.timeline({
        delay: 0.5,
        onComplete: revealPortfolio
    });

    // --- Scene 1: Chaos → Water Bottle ---
    tl.add(() => updatePositionsToShape(bottleShape))
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.5,
            ease: "power2.inOut"
        })
        .to(camera.position, { z: 35, duration: 2.5, ease: "power2.inOut" }, "<");

    // Hold on bottle
    tl.to({}, { duration: 1.0 });

    // --- Scene 2: Bottle → Swimmer (color shifts to green) ---
    tl.add(() => {
        updatePositionsToShape(swimmerShape);
    })
        .to(material.uniforms.uColor.value, {
            r: 0.247, g: 0.725, b: 0.314,
            duration: 1.5, ease: "power1.inOut"
        })
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.5,
            ease: "power2.inOut"
        }, "<")
        .to(camera.position, { z: 40, y: -3, duration: 2.5, ease: "power2.inOut" }, "<");

    // Hold on swimmer
    tl.to({}, { duration: 1.0 });

    // --- Scene 3: Swimmer → Camera (color back to blue, zoom into lens) ---
    tl.add(() => {
        updatePositionsToShape(cameraShape);
    })
        .to(material.uniforms.uColor.value, {
            r: 0.345, g: 0.651, b: 1.0,
            duration: 1.5, ease: "power1.inOut"
        })
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.5,
            ease: "power2.inOut"
        }, "<")
        .to(camera.position, { z: 30, y: 0, duration: 2.5, ease: "power2.inOut" }, "<");

    // Zoom into camera lens
    tl.to(camera.position, { z: 8, x: 8, duration: 2.0, ease: "power4.in" });

    // --- Scene 4: Camera → Telescope (snap back, purple color) ---
    tl.add(() => {
        updatePositionsToShape(telescopeShape);
    })
        .to(material.uniforms.uColor.value, {
            r: 0.737, g: 0.549, b: 1.0,
            duration: 1.5, ease: "power1.inOut"
        })
        .to(camera.position, {
            z: 55, x: 0, y: 5,
            duration: 2.0,
            ease: "elastic.out(1, 0.6)"
        }, "<")
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.5,
            ease: "power2.inOut"
        }, "<");

    // Hold on telescope
    tl.to({}, { duration: 1.2 });

    // --- Scene 5: Disperse and zoom out to reveal portfolio ---
    tl.to(material.uniforms.uProgress, {
        value: 0.0,
        duration: 1.5,
        ease: "power2.in"
    })
        .to(material.uniforms.uDriftStrength, {
            value: 3.0,
            duration: 1.5,
            ease: "power2.in"
        }, "<")
        .to(camera.position, {
            z: 200,
            duration: 1.5,
            ease: "power2.in"
        }, "<");

    // ============================================================
    // 9. REVEAL PORTFOLIO & CLEANUP
    // ============================================================

    function revealPortfolio() {
        gsap.to(container, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.out",
            onComplete: cleanup
        });
    }

    function cleanup() {
        container.style.display = 'none';

        // Stop the animation loop
        if (animationId) cancelAnimationFrame(animationId);

        // Dispose Three.js resources
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        scene.remove(particles);

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
