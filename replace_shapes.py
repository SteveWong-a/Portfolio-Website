import re

with open("loadingSequence.js", "r") as f:
    content = f.read()

# Replace BG_PARTICLE_COUNT
content = content.replace("const BG_PARTICLE_COUNT = 8000;", "const BG_PARTICLE_COUNT = 15000;")

# Replace the parametric generators with canvas generator
generator_pattern = re.compile(r"// ============================================================\n    // 2\. PARAMETRIC SHAPE GENERATORS\n    // ============================================================.*?// ============================================================\n    // 3\. THREE\.JS SCENE SETUP", re.DOTALL)

new_generator = """// ============================================================
    // 2. CANVAS PIXEL-SAMPLING SHAPE GENERATOR
    // ============================================================

    function getPositionsFromCanvas(text, isIcon = false, yOffset = 0, scale = 1.0) {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const c = document.createElement('canvas');
        c.width = 800;
        c.height = 800;
        const ctx = c.getContext('2d', { willReadFrequently: true });

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 800, 800);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isIcon) {
            ctx.font = '300px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
        } else {
            ctx.font = '900 120px "Inter", sans-serif';
        }

        ctx.fillText(text, 400, 400 + yOffset);

        const imgData = ctx.getImageData(0, 0, 800, 800).data;
        const validPixels = [];

        for (let y = 0; y < 800; y += 3) {
            for (let x = 0; x < 800; x += 3) {
                const r = imgData[(y * 800 + x) * 4];
                const g = imgData[(y * 800 + x) * 4 + 1];
                const b = imgData[(y * 800 + x) * 4 + 2];
                if ((r + g + b) > 50) {
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

# Replace the calls
calls_pattern = re.compile(r"// ============================================================\n    // 6\. GENERATE ALL SHAPES\n    // ============================================================.*?// ============================================================\n    // 7\. ANIMATION LOOP", re.DOTALL)

new_calls = """// ============================================================
    // 6. GENERATE ALL SHAPES (Via Canvas)
    // ============================================================

    // Use emoji for perfect silhouettes across all devices
    const bottleShape = getPositionsFromCanvas('🍼', true, 0, 1.2);
    const poolShape = getPositionsFromCanvas('🌊', true, 0, 1.5);
    const cameraShape = getPositionsFromCanvas('📸', true, 0, 1.3);
    const telescopeShape = getPositionsFromCanvas('🔭🪐', true, 0, 1.2);
    const textShape = getPositionsFromCanvas('Steve Wong', false, 0, 1.2);

    // ============================================================
    // 7. ANIMATION LOOP"""

content = calls_pattern.sub(new_calls, content)

# Replace the timeline
timeline_pattern = re.compile(r"// ============================================================\n    // 8\. GSAP TIMELINE — THE NARRATIVE SEQUENCE\n    // ============================================================.*?// ============================================================\n    // 9\. REVEAL PORTFOLIO & CLEANUP", re.DOTALL)

new_timeline = """// ============================================================
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
            duration: 2.0,
            ease: "power2.inOut"
        })
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

