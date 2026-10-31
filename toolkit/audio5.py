import numpy as np, json, subprocess
from scipy.signal import butter, sosfilt
SR = 48000
ev = json.load(open('events5.json')); OFF, DUR, VO, T = ev['OFF'], ev['dur'], ev['VO'], 1.0
N = int(DUR * SR) + 8 * SR
def tt(v): return v / T + OFF
rng = np.random.default_rng(3)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'up/voice5.mp3', '-af', f'atempo={T},adelay={int(OFF*1000)}', '-ar', str(SR), '-ac', '1', '-f', 'f32le', 'voice5.raw'], check=True)
voice = np.fromfile('voice5.raw', dtype=np.float32); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
def nf(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)

# music: own motif for this video - D minor, 84 bpm, soft 8th arpeggio + road pulse
music = np.zeros(N); beat = 60 / 80; bar = 4 * beat
prog = [[60, 63, 67], [56, 60, 63], [55, 58, 63], [58, 62, 65]]
m0 = 0.6; nb = int((tt(VO) - m0) / bar) + 1
for b in range(nb + 1):
    ch = prog[b % 4] if b < nb else prog[0]; st = m0 + b * bar; n0 = int(st * SR); L = int(bar * SR * 1.5); t_ = np.arange(L) / SR
    env = np.minimum(1, t_ / .9) * np.exp(-t_ / 3.5)
    music[n0:n0 + L] += sum(np.sin(2 * np.pi * nf(n - 12) * t_ * d) for n in ch for d in (1, 1.004)) * env * .016
    music[n0:n0 + L] += np.sin(2 * np.pi * nf(ch[0] - 24) * t_) * env * .03
    for k in range(8 if b < nb else 1):
        n = ch[[0, 1, 2, 1, 2, 0, 1, 2][k]] + 12 + (12 if k in (4, 6) else 0)
        s0 = int((st + k * beat / 2) * SR); Lp = int(.9 * SR); tp = np.arange(Lp) / SR
        tone = (np.sin(2 * np.pi * nf(n) * tp) + .3 * np.sin(2 * np.pi * nf(n) * 2 * tp)) * np.exp(-tp * 5) * np.minimum(1, tp / .006)
        music[s0:s0 + Lp] += tone * (.03 if k % 2 == 0 else .022)
        Lt = int(.06 * SR); music[s0:s0 + Lt] += bp(rng.standard_normal(Lt), 2000, 6000) * np.exp(-np.arange(Lt) / SR * 60) * .008
        if k in (0, 4):
            Lk = int(.3 * SR); tk = np.arange(Lk) / SR; music[s0:s0 + Lk] += np.sin(2 * np.pi * 50 * tk) * np.exp(-tk * 16) * .06
music = lp(music, 5000); tm = np.arange(N) / SR
music *= np.clip((tm - m0) / 1.2, 0, 1) * np.clip((DUR - tm) / 1.4, 0, 1)
envv = np.convolve(np.abs(voice), np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
duck = np.convolve(np.where(envv > .01, .55, 1.0), np.ones(int(.3 * SR)) / int(.3 * SR), 'same'); music *= duck

fx = np.zeros(N)
def add(sig, t, g=1):
    s0 = int(t * SR)
    if 0 <= s0 < N: e = min(N, s0 + len(sig)); fx[s0:e] += sig[:e - s0] * g
def whoosh(d=.7, g=.10):
    L = int(d * SR); x = rng.standard_normal(L); t = np.arange(L) / SR; return bp(x, 300, 2600) * np.sin(np.pi * t / d) ** 2 * g
def click(): L = int(.03 * SR); t = np.arange(L) / SR; return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180) * .12
def pop(): L = int(.12 * SR); t = np.arange(L) / SR; return np.sin(2 * np.pi * (700 + 500 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .10
def bass(): L = int(.9 * SR); t = np.arange(L) / SR; f = 45 + 30 * np.exp(-t * 8); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * .45
def chime(): L = int(2.5 * SR); t = np.arange(L) / SR; return sum(np.sin(2 * np.pi * nf(n) * t) * np.exp(-t * 2) for n in (81, 88, 93)) * .03 * np.minimum(1, t / .01)

# ---- fuel nozzle click, pouring, pump counter, transitions
kc = int(.04 * SR); add(hp(rng.standard_normal(kc), 2500) * np.exp(-np.arange(kc) / SR * 120) * .3, tt(.05))
L = int(2.6 * SR); t = np.arange(L) / SR
pour = bp(rng.standard_normal(L), 300, 2400) * (.6 + .4 * np.sin(2 * np.pi * 7 * t) ** 2) * np.clip(t / .15, 0, 1) * np.clip((2.6 - t) / .4, 0, 1) * .07
gl = np.sin(2 * np.pi * (180 + 120 * t) * t) * (np.sin(2 * np.pi * 5 * t) > .6) * .015
add(pour + gl * np.clip((2.6 - t) / .4, 0, 1), tt(.3))
for k in range(40): add(click(), tt(.35 + k * .05), .25)
add(pop(), tt(2.45)); add(bass(), tt(ev['staat'] + .3), .7)
for v in [4.2, 9.0, 17.3, 22.1, 28.36, 35.95, 41.85, 46.55, 51.4]: add(whoosh(.9, .08), tt(v) - .25)
for k in range(10): add(click(), tt(ev['t210'] - .1 + k * .08), .5)
add(bass(), tt(ev['t210'] + .5), .6)
for k in range(6): add(click(), tt(ev['egal'] + k * .35), .4)
add(whoosh(.7, .07), tt(ev['t51'] + .1)); add(pop(), tt(ev['t51'] + .4))
for k in range(5): add(pop(), tt(22.4 + k * .15), .4)
add(pop(), tt(36.0)); add(pop(), tt(ev['t34'])); 
for k in range(10): add(click(), tt(ev['euro1'] - .2 + k * .09), .5)
add(bass(), tt(ev['euro1'] + .6), .8)
for v in ev['icons']: add(pop(), tt(v), .7)
add(whoosh(.6, .06), tt(ev['jan'])); add(whoosh(.9, .08), tt(ev['jan'] + .1)); add(pop(), tt(ev['jan'] + .5))
for k in range(6): add(click(), tt(ev['t17'] - .2 + k * .05), .8)
add(bass(), tt(ev['t17'] + .05), .8)
# outro: drop + splash
L2 = int(.5 * SR); t2 = np.arange(L2) / SR
blop = np.sin(2 * np.pi * np.cumsum(900 * np.exp(-t2 * 9) + 250) / SR) * np.exp(-t2 * 12) * .18
add(blop, tt(VO + 1.2)); add(bp(rng.standard_normal(L2), 1500, 6000) * np.exp(-t2 * 14) * .08, tt(VO + 1.2))
add(bass(), tt(VO + 1.2), .6); add(chime(), tt(VO + 1.8))
def write(name, sig):
    sig = sig[:int(DUR * SR)]; sig = sig / max(1e-6, np.max(np.abs(sig))) * .9; sig.astype(np.float32).tofile(name + '.raw')
write('mix5_music', voice + music * .9 + fx); write('mix5_fx', voice + fx); print('ok')
