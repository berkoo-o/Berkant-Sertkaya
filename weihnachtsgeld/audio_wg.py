# Ton für „Weihnachtsgeld: Warum bleibt davon so wenig?“ (Knete): python3 audio_wg.py  (im Ordner weihnachtsgeld/)  → mix_wg_music.flac, mix_wg_fx.flac
# Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 1); im Video beginnt die Stimme bei 0,15 s. Liste der Sounds in SOUNDS.md.
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'kit'))
from mix import Mix, snd, cut, rate, hp, lp, SR, VO
OUT, END_V = 39.3, 43.05
m = Mix(OUT, END_V)
sz = lambda n: snd('jahr2027/sfx/soundza/' + n + '.48k.wav'); rf = lambda n: snd('rundfunk/sfx/epidemic/' + n + '.48k.wav')
# hook: the envelope wobbles, the card slides out, it tips over to 1.684 € and settles
m.add(cut(sz('paper3'), 0.0, 0.7, 0.005, 0.2), 0.05, 0.05)
m.add(cut(sz('card_flip'), 0.0, 0.5, 0.002, 0.1), 3.85, 0.08); m.click(4.45, 0.08, 0)
# camera moves
for k, c in enumerate((5.0, 8.2, 11.0, 12.9, 30.4, 35.8)): m.whoosh(c, 0.1 if k < 5 else 0.09, k)
# gifts: a few soft pops only on the first and the last of each group
for at, r in ((8.7, 0.95), (9.82, 1.05), (11.1, 0.95), (11.76, 1.05)): m.pop(at, 0.05, r)
# towers and labels
m.pop(12.75, 0.07, 0.85); m.pop(12.9, 0.06, 0.95)
m.add(cut(rf('coin_single'), 0.0, 0.8, 0.002, 0.3), 18.0, 0.06); m.add(cut(rf('coin_single'), 0.0, 0.8, 0.002, 0.3), 21.85, 0.055)
for k, at in enumerate((16.2, 19.72, 23.0, 25.1)): m.click(at, 0.05, k + 1)
m.pop(22.15, 0.08, 0.8); m.click(22.2, 0.06, 1); m.pop(23.15, 0.05, 1.0); m.pop(27.8, 0.06, 1.1); m.pop(29.2, 0.05, 0.9)
# twelve months stack up (one soft roll), the red bonus drops on top, 28 %
m.add(cut(sz('paper3'), 0.0, 0.6, 0.005, 0.2), 30.6, 0.035); m.pop(32.45, 0.08, 0.8); m.pop(32.6, 0.04, 1.2); m.click(34.2, 0.07, 2); m.pop(34.25, 0.06, 1.15)
m.pop(35.9, 0.1, 0.95)
m.outro()
m.write('wg')
