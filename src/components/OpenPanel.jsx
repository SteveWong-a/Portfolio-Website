"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export default function OpenPanel({ project, isOpen, onClose }) {
  // Prevent scrolling on the body when the panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          
          {/* Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-40%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-40%", x: "-50%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-1/2 left-1/2 w-[90vw] max-w-3xl max-h-[90vh] bg-card-bg/95 backdrop-blur-xl border border-white/10 shadow-2xl z-[210] overflow-y-auto flex flex-col rounded-2xl"
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-md"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </motion.button>

            {/* Hero Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-full h-64 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 relative flex items-center justify-center border-b border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
              <span className="text-6xl filter drop-shadow-xl scale-150">{project.icon}</span>
            </motion.div>

            {/* Content Area */}
            <div className="p-8 flex flex-col flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <span className="text-sm font-semibold tracking-wider uppercase text-accent-primary mb-2 block">{project.category}</span>
                <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">{project.title}</h2>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags?.map((tag, i) => (
                    <span key={i} className="text-xs font-mono bg-white/5 text-white/80 px-3 py-1.5 rounded-full border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="prose prose-invert max-w-none mb-10 text-text-main/90 leading-relaxed font-light space-y-6"
              >
                <div className="bg-white/5 p-4 rounded-lg border border-white/5 text-sm italic border-l-2 border-l-accent-primary">
                  {project.description}
                </div>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">Case Study Deep Dive</h3>
                <p>
                  This project was built to tackle a specific set of complex technical requirements. 
                  During development, the primary focus was on ensuring a highly performant architecture 
                  that could scale smoothly while maintaining an exceptional user experience.
                </p>
                <p>
                  Key challenges included orchestrating real-time data flow, optimizing rendering pipelines, 
                  and ensuring that the UI felt buttery smooth. I heavily utilized modern asynchronous 
                  patterns and state-management techniques to keep the application responsive under load.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-auto pt-6 border-t border-white/10 flex flex-wrap gap-4"
              >
                {project.demoLink && (
                  <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[200px] text-center bg-accent-primary text-white py-3 px-6 rounded-lg font-semibold transition-all hover:bg-opacity-90 hover:shadow-glow flex items-center justify-center gap-2">
                    {project.demoText || <>Launch Demo <i className="fa-solid fa-arrow-up-right-from-square"></i></>}
                  </a>
                )}
                {project.codeLink && (
                  <a href={project.codeLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[150px] text-center bg-white/5 text-white py-3 px-6 rounded-lg font-medium transition-all hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2">
                    View Code <i className="fa-brands fa-github"></i>
                  </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
