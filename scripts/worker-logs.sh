#!/usr/bin/env bash
# Summarises the Worker's logs from Cloudflare Workers Logs (kept about 7 days):
# requests by method, status and origin, then each error line. The token is
# loaded by scripts/cloudflare-env.sh and never printed.
# Usage: bash scripts/worker-logs.sh [days, default 7]
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/cloudflare-env.sh

DAYS="${1:-7}"
[[ "$DAYS" =~ ^[0-9]+$ ]] && [ "$DAYS" -ge 1 ] || { echo "worker-logs: days must be a whole number, got '$DAYS'" >&2; exit 1; }
NOW=$(( $(date +%s) * 1000 ))
FROM=$(( NOW - DAYS * 86400 * 1000 ))

telemetry_query() {
  cf_api POST "/accounts/$CF_ACCOUNT/workers/observability/telemetry/query" \
    -H "Content-Type: application/json" --data "$1"
}
# The filter list every query starts from: this Worker's events, plus any extra filters.
worker_filters() {
  jq -n --arg name "$CF_WORKER" --argjson extra "${1:-[]}" \
    '[{key: "$metadata.service", operation: "eq", type: "string", value: $name}] + $extra'
}

echo "== $CF_WORKER requests by method, status and origin, last $DAYS days"
telemetry_query "$(jq -n --argjson from "$FROM" --argjson to "$NOW" --argjson filters "$(worker_filters)" '{
  queryId: "worker-logs-counts", view: "calculations", ignoreSeries: true,
  timeframe: {from: $from, to: $to},
  parameters: {filters: $filters, calculations: [{operator: "count", alias: "n"}], limit: 100,
    groupBys: [{type: "string", value: "$workers.event.request.method"},
               {type: "number", value: "$workers.event.response.status"},
               {type: "string", value: "$workers.event.request.headers.origin"}]}}')" \
  | jq -r '.result.calculations[0].aggregates[]? | "\(.value)\t\([.groups[]? | .value // "-" | tostring] | join("  "))"' \
  | sort -rn

echo "== $CF_WORKER error lines, last $DAYS days"
telemetry_query "$(jq -n --argjson from "$FROM" --argjson to "$NOW" \
  --argjson filters "$(worker_filters '[{"key":"$metadata.level","operation":"eq","type":"string","value":"error"}]')" '{
  queryId: "worker-logs-errors", view: "events", limit: 200,
  timeframe: {from: $from, to: $to}, parameters: {filters: $filters}}')" \
  | jq -r '.result.events.events[]? | "\(.timestamp / 1000 | todate)  \((.source.message // ."$metadata".message // "") | tostring | .[0:200])"' \
  | sort
