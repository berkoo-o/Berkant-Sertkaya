# Ton für die beiden 15-s-Tests zum Rundfunkbeitrag: python3 audio_test.py a|b  (läuft im Ordner rundfunk/)
import sys, numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
V = sys.argv[1]
SR = 48000; O = 25.95 if V == 'a2' else 15.45; DUR = {'a': 17.7, 'b': 18.0, 'a2': 25.95 + 2.25}[V]; N = int(SR * DUR); VOFF = 0.2
VOICE = 'voice25/voice.mp3' if V == 'a2' else 'voice/voice.mp3'
rng = np.random.default_rng(5)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def win(a, b, f=0.25): return np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
def noise(d): return rng.standard_normal(int(d * SR))

# ---------------- music: Epidemic Sound "Radar Focus" (Blue Saga, 100 BPM, soft dark pulse, schraffuren style), from the start of the track
_r, music = wavfile.read('sfx/epidemic/music_radar_focus.48k.wav'); music = music.astype(np.float64)[:N]
music = np.pad(music, (0, N - len(music)))
music *= np.clip((DUR - 0.15 - t) / 1.3, 0, 1) * np.clip((t + 0.2) / 0.8, 0, 1)

# ---------------- SFX: real recordings (Soundza, local only) + the user's Epidemic whooshes and clicks
fx = np.zeros(N)
def add(sig, at, g=1.0):
    i = int(at * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i < N: j = min(N, i + len(sig)); fx[i:j] += g * sig[:j - i]
_c = {}
def sz(name):  # Epidemic Sound effects (sfx/epidemic, local only), 48 kHz mono
    if name not in _c:
        r, x = wavfile.read('sfx/epidemic/' + name + '.48k.wav'); x = x.astype(np.float64)
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
TICK = cut(sz('coin_single'), 0.015, 0.09, 0.001, 0.05)  # the first ring of a single coin landing
def tick(at, g, rate=1.0):
    y = TICK if rate == 1.0 else np.interp(np.arange(int(len(TICK)/rate))*rate, np.arange(len(TICK)), TICK)
    add(y, at - 0.008/rate, g)
if V in ('a', 'b'):
    for i, c in enumerate([5.7, 7.75, 9.55, 10.9]): add(CK[[0, 1, 2, 1][i]], c, 0.55)

if V == 'a2':
    # 26-s version: coins lift out of the houses with one bright shimmer, the camera rises, the numbers click in
    add(cut(sz('shimmer'), 0.0, 4.2, 0.01, 1.8), 0.5, 0.2)
    for i, c in enumerate([7.3, 12.0, 13.9, 15.45, 16.7, 21.05]): add(CK[i % 3], c, 0.55)
    whoosh(5.6, 0.8, 0); whoosh(11.2, 0.55, 1); whoosh(14.6, 0.35, 0); whoosh(18.8, 0.65, 1)
    # the money arrives: one cascade per broadcaster, smaller each time; the ARD building switches its LEDs on
    hit('coins_handful', 12.95, 0.5, 0.40); hit('switch', 13.15, 0.22, 0.009)
    hit('coins_drop', 14.85, 0.35, 0.074, 1.05)
    hit('coin_single', 16.4, 0.30, 0.023)
    hit('coin_single', 17.65, 0.22, 0.023, 1.12)
    # 2027: a second, smaller stream of coins
    hit('coins_stack', 20.6, 0.32, 0.122, 0.95)
    # outro (LED sign): the town powers down, the letters strike like a neon tube, the tower light clicks in as the dot
    hit('power_down', O + 0.12, 0.3, 0.063)
    hit('switch', O + 0.14, 0.2, 0.009)
    hit('neon_on', O + 0.86, 0.4, 1.306)
    add(cut(sz('neon_flicker'), 12.0, DUR - O - 0.9, 0.4, 0.5), O + 0.9, 0.45)
    add(CK[1], O + 1.93, 1.2); hit('switch', O + 1.95, 0.35, 1.064)
elif V == 'a':
    # hook: the coins lift out of the houses with one bright shimmer (fades out under the voice)
    add(cut(sz('shimmer'), 0.0, 4.2, 0.01, 1.8), 0.5, 0.22)
    whoosh(4.4, 0.8, 0)                       # camera rises to the whole town
    # the money arrives: one coin cascade per broadcaster, smaller each time
    hit('coins_handful', 6.55, 0.5, 0.40); hit('switch', 6.8, 0.22, 0.009)
    whoosh(7.6, 0.45, 1)
    hit('coins_drop', 8.65, 0.35, 0.074, 1.05)
    hit('coin_single', 10.55, 0.30, 0.023)
    hit('coin_single', 11.7, 0.22, 0.023, 1.12)
    whoosh(13.4, 0.7, 0)                      # back out for "Zu viel oder fair?"
    # outro (LED sign): the town powers down, the letters strike like a neon tube, the tower light clicks in as the dot
    hit('power_down', O + 0.12, 0.3, 0.063)
    hit('switch', O + 0.14, 0.2, 0.009)
    hit('neon_on', O + 0.86, 0.4, 1.306)
    add(cut(sz('neon_flicker'), 12.0, DUR - O - 0.9, 0.4, 0.5), O + 0.9, 0.45)
    add(CK[1], O + 1.93, 1.2); hit('switch', O + 1.95, 0.35, 1.064)
else:
    # hook: the 20 coins drop onto the stack one after another (only the first ring of each, quiet, one gesture), the last one a bit louder
    for i in range(20):
        at = 0.25 + i*0.13 + 0.30
        tick(at, (0.32 if i in (0, 19) else 0.14) * (0.85 + 0.3*rng.random()), 0.92 + 0.16*rng.random())
    whoosh(4.3, 0.8, 0)                       # camera pulls back over the four trays
    # coins hop over: one real cascade for the ARD pile, a smaller one for ZDF, single coins for DLR and LMA
    hit('coins_stack', 6.45, 0.45, 0.122); hit('coins_handful', 7.7, 0.35, 0.40, 1.05)
    hit('coins_drop', 8.6, 0.32, 0.074, 1.1)
    hit('coin_single', 10.45, 0.30, 0.023)
    hit('coin_single', 11.6, 0.22, 0.023, 1.12)
    whoosh(12.2, 0.55, 1)
    # outro: the coin spins on its edge, rattles down flat, turns red and flies up as the dot of "function."
    whoosh(O + 0.5, 0.5, 0)
    add(cut(sz('coin_spin'), 1.45, 1.5, 0.15, 0.08), O - 0.1, 0.9)
    add(cut(sz('shimmer'), 0.0, 2.2, 0.02, 1.2), O + 1.55, 0.14)
    add(CK[1], O + 2.18, 1.2); tick(O + 2.2, 0.45, 0.9)
fx *= np.clip((DUR - t) / 0.4, 0, 1)

# ---------------- voice + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', VOICE, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/rf_voice.raw'], check=True)
v = np.fromfile('/tmp/rf_voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); i0 = int(VOFF*SR); voice[i0:i0 + len(v)] = v[:N - i0]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.65 * np.clip(ve * 6, 0, 1), 3)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
import os
if os.environ.get("DUMP"): np.save(V + "/fx.npy", fx)
mus = music / (np.sqrt(np.mean(music[int(SR):int(O*SR)]**2)) + 1e-9) * np.sqrt(np.mean(norm(voice, 0.9)[voice != 0]**2)) * 10**(-15/20) * duck
sfx = norm(fx, 1.0) * 0.30 * (1 - 0.4 * np.clip(ve * 6, 0, 1))
sfx *= 1 + 1.0 * np.clip((t - O + 0.2) / 0.5, 0, 1)  # the logo sting carries the end on its own, so it may be louder than the effects under the voice
vo = norm(voice, 1.0) * 0.9
for name, mix in [('mix_music.wav', vo + mus + sfx), ('mix_fx.wav', vo + sfx)]:
    m = mix / max(1.0, np.max(np.abs(mix)) / 0.95) * np.clip((DUR - t) / 0.3, 0, 1)
    wavfile.write(V + '/' + name, SR, np.stack([m, m], 1).astype(np.float32))
print('ok', V)
