#!/bin/sh
# frames + both mixes -> final videos, contact sheet and the upload version with the cover: ./build.sh  (after rendering fr/ and python3 audio.py)
set -e
nf=2240; name=Was_aendert_sich_2027
n=$(ls fr | wc -l); [ "$n" -eq $nf ] || { echo "frames missing: $n/$nf"; exit 1; }
ffmpeg -loglevel error -y -framerate 30 -start_number 0 -i fr/f%05d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart video.mp4
for m in music:mit_Musik fx:nur_Effekte; do
  ffmpeg -loglevel error -y -i video.mp4 -i mix_${m%%:*}.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart ${name}_${m##*:}.mp4
done
ffmpeg -loglevel error -y -i video.mp4 -vf "select='not(mod(n\,45))',scale=216:384,tile=9x6" -frames:v 1 -vsync 0 -q:v 3 Kontaktbogen_${name}.jpg
# upload version: the cover as a 0.2 s still in front of the video
ffmpeg -loglevel error -y -loop 1 -t 0.2 -framerate 30 -i social/Thumbnail_2027_9x16.png -f lavfi -t 0.2 -i anullsrc=r=48000:cl=stereo -i ${name}_mit_Musik.mp4 \
  -filter_complex "[0:v]scale=1080:1920,format=yuv420p,setsar=1[c];[2:v]setsar=1[v];[c][1:a][v][2:a]concat=n=2:v=1:a=1[vo][ao]" -map "[vo]" -map "[ao]" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart social/${name}_Upload_mit_Cover.mp4
rm video.mp4; ls -la ${name}_*.mp4 Kontaktbogen_${name}.jpg social/${name}_Upload_mit_Cover.mp4
