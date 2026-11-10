#!/usr/bin/env bash
# Deploys cloudflare-worker.js as the ucg-contact Worker, as wrangler.toml says.
# The Cloudflare token comes from ~/.config/united/cloudflare.env and is never
# printed (the secret guard blocks any command that names that file, so agents
# run this script instead).
#
# wrangler.toml has keep_vars = false, so a deploy deletes plain-text vars. While
# SMTP2GO_API_KEY or TURNSTILE_SECRET_KEY is still a plain-text var on the live
# Worker, this copies its value into the same deploy as an encrypted secret,
# through a temp file only wrangler reads, deleted on exit.
#
# Usage: bash scripts/deploy-worker.sh [--dry-run]
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="$HOME/.config/united/cloudflare.env"
[ -f "$ENV_FILE" ] || { echo "deploy-worker: no token file at $ENV_FILE (see CLAUDE.md)" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a

ACCOUNT="$(sed -n 's/^account_id = "\([0-9a-f]*\)".*/\1/p' wrangler.toml)"
NAME="$(sed -n 's/^name = "\([^"]*\)".*/\1/p' wrangler.toml)"
KEYS='["SMTP2GO_API_KEY","TURNSTILE_SECRET_KEY"]'

umask 077
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/workers/scripts/$NAME/settings" > "$TMP/settings.json"

# Both keys must exist on the live Worker, as a var or a secret, before deploying.
missing="$(jq -c --argjson keys "$KEYS" '$keys - [.result.bindings[].name]' "$TMP/settings.json")"
[ "$missing" = "[]" ] || { echo "deploy-worker: the live Worker lacks $missing; stopping" >&2; exit 1; }

jq --argjson keys "$KEYS" \
  '[.result.bindings[] | select(.type == "plain_text" and (.name as $n | $keys | index($n))) | {key: .name, value: .text}] | from_entries' \
  "$TMP/settings.json" > "$TMP/secrets.json"
rm -f "$TMP/settings.json"

args=()
if [ "$(jq 'length' "$TMP/secrets.json")" -gt 0 ]; then
  echo "deploy-worker: turning plain-text vars into encrypted secrets: $(jq -c keys "$TMP/secrets.json")"
  args+=(--secrets-file "$TMP/secrets.json")
fi

npx -y wrangler@4 deploy "${args[@]}" "$@"
