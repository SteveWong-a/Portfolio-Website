"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TABS = [
  { id: 'sketch', label: 'Sketch Retrieval' },
  { id: 'gaze', label: 'GazeAnywhere' },
  { id: 'drawing', label: 'AI Drawing Predictor' },
];

export default function AILab() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  return (
    <section id="ai-lab" className="pt-24 mt-20 border-t border-card-border/50 scroll-reveal opacity-0">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2 font-fira tracking-tight">AI Lab Deployments</h2>
        <p className="text-text-muted">Live machine learning endpoints and interactive models.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-8 relative overflow-hidden flex flex-col group transition-all duration-300">

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-text-muted hover:text-white/80'
                }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-accent-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'sketch' && <SketchRetrieval key="sketch" />}
            {activeTab === 'gaze' && <GazeAnywhere key="gaze" />}
            {activeTab === 'drawing' && <AIDrawingPredictor key="drawing" />}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

function SketchRetrieval() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Sketch Retrieval</h3>
          <p className="text-text-muted text-sm">Interactive Gradio deployment.</p>
        </div>
        <div className="bg-accent-primary/20 border border-accent-primary/50 text-accent-primary px-3 py-1.5 rounded text-xs font-medium text-right">
          Deployed on Render
        </div>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 relative min-h-[600px]">
        <iframe
          src="https://sketch-retrieval.onrender.com/"
          className="absolute inset-0 w-full h-full border-0"
          title="Sketch Retrieval Gradio Space"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        ></iframe>
      </div>
    </motion.div>
  );
}

function GazeAnywhere() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">GazeAnywhere</h3>
          <p className="text-text-muted text-sm">Interactive Gradio deployment.</p>
        </div>
        <div className="bg-accent-secondary/20 border border-accent-secondary/50 text-accent-secondary px-3 py-1.5 rounded text-xs font-medium text-right">
          Research by Xu Cao et al.<br />Deployed by Steve Wong
        </div>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 relative min-h-[600px]">
        {/* Use the hf.space domain to allow embedding without X-Frame-Options errors */}
        <iframe
          src="https://steveawong-gazeanywhere-web.hf.space"
          className="absolute inset-0 w-full h-full border-0"
          title="GazeAnywhere Gradio Space"
        ></iframe>
      </div>
    </motion.div>
  );
}

function AIDrawingPredictor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">AI Drawing Predictor</h3>
          <p className="text-text-muted text-sm">Interactive Gradio deployment.</p>
        </div>
        <div className="bg-accent-primary/20 border border-accent-primary/50 text-accent-primary px-3 py-1.5 rounded text-xs font-mono font-medium text-right">
          Deployed on Hugging Face Spaces
        </div>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 relative min-h-[600px]">
        <iframe
          src="https://steveawong-ai-drawing-predictor.hf.space"
          className="absolute inset-0 w-full h-full border-0"
          title="AI Drawing Predictor Gradio Space"
        ></iframe>
      </div>
    </motion.div>
  );
}
