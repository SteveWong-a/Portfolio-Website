from PIL import Image
import os

files = [
    ("public/boyscout.jpeg", "public/boyscout.webp"),
    ("public/telescope 3d.jpg", "public/telescope 3d.webp")
]

for in_file, out_file in files:
    if os.path.exists(in_file):
        img = Image.open(in_file)
        img.save(out_file, 'WEBP', quality=85)
        os.remove(in_file)
        print(f"Converted {in_file} to {out_file}")
    else:
        print(f"File not found: {in_file}")
