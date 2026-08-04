import re

canvas_cursor = """"use client";

import { useEffect, useRef } from 'react';

export default function CursorSpotlight() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouse = { x: -1000, y: -1000 };
    let smoothMouse = { x: -1000, y: -1000 };
    let ringRadius = 16;
    let isHovering = false;
    let isVisible = false;

    // Trail particles
    const particles = [];

    const handlePointerMove = (e) => {
      // Create particle for trail on movement
      if (isVisible) {
          const dx = e.clientX - mouse.x;
          const dy = e.clientY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 2) {
              particles.push({
                  x: e.clientX,
                  y: e.clientY,
                  age: 0,
                  maxAge: 30 + Math.random() * 20
              });
          }
      }

      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isVisible = true;

      const target = e.target;
      isHovering = !!(target.closest('a') || target.closest('button') || target.closest('[role="button"]') || target.closest('.cursor-pointer'));
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

      // Lerp smooth mouse for spotlight and ring
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.15;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.15;
      
      // Lerp ring radius
      const targetRadius = isHovering ? 24 : 16;
      ringRadius += (targetRadius - ringRadius) * 0.2;

      // Draw Spotlight (No mix-blend-mode for the spotlight, we'll draw it first)
      if (isVisible || particles.length > 0) {
          // Temporarily remove difference blending for the spotlight background
          ctx.globalCompositeOperation = 'source-over';
          
          const grd = ctx.createRadialGradient(smoothMouse.x, smoothMouse.y, 0, smoothMouse.x, smoothMouse.y, 500);
          grd.addColorStop(0, "rgba(88, 166, 255, 0.08)");
          grd.addColorStop(1, "rgba(88, 166, 255, 0)");
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, width, height);

          // Switch to difference blending for the cursor components
          ctx.globalCompositeOperation = 'difference';

          // 1. Draw Trail Particles (Vector style)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1;
          for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];
              p.age += 1;
              
              if (p.age > p.maxAge) {
                  particles.splice(i, 1);
                  continue;
              }
              
              const life = 1 - (p.age / p.maxAge);
              const size = 3 * life;
              
              // Draw a tiny cross/vector for each particle
              ctx.beginPath();
              ctx.globalAlpha = life;
              ctx.moveTo(p.x - size, p.y);
              ctx.lineTo(p.x + size, p.y);
              ctx.moveTo(p.x, p.y - size);
              ctx.lineTo(p.x, p.y + size);
              ctx.stroke();
          }
          ctx.globalAlpha = 1.0;

          if (isVisible) {
              // 2. Draw outer hollow ring (delayed)
              ctx.beginPath();
              ctx.arc(smoothMouse.x, smoothMouse.y, ringRadius, 0, Math.PI * 2);
              if (isHovering) {
                  // Filled blur effect roughly simulated in canvas
                  ctx.fillStyle = "white";
                  ctx.fill();
              } else {
                  ctx.strokeStyle = "white";
                  ctx.lineWidth = 1;
                  ctx.stroke();
              }

              // 3. Draw core vector ball (Zero delay)
              ctx.beginPath();
              ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
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

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
"""

with open("src/components/CursorSpotlight.jsx", "w") as f:
    f.write(canvas_cursor)
