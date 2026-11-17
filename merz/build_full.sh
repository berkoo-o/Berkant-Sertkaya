#!/bin/sh
# frames + both mixes -> final videos and contact sheet: ./build_full.sh  (after rendering full/fr and python3 audio_full.py)
set -e
nf=1316; name=Merz_unbeliebtester_Kanzler_v2
n=$(ls full/fr | wc -l); [ "$n" -eq $nf ] || { echo "frames missing: $n/$nf"; exit 1; }
ffmpeg -loglevel error -y -framerate 30 -start_number 0 -i full/fr/f%05d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart full/video.mp4
for m in music:mit_Musik fx:nur_Effekte; do
  ffmpeg -loglevel error -y -i full/video.mp4 -i full/mix_${m%%:*}.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart ${name}_${m##*:}.mp4
done
ffmpeg -loglevel error -y -i full/video.mp4 -vf "select='not(mod(n\,30))',scale=216:384,tile=9x5" -frames:v 1 -vsync 0 -q:v 3 Kontaktbogen_${name}.jpg
rm full/video.mp4; ls -la ${name}_*.mp4 Kontaktbogen_${name}.jpg
