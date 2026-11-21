# Ton für „Wem gehört eigentlich Deutschland?“ im Knete-Look: python3 audio_knete.py  (läuft im Ordner vermoegen/)
# Musik „Radar Focus“ und Effekte aus dem Epidemic-Sound-Connector sowie Soundza-Aufnahmen (lokal, nicht im Repo; Liste in SOUNDS.md).
# Alle Zeiten sind Stimm-Zeiten (voice/knete/words_take1.json); im Video beginnt die Stimme bei 0,15 s.
# Effekte nur an Schlüsselstellen (CLAUDE.md: kein Dauer-„tztztz“), dazwischen trägt die Musik.
# Ergebnis: mix_knete_music.flac und mix_knete_fx.flac (render-pc.mjs hängt sie als AAC 320 kbit/s an die Videos).
import numpy as np, subprocess, sys, json
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; VO = 0.15; OUT = 73.45; END_V = 77.2; END = END_V + VO; N = int(SR * END)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def load(path):
    r, x = wavfile.read(path); x = x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    if r != SR: x = np.interp(np.arange(int(len(x) * SR / r)) * r / SR, np.arange(len(x)), x)
    return x / (np.max(np.abs(x)) + 1e-9)
_c = {}
def snd(path):
    if path not in _c: _c[path] = load(path)
    return _c[path]
ep = lambda n: snd('sfx/epidemic/' + n + '.48k.wav')
bk = lambda n: snd('../bankrun/sfx/epidemic/' + n + '.48k.wav')
rf = lambda n: snd('../rundfunk/sfx/epidemic/' + n + '.48k.wav')
sz = lambda n: snd('../jahr2027/sfx/soundza/' + n + '.48k.wav')
def cut(x, a, d, fi=0.004, fo=0.06):
    y = x[int(a * SR):int((a + d) * SR)]; tt = np.arange(len(y)) / SR; dd = len(y) / SR
    return y * np.clip(np.minimum(tt / fi, (dd - tt) / fo), 0, 1)
def rate(y, r): return np.interp(np.arange(int(len(y) / r)) * r, np.arange(len(y)), y) if r != 1 else y
fx = np.zeros(N)
def add(sig, at, g=1.0):
    i = int((at + VO) * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i < N: j = min(N, i + len(sig)); fx[i:j] += g * sig[:j - i]
def user(fn, a, b): x = load('../rundfunk/sfx/' + fn); return cut(x, a, b - a, 0.003, 0.02)
WH = [(user('whoosh.wav', 0.0, 0.85), 0.293), (user('whoosh.wav', 1.45, 2.4), 0.263)]
CK = [user('clicks.wav', 0.0, 0.3), user('clicks.wav', 0.55, 0.9), user('clicks.wav', 1.12, 1.27)]
def whoosh(c, g, i=0): add(WH[i % 2][0], c - WH[i % 2][1], 0.75 * g)
def click(at, g=0.11, i=0): add(CK[i % 3], at, g)
pop = lambda at, g=0.12, r=1.0: add(rate(cut(ep('pop'), 0.0, 0.4), r), at, g)

# ---------------------------------------------------------------- hook: the red figure hops, 54 coins pour onto its column, then the middle columns
pop(0.3, 0.11, 0.9)
click(2.0, 0.12, 1)                                                                 # 54 % appears
add(lp(cut(rf('coins_stack'), 0.0, 2.3, 0.02, 0.5), 9000), 2.45, 0.22)              # the red column fills up
add(lp(rate(cut(rf('coins_stack'), 0.2, 1.6, 0.02, 0.5), 0.94), 8000), 3.75, 0.15)
add(lp(cut(rf('coins_stack_slow'), 0.3, 1.9, 0.05, 0.6), 7000), 4.45, 0.12)          # the middle columns, quieter
whoosh(6.05, 0.2, 0)                                                                # over to the poorer half
click(7.8, 0.12, 0)                                                                 # 2–3 %
for k, at in enumerate((8.77, 9.07, 9.37)):                                         # one coin each for figures 3, 4, 5
    add(rate(cut(rf('coin_single'), 0.0, 0.5, 0.002, 0.15), (1.0, 1.06, 0.95)[k]), at, 0.15)
# ---------------------------------------------------------------- the legend: 100 coins, 1 figure = 10 %
whoosh(10.5, 0.16, 1)
add(cut(sz('shimmer'), 0.0, 1.6, 0.003, 0.6), 11.45, 0.07)                          # all coins glow once
for k, at in enumerate((15.3, 16.1, 16.9)): click(at, 0.06, k)                     # number tiles 1–10
# ---------------------------------------------------------------- the red figure: 54 coins, plus the super-rich ≈ 60
whoosh(19.6, 0.18, 0)
click(22.1, 0.07, 2)                                                                # „54 Münzen“
add(cut(sz('shimmer'), 0.0, 1.2, 0.003, 0.5), 24.4, 0.05)                           # the missing slots appear
add(cut(rf('coins_drop'), 0.0, 1.0, 0.005, 0.3), 28.05, 0.15)                       # six coins hop over
click(27.84, 0.12, 1)                                                               # ≈ 60 %
# ---------------------------------------------------------------- the town: firms, rental blocks, shares
whoosh(29.5, 0.18, 1)
pop(30.62, 0.13); add(cut(bk('cloth_flap'), 2.3, 0.9, 0.02, 0.3), 31.25, 0.15); pop(32.04, 0.11, 1.1)
# ---------------------------------------------------------------- the threshold: 780.000 €, house + savings + shares − loan
whoosh(33.2, 0.18, 0)
click(35.92, 0.12, 2); add(cut(sz('knock'), 0.0, 0.5, 0.002, 0.2), 35.98, 0.16)     # the sign goes up
pop(39.44, 0.12); add(cut(rf('coins_handful'), 0.0, 0.7, 0.005, 0.3), 40.0, 0.12); pop(40.88, 0.1, 1.12)
add(rate(cut(sz('knock'), 0.0, 0.5, 0.002, 0.2), 0.78), 42.45, 0.18)                # the loan block, a dull knock
# ---------------------------------------------------------------- the middle: 103.000 €
whoosh(43.7, 0.18, 1)
click(45.92, 0.12, 0); add(cut(sz('knock'), 0.0, 0.5, 0.002, 0.2), 45.98, 0.16)
# ---------------------------------------------------------------- rent flows to the owners
whoosh(47.5, 0.16, 0)
click(50.08, 0.12, 1)                                                               # 58 %
whoosh(53.35, 0.14, 1)
pop(53.62, 0.1, 1.05)                                                               # coins appear above the renters
add(cut(rf('coins_drop'), 0.0, 1.2, 0.005, 0.4), 54.95, 0.15)                       # they land on the red column
# ---------------------------------------------------------------- inheritance: a tied stack comes down onto the red column
whoosh(57.2, 0.18, 0)
whoosh(59.75, 0.1, 1)
add(lp(cut(rf('coins_stack'), 0.0, 0.6, 0.005, 0.3), 8000), 60.2, 0.18)
add(rate(cut(sz('glock'), 0.0, 1.8, 0.002, 0.7), 2 ** (-5 / 12)), 60.25, 0.06)
click(62.88, 0.12, 2)                                                               # 113 Mrd. €
whoosh(66.2, 0.14, 1)
# ---------------------------------------------------------------- which figure are you? the tiles light up one by one
whoosh(68.6, 0.14, 0)
add(cut(sz('shimmer'), 0.0, 1.4, 0.003, 0.5), 69.9, 0.07)
# ---------------------------------------------------------------- outro: red clay letters pop up, the red figure squashes into a ball and hops onto the dot
whoosh(73.6, 0.14, 1)
pop(73.95, 0.1, 0.85); pop(74.2, 0.08, 0.95); pop(74.45, 0.08, 1.05)            # three soft plops for the letters, not one per letter
whoosh(74.85, 0.12, 0)                                                              # the hop
pop(75.45, 0.13, 0.9); add(rate(cut(sz('glock'), 0.0, 1.8, 0.002, 0.7), 2 ** (-3 / 12)), 75.47, 0.09)
fx *= np.clip((END - t) / 0.25, 0, 1)

# ---------------------------------------------------------------- voice (natural tempo) + gentle ducking, music like the Merz video
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/knete/voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/vermoegen_knete_voice.raw'], check=True)
v = np.fromfile('/tmp/vermoegen_knete_voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); i0 = int(VO * SR); voice[i0:i0 + len(v)] = v[:N - i0]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.42 * np.clip(ve * 6, 0, 1), 3)          # about -5 dB under speech
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
vo = norm(voice, 0.9)
music = load('../rundfunk/sfx/epidemic/music_radar_focus.48k.wav')[:N]; music = np.pad(music, (0, N - len(music)))
music *= np.clip((END - 0.25 - t) / 1.8, 0, 1) * np.clip((t + 0.2) / 0.6, 0, 1)
MUSIC_DB = -22
music_sh = music - 0.6 * lp(music, 120, 2)               # sub-bass about 8 dB lower, so the phone speaker still carries the music
_hp = butter(4, 250, 'high', fs=SR, output='sos'); _ref = slice(int(SR), int(OUT * SR))
_m_hi = np.sqrt(np.mean(sosfilt(_hp, music_sh)[_ref] ** 2)) * np.mean(duck[voice != 0]); _v_hi = np.sqrt(np.mean(sosfilt(_hp, vo)[voice != 0] ** 2))
mus = music_sh * (_v_hi / (_m_hi + 1e-12)) * 10 ** (MUSIC_DB / 20) * duck
mus *= 1 + 0.6 * np.clip((t - (OUT + VO + 0.1)) / 0.6, 0, 1)   # a little lift for the end card
fxn = fx * 0.9 * 10 ** (-9 / 20)
for name, mix in [('music', vo + mus + fxn), ('fx', vo + fxn)]:
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.97)
    wavfile.write('/tmp/mix_knete_' + name + '.wav', SR, mix.astype(np.float32))
    pre = 'acompressor=threshold=-20dB:ratio=2.2:attack=8:release=150:makeup=1,alimiter=limit=0.8:level=false'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', '/tmp/mix_knete_' + name + '.wav', '-af', pre + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    af = pre + f",loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '/tmp/mix_knete_' + name + '.wav', '-af', af, '-ar', '48000', '-c:a', 'flac', '-sample_fmt', 's32', 'mix_knete_' + name + '.flac'], check=True)
print('ok', END)
if '-v' in sys.argv:
    Wn = int(0.05 * SR); f = np.sqrt(np.convolve(fxn ** 2, np.ones(Wn) / Wn, 'same')); vv = np.sqrt(np.convolve(vo ** 2, np.ones(Wn) / Wn, 'same')); vr = np.percentile(vv[vv > 1e-3], 90)
    for tt in np.arange(0, END, 0.5):
        i = slice(int(tt * SR), int((tt + 0.5) * SR)); d = 20 * np.log10(f[i].max() / vr + 1e-9)
        if d > -16: print(f'{tt:5.1f} fx {d:5.1f} dB rel. speech')
