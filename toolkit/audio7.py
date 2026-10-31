import numpy as np, json, subprocess, os
from scipy.signal import butter, sosfilt
SR = 48000
ev = json.load(open('events7.json')); OFF, DUR, VO = ev['OFF'], ev['dur'], ev['VO']; S, E = ev['S'], ev['E']
N = int(DUR * SR) + 8 * SR
def tt(v): return v + OFF
rng = np.random.default_rng(7)
if os.path.exists('up/voice7.mp3'):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'up/voice7.mp3', '-af', f'adelay={int(OFF*1000)}', '-ar', str(SR), '-ac', '1', '-f', 'f32le', 'voice7.raw'], check=True)
    voice = np.fromfile('voice7.raw', dtype=np.float32)
else:
    voice = np.zeros(N, dtype=np.float32)          # preview without recording
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
def nf(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)

# music: own motif - E minor / G, 68 bpm, flowing 8th arpeggio like running water, warm pad, soft pulse
music = np.zeros(N); beat = 60 / 68; bar = 4 * beat
prog = [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]]       # Em  C  G  D
m0 = 0.2; nb = int((tt(VO) - m0) / bar) + 1
for b in range(nb + 1):
    ch = prog[b % 4] if b < nb else prog[0]; st = m0 + b * bar; n0 = int(st * SR); L = int(bar * SR * 1.6); t_ = np.arange(L) / SR
    env = np.minimum(1, t_ / 1.3) * np.exp(-t_ / 4.5)
    music[n0:n0 + L] += sum(np.sin(2 * np.pi * nf(n) * t_ * d) for n in ch for d in (1, 1.003)) * env * .013
    music[n0:n0 + L] += np.sin(2 * np.pi * nf(ch[0] - 24) * t_) * env * .03
    for k in range(8 if b < nb else 1):
        n = [ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1] + 12, ch[2] + 12, ch[1]][k] + 12
        s0 = int((st + k * beat / 2) * SR); Lp = int(1.2 * SR); tp = np.arange(Lp) / SR
        tone = (np.sin(2 * np.pi * nf(n) * tp) + .2 * np.sin(2 * np.pi * nf(n) * 2 * tp)) * np.exp(-tp * 4) * np.minimum(1, tp / .006)
        music[s0:s0 + Lp] += tone * (.026 if k % 2 == 0 else .018)
        if k in (0, 4):
            Lk = int(.3 * SR); tk = np.arange(Lk) / SR; music[s0:s0 + Lk] += np.sin(2 * np.pi * 48 * tk) * np.exp(-tk * 14) * .045
music = lp(music, 5200); tm = np.arange(N) / SR
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
def chime(): L = int(2.5 * SR); t = np.arange(L) / SR; return sum(np.sin(2 * np.pi * nf(n) * t) * np.exp(-t * 2) for n in (76, 83, 88)) * .03 * np.minimum(1, t / .01)
def droplet(f0=900):
    """water drop: fast rising sine 'blip' + tiny splash"""
    L = int(.25 * SR); t = np.arange(L) / SR
    f = f0 + 1400 * (1 - np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * .2 + hp(rng.standard_normal(L), 3000) * np.exp(-t * 50) * .04
def trickle(d):
    """running water: band-passed noise with bubbly amplitude"""
    L = int(d * SR); t = np.arange(L) / SR; x = bp(rng.standard_normal(L), 600, 4200)
    am = .55 + .45 * np.abs(np.sin(2 * np.pi * 9 * t + 3 * np.sin(2 * np.pi * .7 * t)))
    return x * am * np.clip(t / .3, 0, 1) * np.clip((d - t) / .5, 0, 1) * .035
def bubbles(d):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 7)):
        b = droplet(rng.uniform(500, 1100)) * .4; s0 = int(rng.uniform(0, d - .3) * SR); out[s0:s0 + len(b)] += b
    return out
def gate():
    """lock gate: low metallic clunk"""
    L = int(.7 * SR); t = np.arange(L) / SR
    return (np.sin(2 * np.pi * 70 * t) * np.exp(-t * 9) * .4 + sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 12) for f in (310, 470)) * .05
            + lp(rng.standard_normal(L), 600) * np.exp(-t * 30) * .3)

# hook: drop falls, hits the crest, two streams
add(whoosh(.5, .05), tt(ev['kann'] - .7)); add(droplet(), tt(ev['kann'])); add(bass(), tt(ev['kann']), .4)
add(trickle(3.5), tt(ev['kann'] + .1), .9)
add(bass(), tt(ev['linie'] + .1), .5)
for k in range(10): add(click(), tt(ev['linie'] + k * .12), .25)
# scene changes
for v in [S[3], S[6], S[8], S[12], S[13]]: add(whoosh(.9, .08), tt(v) - .3)
# watershed draws across the map, region pops
for k in ('allg', 'schw', 'alb', 'ficht'): add(pop(), tt(ev[k]), .6)
add(trickle(2.0), tt(ev['rhein']), .6); add(trickle(2.0), tt(ev['donau']), .6)
for k in range(14): add(click(), tt(ev['t2800'] - .2 + k * .075), .4)
add(bass(), tt(ev['t2800'] + .9), .7)
# zoom into Furtwangen, springs
add(whoosh(1.1, .08), tt(S[6] - .2))
add(droplet(1000), tt(ev['quell'])); add(droplet(1200), tt(ev['quell'] + .15))
add(trickle(1.8), tt(ev['breg']), .7); add(trickle(1.8), tt(ev['elz']), .7)
# seeping, underground flow, spring
for k in range(10): add(droplet(rng.uniform(700, 1100)), tt(ev['vers'] + k * .22), .5)
L = int(5 * SR); t = np.arange(L) / SR
add(lp(rng.standard_normal(L), 400) * np.clip(t / 1, 0, 1) * np.clip((5 - t) / 1, 0, 1) * .05, tt(S[10]))
add(bubbles(3.5), tt(S[10] + 1.6), .7)
for k in range(12): add(click(), tt(ev['t1877'] - .4 + k * .07), .4)
add(bass(), tt(ev['t1877'] + .5), .7)
# canal: lock gates while the ship climbs
for k in range(6): add(gate(), tt(S[12] + .4 + k * (E[12] - S[12]) / 6), .5)
add(bass(), tt(ev['t406'] + .7), .6)
# summary drop + outro
add(droplet(), tt(S[13] + 1.0)); add(trickle(2.5), tt(S[13] + 1.1), .7)
add(droplet(800), tt(VO + .9)); add(bass(), tt(VO + .9), .6); add(whoosh(.8, .06), tt(VO + .95)); add(chime(), tt(VO + 1.4))
def write(name, sig):
    sig = sig[:int(DUR * SR)]; sig = sig / max(1e-6, np.max(np.abs(sig))) * .9; sig.astype(np.float32).tofile(name + '.raw')
write('mix7_music', voice + music * .9 + fx); write('mix7_fx', voice + fx); print('ok', 'voice' if ev['voice'] else 'ohne Stimme')
