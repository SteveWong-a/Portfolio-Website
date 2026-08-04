import re

with open("src/components/ProjectCard.jsx", "r") as f:
    content = f.read()

# Add dynamic color mapping
mapping_code = """
  const iconColorStyle = icon?.props?.style?.color || 'var(--color-accent-primary)';
  
  let hoverBorderClass = "hover:border-accent-primary/50";
  let hoverShadowClass = "hover:shadow-[0_20px_40px_rgba(88,166,255,0.3)]";
  let titleHoverClass = "group-hover:text-accent-primary";
  let gradientClass = "from-transparent via-accent-primary to-transparent";
  let subtitleClass = "text-accent-primary";

  if (iconColorStyle.includes('secondary')) {
      hoverBorderClass = "hover:border-accent-secondary/50";
      hoverShadowClass = "hover:shadow-[0_20px_40px_rgba(188,140,255,0.3)]";
      titleHoverClass = "group-hover:text-accent-secondary";
      gradientClass = "from-transparent via-accent-secondary to-transparent";
      subtitleClass = "text-accent-secondary";
  } else if (iconColorStyle.includes('green')) {
      hoverBorderClass = "hover:border-accent-green/50";
      hoverShadowClass = "hover:shadow-[0_20px_40px_rgba(63,185,80,0.3)]";
      titleHoverClass = "group-hover:text-accent-green";
      gradientClass = "from-transparent via-accent-green to-transparent";
      subtitleClass = "text-accent-green";
  }

  const handleMouseMove = (e) => {
"""

content = content.replace("  const handleMouseMove = (e) => {", mapping_code)

# Replace the classes in the JSX
content = content.replace(
    'hover:shadow-[0_20px_40px_rgba(88,166,255,0.3)] hover:border-accent-primary/50',
    '${hoverShadowClass} ${hoverBorderClass}'
)
content = content.replace(
    'className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 relative overflow-hidden flex flex-col group cursor-pointer ${hoverShadowClass} ${hoverBorderClass} scroll-reveal transition-colors duration-300"',
    'className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 relative overflow-hidden flex flex-col group cursor-pointer ${hoverShadowClass} ${hoverBorderClass} scroll-reveal transition-all duration-300`}'
)

content = content.replace(
    'className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"',
    'className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r ${gradientClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}'
)

content = content.replace(
    'className="text-xs font-semibold tracking-wider uppercase text-accent-primary opacity-80"',
    'className={`text-xs font-semibold tracking-wider uppercase ${subtitleClass} opacity-80`}'
)

content = content.replace(
    'className="text-accent-primary text-xl transition-transform duration-300 group-hover:scale-110"',
    'className={`text-xl transition-transform duration-300 group-hover:scale-110 ${subtitleClass}`}'
)

content = content.replace(
    'className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-accent-primary transition-colors"',
    'className={`text-2xl font-bold text-white mb-3 tracking-tight transition-colors ${titleHoverClass}`}'
)

content = content.replace(
    'className="text-xs font-medium text-accent-primary flex items-center gap-2"',
    'className={`text-xs font-medium flex items-center gap-2 ${subtitleClass}`}'
)


with open("src/components/ProjectCard.jsx", "w") as f:
    f.write(content)
