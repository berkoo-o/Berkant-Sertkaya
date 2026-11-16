#!/bin/sh
# frames + both mixes -> the two final videos and the contact sheet (run after rendering and audio_modell.py)
set -e
n=$(ls fr | wc -l); [ "$n" -eq 1830 ] || { echo "frames missing: $n/1830"; exit 1; }
ffmpeg -loglevel error -y -framerate 30 -start_number 0 -i fr/f%05d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart video.mp4
for v in music:mit_Musik fx:nur_Effekte; do
  ffmpeg -loglevel error -y -i video.mp4 -i mix_${v%%:*}.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart ../Der_Strom_${v##*:}.mp4
done
ffmpeg -loglevel error -y -i video.mp4 -vf "select='not(mod(n\,30))',scale=216:384,tile=10x7" -frames:v 1 -vsync 0 -q:v 3 ../Kontaktbogen_Final.jpg
rm video.mp4; ls -la ../Der_Strom_*.mp4 ../Kontaktbogen_Final.jpg
