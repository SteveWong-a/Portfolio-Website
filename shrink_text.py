import re

with open("loadingSequence.js", "r") as f:
    content = f.read()

# Add isAligning flag and update animate()
animate_pattern = re.compile(r"// Gentle oscillating rotation so text remains front-facing\n        particles\.rotation\.y = Math\.sin\(elapsed \* 0\.15\) \* 0\.2;")
content = animate_pattern.sub(r"// Gentle oscillating rotation so text remains front-facing\n        if (!window.isAligning) {\n            particles.rotation.y = Math.sin(elapsed * 0.15) * 0.2;\n        }", content)


# Replace Scene 6 with the dynamic DOM alignment
timeline_pattern = re.compile(r"// --- Scene 6: Fade into portfolio ---.*?(?=\s*// ============================================================\n    // 9\. REVEAL PORTFOLIO & CLEANUP)", re.DOTALL)

new_timeline = """// --- Scene 6: Shrink and align exactly to the DOM text ---
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
    }, "-=0.5");"""

content = timeline_pattern.sub(new_timeline, content)

with open("loadingSequence.js", "w") as f:
    f.write(content)
