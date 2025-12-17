#!/usr/bin/env bash
# new-session.sh — create a new changelog entry & optional session-update template

# Configuration
DOCS_DIR="./docs"
CHANGELOG="$DOCS_DIR/CHANGELOG.md"
SESSION_UPDATES_DIR="$DOCS_DIR/session-updates"

# Get current date
DATE=$(date +%F)  # e.g. 2025-12-08

# Prompt for a short session title/summary
read -p "Session summary (short title): " SUMMARY

# Ensure directories exist
mkdir -p "$DOCS_DIR"
mkdir -p "$SESSION_UPDATES_DIR"

# 1. Append to CHANGELOG.md
if [ ! -f "$CHANGELOG" ]; then
  # If changelog does not exist, create with header
  cat << EOF > "$CHANGELOG"
# CHANGELOG

All notable changes to this project are documented in chronological order.

## [Unreleased]

EOF
fi

# Append a new entry under Unreleased (or create a dated section)
cat << EOF >> "$CHANGELOG"

## [$DATE] - $DATE  
### Summary  
- $SUMMARY

### Changes  
- (list changes here…)

### Notes / Todo  
- (any notes / todos...)

EOF

echo "✅ Appended new changelog entry for $DATE."

# 2. Create a session-update template file
SESSION_FILE="$SESSION_UPDATES_DIR/$DATE.md"
if [ ! -f "$SESSION_FILE" ]; then
  cat << EOF > "$SESSION_FILE"
# Session Update — $DATE

**Session title / summary**: $SUMMARY  

## What was done  
- 

## Current state of main features / modules  
- 

## Next goals (priority order)  
1.  
2.  
3.  

## Notes / open questions  
-  

EOF
  echo "📝 Created session-update template: $SESSION_FILE"
else
  echo "⚠️  Session file already exists: $SESSION_FILE"
fi
