#!/bin/bash
# technical gate + review sheets for a rendered film
set -e
F=$1; O=${2:-qa}; mkdir -p $O
ffprobe -v error -count_frames -show_entries stream=codec_type,width,height,r_frame_rate,nb_read_frames,pix_fmt,color_space,sample_rate,channels -show_entries format=duration -of compact "$F"
ffmpeg -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|LRA:|Peak:" | tail -3
ffmpeg -v error -y -i "$F" -vf "fps=2,scale=384:-1,tile=10x10" -frames:v 1 $O/sheet_2fps.png
for c in 15.0 21.0 22.0 23.5 42.0 45.0 47.0; do
  n=$(python3 -c "print(round($c*30))")
  ffmpeg -v error -y -i "$F" -vf "select='between(n\,$((n-6))\,$((n+5)))',scale=320:-1,tile=6x2" -fps_mode vfr -frames:v 1 $O/cut_$c.png
done
ffmpeg -v error -y -ss 0 -i "$F" -frames:v 1 $O/first.png; ffmpeg -v error -y -sseof -0.04 -i "$F" -frames:v 1 $O/last.png
echo ok
