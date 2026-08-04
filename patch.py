with open("src/components/ThreeBackground.jsx", "r") as f:
    content = f.read()

content = content.replace("'boyscout.jpeg'", "'boyscout.webp'")

# Add progress tracking
progress_code = """
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
"""

content = content.replace("    async function initShapesAndTimeline() {", progress_code)
content = content.replace("        const bottleShape = generateBottle(PARTICLE_COUNT);\n        const cvBoxShape = generateCVBox(PARTICLE_COUNT);\n        const textShape = getTextPositions('Steve Wong', 0.2);\n\n        // Await the image-sampled shapes\n        const eagleShape = await generatePointsFromImage('boyscout.webp', PARTICLE_COUNT, 1.0);\n        const transitShape = generateTransit(PARTICLE_COUNT);", "")

with open("src/components/ThreeBackground.jsx", "w") as f:
    f.write(content)
