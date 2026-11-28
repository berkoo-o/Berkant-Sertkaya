import sys
from PIL import Image, ImageDraw, ImageFont
src, x0, y0, x1, y1, step, out = sys.argv[1], *map(int, sys.argv[2:7]), sys.argv[7]
scale = float(sys.argv[8]) if len(sys.argv) > 8 else 1.0
im = Image.open(src).convert('RGB').crop((x0, y0, x1, y1))
im = im.resize((int(im.width*scale), int(im.height*scale)), Image.LANCZOS)
d = ImageDraw.Draw(im)
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except Exception: f = ImageFont.load_default()
gx = (x0 // step + 1) * step
while gx < x1:
    X = (gx - x0) * scale; d.line([(X, 0), (X, im.height)], fill=(0, 255, 255), width=1); d.text((X + 2, 2), str(gx), fill=(255, 255, 0), font=f); gx += step
gy = (y0 // step + 1) * step
while gy < y1:
    Y = (gy - y0) * scale; d.line([(0, Y), (im.width, Y)], fill=(0, 255, 255), width=1); d.text((2, Y + 2), str(gy), fill=(255, 255, 0), font=f); gy += step
im.save(out, quality=88)
