# Ton für „3.000 € brutto: So viel bleibt dir“ (Knete): python3 audio_brutto.py  (im Ordner brutto/)  → mix_brutto_music.flac, mix_brutto_fx.flac
# Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 2); im Video beginnt die Stimme bei 0,15 s. Liste der Sounds in SOUNDS.md.
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'kit'))
from mix import Mix, snd, cut, rate, hp, lp, SR, VO
OUT, END_V = 38.75, 42.5
m = Mix(OUT, END_V)
sz = lambda n: snd('jahr2027/sfx/soundza/' + n + '.48k.wav'); rf = lambda n: snd('rundfunk/sfx/epidemic/' + n + '.48k.wav'); vm = lambda n: snd('vermoegen/sfx/epidemic/' + n + '.48k.wav')
# hook: the tower with its price, the net part, the question mark
m.pop(0.2, 0.09, 0.9); m.add(cut(rf('coin_single'), 0.0, 0.8, 0.002, 0.3), 0.3, 0.06)
m.pop(5.9, 0.08, 1.0); m.click(5.85, 0.08, 0)
m.pop(7.6, 0.09, 1.15)
# camera moves
for k, c in enumerate((8.75, 13.6, 32.0, 35.7)): m.whoosh(c, 0.11, k)
# pay slip lines
m.add(cut(sz('paper3'), 0.0, 0.7, 0.005, 0.2), 9.0, 0.05)
for k, at in enumerate((9.2, 10.8, 11.96)): m.click(at, 0.06, k)
# the cart rolls to the houses
m.add(lp(cut(vm('rumble'), 0.0, 1.6, 0.2, 0.5), 900), 12.95, 0.05)
# the boss's part: label, flight, the four houses bounce
m.pop(13.45, 0.07, 1.0); m.whoosh(15.3, 0.06, 1); m.pop(16.2, 0.06, 0.85); m.pop(16.32, 0.05, 1.0)
# each slice flies into its house; a coin into the box only for the first and for the tax office
m.add(cut(sz('coin_box'), 0.0, 0.9, 0.002, 0.3), 20.55, 0.06)
for at, r in ((23.6, 1.0), (25.8, 1.1), (27.6, 1.2)): m.pop(at, 0.06, r)
m.add(cut(sz('coin_box'), 0.0, 0.9, 0.002, 0.3), 31.25, 0.07)
for k, at in enumerate((19.5, 22.6, 24.84, 26.4, 29.3)): m.click(at, 0.05, k + 1)
# what is left
m.pop(32.15, 0.09, 0.9); m.click(32.05, 0.07, 2)
m.pop(35.55, 0.1, 0.95)
m.outro()
m.write('brutto')
