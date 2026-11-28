# Ton für „Was kostet ein Kind, bis es 18 ist?“ (Kinderzimmer, Looks 2 und 3): python3 audio_kind.py  (im Ordner kind/)  → mix_kind_music.flac, mix_kind_fx.flac
# Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 1); im Video beginnt die Stimme bei 0,15 s. Liste der Sounds in SOUNDS.md.
import sys, os, subprocess; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'kit'))
from mix import Mix, snd, cut, rate, SR, VO
OUT, END_V = 38.75, 42.5
m = Mix(OUT, END_V)
sz = lambda n: snd('jahr2027/sfx/soundza/' + n + '.48k.wav'); rf = lambda n: snd('rundfunk/sfx/epidemic/' + n + '.48k.wav')
# the mobile over the crib turns: one soft chime at the start
m.add(cut(sz('glock'), 0.0, 1.6, 0.005, 0.8), 0.25, 0.045)
# camera: out of the close-up, to the labels, back to the room
m.whoosh(1.7, 0.06, 0); m.whoosh(14.5, 0.06, 1); m.whoosh(35.5, 0.06, 0)
# the room changes with the age (one whoosh per change), the time-lapse runs through all ages
for k, c in enumerate((8.45, 10.65, 17.6)): m.whoosh(c, 0.09, k)
m.add(cut(sz('page_flips'), 0.0, 1.2, 0.01, 0.4), 18.0, 0.05); m.whoosh(19.15, 0.05, 1); m.whoosh(20.35, 0.05, 0)
# the monthly amounts and the labels for housing, food and clothes
for k, at in enumerate((6.45, 9.95, 12.55)): m.click(at, 0.06, k)
for at, r in ((15.62, 0.95), (16.22, 1.05), (16.66, 1.15)): m.pop(at, 0.05, r)
# the counter reaches 174.000 €, then jumps to today's prices, the Kindergeld letter lands on the bed, 26 %
m.add(cut(rf('coin_single'), 0.0, 0.8, 0.002, 0.3), 21.15, 0.06); m.click(28.45, 0.07, 1); m.add(cut(rf('coin_single'), 0.0, 0.8, 0.002, 0.3), 28.47, 0.05)
m.add(cut(sz('envelope'), 0.0, 0.7, 0.003, 0.2), 31.15, 0.12); m.click(33.65, 0.06, 2)
m.outro()
m.write('kind')
# a little louder, like the last videos: +1.4 dB into a limiter (true peak about -1.4 dBFS)
for k in ('music', 'fx'):
    f = f'mix_kind_{k}.flac'; subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f, '-af', 'volume=1.4dB,alimiter=limit=0.78:attack=3:release=60:level=false', '-ar', '48000', '-c:a', 'flac', '-sample_fmt', 's32', '/tmp/_kind.flac'], check=True); os.replace('/tmp/_kind.flac', f)
