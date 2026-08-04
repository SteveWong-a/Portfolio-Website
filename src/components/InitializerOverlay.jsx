"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import useSound from 'use-sound';

export default function InitializerOverlay({ onStart }) {
  const [isStarted, setIsStarted] = useState(false);
  
  const [play, { sound }] = useSound('/sounds/animation_sound.mp3', { 
      volume: 0
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleProgress = (e) => {
      setProgress(e.detail.progress);
    };
    window.addEventListener('three-load-progress', handleProgress);
    return () => window.removeEventListener('three-load-progress', handleProgress);
  }, []);

  const handleStart = () => {
    setIsStarted(true);
    
    // Play sound and fade in volume from 0 to 0.5 over 2 seconds
    play();
    if (sound) {
        sound.fade(0, 0.5, 2000);
    }
    
    // Trigger the callback to start the background
    onStart();
  };

  const isLoaded = progress >= 100;

  return (
    <AnimatePresence>
      {!isStarted && (
        <motion.div
          className="fixed inset-0 z-[10002] flex flex-col items-center justify-center bg-[#050505]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <motion.div className="mb-4 text-white/70 font-mono tracking-widest text-sm">
            [ {progress.toString().padStart(3, '0')}% ]
          </motion.div>
          
          <motion.button
            onClick={handleStart}
            disabled={!isLoaded}
            className={`border border-white/20 px-8 py-4 tracking-[0.2em] font-fira text-sm transition-colors duration-500 ${
              isLoaded 
                ? 'text-white hover:bg-white hover:text-black cursor-pointer' 
                : 'text-white/30 opacity-50 pointer-events-none'
            }`}
            animate={isLoaded ? { opacity: [0.3, 1, 0.3] } : {}}
            transition={isLoaded ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
            whileHover={isLoaded ? { scale: 1.05, opacity: 1 } : {}}
            whileTap={isLoaded ? { scale: 0.95 } : {}}
          >
            INITIALIZE SEQUENCE
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
