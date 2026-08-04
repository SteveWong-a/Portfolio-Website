"use client";

import { motion } from 'motion/react';
import { useState } from 'react';

const dockItems = [
  { id: 'home', icon: 'fa-solid fa-house', label: 'Home', href: '#' },
  { id: 'featured', icon: 'fa-solid fa-star', label: 'Featured', href: '#featured' },
  { id: 'projects', icon: 'fa-solid fa-layer-group', label: 'Projects', href: '#projects' },
  { id: 'experience', icon: 'fa-solid fa-briefcase', label: 'Experience', href: '#experience' },
  { id: 'skills', icon: 'fa-solid fa-code', label: 'Skills', href: '#skills' },
  { id: 'contact', icon: 'fa-solid fa-envelope', label: 'Contact', href: '#contact' },
];

export default function Dock() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.8, delay: 0.5 }}
        className="pointer-events-auto bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-full flex items-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        {dockItems.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

          // Calculate scale based on hover proximity (Apple Dock effect)
          let scale = 1;
          if (isHovered) scale = 1.4;
          else if (isNeighbor) scale = 1.15;

          return (
            <motion.a
              key={item.id}
              href={item.href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              animate={{ scale }}
              transition={{ type: "spring", bounce: 0.5, visualDuration: 0.3 }}
              className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors border border-transparent hover:border-white/20 group"
            >
              <i className={`${item.icon} text-lg text-text-main group-hover:text-white transition-colors`}></i>
              
              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute -top-12 px-3 py-1.5 bg-card-bg border border-card-border rounded-md text-xs font-medium text-white whitespace-nowrap shadow-xl"
                >
                  {item.label}
                </motion.div>
              )}
            </motion.a>
          );
        })}
        
        <div className="w-[1px] h-8 bg-white/20 mx-2"></div>
        
        {/* Resume Download Dropdown / Button in Dock */}
        <div className="relative group pointer-events-auto">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30 hover:bg-accent-primary/40 transition-colors"
          >
            <i className="fa-solid fa-file-arrow-down text-lg"></i>
          </motion.button>
          
          <div className="absolute bottom-full mb-4 right-0 w-48 bg-card-bg border border-card-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 backdrop-blur-md">
            <a href="/Steve_Wong_UIUX_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white/5 rounded-md transition-colors">Product Design UI/UX</a>
            <a href="/Steve_Wong_ML_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white/5 rounded-md transition-colors">Machine Learning AI</a>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
