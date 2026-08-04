import TextScramble from "./TextScramble";

export default function Hero() {
  return (
    <header className="pt-40 pb-20 max-w-3xl hero scroll-reveal relative z-10">
      <div className="inline-flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 border border-accent-primary/20 shadow-[0_0_10px_rgba(88,166,255,0.2)]">
        <i className="fa-solid fa-graduation-cap"></i> Incoming Computer Science @ UIUC
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
        Hi, I'm <TextScramble text="Steve Wong" className="text-gradient" />.
      </h1>
      <p className="text-lg text-text-muted mb-10 leading-relaxed font-light">
        Passionate about Artificial Intelligence, Computer Vision, and Full-Stack Software Engineering.
        Experienced in building machine learning models, web applications, and published astrophysics &
        econometric research.
      </p>
      <div className="flex flex-wrap gap-4">
        <a href="https://www.linkedin.com/in/steveawong/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-text-bold text-bg-color px-6 py-3 rounded-md font-semibold text-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow">
          <i className="fa-brands fa-linkedin"></i> LinkedIn Profile
        </a>
        <a href="https://github.com/SteveWong-a" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-card-bg text-text-bold px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 border border-card-border hover:bg-card-border hover:-translate-y-1">
          <i className="fa-brands fa-github"></i> GitHub
        </a>
        <a href="https://huggingface.co/SteveaWong" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-card-bg text-text-bold px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 border border-card-border hover:bg-card-border hover:-translate-y-1">
          <i className="fa-solid fa-robot"></i> Hugging Face
        </a>
        <a href="mailto:stevealphawong@gmail.com" className="inline-flex items-center gap-2 bg-card-bg text-text-bold px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 border border-card-border hover:bg-card-border hover:-translate-y-1">
          <i className="fa-solid fa-envelope"></i> Email Me
        </a>
      </div>
    </header>
  );
}
