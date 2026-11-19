# Ton für "Was ändert sich 2027 für dich?": python3 audio.py  (läuft im Ordner jahr2027/)
# Musik und Effekte aus dem Epidemic-Sound-Connector (lokal in sfx/epidemic und ../rundfunk/sfx, nicht im Repo), Liste in SOUNDS.md
# Alle Zeiten unten sind Stimm-Zeiten (wie im Drehbuch); im Video beginnt die Stimme bei 0,15 s.
import numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; VO = 0.15; OUT = 73.45; END = 76.85 + VO; N = int(SR * END)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)

# music: Epidemic Sound "Radar Focus" (Blue Saga, 100 BPM), the channel's music bed, from the start of the track
_r, music = wavfile.read('../rundfunk/sfx/epidemic/music_radar_focus.48k.wav'); music = music.astype(np.float64)
if music.ndim > 1: music = music.mean(1)
music = music[:N]; music = np.pad(music, (0, N - len(music)))
music *= np.clip((END - 0.2 - t) / 1.6, 0, 1) * np.clip((t + 0.2) / 0.6, 0, 1)

fx = np.zeros(N)
def add(sig, at, g=1.0):
    i = int((at + VO) * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i < N: j = min(N, i + len(sig)); fx[i:j] += g * sig[:j - i]
_c = {}
def sz(name):
    if name not in _c:
        path = ('sfx/epidemic/' if not name.startswith('../') else '') + name + '.48k.wav'
        r, x = wavfile.read(path); x = x.astype(np.float64)
        if x.ndim > 1: x = x.mean(1)
        _c[name] = x / (np.max(np.abs(x)) + 1e-9)
    return _c[name]
RS = '../rundfunk/sfx/epidemic/'
def cut(x, a, d, fi=0.003, fo=0.05):
    y = x[int(a*SR):int((a + d)*SR)]; tt = np.arange(len(y))/SR; dd = len(y)/SR
    return y * np.clip(np.minimum(tt/fi, (dd - tt)/fo), 0, 1)
def rate(y, r): return np.interp(np.arange(int(len(y)/r))*r, np.arange(len(y)), y) if r != 1 else y
def hit(name, at, g, sync, r=1.0):  # place the sound so that its marked moment (sync, in s) lands on "at"
    y = rate(sz(name), r); add(y, at - sync/r, g)
def epi(fn, a, b):
    r, x = wavfile.read('../rundfunk/sfx/' + fn); x = x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    if r != SR: x = np.interp(np.arange(int(len(x)*SR/r))*r/SR, np.arange(len(x)), x)
    y = x[int(a*SR):int(b*SR)]; f = np.minimum(1, np.arange(len(y))/(0.003*SR)) * np.minimum(1, (len(y) - np.arange(len(y)))/(0.02*SR))
    return y / (np.max(np.abs(y)) + 1e-9) * f
# the user's own transition sounds (soft swooshes and UI clicks)
WH = [(epi('whoosh.wav', 0.0, 0.85)*0.30, 0.293), (epi('whoosh.wav', 1.45, 2.4)*0.30, 0.263)]
CK = [epi('clicks.wav', 0.0, 0.3)*0.22, epi('clicks.wav', 0.55, 0.9)*0.22, epi('clicks.wav', 1.12, 1.27)*0.22]
def whoosh(c, g, i=0): add(WH[i % 2][0], c - WH[i % 2][1], g)

# ---------------------------------------------------------------- hook
add(cut(sz('marker_line'), 0.0, 0.9, 0.003, 0.15), 1.55 - 0.075, 0.42)        # the red marker strikes through the 10.000-euro bundle
whoosh(2.95, 0.38, 0)                                                         # the bundle slides away
add(cut(sz('tear_04'), 0.0, 0.73, 0.002, 0.12), 7.05 - 0.147, 0.62)            # the cover page tears off
# ---------------------------------------------------------------- 1 minimum wage
add(cut(sz('marker_circle'), 0.65, 0.95, 0.02, 0.2), 7.95, 0.4)               # red ring around the 1st of January
add(lp(cut(sz('receipt_print'), 1.3, 1.0, 0.03, 0.25), 6000), 8.55, 0.22)     # the pay slip comes out
add(CK[0], 9.72, 0.5); add(CK[2], 12.64, 0.42)
# ---------------------------------------------------------------- 2 Deutschlandticket
hit('card_slide', 15.32, 0.55, 0.314)
add(CK[1], 17.32, 0.5)
# ---------------------------------------------------------------- 3 Riester / depot
whoosh(19.6, 0.3, 1)
hit('binder_drop', 21.44, 0.6, 0.08)                                          # the Riester binder falls over
hit('../rundfunk/sfx/epidemic/shimmer', 22.25, 0.13, 0.0)                     # the depot's chart line draws itself
add(lp(cut(sz(RS + 'coins_drop'), 0.0, 1.2, 0.003, 0.3), 7000), 24.4, 0.26)   # coins fall into the depot
# ---------------------------------------------------------------- planned: sticky note and pencil
hit('paper_drop', 27.03, 0.5, 0.165)
add(cut(sz('pencil_write'), 0.25, 0.95, 0.02, 0.15), 27.15, 0.38)              # "geplant"
add(cut(sz('pencil_v'), 0.3, 0.35, 0.01, 0.1), 28.05, 0.4)                     # underline
for i in range(3): hit(RS + 'coin_single', 33.62 + i*0.34 + 0.36, 0.16, 0.029, 1.0 + 0.06*i)   # three coins into the piggy bank (quiet)
add(cut(sz('pencil_v'), 0.45, 0.3, 0.01, 0.08), 37.0, 0.42)                    # 259 struck out
add(cut(sz('pencil_write'), 1.0, 0.55, 0.02, 0.12), 37.25, 0.5)               # 267 written
add(cut(sz('crayon_circle'), 0.0, 0.5, 0.005, 0.15), 37.82, 0.38)             # dashed ring
hit(RS + 'column_chord', 39.9, 0.13, 0.174, 2 ** (-2/12))                     # the 2027 bar grows
# ---------------------------------------------------------------- 7 driving licence
add(cut(sz('tear_03'), 0.0, 0.64, 0.002, 0.12), 42.08 - 0.461, 0.6)
hit('card_slide', 42.45, 0.45, 0.314)
add(cut(sz('marker_circle2'), 2.2, 0.85, 0.02, 0.2), 46.3, 0.42)              # ring around the 19th
add(CK[0], 46.27, 0.38)
# ---------------------------------------------------------------- 8 pensions
hit('pages_flick', 48.3, 0.6, 0.179)                                          # February to June fly by
hit(RS + 'coin_single', 52.04, 0.4, 0.029)                                    # the extra coin lands on the stack
hit(RS + 'shimmer', 52.0, 0.08, 0.0)
# ---------------------------------------------------------------- 9 Musterung
hit(RS + 'envelope_flap', 53.2, 0.4, 0.114)
add(CK[2], 54.75, 0.4)
hit(RS + 'envelope_open', 56.1, 0.45, 0.06)
add(cut(sz('pencil_v'), 0.1, 0.3, 0.005, 0.08), 60.45, 0.35)                  # tick on "freiwillig"
# ---------------------------------------------------------------- 10 cash
whoosh(61.75, 0.4, 0)
add(rate(cut(sz('tear_04'), 0.0, 0.73, 0.002, 0.12), 0.93), 63.45 - 0.13, 0.55)
add(cut(sz('marker_circle'), 0.2, 0.8, 0.02, 0.2), 63.7, 0.42)
whoosh(64.75, 0.3, 1)
add(cut(sz('marker_line'), 0.05, 0.3, 0.003, 0.06), 65.85, 0.38); add(rate(cut(sz('marker_line'), 0.05, 0.3, 0.003, 0.06), 1.08), 66.24, 0.36)
add(CK[1], 65.86, 0.35)
add(cut(sz('notes_count'), 0.0, 1.3, 0.01, 0.3), 68.4, 0.4)                   # private hand-over
# ---------------------------------------------------------------- overview and end card
whoosh(70.25, 0.4, 1)
hit(RS + 'shimmer', 70.6, 0.1, 0.0)
add(cut(sz('tear_notepad'), 0.0, 1.0, 0.002, 0.2), 73.8 - 0.527, 0.5)  # last page tears off
add(cut(sz('marker_circle2'), 0.4, 1.6, 0.05, 0.3), 73.98, 0.42)               # the marker writes "function"
add(cut(sz('marker_circle'), 1.3, 0.35, 0.01, 0.1), 75.6, 0.4)                # small ring for the dot
add(CK[1], 75.93, 1.1)                                                        # dot pops in
hit(RS + 'column_chord', 75.95, 0.22, 0.174)                                  # soft chord on the finished logo
fx *= np.clip((END - t) / 0.35, 0, 1)

# ---------------------------------------------------------------- voice (take 1, natural tempo) + gentle ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice/voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '/tmp/j27_voice.raw'], check=True)
v = np.fromfile('/tmp/j27_voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); i0 = int(VO*SR); voice[i0:i0 + len(v)] = v[:N - i0]
ve = lp(np.abs(voice), 4); ve = ve / (ve.max() + 1e-9)
duck = lp(1 - 0.42 * np.clip(ve * 6, 0, 1), 3)          # about -5 dB under speech (CLAUDE.md: Musik)
def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
vo = norm(voice, 0.9)
# music level as in the Merz video: sub-bass lowered by about 8 dB, level set above 250 Hz, 22 dB under the voice while Tom speaks
MUSIC_DB = -22
music_sh = music - 0.6 * lp(music, 120, 2)
_hp = butter(4, 250, 'high', fs=SR, output='sos'); _ref = slice(int(SR), int(OUT*SR))
_m_hi = np.sqrt(np.mean(sosfilt(_hp, music_sh)[_ref]**2)) * np.mean(duck[voice != 0]); _v_hi = np.sqrt(np.mean(sosfilt(_hp, vo)[voice != 0]**2))
mus = music_sh * (_v_hi / (_m_hi + 1e-12)) * 10**(MUSIC_DB/20) * duck
# after the voice the music lifts a little for the end card
mus *= 1 + 0.6 * np.clip((t - (OUT + VO + 0.1)) / 0.6, 0, 1)
fxn = fx * 0.9 * 10**(-9/20)  # effects sit about 7 dB under the speech level (the user found loud effects penetrant before)
for name, mix in [('music', vo + mus + fxn), ('fx', vo + fxn)]:
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.97)
    wavfile.write('mix_' + name + '.wav', SR, mix.astype(np.float32))
print('ok', END)
