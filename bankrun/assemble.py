# Puts newly rendered frame ranges (lossless, from render_ranges.mjs) into an existing finished video and encodes the result
# in the same quality as render-pc.mjs (x264 slow, CRF 14) with the given lossless sound.
# usage: python3 assemble.py <orig.mp4> <new.mkv> '<[[a,b],…]>' <audio.flac> <out.mp4>
import json, subprocess, sys
orig, new, ranges, audio, out = sys.argv[1], sys.argv[2], json.loads(sys.argv[3]), sys.argv[4], sys.argv[5]
W, H, N = 1080, 1920, 2675; FS = W * H * 3 // 2
rep = set(f for a, b in ranges for f in range(a, b))
dec = lambda f: subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-'], stdout=subprocess.PIPE)
po, pn = dec(orig), dec(new)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-i', audio,
                        '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '320k', '-t', f'{N / 30:.4f}', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
used_new = 0
for f in range(N):
    a = po.stdout.read(FS)
    if len(a) < FS: sys.exit(f'Original zu kurz bei Bild {f}')
    if f in rep:
        b = pn.stdout.read(FS)
        if len(b) < FS: sys.exit(f'Neue Bilder zu kurz bei Bild {f}')
        enc.stdin.write(b); used_new += 1
    else: enc.stdin.write(a)
enc.stdin.close(); enc.wait(); po.kill(); pn.kill()
print('ok', out, 'neu:', used_new, 'alt:', N - used_new)
