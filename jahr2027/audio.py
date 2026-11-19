# Ton für "Was ändert sich 2027 für dich?": python3 audio.py  (läuft im Ordner jahr2027/)
# Musik aus dem Epidemic-Sound-Connector, Effekte (v3) aus der Soundza-Bibliothek (lokal in sfx/soundza, nicht im Repo), Liste in SOUNDS.md
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
def sz(name):  # Soundza library sounds (v3, Wunsch des Nutzers 19.11.2026), list in SOUNDS.md
    if name not in _c:
        r, x = wavfile.read('sfx/soundza/' + name + '.48k.wav'); x = x.astype(np.float64)
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

PS = 'pencil_scratch2'
def pencil(a, d, at, g, fo=0.08): add(cut(sz(PS), a, d, 0.01, fo), at, g)
def marker(at, d, g, r=1.0): add(rate(cut(sz('marker_scratch'), 0.0, d * r, 0.01, 0.12), r), at, g)
def knock(at, g, k=0, r=1.0): add(rate(hp(cut(sz('knock'), (0.0, 0.212, 0.449)[k % 3], 0.16, 0.002, 0.1), 300), r), at - 0.002, g)
# ---------------------------------------------------------------- hook
marker(1.55, 0.75, 0.42)                                                      # the red marker strikes through the 10.000-euro bundle
whoosh(2.95, 0.38, 0)                                                         # the bundle slides away
hit('cover_tear1', 7.05, 0.6, 0.03)                                           # the cover page tears off
# ---------------------------------------------------------------- 1 minimum wage
marker(7.95, 0.9, 0.4, 0.92)                                                  # red ring around the 1st of January
add(lp(cut(sz('rustle_slide'), 0.05, 0.85, 0.02, 0.25), 7000), 8.55, 0.3)     # the pay slip slides out
add(CK[0], 9.72, 0.5); add(CK[2], 12.64, 0.42)
# ---------------------------------------------------------------- 2 Deutschlandticket
hit('card_slide', 15.32, 0.55, 0.147)
add(CK[1], 17.32, 0.5)
# ---------------------------------------------------------------- 3 Riester / depot
whoosh(19.6, 0.3, 1)
hit('book_drop', 21.44, 0.27, 0.235)                                           # the Riester binder falls over
add(cut(sz('shimmer'), 0.0, 1.6, 0.003, 0.5), 22.25, 0.12)                     # the depot's chart line draws itself
hit('coins2', 24.4, 0.3, 0.061)                                               # coins fall into the depot
# ---------------------------------------------------------------- planned: sticky note and pencil
hit('paper3', 27.03, 0.42, 0.042)
pencil(0.5, 0.95, 27.15, 0.4)                                                 # "geplant"
pencil(2.03, 0.35, 28.05, 0.42)                                               # underline
# piggy bank (v2, Wunsch des Nutzers 19.11.2026): it trots in and out on small hooves, three coins drop through its slot
PIG = dict(in0=30.72, in1=32.3, tu0=32.2, tu1=32.8, out0=35.45, wo0=35.7, out1=36.7, x0=-0.37, STR=0.11, V=0.48, A=0.12)
def _cl(x): return min(max(x, 0.0), 1.0)
def _win(t, a, b, f): return min(_cl((t - a) / f), _cl((b - t) / f))
def pig_x(t):
    P = PIG
    if t < P['in1']: u = _cl((t - P['in0']) / (P['in1'] - P['in0'])); return P['x0'] * (1 - u) ** 2
    if t < P['wo0']: return 0.0
    tau = t - P['wo0']; return -P['V'] * (tau - P['A'] * (1 - np.exp(-tau / P['A'])))
def pig_phase(t):
    P = PIG; s = pig_x(t) - P['x0'] if t < P['wo0'] else -P['x0'] - pig_x(t)
    return 2 * np.pi * s / P['STR'] + np.pi * _cl((t - P['tu0']) / (P['tu1'] - P['tu0'])) + np.pi * _cl((t - P['out0']) / (P['wo0'] + 0.08 - P['out0']))
def pig_amp(t):
    P = PIG; v = abs(pig_x(t + 0.02) - pig_x(t - 0.02)) / 0.04
    return max(0.55 * min(v / 0.3, 1), 0.3 * max(_win(t, P['tu0'], P['tu1'], 0.12), _win(t, P['out0'], P['wo0'] + 0.08, 0.1)))
TAPS = [rate(hp(cut(sz('knock'), a, 0.05, 0.001, 0.035), 900), 1.7) for a in (0.0, 0.212, 0.449)]
_last = None; _k = 0; _r = np.random.default_rng(3)
for tt in np.arange(PIG['in0'], PIG['out1'], 0.002):
    ph = pig_phase(tt); n = int(np.floor((ph - np.pi / 2) / np.pi))
    if _last is not None and n > _last:
        a = pig_amp(tt)
        if a > 0.08: add(rate(TAPS[_k % len(TAPS)], 1.0 + 0.06 * (_r.random() - 0.5)), tt - 0.005, 0.2 * (a / 0.55) ** 0.5); _k += 1
    _last = n
for tc, r, g in ((33.98, 1.0, 0.3), (34.32, 1.07, 0.27), (34.66, 0.95, 0.28)):  # three coins drop through the slot
    add(lp(rate(sz('coin_box'), r), 6000), tc - 0.029 / r, g)
pencil(2.6, 0.3, 37.0, 0.42)                                                  # 259 struck out
pencil(7.3, 0.55, 37.25, 0.48)                                                # 267 written
pencil(9.0, 0.5, 37.82, 0.38)                                                 # dashed ring
add(rate(cut(sz('glock'), 0.0, 1.6, 0.002, 0.6), 2 ** (-5/12)), 39.9, 0.12)    # the 2027 bar grows
# ---------------------------------------------------------------- 7 driving licence
hit('tear4', 42.08, 0.6, 0.092)
whoosh(42.4, 0.26, 1)
hit('card_flip', 47.32, 0.5, 0.123)                                           # the old card turns over into the new one
add(cut(sz('shimmer'), 0.0, 1.0, 0.003, 0.4), 48.0, 0.06)
marker(46.3, 0.85, 0.42, 0.9)                                                 # ring around the 19th
add(CK[0], 46.27, 0.38)
# ---------------------------------------------------------------- 8 pensions
add(cut(sz('page_flips'), 0.35, 1.0, 0.01, 0.25), 48.3 - 0.13, 0.55)            # February to June fly by
hit('quarter_desk', 52.04, 0.32, 0.265)                                       # the extra coin lands on the stack
add(cut(sz('shimmer'), 0.0, 1.2, 0.003, 0.4), 52.0, 0.08)
# ---------------------------------------------------------------- 9 Musterung
hit('paper3', 53.2, 0.38, 0.042)                                              # the letter arrives
add(cut(sz('envelope'), 0.9, 1.3, 0.01, 0.3), 55.95 - 0.076, 0.45)              # the flap opens at the back, the letter slides out
pencil(12.3, 0.3, 60.45, 0.35)                                                # tick on "freiwillig"
# ---------------------------------------------------------------- 10 cash
whoosh(61.75, 0.4, 0)
hit('tear8', 63.45, 0.55, 0.039)
marker(63.7, 0.8, 0.42, 0.95)
whoosh(64.75, 0.3, 1)
marker(65.85, 0.3, 0.38); marker(66.24, 0.3, 0.36, 1.08)                      # red X
add(CK[1], 65.86, 0.35)
whoosh(67.5, 0.16, 0)                                                          # the counter slides away
# private hand-over (v3): bundle lands, two wooden figures are put down, A flicks the bundle over, B hops
add(lp(cut(sz('book_drop'), 0.18, 0.5, 0.003, 0.2), 2500), 68.0 - 0.055, 0.22)
knock(68.22, 0.4, 0); knock(68.38, 0.36, 1, 0.92)
knock(69.0, 0.16, 2, 1.2)
add(lp(rate(cut(sz('rustle_slide'), 0.08, 0.6, 0.01, 0.25), 0.9), 6000), 69.0, 0.32)
knock(69.17, 0.14, 0, 1.1); knock(69.82, 0.22, 1, 1.05)
# ---------------------------------------------------------------- overview and end card
whoosh(70.25, 0.4, 1)
add(cut(sz('shimmer'), 0.0, 1.4, 0.003, 0.5), 70.6, 0.1)
add(rate(cut(sz('cover_tear1'), 0.0, 1.0, 0.002, 0.2), 0.85), 73.8 - 0.035, 0.5)  # last page tears off
marker(73.98, 0.8, 0.42); marker(74.78, 0.8, 0.4, 0.94)                       # the marker writes "function"
marker(75.6, 0.35, 0.4, 1.1)                                                  # small ring for the dot
add(CK[1], 75.93, 1.1)                                                        # dot pops in
add(cut(sz('glock'), 0.0, 2.0, 0.002, 0.8), 75.95, 0.18)                       # soft chime on the finished logo
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
import sys
if '-v' in sys.argv:
    W=int(0.05*SR);f=np.sqrt(np.convolve(fxn**2,np.ones(W)/W,'same'));v=np.sqrt(np.convolve(vo**2,np.ones(W)/W,'same'));vr=np.percentile(v[v>1e-3],90)
    for tt in np.arange(0,END,0.5):
        i=slice(int(tt*SR),int((tt+0.5)*SR));d=20*np.log10(f[i].max()/vr+1e-9)
        if d>-14: print(f'{tt:5.1f} fx {d:5.1f} dB rel. speech')
