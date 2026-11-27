# Ton für „Diese Reihenfolge gab es noch nie“ (Spieltisch Noir): python3 audio_karten.py  (im Ordner karten/)  → mix_karten_music.flac, mix_karten_fx.flac
# Die Zeiten unten sind Videozeiten aus src/noir.js; V() rechnet sie in Stimm-Zeiten um (die Stimme beginnt bei 0,15 s). Liste der Sounds in SOUNDS.md.
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'kit'))
from mix import Mix, snd, cut, rate, SR, VO
V = lambda t: t - VO
OUT0, END = 41.0, 44.1
m = Mix(V(OUT0), V(END))
ep = lambda n: snd('karten/sfx/epidemic/' + n + '.48k.wav')
# hook: riffle (1.15–2.55), squaring tap, bridge cascade, the deck lands face up, the fan spreads out
m.add(cut(ep('riffle'), 0.09, 1.3, 0.004, 0.15), V(1.12), 0.5)
m.add(cut(ep('tap'), 0.4, 0.2, 0.002, 0.08), V(3.08), 0.32)
m.add(cut(ep('shuffle_fast'), 0.45, 0.32, 0.004, 0.1), V(3.6), 0.26)
m.add(cut(ep('tap'), 1.77, 0.2, 0.002, 0.08), V(4.92), 0.26)
m.add(cut(ep('spread'), 0.05, 1.6, 0.01, 0.4), V(5.0), 0.36)
# camera moves between the stations
for k, c in enumerate((8.95, 14.9, 20.6, 30.65, 38.1)): m.whoosh(V(c), 0.1 if k < 4 else 0.09, k)
# split-flap board: the 68 digits roll in, the switch to the thought experiment, the counter, „DOPPELT: 0“
m.add(cut(ep('flap'), 0.0, 2.4, 0.01, 0.6), V(9.9), 0.17)
m.add(cut(ep('flap'), 2.5, 0.9, 0.01, 0.3), V(21.0), 0.14)
m.add(cut(ep('flap'), 3.4, 3.2, 0.01, 0.9), V(22.0), 0.11)
m.add(cut(ep('flap'), 1.0, 0.6, 0.01, 0.25), V(27.6), 0.11)
m.click(V(28.62), 0.07, 1)
# the second deck is riffled seven times (only the riffle itself makes a sound); the counter clicks once when it reaches 7
BURSTS = [('shuffle_x4', 0.19, 0.55), ('shuffle_fast', 0.47, 0.3), ('shuffle_x4', 1.4, 0.4), ('shuffle_fast', 0.86, 0.3), ('shuffle_x4', 2.88, 0.34), ('shuffle_fast', 1.23, 0.32), ('shuffle_x4', 4.16, 0.32)]
s = 31.2
for k in range(7):
    d = 1.1 if k == 0 else 0.72; a = s + (1.15 - 0.35) / 2.85 * d; n, c0, ln = BURSTS[k]
    m.add(cut(ep(n), c0, ln, 0.004, 0.08), V(a - 0.02), 0.3 if k == 0 else 0.24)
    if k == 6: m.click(V(s + d * 0.982), 0.08, 2)
    s += 1.1 if k == 0 else 0.75
m.outro()
m.write('karten')
