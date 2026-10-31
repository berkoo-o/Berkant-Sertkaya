# function. Toolkit

Code aller bisherigen function.-Videos (Skia + ffmpeg + numpy). Im neuen Chat hochladen und entpacken.

## Einrichtung
    pip install skia-python --break-system-packages
    mkdir -p up    # MP3-Aufnahmen hier ablegen (voice.mp3, up/voice2.mp3 ...)

## Aufbau
- render.py   TÜV-Plakette. Basis: Farben, Schrift, Easing, 3D-Projektion (pmat), Pillen, Untertitel (Karaoke), Quellenzeile, Logo, Outro mit Partikeln
- render2.py  Umweltplakette Version 1 (Daten, Wortzeiten, Deutschlandkarte DE + Städte)
- render3.py  Umweltplakette final: Atmosphäre (Partikel, Bokeh, Bodengitter), Überschrift Wort für Wort, Zählwerk, Bursts, Plakette mit Glanz/Flip, Auto-Seitenansicht, Schild, Tacho
- render4.py  Autobahnnummern: Schilder (Zeichen 405), Karte mit geglätteten Strecken, Schilderwand, Auto-Front, Übergänge per Objekt, München-Zoom
- render5.py  Benzinpreis: Flüssigkeitszylinder mit Wellen, Tinte, Licht; Zapfsäule mit Fallblatt-Anzeige; Tropfen-Outro
- audio*.py   Musik, Effekte, Mix (je Video)
- cover*.py   Cover

## Ablauf je Video
1. Stimme analysieren: ffmpeg -i up/voiceX.mp3 -af silencedetect=noise=-40dB:d=0.12 -f null -
2. SEGS (Start, Ende, Satz) im Renderskript eintragen; Wortzeiten werden automatisch verteilt und an Pausen ausgerichtet.
3. Testbilder: python3 renderX.py test 1.0,5.0,... und Kontaktbogen prüfen (Überschneidungen!).
4. python3 renderX.py events; python3 audioX.py
5. Render im Hintergrund: setsid nohup python3 renderX.py video 0 N out.mp4 > log 2>&1 &
6. Muxen: ffmpeg -i out.mp4 -f f32le -ar 48000 -ac 1 -i mixX_music.raw -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11,volume=1.9dB,alimiter=limit=0.84:level=false" -c:a aac -b:a 192k -ac 2 -shortest -movflags +faststart final.mp4
