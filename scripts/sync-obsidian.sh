#!/bin/bash
set -euo pipefail

# --- Config ---
OBSIDIAN_VAULT="/Users/yemuncho/Library/Mobile Documents/iCloud~md~obsidian/Documents/private"
OBSIDIAN_POSTS="$OBSIDIAN_VAULT/2 정리/블로그"
OBSIDIAN_IMAGES="$OBSIDIAN_VAULT/images"
BLOG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BLOG_POSTS="$BLOG_DIR/content/posts"
BLOG_IMAGES="$BLOG_DIR/public/images"
CHANGES=0

# --- Validate ---
for dir in "$OBSIDIAN_POSTS" "$OBSIDIAN_IMAGES"; do
  if [ ! -d "$dir" ]; then
    echo "Error: $dir not found"
    exit 1
  fi
done

# --- Sync posts (.md -> .mdx) ---
echo "=== Syncing posts ==="
for src in "$OBSIDIAN_POSTS"/*.md; do
  filename="$(basename "$src" .md).mdx"
  dest="$BLOG_POSTS/$filename"
  if [ ! -f "$dest" ] || ! cmp -s "$src" "$dest"; then
    cp "$src" "$dest"
    echo "  Updated: $filename"
    CHANGES=$((CHANGES + 1))
  fi
done

# --- Sync images ---
echo "=== Syncing images ==="
rsync_output=$(rsync -ai --checksum --exclude='.DS_Store' "$OBSIDIAN_IMAGES/" "$BLOG_IMAGES/" 2>&1)
if [ -n "$rsync_output" ]; then
  while IFS= read -r line; do
    fname=$(echo "$line" | sed 's/^[^ ]* //')
    echo "  Updated: $fname"
    CHANGES=$((CHANGES + 1))
  done <<< "$rsync_output"
fi

# --- Commit and push ---
if [ "$CHANGES" -eq 0 ]; then
  echo ""
  echo "Already up to date."
  exit 0
fi

echo ""
echo "=== $CHANGES file(s) changed. Committing... ==="
cd "$BLOG_DIR"
git add content/posts/ public/images/
git status --short
git commit -m "Sync: update content from Obsidian ($(date '+%Y-%m-%d %H:%M'))"
git push origin HEAD
echo ""
echo "Done. Synced and pushed successfully."
