import numpy as np, subprocess, os
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 61.2; O = 57.9; N = int(SR * DUR)
rng = np.random.default_rng(21)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    return e * np.exp(-np.arange(n) / SR / d)
def win(a, b, f=0.25): return np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
def tone(f, d, dec=None, a=0.004):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2*np.pi*f*tt) * (env(n, a, dec) if dec else np.clip(np.minimum(tt/a, (d-tt)/0.02), 0, 1))
def noise(d): return rng.standard_normal(int(d * SR))

# ---------------- music: schraffuren style (soft sub pulse ~100 BPM, airy pad, almost no melody)
music = np.zeros(N)
def addm(sig, at, g=1.0):
    i = int(at * SR)
    if 0 <= i < N: j = min(N, i + len(sig)); music[i:j] += g * sig[:j - i]
bpm = 100; beat = 60 / bpm; bar = 4 * beat
chords = [[50, 57, 64, 69], [47, 54, 62, 66], [43, 50, 57, 64], [45, 52, 59, 64]]
pos = 0.0; k = 0
while pos < DUR:
    ch = chords[k % 4]; n = int(bar*SR*2.2); tt = np.arange(n)/SR
    pad = sum(sum(np.sin(2*np.pi*mtof(x)*d*tt + 0.15*np.sin(2*np.pi*0.3*tt)) for d in (1, 1.002, 0.998)) for x in ch[1:])
    air = bp(rng.standard_normal(n), 2500, 6000) * 0.05
    e = np.minimum(1, tt/1.2) * np.clip((bar*2.2 - tt)/1.0, 0, 1)
    if k % 2 == 0: addm((lp(pad, 1400) + air) * e, pos, 0.018)
    for b in range(4):
        kn = int(.45*SR); kt = np.arange(kn)/SR
        kick = np.sin(2*np.pi*(44 + 38*np.exp(-kt*22))*kt) * np.exp(-kt*6.5) * np.minimum(1, kt/0.004)
        addm(lp(kick, 160), pos + b*beat, 0.34)
        bn = int(beat*SR*0.9); bt = np.arange(bn)/SR
        addm(lp(np.sin(2*np.pi*mtof(ch[0]-12)*bt), 120) * np.sin(np.pi*np.clip(bt/(beat*0.9), 0, 1))**1.5, pos + b*beat + 0.02, 0.10)
        tk = int(.02*SR); addm(bp(rng.standard_normal(tk), 3000, 8000) * np.exp(-np.arange(tk)/SR*300), pos + b*beat + beat/2, 0.012)
    pos += bar; k += 1
music *= np.clip((O + 2.6 - t) / 1.8, 0, 1) * np.clip(t / 0.8, 0, 1)

# ---------------- SFX
fx = np.zeros(N)
def add(sig, at, g=1.0):
    i = int(at * SR)
    if 0 <= i < N: j = min(N, i + len(sig)); fx[i:j] += g * sig[:j - i]
def _seg(fn, a, b, peak):
    _r, _x = wavfile.read(fn); _x = _x.astype(np.float64)[int(a*_r):int(b*_r)]
    if _x.ndim > 1: _x = _x.mean(1)
    _f = np.minimum(1, np.arange(len(_x))/(0.003*SR)) * np.minimum(1, (len(_x) - np.arange(len(_x)))/(0.02*SR))
    return _x / (np.max(np.abs(_x)) + 1e-9) * peak * _f
S = '../sfx/'
WH = [(_seg(S+'whoosh.wav', 0.0, 0.85, 0.30), 0.293), (_seg(S+'whoosh.wav', 1.45, 2.4, 0.30), 0.263)]
CK = [_seg(S+'clicks.wav', 0.0, 0.3, 0.22), _seg(S+'clicks.wav', 0.55, 0.9, 0.22), _seg(S+'clicks.wav', 1.12, 1.27, 0.22)]
for i, c in enumerate([6.5, 10.25, 13.2, 18.8, 22.6, 31.2, 34.55, 37.4, 38.75, 42.1, 49.35, 57.9]): add(WH[i % 2][0], c - WH[i % 2][1])
for i, c in enumerate([6.9, 19.6, 42.5, 45.9, 50.2]): add(CK[i % 3], c)
def sweep(f0, f1, d, g):
    n = int(d*SR); tt = np.arange(n)/SR; f = f0 * (f1/f0) ** (tt/d)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*tt/d) * g
def flick(g=1.0):  # paper flick
    n = int(.09*SR); return hp(noise(.09), 2500) * env(n, 0.002, 0.02) * g
def clack(g=1.0):
    n = int(.08*SR); return bp(noise(.08), 400, 2600) * env(n, 0.001, 0.018) * g
def thud(g=1.0):
    n = int(.35*SR); tt = np.arange(n)/SR; return (np.sin(2*np.pi*90*tt) + 0.5*lp(noise(.35), 800)) * env(n, 0.002, 0.06) * g
def blip(f, g=1.0): return tone(f, 0.07, 0.02) * g
def motor(a, b, f, g):
    m = (lp(rng.standard_normal(N), 320) * 0.5 + 0.12*np.sin(2*np.pi*f*t) + 0.06*np.sin(2*np.pi*f*2.01*t)) * win(a, b)
    return m * g
# hook: x-ray scan down / up, note peeks out
add(sweep(1400, 500, 1.2, 0.07), 1.2); add(sweep(500, 1400, 0.8, 0.06), 3.7); add(flick(0.35), 5.05); add(motor(0, 0, 0, 0)[:1], 0)
fx += motor(4.9, 6.0, 140, 0.10)
# map: dots pop
for i in range(48): add(tone(1500 + (i % 5) * 180, 0.03, 0.008), 6.9 + i*0.04, 0.035)
# card in: slide + click, chip read blips
add(bp(noise(.9), 800, 3500) * np.sin(np.pi*np.linspace(0, 1, int(.9*SR)))**2, 10.6, 0.06); add(clack(0.5), 11.55)
for i in range(5): add(blip(1900), 12.0 + i*0.22, 0.05)
# network: data blips out, arrival, back, success chime
for i in range(10): add(blip(900 + i*90), 13.6 + i*0.21, 0.04)
add(tone(1320, 0.25, 0.08), 15.8, 0.06)
for i in range(6): add(blip(1700 - i*90), 16.6 + i*0.19, 0.04)
for i, m_ in enumerate([76, 81, 88]): add(tone(mtof(m_), 0.5, 0.16), 17.85 + i*0.07, 0.06)
# cutaway: scan
add(sweep(1400, 500, 0.9, 0.07), 18.9)
# close-up: roller motor, flick per note, sensor beeps, flap, bin
fx += motor(22.6, 31.2, 95, 0.16)
for c in [22.95, 23.95, 24.95, 25.95, 28.45]: add(flick(0.4), c)
add(tone(2100, 0.12, 0.05), 26.4, 0.07)
for i in range(3): add(tone(1250, 0.09, 0.04), 28.85 + i*0.14, 0.09); add(tone(940, 0.09, 0.04), 28.92 + i*0.14, 0.06)
add(clack(0.6), 28.75); add(thud(0.4), 30.0)
# path: belts, shutter
fx += motor(31.3, 34.5, 170, 0.14)
for c in [31.5, 32.0, 32.5]: add(flick(0.3), c)
add(clack(0.7), 34.3)
# present + retract
add(flick(0.4), 34.45); fx += motor(36.0, 36.95, 150, 0.14); add(clack(0.7), 36.97)
# thieves: uneasy low tone (short, not dark)
n_ = int(1.2*SR); tt_ = np.arange(n_)/SR
add((np.sin(2*np.pi*73*tt_) + 0.6*np.sin(2*np.pi*110*tt_)) * np.sin(np.pi*tt_/1.2)**2, 37.5, 0.10)
# blast: muffled boom + debris, ink hiss and drips
bn_ = int(1.2*SR); bt_ = np.arange(bn_)/SR; fb = 38 + 70*np.exp(-bt_*9)
add((np.sin(2*np.pi*np.cumsum(fb)/SR) + 0.8*lp(noise(1.2), 500)) * np.exp(-bt_*3.2) * np.minimum(1, bt_/0.004), 39.0, 0.75)
add(hp(noise(.5), 3000) * env(int(.5*SR), 0.002, 0.12), 39.02, 0.15)
hs = bp(noise(1.9), 2500, 9000) * np.clip(np.minimum(np.linspace(0, 1.9, int(1.9*SR))/0.15, (1.9 - np.linspace(0, 1.9, int(1.9*SR)))/0.6), 0, 1)
add(hs, 39.55, 0.07)
for i in range(14): add(tone(500 + rng.uniform(0, 500), 0.05, 0.012), 39.8 + rng.uniform(0, 1.6), 0.05)
# bars: rise + ticks
add(sweep(180, 420, 0.9, 0.10), 42.4); add(sweep(180, 300, 0.9, 0.10), 45.95)
for i in range(12): add(tone(1800, 0.02, 0.006), 42.5 + i*0.07, 0.04); add(tone(1500, 0.02, 0.006), 45.95 + i*0.07, 0.04)
add(thud(0.25), 43.3); add(thud(0.2), 46.85)
# 1968: key in, turn, punched card, drawer
add(clack(0.4), 51.55); add(clack(0.7), 52.25)
add(bp(noise(.8), 1200, 5000) * np.sin(np.pi*np.linspace(0, 1, int(.8*SR)))**2, 52.85, 0.05); add(clack(0.4), 53.65)
add(lp(noise(.7), 700) * np.sin(np.pi*np.linspace(0, 1, int(.7*SR)))**2, 54.1, 0.20); add(thud(0.35), 54.78)
fx *= np.clip((O + 0.6 - t) / 0.8, 0, 1)
# outro: receipt printer steps, card eject click, swoosh, dot click + bell
for i in range(10):
    n1 = int(.085*SR); tt1 = np.arange(n1)/SR
    add((np.sign(np.sin(2*np.pi*310*tt1)) * 0.5 + bp(noise(.085), 1500, 6000)) * np.clip(np.minimum(tt1/0.004, (0.085 - tt1)/0.01), 0, 1), O + 0.35 + i*0.115, 0.07)
add(CK[0], O + 0.9); add(WH[0][0], O + 1.55 - WH[0][1]); add(CK[1], O + 2.0)
cn = int(2.4*SR); ct = np.arange(cn)/SR
add(sum(np.sin(2*np.pi*mtof(n)*ct) for n in (76, 83, 88)) * np.exp(-ct*1.6) * np.minimum(1, ct/.01), O + 2.03, 0.06)

# ---------------- voice + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', 'voice.raw'], check=True)
v = np.fromfile('voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.65 * np.clip(ve * 6, 0, 1), 3)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
mus = norm(music, 1.0) * 0.16 * duck
sfx = norm(fx, 1.0) * 0.36 * (1 - 0.35 * np.clip(ve * 6, 0, 1))
vo = norm(voice, 1.0) * 0.9
for name, mix in [('mix_music.wav', vo + mus + sfx), ('mix_fx.wav', vo + sfx)]:
    m = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
    wavfile.write(name, SR, np.stack([m, m], 1).astype(np.float32))
print('ok')
