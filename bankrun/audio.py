# Ton für „Was wäre, wenn alle gleichzeitig ihr Geld abheben?“: python3 audio.py  (läuft im Ordner bankrun/)
# Musik „Radar Focus“ und Effekte aus dem Epidemic-Sound-Connector (lokal in sfx/epidemic, nicht im Repo), dazu einige
# Soundza-Aufnahmen aus dem 2027-Video. Liste in SOUNDS.md. Alle Zeiten sind Stimm-Zeiten; im Video beginnt die Stimme bei 0,15 s.
# Ergebnis: mix_music.flac und mix_fx.flac, verlustfrei (render-pc.mjs hängt sie als AAC 320 kbit/s an die Videos).
import numpy as np, subprocess, sys
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; VO = 0.15; OUT = 85.62; END_V = 89.0; END = END_V + VO; N = int(SR * END)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def load(path):
    r, x = wavfile.read(path); x = x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    if r != SR: x = np.interp(np.arange(int(len(x) * SR / r)) * r / SR, np.arange(len(x)), x)
    return x / (np.max(np.abs(x)) + 1e-9)
_c = {}
def ep(name):
    if name not in _c: _c[name] = load('sfx/epidemic/' + name + '.48k.wav')
    return _c[name]
def sz(name):
    if name not in _c: _c[name] = load('../jahr2027/sfx/soundza/' + name + '.48k.wav')
    return _c[name]
def cut(x, a, d, fi=0.004, fo=0.06):
    y = x[int(a * SR):int((a + d) * SR)]; tt = np.arange(len(y)) / SR; dd = len(y) / SR
    return y * np.clip(np.minimum(tt / fi, (dd - tt) / fo), 0, 1)
def rate(y, r): return np.interp(np.arange(int(len(y) / r)) * r, np.arange(len(y)), y) if r != 1 else y
fx = np.zeros(N); amb = np.zeros(N)
def add(sig, at, g=1.0, buf=None):
    b = fx if buf is None else buf; i = int((at + VO) * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i < N: j = min(N, i + len(sig)); b[i:j] += g * sig[:j - i]
# the user's own transition sounds (soft swooshes and UI clicks)
def user(fn, a, b): x = load('../rundfunk/sfx/' + fn); return cut(x, a, b - a, 0.003, 0.02)
WH = [(user('whoosh.wav', 0.0, 0.85), 0.293), (user('whoosh.wav', 1.45, 2.4), 0.263)]
CK = [user('clicks.wav', 0.0, 0.3), user('clicks.wav', 0.55, 0.9), user('clicks.wav', 1.12, 1.27)]
def whoosh(c, g, i=0): add(WH[i % 2][0], c - WH[i % 2][1], 0.75 * g)
def click(at, g=0.11, i=0): add(CK[i % 3], at, g)

# ---------------------------------------------------------------- city bed: distant traffic and murmur, quieter in the evening
bed = lp(hp(ep('ambience_city')[:N], 120), 6000)
bed *= np.clip(t / 0.8, 0, 1) * (1 - 0.45 * np.clip((t - 63.5) / 6, 0, 1)) * np.clip((END - 0.3 - t) / 1.2, 0, 1)
amb += 0.16 * bed
# ---------------------------------------------------------------- hook: the queue, somebody takes money out
add(cut(ep('atm'), 11.1, 0.55), 2.15, 0.16)                                      # machine beeps as the first one finishes
add(cut(ep('atm'), 13.35, 0.5), 3.75, 0.13)
click(3.2, 0.12, 0)                                                               # "unter 1 €"
# ---------------------------------------------------------------- the tower of account money rises
whoosh(10.95, 0.32, 0)
add(lp(cut(ep('money_handling'), 0.3, 1.6, 0.05, 0.5), 7000), 10.8, 0.22)
click(10.85, 0.13, 1)
# ---------------------------------------------------------------- the bank turns to glass, the vault with very little cash
add(cut(sz('shimmer'), 0.0, 1.3, 0.003, 0.5), 13.0, 0.09)
add(cut(ep('safe_open'), 0.4, 1.2, 0.01, 0.3), 13.55 - 0.18, 0.26)
click(16.25, 0.12, 2)
# ---------------------------------------------------------------- the rest is lent out: bundles fly to houses, cars and the factory
whoosh(19.0, 0.28, 1)
for k, at in enumerate((19.05, 19.75, 20.45, 21.15)):
    add(rate(cut(ep('money_count'), 0.25, 1.3, 0.01, 0.3), (1.0, 1.06, 0.95, 1.1)[k]), at, 0.2 - 0.02 * k)
# ---------------------------------------------------------------- cash machines run empty
add(cut(ep('atm'), 11.1, 0.55), 22.3, 0.14); add(cut(ep('atm'), 13.35, 0.5), 23.4, 0.12)
for at, g, r in ((24.9, 0.32, 1.0), (25.2, 0.24, 0.94), (25.5, 0.2, 0.89)):     # error beeps, the red machine first
    add(rate(ep('error_beep'), r), at, g)
click(31.65, 0.12, 0)                                                            # 42 Mrd. $
add(cut(ep('shutter'), 0.2, 1.4, 0.01, 0.25), 35.75 - 0.13, 0.4)                 # shutter comes down
# ---------------------------------------------------------------- the state steps in
whoosh(38.25, 0.18, 1)
add(cut(ep('latch'), 0.95, 0.7, 0.004, 0.25), 39.36 - 0.17, 0.38)                 # barrier lands
add(cut(ep('atm'), 11.1, 0.4), 43.3, 0.12); click(43.4, 0.12, 2)                  # max. 60 €
add(cut(ep('cloth_flap'), 2.3, 0.9, 0.02, 0.3), 49.72, 0.3)                       # banner unrolls (1931)
add(cut(ep('cloth_flap'), 6.1, 0.7, 0.02, 0.3), 52.25, 0.18)                      # and rolls up again
# ---------------------------------------------------------------- printing money: the stack grows in four steps
whoosh(52.75, 0.32, 0)
for k, (at, a) in enumerate(((54.6, 0.3), (55.45, 1.7), (56.4, 3.85), (57.7, 4.6))):
    add(lp(cut(ep('money_handling'), a, 0.75, 0.01, 0.25), 6500), at, 0.26)
click(57.55, 0.13, 1); click(59.98, 0.08, 2)
whoosh(63.05, 0.16, 1)
# ---------------------------------------------------------------- deposits are protected: barrier and shutter open, the glass cover comes down
add(cut(ep('latch'), 1.95, 0.6, 0.004, 0.25), 63.32, 0.24)
add(rate(cut(ep('shutter'), 0.2, 1.3, 0.01, 0.25), 1.08), 63.55, 0.26)
whoosh(64.35, 0.22, 0)
add(ep('glass_down'), 65.18, 0.42)
add(cut(sz('shimmer'), 0.0, 1.5, 0.003, 0.6), 65.25, 0.1)
click(65.55, 0.12, 0)
whoosh(71.85, 0.2, 1)                                                              # the cover lifts away
# ---------------------------------------------------------------- panic: more people come, the lights flicker and go out
add(lp(cut(ep('footsteps'), 0.4, 3.6, 0.3, 0.8), 5000), 72.95, 0.22)
add(cut(ep('neon_flicker'), 3.4, 0.9, 0.01, 0.15), 74.72, 0.3)
add(cut(ep('shutter'), 0.2, 1.4, 0.01, 0.25), 75.55 - 0.13, 0.36)
# ---------------------------------------------------------------- "Ihre Einlagen sind sicher": lights on, shutter up, everybody goes home
click(81.8, 0.1, 1)
add(rate(cut(ep('shutter'), 0.2, 1.3, 0.01, 0.25), 1.08), 81.85, 0.24)
add(lp(cut(ep('footsteps'), 8.0, 4.2, 0.5, 1.4), 5000), 82.0, 0.24)
whoosh(83.45, 0.26, 0)
# ---------------------------------------------------------------- outro: the empty machine prints the logo
whoosh(85.75, 0.3, 1)
add(cut(ep('receipt'), 0.55, 1.5, 0.02, 0.3), 86.45, 0.42)                         # receipt printer
add(rate(cut(sz('glock'), 0.0, 1.8, 0.002, 0.7), 2 ** (-3 / 12)), 87.72, 0.1)      # soft chime when the red dot appears
click(87.72, 0.14, 1)
fx *= np.clip((END - t) / 0.25, 0, 1)

# ---------------------------------------------------------------- voice (take 2, natural tempo) + gentle ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/bankrun_voice.raw'], check=True)
v = np.fromfile('/tmp/bankrun_voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); i0 = int(VO * SR); voice[i0:i0 + len(v)] = v[:N - i0]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.42 * np.clip(ve * 6, 0, 1), 3)          # about -5 dB under speech (CLAUDE.md: Musik)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
vo = norm(voice, 0.9)
# music "Radar Focus": sub-bass lowered by about 8 dB, level set above 250 Hz, 22 dB under the voice while Tom speaks
music = load('../rundfunk/sfx/epidemic/music_radar_focus.48k.wav')[:N]; music = np.pad(music, (0, N - len(music)))
music *= np.clip((END - 0.25 - t) / 1.8, 0, 1) * np.clip((t + 0.2) / 0.6, 0, 1)
MUSIC_DB = -22
music_sh = music - 0.6 * lp(music, 120, 2)
_hp = butter(4, 250, 'high', fs=SR, output='sos'); _ref = slice(int(SR), int(OUT * SR))
_m_hi = np.sqrt(np.mean(sosfilt(_hp, music_sh)[_ref] ** 2)) * np.mean(duck[voice != 0]); _v_hi = np.sqrt(np.mean(sosfilt(_hp, vo)[voice != 0] ** 2))
mus = music_sh * (_v_hi / (_m_hi + 1e-12)) * 10 ** (MUSIC_DB / 20) * duck
mus *= 1 + 0.6 * np.clip((t - (OUT + VO + 0.1)) / 0.6, 0, 1)   # the music lifts a little for the end card
fxn = (fx + amb) * 0.9 * 10 ** (-9 / 20)                          # effects sit clearly under the speech
for name, mix in [('music', vo + mus + fxn), ('fx', vo + fxn)]:
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.97)
    wavfile.write('mix_' + name + '.wav', SR, mix.astype(np.float32))
    # loudness to -14 LUFS and AAC for the PC render
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'mix_' + name + '.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'flac', '-sample_fmt', 's32', 'mix_' + name + '.flac'], check=True)
print('ok', END)
if '-v' in sys.argv:
    W = int(0.05 * SR); f = np.sqrt(np.convolve(fxn ** 2, np.ones(W) / W, 'same')); vv = np.sqrt(np.convolve(vo ** 2, np.ones(W) / W, 'same')); vr = np.percentile(vv[vv > 1e-3], 90)
    for tt in np.arange(0, END, 0.5):
        i = slice(int(tt * SR), int((tt + 0.5) * SR)); d = 20 * np.log10(f[i].max() / vr + 1e-9)
        if d > -16: print(f'{tt:5.1f} fx {d:5.1f} dB rel. speech')
