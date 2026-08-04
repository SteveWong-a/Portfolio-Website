import re

with open("src/components/Hero.jsx", "r") as f:
    content = f.read()

content = content.replace(
    'export default function Hero() {',
    'import TextScramble from "./TextScramble";\n\nexport default function Hero() {'
)

content = content.replace(
    '<span className="text-gradient">Steve Wong</span>',
    '<TextScramble text="Steve Wong" className="text-gradient" />'
)

with open("src/components/Hero.jsx", "w") as f:
    f.write(content)
