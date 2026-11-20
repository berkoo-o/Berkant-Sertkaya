# Puts newly rendered frame ranges (lossless, from render_ranges.mjs) into an existing finished video and encodes the result
# in the same quality as render-pc.mjs (x264 slow, CRF 14) with the given lossless sound.
# usage: python3 assemble.py <orig.mp4> <audio.flac> <out.mp4> <new1.mkv> '<[[a,b],…]>' [<new2.mkv> '<[[a,b],…]>' …]
# Each new file holds exactly the frames of its ranges, in order. Frames in no range come from the original.
import json, subprocess, sys
orig, audio, out = sys.argv[1], sys.argv[2], sys.argv[3]
pairs = [(sys.argv[i], json.loads(sys.argv[i + 1])) for i in range(4, len(sys.argv), 2)]
W, H, N = 1080, 1920, 2675; FS = W * H * 3 // 2
dec = lambda f: subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-'], stdout=subprocess.PIPE)
po = dec(orig); src = []
for path, rs in pairs: src.append((dec(path), set(f for a, b in rs for f in range(a, b))))
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-s', f'{W}x{H}', '-r', '30', '-i', '-', '-i', audio,
                        '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '320k', '-t', f'{N / 30:.4f}', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
cnt = [0] * (len(src) + 1)
for f in range(N):
    a = po.stdout.read(FS)
    if len(a) < FS: sys.exit(f'Original zu kurz bei Bild {f}')
    frame = a; k = len(src)
    for j, (p, rs) in enumerate(src):
        if f in rs:
            b = p.stdout.read(FS)
            if len(b) < FS: sys.exit(f'Neue Bilder ({pairs[j][0]}) zu kurz bei Bild {f}')
            frame, k = b, j; break
    enc.stdin.write(frame); cnt[k] += 1
enc.stdin.close(); enc.wait(); po.kill(); [p.kill() for p, _ in src]
print('ok', out, 'aus den neuen Dateien:', cnt[:-1], 'aus dem Original:', cnt[-1])
