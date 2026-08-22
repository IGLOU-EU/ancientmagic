#!/usr/bin/env bash
#
# Rebuild the social preview image of every UI language into pub/media.
# Run it from anywhere, it writes only into pub/media.
#
#   tools/og-images.sh
#
# One image per language, because the picture bakes the promise line in and a
# French page sharing an English picture would say two different things at once.
# The composition is src/html/og-image.html, filled from src/strings by
# tools/render-og.ts, so the image and the page it belongs to quote the same
# source. Adding a language file is therefore the whole of adding an image:
# rerun this and the new file appears, named after the language.
#
# The recorded protocol is chrome-headless-shell at 1200x630, quantized to 256
# colors with libimagequant, then optipng, under 300 KB. Quantization is what
# most of that budget rests on: a starfield is thousands of near-identical
# violets, and 8-bit indexed color costs the eye nothing here while costing the
# file three quarters of its weight (634 KB down to about 160 KB).
#
# Three quantizers are tried in order, and the run prints which one it used,
# because they do not produce the same bytes:
#
#   1. pngquant, libimagequant, the recorded protocol.
#   2. ImageMagick, a lesser quantizer that still lands well under the target.
#   3. none, optipng alone, which overshoots the target by more than twice and
#      says so loudly rather than failing.
#
# Requires chrome-headless-shell and optipng. Point CHROME at another binary if
# yours lives elsewhere.

set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
out=$root/pub/media
src=$root/.og-build
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

chrome=${CHROME:-$HOME/.cache/puppeteer/chrome-headless-shell/linux-131.0.6778.204/chrome-headless-shell-linux64/chrome-headless-shell}

if [ ! -x "$chrome" ]; then
  echo "chrome-headless-shell not found at $chrome" >&2
  echo "set CHROME to the binary and rerun" >&2
  exit 1
fi

if ! command -v optipng >/dev/null 2>&1; then
  echo 'optipng not found' >&2
  exit 1
fi

if command -v pngquant >/dev/null 2>&1; then
  quantizer=pngquant
elif command -v magick >/dev/null 2>&1; then
  quantizer=magick
elif command -v convert >/dev/null 2>&1; then
  quantizer=convert
else
  quantizer=none
fi

# 256 colors, the ceiling of an indexed PNG. Floyd-Steinberg error diffusion is
# what keeps the nebula gradients from banding once the palette is that small,
# and it compresses smaller here than an undithered pass because the dither
# noise sits below the filter's prediction error either way.
quantize() {
  local file=$1
  case $quantizer in
    pngquant)
      pngquant --quality=70-96 --speed 1 --strip --force --output "$file.q" 256 "$file"
      mv "$file.q" "$file"
      ;;
    magick | convert)
      "$quantizer" "$file" -dither FloydSteinberg -colors 256 "PNG8:$file.q"
      mv "$file.q" "$file"
      ;;
    none) ;;
  esac
}

echo 'rendering the compositions'
"$root/node_modules/.bin/tsc" -p "$root/tsconfig.tools.json"
node "$root/.tools-build/tools/render-og.js"

mkdir -p "$out"

for composition in "$src"/*.html; do
  lang=$(basename "$composition" .html)
  raw=$work/$lang.png
  echo "shooting $lang"

  # The composition holds no animation, so a virtual clock is safe here and the
  # frame is the same on every machine.
  "$chrome" --headless --disable-gpu --hide-scrollbars \
    --virtual-time-budget=5000 --window-size=1200,630 \
    --screenshot="$raw" "file://$composition" >/dev/null 2>&1

  quantize "$raw"
  # Cleared first: optipng leaves a .bak beside an output it has to clobber.
  rm -f "$out/og-$lang.png"
  optipng -o7 -quiet -strip all -out "$out/og-$lang.png" "$raw"
done

if [ "$quantizer" = none ]; then
  echo
  echo 'WARNING: no quantizer found, so nothing was quantized.' >&2
  echo 'The images below are 24-bit and over twice the recorded target.' >&2
  echo 'Install pngquant and rerun to land on the intended sizes.' >&2
fi

echo
echo "quantizer: $quantizer"
echo 'pub/media:'
( cd "$out" && ls -l --human-readable og-*.png | awk '{ printf "  %6s  %s\n", $5, $9 }' )
