"use client";

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';

export default function ProjectCard({ 
  category, 
  title, 
  description, 
  tags, 
  demoLink, 
  demoText, 
  codeLink, 
  icon,
  onClick 
}) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map normalized coordinates to a max 10 degree tilt
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);


  const iconColorStyle = icon?.props?.style?.color || 'var(--color-accent-primary)';
  
  let hoverBorderClass = "hover:border-accent-primary/50";
  let hoverShadowClass = "hover:shadow-[0_20px_40px_rgba(88,166,255,0.3)]";
  let titleHoverClass = "group-hover:text-accent-primary";
  let gradientClass = "from-transparent via-accent-primary to-transparent";
  let subtitleClass = "text-accent-primary";

  if (iconColorStyle.includes('secondary')) {
      hoverBorderClass = "hover:border-accent-secondary/50";
      hoverShadowClass = "hover:shadow-[0_20px_40px_rgba(188,140,255,0.3)]";
      titleHoverClass = "group-hover:text-accent-secondary";
      gradientClass = "from-transparent via-accent-secondary to-transparent";
      subtitleClass = "text-accent-secondary";
  } else if (iconColorStyle.includes('green')) {
      hoverBorderClass = "hover:border-accent-green/50";
      hoverShadowClass = "hover:shadow-[0_20px_40px_rgba(63,185,80,0.3)]";
      titleHoverClass = "group-hover:text-accent-green";
      gradientClass = "from-transparent via-accent-green to-transparent";
      subtitleClass = "text-accent-green";
  }

  const handleMouseMove = (e) => {

    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates between -0.5 and 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 relative overflow-hidden flex flex-col group cursor-pointer ${hoverShadowClass} ${hoverBorderClass} scroll-reveal transition-all duration-300`}
    >
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r ${gradientClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}></div>
      
      <div className="w-full">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs font-semibold tracking-wider uppercase ${subtitleClass} opacity-80`}>{category}</span>
          <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${subtitleClass}`}>{icon}</span>
        </div>
        <h3 className={`text-2xl font-bold text-white mb-3 tracking-tight transition-colors ${titleHoverClass}`}>{title}</h3>
        <div className="text-sm text-text-main/80 leading-relaxed font-light line-clamp-3">
          {description}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {tags?.map((tag, i) => (
            <span key={i} className="text-xs font-mono bg-white/10 text-white/90 px-2.5 py-1 rounded border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* We hide the external links on the card because they are now inside the OpenPanel drawer */}
      <div className="mt-auto pt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className={`text-xs font-medium flex items-center gap-2 ${subtitleClass}`}>
          View Case Study <i className="fa-solid fa-arrow-right"></i>
        </span>
      </div>
    </motion.div>
  );
}
