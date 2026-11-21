# Ton für „Wem gehört eigentlich Deutschland?“: python3 audio.py  (läuft im Ordner vermoegen/)
# Musik „Radar Focus“ und Effekte aus dem Epidemic-Sound-Connector (lokal, nicht im Repo; Liste in SOUNDS.md), dazu Soundza-Aufnahmen
# aus dem 2027-Video. Alle Zeiten sind Stimm-Zeiten (Take 1); im Video beginnt die Stimme bei 0,15 s.
# Ergebnis: mix_music.flac und mix_fx.flac, verlustfrei (render-pc.mjs hängt sie als AAC 320 kbit/s an die Videos).
import numpy as np, subprocess, sys
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; VO = 0.15; OUT = 66.72; END_V = 70.0; END = END_V + VO; N = int(SR * END)
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
ep = lambda n: snd('sfx/epidemic/' + n + '.48k.wav')          # new for this video
bk = lambda n: snd('../bankrun/sfx/epidemic/' + n + '.48k.wav')  # from the bank-run video
rf = lambda n: snd('../rundfunk/sfx/epidemic/' + n + '.48k.wav') # coins from the GEZ video
sz = lambda n: snd('../jahr2027/sfx/soundza/' + n + '.48k.wav')
def cut(x, a, d, fi=0.004, fo=0.06):
    y = x[int(a * SR):int((a + d) * SR)]; tt = np.arange(len(y)) / SR; dd = len(y) / SR
    return y * np.clip(np.minimum(tt / fi, (dd - tt) / fo), 0, 1)
def rate(y, r): return np.interp(np.arange(int(len(y) / r)) * r, np.arange(len(y)), y) if r != 1 else y
fx = np.zeros(N); amb = np.zeros(N)
def add(sig, at, g=1.0, buf=None):
    b = fx if buf is None else buf; i = int((at + VO) * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i < N: j = min(N, i + len(sig)); b[i:j] += g * sig[:j - i]
def user(fn, a, b): x = load('../rundfunk/sfx/' + fn); return cut(x, a, b - a, 0.003, 0.02)
WH = [(user('whoosh.wav', 0.0, 0.85), 0.293), (user('whoosh.wav', 1.45, 2.4), 0.263)]
CK = [user('clicks.wav', 0.0, 0.3), user('clicks.wav', 0.55, 0.9), user('clicks.wav', 1.12, 1.27)]
def whoosh(c, g, i=0): add(WH[i % 2][0], c - WH[i % 2][1], 0.75 * g)
def click(at, g=0.11, i=0): add(CK[i % 3], at, g)

# ---------------------------------------------------------------- city bed: traffic, murmur; a little quieter in the evening
bed = lp(hp(bk('ambience_city')[:N], 120), 6000); bed = np.pad(bed, (0, N - len(bed)))
bed *= np.clip(t / 0.8, 0, 1) * (1 - 0.35 * np.clip((t - 45) / 10, 0, 1)) * np.clip((END - 0.3 - t) / 1.5, 0, 1)
amb += 0.17 * bed
# ---------------------------------------------------------------- hook: red flags pop up across the town (one pop + flutter, not one per flag)
# the tower of the richest tenth grows right away, bundle by bundle; the middle stacks follow
for k, at in enumerate((0.6, 1.35, 2.1)):
    add(rate(cut(bk('money_count'), 0.25, 0.9, 0.01, 0.3), (1.0, 1.05, 0.95)[k]), at, 0.2 - 0.02 * k)
click(2.4, 0.12, 1)                                                                 # 54 %
add(lp(cut(bk('money_handling'), 0.3, 0.9, 0.03, 0.3), 7000), 3.1, 0.16)
click(7.82, 0.12, 0)                                                                # 2–3 %
add(cut(rf('coins_drop'), 0.0, 0.9, 0.005, 0.3), 7.95, 0.2)                         # tiny coin piles of the poorer half
whoosh(11.6, 0.22, 1)                                                               # up from the square over the town
# the red flags pop up when Tom says „bekommt eine rote Fahne“ (one pop and a flutter, not one per flag)
add(cut(ep('pop'), 0.0, 0.4), 14.7, 0.2); add(cut(bk('cloth_flap'), 2.3, 0.9, 0.02, 0.3), 14.85, 0.22); add(rate(cut(ep('pop'), 0.0, 0.4), 1.15), 15.6, 0.13)
for at, i in ((16.7, 0), (17.45, 1), (18.25, 2)): click(at, 0.07, i)               # Firmen, Mietshäuser, Aktien
add(cut(ep('pop'), 0.0, 0.4), 20.0, 0.14); add(cut(bk('cloth_flap'), 2.3, 0.9, 0.02, 0.3), 20.1, 0.16)
click(22.85, 0.12, 2)                                                               # ≈ 60 %
# ---------------------------------------------------------------- the owned buildings sink, money towers grow
add(hp(cut(ep('rumble'), 0.0, 3.2, 0.2, 1.2), 90) , 22.9, 0.16)
add(lp(cut(bk('money_handling'), 1.7, 1.6, 0.05, 0.5), 7000), 23.5, 0.2)
# ---------------------------------------------------------------- the family house: house + savings + shares − loan
whoosh(27.0, 0.22, 1)
click(28.2, 0.12, 0); add(cut(sz('shimmer'), 0.0, 1.2, 0.003, 0.5), 28.45, 0.07)   # 780.000 € and the Top-10-% line
add(lp(cut(bk('money_handling'), 3.85, 0.6, 0.01, 0.2), 6500), 32.16, 0.22)        # Haus
add(cut(rf('coins_handful'), 0.0, 0.8, 0.005, 0.3), 32.62, 0.2)                     # Erspartes (coins from the piggy bank)
add(lp(cut(bk('money_handling'), 4.6, 0.6, 0.01, 0.2), 6500), 33.55, 0.2)          # Aktien
add(cut(sz('rustle_slide'), 0.0, 0.8, 0.01, 0.3), 35.25, 0.18)                      # the loan is taken off
# ---------------------------------------------------------------- the tenants' courtyard
whoosh(38.0, 0.22, 0)
add(cut(rf('coins_drop'), 0.0, 0.7, 0.005, 0.3), 39.4, 0.14)                         # small piles at the doors
click(38.6, 0.12, 1); click(41.6, 0.12, 2)                                          # 103.200 €, 58 %
for k in range(6):                                                                   # coins roll to the landlord's money tower
    add(rate(cut(rf('coin_spin'), 0.0, 1.1, 0.01, 0.3), (1.0, 1.08, 0.94, 1.12, 0.98, 1.04)[k]), 46.8 + k * 0.32, 0.09)
add(lp(cut(bk('money_handling'), 0.3, 1.2, 0.05, 0.4), 6000), 47.4, 0.12)
# ---------------------------------------------------------------- the inheritance in front of the villa
whoosh(52.0, 0.22, 1)
add(cut(rf('envelope_flap'), 0.0, 0.6, 0.005, 0.2), 54.3, 0.16)
add(rate(cut(sz('glock'), 0.0, 1.8, 0.002, 0.7), 2 ** (-5 / 12)), 55.05, 0.06)      # a warm tone when the stack changes hands
click(56.38, 0.12, 0)                                                               # 113 Mrd. €
whoosh(62.6, 0.24, 0)                                                                # up into the overview
# ---------------------------------------------------------------- outro: the flag comes loose and writes the logo, the end becomes the dot
whoosh(67.05, 0.22, 1)
add(cut(bk('cloth_flap'), 2.3, 1.2, 0.02, 0.4), 67.6, 0.18)
add(cut(ep('pop'), 0.0, 0.4), 69.1, 0.16); click(69.12, 0.12, 1)
add(rate(cut(sz('glock'), 0.0, 1.8, 0.002, 0.7), 2 ** (-3 / 12)), 69.12, 0.1)
fx *= np.clip((END - t) / 0.25, 0, 1)

# ---------------------------------------------------------------- voice (take 1, natural tempo) + gentle ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/vermoegen_voice.raw'], check=True)
v = np.fromfile('/tmp/vermoegen_voice.raw', dtype=np.float32).astype(np.float64)
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
    # loudness to -14 LUFS in two passes (measure, then apply linearly)
    import json
    pre = 'acompressor=threshold=-20dB:ratio=2.2:attack=8:release=150:makeup=1,alimiter=limit=0.8:level=false'   # gentle levelling so -14 LUFS fits under -1.5 dBTP
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'mix_' + name + '.wav', '-af', pre + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    af = pre + f",loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'mix_' + name + '.wav', '-af', af, '-ar', '48000', '-c:a', 'flac', '-sample_fmt', 's32', 'mix_' + name + '.flac'], check=True)
print('ok', END)
if '-v' in sys.argv:
    W = int(0.05 * SR); f = np.sqrt(np.convolve(fxn ** 2, np.ones(W) / W, 'same')); vv = np.sqrt(np.convolve(vo ** 2, np.ones(W) / W, 'same')); vr = np.percentile(vv[vv > 1e-3], 90)
    for tt in np.arange(0, END, 0.5):
        i = slice(int(tt * SR), int((tt + 0.5) * SR)); d = 20 * np.log10(f[i].max() / vr + 1e-9)
        if d > -16: print(f'{tt:5.1f} fx {d:5.1f} dB rel. speech')
