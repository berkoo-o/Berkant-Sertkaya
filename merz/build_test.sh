#!/bin/sh
# frames + both mixes -> test videos and contact sheet: ./build_test.sh  (after rendering test/fr and python3 audio_merz.py)
set -e
nf=476; name=Merz_Test_16s
n=$(ls test/fr | wc -l); [ "$n" -eq $nf ] || { echo "frames missing: $n/$nf"; exit 1; }
ffmpeg -loglevel error -y -framerate 30 -start_number 0 -i test/fr/f%05d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart test/video.mp4
for m in music:mit_Musik fx:nur_Effekte; do
  ffmpeg -loglevel error -y -i test/video.mp4 -i test/mix_${m%%:*}.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart ${name}_${m##*:}.mp4
done
ffmpeg -loglevel error -y -i test/video.mp4 -vf "select='not(mod(n\,30))',scale=216:384,tile=8x2" -frames:v 1 -vsync 0 -q:v 3 Kontaktbogen_${name}.jpg
rm test/video.mp4; ls -la ${name}_*.mp4 Kontaktbogen_${name}.jpg
