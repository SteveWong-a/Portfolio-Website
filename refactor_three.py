import re

with open("src/components/ThreeBackground.jsx", "r") as f:
    content = f.read()

# Replace the IIFE wrapper
content = re.sub(
    r"\(function \(\) \{\s*'use strict';",
    """"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

export default function ThreeBackground() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const skipBtnRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;
        
        let animationId;
        let tl;
""",
    content
)

# Replace document.getElementById
content = content.replace("const canvas = document.getElementById('antigravity-canvas');", "const canvas = canvasRef.current;")
content = content.replace("const container = document.getElementById('loading-canvas-container');", "const container = containerRef.current;")
content = content.replace("const skipBtn = document.getElementById('skip-intro');", "const skipBtn = skipBtnRef.current;")

# Replace cleanup function to also handle React state
content = content.replace("container.style.display = 'none';", "setIsVisible(false);")
content = content.replace("if (canvas.parentNode) canvas.remove();", "")

# The window resize listener needs to be cleaned up
content = content.replace("window.addEventListener('resize', () => {", "const handleResize = () => {")
content = content.replace("        window.addEventListener('resize', () => {\n            camera.aspect = window.innerWidth / window.innerHeight;\n            camera.updateProjectionMatrix();\n            renderer.setSize(window.innerWidth, window.innerHeight);\n        });", "        const handleResize = () => {\n            camera.aspect = window.innerWidth / window.innerHeight;\n            camera.updateProjectionMatrix();\n            renderer.setSize(window.innerWidth, window.innerHeight);\n        };\n        window.addEventListener('resize', handleResize);")

# At the end of initShapesAndTimeline, return the cleanup function
cleanup_return = """
        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            if (tl) tl.kill();
            geometry.dispose();
            material.dispose();
            bgGeometry.dispose();
            bgMaterial.dispose();
            renderer.dispose();
            scene.remove(particles);
            scene.remove(bgParticles);
        };
"""
content = content.replace("    } // end of initShapesAndTimeline", cleanup_return + "\n    } // end of initShapesAndTimeline")

# Execute it and return the cleanup function from useEffect
content = content.replace("    // Start the async initialization\n    initShapesAndTimeline();\n\n})();", "    // Start the async initialization\n    const cleanupFnPromise = initShapesAndTimeline();\n\n    return () => {\n        cleanupFnPromise.then(cleanupFn => {\n            if (cleanupFn) cleanupFn();\n        });\n    };\n    }, []);\n\n    if (!isVisible) return null;\n\n    return (\n        <div ref={containerRef} className=\"fixed inset-0 z-[9999] bg-[#0d1117]\">\n            <canvas ref={canvasRef} className=\"w-full h-full block\" />\n            <button ref={skipBtnRef} className=\"absolute bottom-5 right-5 z-[10000] bg-transparent border border-accent-primary text-accent-primary px-4 py-2 rounded font-inter text-sm cursor-pointer transition-colors hover:bg-accent-primary/15\">\n                Skip Intro\n            </button>\n        </div>\n    );\n}")

with open("src/components/ThreeBackground.jsx", "w") as f:
    f.write(content)
