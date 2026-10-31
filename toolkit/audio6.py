import numpy as np, json, subprocess, os
from scipy.signal import butter, sosfilt
SR = 48000
ev = json.load(open('events6.json')); OFF, DUR, VO = ev['OFF'], ev['dur'], ev['VO']; S, E = ev['S'], ev['E']
N = int(DUR * SR) + 8 * SR
def tt(v): return v + OFF
rng = np.random.default_rng(6)
if os.path.exists('up/voice6.mp3'):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'up/voice6.mp3', '-af', f'adelay={int(OFF*1000)}', '-ar', str(SR), '-ac', '1', '-f', 'f32le', 'voice6.raw'], check=True)
    voice = np.fromfile('voice6.raw', dtype=np.float32)
else:
    voice = np.zeros(N, dtype=np.float32)          # preview without recording
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
def nf(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)

# music: own motif for this video - A minor / F major colour, 74 bpm, piano figure + soft pad + gentle pulse
music = np.zeros(N); beat = 60 / 74; bar = 4 * beat
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]       # Am  F  C  G
mel = [76, 74, 72, 71, 72, 69, 71, 67]
m0 = 0.3; nb = int((tt(VO) - m0) / bar) + 1
for b in range(nb + 1):
    ch = prog[b % 4] if b < nb else prog[0]; st = m0 + b * bar; n0 = int(st * SR); L = int(bar * SR * 1.5); t_ = np.arange(L) / SR
    env = np.minimum(1, t_ / 1.1) * np.exp(-t_ / 4.0)
    music[n0:n0 + L] += sum(np.sin(2 * np.pi * nf(n - 12) * t_ * d) for n in ch for d in (1, 1.003)) * env * .015
    music[n0:n0 + L] += np.sin(2 * np.pi * nf(ch[0] - 24) * t_) * env * .03
    for k in range(4 if b < nb else 1):
        n = [ch[0] + 12, ch[2], ch[1] + 12, ch[2]][k]
        if b % 2 == 1 and k == 2: n = mel[(b // 2) % len(mel)]
        s0 = int((st + k * beat) * SR); Lp = int(1.6 * SR); tp = np.arange(Lp) / SR
        tone = (np.sin(2 * np.pi * nf(n) * tp) + .25 * np.sin(2 * np.pi * nf(n) * 2 * tp) + .08 * np.sin(2 * np.pi * nf(n) * 3 * tp)) * np.exp(-tp * 3.2) * np.minimum(1, tp / .005)
        music[s0:s0 + Lp] += tone * (.034 if k == 0 else .024)
        if k in (0, 2):
            Lk = int(.3 * SR); tk = np.arange(Lk) / SR; music[s0:s0 + Lk] += np.sin(2 * np.pi * 52 * tk) * np.exp(-tk * 14) * .05
music = lp(music, 4800); tm = np.arange(N) / SR
music *= np.clip((tm - m0) / 1.5, 0, 1) * np.clip((DUR - tm) / 1.4, 0, 1)
envv = np.convolve(np.abs(voice), np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
duck = np.convolve(np.where(envv > .01, .55, 1.0), np.ones(int(.3 * SR)) / int(.3 * SR), 'same'); music *= duck

fx = np.zeros(N)
def add(sig, t, g=1):
    s0 = int(t * SR)
    if 0 <= s0 < N: e = min(N, s0 + len(sig)); fx[s0:e] += sig[:e - s0] * g
def whoosh(d=.7, g=.10):
    L = int(d * SR); x = rng.standard_normal(L); t = np.arange(L) / SR; return bp(x, 300, 2600) * np.sin(np.pi * t / d) ** 2 * g
def click(): L = int(.03 * SR); t = np.arange(L) / SR; return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180) * .12
def pop(): L = int(.12 * SR); t = np.arange(L) / SR; return np.sin(2 * np.pi * (700 + 500 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .10
def bass(): L = int(.9 * SR); t = np.arange(L) / SR; f = 45 + 30 * np.exp(-t * 8); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * .45
def chime(): L = int(2.5 * SR); t = np.arange(L) / SR; return sum(np.sin(2 * np.pi * nf(n) * t) * np.exp(-t * 2) for n in (81, 88, 93)) * .03 * np.minimum(1, t / .01)
def clack():
    """metal plate set down: short bright knock + low thud + ring"""
    L = int(.5 * SR); t = np.arange(L) / SR
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((1180, 14), (1730, 18), (2610, 24))) * .05
    knock = hp(rng.standard_normal(L), 1800) * np.exp(-t * 90) * .18
    thud = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 25) * .25
    return (ring + knock + thud) * np.minimum(1, t / .002)
def stamp():
    L = int(.4 * SR); t = np.arange(L) / SR
    return (lp(rng.standard_normal(L), 900) * np.exp(-t * 40) * .5 + np.sin(2 * np.pi * 75 * t) * np.exp(-t * 18) * .4)

# hook: three plates
add(whoosh(.6, .07), tt(-.1)); add(clack(), tt(.4), .9)
add(clack(), tt(ev['zwei'] + .25), .8); add(clack(), tt(ev['drei'] + .25), .8)
add(pop(), tt(ev['k']))
# scene changes
for v in S[1:]: add(whoosh(.9, .075), tt(v) - .3)
# 1956
for k in range(14): add(click(), tt(ev['y1956'] - .4 + k * .07), .45)
add(bass(), tt(ev['y1956'] + .5), .8); add(pop(), tt(ev['juli'] - .1)); add(pop(), tt(ev['brd']), .6)
# names -> codes
for k in range(3): add(pop(), tt(S[3] + .15 + k * (E[3] - S[3] - .4) / 3 + 1.0), .7)
# ~500 chips
for k in range(18): add(click(), tt(S[4] + .3 + k * .06), .3)
add(bass(), tt(ev['t500'] + .1), .6)
# twelve tiles flip in
for k in range(12): add(click(), tt(S[5] + 1.0 + k * .05), .5)
add(clack(), tt(ev['augs']), .6); add(clack(), tt(ev['wupp']), .6)
# 70s: codes vanish (soft drops)
for k in range(12):
    L = int(.25 * SR); t = np.arange(L) / SR
    add(np.sin(2 * np.pi * (500 - 900 * t) * t) * np.exp(-t * 14) * .05, tt(S[7] + 1.2 + k * (E[8] - S[7] - 1.6) / 12))
# 1991
add(bass(), tt(ev['y1991'] + .1), .8)
for k in range(8): add(pop(), tt(ev['laender'] - .3 + k * .09), .35)
# 2012: codes come back
for k in range(24): add(click(), tt(ev['zur'] - .2 + k * (E[11] - ev['zur']) / 24), .35)
add(bass(), tt(ev['t300'] + .1), .6)
# 2015: move to Hamburg
add(bass(), tt(ev['y2015'] + .1), .5); add(whoosh(1.4, .07), tt(ev['umzug'])); add(pop(), tt(ev['hh']))
# hero plate + registration stamp
add(clack(), tt(S[14] + 1.0), .9); add(stamp(), tt(ev['zug'] + .05), .7); add(pop(), tt(ev['steht']), .6)
# outro: plate turns, logo
add(whoosh(.8, .09), tt(VO)); add(clack(), tt(VO + .95), .7); add(bass(), tt(VO + 1.6), .6); add(chime(), tt(VO + 1.8))
def write(name, sig):
    sig = sig[:int(DUR * SR)]; sig = sig / max(1e-6, np.max(np.abs(sig))) * .9; sig.astype(np.float32).tofile(name + '.raw')
write('mix6_music', voice + music * .9 + fx); write('mix6_fx', voice + fx); print('ok', 'voice' if ev['voice'] else 'ohne Stimme')
