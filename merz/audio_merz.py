# Ton für den Merz-Test (die ersten fünf Sätze plus Logo): python3 audio_merz.py  (läuft im Ordner merz/)
# Musik und Effekte aus dem Epidemic-Sound-Connector (lokal in ../rundfunk/sfx/epidemic, nicht im Repo), Liste in SOUNDS.md
import numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; O = 13.6; DUR = O + 2.25; N = int(SR * DUR); VOFF = 0.2; VCUT = 13.12
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

# hook: the number clicks in, then 90 of the 100 lights on the lawn go out (one soft power-down, no tick per light)
add(CK[0], 0.14, 0.6)
hit('power_down', 0.78, 0.22, 0.063, 1.15)
# camera glides into the plenary hall, the spotlight on the lectern switches on at "Kanzler Merz"
whoosh(2.45, 0.45, 1)
hit('switch', 3.78, 0.42, 0.009)
# titles
add(CK[1], 5.52, 0.5); add(CK[2], 9.22, 0.5)
# out to the LED columns: whoosh, the number clicks in, one soft shimmer as the three columns rise
whoosh(10.9, 0.45, 0)
add(CK[0], 11.02, 0.55)
add(cut(sz('shimmer'), 0.0, 2.4, 0.01, 1.2), 11.2, 0.16)
# outro (LED sign): the town powers down, the letters strike like a neon tube, the red lamp of the lectern clicks in as the dot
hit('power_down', O + 0.12, 0.3, 0.063)
hit('switch', O + 0.14, 0.2, 0.009)
hit('neon_on', O + 0.86, 0.4, 1.306)
add(cut(sz('neon_flicker'), 12.0, DUR - O - 0.9, 0.4, 0.5), O + 0.9, 0.45)
add(CK[1], O + 1.93, 1.2); hit('switch', O + 1.95, 0.35, 1.064)
fx *= np.clip((DUR - t) / 0.4, 0, 1)

# voice (take 1, natural tempo, the test ends after "Im Mai waren es noch sechzehn Prozent.") + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/take1.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/merz_voice.raw'], check=True)
v = np.fromfile('/tmp/merz_voice.raw', dtype=np.float32).astype(np.float64)[:int(VCUT*SR)]
v[-int(0.05*SR):] *= np.linspace(1, 0, int(0.05*SR))
voice = np.zeros(N); i0 = int(VOFF*SR); voice[i0:i0 + len(v)] = v[:N - i0]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.65 * np.clip(ve * 6, 0, 1), 3)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
vo = norm(voice, 0.9)
mus = music / (np.sqrt(np.mean(music[int(SR):int(O*SR)]**2)) + 1e-9) * np.sqrt(np.mean(vo[voice != 0]**2)) * 10**(-15/20) * duck
fxn = fx * 0.9
for name, mix in [('music', vo + mus + fxn), ('fx', vo + fxn)]:
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.97)
    wavfile.write('test/mix_' + name + '.wav', SR, mix.astype(np.float32))
print('ok', DUR)
