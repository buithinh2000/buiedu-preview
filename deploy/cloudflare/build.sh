#!/usr/bin/env bash
# BuiEdu-only Cloudflare Pages static release candidate. No Render and no API key.
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT="${BUIEDU_CF_OUT:-dist-buiedu}"
if [[ "$OUT" != dist-buiedu ]]; then echo BUIEDU_UNSAFE_OUTPUT_PATH; exit 1; fi
rm -rf -- "$OUT"
mkdir -p -- "$OUT"
# Deliberate release allowlist. Civilization Lab is a DIFFERENT venture and
# MUST NOT be included, linked, bundled, or deployed by the BuiEdu builder.
for f in index.html styles.css main.mjs i18n.mjs config.mjs auth.mjs \
  companion-api.mjs guided-discovery.mjs intent-router.mjs \
  workplace-spreadsheet-csv.mjs learning-workspace.mjs \
  career-desk-ui.mjs quote-studio.mjs; do
  test -f "$f"
  cp -- "$f" "$OUT/$f"
done
cat > "$OUT/_headers" <<'HEADERS'
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cross-Origin-Resource-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'
  X-Robots-Tag: noindex, nofollow
HEADERS
touch "$OUT/.nojekyll"
node deploy/cloudflare/validate.mjs "$OUT"
echo BUIEDU_CLOUDFLARE_BUIEDU_ONLY_STATIC_BUNDLE_VERIFIED
echo BUIEDU_NO_RENDER_NO_SHARED_VENTURE_NO_SECRET_NO_MODEL
