#!/usr/bin/env bash
# Forbidden-word guard, scoped to docs/VOICE.md's "no adjectives I didn't
# write" rule (line 5) and the tone-bar leak rule (line 26).
#
# Scope: human-facing content only (*.md, README*, future app/store copy).
# Never checks source code or deps.
#
# Set A (AI-slop, banned everywhere in scope):
#   leverage, seamless, robust, delve, revolutionize, cutting-edge, utilize,
#   innovative, empower, unlock, elevate, game-changer
#   (matched by word-stem, so inflections like "seamlessly", "empowering",
#   "unlocking" are caught too; trade-off: "elevation"/"robustness"/"empowerment"
#   also flag — reword or add an allowlist path if a doc legitimately needs them)
# Set B (tone-bar words, banned only in app/store microcopy):
#   connected, cherished, appreciated
#
# Allowlist: docs/VOICE.md (where these words are defined/quoted). Add a path
# here if an ADR legitimately quotes a banned word.
#
# Usage: forbidden-words.sh [file...]
#   No args: checks currently staged files (git diff --cached).

set -eo pipefail

SET_A='\b(leverag|seamless|robust|delv|revolutioniz|cutting-edge|utili[sz]|innovativ|empower|unlock|elevat|game-chang)'
SET_B='\b(connected|cherished|appreciated)\b'

ALLOWLIST_RE='^docs/VOICE\.md$'

# In scope = human-facing copy only. Deliberately NOT *.tsx/*.ts: app strings in
# code would false-positive constantly (e.g. "connected" = network/DB state), and
# VOICE.md governs *copy*, not code. User-facing strings belong in a scannable
# catalog (i18n JSON / .strings), which also serves VOICE.md's bilingual rule.
is_content_file() {
  case "$1" in
    *.md) return 0 ;;
    README|README.*) return 0 ;;
    */i18n/*.json|*/locales/*.json|*.strings) return 0 ;;
    *) return 1 ;;
  esac
}

is_microcopy_file() {
  case "$1" in
    *store-listing*|*storelisting*|*/copy/*|*microcopy*) return 0 ;;
    */i18n/*.json|*/locales/*.json|*.strings) return 0 ;;
    *) return 1 ;;
  esac
}

if [ "$#" -gt 0 ]; then
  files=("$@")
else
  files=()
  while IFS= read -r line; do
    [ -n "$line" ] && files+=("$line")
  done < <(git diff --cached --name-only --diff-filter=ACM)
fi

if [ "${#files[@]}" -eq 0 ]; then
  echo "forbidden-word guard: no files to check"
  exit 0
fi

fail=0
checked=0
for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  is_content_file "$f" || continue
  [[ "$f" =~ $ALLOWLIST_RE ]] && continue
  checked=$((checked + 1))

  hits_a=$(grep -inE "$SET_A" "$f" || true)
  if [ -n "$hits_a" ]; then
    echo "FORBIDDEN (set A, AI-slop) in $f:"
    echo "$hits_a" | sed 's/^/  /'
    fail=1
  fi

  if is_microcopy_file "$f"; then
    hits_b=$(grep -inE "$SET_B" "$f" || true)
    if [ -n "$hits_b" ]; then
      echo "FORBIDDEN (set B, tone-bar leak) in $f:"
      echo "$hits_b" | sed 's/^/  /'
      fail=1
    fi
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "forbidden-word guard: clean ($checked file(s) checked)"
fi
exit "$fail"
