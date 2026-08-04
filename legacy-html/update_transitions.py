import re

with open("loadingSequence.js", "r") as f:
    content = f.read()

# 1. Add uScale to vertex shader
vertex_pattern = re.compile(r"uniform float uProgress;\n        uniform float uDriftStrength;")
content = vertex_pattern.sub(r"uniform float uProgress;\n        uniform float uDriftStrength;\n        uniform float uScale;", content)

pos_pattern = re.compile(r"vec3 pos = mix\(position, aTarget, uProgress\);")
content = pos_pattern.sub(r"vec3 pos = mix(position, aTarget, uProgress) * uScale;", content)

# 2. Add uScale to material uniforms
uniforms_pattern = re.compile(r"uDriftStrength: \{ value: 1\.0 \},")
content = uniforms_pattern.sub(r"uDriftStrength: { value: 1.0 },\n            uScale: { value: 1.0 },", content)

# 3. Fix the particle rotation in animate()
animate_pattern = re.compile(r"// Gentle rotation of the foreground particle system\n        particles\.rotation\.y \+= 0\.001;")
content = animate_pattern.sub(r"// Gentle oscillating rotation so text remains front-facing\n        particles.rotation.y = Math.sin(elapsed * 0.15) * 0.2;", content)

# 4. Rewrite the GSAP timeline for explode/implode transitions
timeline_pattern = re.compile(r"// --- Scene 1: Chaos → Water Bottle ---.*?(?=\s*// ============================================================\n    // 9\. REVEAL PORTFOLIO & CLEANUP)", re.DOTALL)

new_timeline = """// --- Scene 1: Chaos → Water Bottle ---
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

    tl.to({}, { duration: 1.0 }); // Hold

    // --- Transition 1 (Explode): Bottle → Swimming Pool ---
    // EXPLODE OUT
    tl.to(material.uniforms.uDriftStrength, { value: 8.0, duration: 1.0, ease: "power2.in" })
      .to(material.uniforms.uColor.value, { r: 0.247, g: 0.725, b: 0.314, duration: 1.0 }, "<"); // Color shifts mid-explosion

    // SWAP SHAPE AND PULL TOGETHER
    tl.add(() => updatePositionsToShape(poolShape))
      .to(material.uniforms.uProgress, { value: 1.0, duration: 1.5, ease: "power2.out" })
      .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 1.5, ease: "power2.out" }, "<")
      .to(camera.position, { z: 50, y: -2, duration: 1.5, ease: "power2.out" }, "<");

    tl.to({}, { duration: 1.0 }); // Hold

    // --- Transition 2 (Implode -> Explode): Pool → Camera ---
    // IMPLODE INWARD (Suck into a single point)
    tl.to(material.uniforms.uScale, { value: 0.01, duration: 1.0, ease: "power3.in" })
      .to(material.uniforms.uColor.value, { r: 0.345, g: 0.651, b: 1.0, duration: 1.0 }, "<"); 

    // SWAP SHAPE, EXPLODE OUT, THEN SETTLE
    tl.add(() => {
        updatePositionsToShape(cameraShape);
        material.uniforms.uDriftStrength.value = 15.0; // High drift for explosion
    })
      .to(material.uniforms.uScale, { value: 1.0, duration: 0.5, ease: "power4.out" })
      .to(material.uniforms.uProgress, { value: 1.0, duration: 1.5, ease: "power2.out" }, "<")
      .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 1.5, ease: "power2.out" }, "<")
      .to(camera.position, { z: 40, y: 0, duration: 1.5, ease: "power2.out" }, "<");

    tl.to(camera.position, { z: 12, x: 8, duration: 1.5, ease: "power4.in" }); // Zoom into lens

    // --- Transition 3 (Explode): Camera → Telescope & Planet ---
    // EXPLODE OUT
    tl.to(material.uniforms.uDriftStrength, { value: 10.0, duration: 1.0, ease: "power2.in" })
      .to(material.uniforms.uColor.value, { r: 0.737, g: 0.549, b: 1.0, duration: 1.0 }, "<");

    // SWAP AND ASSEMBLE
    tl.add(() => updatePositionsToShape(telescopeShape))
      .to(material.uniforms.uProgress, { value: 1.0, duration: 1.5, ease: "power2.out" })
      .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 1.5, ease: "power2.out" }, "<")
      .to(camera.position, { z: 55, x: 0, y: 3, duration: 1.5, ease: "elastic.out(1, 0.6)" }, "<");

    tl.to({}, { duration: 1.0 }); // Hold

    // --- Transition 4 (Implode -> Explode): Telescope → Steve Wong Text ---
    // IMPLODE INWARD
    tl.to(material.uniforms.uScale, { value: 0.01, duration: 1.0, ease: "power3.in" })
      .to(material.uniforms.uColor.value, { r: 0.345, g: 0.651, b: 1.0, duration: 1.0 }, "<"); 

    // SWAP SHAPE, EXPLODE OUT TO TEXT
    tl.add(() => {
        updatePositionsToShape(textShape);
        material.uniforms.uDriftStrength.value = 12.0;
    })
      .to(material.uniforms.uScale, { value: 1.0, duration: 0.5, ease: "power4.out" })
      .to(material.uniforms.uProgress, { value: 1.0, duration: 2.0, ease: "power2.out" }, "<")
      .to(material.uniforms.uDriftStrength, { value: 0.05, duration: 2.0, ease: "power2.out" }, "<") // Very low drift for readable text
      .to(camera.position, { z: 65, y: 0, duration: 2.0, ease: "power2.out" }, "<");

    tl.to({}, { duration: 1.5 }); // Hold on text longer

    // --- Scene 6: Disperse and zoom out to reveal portfolio ---
    tl.to(material.uniforms.uProgress, { value: 0.0, duration: 1.5, ease: "power2.in" })
      .to(material.uniforms.uDriftStrength, { value: 8.0, duration: 1.5, ease: "power2.in" }, "<")
      .to(camera.position, { z: 200, duration: 1.5, ease: "power2.in" }, "<");
"""

content = timeline_pattern.sub(new_timeline, content)

with open("loadingSequence.js", "w") as f:
    f.write(content)

