# Gemeinsamer Ton-Mischer für die Knete-Videos (Stimme im natürlichen Tempo, Musik „Radar Focus“ wie im Merz- und Gesetze-Video, Effekte nur an Schlüsselstellen).
# Benutzung: from mix import Mix; m = Mix(OUT, END_V); m.add(...); m.write('name')  → mix_<name>_music.flac und mix_<name>_fx.flac im aktuellen Ordner
import numpy as np, subprocess, json, os, sys
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; VO = 0.15
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def load(path):
    r, x = wavfile.read(path); x = x.astype(np.float64)
    if x.ndim > 1: x = x.mean(1)
    if r != SR: x = np.interp(np.arange(int(len(x) * SR / r)) * r / SR, np.arange(len(x)), x)
    return x / (np.max(np.abs(x)) + 1e-9)
_c = {}
def snd(rel):
    if rel not in _c: _c[rel] = load(os.path.join(ROOT, rel))
    return _c[rel]
def cut(x, a, d, fi=0.004, fo=0.06):
    y = x[int(a * SR):int((a + d) * SR)]; tt = np.arange(len(y)) / SR; dd = len(y) / SR
    return y * np.clip(np.minimum(tt / fi, (dd - tt) / fo), 0, 1)
def rate(y, r): return np.interp(np.arange(int(len(y) / r)) * r, np.arange(len(y)), y) if r != 1 else y
class Mix:
    def __init__(self, OUT, END_V):
        self.OUT, self.END = OUT, END_V + VO; self.N = int(SR * self.END); self.t = np.arange(self.N) / SR; self.fx = np.zeros(self.N)
        wh = load(os.path.join(ROOT, 'rundfunk/sfx/whoosh.wav')); ck = load(os.path.join(ROOT, 'rundfunk/sfx/clicks.wav'))
        self.WH = [(cut(wh, 0.0, 0.85, 0.003, 0.02), 0.293), (cut(wh, 1.45, 0.95, 0.003, 0.02), 0.263)]
        self.CK = [cut(ck, 0.0, 0.3, 0.003, 0.02), cut(ck, 0.55, 0.35, 0.003, 0.02), cut(ck, 1.12, 0.15, 0.003, 0.02)]
    def add(self, sig, at, g=1.0):
        i = int((at + VO) * SR)
        if i < 0: sig = sig[-i:]; i = 0
        if i < self.N: j = min(self.N, i + len(sig)); self.fx[i:j] += g * sig[:j - i]
    def whoosh(self, c, g, i=0): self.add(self.WH[i % 2][0], c - self.WH[i % 2][1], 0.75 * g)
    def click(self, at, g=0.09, i=0): self.add(self.CK[i % 3], at, g)
    def pop(self, at, g=0.1, r=1.0): self.add(rate(cut(snd('vermoegen/sfx/epidemic/pop.48k.wav'), 0.0, 0.4), r), at, g)
    def outro(self):
        O = self.OUT; self.whoosh(O + 0.12, 0.1, 0)
        self.pop(O + 0.45, 0.06, 1.0); self.pop(O + 0.68, 0.055, 1.1); self.pop(O + 0.9, 0.05, 1.2)
        self.pop(O + 1.3, 0.13, 0.9); self.add(rate(cut(snd('jahr2027/sfx/soundza/glock.48k.wav'), 0.0, 1.8, 0.002, 0.7), 2 ** (-3 / 12)), O + 1.32, 0.09)
    def write(self, name, voice='voice/voice.mp3', bed=None):
        t, N, END = self.t, self.N, self.END; fx = self.fx * np.clip((END - t) / 0.25, 0, 1)
        raw = f'/tmp/{name}_voice.raw'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', voice, '-ac', '1', '-ar', str(SR), '-f', 'f32le', raw], check=True)
        v = np.fromfile(raw, dtype=np.float32).astype(np.float64)
        vc = np.zeros(N); i0 = int(VO * SR); vc[i0:i0 + len(v)] = v[:N - i0]
        ve = lp(np.abs(vc), 4); ve = ve / (ve.max() + 1e-9); duck = lp(1 - 0.42 * np.clip(ve * 6, 0, 1), 3)
        norm = lambda x, p: x / (np.max(np.abs(x)) + 1e-9) * p
        vo = norm(vc, 0.9)
        music = snd('rundfunk/sfx/epidemic/music_radar_focus.48k.wav')[:N]; music = np.pad(music, (0, N - len(music)))
        music = music * np.clip((END - 0.25 - t) / 1.8, 0, 1) * np.clip((t + 0.2) / 0.6, 0, 1)
        music_sh = music - 0.6 * lp(music, 120, 2)
        _hp = butter(4, 250, 'high', fs=SR, output='sos'); ref = slice(int(SR), int(self.OUT * SR))
        m_hi = np.sqrt(np.mean(sosfilt(_hp, music_sh)[ref] ** 2)) * np.mean(duck[vc != 0]); v_hi = np.sqrt(np.mean(sosfilt(_hp, vo)[vc != 0] ** 2))
        mus = music_sh * (v_hi / (m_hi + 1e-12)) * 10 ** (-22 / 20) * duck
        mus *= 1 + 0.6 * np.clip((t - (self.OUT + VO + 0.1)) / 0.6, 0, 1)
        fxn = fx * 0.9 * 10 ** (-9 / 20)
        if bed is not None: fxn = fxn + bed
        for kind, mix in [('music', vo + mus + fxn), ('fx', vo + fxn)]:
            mix = mix / max(1.0, np.max(np.abs(mix)) / 0.97); tmp = f'/tmp/mix_{name}_{kind}.wav'
            wavfile.write(tmp, SR, mix.astype(np.float32))
            pre = 'acompressor=threshold=-20dB:ratio=2.2:attack=8:release=150:makeup=1,alimiter=limit=0.8:level=false'
            r = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', pre + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
            m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
            af = pre + f",loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp, '-af', af, '-ar', '48000', '-c:a', 'flac', '-sample_fmt', 's32', f'mix_{name}_{kind}.flac'], check=True)
        print('ok', name, round(END, 2))
        if '-v' in sys.argv:
            Wn = int(0.05 * SR); f = np.sqrt(np.convolve(fxn ** 2, np.ones(Wn) / Wn, 'same')); vv = np.sqrt(np.convolve(vo ** 2, np.ones(Wn) / Wn, 'same')); vr = np.percentile(vv[vv > 1e-3], 90)
            for tt in np.arange(0, END, 0.5):
                i = slice(int(tt * SR), int((tt + 0.5) * SR)); d = 20 * np.log10(f[i].max() / vr + 1e-9)
                if d > -16: print(f'{tt:5.1f} fx {d:5.1f} dB rel. speech')
