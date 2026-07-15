from pathlib import Path
from PIL import Image, ImageDraw

Path("icons").mkdir(exist_ok=True)
for size in (192, 512):
    image = Image.new("RGB", (size, size), "#075985")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=size // 5, fill="#075985")
    draw.ellipse((size*.164, size*.164, size*.836, size*.836), fill="white")
    draw.rounded_rectangle((size*.39, size*.28, size*.61, size*.70), radius=size//18, fill="#15803d")
    draw.ellipse((size*.45, size*.16, size*.55, size*.26), fill="#ca8a04")
    image.save(f"icons/icon-{size}.png", optimize=True)
