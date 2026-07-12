#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "$ROOT_DIR/.." && pwd)"
WORKFLOW_DIR="$ROOT_DIR/workflows"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$WORKFLOW_DIR"

if ! command -v n8n >/dev/null 2>&1; then
  echo "n8n was not found on PATH. Run this script in the same environment where n8n is installed." >&2
  exit 1
fi

echo "Exporting n8n workflows..."
n8n export:workflow --all --separate --output="$TMP_DIR"

find "$WORKFLOW_DIR" -maxdepth 1 -type f -name '*.json' ! -name 'index.json' -delete
find "$TMP_DIR" -maxdepth 1 -type f -name '*.json' -exec cp {} "$WORKFLOW_DIR/" \;

echo "Building workflow manifest..."
node "$ROOT_DIR/scripts/generate-manifest.mjs"

if git -C "$REPO_DIR" diff --quiet -- n8n-workflows/workflows; then
  echo "No workflow changes to publish."
  exit 0
fi

git -C "$REPO_DIR" add n8n-workflows/workflows
git -C "$REPO_DIR" commit -m "Update n8n workflow exports"
git -C "$REPO_DIR" push

echo "Published workflow updates."
