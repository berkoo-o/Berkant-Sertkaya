# Ton für „Diese 5 Gesetze haben Deutschland richtig wütend gemacht“ (Podest-Fassung): python3 audio_podest.py  (läuft im Ordner gesetze/)
# Musik „Radar Focus“ und Effekte aus dem Epidemic-Sound-Connector sowie Soundza-Aufnahmen (lokal, nicht im Repo; Liste in SOUNDS.md).
# Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 2); im Video beginnt die Stimme bei 0,15 s.
# Effekte nur an Schlüsselstellen (CLAUDE.md: kein Dauer-„tztztz“), dazwischen trägt die Musik.
# Ergebnis: mix_podest_music.flac und mix_podest_fx.flac (render-pc.mjs hängt sie als AAC 320 kbit/s an die Videos).
import numpy as np, subprocess, sys, json
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; VO = 0.15; OUT = 54.6; END_V = 58.4; END = END_V + VO; N = int(SR * END)
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
ge = lambda n: snd('sfx/epidemic/' + n + '.48k.wav')
vm = lambda n: snd('../vermoegen/sfx/epidemic/' + n + '.48k.wav')
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
pop = lambda at, g=0.12, r=1.0: add(rate(cut(vm('pop'), 0.0, 0.4), r), at, g)

# ---------------------------------------------------------------- hook: the five objects hop one after the other (rising pitch), the paragraph sign lands
for i in range(5): pop(0.25 + i * 0.26 + 0.19, 0.075, 0.85 + i * 0.09)
add(rate(cut(sz('shimmer'), 0.0, 1.2, 0.01, 0.5), 1.1), 1.25, 0.05)
pop(1.98, 0.1, 0.8)
whoosh(5.0, 0.12, 1)                                                                # push in to number one

# ---------------------------------------------------------------- the paragraph sign hops to the next podium, the big number appears
for k, h in enumerate((7.55, 14.25, 24.1, 32.35, 40.05)):
    whoosh(h + 0.35, 0.16, k)
    pop(h + 0.75, 0.07, 0.9 + 0.05 * k)
for k, n in enumerate((7.45, 14.18, 24.02, 32.26, 39.95)): click(n + 0.05, 0.08, k)

# ---------------------------------------------------------------- 5: boots on the spot, salute, students strike with a whistle
add(cut(ge('boots'), 0.0, 1.15, 0.003, 0.15), 7.92, 0.1)
add(cut(ge('boots'), 1.0, 0.3, 0.002, 0.08), 9.02, 0.08)
pop(10.3, 0.07, 1.1)
add(hp(rate(cut(ge('chant'), 0.3, 4.2, 0.6, 0.8), 1.12), 300), 10.35, 0.15)          # students chanting, a little higher
add(cut(ge('whistle'), 0.0, 0.55, 0.01, 0.12), 11.0, 0.05)

# ---------------------------------------------------------------- 4: tractor starts and idles, the coin flies away and half of it comes back, convoy
add(lp(cut(ge('tractor'), 0.0, 4.6, 0.003, 0.3), 6000), 15.2, 0.3)
add(lp(cut(ge('tractor'), 1.6, 3.0, 0.4, 0.8), 6000), 19.4, 0.13)
add(cut(rf('coin_single'), 0.0, 0.8, 0.002, 0.3), 16.97, 0.13)
whoosh(18.45, 0.1, 0)
add(lp(rate(cut(ge('tractor'), 1.2, 3.4, 0.5, 1.2), 1.25), 5000), 19.6, 0.1)            # the convoy rumbles past
add(cut(rf('coin_single'), 0.0, 0.8, 0.002, 0.3), 22.95, 0.1)

# ---------------------------------------------------------------- 3: radiator ticks, the traffic light, the dial spins, the paragraph sign slams down
add(cut(ge('radiator'), 6.0, 6.3, 0.6, 0.25), 25.3, 0.1)
pop(26.65, 0.07, 1.2)
add(cut(rf('switch'), 0.0, 0.3, 0.002, 0.05), 26.82, 0.1)
for k in range(5): click(27.42 + k * 0.21, 0.05, k)
add(lp(rate(cut(sz('stamp'), 0.0, 0.6, 0.002, 0.2), 0.75), 3000), 31.56, 0.3)
add(rate(cut(sz('knock'), 0.0, 0.4, 0.002, 0.15), 0.7), 31.58, 0.08)

# ---------------------------------------------------------------- 2: stairs, barriers, the crowd storms
whoosh(33.55, 0.08, 1)
add(rate(cut(ge('fence'), 0.25, 0.5, 0.003, 0.25), 1.3), 34.15, 0.06)
pop(34.98, 0.07, 1.0)
add(cut(ge('chant'), 4.5, 2.5, 0.15, 0.6), 35.0, 0.12)
add(cut(ge('fence'), 0.25, 1.6, 0.003, 0.7), 37.3, 0.16)
add(hp(cut(ge('chant'), 10.9, 2.1, 0.08, 0.8), 200), 37.45, 0.11)

# ---------------------------------------------------------------- 1: stamp, the big crowd swells, the counter, arms go up
pop(41.17, 0.06, 1.1)
add(cut(sz('stamp'), 0.0, 0.6, 0.002, 0.2), 41.58, 0.28)
add(cut(ge('crowd'), 10.0, 8.6, 1.4, 1.2), 42.3, 0.28)
add(rate(cut(sz('shimmer'), 0.0, 1.2, 0.01, 0.5), 1.0), 44.9, 0.06)
add(cut(ge('chant'), 4.6, 2.4, 0.2, 0.8), 46.75, 0.1)

# ---------------------------------------------------------------- the question mark podium
pop(51.05, 0.11, 0.95); add(rate(cut(sz('glock'), 0.0, 1.4, 0.002, 0.6), 2 ** (2 / 12)), 51.12, 0.05)

# ---------------------------------------------------------------- outro: the sign jumps, everything sinks, confetti burst, the letters form, the dot lands
whoosh(OUT + 0.3, 0.14, 0)
add(lp(cut(vm('rumble'), 0.0, 1.2, 0.05, 0.5), 2500), OUT + 0.1, 0.12)
add(cut(sz('burst'), 0.0, 1.0, 0.002, 0.4), OUT + 0.15, 0.12)
add(rate(cut(sz('shimmer'), 0.0, 1.4, 0.01, 0.6), 0.95), OUT + 0.85, 0.07)
pop(OUT + 1.5, 0.08, 0.9)
whoosh(OUT + 2.15, 0.08, 1)
pop(OUT + 2.35, 0.13, 0.9); add(rate(cut(sz('glock'), 0.0, 1.8, 0.002, 0.7), 2 ** (-3 / 12)), OUT + 2.37, 0.09)
fx *= np.clip((END - t) / 0.25, 0, 1)

# ---------------------------------------------------------------- voice (natural tempo) + gentle ducking, music like the Merz video
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/gesetze_voice.raw'], check=True)
v = np.fromfile('/tmp/gesetze_voice.raw', dtype=np.float32).astype(np.float64)
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
    wavfile.write('/tmp/mix_podest_' + name + '.wav', SR, mix.astype(np.float32))
    pre = 'acompressor=threshold=-20dB:ratio=2.2:attack=8:release=150:makeup=1,alimiter=limit=0.8:level=false'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', '/tmp/mix_podest_' + name + '.wav', '-af', pre + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    af = pre + f",loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '/tmp/mix_podest_' + name + '.wav', '-af', af, '-ar', '48000', '-c:a', 'flac', '-sample_fmt', 's32', 'mix_podest_' + name + '.flac'], check=True)
print('ok', END)
if '-v' in sys.argv:
    Wn = int(0.05 * SR); f = np.sqrt(np.convolve(fxn ** 2, np.ones(Wn) / Wn, 'same')); vv = np.sqrt(np.convolve(vo ** 2, np.ones(Wn) / Wn, 'same')); vr = np.percentile(vv[vv > 1e-3], 90)
    for tt in np.arange(0, END, 0.5):
        i = slice(int(tt * SR), int((tt + 0.5) * SR)); d = 20 * np.log10(f[i].max() / vr + 1e-9)
        if d > -16: print(f'{tt:5.1f} fx {d:5.1f} dB rel. speech')
