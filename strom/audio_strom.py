import numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 61.0; O = 57.6; N = int(SR * DUR)
rng = np.random.default_rng(7)
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

# ---------------- music: schraffuren style (soft sub pulse ~100 BPM, airy pad, almost no melody) = track_D
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
music *= np.clip((O + 2.8 - t) / 1.8, 0, 1) * np.clip(t / 0.8, 0, 1)

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
for i, c in enumerate([2.6, 5.45, 12.95, 19.4, 23.3, 26.1, 29.05, 31.5, 34.85, 38.15, 41.35, 50.75]): add(WH[i % 2][0], c - WH[i % 2][1], 0.8)
for i, c in enumerate([7.0, 10.6, 19.9, 26.4, 29.3, 31.7, 32.5, 33.3, 34.1, 38.5, 45.3, 52.3]): add(CK[i % 3], c, 0.9)
def sweep(f0, f1, d, g):
    n = int(d*SR); tt = np.arange(n)/SR; f = f0 * (f1/f0) ** (tt/d)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*tt/d) * g
def clack(g=1.0, lo=400, hi=2600, d=0.018):
    n = int(.08*SR); return bp(noise(.08), lo, hi) * env(n, 0.001, d) * g
def thud(g=1.0, f=90):
    n = int(.35*SR); tt = np.arange(n)/SR; return (np.sin(2*np.pi*f*tt) + 0.5*lp(noise(.35), 800)) * env(n, 0.002, 0.06) * g
def zap(d=0.35, f0=2400, f1=700, g=1.0):  # soft electric zip for the red pulse
    n = int(d*SR); tt = np.arange(n)/SR; f = f0*(f1/f0)**(tt/d)
    s = np.sin(2*np.pi*np.cumsum(f)/SR) * 0.6 + bp(noise(d), 1500, 6000) * 0.25
    return s * np.sin(np.pi*tt/d)**2 * g
def hum(a, b, g, f=100, buzz=0.35, fade=0.3):  # transformer / grid hum
    s = np.sin(2*np.pi*f*t) + 0.45*np.sin(2*np.pi*2*f*t) + 0.2*np.sin(2*np.pi*3*f*t)
    s = s + buzz*lp(np.sign(np.sin(2*np.pi*f*t)) * 0.3, 900)
    return s * win(a, b, fade) * g
def wind(a, b, g):
    w = lp(rng.standard_normal(N), 500) * (0.7 + 0.3*np.sin(2*np.pi*0.13*t + 1.0))
    return w * win(a, b, 0.4) * g
def swish(at, g=1.0):  # blade passing the tower: soft low whoom
    n = int(1.1*SR); tt = np.arange(n)/SR
    s = bp(noise(1.1), 120, 700) * np.sin(np.pi*np.clip(tt/1.1, 0, 1))**3
    add(s, at, g)
def crackle(a, b, g, rate=18):
    for _ in range(int((b - a) * rate)):
        at = rng.uniform(a, b); n = int(.012*SR); add(hp(noise(.012), 3000) * env(n, 0.0005, 0.003), at, g * rng.uniform(0.4, 1))

# room: plug slides in, clicks home, light on
add(bp(noise(.75), 900, 4000) * np.sin(np.pi*np.linspace(0, 1, int(.75*SR)))**2, 0.33, 0.05)
add(clack(0.9, 300, 2200, 0.02), 1.07); add(thud(0.35, 110), 1.07)
add(clack(0.35, 1500, 6000, 0.008), 1.40)
fx += hum(1.45, 2.6, 0.012, f=50, buzz=0.1)
# town establishing: night air
fx += wind(2.6, 12.95, 0.05)
for i in range(16): add(tone(4200 + rng.uniform(-300, 300), 0.05, 0.012) * (1 + 0*i), 2.8 + i*0.17 + rng.uniform(0, 0.05), 0.008)  # faint crickets
# wind park: blade swishes
for c in np.arange(5.6, 12.9, 1.82): swish(c, 0.22)
# nacelle: gearbox + generator whine
fx += (lp(rng.standard_normal(N), 220) * 0.5 + 0.25*np.sin(2*np.pi*88*t) + 0.1*np.sin(2*np.pi*176*t)) * win(12.95, 16.75, 0.3) * 0.12
gw = np.sin(2*np.pi*np.cumsum(320 + 260*np.clip((t - 14.9)/0.8, 0, 1))/SR) * win(14.9, 16.75, 0.3)
fx += gw * 0.025
for c in np.arange(13.1, 16.7, 1.82): swish(c, 0.15)
# tower: pulse travels down, transformer hum starts
add(zap(2.0, 1800, 260, 0.6), 16.85); fx += hum(18.75, 19.4, 0.05, f=100)
# substation: strong hum + crackle + zips
fx += hum(19.4, 23.3, 0.07, f=100); crackle(19.6, 23.2, 0.05)
for c in np.arange(19.7, 23.2, 0.55): add(zap(0.3, 2600, 1200, 0.25), c)
# power line strip: corona buzz, wind, zips
fx += hum(23.3, 26.1, 0.03, f=100, buzz=0.6) + wind(23.3, 26.1, 0.04); crackle(23.4, 26.0, 0.06, 24)
for c in np.arange(23.4, 26.0, 0.45): add(zap(0.28, 2200, 900, 0.18), c)
# map: network spreads with tiny ticks
for i in range(46): add(tone(1300 + (i % 6) * 160, 0.03, 0.008), 26.25 + i*0.045 + rng.uniform(0, 0.02), 0.03)
# globe: winding whirr
gn = int(2.2*SR); gt = np.arange(gn)/SR; gf = 180 + 700*(gt/2.2)**1.5
add(np.sin(2*np.pi*np.cumsum(gf)/SR) * (0.5 + 0.5*np.sin(2*np.pi*22*gt)) * np.sin(np.pi*gt/2.2)**2, 29.15, 0.05)
# voltage steps down: descending tones
for i, c in enumerate([31.7, 32.5, 33.3, 34.1]): add(tone(mtof(84 - i*5), 0.22, 0.08), c + 0.02, 0.05)
# kiosk: small hum, x-ray scan, pulses
fx += hum(34.85, 38.15, 0.03, f=100)
add(sweep(1400, 500, 0.6, 0.06), 35.7); add(zap(1.0, 1600, 700, 0.4), 36.1); add(zap(0.9, 1500, 600, 0.4), 37.1)
# room 2: hum + pulse
fx += hum(38.15, 41.35, 0.012, f=50, buzz=0.1); add(zap(0.6, 2000, 900, 0.3), 38.45)
# wire: shimmer, oscillation, energy waves
sh = bp(rng.standard_normal(N), 5000, 11000) * win(41.35, 50.75, 0.4) * (0.6 + 0.4*np.sin(2*np.pi*0.9*t))
fx += sh * 0.03
osc = np.sin(2*np.pi*220*t) * (0.5 + 0.5*np.sin(2*np.pi*1.6*t)) * win(45.1, 48.4, 0.3)
fx += osc * 0.03
for c in [48.5, 49.35, 50.2]: add(zap(0.75, 900, 3200, 0.55), c)
# lights: wind, swishes, lights off, plane drone, lights on
fx += wind(50.75, O + 3.4, 0.05)
for c in np.arange(50.9, O, 1.82): swish(c, 0.18)
add(sweep(900, 300, 0.4, 0.05), 52.3)
pd = np.clip((t - 53.6)/3.0, 0, 1) * np.clip((O + 1.9 - t)/0.6, 0, 1)
prop = lp(rng.standard_normal(N), 900) * (0.6 + 0.4*np.sin(2*np.pi*38*t)) + 0.3*np.sin(2*np.pi*(92 + 6*np.sin(2*np.pi*0.2*t))*t)
fx += prop * pd * 0.09
for i in range(6): add(tone(1900, 0.06, 0.02), 55.75 + i*0.07, 0.02)
fx *= np.clip((O + 2.5 - t) / 0.9, 0, 1)
# outro: swoosh as the plane sweeps, a tick per letter, dot lands: pop + glockenspiel chord
add(WH[0][0], O + 0.45 - WH[0][1], 0.9)
for i in range(8): add(tone(2200, 0.03, 0.008), O + 0.62 + i*0.13, 0.05)
add(thud(0.3, 70), O + 1.9); add(CK[1], O + 1.88, 0.9)
cn = int(2.4*SR); ct = np.arange(cn)/SR
add(sum(np.sin(2*np.pi*mtof(n)*ct) for n in (76, 83, 88)) * np.exp(-ct*1.6) * np.minimum(1, ct/.01), O + 1.93, 0.06)

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
