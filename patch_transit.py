import re

with open("src/components/ThreeBackground.jsx", "r") as f:
    content = f.read()

transit_func = """    function generateTransit(particleCount) {
        const arr = new Float32Array(particleCount * 3);
        const starRadius = 16;
        const planetRadius = 5;
        // Off-center planet hole to represent mid-transit
        const planetX = 6;
        const planetY = -2;
        
        let i = 0;
        while (i < particleCount) {
            // Generate point in volume of sphere
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            // Bias towards surface for a glowing star look, but keep volume
            const r = Math.pow(Math.random(), 0.5) * starRadius;
            
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            
            // To make a planet silhouette, we carve out a cylindrical hole in the front hemisphere
            const dist2D = Math.sqrt(Math.pow(x - planetX, 2) + Math.pow(y - planetY, 2));
            if (dist2D < planetRadius && z > 0) {
                continue;
            }
            
            arr[i * 3] = x;
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = z;
            i++;
        }
        return arr;
    }"""

# Insert generateTransit before initShapesAndTimeline
content = content.replace("async function initShapesAndTimeline() {", transit_func + "\n\n    async function initShapesAndTimeline() {")

# Replace telescopeShape definition
content = content.replace("const telescopeShape = await generatePointsFromImage('telescope 3d.jpg', PARTICLE_COUNT, 1.0, { edgeDetect: true, edgeThreshold: 15 });", "const transitShape = generateTransit(PARTICLE_COUNT);")

# Replace telescopeShape usage
content = content.replace("updatePositionsToShape(telescopeShape)", "updatePositionsToShape(transitShape)")

with open("src/components/ThreeBackground.jsx", "w") as f:
    f.write(content)
