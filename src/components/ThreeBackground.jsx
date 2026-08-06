// ============================================================
// Antigravity Slope Field — Three.js Loading Sequence
// A GPU-accelerated particle morphing intro for Steve Wong's portfolio
// ============================================================

"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useReducedMotion, useScroll, useVelocity, useSpring } from 'motion/react';
import { useStore } from '@/store/useStore';
import { useGalleryStore } from '@/store/useGalleryStore';

export default function ThreeBackground({ isStarted }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const skipBtnRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const tlRef = useRef(null);

    const isPanelOpen = useStore(state => state.isPanelOpen);
    const isPanelOpenRef = useRef(isPanelOpen);
    const shouldReduceMotion = useReducedMotion();
    const reduceMotionRef = useRef(shouldReduceMotion);

    // Framer Motion scroll velocity tracking
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

    useEffect(() => {
        isPanelOpenRef.current = isPanelOpen;
    }, [isPanelOpen]);

    useEffect(() => {
        reduceMotionRef.current = shouldReduceMotion;
    }, [shouldReduceMotion]);

    useEffect(() => {
        if (isStarted && tlRef.current) {
            tlRef.current.play();
        }
    }, [isStarted]);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;
        
        let animationId;
        let tl;


    // --- Configuration ---
    const PARTICLE_COUNT = 20000;
    const BG_PARTICLE_COUNT = 15000;
    const SHAPE_SCALE = 12;

    // --- DOM References ---
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const skipBtn = skipBtnRef.current;

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

    function getStarSystemPositions(particleCount) {
        const arr = new Float32Array(particleCount * 3);
        const coreCount = Math.floor(particleCount * 0.4);
        const ring1Count = Math.floor(particleCount * 0.3);
        const ring2Count = particleCount - coreCount - ring1Count;

        // Core Sphere
        for (let i = 0; i < coreCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = Math.pow(Math.random(), 0.3) * 6; // Dense core
            arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            arr[i * 3 + 2] = r * Math.cos(phi);
        }

        // Ring 1 (Tilted)
        for (let i = coreCount; i < coreCount + ring1Count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = 12 + (Math.random() - 0.5) * 4;
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            const y = z * Math.sin(0.4) + (Math.random() - 0.5) * 0.5;
            arr[i * 3] = x;
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = z * Math.cos(0.4);
        }

        // Ring 2 (Tilted opposite)
        for (let i = coreCount + ring1Count; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = 20 + (Math.random() - 0.5) * 6;
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            const y = z * Math.sin(-0.3) + (Math.random() - 0.5) * 0.5;
            arr[i * 3] = x;
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = z * Math.cos(-0.3);
        }
        return arr;
    }

    function getNeuralGraphPositions(particleCount) {
        const arr = new Float32Array(particleCount * 3);
        const nodeCount = 8;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: (Math.random() - 0.5) * 40,
                y: (Math.random() - 0.5) * 40,
                z: (Math.random() - 0.5) * 40
            });
        }

        for (let i = 0; i < particleCount; i++) {
            const type = Math.random();
            if (type < 0.6) {
                // Cluster around a node
                const node = nodes[Math.floor(Math.random() * nodeCount)];
                const r = Math.random() * 4;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2.0 * Math.random() - 1.0);
                arr[i * 3] = node.x + r * Math.sin(phi) * Math.cos(theta);
                arr[i * 3 + 1] = node.y + r * Math.sin(phi) * Math.sin(theta);
                arr[i * 3 + 2] = node.z + r * Math.cos(phi);
            } else {
                // Connections between random pairs of nodes
                const nodeA = nodes[Math.floor(Math.random() * nodeCount)];
                const nodeB = nodes[Math.floor(Math.random() * nodeCount)];
                const t = Math.random();
                arr[i * 3] = nodeA.x + (nodeB.x - nodeA.x) * t + (Math.random() - 0.5) * 1.5;
                arr[i * 3 + 1] = nodeA.y + (nodeB.y - nodeA.y) * t + (Math.random() - 0.5) * 1.5;
                arr[i * 3 + 2] = nodeA.z + (nodeB.z - nodeA.z) * t + (Math.random() - 0.5) * 1.5;
            }
        }
        return arr;
    }

    function getFluidRipplePositions(particleCount) {
        const arr = new Float32Array(particleCount * 3);
        const size = Math.ceil(Math.sqrt(particleCount));
        const spacing = 1.0;
        const offset = (size * spacing) / 2;

        for (let i = 0; i < particleCount; i++) {
            const row = Math.floor(i / size);
            const col = i % size;
            const x = (col * spacing) - offset;
            const z = (row * spacing) - offset;
            const dist = Math.sqrt(x*x + z*z);
            const y = Math.sin(dist * 0.3) * 4.0;
            
            arr[i * 3] = x;
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = z;
        }
        return arr;
    }

    function getDefaultFieldPositions(particleCount) {
        const arr = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 60;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        return arr;
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

    // 2. Image Pixel Sampler (supports standard color filter + edge detection mode)
    function generatePointsFromImage(imageSrc, particleCount, scale = 1.0, options = {}) {
        const { edgeDetect = false, edgeThreshold = 15 } = options;
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageSrc;

            img.onload = () => {
                const c = document.createElement('canvas');
                const ctx = c.getContext('2d');

                const width = 200;
                const height = Math.round((img.height / img.width) * width);
                c.width = width;
                c.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                const imageData = ctx.getImageData(0, 0, width, height).data;

                // Helper: get luminance at pixel (x, y)
                function lum(px, py) {
                    if (px < 0 || px >= width || py < 0 || py >= height) return 0;
                    const idx = (py * width + px) * 4;
                    return 0.299 * imageData[idx] + 0.587 * imageData[idx + 1] + 0.114 * imageData[idx + 2];
                }

                const validPoints = [];

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let isValid = false;

                        if (edgeDetect) {
                            // Sobel-like gradient magnitude for edge detection
                            const gx = -lum(x - 1, y - 1) - 2 * lum(x - 1, y) - lum(x - 1, y + 1)
                                + lum(x + 1, y - 1) + 2 * lum(x + 1, y) + lum(x + 1, y + 1);
                            const gy = -lum(x - 1, y - 1) - 2 * lum(x, y - 1) - lum(x + 1, y - 1)
                                + lum(x - 1, y + 1) + 2 * lum(x, y + 1) + lum(x + 1, y + 1);
                            const mag = Math.sqrt(gx * gx + gy * gy);
                            isValid = mag > edgeThreshold;
                        } else {
                            // Standard: filter out transparent or pure white pixels
                            const idx = (y * width + x) * 4;
                            const r = imageData[idx];
                            const g = imageData[idx + 1];
                            const b = imageData[idx + 2];
                            const a = imageData[idx + 3];
                            isValid = a > 10 && (r < 245 || g < 245 || b < 245);
                        }

                        if (isValid) {
                            let pX = (x - width / 2) * 0.22 * scale;
                            let pY = -(y - height / 2) * 0.22 * scale;
                            validPoints.push({ x: pX, y: pY });
                        }
                    }
                }

                const arr = new Float32Array(particleCount * 3);
                for (let i = 0; i < particleCount; i++) {
                    const targetPoint = validPoints[Math.floor(Math.random() * validPoints.length)];
                    if (targetPoint) {
                        arr[i * 3] = targetPoint.x;
                        arr[i * 3 + 1] = targetPoint.y;
                        arr[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
                    }
                }
                resolve(arr);
            };

            // Fallback if image fails to load
            img.onerror = () => {
                console.warn(`Image "${imageSrc}" not found, using fallback shape`);
                const arr = new Float32Array(particleCount * 3);
                for (let i = 0; i < particleCount; i++) {
                    const theta = Math.random() * Math.PI * 2;
                    const r = Math.random() * 10;
                    arr[i * 3] = r * Math.cos(theta);
                    arr[i * 3 + 1] = r * Math.sin(theta);
                    arr[i * 3 + 2] = (Math.random() - 0.5) * 2;
                }
                resolve(arr);
            };
        });
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
                if (edge < 0.33) { x = val; y = 10 * Math.sign(Math.random() - 0.5); z = 10 * Math.sign(Math.random() - 0.5); }
                else if (edge < 0.66) { y = val; x = 10 * Math.sign(Math.random() - 0.5); z = 10 * Math.sign(Math.random() - 0.5); }
                else { z = val; x = 10 * Math.sign(Math.random() - 0.5); y = 10 * Math.sign(Math.random() - 0.5); }
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
                if (imgData[(y * 800 + x) * 4] > 50) px.push({ x: (x - 400) * 0.1, y: -(y - 400) * 0.1 });
            }
        }
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (px.length > 0) {
                const p = px[Math.floor(Math.random() * px.length)];
                positions[i * 3] = (p.x + (Math.random() - 0.5) * 0.5) * SHAPE_SCALE * scale;
                positions[i * 3 + 1] = (p.y + (Math.random() - 0.5) * 0.5) * SHAPE_SCALE * scale;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 4 * scale;
            } else {
                positions[i * 3] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
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
    // 3.5. POST-PROCESSING (Vanilla Implementation)
    // ============================================================

    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        samples: 4 // Enable MSAA on the render target if supported
    });

    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadScene = new THREE.Scene();
    const quadGeo = new THREE.PlaneGeometry(2, 2);

    const postMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: renderTarget.texture },
            uOffset: { value: 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float uOffset;
            varying vec2 vUv;

            // Subtle noise function for film grain
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                vec2 uv = vUv;
                
                // Chromatic Aberration split based on scroll velocity
                vec4 cr = texture2D(tDiffuse, uv + vec2(uOffset, uOffset * 0.5));
                vec4 cga = texture2D(tDiffuse, uv);
                vec4 cb = texture2D(tDiffuse, uv - vec2(uOffset, uOffset * 0.5));
                
                // Extract bleeding edges
                vec3 edgeGreenRGB = max(vec3(0.0), cr.rgb - cga.rgb);
                vec3 edgeOrangeRGB = max(vec3(0.0), cb.rgb - cga.rgb);
                
                // Convert edge to a scalar intensity since the base shapes are Cyan (lacking Red)
                float intensityGreen = max(edgeGreenRGB.r, max(edgeGreenRGB.g, edgeGreenRGB.b));
                float intensityOrange = max(edgeOrangeRGB.r, max(edgeOrangeRGB.g, edgeOrangeRGB.b));
                
                // Colorize the edges for Data Telemetry
                vec3 neonGreen = vec3(0.22, 1.0, 0.08); // #39FF14
                vec3 techOrange = vec3(0.91, 0.29, 0.15); // #E84A27
                
                vec3 finalColor = cga.rgb;
                finalColor += intensityGreen * neonGreen * 2.0;
                finalColor += intensityOrange * techOrange * 1.0;
                
                vec4 color = vec4(finalColor, cga.a);
                
                // Subtle film grain noise
                float noise = (random(uv) - 0.5) * 0.05;
                color.rgb += noise;
                
                gl_FragColor = color;
            }
        `
    });

    const quadMesh = new THREE.Mesh(quadGeo, postMaterial);
    quadScene.add(quadMesh);

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
        uniform float uTransitX;
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

            pos.x += nx * 12.0 * driftFactor;
            pos.y += ny * 12.0 * driftFactor;
            pos.z += nz * 6.0 * driftFactor;

            // Subtle continuous breathing even when formed
            float breathe = snoise(pos * 0.1 + uTime * 0.15) * 0.5 * uProgress;
            pos += vec3(breathe);

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

            // Size attenuation
                        // Size attenuation
            float size = mix(2.0, 3.5, uProgress);
            
            // Dynamic Exoplanet Transit Cutout
            // If the point is in the front hemisphere and inside the moving planet radius
            if (pos.z > -2.0) {
                float dist2D = distance(pos.xy, vec2(uTransitX, -2.0));
                if (dist2D < 5.0) {
                    size = 0.0;
                }
            }

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
            uScale: { value: 1.5 },
            uTransitX: { value: -50.0 },
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

            pos.x += nx * 6.0;
            pos.y += ny * 6.0;
            pos.z += nz * 3.0;

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
    // 6. GENERATE ALL SHAPES (async for image loading)
    // ============================================================

            function generateTransit(particleCount) {
        const arr = new Float32Array(particleCount * 3);
        const starRadius = 16;
        
        let i = 0;
        while (i < particleCount) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = Math.pow(Math.random(), 0.5) * starRadius;
            
            arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            arr[i * 3 + 2] = r * Math.cos(phi);
            i++;
        }
        return arr;
    }



    async function initShapesAndTimeline() {
        const dispatchProgress = (val) => {
            window.dispatchEvent(new CustomEvent('three-load-progress', { detail: { progress: val } }));
        };
        dispatchProgress(10);
        
        // Emulate some loading time so the user can see the cool loader
        await new Promise(resolve => setTimeout(resolve, 300));
        dispatchProgress(30);

        const bottleShape = generateBottle(PARTICLE_COUNT);
        dispatchProgress(45);
        
        const cvBoxShape = generateCVBox(PARTICLE_COUNT);
        dispatchProgress(60);
        
        const textShape = getTextPositions('Steve Wong', 0.2);
        dispatchProgress(75);

        // Await the image-sampled shapes
        const eagleShape = await generatePointsFromImage('boyscout.webp', PARTICLE_COUNT, 1.0);
        dispatchProgress(90);
        
        const transitShape = generateTransit(PARTICLE_COUNT);
        dispatchProgress(100);



        // ============================================================
        // 7. ANIMATION LOOP
        // ============================================================

        const clock = new THREE.Clock();
        let animationId;
        
        // Elite Performance Monitor
        let frameCount = 0;
        let lastTime = performance.now();
        let hasDegraded = false;
        let staticElapsed = 0; // Frozen time for reduced motion
        
        // Velocity Tracker
        let lastScrollY = window.scrollY;
        let currentAberration = 0;

        function animate() {
            animationId = requestAnimationFrame(animate);
            if (isPanelOpenRef.current) return;
            
            // FPS Monitoring
            const now = performance.now();
            frameCount++;
            if (now - lastTime >= 1000) { // Check every 1 second
                const fps = frameCount;
                frameCount = 0;
                lastTime = now;
                
                // If FPS is critically low, trigger elite degradation
                if (fps < 55 && !hasDegraded && useGalleryStore.getState().isIntroFinished) {
                    console.log("[Elite Performance] Framerate dropped below 55fps. Degrading quality.");
                    hasDegraded = true;
                    // Lower device pixel ratio
                    renderer.setPixelRatio(1);
                    // Slice the particle count from 20,000 to 3,000 without destroying buffers
                    geometry.setDrawRange(0, 3000);
                    bgGeometry.setDrawRange(0, 3000);
                    // Disable expensive drift noise
                    material.uniforms.uDriftStrength.value = 0.0;
                }
            }

            const dt = clock.getDelta();
            
            if (reduceMotionRef.current) {
                // Freeze time for reduced motion
                material.uniforms.uTime.value = staticElapsed;
                bgMaterial.uniforms.uTime.value = staticElapsed;
            } else {
                staticElapsed += dt;
                material.uniforms.uTime.value = staticElapsed;
                bgMaterial.uniforms.uTime.value = staticElapsed;
            }

            // Sync background color with foreground
            bgMaterial.uniforms.uColor.value.copy(material.uniforms.uColor.value);

            // Gentle oscillating rotation so text remains front-facing
            if (!window.isAligning && !reduceMotionRef.current) {
                particles.rotation.y = Math.sin(staticElapsed * 0.15) * 0.2;
            }

            // Background oscillates ±15 degrees (0.2618 radians)
            if (!reduceMotionRef.current) {
                bgParticles.rotation.y = Math.sin(staticElapsed * 0.3) * 0.2618;
                bgParticles.rotation.x = Math.sin(staticElapsed * 0.2 + 1.0) * 0.08;
            }

            // 1. Render main scene to the render target
            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, camera);
            
            // 2. Track Scroll Velocity for Signature Post-Processing
            if (!reduceMotionRef.current && useGalleryStore.getState().isIntroFinished) {
                // Read from Framer Motion's useSpring value directly
                const velocity = smoothVelocity.get();
                
                // Cap the target aberration. A fast scroll is ~3000px/s velocity.
                // Map that velocity to a max aberration of 0.1
                const targetAberration = Math.min(Math.abs(velocity) * 0.00003, 0.1);
                
                // The spring already smooths it, so we can just apply it directly
                postMaterial.uniforms.uOffset.value = targetAberration;
            } else {
                postMaterial.uniforms.uOffset.value = 0.0;
            }

            // 3. Render full-screen quad to the actual screen
            renderer.setRenderTarget(null);
            renderer.render(quadScene, orthoCamera);
        }
        animate();

        // ============================================================
        // 8. GSAP TIMELINE — THE NARRATIVE SEQUENCE
        // ============================================================

        const tl = gsap.timeline({
            paused: true,
            delay: 0.5
        });
        tlRef.current = tl;

        const unsubscribeGallery = useGalleryStore.subscribe(
            (state, prevState) => {
                // Do not interrupt the majestic intro animation
                if (!state.isIntroFinished) return;
                
                if (state.activeShape !== prevState.activeShape) {
                    let newTarget;
                    switch (state.activeShape) {
                        case 'STAR_SYSTEM': newTarget = getStarSystemPositions(PARTICLE_COUNT); break;
                        case 'NEURAL_GRAPH': newTarget = getNeuralGraphPositions(PARTICLE_COUNT); break;
                        case 'FLUID_RIPPLE': newTarget = getFluidRipplePositions(PARTICLE_COUNT); break;
                        case 'DEFAULT_FIELD':
                        default: newTarget = getDefaultFieldPositions(PARTICLE_COUNT); break;
                    }

                    // Reset mesh transforms from the intro text alignment so new shapes are visible
                    gsap.to(particles.position, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.out" });
                    gsap.to(material.uniforms.uScale, { value: 1.5, duration: 1.2, ease: "power2.out" });
                    gsap.to(bgMaterial.uniforms.uColor.value, { r: 0.345, g: 0.651, b: 1.0, duration: 1.2 });
                    window.isAligning = false; // Restore normal rotation

                    updatePositionsToShape(newTarget);
                    
                    gsap.killTweensOf(material.uniforms.uProgress);
                    gsap.to(material.uniforms.uProgress, {
                        value: 1.0,
                        duration: 1.2,
                        ease: "expo.out"
                    });
                }
            }
        );

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

        // --- Transition 1 (Explode): Bottle → Eagle Scout Medal — Metallic Silver-Blue ---
        tl.to(material.uniforms.uDriftStrength, { value: 8.0, duration: 1.0, ease: "power2.in" })
            .to(material.uniforms.uColor.value, { r: 0.85, g: 0.9, b: 0.95, duration: 1.0 }, "<");

        tl.add(() => updatePositionsToShape(eagleShape))
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
            .to(material.uniforms.uScale, { value: 1.5, duration: 0.5, ease: "power4.out" })
            .to(material.uniforms.uProgress, { value: 1.0, duration: 1.5, ease: "power2.out" }, "<")
            .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 1.5, ease: "power2.out" }, "<")
            .to(camera.position, { z: 40, y: 0, duration: 1.5, ease: "power2.out" }, "<");

        tl.to(camera.position, { z: 15, duration: 2.0, ease: "power4.in" }); // Zoom into bounding box

        // --- Transition 3 (Explode): CV Box → Telescope — Purple ---
        tl.to(material.uniforms.uDriftStrength, { value: 10.0, duration: 1.0, ease: "power2.in" })
            .to(material.uniforms.uColor.value, { r: 0.73, g: 0.54, b: 1.0, duration: 1.0 }, "<");

                tl.add(() => {
            updatePositionsToShape(transitShape);
            material.uniforms.uTransitX.value = -20.0;
        })
            .to(material.uniforms.uProgress, { value: 1.0, duration: 2.0, ease: "power2.out" })
            .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 2.0, ease: "power2.out" }, "<")
            .to(camera.position, { z: 50, x: 0, y: 0, duration: 2.0, ease: "elastic.out(1, 0.5)" }, "<")
            .to(material.uniforms.uTransitX, { value: 20.0, duration: 3.5, ease: "linear" }, "<");

        tl.to({}, { duration: 0.0 }); // Hold

        // --- Transition 4 (Implode → Explode): Telescope → Steve Wong Text — Blue ---
        tl.to(material.uniforms.uScale, { value: 0.01, duration: 1.0, ease: "power3.in" })
            .to(material.uniforms.uColor.value, { r: 0.345, g: 0.651, b: 1.0, duration: 1.0 }, "<");

                tl.add(() => {
            updatePositionsToShape(textShape);
            material.uniforms.uDriftStrength.value = 12.0;
            material.uniforms.uTransitX.value = -1000.0; // Hide the transit hole
        })
            .to(material.uniforms.uScale, { value: 1.5, duration: 0.5, ease: "power4.out" })
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
            onComplete: () => {
                cleanup();
            }
        }, "-=0.5");

        // ============================================================
        // 9. REVEAL PORTFOLIO & CLEANUP
        // ============================================================

        function cleanup() {
            // Push container to the background and make it transparent to reveal page
            if (container) {
                container.style.zIndex = "-30";
                container.style.backgroundColor = "transparent";
                gsap.to(container, { opacity: 1, duration: 0.5 });
            }
            if (skipBtn) {
                skipBtn.style.display = "none";
            }
            
            // Mark intro as finished so Gallery scroll sync can take over
            useGalleryStore.getState().setIntroFinished(true);

            // Import Motion scroll and map page scroll progress to camera
            import('motion').then(({ scroll }) => {
                scroll((progress) => {
                    // progress is 0 to 1
                    // Move the camera down and tilt it as the user scrolls
                    camera.position.y = -(progress * 20); 
                    camera.rotation.x = progress * (Math.PI / 4); 
                });
            });
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
                    onComplete: () => {
                        window.dispatchEvent(new CustomEvent('start-scramble'));
                        cleanup();
                    }
                });
            });
        }

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderTarget.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            unsubscribeGallery();
            window.removeEventListener('resize', handleResize);
            if (animationId) cancelAnimationFrame(animationId);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            bgGeometry.dispose();
            bgMaterial.dispose();
            postMaterial.dispose();
            quadGeo.dispose();
            renderTarget.dispose();
            scene.remove(particles);
            scene.remove(bgParticles);
            if (tl) tl.kill();
        };

    } // end of initShapesAndTimeline

    // Start the async initialization
    const cleanupFnPromise = initShapesAndTimeline();

    return () => {
        cleanupFnPromise.then(cleanupFn => {
            if (cleanupFn) cleanupFn();
        });
    };
    }, []);

    if (!isVisible) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#0d1117]">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <button ref={skipBtnRef} className="absolute bottom-5 right-5 z-[10000] bg-transparent border border-accent-primary text-accent-primary px-4 py-2 rounded font-inter text-sm cursor-pointer transition-colors hover:bg-accent-primary/15">
                Skip Intro
            </button>
        </div>
    );
}
