import re

# Update TextScramble.jsx
with open("src/components/TextScramble.jsx", "r") as f:
    text_content = f.read()

new_text_content = """"use client";

import { useEffect, useState, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

export default function TextScramble({ text, className }) {
  const [displayText, setDisplayText] = useState("");
  const [isTriggered, setIsTriggered] = useState(false);
  const requestRef = useRef();

  // Initial mount: setup scrambled text and event listener
  useEffect(() => {
    let initialText = "";
    for(let i = 0; i < text.length; i++) {
        if (text[i] === " ") initialText += " ";
        else initialText += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    setDisplayText(initialText);

    const handleStart = () => setIsTriggered(true);
    window.addEventListener("start-scramble", handleStart);

    return () => window.removeEventListener("start-scramble", handleStart);
  }, [text]);

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
        const resolvePoint = (i / length) * 0.9; // Scale to 0.9 so the last char resolves before progress=1.0

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
"""
with open("src/components/TextScramble.jsx", "w") as f:
    f.write(new_text_content)

# Update ThreeBackground.jsx
with open("src/components/ThreeBackground.jsx", "r") as f:
    bg_content = f.read()

# Replace natural completion
bg_content = bg_content.replace(
    'onComplete: cleanup\n        }, "-=0.5");',
    '''onComplete: () => {
                setTimeout(() => window.dispatchEvent(new CustomEvent('start-scramble')), 3500);
                cleanup();
            }
        }, "-=0.5");'''
)

# Replace skip button
bg_content = bg_content.replace(
    'onComplete: cleanup\n                });',
    '''onComplete: () => {
                        window.dispatchEvent(new CustomEvent('start-scramble'));
                        cleanup();
                    }
                });'''
)

with open("src/components/ThreeBackground.jsx", "w") as f:
    f.write(bg_content)
