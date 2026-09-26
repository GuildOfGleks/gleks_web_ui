#!/usr/bin/env bash
# Manually triggers the "Deploy gleks-ui-lab" GitHub Actions workflow and streams its progress.
# Requires the GitHub CLI (`gh`) authenticated against the GuildOfGleks/gleks_web_ui repo.
#
# Usage:
#   scripts/deploy-lab.sh [--ref <branch|tag|sha>] [--image-tag <tag>] [--host-port <port>]
#
# Defaults: --ref is the current branch, --image-tag is "latest", --host-port is "9001".
#
# Examples:
#   scripts/deploy-lab.sh
#   scripts/deploy-lab.sh --ref master --image-tag v1 --host-port 9001

set -euo pipefail

ref="$(git rev-parse --abbrev-ref HEAD)"
image_tag="latest"
# Keep in step with the `host_port` default in .github/workflows/deploy-lab.yml.
host_port="9001"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --ref) ref="$2"; shift 2 ;;
    --image-tag) image_tag="$2"; shift 2 ;;
    --host-port) host_port="$2"; shift 2 ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) not found. Install it from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

echo "Triggering deploy-lab.yml on ref '$ref' (tag=$image_tag, port=$host_port)..."

gh workflow run deploy-lab.yml \
  --ref "$ref" \
  -f image_tag="$image_tag" \
  -f host_port="$host_port"

# Give GitHub a moment to register the new run before we query for it.
sleep 5

run_id="$(gh run list --workflow=deploy-lab.yml --limit 1 --json databaseId --jq '.[0].databaseId')"

if [ -z "$run_id" ]; then
  echo "Could not resolve the new run ID automatically. Check status with: gh run list --workflow=deploy-lab.yml" >&2
  exit 0
fi

echo "Watching run $run_id..."
gh run watch "$run_id" --exit-status
