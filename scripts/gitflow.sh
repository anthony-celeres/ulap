#!/usr/bin/env bash
# ulap git workflow helper.
#
# Flow: feature branches start from develop, land back in develop through a
# PR merged with a merge commit (visible merge lines in the graph), and
# develop reaches main through a release PR that is merged manually on GitHub.
set -euo pipefail

DEVELOP=develop
MAIN=main

usage() {
  cat <<'EOF'
Usage: scripts/gitflow.sh <command>

  setup              one-time: enable the repo commit-msg hook
  feature <name>     start feature/<name> off the latest develop
  ship               push the current feature branch, PR it to develop, merge
  release            push develop and open a PR to main (merge it on GitHub)
EOF
}

cmd="${1:-}"
shift || true

case "$cmd" in
  setup)
    git config core.hooksPath .githooks
    echo "commit-msg hook enabled (.githooks/)."
    ;;
  feature)
    name="${1:?usage: scripts/gitflow.sh feature <name>}"
    git checkout "$DEVELOP"
    git pull origin "$DEVELOP"
    git checkout -b "feature/$name"
    ;;
  ship)
    branch="$(git rev-parse --abbrev-ref HEAD)"
    case "$branch" in
      feature/*) ;;
      *) echo "ship: run this from a feature/* branch." >&2; exit 1 ;;
    esac
    git push -u origin "$branch"
    gh pr create --base "$DEVELOP" --head "$branch" --fill
    gh pr merge "$branch" --merge
    git checkout "$DEVELOP"
    git pull origin "$DEVELOP"
    ;;
  release)
    git checkout "$DEVELOP"
    git pull origin "$DEVELOP" || true
    git push origin "$DEVELOP"
    gh pr create --base "$MAIN" --head "$DEVELOP" \
      --title "Release: develop into main" \
      --body "Accumulated features from develop. Review and merge on GitHub."
    ;;
  *)
    usage
    exit 1
    ;;
esac
