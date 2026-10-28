#!/usr/bin/env bash
# Gera versões de 640 px de largura (-640.avif / -640.webp) das fotos estáticas,
# usadas no srcset do SmartImage para telas e cards pequenos.
# AVIF codificado um arquivo por vez (libaom, still-picture), como o resto do pacote.
set -euo pipefail
cd "$(dirname "$0")/../public/media"
for src in *.webp; do
  name="${src%.webp}"
  case "$name" in *-640|sketch-before) continue ;; esac
  ffmpeg -v error -y -i "$src" -vf "scale=640:-2:flags=lanczos" -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 32 -b:v 0 -cpu-used 6 -pix_fmt yuv420p "$name-640.avif"
  ffmpeg -v error -y -i "$src" -vf "scale=640:-2:flags=lanczos" -frames:v 1 -c:v libwebp -quality 78 "$name-640.webp"
done
