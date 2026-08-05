"use client";

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useState, useRef } from 'react';
import useSound from 'use-sound';
import { useStore } from '@/store/useStore';

const dockItems = [
  { id: 'home', icon: 'fa-solid fa-house', label: 'Home', href: '#' },
  { id: 'featured', icon: 'fa-solid fa-layer-group', label: 'Gallery', href: '#featured' },
  { id: 'experience', icon: 'fa-solid fa-briefcase', label: 'Experience', href: '#experience' },
  { id: 'skills', icon: 'fa-solid fa-code', label: 'Skills', href: '#skills' },
  { id: 'contact', icon: 'fa-solid fa-envelope', label: 'Contact', href: '#contact' },
];

function DockItem({ item, index, hoveredIndex, setHoveredIndex, playTick }) {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const isHovered = hoveredIndex === index;
  const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

  let scale = 1;
  if (isHovered) scale = 1.4;
  else if (isNeighbor) scale = 1.15;

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull: translates the icon inside the button bounds
    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseEnter = () => {
    setHoveredIndex(index);
    playTick();
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={item.href}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ scale }}
      transition={{ type: "spring", bounce: 0.5, visualDuration: 0.3 }}
      className="relative w-12 h-12 flex items-center justify-center rounded-sm bg-white/5 hover:bg-white/20 transition-colors border border-transparent hover:border-white/20 group"
    >
      {/* Icon with magnetic translation */}
      <motion.div style={{ x: springX, y: springY }} className="flex items-center justify-center w-full h-full">
        <i className={`${item.icon} text-lg text-text-main group-hover:text-white transition-colors`}></i>
      </motion.div>
      
      {/* Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-12 px-3 py-1.5 bg-card-bg border border-card-border rounded-sm text-xs font-mono tracking-wider text-cyan-400/80 whitespace-nowrap shadow-xl"
        >
          {item.label}
        </motion.div>
      )}
    </motion.a>
  );
}

export default function Dock() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const toggleHud = useStore((state) => state.toggleHud);
  const isHudActive = useStore((state) => state.isHudActive);
  
  // use-sound integration
  const [playTick] = useSound('/sounds/tick.mp3', { volume: 0.15, soundEnabled: !isMuted });

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none" data-hud-target="NAVIGATION_DOCK">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.8, delay: 0.5 }}
        className="pointer-events-auto bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-sm flex items-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        {dockItems.map((item, index) => (
          <DockItem 
            key={item.id} 
            item={item} 
            index={index} 
            hoveredIndex={hoveredIndex} 
            setHoveredIndex={setHoveredIndex} 
            playTick={playTick} 
          />
        ))}
        
        <div className="w-[1px] h-8 bg-white/20 mx-2"></div>

        {/* Volume Toggle */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className="w-12 h-12 flex items-center justify-center rounded-sm bg-white/5 hover:bg-white/20 text-text-main hover:text-white transition-colors"
        >
          <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'} text-lg`}></i>
        </motion.button>
        
        {/* HUD Mode Toggle */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleHud}
          className={`w-12 h-12 flex items-center justify-center rounded-sm transition-colors border ${isHudActive ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,208,0.4)]' : 'bg-white/5 hover:bg-white/20 text-text-main hover:text-white border-transparent hover:border-white/20'}`}
          title="Toggle Vision HUD (Press 'H')"
        >
          <i className="fa-solid fa-vr-cardboard text-lg"></i>
        </motion.button>
        
        {/* Resume Download Dropdown / Button in Dock */}
        <div className="relative group pointer-events-auto">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 flex items-center justify-center rounded-sm bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/40 transition-colors"
          >
            <i className="fa-solid fa-file-arrow-down text-lg"></i>
          </motion.button>
          
          <div className="absolute bottom-full mb-4 right-0 w-48 bg-card-bg border border-white/10 rounded-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 backdrop-blur-md">
            <a href="/Steve_Wong_UIUX_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm font-mono tracking-wider text-cyan-400/80 hover:text-cyan-400 hover:bg-white/5 rounded-sm transition-colors">Product Design UI/UX</a>
            <a href="/Steve_Wong_ML_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm font-mono tracking-wider text-cyan-400/80 hover:text-cyan-400 hover:bg-white/5 rounded-sm transition-colors">Machine Learning AI</a>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
