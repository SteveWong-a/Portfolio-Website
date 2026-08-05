"use client";

import { motion, useMotionValue, useSpring, useTransform, useInView, useReducedMotion } from 'motion/react';
import { useRef, useEffect, useState } from 'react';

// We'll define variants inside the component to respond to useReducedMotion

import { useGalleryStore } from '@/store/useGalleryStore';

export default function ProjectCard({ 
  category, 
  title, 
  description, 
  tags, 
  demoLink, 
  demoText, 
  codeLink, 
  icon,
  onClick,
  isGalleryItem = false,
  index = 0,
  shape = 'DEFAULT_FIELD'
}) {
  const ref = useRef(null);
  // Trigger animation when the card scrolls horizontally into view
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    if (isGalleryItem && isInView) {
      useGalleryStore.getState().setActiveProject(index, shape);
    }
  }, [isInView, isGalleryItem, index, shape]);

  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { 
      clipPath: shouldReduceMotion ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
      opacity: shouldReduceMotion ? 0 : 1
    },
    visible: {
      clipPath: "inset(0 0 0 0)",
      opacity: 1,
      transition: shouldReduceMotion ? { duration: 0.3 } : {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: shouldReduceMotion ? { duration: 0.3 } : {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map normalized coordinates to a max 15 degree tilt
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const checkCoarse = window.matchMedia('(pointer: coarse)').matches;
    setIsCoarse(checkCoarse);

    if (!checkCoarse) return;

    const handleOrientation = (event) => {
      let { gamma, beta } = event; // gamma is left/right (-90 to 90), beta is front/back (-180 to 180)
      
      // Restrict gamma between -30 and 30, and map to -0.5 to 0.5
      let normalizedGamma = Math.min(Math.max(gamma || 0, -30), 30) / 60; 
      
      // Beta resting is usually around 45deg (holding phone in front)
      // Constrain beta between 15 and 75, map to -0.5 to 0.5
      let normalizedBeta = Math.min(Math.max((beta || 45) - 45, -30), 30) / 60;

      x.set(normalizedGamma);
      y.set(normalizedBeta);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [x, y]);


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
    if (shouldReduceMotion || isCoarse) return;
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
    if (isCoarse) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      data-hud-target="PROJECT_CARD"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      variants={isGalleryItem ? containerVariants : {}}
      initial={isGalleryItem ? "hidden" : false}
      animate={isGalleryItem ? (isInView ? "visible" : "hidden") : false}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      whileHover={shouldReduceMotion ? {} : (isGalleryItem ? { y: -5 } : {})}
      className={`h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-sm p-8 relative overflow-hidden flex flex-col group cursor-pointer ${hoverShadowClass} ${hoverBorderClass} transition-all duration-300 ${!isGalleryItem ? "scroll-reveal" : ""}`}
    >
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r ${gradientClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}></div>
      
      {/* Background pseudo-element for scale animation */}
      <motion.div 
        className="absolute inset-0 z-[-1] opacity-5 bg-gradient-to-br from-white/10 to-transparent"
        initial={isGalleryItem && !shouldReduceMotion ? { scale: 1.2 } : { scale: 1 }}
        animate={isGalleryItem && !shouldReduceMotion ? (isInView ? { scale: 1 } : { scale: 1.2 }) : { scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}
      />

      <div className="w-full relative z-10">
        <motion.div variants={itemVariants} className="flex justify-between items-start mb-4">
          <span className={`text-xs font-mono tracking-wider text-cyan-400/80 uppercase`}>{category}</span>
          <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${subtitleClass}`}>{icon}</span>
        </motion.div>
        <motion.h3 variants={itemVariants} className={`text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight transition-colors ${titleHoverClass}`}>{title}</motion.h3>
        <motion.div variants={itemVariants} className="text-sm md:text-base text-text-main/80 leading-relaxed font-light line-clamp-3 md:line-clamp-4">
          {description}
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mt-6">
          {tags?.map((tag, i) => (
            <span key={i} className="text-xs font-mono tracking-wider text-cyan-400/80 bg-white/10 px-2.5 py-1 rounded-sm border border-white/10">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
      
      {/* We hide the external links on the card because they are now inside the OpenPanel drawer */}
      <motion.div variants={itemVariants} className="mt-auto pt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className={`text-xs font-mono tracking-wider flex items-center gap-2 text-cyan-400/80`}>
          VIEW CASE STUDY <i className="fa-solid fa-arrow-right"></i>
        </span>
      </motion.div>
    </motion.div>
  );
}
