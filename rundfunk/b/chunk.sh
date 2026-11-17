#!/bin/sh
# render one 120-frame chunk, retry until all frames exist
c=$1; e=$((c+120)); [ $e -gt 540 ] && e=540
for try in 1 2 3 4; do
  n=0; for i in $(seq $c $((e-1))); do [ -s "$(printf 'fr/f%05d.jpg' $i)" ] && n=$((n+1)); done
  [ $n -eq $((e-c)) ] && exit 0
  PAGE=scene.html timeout 2400 node render.mjs $c $e fr >/dev/null 2>&1
done
