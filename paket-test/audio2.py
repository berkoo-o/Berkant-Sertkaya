import numpy as np, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 59.9; O = 56.9; N = int(SR * DUR)
rng = np.random.default_rng(11)
t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / SR / d); return e
def add(buf, sig, at, g=1.0):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig)); buf[i:j] += g * sig[:j - i]
def win(a, b, f=0.3):  # gate window over full timeline
    return np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- music: calm ambient electronic loop, 96 BPM
bpm = 96; beat = 60 / bpm; bar = 4 * beat
music = np.zeros(N)
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 66]]
basses = [45, 41, 36, 43]
k = 0; pos = 0.0
while pos < DUR:
    ch = chords[k % 4]; n = int(bar * SR) + int(0.6 * SR); tt = np.arange(n) / SR
    pad = sum(np.sin(2*np.pi*mtof(m)*tt + 0.3*np.sin(2*np.pi*0.2*tt)) + 0.5*np.sin(2*np.pi*mtof(m)*1.003*tt) for m in ch)
    pe = np.minimum(1, tt / 0.5) * np.minimum(1, np.maximum(0, (bar + 0.6 - tt) / 0.6))
    add(music, lp(pad * pe, 1800) * 0.05, pos)
    bn = int(beat * 2 * SR)
    for b in range(2):
        bt = np.arange(bn) / SR
        add(music, np.sin(2*np.pi*mtof(basses[k % 4])*bt) * env(bn, 0.01, 0.5) * 0.16, pos + b*beat*2)
    arp = [ch[0]+12, ch[1]+12, ch[2]+12, ch[3]+12, ch[2]+12, ch[1]+12, ch[2]+12, ch[3]+12]
    for i, m in enumerate(arp):
        pn = int(0.4 * SR); pt = np.arange(pn) / SR
        pl = (np.sin(2*np.pi*mtof(m)*pt) + 0.3*np.sin(4*np.pi*mtof(m)*pt)) * env(pn, 0.003, 0.12)
        add(music, lp(pl, 3500) * 0.05, pos + i*beat/2)
    for b in range(4):
        kn = int(0.3 * SR); kt = np.arange(kn) / SR
        if b % 2 == 0: add(music, np.sin(2*np.pi*(50 + 60*np.exp(-kt*30))*kt) * env(kn, 0.002, 0.12) * 0.22, pos + b*beat)
        hn = int(0.05 * SR); add(music, hp(rng.standard_normal(hn), 7000) * env(hn, 0.001, 0.015) * 0.035, pos + b*beat + beat/2)
        if b % 2 == 1:
            sn = int(0.2 * SR); add(music, bp(rng.standard_normal(sn), 900, 4000) * env(sn, 0.002, 0.06) * 0.05, pos + b*beat)
    pos += bar; k += 1
music *= np.clip((O + 2.8 - t) / 1.8, 0, 1) * np.clip(t / 0.8, 0, 1)  # music ends ~1 s after outro start, fades over 1.8 s
import os
if os.environ.get('MUSIC'):  # alternative music track (already faded), e.g. music_A.wav
    _sr, _m = wavfile.read(os.environ['MUSIC']); _m = _m.astype(np.float64)
    music = np.zeros(N); music[:min(N, len(_m))] = _m[:N]

# ---------------- SFX
fx = np.zeros(N)
noise = rng.standard_normal(N)
hall = win(0, 7.5) + win(18.7, 41.4)
fx += (lp(noise, 180) * 0.6 + 0.15*np.sin(2*np.pi*100*t)) * win(0, 7.5) * 0.22
fx += (lp(noise, 180) * 0.6 + 0.15*np.sin(2*np.pi*100*t)) * win(18.7, 23.8) * 0.22
def clicks(a, b, step, g):
    for x in np.arange(a + 0.05, b, step):
        cn = int(0.02 * SR); add(fx, bp(rng.standard_normal(cn), 2000, 6000) * env(cn, 0.0005, 0.004), x + rng.uniform(0, 0.01), g)
clicks(0, 7.5, 0.147, 0.05); clicks(18.7, 23.8, 0.147, 0.05)
# sorter machine + tray clacks
fx += (lp(noise, 260) * 0.22 + 0.06*np.sin(2*np.pi*120*t)) * win(23.8, 41.4)
for x in np.arange(23.85, 41.4, 0.8):
    cn = int(0.05 * SR); add(fx, bp(rng.standard_normal(cn), 600, 3000) * env(cn, 0.001, 0.015), x, 0.12)
# whooshes at cuts
for c in [7.5, 9.7, 12.9, 16.0, 18.7, 23.8, 28.5, 33.0, 41.4, 45.3, 47.4, 50.3, 53.9]:
    wn = int(0.8 * SR); wt = np.arange(wn) / SR
    add(fx, bp(rng.standard_normal(wn), 300, 2500) * np.sin(np.pi*wt/0.8)**2, c - 0.4, 0.22)
# van pass-by (7.5-9.7): engine + tyres, peak at ~8.9
def passby(a, b, peak, f0, g):
    n = int((b - a) * SR); tt = np.arange(n) / SR
    d = np.abs(tt - (peak - a)); amp = 1 / (1 + (d * 1.6) ** 2)
    dop = 1 + 0.06 * np.tanh(((peak - a) - tt) * 2)
    ph = 2*np.pi*np.cumsum(f0 * dop) / SR
    eng = np.sin(ph) + 0.5*np.sin(2*ph) + 0.3*np.sin(3.1*ph)
    tyre = bp(rng.standard_normal(n), 300, 3000)
    sig = (lp(eng, 400) * 0.5 + tyre * 0.6) * amp
    sig *= np.clip(np.minimum(tt / 0.2, (b - a - tt) / 0.2), 0, 1)
    add(fx, sig, a, g)
passby(7.5, 9.7, 8.9, 70, 0.35)
# truck on wet road (9.7-12.9): diesel rumble + hiss, tracking camera -> steady
n = int(3.2 * SR); tt = np.arange(n) / SR
ph = 2*np.pi*48*tt; dsl = lp(np.sin(ph) + 0.6*np.sign(np.sin(ph*0.5)) * 0.4, 300)
hiss = bp(rng.standard_normal(n), 1500, 6000)
add(fx, (dsl * 0.5 + hiss * 0.35) * np.clip(np.minimum(tt / 0.2, (3.2 - tt) / 0.2), 0, 1), 9.7, 0.4)
# hub: idling diesel, reverse beeps, air brake at stop (15.5)
n = int(3.1 * SR); tt = np.arange(n) / SR
idle = lp(np.sin(2*np.pi*32*tt) + 0.5*np.sin(2*np.pi*64*tt) + 0.4*rng.standard_normal(n), 220)
add(fx, idle * np.clip(np.minimum(tt / 0.2, (3.1 - tt) / 0.2), 0, 1), 12.9, 0.3)
for x in np.arange(13.0, 15.4, 0.9):
    bn = int(0.45 * SR); bt = np.arange(bn) / SR
    add(fx, np.sin(2*np.pi*1150*bt) * np.clip(np.minimum(bt / 0.01, (0.45 - bt) / 0.01), 0, 1), x, 0.05)
pn = int(0.7 * SR); add(fx, hp(rng.standard_normal(pn), 2500) * env(pn, 0.01, 0.2), 15.5, 0.3)
# unloading belt: motor hum + parcel thumps
fx += (lp(noise, 300) * 0.25 + 0.05*np.sin(2*np.pi*150*t)) * win(16.0, 18.7)
for x in np.arange(16.1, 18.7, 1.15 / 1.1):
    tn = int(0.15 * SR); add(fx, lp(rng.standard_normal(tn), 600) * env(tn, 0.002, 0.03), x, 0.15)
# scanner: laser hum + checkout beep at 20.87
sn = int(0.9 * SR); st = np.arange(sn) / SR
add(fx, np.sin(2*np.pi*880*st) * np.sin(np.pi*st/0.9) * 0.05, 20.0)
bn = int(0.16 * SR); bt = np.arange(bn) / SR
beep = np.sign(np.sin(2*np.pi*2350*bt)) * 0.5 + np.sin(2*np.pi*2350*bt)
beep = lp(beep, 6000) * env(bn, 0.003, 0.2) * np.minimum(1, (0.16 - bt) / 0.02)
add(fx, beep, 20.87, 0.16)
# tilt at 29.9: pneumatic + clack, slide, hollow thud ~31.36, tray return
pn = int(0.35 * SR); add(fx, hp(rng.standard_normal(pn), 3000) * env(pn, 0.01, 0.1), 29.9, 0.25)
cn = int(0.08 * SR); cl = bp(rng.standard_normal(cn), 400, 2500) * env(cn, 0.001, 0.02)
add(fx, cl, 30.12, 0.5)
sl_n = int(1.25 * SR); sl_t = np.arange(sl_n) / SR
add(fx, bp(rng.standard_normal(sl_n), 500, 3500) * np.minimum(1, sl_t/0.3) * np.clip((1.25 - sl_t)/0.3, 0, 1), 30.12, 0.18)
tn = int(0.4 * SR); tt2 = np.arange(tn) / SR
add(fx, (np.sin(2*np.pi*95*tt2) + 0.6*lp(rng.standard_normal(tn), 900)) * env(tn, 0.002, 0.07), 31.36, 0.6)
add(fx, cl, 31.65, 0.3)
# truck 2 pass-by (camera static)
passby(41.4, 45.3, 44.6, 45, 0.5)
# depot: cage rattle + room tone
fx += lp(noise, 400) * 0.12 * win(45.3, 47.4)
rn = int(0.3 * SR); add(fx, bp(rng.standard_normal(rn), 1500, 5000) * env(rn, 0.002, 0.05), 45.8, 0.08)
# night street ambience 47.4-58.5 (distant traffic, light wind)
amb = lp(noise, 500) * 0.12 + bp(np.roll(noise, 9999), 200, 800) * 0.08 * (0.6 + 0.4*np.sin(2*np.pi*0.13*t))
fx += amb * win(47.4, 58.5, 0.5)
fx += amb * win(7.5, 9.7) * 0.6
passby(50.3, 53.9, 50.9, 60, 0.2)
# final scan: laser hum + soft beep
sn = int(2.0 * SR); st = np.arange(sn) / SR
add(fx, np.sin(2*np.pi*880*st) * np.sin(np.pi*st/2.0) * 0.04, 54.4)
add(fx, beep, 56.4, 0.14)
fx *= np.clip((O + 0.8 - t) / 1.0, 0, 1)
# outro (themed: tape peels off, flies and writes the logo, its end becomes the dot)
# tape peel 0.3-0.9: sticky crackle (dense tiny clicks over band-passed noise)
pn = int(0.65 * SR); pt = np.arange(pn) / SR
peel = bp(rng.standard_normal(pn), 1200, 6000) * (0.4 + 0.6*np.sin(np.pi*pt/0.65))
cr = np.zeros(pn)
for k in rng.integers(0, pn - 200, 160): cr[k:k+120] += rng.standard_normal(120) * np.exp(-np.arange(120)/25)
add(fx, (peel * 0.5 + bp(cr, 1500, 8000)) * np.minimum(1, pt/0.03), O + 0.3, 0.28)
# flight whoosh
wn = int(.75 * SR); wt = np.arange(wn) / SR
add(fx, bp(rng.standard_normal(wn), 300, 2600) * np.sin(np.pi*np.clip(wt/.75, 0, 1))**2, O + 0.35, 0.22)
# writing swish 0.95-2.0 (soft, like a marker)
sn_ = int(1.05 * SR); st_ = np.arange(sn_) / SR
sw = bp(rng.standard_normal(sn_), 2500, 7000) * (0.6 + 0.4*np.sin(2*np.pi*7.6*st_)**2) * np.clip(np.minimum(st_/0.08, (1.05 - st_)/0.15), 0, 1)
add(fx, sw, O + 0.95, 0.08)
# dot: soft pop + bell chord
pp = int(.15 * SR); ptt = np.arange(pp) / SR
add(fx, np.sin(2*np.pi*(700 + 500*np.exp(-ptt*40))*ptt) * np.exp(-ptt*35), O + 1.95, 0.25)
cn = int(2.4 * SR); ct = np.arange(cn) / SR
add(fx, sum(np.sin(2*np.pi*mtof(n)*ct) for n in (76, 83, 88)) * np.exp(-ct*1.6) * np.minimum(1, ct/.01), O + 2.0, 0.06)

# ---------------- voice + ducking
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', 'voice.raw'], check=True)
v = np.fromfile('voice.raw', dtype=np.float32).astype(np.float64)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
ve = lp(np.abs(voice), 4)  # envelope
ve = ve / (ve.max() + 1e-9)
duck = 1 - 0.65 * np.clip(ve * 6, 0, 1)  # ~-9 dB under voice
duck = lp(duck, 3)

def norm(x, peak): return x / (np.max(np.abs(x)) + 1e-9) * peak
mus = norm(music, 1.0) * 0.16 * duck
sfx = norm(fx, 1.0) * 0.35 * (1 - 0.35 * np.clip(ve * 6, 0, 1))
vo = norm(voice, 1.0) * 0.9
PFX = os.environ.get('PFX', 'mix4')
for name, mix in [(PFX + '_music.wav', vo + mus + sfx), (PFX + '_fx.wav', vo + sfx)]:
    m = mix / max(1.0, np.max(np.abs(mix)) / 0.95)
    wavfile.write(name, SR, np.stack([m, m], 1).astype(np.float32))
print('ok')
