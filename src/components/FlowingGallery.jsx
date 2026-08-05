"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import ProjectCard from './ProjectCard';

export default function FlowingGallery({ projects, onSelectProject }) {
  const targetRef = useRef(null);
  
  const [isDesktop, setIsDesktop] = useState(true);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"] 
  });

  const numStops = projects.length + 1;
  const xInput = [];
  const xOutput = [];
  const flatZone = 0.04; 
  
  for (let i = 0; i < numStops; i++) {
    const center = i / (numStops - 1);
    
    let valVw = 0;
    if (i > 0) {
      if (isDesktop) {
        // Desktop Layout Math:
        // Padding (10vw) + Title (35vw) + Gap (10vw) + CardCenter (45vw / 2) = 77.5vw
        // Offset to center (50vw) = 50vw - 77.5vw = -27.5vw
        // Next card = 45vw + 5vw gap = 50vw distance
        valVw = -27.5 - ((i - 1) * 50);
      } else {
        // Mobile Layout Math:
        // Padding (10vw) + Title (80vw) + Gap (10vw) + CardCenter (85vw / 2) = 142.5vw
        // Offset to center (50vw) = 50vw - 142.5vw = -92.5vw
        // Next card = 85vw + 5vw gap = 90vw distance
        valVw = -92.5 - ((i - 1) * 90);
      }
    }
    const val = `${valVw}vw`;
    
    if (i === 0) {
      xInput.push(0, center + flatZone);
      xOutput.push(val, val);
    } else if (i === numStops - 1) {
      xInput.push(center - flatZone, 1);
      xOutput.push(val, val);
    } else {
      xInput.push(center - flatZone, center + flatZone);
      xOutput.push(val, val);
    }
  }

  const x = useTransform(scrollYProgress, xInput, xOutput);
  
  // Slower parallax for background decorative text
  const parallaxX = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] mt-20 border-t border-card-border/50 w-screen left-1/2 -translate-x-1/2">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden w-screen">
        
        {/* Parallax Background Typography */}
        <motion.div 
          style={{ x: parallaxX }}
          className="absolute whitespace-nowrap text-[20vw] font-bold text-white/[0.15] pointer-events-none select-none z-0 tracking-tighter"
        >
          PROJECTS 2024-2026 / RESEARCH & DEVELOPMENT
        </motion.div>

        {/* The main horizontal track */}
        <motion.div 
          style={{ x }}
          className="flex z-10 w-max items-center h-full"
        >
          <div className="w-[10vw] shrink-0"></div>

          <div className="w-[80vw] md:w-[35vw] shrink-0 mr-[10vw] flex flex-col justify-center">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 font-fira tracking-tight leading-tight">Flowing<br/>Gallery</h2>
            <p className="text-text-muted text-lg max-w-sm">A horizontal narrative journey through flagship web applications, machine learning deployments, and published research papers.</p>
          </div>

          {projects.map((proj, idx) => (
            <div key={idx} className="flex h-full items-center">
              <div className="w-[85vw] md:w-[45vw] shrink-0 h-[60vh] md:h-[70vh]">
                <ProjectCard 
                  {...proj} 
                  onClick={() => onSelectProject(proj)} 
                  isGalleryItem={true}
                />
              </div>
              <div className="w-[5vw] shrink-0"></div>
            </div>
          ))}
          
          <div className="w-[10vw] shrink-0"></div>
        </motion.div>
      </div>
    </section>
  );
}
