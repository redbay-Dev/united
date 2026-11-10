#!/usr/bin/env bash
# Summarises the ucg-contact Worker's logs from Cloudflare Workers Logs (kept
# about 7 days): requests by method, status and origin, then each error line.
# The token comes from ~/.config/united/cloudflare.env and is never printed.
# Usage: bash scripts/worker-logs.sh [days, default 7]
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="$HOME/.config/united/cloudflare.env"
[ -f "$ENV_FILE" ] || { echo "worker-logs: no token file at $ENV_FILE (see CLAUDE.md)" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a

ACCOUNT="$(sed -n 's/^account_id = "\([0-9a-f]*\)".*/\1/p' wrangler.toml)"
NAME="$(sed -n 's/^name = "\([^"]*\)".*/\1/p' wrangler.toml)"
DAYS="${1:-7}"
NOW=$(( $(date +%s) * 1000 ))
FROM=$(( NOW - DAYS * 86400 * 1000 ))

query() {
  curl -fsS -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
    --data "$1" "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT/workers/observability/telemetry/query"
}
service_filter() {
  jq -n --arg name "$NAME" --argjson extra "${1:-[]}" \
    '[{key: "$metadata.service", operation: "eq", type: "string", value: $name}] + $extra'
}

echo "== $NAME requests by method, status and origin, last $DAYS days"
query "$(jq -n --argjson from "$FROM" --argjson to "$NOW" --argjson filters "$(service_filter)" '{
  queryId: "worker-logs-counts", view: "calculations", ignoreSeries: true,
  timeframe: {from: $from, to: $to},
  parameters: {filters: $filters, calculations: [{operator: "count", alias: "n"}], limit: 100,
    groupBys: [{type: "string", value: "$workers.event.request.method"},
               {type: "number", value: "$workers.event.response.status"},
               {type: "string", value: "$workers.event.request.headers.origin"}]}}')" \
  | jq -r '.result.calculations[0].aggregates[]? | "\(.value)\t\([.groups[]? | .value // "-" | tostring] | join("  "))"' \
  | sort -rn

echo "== $NAME error lines, last $DAYS days"
query "$(jq -n --argjson from "$FROM" --argjson to "$NOW" \
  --argjson filters "$(service_filter '[{"key":"$metadata.level","operation":"eq","type":"string","value":"error"}]')" '{
  queryId: "worker-logs-errors", view: "events", limit: 200,
  timeframe: {from: $from, to: $to}, parameters: {filters: $filters}}')" \
  | jq -r '.result.events.events[]? | "\(.timestamp / 1000 | todate)  \((.source.message // ."$metadata".message // "") | tostring | .[0:200])"' \
  | sort
