import re

cursor_content = """"use client";

import { useEffect, useRef } from 'react';

export default function CursorSpotlight() {
  const dotRef = useRef(null);
  const trailRefs = useRef([]);
  const spotlightRef = useRef(null);
  
  useEffect(() => {
    let mouse = { x: -1000, y: -1000 };
    let smoothMouse = { x: -1000, y: -1000 };
    let isHovering = false;
    let currentScale = 1;
    
    // Create an array of 20 points for the trail
    const trail = Array.from({ length: 20 }, () => ({ x: -1000, y: -1000 }));
    
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      const target = e.target;
      isHovering = !!(target.closest('a') || target.closest('button') || target.closest('[role="button"]') || target.closest('.cursor-pointer'));
    };

    // Hide everything if the mouse leaves the window
    const handleMouseLeave = () => {
      mouse = { x: -1000, y: -1000 };
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerleave', handleMouseLeave);

    let rafId;
    const render = () => {
      // 1. Lerp lead cursor scale (1x = 4px, 10x = 40px)
      const targetScale = isHovering ? 10 : 1;
      currentScale += (targetScale - currentScale) * 0.2;
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(${currentScale})`;
        // Toggle opacity/color for the "translucent white circle" effect on hover
        dotRef.current.style.backgroundColor = isHovering ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 1)';
      }

      // 2. Update particle trail
      for (let i = 0; i < trail.length; i++) {
        const point = trail[i];
        const prev = i === 0 ? mouse : trail[i - 1];
        
        if (isHovering) {
          // Coalesce into the center rapidly
          point.x += (mouse.x - point.x) * 0.4;
          point.y += (mouse.y - point.y) * 0.4;
        } else {
          // Springy comet trail following the point ahead of it
          point.x += (prev.x - point.x) * 0.45;
          point.y += (prev.y - point.y) * 0.45;
        }
        
        if (trailRefs.current[i]) {
          const el = trailRefs.current[i];
          // Particles shrink and fade out further down the tail
          const scale = 1 - (i / trail.length);
          const opacity = isHovering ? 0 : scale * 0.8;
          
          el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${scale})`;
          el.style.opacity = opacity;
        }
      }

      // 3. Update radial background spotlight (smooth delay)
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.15;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.15;

      if (spotlightRef.current) {
         spotlightRef.current.style.background = `radial-gradient(circle at ${smoothMouse.x}px ${smoothMouse.y}px, rgba(88, 166, 255, 0.08) 0%, transparent 500px)`;
      }

      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Background Spotlight */}
      <div 
        ref={spotlightRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />
      
      {/* 20 Trail Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          ref={el => trailRefs.current[i] = el}
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999]"
          style={{ mixBlendMode: 'difference', opacity: 0 }}
        />
      ))}

      {/* Lead Cursor (Zero Delay) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1 h-1 bg-white rounded-full pointer-events-none z-[10000]"
        style={{ mixBlendMode: 'difference' }}
      />
    </>
  );
}
"""

with open("src/components/CursorSpotlight.jsx", "w") as f:
    f.write(cursor_content)
