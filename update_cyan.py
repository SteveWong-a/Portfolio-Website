import os
def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace text-cyan-400, bg-cyan-400, border-cyan-400, etc. with their [#00FFFF] counterparts.
    # Using simple replace for known variants
    content = content.replace('text-cyan-400', 'text-[#00FFFF]')
    content = content.replace('bg-cyan-400', 'bg-[#00FFFF]')
    content = content.replace('border-cyan-400', 'border-[#00FFFF]')
    content = content.replace('border-l-cyan-400', 'border-l-[#00FFFF]')
    content = content.replace('rgba(34,211,238', 'rgba(0,255,255')
    
    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/components/VisionHudOverlay.jsx')
replace_in_file('src/components/ProjectCard.jsx')
replace_in_file('src/components/OpenPanel.jsx')
replace_in_file('src/components/Dock.jsx')
print("Done")
