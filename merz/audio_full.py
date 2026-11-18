# Ton für das ganze Merz-Video: python3 audio_full.py  (läuft im Ordner merz/)
# Musik und Effekte aus dem Epidemic-Sound-Connector (lokal in ../rundfunk/sfx/epidemic, nicht im Repo), Liste in SOUNDS.md
import numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; O = 41.6; DUR = O + 2.25; N = int(SR * DUR); VOFF = 0.2; VCUT = 99
SFX = '../rundfunk/sfx/'
rng = np.random.default_rng(5)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)

# music: Epidemic Sound "Radar Focus" (Blue Saga, 100 BPM), from the start of the track
_r, music = wavfile.read(SFX + 'epidemic/music_radar_focus.48k.wav'); music = music.astype(np.float64)[:N]
music = np.pad(music, (0, N - len(music)))
music *= np.clip((DUR - 0.15 - t) / 1.3, 0, 1) * np.clip((t + 0.2) / 0.8, 0, 1)

fx = np.zeros(N)
def add(sig, at, g=1.0):
    i = int(at * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i < N: j = min(N, i + len(sig)); fx[i:j] += g * sig[:j - i]
_c = {}
def sz(name):
    if name not in _c:
        r, x = wavfile.read(SFX + 'epidemic/' + name + '.48k.wav'); x = x.astype(np.float64)
        _c[name] = x / (np.max(np.abs(x)) + 1e-9)
    return _c[name]
def cut(x, a, d, fi=0.003, fo=0.05):
    y = x[int(a*SR):int((a + d)*SR)]; tt = np.arange(len(y))/SR; dd = len(y)/SR
    return y * np.clip(np.minimum(tt/fi, (dd - tt)/fo), 0, 1)
def hit(name, at, g, sync, rate=1.0):
    y = sz(name)
    if rate != 1.0: y = np.interp(np.arange(int(len(y)/rate))*rate, np.arange(len(y)), y)
    add(y, at - sync/rate, g)
def epi(fn, a, b):
    r, x = wavfile.read(SFX + fn); x = x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    if r != SR: x = np.interp(np.arange(int(len(x)*SR/r))*r/SR, np.arange(len(x)), x)
    y = x[int(a*SR):int(b*SR)]; f = np.minimum(1, np.arange(len(y))/(0.003*SR)) * np.minimum(1, (len(y) - np.arange(len(y)))/(0.02*SR))
    return y / (np.max(np.abs(y)) + 1e-9) * f
WH = [(epi('whoosh.wav', 0.0, 0.85)*0.30, 0.293), (epi('whoosh.wav', 1.45, 2.4)*0.30, 0.263)]
CK = [epi('clicks.wav', 0.0, 0.3)*0.22, epi('clicks.wav', 0.55, 0.9)*0.22, epi('clicks.wav', 1.12, 1.27)*0.22]
def whoosh(c, g, i=0): add(WH[i % 2][0], c - WH[i % 2][1], g)

# numbers and the key titles click in (not every title)
for c in [0.14, 5.52, 11.02, 13.42, 19.47, 22.82, 27.47, 33.72, 36.72, 38.37]: add(CK[[0, 1, 2][int(c * 10) % 3]], c, 0.42 if 13 <= c <= 22 else 0.55)
# hook: 90 of the 100 lights on the lawn go out (one soft power-down, no tick per light)
hit('power_down', 0.78, 0.22, 0.063, 1.15)
# camera moves (the user's soft swooshes)
for i, c in enumerate([2.45, 10.9, 13.3, 22.5, 25.9, 31.0, 35.4, 38.3]): whoosh(c, 0.32 if c == 13.3 else 0.42, i)
# the spotlight on the lectern switches on at "Kanzler Merz"
hit('switch', 3.78, 0.42, 0.009)
# LED columns (v5, feedback 18.11.2026: new sound instead of the bright shimmer): each column rises with a soft rising chord;
# the chord is pitched by the value (May 16 %, Sep. 13 %, Oct. 10 %, Nov. 12 %), so the falling numbers also sound lower
for t0, v in [(11.75, 16), (12.15, 13), (12.55, 10), (36.75, 12)]:
    hit('column_chord', t0 + 0.04, 0.16, 0.169, 2 ** ((v - 16) * 0.7 / 12))
# Schuldenbremse: the barrier arm lifts at "lockerte", then coins fly in one by one and stack up on five piles, the last pile settles
# (v4, feedback 17.11.2026 "13-22 s viel zu penetrant": the bright coin rain (all energy above 3 kHz) and the loud truck-arm motor are gone;
#  now only a soft, darkened barrier movement and a few warm coin accents at key moments, the music carries the rest)
add(lp(cut(sz('arm_raise'), 2.75, 1.0, 0.12, 0.35), 2200, 2), 17.65, 0.2)
# (v5, feedback 18.11.2026 "die Münzen sollten ein Geräusch haben, aber ganz leise"): one slow coin-stacking take under the whole stacking
#  (18.55-22.2 s, it gets denser like the piles), very quiet and with the top end softened
add(lp(cut(sz('coins_stack_slow'), 0.0, 3.75, 0.01, 0.4), 7500, 2), 18.53, 0.09)
# 64 lights switch on (one soft switch), the LED chart on the factory draws its line (a little electric hum)
hit('switch', 22.95, 0.25, 0.009)
add(cut(sz('neon_flicker'), 12.0, 1.6, 0.3, 0.5), 27.6, 0.16)
# outro (LED sign): the town powers down, the letters strike like a neon tube, the red lamp of the lectern clicks in as the dot
hit('power_down', O + 0.12, 0.3, 0.063)
hit('switch', O + 0.14, 0.2, 0.009)
hit('neon_on', O + 0.86, 0.4, 1.306)
add(cut(sz('neon_flicker'), 12.0, DUR - O - 0.9, 0.4, 0.5), O + 0.9, 0.45)
add(CK[1], O + 1.93, 1.2); hit('switch', O + 1.95, 0.35, 1.064)
fx *= np.clip((DUR - t) / 0.4, 0, 1)

# voice (take 1, natural tempo, complete) + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/take1.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/merz_voice.raw'], check=True)
v = np.fromfile('/tmp/merz_voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); i0 = int(VOFF*SR); voice[i0:i0 + len(v)] = v[:N - i0]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.65 * np.clip(ve * 6, 0, 1), 3)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
vo = norm(voice, 0.9)
mus = music / (np.sqrt(np.mean(music[int(SR):int(O*SR)]**2)) + 1e-9) * np.sqrt(np.mean(vo[voice != 0]**2)) * 10**(-19/20) * duck
fxn = fx * 0.9 * 10**(-3/20)  # background turned down after feedback (17.11.2026): music 19 dB under the voice, effects -3 dB
for name, mix in [('music', vo + mus + fxn), ('fx', vo + fxn)]:
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.97)
    wavfile.write('full/mix_' + name + '.wav', SR, mix.astype(np.float32))
print('ok', DUR)
