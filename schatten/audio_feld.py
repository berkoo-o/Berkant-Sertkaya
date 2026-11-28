# Ton für „A und B haben exakt dieselbe Farbe“: python3 audio_feld.py  (im Ordner schatten/)  → mix_feld_music.flac, mix_feld_fx.flac
# Die Zeiten unten sind Videozeiten aus src/feld.js; V() rechnet sie in Stimm-Zeiten um (die Stimme beginnt bei 0,15 s). Liste der Sounds in SOUNDS.md.
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'kit'))
from mix import Mix, snd, cut, rate, SR, VO
V = lambda t: t - VO
OUT0, END = 35.3, 38.4
m = Mix(V(OUT0), V(END))
ep = lambda n: snd('schatten/sfx/epidemic/' + n + '.48k.wav')
# the red frames around A and B pop in on the words „A“ and „B“
m.pop(V(0.88), 0.06, 1.05); m.pop(V(1.48), 0.06, 1.2)
# pipette readout, proof bar, mask
m.click(V(7.62), 0.07, 0); m.click(V(7.88), 0.06, 1)
m.add(cut(ep('swipe'), 0.0, 0.8, 0.003, 0.2), V(12.05), 0.22)
m.click(V(16.5), 0.07, 2)
# camera to the lamp, back to the front, the cylinder lifts, camera to the whole studio, the cylinder is put back
m.whoosh(V(21.4), 0.1, 0); m.whoosh(V(28.0), 0.09, 1); m.whoosh(V(29.35), 0.07, 0); m.whoosh(V(32.2), 0.08, 1)
m.add(cut(ep('place'), 0.0, 0.5, 0.002, 0.15), V(33.78), 0.3)
m.outro()
m.write('feld')
# a little louder (the voice has strong peaks, loudnorm alone stops at about -16 LUFS): +1.4 dB into a limiter at -2.2 dBFS (true peak about -1.4)
import subprocess
for k in ('music', 'fx'):
    f = f'mix_feld_{k}.flac'; subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f, '-af', 'volume=1.4dB,alimiter=limit=0.78:attack=3:release=60:level=false', '-ar', '48000', '-c:a', 'flac', '-sample_fmt', 's32', '/tmp/_feld.flac'], check=True); os.replace('/tmp/_feld.flac', f)
