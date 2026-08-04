<h1 align="center">Steve Wong | Digital Portfolio</h1>

<p align="center">
  <strong>An exploration of spatial interfaces, computational design, and fluid micro-interactions.</strong>
</p>

<p align="center">
  <a href="https://steve-wong.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Experience-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Site">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Figma_Prototype-F24E1E?style=for-the-badge&logo=figma&logoColor=white" alt="Figma">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Next.js_Stack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Tech Stack">
  </a>
</p>

<br>

## 🌌 The Vision

The goal of this digital environment was to break away from static, traditional web templates and engineer an immersive, tactile experience. Grounded in a dark-mode spatial design philosophy, the interface merges sharp typography, Z-axis depth, and physics-based motion to craft an environment that feels alive and highly responsive. It was meticulously designed to communicate my dual background in Full-Stack AI Development and Computer Engineering through a premium, cinematic lens.

<br>

## ✨ Design Engineering

Every interaction in this architecture was deliberately crafted to provide immediate, satisfying tactile feedback. The UI heavily utilizes strict glassmorphism, Framer Motion spring physics, and hardware-accelerated rendering to maintain a buttery-smooth 60fps experience across all devices.

### Micro-Interactions & Physics
*   **Custom Vector Cursor:** A fully decoupled, zero-latency `<canvas>` engine powers the cursor system. It features raw mathematical interpolation for a dense, comet-like vector trail and intelligent `mix-blend-mode: difference` inversion over interactive hitboxes.
*   **Magnetic Navigation Dock:** Inspired by native OS environments, the bottom navigation utilizes strict spring physics (`stiffness: 300, damping: 20`) to create a fluid, magnetic pull that translates icons toward the user's pointer, complete with spatial audio ticks.
*   **3D Spatial Cards:** Project interfaces map normalized cursor coordinates to dynamic CSS 3D transforms (`transformPerspective: 1000`), creating a subtle, hyper-realistic parallax tilt and reactive glowing border effect that mimics physical glass reacting to light.

<br>

> *[Placeholder: Embed GIF of Vector Cursor & Magnetic Dock Interaction Here]*

<br>

> *[Placeholder: Embed GIF of 3D Project Card Tilt Effect Here]*

<br>

## 🏗 The Architecture

This experience was built using a modern, highly optimized frontend stack designed for rich interactivity and raw performance:

*   **Core:** React (Next.js App Router)
*   **Styling:** Tailwind CSS (Custom glassmorphism & dynamic design tokens)
*   **Motion:** Framer Motion (Physics-based springs, layout animations, AnimatePresence)
*   **WebGL Engine:** Three.js & GSAP (GPU-accelerated particle morphing and ambient soundscape synchronization)

<br>

## 🚀 Local Initialization

To deploy this environment locally, simply run the following sequence in your terminal:

```bash
# Clone the repository
git clone https://github.com/SteveWong-a/Portfolio-Website.git

# Enter the directory
cd Portfolio-Website

# Install dependencies
npm install

# Initialize the development server
npm run dev
```