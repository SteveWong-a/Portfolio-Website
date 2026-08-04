import re

with open("src/components/ThreeBackground.jsx", "r") as f:
    content = f.read()

# 1. Reduce text size
content = content.replace("const textShape = getTextPositions('Steve Wong', 0.2);", "const textShape = getTextPositions('Steve Wong', 0.12);")

# 2. Hide transit hole in transition 4
transition_4_add = """        tl.add(() => {
            updatePositionsToShape(textShape);
            material.uniforms.uDriftStrength.value = 12.0;
            material.uniforms.uTransitX.value = -1000.0; // Hide the transit hole
        })"""

content = re.sub(r'tl\.add\(\(\) => \{\n\s*updatePositionsToShape\(textShape\);\n\s*material\.uniforms\.uDriftStrength\.value = 12\.0;\n\s*\}\)', transition_4_add, content)

with open("src/components/ThreeBackground.jsx", "w") as f:
    f.write(content)
