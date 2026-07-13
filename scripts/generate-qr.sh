#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/js/config.js"
OUTPUT="$ROOT_DIR/assets/qr-code.png"

SITE_URL="$(sed -n 's/.*siteUrl:[[:space:]]*"\([^"]*\)".*/\1/p' "$CONFIG_FILE" | head -1)"

if [[ -z "$SITE_URL" ]]; then
  echo "siteUrl not found in $CONFIG_FILE" >&2
  exit 1
fi

ENCODED_URL="$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SITE_URL', safe=''))")"
curl -fsSL \
  "https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${ENCODED_URL}" \
  -o "$OUTPUT"

echo "QR code saved to $OUTPUT"
echo "URL: $SITE_URL"
