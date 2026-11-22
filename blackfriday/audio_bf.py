# Ton für „Black Friday: Sind die Rabatte echt?“ (Knete): python3 audio_bf.py  (im Ordner blackfriday/)  → mix_bf_music.flac, mix_bf_fx.flac
# Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 1); im Video beginnt die Stimme bei 0,15 s. Liste der Sounds in SOUNDS.md.
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'kit'))
from mix import Mix, snd, cut, rate, hp, lp, SR, VO
import numpy as np
OUT, END_V = 36.6, 40.4
m = Mix(OUT, END_V)
sz = lambda n: snd('jahr2027/sfx/soundza/' + n + '.48k.wav'); bf = lambda n: snd('blackfriday/sfx/epidemic/' + n + '.48k.wav')
# hook: the sale sign pops up with a cash register, flips to -8 %
m.pop(0.25, 0.1, 0.9); m.add(cut(bf('kaching'), 0.0, 1.2, 0.002, 0.3), 0.32, 0.11)
m.add(cut(sz('card_flip'), 0.0, 0.5, 0.002, 0.1), 4.6, 0.09); m.click(4.8, 0.09, 0)
# camera moves between the stations
for k, c in enumerate((6.1, 11.45, 20.45, 29.5, 32.6)): m.whoosh(c, 0.12 if k < 4 else 0.1, k)
# big numbers
for k, at in enumerate((9.1, 11.5, 15.6, 25.35, 27.85)): m.click(at, 0.07, k + 1)
# shelf fills with 100 products
for k in range(4): m.pop(9.15 + k * 0.25, 0.045, 0.9 + k * 0.1)
m.add(rate(cut(sz('shimmer'), 0.0, 1.2, 0.01, 0.5), 1.1), 9.3, 0.04)
# price tags flip, the price curve is drawn, dots pop
m.add(cut(sz('card_flip'), 0.0, 0.5, 0.002, 0.1), 12.0, 0.05); m.add(cut(sz('card_flip'), 0.0, 0.5, 0.002, 0.1), 12.64, 0.045)
m.add(cut(sz('marker_scratch'), 0.0, 1.4, 0.05, 0.4), 15.8, 0.035)
m.pop(16.5, 0.08, 0.85); m.pop(18.3, 0.055, 1.1); m.pop(18.6, 0.055, 1.2)
# TV: red tag swings in, the bars rise, the red arrow, the UVP fades
m.pop(20.3, 0.08, 0.9)
for k, at in enumerate((23.5, 24.3, 25.4)): m.pop(at + 0.15, 0.05, 0.8 + 0.12 * k)
m.whoosh(27.0, 0.06, 1); m.pop(27.45, 0.07, 1.0)
# phone: the price history is drawn, the lowest price pops
m.add(cut(sz('pencil_scratch2'), 0.0, 1.3, 0.05, 0.4), 29.95, 0.03); m.pop(31.4, 0.07, 1.15); m.click(31.45, 0.05, 2)
# the speech bubble
m.pop(33.0, 0.1, 0.95)
m.outro()
# a quiet shopping-mall bed under everything (bright part only, so it does not muddy the voice)
N = m.N; bed = hp(bf('mall')[int(5 * SR):int(5 * SR) + N], 300); bed = np.pad(bed, (0, N - len(bed)))
t = m.t; bed = bed * np.clip(t / 1.0, 0, 1) * np.clip((OUT + VO + 0.3 - t) / 1.2, 0, 1) * 0.022
m.write('bf', bed=bed)
