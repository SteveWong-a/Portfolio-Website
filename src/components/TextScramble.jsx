"use client";

import { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

export default function TextScramble({ text, className }) {
  // Start with normal text
  const [displayText, setDisplayText] = useState(text);
  const [isTriggered, setIsTriggered] = useState(false);
  const requestRef = useRef();

  // Listen for the trigger event
  useEffect(() => {
    const handleStart = () => setIsTriggered(true);
    window.addEventListener("start-scramble", handleStart);

    return () => window.removeEventListener("start-scramble", handleStart);
  }, []);

  // Decode animation loop
  useEffect(() => {
    if (!isTriggered) return;

    let startTime;
    const duration = 2500; // 2.5 seconds
    const length = text.length;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeOutQuart for a smooth, decelerating matrix reveal effect
      const progress = 1 - Math.pow(1 - t, 4);

      let currentText = "";
      for (let i = 0; i < length; i++) {
        // Character resolve point based on left-to-right index
        const resolvePoint = (i / length) * 0.9;

        if (progress > resolvePoint) {
          // If we passed the resolve point, show the real character
          currentText += text[i];
        } else {
          // Otherwise, show a random character (preserve spaces)
          if (text[i] === " ") {
            currentText += " ";
          } else {
            currentText += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
      }

      setDisplayText(currentText);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isTriggered, text]);

  return <span className={className}>{displayText}</span>;
}
