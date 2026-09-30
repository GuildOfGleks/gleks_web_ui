#!/usr/bin/env bash
# Manually triggers the "Deploy gleks-ui-lab" GitHub Actions workflow and streams its progress.
# Requires the GitHub CLI (`gh`) authenticated against the GuildOfGleks/gleks_web_ui repo.
#
# Usage:
#   scripts/deploy-lab.sh [--target test|prod] [--ref <branch|tag|sha>] [--image-tag <tag>]
#
# Defaults: --target is "test" (glx-01), --ref is the current branch, --image-tag is "latest".
# A prod deploy reuses the image already built for that commit on test; it never rebuilds.
#
# Examples:
#   scripts/deploy-lab.sh                      # build + deploy current branch to test
#   scripts/deploy-lab.sh --target prod        # promote the same commit to prod

set -euo pipefail

target="test"
ref="$(git rev-parse --abbrev-ref HEAD)"
image_tag="latest"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    --ref) ref="$2"; shift 2 ;;
    --image-tag) image_tag="$2"; shift 2 ;;
    -h|--help) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

case "$target" in
  test|prod) ;;
  *) echo "--target must be 'test' or 'prod', got '$target'" >&2; exit 2 ;;
esac

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) not found. Install it with 'sudo dnf install gh' and run 'gh auth login'." >&2
  exit 1
fi

# The workflow deploys whatever commit the ref points to on GitHub, not your local checkout.
remote_sha="$(gh api "repos/{owner}/{repo}/commits/$ref" --jq .sha 2>/dev/null || true)"
if [ -z "$remote_sha" ]; then
  echo "Ref '$ref' not found on GitHub. Did you push it?" >&2
  exit 1
fi

if [ "$target" = "prod" ]; then
  echo "About to deploy to PROD: ref '$ref' -> ${remote_sha:0:12}"
  echo "This commit must already have been deployed to test, otherwise the run will stop."
  read -r -p "Continue? [y/N] " answer
  case "$answer" in
    y|Y|yes) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

echo "Triggering deploy-lab.yml: target=$target, ref='$ref' (${remote_sha:0:12}), tag=$image_tag..."

gh workflow run deploy-lab.yml \
  --ref "$ref" \
  -f target="$target" \
  -f image_tag="$image_tag"

# Give GitHub a moment to register the new run before we query for it.
sleep 5

run_id="$(gh run list --workflow=deploy-lab.yml --event workflow_dispatch --commit "$remote_sha" \
  --limit 1 --json databaseId --jq '.[0].databaseId')"

if [ -z "$run_id" ]; then
  echo "Could not resolve the new run ID automatically. Check status with: gh run list --workflow=deploy-lab.yml" >&2
  exit 0
fi

echo "Watching run $run_id..."
gh run watch "$run_id" --exit-status
