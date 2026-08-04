import re

with open("src/components/TextScramble.jsx", "r") as f:
    content = f.read()

# Fix the math logic for progress
fixed_math = """      const elapsed = time - startTime;
      const t = elapsed / duration;
      // easeOutQuart for a very smooth deceleration
      const progress = Math.min(1 - Math.pow(1 - t, 4), 1);"""

content = re.sub(r'      const elapsed = time - startTime;\n      const progress = Math\.min\(Math\.log\(elapsed / duration\), 1\);', fixed_math, content)

with open("src/components/TextScramble.jsx", "w") as f:
    f.write(content)
