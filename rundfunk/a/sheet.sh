#!/bin/sh
# usage: sheet.sh outdir name f1 f2 f3 ...  -> renders stills and tiles them 3 per row at half size
d=$1; n=$2; shift 2
mkdir -p $d
PAGE=${PAGE:-modell.html} node stills.mjs $d "$@" 2>&1 | grep -v "^$" | head -5
ins=""; for f in "$@"; do ins="$ins -i $d/$(printf 'f%05d.jpg' $f)"; done
cnt=$#; cols=3; [ $cnt -lt 3 ] && cols=$cnt
ffmpeg -loglevel error -y $ins -filter_complex "concat=n=$cnt:v=1:a=0,scale=540:960,tile=${cols}x$(( (cnt+cols-1)/cols ))" -frames:v 1 -q:v 3 $d/$n.jpg
