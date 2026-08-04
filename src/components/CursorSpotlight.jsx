"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import { useEffect, useState } from 'react';

export default function CursorSpotlight() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Track cursor position
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  
  // Track spotlight size
  const size = useMotionValue(0);

  // Apply spring physics for buttery smooth trailing
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const smoothSize = useSpring(size, { damping: 20, stiffness: 100 });

  useEffect(() => {
    setIsMounted(true);
    
    const handlePointerMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      size.set(500); // Outer size when moving
    };

    const handlePointerLeave = () => {
      size.set(0);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    
    // Also track if the cursor leaves the window bounds via mouseout
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget && !e.toElement) {
        size.set(0);
      }
    });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [mouseX, mouseY, size]);

  const background = useMotionTemplate`radial-gradient(circle at ${smoothX}px ${smoothY}px, rgba(88, 166, 255, 0.08) 0%, transparent ${smoothSize}px)`;

  if (!isMounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[9999]"
      style={{ background }}
    />
  );
}
