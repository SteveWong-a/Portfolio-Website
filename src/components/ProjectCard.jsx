export default function ProjectCard({ 
  category, 
  title, 
  description, 
  tags, 
  demoLink, 
  demoText, 
  codeLink, 
  icon,
  onClick 
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 transition-all duration-300 relative overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(88,166,255,0.3)] hover:border-accent-primary/50 scroll-reveal"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      
      <div className="w-full">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-accent-primary opacity-80">{category}</span>
          <span className="text-accent-primary text-xl transition-transform duration-300 group-hover:scale-110">{icon}</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-accent-primary transition-colors">{title}</h3>
        <div className="text-sm text-text-main/80 leading-relaxed font-light line-clamp-3">
          {description}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {tags?.map((tag, i) => (
            <span key={i} className="text-xs font-mono bg-white/10 text-white/90 px-2.5 py-1 rounded border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* We hide the external links on the card because they are now inside the OpenPanel drawer */}
      <div className="mt-auto pt-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs font-medium text-accent-primary flex items-center gap-2">
          View Case Study <i className="fa-solid fa-arrow-right"></i>
        </span>
      </div>
    </div>
  );
}
