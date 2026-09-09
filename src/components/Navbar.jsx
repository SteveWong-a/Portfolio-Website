import { useState, useEffect, useRef, useCallback } from 'react';
import { useGalleryStore } from '../store/useGalleryStore';

export default function Navbar() {
  const [clickCount, setClickCount] = useState(0);
  const setGravity = useGalleryStore((state) => state.setGravity);
  const isGravityEnabled = useGalleryStore((state) => state.isGravityEnabled);
  const holdTimerRef = useRef(null);

  // 5-click activation
  useEffect(() => {
    if (clickCount > 0 && clickCount < 5) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
    if (clickCount === 5) {
      setGravity(true);
      setClickCount(0);
      // Make DOM text elements fall with gravity
      document.querySelectorAll('main h1, main h2, main h3, main p, main a, main li, main span, main strong, main .scroll-reveal').forEach((el, i) => {
        el.style.transition = `transform ${1.5 + Math.random() * 2}s cubic-bezier(0.55, 0, 1, 0.45)`;
        el.style.transformOrigin = 'center bottom';
        setTimeout(() => {
          el.style.transform = `translateY(${600 + Math.random() * 400}px) rotate(${(Math.random() - 0.5) * 30}deg)`;
        }, i * 30 + Math.random() * 200);
      });
    }
  }, [clickCount, setGravity]);

  // Long-press to revert
  const handlePointerDown = useCallback((e) => {
    if (!isGravityEnabled) return;
    e.preventDefault();
    holdTimerRef.current = setTimeout(() => {
      setGravity(false);
      // Revert all DOM text transforms
      document.querySelectorAll('main h1, main h2, main h3, main p, main a, main li, main span, main strong, main .scroll-reveal').forEach((el) => {
        el.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = '';
      });
    }, 600); // 600ms hold to revert
  }, [isGravityEnabled, setGravity]);

  const handlePointerUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    if (!isGravityEnabled) {
      setClickCount(prev => prev + 1);
    }
  }, [isGravityEnabled]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4 bg-black/10 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-white tracking-wide no-underline font-fira cursor-pointer select-none" onClick={handleClick} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
          Steve <span className="text-accent-primary">Wong</span>
        </a>
        <ul className="flex items-center gap-6 m-0 p-0 list-none">
          <li><a href="#featured" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Projects Gallery</a></li>
          <li><a href="#experience" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Work Experience</a></li>
          <li><a href="#skills" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Skills &amp; Education</a></li>
          <li><a href="#contact" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Contact</a></li>
          <li className="relative group">
            <a href="#" className="border border-accent-primary text-accent-primary px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 hover:bg-accent-primary hover:bg-opacity-10">
              Download Resume <i className="fa-solid fa-caret-down"></i>
            </a>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card-bg border border-card-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 backdrop-blur-md">
              <a href="/Steve_Wong_Data_Science_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white hover:bg-opacity-5 rounded-md transition-colors">Data Science / ML</a>
              <a href="/Steve_Wong_UIUX_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white hover:bg-opacity-5 rounded-md transition-colors">UI / UX Design</a>
              <a href="/Steve_Wong_FullStack_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white hover:bg-opacity-5 rounded-md transition-colors">Full-Stack SWE</a>
              <a href="/Steve_Wong_General_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white hover:bg-opacity-5 rounded-md transition-colors">General / Data</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
