"use client";

import { useEffect, useRef, useState } from 'react';
import { inView, animate } from 'motion';
import Dock from '@/components/Dock';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import dynamic from 'next/dynamic';
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });
import InitializerOverlay from '@/components/InitializerOverlay';
import OpenPanel from '@/components/OpenPanel';
import CursorSpotlight from '@/components/CursorSpotlight';

const FEATURED_PROJECTS = [
  {
    category: "Computer Vision & AI Deployment",
    icon: <i className="fa-solid fa-pen-ruler" style={{ color: 'var(--color-accent-primary)' }}></i>,
    title: "AI Drawing Predictor",
    description: "Interactive computer vision and deep learning application deployed on Hugging Face Spaces. Uses Convolutional Neural Networks (CNNs) to recognize and predict user sketches in real-time within a Skribbl.io-inspired drawing interface. Trained on Quick Draw! Google datasets.",
    tags: ["PyTorch", "CNN Architecture", "Hugging Face Spaces", "Gradio"],
    demoLink: "#",
    demoText: <>Launch Interactive Demo <i className="fa-solid fa-paintbrush"></i></>,
    codeLink: "https://huggingface.co/spaces/SteveaWong/AI-Drawing-Predictor"
  },
  {
    category: "Web Application & Health Tech",
    icon: <i className="fa-solid fa-glass-water" style={{ color: 'var(--color-accent-primary)' }}></i>,
    title: "Hydrio — Water Intake Tracker",
    description: "A real-time web application designed to help users establish healthy hydration habits. Features real-time water logging, customizable daily goals, interactive hydration visualizers, automated reminder triggers, and user account persistence.",
    tags: ["JavaScript", "Firebase", "HTML5/CSS3", "Responsive Web"],
    demoLink: "https://water-drinking-reminder-933bf.web.app/",
    demoText: <>Launch Application <i className="fa-solid fa-arrow-up-right-from-square"></i></>
  },
  {
    category: "Astrophysics & Data Analysis",
    icon: <i className="fa-solid fa-satellite" style={{ color: 'var(--color-accent-secondary)' }}></i>,
    title: "NASA GMU Exoplanet Research Paper",
    description: "Published astronomical research analyzing exoplanet candidate transit observations from the GMU Telescope. Mastered AstroImageJ for multi-aperture photometry and transit depth modeling, classifying TOI-3649.01 within the MARS repository in collaboration with NASA and GMU mentors.",
    tags: ["Python", "AstroImageJ", "Photometry", "NASA MARS Repository"],
    demoLink: "https://doi.org/10.13021/MARS/15188",
    demoText: <>Read Research Paper (DOI) <i className="fa-solid fa-book-open"></i></>
  },
  {
    category: "Machine Learning & Econometrics",
    icon: <i className="fa-solid fa-chart-line" style={{ color: 'var(--color-accent-green)' }}></i>,
    title: "DIYA & Vanderbilt Microlending Paper",
    description: "Research paper published in the Vanderbilt Young Scientist Journal titled 'Identifying Reliable Clients for Microlending: A Data-Driven Approach'. Developed machine learning risk classification models removing credit-history bias to help financial institutions safely serve underserved communities.",
    tags: ["Python", "Scikit-Learn", "Predictive Modeling", "Data Analysis"],
    demoLink: "https://wp0.vanderbilt.edu/youngscientistjournal/article/identifying-reliable-clients-for-microlending-a-data-driven-approach",
    demoText: <>Read Published Paper <i className="fa-solid fa-arrow-up-right-from-square"></i></>
  }
];

const OTHER_PROJECTS = [
  {
    category: "Sports Analytics Web App",
    icon: <i className="fa-solid fa-stopwatch" style={{ color: 'var(--color-accent-primary)' }}></i>,
    title: "Swimming Lap Splits Tracker",
    description: "Full-stack web application built for competitive swim coaches and athletes to record, track, and visualize lap split times, race pace distributions, and swimmer progression metrics over time.",
    tags: ["JavaScript", "Firebase Auth & Database", "Data Analytics"],
    demoLink: "https://swimming-splits.web.app/login",
    demoText: <>Launch Swimming App <i className="fa-solid fa-arrow-up-right-from-square"></i></>
  },
  {
    category: "Civic Tech & Web",
    icon: <i className="fa-solid fa-bus" style={{ color: 'var(--color-accent-secondary)' }}></i>,
    title: "School Traffic & Transit Platform",
    description: "MTC Norman Mineta Transportation Project Bronze Award-winning platform. Researched Bay Area transit accessibility, designed an LLM-powered transit navigation tool, and presented recommendations to SF City Council members.",
    tags: ["Wix / Web", "Transit LLM", "MTC Bronze Award"],
    demoLink: "https://steveawong.wixsite.com/transform-transport",
    demoText: <>Visit Transit Blog <i className="fa-solid fa-arrow-up-right-from-square"></i></>
  },
  {
    category: "Education & Web Design",
    icon: <i className="fa-solid fa-laptop-code" style={{ color: 'var(--color-accent-green)' }}></i>,
    title: "Academic Leadership Web Portals",
    description: "Designed and managed web portals and digital materials for Dougherty Valley High School's Academic Leadership program, streamlining peer tutoring scheduling, student resources, and community outreach.",
    tags: ["Web Design", "Tutoring Portal", "DVHS Leadership"]
  },
  {
    category: "Engineering & Community Leadership",
    icon: <i className="fa-solid fa-campground" style={{ color: 'var(--color-accent-primary)' }}></i>,
    title: "Eagle Scout Sports Storage Project",
    description: "Directed a 120-hour engineering leadership project managing material budget, design, and directing 430+ volunteer hours to build custom weatherproof sports storage structures for IFGF Church.",
    tags: ["BSA Eagle Scout", "Project Management", "430+ Vol. Hours"]
  }
];

const EXPERIENCES = [
  {
    category: "Data Analyst and Researcher",
    icon: <i className="fa-solid fa-database" style={{ color: 'var(--color-accent-primary)' }}></i>,
    title: "Readyfly AI Startup",
    description: "November 2023 – Present. Designed and implemented data cleanup and sorting algorithms for a large dataset of job listings. Developed a database schema and queries to organize and retrieve job listing data. Automated data processing and visualization using Python scripts. Collaborated with team members to integrate data analysis into an AI Job report.",
    tags: ["Python", "Data Analysis", "SQL / Databases", "Automation"]
  },
  {
    category: "Student Researcher @COSMOS",
    icon: <i className="fa-solid fa-brain" style={{ color: 'var(--color-accent-secondary)' }}></i>,
    title: "UCLA",
    description: "July 2025 – August 2025. Modeled rat neural spatial navigation by applying single and multi-layer perceptrons to decode complex biological place-cell signals. Collaborated within a brain-inspired computing cohort to analyze direction-sensing data, bridging biological neural networks with computational models.",
    tags: ["Machine Learning", "Perceptrons", "Neural Networks", "Biological Computing"]
  }
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Scroll reveal animation using Motion
    inView(".scroll-reveal:not(header.hero.scroll-reveal, header.hero *)", (element) => {
      animate(
        element,
        { opacity: 1, y: [40, 0] },
        { type: "spring", bounce: 0.15, visualDuration: 0.7, delay: 0.1 }
      );
      return () => { };
    });
  }, []);

  return (
    <>
      <InitializerOverlay onStart={() => setIsStarted(true)} />
      <ThreeBackground isStarted={isStarted} />
      <canvas id="dotted-wave" className="fixed top-0 left-0 w-screen h-screen pointer-events-none -z-20"></canvas>
      <CursorSpotlight />

      <Navbar />
      <Dock />
      <OpenPanel isOpen={!!selectedProject} project={selectedProject} onClose={() => setSelectedProject(null)} />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-24 relative z-10">
        <Hero />

        {/* Featured Projects */}
        <section id="featured" className="pt-24 mt-20 border-t border-card-border/50">
          <div className="mb-12 scroll-reveal opacity-0">
            <h2 className="text-3xl font-bold text-white mb-2 font-fira tracking-tight">Featured Projects</h2>
            <p className="text-text-muted">Flagship web applications, machine learning deployments, and published research papers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURED_PROJECTS.map((proj, idx) => (
              <ProjectCard key={idx} {...proj} onClick={() => setSelectedProject(proj)} />
            ))}
          </div>
        </section>

        {/* Other / Additional Projects */}
        <section id="projects" className="pt-24 mt-20 border-t border-card-border/50">
          <div className="mb-12 scroll-reveal opacity-0">
            <h2 className="text-3xl font-bold text-white mb-2 font-fira tracking-tight">More Projects & Initiatives</h2>
            <p className="text-text-muted">Additional technical web builds, sports analytics, and community leadership.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OTHER_PROJECTS.map((proj, idx) => (
              <ProjectCard key={idx} {...proj} onClick={() => setSelectedProject(proj)} />
            ))}
          </div>
        </section>

        {/* Work Experience */}
        <section id="experience" className="pt-24 mt-20 border-t border-card-border/50">
          <div className="mb-12 scroll-reveal opacity-0">
            <h2 className="text-3xl font-bold text-white mb-2 font-fira tracking-tight">Work Experience</h2>
            <p className="text-text-muted">Professional internships and research roles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {EXPERIENCES.map((proj, idx) => (
              <ProjectCard key={idx} {...proj} onClick={() => setSelectedProject(proj)} />
            ))}
          </div>
        </section>

        {/* Skills & Education */}
        <section id="skills" className="pt-24 mt-20 border-t border-card-border/50">
          <div className="mb-12 scroll-reveal opacity-0">
            <h2 className="text-3xl font-bold text-white mb-2 font-fira tracking-tight">Skills & Education</h2>
            <p className="text-text-muted">Technical proficiencies, academic background, and leadership roles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 scroll-reveal hover:-translate-y-1 hover:shadow-glow hover:border-accent-primary/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4"><i className="fa-solid fa-university" style={{ color: 'var(--color-accent-primary)' }}></i> Education</h3>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <strong className="text-text-bold">UIUC (Grainger Engineering)</strong>
                  <span className="text-text-muted text-sm">Computer Science (2026+)</span>
                </li>
                <li className="flex flex-col">
                  <strong className="text-text-bold">Dougherty Valley High School</strong>
                  <span className="text-text-muted text-sm">Senior / High Honors</span>
                </li>
                <li className="flex flex-col">
                  <strong className="text-text-bold">Community College Coursework</strong>
                  <span className="text-text-muted text-sm">DVC & Compton (CS & Math)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 scroll-reveal hover:-translate-y-1 hover:shadow-glow hover:border-accent-secondary/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4"><i className="fa-solid fa-code" style={{ color: 'var(--color-accent-secondary)' }}></i> Languages & Frameworks</h3>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <strong className="text-text-bold">Programming Languages</strong>
                  <span className="text-text-muted text-sm">Python, C++, JavaScript, C, Assembly</span>
                </li>
                <li className="flex flex-col">
                  <strong className="text-text-bold">AI & Data Science</strong>
                  <span className="text-text-muted text-sm">PyTorch, CNNs, OpenCV, Pandas, NumPy</span>
                </li>
                <li className="flex flex-col">
                  <strong className="text-text-bold">Web & Cloud</strong>
                  <span className="text-text-muted text-sm">HTML5/CSS3, Firebase, Git, Hugging Face</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 scroll-reveal hover:-translate-y-1 hover:shadow-glow hover:border-accent-green/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4"><i className="fa-solid fa-briefcase" style={{ color: 'var(--color-accent-green)' }}></i> Experience & Honors</h3>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <strong className="text-text-bold">Readyfly AI Startup</strong>
                  <span className="text-text-muted text-sm">Data Analyst Intern (2024-Present)</span>
                </li>
                <li className="flex flex-col">
                  <strong className="text-text-bold">Research Internships</strong>
                  <span className="text-text-muted text-sm">NASA GMU & DIYA Vanderbilt</span>
                </li>
                <li className="flex flex-col">
                  <strong className="text-text-bold">Boy Scouts of America</strong>
                  <span className="text-text-muted text-sm">Eagle Scout Candidate & Troop Guide</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="pt-24 mt-20 border-t border-card-border/50">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center scroll-reveal hover:shadow-[0_0_40px_rgba(88,166,255,0.2)] transition-shadow duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-green"></div>
            <h2 className="text-3xl font-bold text-white mb-4">Let's Connect</h2>
            <p className="text-text-muted mb-8 max-w-xl mx-auto">Feel free to reach out for research opportunities, software engineering collaborations, or project inquiries!</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a href="mailto:stevealphawong@gmail.com" className="bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors inline-flex items-center gap-2">
                <i className="fa-solid fa-paper-plane"></i> stevealphawong@gmail.com
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="https://www.linkedin.com/in/steveawong/" target="_blank" className="text-text-muted hover:text-white transition-colors inline-flex items-center gap-2 text-lg">
                <i className="fa-brands fa-linkedin"></i> LinkedIn
              </a>
              <a href="https://github.com/SteveWong-a" target="_blank" className="text-text-muted hover:text-white transition-colors inline-flex items-center gap-2 text-lg">
                <i className="fa-brands fa-github"></i> GitHub
              </a>
              <a href="https://huggingface.co/SteveaWong" target="_blank" className="text-text-muted hover:text-white transition-colors inline-flex items-center gap-2 text-lg">
                <i className="fa-solid fa-robot"></i> Hugging Face
              </a>
            </div>
          </div>
        </section>

        <footer className="text-center py-12 mt-20 text-text-muted text-sm border-t border-card-border/50">
          <p>© {new Date().getFullYear()} Steve Wong. Built with Next.js, Tailwind CSS, Three.js, and Motion.</p>
        </footer>
      </main>
    </>
  );
}
