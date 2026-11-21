#!/bin/sh
# render one 120-frame chunk, retry until all frames exist
c=$1; e=$((c+120)); T=${TOTAL:-2310}; [ $e -gt $T ] && e=$T
for try in 1 2 3 4; do
  n=0; for i in $(seq $c $((e-1))); do [ -s "$(printf 'fr/f%05d.jpg' $i)" ] && n=$((n+1)); done
  [ $n -eq $((e-c)) ] && exit 0
  timeout 3600 node render.mjs $c $e fr >/dev/null 2>&1
done
