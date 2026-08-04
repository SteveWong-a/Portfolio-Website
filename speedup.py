from PIL import Image
import sys

input_file = sys.argv[1]
output_file = sys.argv[2]

try:
    img = Image.open(input_file)
    frames = []
    
    # Read all frames and cut duration in half
    for frame in range(0, img.n_frames, 2):  # Drop every other frame to double speed
        img.seek(frame)
        new_frame = img.copy()
        frames.append(new_frame)
    
    # Save the new webp
    frames[0].save(
        output_file,
        format='WEBP',
        save_all=True,
        append_images=frames[1:],
        duration=img.info.get('duration', 40), # Maintain original duration per frame, but we have half the frames
        loop=0
    )
    print("Success")
except Exception as e:
    print(f"Error: {e}")
