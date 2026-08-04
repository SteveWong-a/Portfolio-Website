import re

with open("src/app/page.js", "r") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import ThreeBackground from '@/components/ThreeBackground';",
    "import ThreeBackground from '@/components/ThreeBackground';\nimport InitializerOverlay from '@/components/InitializerOverlay';"
)

# Add state
content = content.replace(
    "  const [selectedProject, setSelectedProject] = useState(null);",
    "  const [selectedProject, setSelectedProject] = useState(null);\n  const [isStarted, setIsStarted] = useState(false);"
)

# Add component to return block
content = content.replace(
    "      <ThreeBackground />",
    "      <InitializerOverlay onStart={() => setIsStarted(true)} />\n      <ThreeBackground isStarted={isStarted} />"
)

with open("src/app/page.js", "w") as f:
    f.write(content)
