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
S = 'sfx/'
WH = [(_seg(S+'whoosh.wav', 0.0, 0.85, 0.30), 0.293), (_seg(S+'whoosh.wav', 1.45, 2.4, 0.30), 0.263)]
CK = [_seg(S+'clicks.wav', 0.0, 0.3, 0.22), _seg(S+'clicks.wav', 0.55, 0.9, 0.22), _seg(S+'clicks.wav', 1.12, 1.27, 0.22)]
# camera moves: user's Epidemic swooshes (big moves full level, small moves quieter)
for i, (c, g) in enumerate([(2.75, 1.0), (5.9, 0.6), (13.05, 0.9), (16.9, 0.7), (19.6, 0.5), (26.5, 0.8), (31.75, 0.6), (35.1, 0.5), (38.5, 0.8), (41.75, 0.7), (48.35, 0.8), (50.95, 0.7)]):
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
def zap(d, f0=100, f1=150, g=1.0, crack=1.0, a=0.03, rel=0.18):
    # current running through a cable: band-limited saw buzz on the mains family, slight wobble, sparse spark crackle, soft edges
    n = int(d*SR); tt = np.arange(n)/SR; f = f0*(f1/f0)**(tt/d); ph = np.cumsum(f)/SR
    saw = 2*(ph % 1) - 1
    buzz = lp(saw, 1500, 4) * 0.8 + bp(saw, 1500, 3800) * 0.25
    buzz *= 1 + 0.22*np.sin(2*np.pi*(6.5 + 3*rng.random())*tt + rng.random()*6)
    imp = (rng.random(n) < 90/SR) * rng.uniform(0.25, 1.0, n)
    ker = np.exp(-np.arange(int(0.004*SR))/SR/0.0009)
    spark = bp(np.convolve(imp * rng.choice([-1, 1], n), ker)[:n], 2600, 9000)
    sh = np.minimum(1, tt/a) * np.minimum(1, (d - tt)/rel)
    return (buzz*0.55 + spark*1.6*crack) * np.clip(sh, 0, 1) * g
def zip_(g=1.0, up=True):  # short pulse leaving a station
    return zap(0.42, 90 if up else 170, 190 if up else 95, g, 1.2, 0.012, 0.2)
def arrive(g=1.0):  # pulse reaches its target: small contact click with a spark tail
    n = int(0.12*SR); tt = np.arange(n)/SR
    return (bp(noise(0.12), 1800, 7000) * np.exp(-tt/0.012) + 0.6*np.sin(2*np.pi*140*tt)*np.exp(-tt/0.03)) * g
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
add(sweep(520, 190, 1.0, 0.028), 3.15)
# route tease: soft rising tone while the red line runs back to the wind park
add(zap(2.3, 150, 95, 0.09, 0.6, 0.3, 0.6), 3.0)
# wind park: night wind and slow blade swishes
fx += wind(4.6, 12.9, 0.045)
for c in np.arange(6.2, 12.8, 1.9): swish(c, 0.16)
# nacelle: gearbox and generator
fx += (lp(rng.standard_normal(N), 200) * 0.5 + 0.22*np.sin(2*np.pi*86*t) + 0.08*np.sin(2*np.pi*172*t)) * win(13.2, 16.8, 0.4) * 0.09
fx += np.sin(2*np.pi*np.cumsum(300 + 220*np.clip((t - 14.8)/1.0, 0, 1))/SR) * win(14.8, 16.8, 0.4) * 0.018
for c in np.arange(13.3, 15.0, 1.5): swish(c, 0.14)
# tower: pulse travels down, transformer hum
add(zap(1.7, 175, 105, 0.16), 17.0); add(arrive(0.12), 18.68); add(zap(1.1, 105, 140, 0.13), 19.1); add(arrive(0.12), 20.15); fx += hum(18.5, 19.6, 0.035)
# substation (LED flood lights switch on with a soft clunk)
add(clack(0.45, 200, 1500, 0.03), 19.7); add(thud(0.14, 80), 19.7)
fx += hum(19.6, 23.3, 0.04)
for c in [20.2, 21.21, 22.22, 23.23]: add(zip_(0.17), c)
# power line
fx += wind(23.2, 26.2, 0.03)
for c in [22.9, 23.73, 24.57, 25.4]: add(zip_(0.15), c)
# network spreads
for i in range(40): add(tone(1250 + (i % 6) * 150, 0.03, 0.008), 26.6 + i*0.05 + rng.uniform(0, 0.02), 0.022)
# globe: thread winds around
# globe: rises out of the park (soft swoosh), then one small tick per ring, in step with the counter 1..47
add(WH[0][0], 29.0 - WH[0][1], 0.45)
for k in range(47):
    c = 29.3 + 1.7*(1 - (1 - (k + 0.5)/47) ** (1/3))
    tk = int(0.03*SR); tkt = np.arange(tk)/SR
    add((np.sin(2*np.pi*(1900 + 26*k)*tkt) * np.exp(-tkt/0.006) + 0.5*bp(rng.standard_normal(tk), 3000, 8000)*np.exp(-tkt/0.003)), c, 0.04)
add(sum(np.sin(2*np.pi*mtof(m)*np.arange(int(1.6*SR))/SR) for m in (79, 86)) * np.exp(-np.arange(int(1.6*SR))/SR*2.2), 30.65, 0.02)
# voltage steps down: four descending tones
for i, c in enumerate([31.7, 32.5, 33.3, 34.1]): add(tone(mtof(84 - i*5), 0.24, 0.09), c + 0.02, 0.045)
add(zap(3.0, 120, 150, 0.1, 0.8, 0.2, 0.5), 31.4); add(zap(2.0, 140, 110, 0.07, 0.7, 0.2, 0.5), 33.3); add(arrive(0.1), 34.4)
# kiosk: ground opens (soft sweep), pulses through the cable
fx += hum(35.6, 38.2, 0.022)
for c in [36.3, 37.21]: add(zap(0.9, 130, 175, 0.17, 1.0, 0.02, 0.25), c); add(arrive(0.1), c + 0.88)
# cable close-up: faint shimmer, one electron is marked, then the slow 50 Hz swing, then three fast energy waves
sh = bp(rng.standard_normal(N), 5000, 10000) * win(42.3, 48.3, 0.5) * (0.6 + 0.4*np.sin(2*np.pi*0.9*t))
fx += sh * 0.012
add(tone(mtof(86), 0.35, 0.12), 43.6, 0.035)
fx += (np.sin(2*np.pi*100*t) + 0.3*np.sin(2*np.pi*200*t)) * (0.5 + 0.5*np.sin(2*np.pi*2.3*(t - 45.15) - np.pi/2)) * win(45.15, 48.2, 0.4) * 0.03
for c in [49.15, 49.8, 50.4]:
    add(zap(0.45, 80, 320, 0.2, 1.6, 0.01, 0.12), c); add(arrive(0.13), c + 0.43); add(tone(mtof(91), 0.3, 0.1), c + 0.42, 0.025)
# warning lights: night wind, the lights switch off one by one (53.3 s), come back together (56.15 s); a plane is only heard very faintly, far away
fx += wind(50.9, O + 3.4, 0.04)
for c in np.arange(51.6, O, 1.9): swish(c, 0.13)
for i in range(5): add(tone(1500 - i*70, 0.05, 0.02), 53.3 + i*0.13, 0.03); add(clack(0.12, 900, 3000, 0.008), 53.3 + i*0.13)
pd = np.clip((t - 55.4)/1.6, 0, 1) * np.clip((O + 0.9 - t)/1.2, 0, 1)
prop = lp(rng.standard_normal(N), 500) * (0.6 + 0.4*np.sin(2*np.pi*36*t)) + 0.25*np.sin(2*np.pi*(90 + 5*np.sin(2*np.pi*0.2*t))*t)
fx += prop * pd * 0.02
add(clack(0.3, 700, 2600, 0.012), 56.15); add(sum(tone(f, 0.12, 0.04) for f in (1700, 2100)), 56.15, 0.02)
fx *= np.clip((O + 2.6 - t) / 1.0, 0, 1)
# outro (LED sign): the town powers down, the letters flicker on with a short buzz each, the warning light flies over and clicks in as the dot
add(sweep(560, 170, 0.9, 0.035), O + 0.08)
for i in range(6): add(clack(0.22, 250, 1600, 0.02), O + 0.12 + i*0.13 + rng.uniform(0, 0.03))
def buzz(d, g=1.0):
    n = int(d*SR); tt = np.arange(n)/SR
    s = np.sign(np.sin(2*np.pi*100*tt)) * 0.6 + np.sin(2*np.pi*50*tt)
    return bp(s + 0.4*rng.standard_normal(n), 90, 2600) * np.minimum(1, tt/0.003) * np.minimum(1, (d - tt)/0.006) * g
for i in range(8):
    c = O + 0.85 + i*0.1
    add(tone(2200, 0.03, 0.008), c, 0.045); add(buzz(0.035, 0.05), c); add(buzz(0.035, 0.04), c + 0.1); add(buzz(0.07, 0.022), c + 0.2)
hum_e = np.clip((t - O - 1.0)/0.8, 0, 1) * np.clip((DUR - 0.25 - t)/0.5, 0, 1)
fx += (np.sin(2*np.pi*100*t) + 0.4*np.sin(2*np.pi*200*t) + 0.15*np.sin(2*np.pi*300*t)) * hum_e * 0.012
sn = int(1.0*SR); st = np.arange(sn)/SR
add(bp(noise(1.0), 3000, 9000) * np.sin(np.pi*st/1.0)**2, O + 1.0, 0.045); add(sweep(480, 1250, 0.9, 0.028), O + 1.05)
add(thud(0.28, 70), O + 1.95); add(CK[1], O + 1.93, 0.8); add(buzz(0.22, 0.035), O + 1.95)
cn = int(2.4*SR); ct = np.arange(cn)/SR
add(sum(np.sin(2*np.pi*mtof(n)*ct) for n in (76, 83, 88)) * np.exp(-ct*1.6) * np.minimum(1, ct/.01), O + 1.98, 0.06)

# ---------------- voice + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '../voice/Strom_Sprecher_Tom_v4.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', 'voice.raw'], check=True)
v = np.fromfile('voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.65 * np.clip(ve * 6, 0, 1), 3)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
import os
if os.environ.get('DUMP'): np.save('fx_stem.npy', fx); np.save('voice_stem.npy', voice)
mus = norm(music, 1.0) * 0.16 * duck
sfx = norm(fx, 1.0) * 0.30 * (1 - 0.4 * np.clip(ve * 6, 0, 1))
vo = norm(voice, 1.0) * 0.9
for name, mix in [('mix_music.wav', vo + mus + sfx), ('mix_fx.wav', vo + sfx)]:
    m = mix / max(1.0, np.max(np.abs(mix)) / 0.95) * np.clip((DUR - t) / 0.3, 0, 1)
    wavfile.write(name, SR, np.stack([m, m], 1).astype(np.float32))
print('ok')
