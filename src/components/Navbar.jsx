export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4 bg-black/10 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-white tracking-wide no-underline font-fira">
          Steve <span className="text-accent-primary">Wong</span>
        </a>
        <ul className="flex items-center gap-6 m-0 p-0 list-none">
          <li><a href="#featured" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Featured</a></li>
          <li><a href="#projects" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Other Projects</a></li>
          <li><a href="#experience" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Work Experience</a></li>
          <li><a href="#skills" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Skills & Education</a></li>
          <li><a href="#contact" className="text-text-main text-sm font-medium hover:text-white transition-colors duration-200">Contact</a></li>
          <li className="relative group">
            <a href="#" className="border border-accent-primary text-accent-primary px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 hover:bg-accent-primary hover:bg-opacity-10">
              Download Resume <i className="fa-solid fa-caret-down"></i>
            </a>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card-bg border border-card-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col p-2 backdrop-blur-md">
              <a href="/Steve_Wong_UIUX_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white hover:bg-opacity-5 rounded-md transition-colors">Product Design UI/UX</a>
              <a href="/Steve_Wong_ML_Resume.pdf" target="_blank" download className="block px-4 py-2 text-sm text-text-main hover:text-white hover:bg-white hover:bg-opacity-5 rounded-md transition-colors">Machine Learning AI</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
