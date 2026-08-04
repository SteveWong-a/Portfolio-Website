import re

with open("src/components/CursorSpotlight.jsx", "r") as f:
    content = f.read()

# Replace the hollow ring drawing logic
# From `// 2. Draw outer hollow ring (delayed)` to just before `// 3. Draw core vector ball (Zero delay)`

# We'll just replace the whole section
content = re.sub(
    r'// 2\. Draw outer hollow ring \(delayed\).*?// 3\. Draw core vector ball \(Zero delay\)',
    '// 2. Draw core vector ball (Zero delay)',
    content,
    flags=re.DOTALL
)

# And if isHovering, we can make the core vector ball scale up a bit
content = content.replace(
    'ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);',
    'ctx.arc(mouse.x, mouse.y, isHovering ? 12 : 3, 0, Math.PI * 2);'
)

with open("src/components/CursorSpotlight.jsx", "w") as f:
    f.write(content)
