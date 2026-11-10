#!/usr/bin/env bash
# Deploys cloudflare-worker.js as the Worker wrangler.toml names (ucg-contact).
# Agents run this rather than wrangler directly: the secret guard blocks any
# command that names the token file, and scripts/cloudflare-env.sh loads it.
#
# wrangler.toml has keep_vars = false, so a deploy deletes plain-text vars. While
# SMTP2GO_API_KEY or TURNSTILE_SECRET_KEY is still a plain-text var on the live
# Worker, this copies its value into the same deploy as an encrypted secret,
# through a temp file only wrangler reads, deleted on exit. Values are never printed.
#
# Usage: bash scripts/deploy-worker.sh [--dry-run]
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/cloudflare-env.sh

WRANGLER="wrangler@4.159.0"
KEYS='["SMTP2GO_API_KEY","TURNSTILE_SECRET_KEY"]'

umask 077
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cf_api GET "/accounts/$CF_ACCOUNT/workers/scripts/$CF_WORKER/settings" > "$TMP/settings.json"

# Both keys must exist on the live Worker, as a var or a secret, before deploying.
missing="$(jq -c --argjson keys "$KEYS" '$keys - [.result.bindings[].name]' "$TMP/settings.json")"
[ "$missing" = "[]" ] || { echo "deploy-worker: the live Worker lacks $missing; stopping" >&2; exit 1; }

# A deploy should change the code and the keys only. Stop when the live
# compatibility settings differ from wrangler.toml (which lists no flags), unless
# the change is meant: ALLOW_SETTINGS_CHANGE=1 bash scripts/deploy-worker.sh
live_date="$(jq -r '.result.compatibility_date' "$TMP/settings.json")"
live_flags="$(jq -c '.result.compatibility_flags // []' "$TMP/settings.json")"
if [ "$live_date" != "$(toml_top_level compatibility_date)" ] || [ "$live_flags" != "[]" ]; then
  if [ "${ALLOW_SETTINGS_CHANGE:-}" != 1 ]; then
    echo "deploy-worker: live compatibility settings ($live_date, flags $live_flags) differ from wrangler.toml; stopping" >&2
    exit 1
  fi
  echo "deploy-worker: replacing live compatibility settings ($live_date, flags $live_flags) with wrangler.toml's"
fi

jq --argjson keys "$KEYS" \
  '[.result.bindings[] | select(.type == "plain_text" and (.name as $n | $keys | index($n))) | {key: .name, value: .text}] | from_entries' \
  "$TMP/settings.json" > "$TMP/secrets.json"
rm -f "$TMP/settings.json"

args=()
if [ "$(jq 'length' "$TMP/secrets.json")" -gt 0 ]; then
  case " $* " in
    *" --dry-run "*) echo "deploy-worker: would turn these plain-text vars into encrypted secrets: $(jq -c keys "$TMP/secrets.json")" ;;
    *) echo "deploy-worker: turning these plain-text vars into encrypted secrets: $(jq -c keys "$TMP/secrets.json")" ;;
  esac
  args+=(--secrets-file "$TMP/secrets.json")
fi

npx -y "$WRANGLER" deploy ${args[@]+"${args[@]}"} "$@"

# After a real deploy, show how each key is now stored (names and types only).
case " $* " in
  *" --dry-run "*) ;;
  *) cf_api GET "/accounts/$CF_ACCOUNT/workers/scripts/$CF_WORKER/settings" \
       | jq -r --argjson keys "$KEYS" '.result.bindings[] | select(.name as $n | $keys | index($n)) | "deploy-worker: \(.name) is \(.type)"' ;;
esac
