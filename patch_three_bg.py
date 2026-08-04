import re

with open("src/components/ThreeBackground.jsx", "r") as f:
    content = f.read()

# Add isStarted prop and tlRef
content = content.replace(
    'export default function ThreeBackground() {',
    'export default function ThreeBackground({ isStarted }) {'
)
content = content.replace(
    'const [isVisible, setIsVisible] = useState(true);',
    'const [isVisible, setIsVisible] = useState(true);\n    const tlRef = useRef(null);\n\n    useEffect(() => {\n        if (isStarted && tlRef.current) {\n            tlRef.current.play();\n        }\n    }, [isStarted]);'
)

# Set timeline to be paused and store it in ref
content = content.replace(
    '        const tl = gsap.timeline({\n            delay: 0.5\n        });',
    '        const tl = gsap.timeline({\n            paused: true,\n            delay: 0.5\n        });\n        tlRef.current = tl;'
)

with open("src/components/ThreeBackground.jsx", "w") as f:
    f.write(content)
