#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
#  BattleQ Rollup – Startup Script (FIXED & PRODUCTION READY)
# ══════════════════════════════════════════════════════════════

set -eo pipefail

MINITIA_HOME="${MINITIA_HOME:-/root/.minitia}"
LOG_DIR="/var/log/battleq"
mkdir -p "$LOG_DIR"

echo "═══════════════════════════════════════════════════════"
echo "  BattleQ Rollup Node — Starting"
echo "═══════════════════════════════════════════════════════"
echo "  Home:   $MINITIA_HOME"
echo "  Port:   ${PORT:-8080}"
echo "  Time:   $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "═══════════════════════════════════════════════════════"

# ── Verify config exists ─────────────────────────────────────
if [[ ! -f "$MINITIA_HOME/config/genesis.json" ]]; then
  echo "ERROR: No genesis.json found at $MINITIA_HOME/config/"
  exit 1
fi

echo "✓ Genesis found: $(jq -r '.chain_id' "$MINITIA_HOME/config/genesis.json")"

# ── Ensure data dir exists ───────────────────────────────────
mkdir -p "$MINITIA_HOME/data"

# ── Patch configs (CRITICAL FIX) ─────────────────────────────
CONFIG_TOML="$MINITIA_HOME/config/config.toml"
APP_TOML="$MINITIA_HOME/config/app.toml"

echo "  Patching configs for container networking..."

# Tendermint RPC
sed -i 's|127.0.0.1:26657|0.0.0.0:26657|g' "$CONFIG_TOML" || true
sed -i 's|localhost:26657|0.0.0.0:26657|g' "$CONFIG_TOML" || true

# P2P
sed -i 's|127.0.0.1:26656|0.0.0.0:26656|g' "$CONFIG_TOML" || true
sed -i 's|localhost:26656|0.0.0.0:26656|g' "$CONFIG_TOML" || true

# JSON RPC FIX (MOST IMPORTANT)
sed -i 's|127.0.0.1:8545|0.0.0.0:8545|g' "$APP_TOML" || true
sed -i 's|localhost:8545|0.0.0.0:8545|g' "$APP_TOML" || true
sed -i 's|127.0.0.1:8546|0.0.0.0:8546|g' "$APP_TOML" || true
sed -i 's|localhost:8546|0.0.0.0:8546|g' "$APP_TOML" || true

# Enable JSON-RPC
sed -i '/\[json-rpc\]/,/^\[/ s|enable = false|enable = true|' "$APP_TOML" || true

echo "✓ Config patched"

# ── Start Caddy ──────────────────────────────────────────────
echo "Starting Caddy on port ${PORT:-8080}..."
caddy run --config /etc/caddy/Caddyfile \
  > "$LOG_DIR/caddy.log" 2>&1 &
echo "Caddy started"

# ── Start Node ───────────────────────────────────────────────
echo "Starting minitiad..."
echo "═══════════════════════════════════════════════════════"

exec minitiad start \
  --home "$MINITIA_HOME" \
  --json-rpc.enable \
  --json-rpc.address "0.0.0.0:8545" \
  --json-rpc.address-ws "0.0.0.0:8546" \
  --json-rpc.enable-ws \
  --json-rpc.apis "eth,net,web3,txpool" \
  --versiondb.enable=false \
  --iavl-disable-fastnode