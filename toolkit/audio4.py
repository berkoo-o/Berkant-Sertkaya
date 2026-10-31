import numpy as np, json, subprocess
from scipy.signal import butter, sosfilt
SR = 48000
ev = json.load(open('events4.json')); OFF, DUR, VO, T = ev['OFF'], ev['dur'], ev['VO'], ev['T']
N = int(DUR * SR) + 8 * SR
def tt(v): return v / T + OFF
rng = np.random.default_rng(3)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'up/voice3.mp3', '-af', f'atempo={T},adelay={int(OFF*1000)}', '-ar', str(SR), '-ac', '1', '-f', 'f32le', 'voice4.raw'], check=True)
voice = np.fromfile('voice4.raw', dtype=np.float32); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
def nf(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)

# music: own motif for this video - D minor, 84 bpm, soft 8th arpeggio + road pulse
music = np.zeros(N); beat = 60 / 84; bar = 4 * beat
prog = [[62, 65, 69], [58, 62, 65], [57, 60, 65], [60, 64, 67]]
m0 = 0.9; nb = int((tt(VO) - m0) / bar) + 1
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

# ---- engine start: key click, starter crank, ignition, rev, idle
L = int(6.5 * SR); t = np.arange(L) / SR; eng = np.zeros(L)
kc = int(.03 * SR); eng[int(.02 * SR):int(.02 * SR) + kc] += hp(rng.standard_normal(kc), 3000) * np.exp(-np.arange(kc) / SR * 160) * .25
cr = (t > .04) & (t < .41)
crank_f = 95 + 60 * (t - .04)
whine = np.sin(2 * np.pi * np.cumsum(crank_f) / SR) * .5 + np.sin(2 * np.pi * np.cumsum(crank_f * 2) / SR) * .25
puls = (.5 + .5 * np.cos(2 * np.pi * 11 * t)) ** 3
eng += cr * (whine * .18 + lp(rng.standard_normal(L), 400) * 1.6 * puls) * .5
ff = np.where(t < .42, 0, np.interp(t, [.42, .55, .8, 1.15, 1.8, 6.5], [18, 45, 72, 50, 31, 30]))
ph = np.cumsum(ff) / SR * 2 * np.pi
fire = sum(np.sin(k * ph) / k for k in range(1, 9)) * .30
comb = lp(rng.standard_normal(L), 900) * ((.5 + .5 * np.cos(ph)) ** 6) * 2.2
rumble = lp(rng.standard_normal(L), 120) * 3.0
on = np.clip((t - .42) / .04, 0, 1)
lvl = np.interp(t, [.42, .8, 1.2, 2.0, 3.4, 6.0], [1.0, 1.15, .7, .45, .3, 0])
eng += on * lvl * (fire + comb * .5 + rumble * .4) * .45
eng = lp(eng, 3500)
add(eng, 0.0)
# driving ambience + passing signs during the road scene
L2 = int(6.0 * SR); t2 = np.arange(L2) / SR
amb = bp(rng.standard_normal(L2), 80, 900) * .05 * np.clip(t2 / 1.0, 0, 1) * np.clip((6.0 - t2) / 1.2, 0, 1)
add(whoosh(.6, .12), tt(.05))
for k in range(36): add(click(), tt(.5 + k * .05 + rng.uniform(0, .03)), .35)
add(whoosh(.8, .08), tt(3.35))
for v in [5.6, 9.3, 11.85, 15.05, 23.45, 32.65, 42.7, 48.9, 55.4]: add(whoosh(1.0, .09), tt(v) - .25)
for v in [ev['T1975']] + ev['zones']: add(bass(), tt(v), .8 if v != ev['T1975'] else 1)
add(bass(), tt(4.2), .7); add(pop(), tt(4.2)); add(pop(), tt(4.95), .8)
for i in range(3): add(pop(), tt(9.5 + i * .35))
for i in range(9): add(pop(), tt(11.95 + i * .28 + .9), .5)
add(pop(), tt(18.36)); add(pop(), tt(21.51))
for k in range(25): add(click(), tt(25.8 + k * .25), .5)
for d in range(9): add(click(), tt(33.0 + d * .1), .7)
add(pop(), tt(ev['A995'] + .8)); add(bass(), tt(ev['A995'] + .8), .5)
add(pop(), tt(49.9)); add(whoosh(.9, .08), tt(51.9))
for v in [58.5, 60.2, 62.6]: add(pop(), tt(v))
add(whoosh(.8, .09), tt(VO - .1)); add(bass(), tt(VO + .45), .8); add(chime(), tt(VO + 1.5))

def write(name, sig):
    sig = sig[:int(DUR * SR)]; sig = sig / max(1e-6, np.max(np.abs(sig))) * .9; sig.astype(np.float32).tofile(name + '.raw')
write('mix4_music', voice + music * .9 + fx); write('mix4_fx', voice + fx); print('ok')
