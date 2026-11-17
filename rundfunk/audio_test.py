# Ton für die beiden 15-s-Tests zum Rundfunkbeitrag: python3 audio_test.py a|b  (läuft im Ordner rundfunk/)
import sys, numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
V = sys.argv[1]
SR = 48000; O = 15.45; DUR = 17.7 if V == 'a' else 18.0; N = int(SR * DUR); VOFF = 0.2
rng = np.random.default_rng(5)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def win(a, b, f=0.25): return np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
def noise(d): return rng.standard_normal(int(d * SR))

# ---------------- music: schraffuren style (track_D): soft sub pulse 100 BPM, airy pad, almost no melody
music = np.zeros(N)
def addm(sig, at, g=1.0):
    i = int(at * SR)
    if 0 <= i < N: j = min(N, i + len(sig)); music[i:j] += g * sig[:j - i]
beat = 0.6; bar = 2.4
chords = [[50, 57, 64, 69], [47, 54, 62, 66], [43, 50, 57, 64], [45, 52, 59, 64]]
pos = 0.0; k = 0
while pos < DUR:
    ch = chords[k % 4]; n = int(bar*SR*2.2); tt = np.arange(n)/SR
    pad = sum(sum(np.sin(2*np.pi*mtof(x)*d*tt + 0.15*np.sin(2*np.pi*0.3*tt)) for d in (1, 1.002, 0.998)) for x in ch[1:])
    e = np.minimum(1, tt/1.2) * np.clip((bar*2.2 - tt)/1.0, 0, 1)
    if k % 2 == 0: addm((lp(pad, 1400) + bp(rng.standard_normal(n), 2500, 6000)*0.05) * e, pos, 0.018)
    for b in range(4):
        kn = int(.45*SR); kt = np.arange(kn)/SR
        addm(lp(np.sin(2*np.pi*(44 + 38*np.exp(-kt*22))*kt) * np.exp(-kt*6.5) * np.minimum(1, kt/0.004), 160), pos + b*beat, 0.34)
        bn = int(beat*SR*0.9); bt = np.arange(bn)/SR
        addm(lp(np.sin(2*np.pi*mtof(ch[0]-12)*bt), 120) * np.sin(np.pi*np.clip(bt/(beat*0.9), 0, 1))**1.5, pos + b*beat + 0.02, 0.10)
        tk = int(.02*SR); addm(bp(rng.standard_normal(tk), 3000, 8000) * np.exp(-np.arange(tk)/SR*300), pos + b*beat + beat/2, 0.012)
    pos += bar; k += 1
music *= np.clip((O + 1.6 - t) / 1.4, 0, 1) * np.clip((t - 0.3) / 1.2, 0, 1)

# ---------------- SFX: real recordings (Soundza, local only) + the user's Epidemic whooshes and clicks
fx = np.zeros(N)
def add(sig, at, g=1.0):
    i = int(at * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i < N: j = min(N, i + len(sig)); fx[i:j] += g * sig[:j - i]
_c = {}
def sz(name):
    if name not in _c:
        r, x = wavfile.read('sfx/soundza/' + name + '.48k.wav'); x = x.astype(np.float64)
        if x.ndim > 1: x = x.mean(1)
        _c[name] = x / (np.max(np.abs(x)) + 1e-9)
    return _c[name]
def cut(x, a, d, fi=0.003, fo=0.05, rate=1.0):
    y = x[int(a*SR):int((a + d*rate)*SR)]
    if rate != 1.0: y = np.interp(np.arange(int(len(y)/rate))*rate, np.arange(len(y)), y)
    tt = np.arange(len(y))/SR; dd = len(y)/SR
    return y * np.clip(np.minimum(tt/fi, (dd - tt)/fo), 0, 1)
def hit(name, at, g, sync, rate=1.0):  # one-shot placed so that its impact lands on 'at'
    y = sz(name)
    if rate != 1.0: y = np.interp(np.arange(int(len(y)/rate))*rate, np.arange(len(y)), y)
    add(y, at - sync/rate, g)
def epi(fn, a, b):
    r, x = wavfile.read('sfx/' + fn); x = x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    if r != SR: x = np.interp(np.arange(int(len(x)*SR/r))*r/SR, np.arange(len(x)), x)
    y = x[int(a*SR):int(b*SR)]; f = np.minimum(1, np.arange(len(y))/(0.003*SR)) * np.minimum(1, (len(y) - np.arange(len(y)))/(0.02*SR))
    return y / (np.max(np.abs(y)) + 1e-9) * f
WH = [(epi('whoosh.wav', 0.0, 0.85)*0.30, 0.293), (epi('whoosh.wav', 1.45, 2.4)*0.30, 0.263)]
CK = [epi('clicks.wav', 0.0, 0.3)*0.22, epi('clicks.wav', 0.55, 0.9)*0.22, epi('clicks.wav', 1.12, 1.27)*0.22]
def whoosh(c, g, i=0): add(WH[i % 2][0], c - WH[i % 2][1], g)
TICK = cut(sz('coin_desk'), 0.262, 0.07, 0.001, 0.04)  # just the first ring of a single coin hitting the desk
def tick(at, g, rate=1.0):
    y = TICK if rate == 1.0 else np.interp(np.arange(int(len(TICK)/rate))*rate, np.arange(len(TICK)), TICK)
    add(y, at, g)
def thud(g=1.0, f=70):
    n = int(.35*SR); tt = np.arange(n)/SR; return (np.sin(2*np.pi*f*tt) + 0.5*lp(noise(.35), 800)) * np.exp(-tt/0.06) * np.minimum(1, tt/0.002) * g
def chord(at, g, notes=(76, 83, 88)):
    cn = int(2.4*SR); ct = np.arange(cn)/SR
    add(sum(np.sin(2*np.pi*mtof(n)*ct) for n in notes) * np.exp(-ct*1.6) * np.minimum(1, ct/.01), at, g)
def shimmer_bed(a, b, g):  # airy high glitter while the coins are in the air
    global fx
    fx += bp(rng.standard_normal(N), 4500, 10000) * win(a, b, 0.6) * (0.7 + 0.3*np.sin(2*np.pi*0.7*t)) * g
for c in [5.7, 7.75, 9.55, 10.9]: add(CK[[0, 1, 2, 1][[5.7, 7.75, 9.55, 10.9].index(c)]], c, 0.55)

if V == 'a':
    # hook: the coins lift out of the houses with one bright shimmer, then a soft glitter while they swirl above the town
    hit('coin_shimmer', 0.55, 0.30, 0.007)
    shimmer_bed(0.6, 11.9, 0.004)
    whoosh(4.4, 0.8, 0)                       # camera rises to the whole town
    # the money arrives: one coin cascade per broadcaster, smaller each time
    hit('coins_pile', 6.55, 0.55, 0.222); hit('switch_on', 6.75, 0.25, 0.037)
    whoosh(7.6, 0.45, 1)
    hit('coins_pile', 8.65, 0.35, 0.222, 1.1)
    hit('coin_desk', 10.55, 0.30, 0.272, 1.05)
    hit('coin_desk', 11.7, 0.22, 0.272, 1.15)
    whoosh(13.4, 0.7, 0)                      # back out for "Zu viel oder fair?"
    # outro (LED sign, as in Strom): town powers down, the letters strike like a neon tube, the tower light clicks in as the dot
    hit('power_down', O + 0.1, 0.22, 0.205)
    hit('switch_off', O + 0.12, 0.2, 0.007); hit('switch_off', O + 0.5, 0.13, 0.007, 1.1)
    fl = sz('fluorescent_flicker')
    add(cut(fl, 0.06, 0.16, 0.002, 0.06), O + 0.83, 0.3)
    add(cut(fl, 10.4, 0.12, 0.002, 0.05), O + 1.57, 0.14)
    add(cut(fl, 4.0, DUR - O - 1.2, 0.6, 0.6) / 4, O + 1.0, 0.12)
    sn = int(1.0*SR); st = np.arange(sn)/SR
    add(bp(noise(1.0), 3000, 9000) * np.sin(np.pi*st/1.0)**2, O + 1.05, 0.03)
    add(thud(0.28), O + 1.95); add(CK[1], O + 1.93, 0.8); chord(O + 1.98, 0.06)
else:
    # hook: the 20 coins drop onto the stack one after another (only the first ring of each, quiet, one gesture), the last one a bit louder
    for i in range(20):
        at = 0.25 + i*0.13 + 0.30
        tick(at, (0.30 if i in (0, 19) else 0.13) * (0.85 + 0.3*rng.random()), 0.92 + 0.16*rng.random())
    whoosh(4.3, 0.8, 0)                       # camera pulls back over the four trays
    # coins hop over: one real cascade for the ARD pile, a smaller one for ZDF, single coins for DLR and LMA
    shimmer_bed(5.7, 9.3, 0.0035)
    hit('coins_pile', 6.45, 0.5, 0.222, 0.95); hit('coins_pile', 7.55, 0.35, 0.222, 1.05)
    hit('coins_pile', 8.6, 0.32, 0.222, 1.15)
    hit('coin_desk', 10.45, 0.30, 0.272, 1.05)
    hit('coin_desk', 11.6, 0.22, 0.272, 1.15)
    whoosh(12.2, 0.55, 1)
    # outro: the coin spins on its edge, rattles down flat, turns red and flies up as the dot of "function."
    whoosh(O + 0.5, 0.5, 0)
    add(cut(sz('coin_spin'), 0.15, 1.17, 0.08, 0.15, 0.8), O - 0.05, 0.45)
    hit('coin_shimmer', O + 1.55, 0.14, 0.007, 1.1)
    add(thud(0.26), O + 2.2); add(CK[1], O + 2.18, 0.8); chord(O + 2.23, 0.06)
fx *= np.clip((DUR - t) / 0.4, 0, 1)

# ---------------- voice + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/rf_voice.raw'], check=True)
v = np.fromfile('/tmp/rf_voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); i0 = int(VOFF*SR); voice[i0:i0 + len(v)] = v[:N - i0]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.65 * np.clip(ve * 6, 0, 1), 3)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
mus = norm(music, 1.0) * 0.16 * duck
sfx = norm(fx, 1.0) * 0.30 * (1 - 0.4 * np.clip(ve * 6, 0, 1))
vo = norm(voice, 1.0) * 0.9
for name, mix in [('mix_music.wav', vo + mus + sfx), ('mix_fx.wav', vo + sfx)]:
    m = mix / max(1.0, np.max(np.abs(mix)) / 0.95) * np.clip((DUR - t) / 0.3, 0, 1)
    wavfile.write(V + '/' + name, SR, np.stack([m, m], 1).astype(np.float32))
print('ok', V)
