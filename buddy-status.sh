#!/usr/bin/env bash
# Claude Code status line wrapper — calls the Node.js renderer
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/buddy-status.cjs"
