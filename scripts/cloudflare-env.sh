# Sourced (from the repo root) by the other scripts here. Loads the Cloudflare
# token from ~/.config/united/cloudflare.env without printing it, reads the
# Worker's account and name from wrangler.toml, and gives cf_api, which sends the
# token to curl on stdin so it never appears on a command line (ps, /proc).

CF_ENV_FILE="$HOME/.config/united/cloudflare.env"
CF_SCRIPT="$(basename "$0")"
[ -f "$CF_ENV_FILE" ] || { echo "$CF_SCRIPT: no token file at $CF_ENV_FILE (see CLAUDE.md)" >&2; exit 1; }
set -a; . "$CF_ENV_FILE"; set +a
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "$CF_SCRIPT: CLOUDFLARE_API_TOKEN is not set in $CF_ENV_FILE" >&2; exit 1; }

# A top-level key of wrangler.toml (reading stops at the first [table]).
toml_top_level() {
  awk -v key="$1" '/^\[/ { exit } $1 == key && $2 == "=" { gsub(/"/, "", $3); print $3; exit }' wrangler.toml
}
CF_ACCOUNT="$(toml_top_level account_id)"
CF_WORKER="$(toml_top_level name)"
[[ "$CF_ACCOUNT" =~ ^[0-9a-f]{32}$ ]] || { echo "$CF_SCRIPT: no account_id in wrangler.toml" >&2; exit 1; }
[[ "$CF_WORKER" =~ ^[a-z0-9-]+$ ]] || { echo "$CF_SCRIPT: no name in wrangler.toml" >&2; exit 1; }

# cf_api METHOD PATH [extra curl args...]: a Cloudflare API call, body on stdout.
cf_api() {
  local method="$1" path="$2"
  shift 2
  printf 'header = "Authorization: Bearer %s"\n' "$CLOUDFLARE_API_TOKEN" \
    | curl -fsS --config - -X "$method" "$@" "https://api.cloudflare.com/client/v4$path"
}
