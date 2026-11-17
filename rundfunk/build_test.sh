#!/bin/sh
# frames + both mixes -> test videos and contact sheet: ./build_test.sh a|b  (after rendering and audio_test.py)
set -e
v=$1; [ $v = a ] && { nf=531; name=Test_A_Diorama; } || { nf=540; name=Test_B_Studio; }
n=$(ls $v/fr | wc -l); [ "$n" -eq $nf ] || { echo "frames missing: $n/$nf"; exit 1; }
ffmpeg -loglevel error -y -framerate 30 -start_number 0 -i $v/fr/f%05d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart $v/video.mp4
for m in music:mit_Musik fx:nur_Effekte; do
  ffmpeg -loglevel error -y -i $v/video.mp4 -i $v/mix_${m%%:*}.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart Rundfunk_${name}_${m##*:}.mp4
done
ffmpeg -loglevel error -y -i $v/video.mp4 -vf "select='not(mod(n\,30))',scale=216:384,tile=6x3" -frames:v 1 -vsync 0 -q:v 3 Kontaktbogen_${name}.jpg
rm $v/video.mp4; ls -la Rundfunk_${name}_*.mp4 Kontaktbogen_${name}.jpg
