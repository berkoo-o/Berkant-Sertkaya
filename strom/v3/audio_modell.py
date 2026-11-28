import numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 61.0; O = 57.6; N = int(SR * DUR)
rng = np.random.default_rng(11)
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
music *= np.clip((O + 3.0 - t) / 1.8, 0, 1) * np.clip((t - 1.2) / 1.4, 0, 1)

# ---------------- SFX (calmer and cleaner than the first version)
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
# camera moves: user's Epidemic swooshes (big moves full level, small moves quieter)
for i, (c, g) in enumerate([(2.75, 1.0), (5.9, 0.6), (13.05, 0.9), (16.9, 0.7), (19.6, 0.5), (26.5, 0.8), (31.9, 0.6), (35.1, 0.5), (38.5, 0.8), (41.6, 0.8), (50.95, 0.7)]):
    add(WH[i % 2][0], c - WH[i % 2][1], g)
# numbers appear: user's Epidemic clicks
for i, c in enumerate([7.0, 10.6, 19.9, 26.5, 29.25, 31.7, 32.5, 33.3, 34.1, 38.6, 45.3, 52.4]): add(CK[i % 3], c, 0.8)
def sweep(f0, f1, d, g):
    n = int(d*SR); tt = np.arange(n)/SR; f = f0 * (f1/f0) ** (tt/d)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*tt/d) * g
def clack(g=1.0, lo=400, hi=2600, d=0.018):
    n = int(.08*SR); return bp(noise(.08), lo, hi) * env(n, 0.001, d) * g
def thud(g=1.0, f=90):
    n = int(.35*SR); tt = np.arange(n)/SR; return (np.sin(2*np.pi*f*tt) + 0.5*lp(noise(.35), 800)) * env(n, 0.002, 0.06) * g
def blip(d=0.3, f0=1500, f1=700, g=1.0):  # soft glassy blip for the red pulse (no harsh buzz)
    n = int(d*SR); tt = np.arange(n)/SR; f = f0*(f1/f0)**(tt/d)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*tt/d)**2 * g
def hum(a, b, g, f=100, fade=0.4):
    s = np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2*f*t) + 0.12*np.sin(2*np.pi*3*f*t)
    return s * win(a, b, fade) * g
def wind(a, b, g):
    w = lp(rng.standard_normal(N), 420) * (0.7 + 0.3*np.sin(2*np.pi*0.13*t + 1.0))
    return w * win(a, b, 0.6) * g
def swish(at, g=1.0):
    n = int(1.1*SR); tt = np.arange(n)/SR
    add(bp(noise(1.1), 120, 600) * np.sin(np.pi*np.clip(tt/1.1, 0, 1))**3, at, g)

# hook: plug slides in and clicks home, lamp switch
add(bp(noise(.6), 900, 3600) * np.sin(np.pi*np.linspace(0, 1, int(.6*SR)))**2, 0.25, 0.045)
add(clack(0.9, 300, 2200, 0.02), 0.84); add(thud(0.32, 110), 0.84)
add(clack(0.4, 1500, 6000, 0.008), 1.42); add(tone(mtof(88), 0.5, 0.18), 1.44, 0.03)
# route tease: soft rising tone while the red line runs back to the wind park
add(sweep(220, 520, 2.3, 0.035), 3.1)
# wind park: night wind and slow blade swishes
fx += wind(4.6, 12.9, 0.045)
for c in np.arange(6.2, 12.8, 1.9): swish(c, 0.16)
# nacelle: gearbox and generator
fx += (lp(rng.standard_normal(N), 200) * 0.5 + 0.22*np.sin(2*np.pi*86*t) + 0.08*np.sin(2*np.pi*172*t)) * win(13.2, 16.8, 0.4) * 0.09
fx += np.sin(2*np.pi*np.cumsum(300 + 220*np.clip((t - 14.8)/1.0, 0, 1))/SR) * win(14.8, 16.8, 0.4) * 0.018
for c in np.arange(13.3, 15.0, 1.5): swish(c, 0.14)
# tower: pulse travels down, transformer hum
add(blip(1.7, 1300, 380, 0.5), 17.0); fx += hum(18.5, 19.6, 0.035)
# substation
fx += hum(19.6, 23.3, 0.04)
for c in np.arange(19.9, 23.2, 0.93): add(blip(0.35, 1500, 900, 0.22), c)
# power line
fx += wind(23.2, 26.2, 0.03)
for c in np.arange(23.4, 26.0, 0.55): add(blip(0.3, 1700, 1100, 0.16), c)
# network spreads
for i in range(40): add(tone(1250 + (i % 6) * 150, 0.03, 0.008), 26.6 + i*0.05 + rng.uniform(0, 0.02), 0.022)
# globe: thread winds around
gn = int(1.8*SR); gt = np.arange(gn)/SR; gf = 200 + 620*(gt/1.8)**1.5
add(np.sin(2*np.pi*np.cumsum(gf)/SR) * (0.5 + 0.5*np.sin(2*np.pi*20*gt)) * np.sin(np.pi*gt/1.8)**2, 29.3, 0.035)
# voltage steps down: four descending tones
for i, c in enumerate([31.7, 32.5, 33.3, 34.1]): add(tone(mtof(84 - i*5), 0.24, 0.09), c + 0.02, 0.045)
for c in [32.5, 33.6]: add(blip(0.8, 1200, 600, 0.22), c)
# kiosk: ground opens (soft sweep), pulses through the cable
fx += hum(35.6, 38.2, 0.022)
add(blip(1.4, 1300, 620, 0.4), 36.3); add(blip(1.4, 1250, 600, 0.35), 37.05)
# copper: gentle shimmer, oscillation, energy waves
sh = bp(rng.standard_normal(N), 5000, 10000) * win(41.9, 50.8, 0.5) * (0.6 + 0.4*np.sin(2*np.pi*0.9*t))
fx += sh * 0.018
fx += np.sin(2*np.pi*200*t) * (0.5 + 0.5*np.sin(2*np.pi*5*t)) * win(45.1, 48.4, 0.3) * 0.022
for c in [48.55, 49.3, 50.05]: add(blip(0.6, 700, 2400, 0.5), c)
# lights: wind, lights off, distant plane, lights on
fx += wind(50.9, O + 3.4, 0.04)
for c in np.arange(51.6, O, 1.9): swish(c, 0.13)
for i in range(6): add(tone(1500 - i*60, 0.05, 0.02), 52.3 + i*0.09, 0.03)
pd = np.clip((t - 53.8)/2.6, 0, 1) * np.clip((O + 1.6 - t)/1.2, 0, 1)
prop = lp(rng.standard_normal(N), 600) * (0.6 + 0.4*np.sin(2*np.pi*36*t)) + 0.25*np.sin(2*np.pi*(90 + 5*np.sin(2*np.pi*0.2*t))*t)
fx += prop * pd * 0.05
for i in range(6): add(tone(1700 + i*70, 0.06, 0.02), 55.75 + i*0.07, 0.03)
fx *= np.clip((O + 2.6 - t) / 1.0, 0, 1)
# outro: lights lift off (soft shimmer), a tick per letter, dot lands: soft pop + bell chord
sn = int(1.2*SR); st = np.arange(sn)/SR
add(bp(noise(1.2), 3000, 9000) * np.sin(np.pi*st/1.2)**2, O + 0.2, 0.05); add(sweep(500, 1300, 1.0, 0.03), O + 0.25)
for i in range(8): add(tone(2200, 0.03, 0.008), O + 1.0 + i*0.055, 0.045)
add(thud(0.28, 70), O + 1.41); add(CK[1], O + 1.39, 0.8)
cn = int(2.4*SR); ct = np.arange(cn)/SR
add(sum(np.sin(2*np.pi*mtof(n)*ct) for n in (76, 83, 88)) * np.exp(-ct*1.6) * np.minimum(1, ct/.01), O + 1.44, 0.06)

# ---------------- voice + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', 'voice.raw'], check=True)
v = np.fromfile('voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.65 * np.clip(ve * 6, 0, 1), 3)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
mus = norm(music, 1.0) * 0.16 * duck
sfx = norm(fx, 1.0) * 0.30 * (1 - 0.4 * np.clip(ve * 6, 0, 1))
vo = norm(voice, 1.0) * 0.9
for name, mix in [('mix_music.wav', vo + mus + sfx), ('mix_fx.wav', vo + sfx)]:
    m = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
    wavfile.write(name, SR, np.stack([m, m], 1).astype(np.float32))
print('ok')
