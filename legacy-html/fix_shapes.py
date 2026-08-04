import re

with open("loadingSequence.js", "r") as f:
    content = f.read()

# Replace the generator with draw-based generator
generator_pattern = re.compile(r"// ============================================================\n    // 2\. CANVAS PIXEL-SAMPLING SHAPE GENERATOR\n    // ============================================================.*?// ============================================================\n    // 3\. THREE\.JS SCENE SETUP", re.DOTALL)

new_generator = """// ============================================================
    // 2. CANVAS PIXEL-SAMPLING SHAPE GENERATOR
    // ============================================================

    function getPositionsFromDrawing(drawFn, scale = 1.0) {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const c = document.createElement('canvas');
        c.width = 800;
        c.height = 800;
        const ctx = c.getContext('2d', { willReadFrequently: true });

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 800, 800);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.save();
        ctx.translate(400, 400); // Center
        drawFn(ctx);
        ctx.restore();

        const imgData = ctx.getImageData(0, 0, 800, 800).data;
        const validPixels = [];

        for (let y = 0; y < 800; y += 3) {
            for (let x = 0; x < 800; x += 3) {
                const r = imgData[(y * 800 + x) * 4];
                if (r > 50) {
                    validPixels.push({ x: (x - 400) * 0.1, y: -(y - 400) * 0.1 });
                }
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (validPixels.length > 0) {
                const p = validPixels[Math.floor(Math.random() * validPixels.length)];
                
                const depthNoise = (Math.random() - 0.5) * 4;
                const scatterX = (Math.random() - 0.5) * 0.5;
                const scatterY = (Math.random() - 0.5) * 0.5;

                positions[i * 3] = (p.x + scatterX) * SHAPE_SCALE * scale;
                positions[i * 3 + 1] = (p.y + scatterY) * SHAPE_SCALE * scale;
                positions[i * 3 + 2] = depthNoise * scale;
            } else {
                positions[i * 3] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            }
        }
        return positions;
    }

    // ============================================================
    // 3. THREE.JS SCENE SETUP"""

content = generator_pattern.sub(new_generator, content)

# Fix the shader drift factor
shader_pattern = re.compile(r"float driftFactor = \(1\.0 - uProgress\) \* uDriftStrength;")
content = shader_pattern.sub(r"float driftFactor = uDriftStrength;", content)

# Update the shape calls
calls_pattern = re.compile(r"// ============================================================\n    // 6\. GENERATE ALL SHAPES \(Via Canvas\)\n    // ============================================================.*?// ============================================================\n    // 7\. ANIMATION LOOP", re.DOTALL)

new_calls = """// ============================================================
    // 6. GENERATE ALL SHAPES (Via Canvas Drawing)
    // ============================================================

    const bottleShape = getPositionsFromDrawing((ctx) => {
        // Bottle silhouette
        ctx.beginPath();
        ctx.roundRect(-40, -100, 80, 200, 20); // body
        ctx.fill();
        ctx.fillRect(-20, -150, 40, 60); // neck
        ctx.fillRect(-30, -160, 60, 20); // cap
    }, 0.8);

    const poolShape = getPositionsFromDrawing((ctx) => {
        // Pool / Waves
        ctx.beginPath();
        for (let x = -150; x <= 150; x += 10) {
            const y = Math.sin(x * 0.05) * 20 - 40;
            x === -150 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        for (let x = 150; x >= -150; x -= 10) {
            const y = Math.sin(x * 0.05 + Math.PI) * 20 + 40;
            x === 150 ? ctx.lineTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }, 1.2);

    const cameraShape = getPositionsFromDrawing((ctx) => {
        // Camera
        ctx.fillRect(-120, -70, 240, 140); // body
        ctx.fillRect(-40, -100, 80, 30); // flash
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2); // lens
        ctx.fillStyle = '#000000'; // cut out
        ctx.fill();
        ctx.fillStyle = '#ffffff';
    }, 0.9);

    const telescopeShape = getPositionsFromDrawing((ctx) => {
        // Telescope
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        ctx.fillRect(-100, -30, 200, 60); // tube
        ctx.restore();
        // Planet
        ctx.beginPath();
        ctx.arc(150, -100, 40, 0, Math.PI * 2);
        ctx.fill();
        // Ring
        ctx.beginPath();
        ctx.ellipse(150, -100, 70, 15, Math.PI / 8, 0, Math.PI * 2);
        ctx.stroke();
    }, 0.9);

    const textShape = getPositionsFromDrawing((ctx) => {
        ctx.font = '900 130px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Steve Wong', 0, 0);
    }, 0.9);

    // ============================================================
    // 7. ANIMATION LOOP"""

content = calls_pattern.sub(new_calls, content)

# Timeline fixes
timeline_pattern = re.compile(r"// ============================================================\n    // 8\. GSAP TIMELINE — THE NARRATIVE SEQUENCE\n    // ============================================================.*?// ============================================================\n    // 9\. REVEAL PORTFOLIO & CLEANUP", re.DOTALL)

new_timeline = """// ============================================================
    // 8. GSAP TIMELINE — THE NARRATIVE SEQUENCE
    // ============================================================

    const tl = gsap.timeline({
        delay: 0.5,
        onComplete: revealPortfolio
    });

    // We start with a bit of drift, then settle
    material.uniforms.uDriftStrength.value = 1.0;

    // --- Scene 1: Chaos → Water Bottle ---
    tl.add(() => updatePositionsToShape(bottleShape))
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.0,
            ease: "power2.inOut"
        })
        .to(material.uniforms.uDriftStrength, {
            value: 0.1, // settle into shape
            duration: 2.0,
            ease: "power2.inOut"
        }, "<")
        .to(camera.position, { z: 45, duration: 2.0, ease: "power2.inOut" }, "<");

    tl.to({}, { duration: 0.8 }); // Hold

    // --- Scene 2: Bottle → Swimming Pool (Waves) (color shifts to green) ---
    tl.add(() => updatePositionsToShape(poolShape))
        .to(material.uniforms.uColor.value, {
            r: 0.247, g: 0.725, b: 0.314,
            duration: 1.5, ease: "power1.inOut"
        })
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.0,
            ease: "power2.inOut"
        }, "<")
        .to(camera.position, { z: 50, y: -2, duration: 2.0, ease: "power2.inOut" }, "<");

    tl.to({}, { duration: 0.8 }); // Hold

    // --- Scene 3: Pool → Camera (color back to blue, zoom into lens) ---
    tl.add(() => updatePositionsToShape(cameraShape))
        .to(material.uniforms.uColor.value, {
            r: 0.345, g: 0.651, b: 1.0,
            duration: 1.5, ease: "power1.inOut"
        })
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.0,
            ease: "power2.inOut"
        }, "<")
        .to(camera.position, { z: 40, y: 0, duration: 2.0, ease: "power2.inOut" }, "<");

    tl.to(camera.position, { z: 12, x: 8, duration: 1.5, ease: "power4.in" }); // Zoom into lens

    // --- Scene 4: Camera → Telescope & Planet (snap back, purple color) ---
    tl.add(() => updatePositionsToShape(telescopeShape))
        .to(material.uniforms.uColor.value, {
            r: 0.737, g: 0.549, b: 1.0,
            duration: 1.5, ease: "power1.inOut"
        })
        .to(camera.position, {
            z: 55, x: 0, y: 3,
            duration: 2.0,
            ease: "elastic.out(1, 0.6)"
        }, "<")
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.0,
            ease: "power2.inOut"
        }, "<");

    tl.to({}, { duration: 0.8 }); // Hold

    // --- Scene 5: Telescope → Steve Wong Text (bright blue) ---
    tl.add(() => updatePositionsToShape(textShape))
        .to(material.uniforms.uColor.value, {
            r: 0.345, g: 0.651, b: 1.0,
            duration: 1.5, ease: "power1.inOut"
        })
        .to(material.uniforms.uProgress, {
            value: 1.0,
            duration: 2.0,
            ease: "power2.inOut"
        }, "<")
        .to(camera.position, {
            z: 65, y: 0,
            duration: 2.0,
            ease: "power2.inOut"
        }, "<");

    tl.to({}, { duration: 1.2 }); // Hold on text

    // --- Scene 6: Disperse and zoom out to reveal portfolio ---
    tl.to(material.uniforms.uProgress, {
        value: 0.0,
        duration: 1.5,
        ease: "power2.in"
    })
        .to(material.uniforms.uDriftStrength, {
            value: 4.0,
            duration: 1.5,
            ease: "power2.in"
        }, "<")
        .to(camera.position, {
            z: 200,
            duration: 1.5,
            ease: "power2.in"
        }, "<");

    // ============================================================
    // 9. REVEAL PORTFOLIO & CLEANUP"""

content = timeline_pattern.sub(new_timeline, content)

with open("loadingSequence.js", "w") as f:
    f.write(content)

