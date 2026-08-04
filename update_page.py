import re

with open("src/app/page.js", "r") as f:
    content = f.read()

content = content.replace(
    "import Dock from '@/components/Dock';", 
    "import Dock from '@/components/Dock';\nimport Navbar from '@/components/Navbar';"
)

content = content.replace(
    "<Dock />", 
    "<Navbar />\n      <Dock />"
)

with open("src/app/page.js", "w") as f:
    f.write(content)
