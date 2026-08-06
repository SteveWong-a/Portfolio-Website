"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/store/useStore';

export default function VisionHudOverlay() {
  const isHudActive = useStore(state => state.isHudActive);
  const [targets, setTargets] = useState([]);
  const requestRef = useRef();

  useEffect(() => {
    if (!isHudActive) {
      setTargets([]);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const updateTargets = () => {
      const elements = Array.from(document.querySelectorAll('[data-hud-target]'));
      
      const newTargets = elements.map(el => {
        const rect = el.getBoundingClientRect();
        const type = el.getAttribute('data-hud-target') || 'UNKNOWN';
        
        // Ensure element is actually visible on screen before tracking
        const isVisible = (
          rect.top < window.innerHeight && 
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
        
        return isVisible ? {
          id: el.id || Math.random().toString(),
          type,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        } : null;
      }).filter(Boolean);

      setTargets(newTargets);
      requestRef.current = requestAnimationFrame(updateTargets);
    };

    requestRef.current = requestAnimationFrame(updateTargets);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isHudActive]);

  return (
    <AnimatePresence>
      {isHudActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
        >
          {/* Scanning Laser Line */}
          <motion.div
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 w-full h-[2px] bg-[#00FFFF]/60 shadow-[0_0_20px_rgba(0,255,255,1)] z-10"
          />
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-30 mask-image-radial z-0" />

          {/* Render Bounding Boxes */}
          {targets.map((target, idx) => (
            <div
              key={idx}
              className="absolute border border-[#00FFFF]/50 shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-75 ease-linear"
              style={{
                top: target.top,
                left: target.left,
                width: target.width,
                height: target.height,
              }}
            >
              {/* Corner Brackets */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00FFFF]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00FFFF]" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00FFFF]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00FFFF]" />

              {/* Data Tag */}
              <div className="absolute -top-6 left-0 bg-[#00FFFF]/10 border border-[#00FFFF]/30 backdrop-blur-sm px-2 py-0.5 whitespace-nowrap font-mono text-[10px] text-[#00FFFF]/80 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#00FFFF] rounded-full animate-pulse"></span>
                TARGET: {target.type} // CONF: {(95 + Math.random() * 4).toFixed(1)}%
              </div>
            </div>
          ))}
          
          {/* Global HUD Reticle / Border overlay */}
          <div className="absolute inset-4 border border-[#00FFFF]/20 rounded-sm" />
          <div className="absolute top-8 left-8 font-mono text-[#00FFFF]/80 text-xs tracking-[0.2em] flex flex-col gap-1">
            <span>SYS.OP.NORMAL</span>
            <span>VISION_MODE: ACTIVE</span>
          </div>
          <div className="absolute bottom-8 right-8 font-mono text-[#00FFFF]/80 text-xs tracking-[0.2em] text-right">
            <span>TRACKING: {targets.length} OBJ</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
