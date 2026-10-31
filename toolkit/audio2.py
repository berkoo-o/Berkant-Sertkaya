import numpy as np, json, subprocess
from scipy.signal import butter, sosfilt
SR = 48000
ev = json.load(open('events2.json')); T, OFF, DUR = 1.0, ev['OFF'], ev['dur']
N = int(DUR * SR) + 8 * SR
def tt(v): return v / T + OFF
rng = np.random.default_rng(1)

# voice
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'up/voice2.mp3', '-af', f'atempo={T},adelay={int(OFF*1000)}', '-ar', str(SR), '-ac', '1', '-f', 'f32le', 'voice.raw'], check=True)
voice = np.fromfile('voice.raw', dtype=np.float32); voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

def nf(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)

# ---- music: calm documentary piano + pad + soft pulse
music = np.zeros(N); beat = 60 / 72; bar = 4 * beat
prog = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]  # Am F C G
t_end = tt(ev['VO'])
nb = int(t_end / bar) + 1
for b in range(nb + 1):
    ch = prog[(b // 2) % 4] if b < nb else prog[0]
    st = b * bar; n0 = int(st * SR); L = int(bar * SR * 1.6); tt_ = np.arange(L) / SR
    env = np.minimum(1, tt_ / 1.2) * np.exp(-tt_ / 4.5)
    pad = sum(np.sin(2 * np.pi * nf(n - 12) * tt_ * d) for n in ch for d in (1, 1.003))
    seg = pad * env * .018
    e = min(N, n0 + L); music[n0:e] += seg[:e - n0]
    # arpeggio piano
    for k in range(4):
        if b >= nb and k > 0: break
        n = ch[[0, 1, 2, 1][k]] + 12; s0 = int((st + k * beat) * SR); Lp = int(2.5 * SR); tp = np.arange(Lp) / SR
        tone = sum(np.sin(2 * np.pi * nf(n) * h * tp) / h ** 1.6 for h in (1, 2, 3, 4)) * np.exp(-tp * 2.2) * np.minimum(1, tp / .004)
        e = min(N, s0 + Lp); music[s0:e] += (tone * (.05 if k == 0 else .035))[:e - s0]
    # soft pulse
    for k in range(4):
        s0 = int((st + k * beat) * SR); Lk = int(.35 * SR); tk = np.arange(Lk) / SR
        th = np.sin(2 * np.pi * 52 * tk) * np.exp(-tk * 14) * .05
        e = min(N, s0 + Lk); music[s0:e] += th[:e - s0]
music = lp(music, 5000)
tm = np.arange(N) / SR
music *= np.minimum(1, tm / 1.0) * np.clip((DUR - tm) / 1.5, 0, 1)
# duck under voice
envv = np.abs(voice); k = int(.25 * SR); envv = np.convolve(envv, np.ones(k) / k, 'same')
duck = np.where(envv > .01, .55, 1.0); duck = np.convolve(duck, np.ones(int(.3 * SR)) / int(.3 * SR), 'same')
music *= duck

# ---- sfx
fx = np.zeros(N)
def add(sig, t, g=1):
    s0 = int(t * SR); e = min(N, s0 + len(sig))
    if 0 <= s0 < N: fx[s0:e] += sig[:e - s0] * g
def whoosh():
    L = int(.7 * SR); x = rng.standard_normal(L); t = np.arange(L) / SR
    env = np.sin(np.pi * np.clip(t / .7, 0, 1)) ** 2
    return bp(x, 300, 2600) * env * .10
def click():
    L = int(.03 * SR); t = np.arange(L) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180) * .12
def pop():
    L = int(.12 * SR); t = np.arange(L) / SR
    return np.sin(2 * np.pi * (700 + 500 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .10
def bass():
    L = int(.9 * SR); t = np.arange(L) / SR; f = 45 + 30 * np.exp(-t * 8)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * .45
def chime():
    L = int(2.5 * SR); t = np.arange(L) / SR
    return sum(np.sin(2 * np.pi * nf(n) * t) * np.exp(-t * 2) for n in (81, 88, 93)) * .03 * np.minimum(1, t / .01)

for v in ev['whoosh']: add(whoosh(), tt(v) - .35)
for v in [0.02, ev['T2007'], ev['T2026']]: add(bass(), tt(v))
for v in [ev['T56'], ev['T35']]: add(bass(), tt(v), .6)
add(whoosh(), tt(ev['VO']) - .1, .8); add(bass(), tt(ev['VO'] + .78), .8); add(pop(), tt(ev['VO'] + .78))
add(whoosh(), tt(ev['VO'] + .95) - .1, .5); add(chime(), tt(ev['VO'] + 1.9))
for v in ev['pops']: add(pop(), tt(v))
for k in range(10): add(click(), tt(ev['T100'] - .1 + k * .08), .7)
for k in range(10): add(click(), tt(ev['T35'] - .3 + k * .1), .6)

def crack():
    L = int(.35 * SR); t = np.arange(L) / SR; x = rng.standard_normal(L)
    return sosfilt(butter(2, 2500, 'high', fs=SR, output='sos'), x) * np.exp(-t * 18) * .18
import render2 as R2
tf = R2.wt2('Fahrzeug')
for v in [1.0, tf + .5, 43.6, R2.T35 + .4, ev['T2007'] + .5]: add(pop(), tt(v), .9)
for v in [17.7, 17.85]: add(crack(), tt(v))
add(whoosh(), tt(17.6), .6); add(whoosh(), tt(36.8), .8); add(whoosh(), tt(41.4), .5); add(pop(), tt(ev['T100'] - .1))
# engine rumble while car drives
L = int(7.0 * SR); te = np.arange(L) / SR
eng = (np.sin(2 * np.pi * 42 * te) * .5 + lp(rng.standard_normal(L), 180) * 2.5) * np.minimum(1, te / .8) * np.clip((7.0 - te) / 1.0, 0, 1) * .06
add(eng, tt(6.7))

def write(name, sig):
    sig = sig[:int(DUR * SR)]; sig = sig / max(1e-6, np.max(np.abs(sig))) * .9
    sig.astype(np.float32).tofile(name + '.raw')
write('mix2_music', voice + music * .9 + fx)
write('mix2_fx', voice + fx)
print('ok')
