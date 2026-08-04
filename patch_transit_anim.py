import re

with open("src/components/ThreeBackground.jsx", "r") as f:
    content = f.read()

# 1. Update generateTransit to return a full sphere (no cutout)
new_generate_transit = """    function generateTransit(particleCount) {
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
    }"""

content = re.sub(r'function generateTransit\(particleCount\) \{.*?(?=async function initShapesAndTimeline)', new_generate_transit + '\n\n    ', content, flags=re.DOTALL)

# 2. Add uTransitX to uniform
content = content.replace("uScale: { value: 1.5 },", "uScale: { value: 1.5 },\n            uTransitX: { value: -50.0 },")
content = content.replace("uniform float uScale;", "uniform float uScale;\n        uniform float uTransitX;")

# 3. Add shader cutout logic
shader_cutout = """            // Size attenuation
            float size = mix(2.0, 3.5, uProgress);
            
            // Dynamic Exoplanet Transit Cutout
            // If the point is in the front hemisphere and inside the moving planet radius
            if (pos.z > -2.0) {
                float dist2D = distance(pos.xy, vec2(uTransitX, -2.0));
                if (dist2D < 5.0) {
                    size = 0.0;
                }
            }

            gl_PointSize = size * (50.0 / -mvPosition.z);"""
content = content.replace("float size = mix(2.0, 3.5, uProgress);\n            gl_PointSize = size * (50.0 / -mvPosition.z);", shader_cutout)

# 4. Animate uTransitX
timeline_update = """        tl.add(() => {
            updatePositionsToShape(transitShape);
            material.uniforms.uTransitX.value = -20.0;
        })
            .to(material.uniforms.uProgress, { value: 1.0, duration: 2.0, ease: "power2.out" })
            .to(material.uniforms.uDriftStrength, { value: 0.1, duration: 2.0, ease: "power2.out" }, "<")
            .to(camera.position, { z: 50, x: 0, y: 0, duration: 2.0, ease: "elastic.out(1, 0.5)" }, "<")
            .to(material.uniforms.uTransitX, { value: 20.0, duration: 3.5, ease: "linear" }, "<");"""

# Replace the tl.add for transitShape
content = re.sub(r'tl\.add\(\(\) => updatePositionsToShape\(transitShape\)\).*?tl\.to\(\{.*?\}, \{ duration: 1\.5 \}\); // Hold', timeline_update + '\n\n        tl.to({}, { duration: 0.0 }); // Hold', content, flags=re.DOTALL)

with open("src/components/ThreeBackground.jsx", "w") as f:
    f.write(content)
