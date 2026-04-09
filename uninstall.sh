#!/usr/bin/env bash
# claude-buddy MCP — Uninstaller
set -e

echo "=== claude-buddy uninstaller ==="
echo ""

# Remove MCP server registration
echo "Removing MCP server..."
claude mcp remove --scope user claude-buddy 2>/dev/null && echo "  ✓ MCP server removed" || echo "  - Not registered"

# Remove slash command
echo "Removing /buddy command..."
rm -f "$HOME/.claude/commands/buddy.md" && echo "  ✓ Command removed"

# Remove hooks and statusLine from settings.json
echo "Cleaning settings.json..."
SETTINGS_FILE="$HOME/.claude/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
  node -e "
    const fs = require('fs');
    const s = JSON.parse(fs.readFileSync('$SETTINGS_FILE','utf8'));
    delete s.statusLine;
    delete s.hooks;
    if (s.permissions?.allow) {
      s.permissions.allow = s.permissions.allow.filter(r => r !== 'mcp__claude-buddy__*');
      if (s.permissions.allow.length === 0) delete s.permissions;
    }
    fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(s, null, 2));
  "
  echo "  ✓ Settings cleaned"
fi

echo ""
echo "Done. Your buddy data is still in ~/.claude-buddy/ (delete manually if you want)."
echo "The project folder can also be deleted manually."
