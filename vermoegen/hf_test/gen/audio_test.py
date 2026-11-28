# Ton für den HyperFrames-Test (11 s): python3 gen/audio_test.py im Ordner hf_test/
# Stimme Take 1 bis „Prozent.“, Musik „Radar Focus“ wie im Hauptvideo, Münz-Effekte aus dem GEZ-Video (Epidemic, lokal).
import numpy as np, subprocess, json
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; VO = 0.15; END = 11.0; N = int(SR * END); t = np.arange(N) / SR
def load(p):
    r, x = wavfile.read(p); x = x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    if r != SR: x = np.interp(np.arange(int(len(x) * SR / r)) * r / SR, np.arange(len(x)), x)
    return x / (np.max(np.abs(x)) + 1e-9)
def cut(x, a, d, fi=0.004, fo=0.08):
    y = x[int(a * SR):int((a + d) * SR)]; tt = np.arange(len(y)) / SR; dd = len(y) / SR
    return y * np.clip(np.minimum(tt / fi, (dd - tt) / fo), 0, 1)
RF = '../../rundfunk/sfx/'
fx = np.zeros(N)
def add(sig, at, g):
    i = int(at * SR); j = min(N, i + len(sig)); fx[i:j] += g * sig[:j - i]
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '../voice/take1.mp3', '-ac', '1', '-ar', str(SR), '/tmp/_vo.wav'], check=True)
r, v = wavfile.read('/tmp/_vo.wav'); v = v.astype(np.float64) / 32768
v = cut(v, 0, 10.3, 0.001, 0.12); vo = np.zeros(N); vo[int(VO * SR):int(VO * SR) + len(v)] = v
clicks = load(RF + 'clicks.wav'); ck = [cut(clicks, 0.0, 0.3, 0.003, 0.02), cut(clicks, 0.55, 0.35, 0.003, 0.02)]
add(ck[1], 0.47, 0.10)                                   # the richest figure turns red
add(ck[0], 2.05, 0.12); add(ck[0], 7.97, 0.12)           # the big numbers
add(cut(load(RF + 'epidemic/coins_stack.48k.wav'), 0.0, 1.7), 2.18, 0.42)        # 54 coins land on the red column
add(cut(load(RF + 'epidemic/coins_stack_slow.48k.wav'), 0.2, 1.5), 3.95, 0.28)   # the middle columns
wh = load(RF + 'whoosh.wav'); add(cut(wh, 0.0, 0.85, 0.003, 0.05), 6.35 - 0.29, 0.35)   # the camera leans in on the poorer half
cs = cut(load(RF + 'epidemic/coin_single.48k.wav'), 0.0, 0.45)
for k, at in enumerate([8.92, 9.04, 9.16]): add(cs, at - 0.01, 0.30 - 0.05 * k)   # three coins for the poorer half
music = load(RF + 'epidemic/music_radar_focus.48k.wav')[:N]; music = np.pad(music, (0, N - len(music)))
music *= np.clip((END - 0.1 - t) / 0.8, 0, 1) * np.clip((t + 0.2) / 0.5, 0, 1)
hp = butter(4, 250, 'high', fs=SR, output='sos'); lp = butter(2, 120, 'low', fs=SR, output='sos')
ms = music - 0.6 * sosfilt(lp, music)
env = np.sqrt(np.convolve(vo ** 2, np.ones(int(0.2 * SR)) / int(0.2 * SR), 'same')); speak = env > 0.02
duck = 10 ** (-5 / 20 * np.clip(np.convolve(speak.astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same'), 0, 1))
m_hi = np.sqrt(np.mean(sosfilt(hp, ms)[speak] ** 2)); v_hi = np.sqrt(np.mean(sosfilt(hp, vo)[speak] ** 2))
mus = ms * (v_hi / m_hi) * 10 ** (-22 / 20) * duck
fxn = fx * 10 ** (-9 / 20)
mix = vo + mus + fxn; mix /= max(1.0, np.max(np.abs(mix)) / 0.97)
wavfile.write('/tmp/_mix.wav', SR, mix.astype(np.float32))
pre = 'acompressor=threshold=-20dB:ratio=2.2:attack=8:release=150:makeup=1,alimiter=limit=0.8:level=false'
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', '/tmp/_mix.wav', '-af', pre + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = pre + f",loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '/tmp/_mix.wav', '-af', af, '-ar', '48000', '-c:a', 'flac', 'gen/mix_test.flac'], check=True)
print('ok')
