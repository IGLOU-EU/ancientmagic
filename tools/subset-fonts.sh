#!/usr/bin/env bash
#
# Rebuild the self-hosted script fonts in pub/fonts from the official Noto
# releases. Run it from anywhere, it writes only into pub/fonts.
#
#   tools/subset-fonts.sh
#
# The site writes its incantations as real Unicode text in Runic, Egyptian
# Hieroglyphs and Phoenician. The last two live in the SMP and render as tofu
# on most systems, so the three scripts ship with the site instead of being
# borrowed from the reader's machine. Runic numeric seals additionally use
# Aegean Numbers, which Noto covers in Noto Sans Linear B.
#
# Sources are the notofonts.github.io per-script releases, all SIL Open Font
# License 1.1 with no Reserved Font Name. Archives are pinned by SHA-256, so a
# rerun either reproduces the exact same bytes or fails loudly.
#
#   Noto Sans Runic               v2.002  https://github.com/notofonts/runic
#   Noto Sans Egyptian Hieroglyphs v2.002 https://github.com/notofonts/egyptian-hieroglyphs
#   Noto Sans Phoenician          v2.001  https://github.com/notofonts/phoenician
#   Noto Sans Linear B            v2.002  https://github.com/notofonts/linear-b
#
# The stylesheet registers all four under a single CSS family and routes each
# codepoint to the right file by unicode-range, then calibrates every face onto
# the height of the runic stave with size-adjust. Those calibration numbers were
# measured on these exact releases, so the file names below are a contract with
# src/scss/_fonts.scss, and moving a version means measuring again.
#
# Requires curl, unzip and python3. fonttools and brotli are installed into a
# throwaway virtualenv under the work directory when pyftsubset is missing, so
# nothing has to be present on the machine beforehand.

set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
out=$root/pub/fonts
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

base=https://github.com/notofonts

runic_url=$base/runic/releases/download/NotoSansRunic-v2.002/NotoSansRunic-v2.002.zip
runic_sha=08916d856e590a134d609631f47a3e8062d68d621f4866d5fcd735369da218bf

egyptian_url=$base/egyptian-hieroglyphs/releases/download/NotoSansEgyptianHieroglyphs-v2.002/NotoSansEgyptianHieroglyphs-v2.002.zip
egyptian_sha=e64154d7d6a358788a6852441a8ac74f6cc5389d428aa8786d2e722bc2da267d

phoenician_url=$base/phoenician/releases/download/NotoSansPhoenician-v2.001/NotoSansPhoenician-v2.001.zip
phoenician_sha=9840df4f89a074f9ae97f1d2946f42dbc9f29d1b41318f1f91d6f122d5403fe0

linearb_url=$base/linear-b/releases/download/NotoSansLinearB-v2.002/NotoSansLinearB-v2.002.zip
linearb_sha=16fe739f22242372a0a79189ac9692d59720db21f830523e6bc31b0e51709d24

# Codepoint sets, kept in step with src/ts/languages/*-data.ts.
#
# Runic and Phoenician take their whole block. Both are under 100 codepoints
# and cost about 3 KB each, so pinning them to today's exact inventory would
# save nothing worth the risk of a silent gap when the data grows.
runic_unicodes='U+16A0-16F8'
phoenician_unicodes='U+10900-1091F'

# The Egyptian block holds 1071 signs and the data uses 47 of them, so this one
# is subset sign by sign. From SIGN_MAP, the logograms and determinatives, and
# the closed idiom signs of egyptian-data.ts.
egyptian_unicodes='U+13000,U+13001,U+13010,U+13079,U+1308B,U+1309D,U+130A1,U+130A7,U+130BB,U+130C0,U+1313F,U+13153,U+1316A,U+13171,U+13191,U+13193,U+131CB,U+131CC,U+131F3,U+131FC,U+1320E,U+13216,U+13219,U+13254,U+13280,U+13297,U+132A4,U+132AA,U+132AE,U+132B9,U+132BD,U+132F4,U+132F9,U+13303,U+13351,U+1337F,U+13383,U+13386,U+1339B,U+133A1,U+133BC,U+133CF,U+133DB,U+133E4,U+133E5,U+1340D,U+13419'

# The four seal glyphs of SEAL_GLYPHS in runic-data.ts. The rest of Noto Sans
# Linear B, syllabary and ideograms included, is never drawn.
aegean_unicodes='U+10108,U+10109,U+1010D,U+1010F,U+10110'

fetch() {
  local name=$1 url=$2 want=$3
  local zip=$work/$name.zip
  echo "fetching $name"
  curl --fail --silent --show-error --location --output "$zip" "$url"
  local got
  got=$(sha256sum "$zip" | cut -d' ' -f1)
  if [ "$got" != "$want" ]; then
    echo "$name: checksum mismatch" >&2
    echo "  expected $want" >&2
    echo "  got      $got" >&2
    exit 1
  fi
  unzip -q -o "$zip" -d "$work/$name"
}

fetch runic "$runic_url" "$runic_sha"
fetch egyptian "$egyptian_url" "$egyptian_sha"
fetch phoenician "$phoenician_url" "$phoenician_sha"
fetch linearb "$linearb_url" "$linearb_sha"

if command -v pyftsubset >/dev/null 2>&1; then
  pyftsubset=pyftsubset
else
  echo "pyftsubset not found, building a virtualenv"
  python3 -m venv "$work/venv"
  "$work/venv/bin/pip" install --quiet --upgrade pip
  "$work/venv/bin/pip" install --quiet fonttools brotli
  pyftsubset=$work/venv/bin/pyftsubset
fi

mkdir -p "$out"

# The unhinted TTF builds are the smallest sources and hinting buys nothing
# once the browser rasterizes at display size. --name-IDs='*' keeps the whole
# name table, so each file still carries its own copyright and license inside.
subset() {
  local name=$1 src=$2 unicodes=$3
  echo "subsetting $name"
  "$pyftsubset" "$src" \
    --unicodes="$unicodes" \
    --flavor=woff2 \
    --name-IDs='*' \
    --output-file="$out/$name.woff2"
}

subset noto-sans-runic-subset \
  "$work/runic/NotoSansRunic/unhinted/ttf/NotoSansRunic-Regular.ttf" \
  "$runic_unicodes"

subset noto-sans-egyptian-hieroglyphs-subset \
  "$work/egyptian/NotoSansEgyptianHieroglyphs/unhinted/ttf/NotoSansEgyptianHieroglyphs-Regular.ttf" \
  "$egyptian_unicodes"

subset noto-sans-phoenician-subset \
  "$work/phoenician/NotoSansPhoenician/unhinted/ttf/NotoSansPhoenician-Regular.ttf" \
  "$phoenician_unicodes"

subset noto-sans-linear-b-subset \
  "$work/linearb/NotoSansLinearB/unhinted/ttf/NotoSansLinearB-Regular.ttf" \
  "$aegean_unicodes"

# The OFL asks that the license travel with the fonts. The four releases carry
# the same license body under four copyright lines, so they collapse into one
# notice that names all four.
{
  echo 'Copyright 2022 The Noto Project Authors (https://github.com/notofonts/runic)'
  echo 'Copyright 2022 The Noto Project Authors (https://github.com/notofonts/egyptian-hieroglyphs)'
  echo 'Copyright 2022 The Noto Project Authors (https://github.com/notofonts/phoenician)'
  echo 'Copyright 2022 The Noto Project Authors (https://github.com/notofonts/linear-b)'
  echo
  echo 'The woff2 files beside this notice are subsets of those fonts, produced'
  echo 'by tools/subset-fonts.sh. They are Modified Versions in the sense of the'
  echo 'license below. Noto reserves no font name, so they keep their families.'
  echo
  tail -n +3 "$work/runic/OFL.txt"
} >"$out/OFL.txt"

echo
echo 'pub/fonts:'
( cd "$out" && ls -l --human-readable *.woff2 OFL.txt | awk '{ printf "  %6s  %s\n", $5, $9 }' )
