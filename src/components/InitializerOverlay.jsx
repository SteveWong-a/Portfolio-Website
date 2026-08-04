"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import useSound from 'use-sound';

export default function InitializerOverlay({ onStart }) {
  const [isStarted, setIsStarted] = useState(false);
  
  const [play, { sound }] = useSound('/sounds/animation_sound.mp3', { 
      volume: 0
  });

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

  return (
    <AnimatePresence>
      {!isStarted && (
        <motion.div
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-[#050505]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <motion.button
            onClick={handleStart}
            className="text-white border border-white/20 px-8 py-4 tracking-[0.2em] font-fira text-sm hover:bg-white hover:text-black transition-colors duration-500 cursor-pointer"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            INITIALIZE SEQUENCE
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
