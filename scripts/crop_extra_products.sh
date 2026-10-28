#!/usr/bin/env bash
# Gera os produtos 9–12 a partir de recortes das fotos-fonte (mesmas sessões de foto).
# Uso: bash scripts/crop_extra_products.sh   (requer ffmpeg com libaom-av1 e libwebp)
set -euo pipefail
cd "$(dirname "$0")/.."
out=public/media
crop() { # nome fonte w h x y
  local name=$1 src=$2 w=$3 h=$4 x=$5 y=$6
  local vf="crop=$w:$h:$x:$y,scale=800:1000:flags=lanczos"
  ffmpeg -v error -y -i "sources/$src.png" -vf "$vf" -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 30 -b:v 0 -cpu-used 6 -pix_fmt yuv420p "$out/$name.avif"
  ffmpeg -v error -y -i "sources/$src.png" -vf "$vf" -frames:v 1 -c:v libwebp -quality 80 "$out/$name.webp"
}
crop prod-09-a prod-03-a 520 650 315 60
crop prod-09-b prod-03-b 800 1000 200 0
crop prod-10-a prod-06-a 520 650 300 100
crop prod-10-b prod-06-b 800 1000 160 0
crop prod-11-a prod-08-a 640 800 220 520
crop prod-11-b prod-08-b 680 850 200 552
crop prod-12-a lookbook-full 1122 1402 0 0
crop prod-12-b lookbook-full 600 750 150 180
