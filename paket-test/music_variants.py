import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 59.9; O = 56.9; N = int(SR * DUR)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, sig, at, g=1.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); buf[i:j] += g * sig[:j - i]
def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    return e * np.exp(-np.arange(n) / SR / d)
def finish(x):
    x = x * np.clip((O + 2.8 - t) / 1.8, 0, 1) * np.clip(t / 0.8, 0, 1)
    return x / (np.max(np.abs(x)) + 1e-9)

# ---------------------------------------------------------------- A: warm lo-fi (Rhodes, vinyl, soft swung beat), 84 BPM
def track_A():
    rng = np.random.default_rng(1); m = np.zeros(N)
    bpm = 84; beat = 60 / bpm; bar = 4 * beat
    chords = [[62, 65, 69, 72, 76], [55, 59, 65, 69, 76], [60, 64, 67, 71, 74], [57, 60, 64, 67, 71]]  # Dm9 G13 Cmaj9 Am9
    bass = [38, 43, 36, 45]
    def rhodes(f, n):
        tt = np.arange(n) / SR
        car = np.sin(2*np.pi*f*tt + 1.2*np.exp(-tt*3)*np.sin(2*np.pi*f*tt))
        bell = 0.25*np.sin(2*np.pi*f*7.0*tt) * np.exp(-tt*9)
        trem = 1 + 0.12*np.sin(2*np.pi*4.5*tt)
        return (car + bell) * trem * env(n, 0.005, 1.6)
    pos = 0.0; k = 0
    while pos < DUR:
        ch = chords[k % 4]; n = int(bar * SR * 1.2)
        for i, note in enumerate(ch):
            add(m, rhodes(mtof(note), n), pos + i * 0.012, 0.05)
        add(m, rhodes(mtof(ch[-1] + 12), int(beat*2*SR)), pos + 2.5*beat, 0.025)
        bn = int(bar * SR); bt = np.arange(bn) / SR
        add(m, lp(np.sin(2*np.pi*mtof(bass[k % 4])*bt), 200) * env(bn, 0.01, 1.2), pos, 0.22)
        for b in range(4):
            sw = 0.03 if b % 2 else 0
            kn = int(.35*SR); kt = np.arange(kn)/SR
            if b in (0, 2): add(m, np.sin(2*np.pi*(48 + 50*np.exp(-kt*25))*kt) * np.exp(-kt*9), pos + b*beat, 0.30)
            if b in (1, 3):
                sn = int(.25*SR); add(m, bp(rng.standard_normal(sn), 900, 5000) * env(sn, .002, .07), pos + b*beat, 0.07)
            for h in (0, .5):
                hn = int(.06*SR); add(m, hp(rng.standard_normal(hn), 7000) * env(hn, .001, .02), pos + b*beat + h*beat + (sw if h else 0), 0.03)
        pos += bar; k += 1
    vin = hp(rng.standard_normal(N), 1500) * 0.006
    for c in rng.integers(0, N - 50, 900): vin[c:c+40] += rng.standard_normal(40) * 0.03 * np.exp(-np.arange(40)/8)
    m = lp(m, 6000) + vin
    return finish(m)

# ---------------------------------------------------------------- B: bright marimba pulse (modern, light), 104 BPM
def track_B():
    rng = np.random.default_rng(2); m = np.zeros(N)
    bpm = 104; beat = 60 / bpm; bar = 4 * beat
    chords = [[65, 69, 72, 76], [57, 60, 64, 67], [58, 62, 65, 69], [60, 64, 67, 70]]  # Fmaj7 Am7 Bbmaj7 C7
    bass = [41, 45, 46, 48]
    def marimba(f, n):
        tt = np.arange(n) / SR
        return (np.sin(2*np.pi*f*tt) + 0.35*np.sin(2*np.pi*f*4*tt)*np.exp(-tt*30)) * env(n, 0.002, 0.18)
    pos = 0.0; k = 0
    while pos < DUR:
        ch = chords[k % 4]
        pat = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2]
        for i, p in enumerate(pat):
            note = ch[p] + 12 * (i % 8 == 7)
            add(m, marimba(mtof(note), int(.5*SR)), pos + i*beat/4, 0.045 if i % 4 else 0.06)
        n = int(bar*SR*1.3); tt = np.arange(n)/SR
        pad = sum(np.sin(2*np.pi*mtof(x)*tt) + 0.5*np.sin(2*np.pi*mtof(x)*1.004*tt) for x in ch)
        add(m, lp(pad, 1500) * np.minimum(1, tt/0.6) * np.clip((bar*1.3 - tt)/0.6, 0, 1), pos, 0.025)
        for b in range(4):
            bn = int(beat*SR*0.5); bt = np.arange(bn)/SR
            add(m, lp(np.sin(2*np.pi*mtof(bass[k % 4])*bt), 300) * env(bn, .005, .2), pos + b*beat + beat/2, 0.2)
            kn = int(.3*SR); kt = np.arange(kn)/SR
            add(m, np.sin(2*np.pi*(52 + 55*np.exp(-kt*30))*kt) * np.exp(-kt*12), pos + b*beat, 0.24)
            if b in (1, 3):
                cn = int(.2*SR); add(m, bp(rng.standard_normal(cn), 1200, 6000) * env(cn, .001, .04), pos + b*beat, 0.06)
            for s16 in range(4):
                sn = int(.05*SR); add(m, hp(rng.standard_normal(sn), 6000) * env(sn, .002, .015), pos + b*beat + s16*beat/4, 0.02 if s16 % 2 else 0.03)
        pos += bar; k += 1
    return finish(lp(m, 9000))

# ---------------------------------------------------------------- C: felt piano + soft strings, 90 BPM
def track_C():
    rng = np.random.default_rng(3); m = np.zeros(N)
    bpm = 90; beat = 60 / bpm; bar = 4 * beat
    chords = [[48, 55, 60, 64, 67], [47, 55, 59, 62, 67], [45, 52, 57, 60, 64], [41, 53, 57, 60, 65]]  # C G/B Am F
    melody = [[76, None, 74, 72], [74, None, 71, None], [72, None, 76, 74], [72, None, None, 69]]
    def piano(f, n, vel=1):
        tt = np.arange(n) / SR
        s = sum(np.sin(2*np.pi*f*h*tt) / h**1.8 * np.exp(-tt*(1.4 + h*0.8)) for h in (1, 2, 3, 4, 5))
        return lp(s * np.minimum(1, tt/0.006), 2500 + 1500*vel)
    pos = 0.0; k = 0
    while pos < DUR:
        ch = chords[k % 4]
        add(m, piano(mtof(ch[0]), int(bar*SR)), pos, 0.09)
        for i in range(8):
            note = ch[1 + [0, 1, 2, 3, 2, 1, 2, 3][i]]
            add(m, piano(mtof(note), int(1.6*SR), .5), pos + i*beat/2, 0.045)
        for i, note in enumerate(melody[k % 4]):
            if note: add(m, piano(mtof(note), int(2*SR), 1), pos + i*beat, 0.06)
        n = int(bar*SR*1.3); tt = np.arange(n)/SR
        st = sum(sum(np.sin(2*np.pi*mtof(x+12)*d*tt + 0.2*np.sin(2*np.pi*5*tt)) for d in (1, 1.003, 0.997)) for x in ch[1:4])
        add(m, lp(st, 2200) * np.minimum(1, tt/1.0) * np.clip((bar*1.3 - tt)/0.8, 0, 1), pos, 0.012)
        for b in range(4):
            kn = int(.3*SR); kt = np.arange(kn)/SR
            add(m, np.sin(2*np.pi*(50 + 40*np.exp(-kt*28))*kt) * np.exp(-kt*10), pos + b*beat, 0.18)
            hn = int(.05*SR); add(m, hp(rng.standard_normal(hn), 7000) * env(hn, .001, .02), pos + b*beat + beat/2, 0.025)
        pos += bar; k += 1
    return finish(m)

for name, fn in [('A', track_A), ('B', track_B), ('C', track_C)]:
    x = fn(); wavfile.write(f'music_{name}.wav', SR, x.astype(np.float32)); print(name, 'ok')
