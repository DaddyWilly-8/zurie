#!/usr/bin/env bash
#
# Zuriè frontend — one-command production deploy.
#
# Run this from the deployed working copy on the server (SSH, or a cPanel
# Git Version Control post-pull hook pointed at this script). Safe to
# re-run. Critically: if the build fails, this script exits non-zero
# WITHOUT touching tmp/restart.txt — cPanel's Passenger app manager keeps
# serving the last-known-good build until a new restart signal arrives, so
# a broken build can never take the live site down.
#
# See docs/RUNBOOK.md for what to do if a step here fails mid-deploy.

set -euo pipefail
cd "$(dirname "$0")"

log() { echo "[deploy] $*"; }
fail() { echo "[deploy] ERROR: $*" >&2; exit 1; }

# On cPanel/CloudLinux, Node lives in a per-app virtualenv that must be
# sourced before `node`/`npm` are on PATH — the same
# `source ~/nodevenv/<app>/<ver>/bin/activate` line cPanel prints in
# "Setup Node.js App". Find and source it so this script can be run (or
# triggered by a Git post-pull hook) without activating the env by hand
# first. Picks the activate script under this app's own folder when there
# is one, else the only one present; a highest-version tiebreak keeps it
# deterministic if several exist.
activate_cpanel_nodevenv() {
  local appdir; appdir="$(basename "$PWD")"
  local candidate
  candidate="$(ls -1 "$HOME/nodevenv/$appdir"/*/bin/activate 2>/dev/null | sort -V | tail -n1)"
  if [ -z "$candidate" ]; then
    candidate="$(ls -1 "$HOME/nodevenv"/*/*/bin/activate 2>/dev/null | sort -V | tail -n1)"
  fi
  [ -n "$candidate" ] && [ -s "$candidate" ] || return 1
  log "Activating cPanel Node virtualenv: $candidate"
  # shellcheck disable=SC1090
  source "$candidate"
}

# --- Activate the right Node version -------------------------------------
# Production host (cPanel nodevenv) first, then nvm for local/dev, then
# whatever `node` already happens to be on PATH.
if activate_cpanel_nodevenv; then
  :
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
  nvm use --silent "$(cat .nvmrc)" || nvm install --silent "$(cat .nvmrc)"
elif command -v node >/dev/null 2>&1; then
  log "No cPanel nodevenv or nvm — using whatever \`node\` is already on PATH."
else
  fail "no Node.js found (no cPanel nodevenv, no nvm, no node on PATH)."
fi
command -v node >/dev/null 2>&1 || fail "node is still not on PATH after activation."
log "Using Node: $(node -v), npm: $(npm -v)"

# --- Pull latest -----------------------------------------------------------
log "Fetching latest main..."
git fetch origin main
git reset --hard origin/main

# --- Dependencies ------------------------------------------------------
# --include=dev: the build itself needs devDependencies (TypeScript,
# Tailwind, etc.) even though this is a production deploy — Next.js
# compiles at build time, not at request time, so dev tooling has to be
# present here even though it isn't needed once `npm run start` is serving.
log "Installing dependencies (including dev, needed for the build step)..."
npm install --include=dev

# --- Build -----------------------------------------------------------------
# A clean .next avoids ever serving a mix of old and new chunks if a
# previous deploy was interrupted mid-build.
log "Cleaning previous build output..."
rm -rf .next

log "Building..."
if ! npm run build; then
  fail "build failed — leaving the currently-running app untouched. Fix the build and re-run ./deploy.sh; the live site is unaffected."
fi

# --- Restart -----------------------------------------------------------
# Only reached if the build above succeeded. cPanel's Passenger-based
# Node.js Application Manager watches tmp/restart.txt and reloads the app
# the next time it receives a request after this file's mtime changes.
mkdir -p tmp
touch tmp/restart.txt
log "Deploy complete. Now at $(git rev-parse --short HEAD) ($(git log -1 --format=%s)). Restart signalled."
