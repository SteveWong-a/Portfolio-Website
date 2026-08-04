import re

cursor_content = """"use client";

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export default function CursorSpotlight() {
  const canvasRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // For the glass hover circle
  const rawX = useMotionValue(-1000);
  const rawY = useMotionValue(-1000);
  const smoothX = useSpring(rawX, { damping: 25, stiffness: 120, mass: 0.5 });
  const smoothY = useSpring(rawY, { damping: 25, stiffness: 120, mass: 0.5 });

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouse = { x: -1000, y: -1000 };
    let lastMouse = { x: -1000, y: -1000 };
    let smoothMouse = { x: -1000, y: -1000 };
    let hoverState = false;
    let isVisible = false;

    // Trail particles
    const particles = [];

    const handlePointerMove = (e) => {
      // Sync React motion values for glass circle
      rawX.set(e.clientX);
      rawY.set(e.clientY);

      if (isVisible && lastMouse.x !== -1000) {
          const dx = e.clientX - lastMouse.x;
          const dy = e.clientY - lastMouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Interpolate points to create a dense trail regardless of mouse polling rate
          const spawnSpacing = 1.5; // Spawn a particle every 1.5 pixels
          const numParticles = Math.floor(dist / spawnSpacing);
          
          for (let i = 0; i <= numParticles; i++) {
              const fraction = numParticles === 0 ? 1 : i / numParticles;
              particles.push({
                  x: lastMouse.x + dx * fraction + (Math.random() - 0.5) * 6,
                  y: lastMouse.y + dy * fraction + (Math.random() - 0.5) * 6,
                  age: 0,
                  maxAge: 20 + Math.random() * 40 // random life span
              });
          }
      } else {
          // Just spawn one if not moving much but just entered
          particles.push({ x: e.clientX, y: e.clientY, age: 0, maxAge: 40 });
      }

      lastMouse.x = e.clientX;
      lastMouse.y = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isVisible = true;

      const target = e.target;
      const interactive = !!(target.closest('a') || target.closest('button') || target.closest('[role="button"]') || target.closest('.cursor-pointer'));
      
      if (hoverState !== interactive) {
          hoverState = interactive;
          setIsHovering(interactive);
      }
    };

    const handlePointerLeave = () => { isVisible = false; };
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget && !e.toElement) isVisible = false;
    });

    let rafId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.15;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.15;

      if (isVisible || particles.length > 0) {
          ctx.globalCompositeOperation = 'source-over';
          
          // Spotlight gradient
          const grd = ctx.createRadialGradient(smoothMouse.x, smoothMouse.y, 0, smoothMouse.x, smoothMouse.y, 500);
          grd.addColorStop(0, "rgba(88, 166, 255, 0.08)");
          grd.addColorStop(1, "rgba(88, 166, 255, 0)");
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, width, height);

          ctx.globalCompositeOperation = 'difference';

          // 1. Draw Dense Trail Particles
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 1;
          for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];
              p.age += 1;
              
              if (p.age > p.maxAge) {
                  particles.splice(i, 1);
                  continue;
              }
              
              const life = 1 - (p.age / p.maxAge);
              const size = 3.5 * life; // Size decays
              
              ctx.beginPath();
              ctx.globalAlpha = life;
              ctx.moveTo(p.x - size, p.y);
              ctx.lineTo(p.x + size, p.y);
              ctx.moveTo(p.x, p.y - size);
              ctx.lineTo(p.x, p.y + size);
              ctx.stroke();
          }
          ctx.globalAlpha = 1.0;

          // 2. Draw core vector ball (hide when hovering over something, since the glass circle takes over)
          if (isVisible) {
              ctx.beginPath();
              // When hovering, shrink the solid dot out of the way so the glass effect is dominant
              ctx.arc(mouse.x, mouse.y, hoverState ? 1 : 3, 0, Math.PI * 2);
              ctx.fillStyle = "white";
              ctx.fill();
          }
      }

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />
      
      {/* Glass Hover Effect Circle */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center overflow-hidden"
        style={{ 
          x: smoothX, 
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ width: 8, height: 8, opacity: 0 }}
        animate={{
          width: isHovering ? 64 : 8,
          height: isHovering ? 64 : 8,
          opacity: isHovering ? 1 : 0,
          backgroundColor: isHovering ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0)",
          backdropFilter: isHovering ? "blur(8px)" : "blur(0px)",
          border: isHovering ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0)",
          boxShadow: isHovering ? "0 4px 30px rgba(0, 0, 0, 0.1)" : "none"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </>
  );
}
"""

with open("src/components/CursorSpotlight.jsx", "w") as f:
    f.write(cursor_content)
