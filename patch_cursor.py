import re

with open("src/app/globals.css", "r") as f:
    css_content = f.read()

if "cursor: none !important;" not in css_content:
    css_content += "\n* {\n  cursor: none !important;\n}\n"
    with open("src/app/globals.css", "w") as f:
        f.write(css_content)

cursor_jsx = """"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import { useEffect, useState } from 'react';

export default function CursorSpotlight() {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Track raw cursor position
  const rawX = useMotionValue(-1000);
  const rawY = useMotionValue(-1000);
  
  // Apply spring physics for buttery smooth trailing
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);
  
  // Track spotlight size
  const size = useMotionValue(0);
  const smoothSize = useSpring(size, { damping: 20, stiffness: 100 });

  useEffect(() => {
    setIsMounted(true);
    
    const handlePointerMove = (e) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      size.set(500); // Outer size when moving

      // Detect hover on interactive elements
      const target = e.target;
      const isInteractive = target.closest('a') || target.closest('button') || target.closest('[role="button"]') || target.closest('.cursor-pointer');
      setIsHovering(!!isInteractive);
    };

    const handlePointerLeave = () => {
      size.set(0);
      setIsHovering(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    
    // Also track if the cursor leaves the window bounds via mouseout
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget && !e.toElement) {
        size.set(0);
        setIsHovering(false);
      }
    });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [rawX, rawY, size]);

  const background = useMotionTemplate`radial-gradient(circle at ${smoothX}px ${smoothY}px, rgba(88, 166, 255, 0.08) 0%, transparent ${smoothSize}px)`;

  if (!isMounted) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9998]"
        style={{ background }}
      />
      
      {/* Spring Delayed Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] rounded-full border border-white"
        style={{ 
          x: smoothX, 
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          mixBlendMode: "difference"
        }}
        animate={{
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          backgroundColor: isHovering ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0)",
          filter: isHovering ? "blur(2px)" : "blur(0px)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      
      {/* Zero Delay Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10001]"
        style={{ 
          x: rawX, 
          y: rawY,
          translateX: "-50%",
          translateY: "-50%",
          mixBlendMode: "difference"
        }}
      />
    </>
  );
}
"""

with open("src/components/CursorSpotlight.jsx", "w") as f:
    f.write(cursor_jsx)
