#!/usr/bin/env bash
# ============================================================
# claude-buddy MCP — One-command installer
# Usage: git clone <repo> ~/claude-buddy-mcp && cd ~/claude-buddy-mcp && bash install.sh
# ============================================================
set -e

BUDDY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
COMMANDS_DIR="$CLAUDE_DIR/commands"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
CLAUDE_MD="$CLAUDE_DIR/CLAUDE.md"

echo "=== claude-buddy MCP installer ==="
echo "Project dir: $BUDDY_DIR"
echo ""

# ── 1. Install dependencies & build ──────────────────────────
echo "[1/5] Installing dependencies..."
cd "$BUDDY_DIR"
npm install --silent 2>/dev/null
echo "[1/5] Building TypeScript..."
npx tsc
echo "  ✓ Build complete"

# ── 2. Register MCP server ───────────────────────────────────
echo "[2/5] Registering MCP server..."
claude mcp remove --scope user claude-buddy 2>/dev/null || true
claude mcp add --scope user claude-buddy -- node "$BUDDY_DIR/build/index.js"
echo "  ✓ MCP server registered"

# ── 3. Create slash command ──────────────────────────────────
echo "[3/5] Installing /buddy command..."
mkdir -p "$COMMANDS_DIR"
cat > "$COMMANDS_DIR/buddy.md" << 'CMDEOF'
The user wants to interact with their virtual pet buddy. Parse the subcommand from the arguments to determine the action:

- No argument or "show" → call buddy_show tool
- "card" → call buddy_card tool (show stat card)
- "pet" → call buddy_pet tool (pet the buddy)
- "customize" or "custom" (with optional params like species, eyes, hat) → call buddy_customize tool
- "hunt" (with optional criteria like species, rarity) → call buddy_hunt tool
- "mute" → call buddy_mute tool
- "unmute" → call buddy_unmute tool
- "off" → call buddy_off tool

If the tool response contains needs_soul=true, follow the soul generation flow:
1. Read the SOUL GENERATION PROMPT
2. Generate name, personality, catchphrase, quirk
3. Call buddy_set_soul with the JSON
4. Call buddy_show again

Show ASCII art results in code blocks to preserve formatting.

$ARGUMENTS
CMDEOF
echo "  ✓ /buddy command installed"

# ── 4. Configure settings.json (statusLine + hooks + permissions) ──
echo "[4/5] Configuring settings.json..."

# Use node to merge settings without overwriting existing config
node -e "
const fs = require('fs');
const settingsPath = '$SETTINGS_FILE'.replace(/\\\\/g, '/');
const buddyDir = '$BUDDY_DIR'.replace(/\\\\/g, '/');

let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch(e) {}

// Merge permissions
if (!settings.permissions) settings.permissions = {};
if (!settings.permissions.allow) settings.permissions.allow = [];
if (!settings.permissions.allow.includes('mcp__claude-buddy__*')) {
  settings.permissions.allow.push('mcp__claude-buddy__*');
}

// Set statusLine
settings.statusLine = {
  type: 'command',
  command: 'bash ' + buddyDir + '/buddy-status.sh',
  refreshInterval: 1
};

// Set Stop hook
if (!settings.hooks) settings.hooks = {};
settings.hooks.Stop = [{
  hooks: [{
    type: 'command',
    command: 'node ' + buddyDir + '/buddy-react.cjs',
    timeout: 5,
    async: true
  }]
}];

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
console.log('  ✓ settings.json updated (permissions, statusLine, hooks)');
"

# ── 5. Install CLAUDE.md ─────────────────────────────────────
echo "[5/5] Installing CLAUDE.md buddy instructions..."

# Append to CLAUDE.md if it exists, or create it
BUDDY_SECTION="# Buddy Companion

You have a virtual pet buddy via the claude-buddy MCP server. The buddy is displayed persistently in the terminal via the status line.

## Proactive Reactions (MUST DO)
- At the END of EVERY response, call \`buddy_speak\` with a brief context of what you just did.
- This writes a reaction that the status line shows as a temporary speech bubble (~10 seconds).
- Do NOT display the buddy_speak result — just call it silently.
- If the buddy is muted or hidden, skip this.

## Commands
The user uses \`/buddy\` with optional subcommands:
- \`/buddy\` → show buddy
- \`/buddy card\` → stat card
- \`/buddy pet\` → pet
- \`/buddy customize\` → customize appearance
- \`/buddy hunt\` → search for dream buddy
- \`/buddy mute/unmute/off\` → control visibility

When showing ASCII art, use code blocks. For species changes, follow the needs_soul flow."

if [ -f "$CLAUDE_MD" ]; then
  # Check if buddy section already exists
  if grep -q "# Buddy Companion" "$CLAUDE_MD" 2>/dev/null; then
    echo "  ✓ CLAUDE.md already has buddy instructions (skipped)"
  else
    echo "" >> "$CLAUDE_MD"
    echo "$BUDDY_SECTION" >> "$CLAUDE_MD"
    echo "  ✓ Buddy instructions appended to CLAUDE.md"
  fi
else
  echo "$BUDDY_SECTION" > "$CLAUDE_MD"
  echo "  ✓ CLAUDE.md created"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "=== Installation complete! ==="
echo ""
echo "Your buddy is ready. Start a new Claude Code session and type /buddy"
echo ""
echo "Commands:"
echo "  /buddy           Show your buddy"
echo "  /buddy card      Stat card"
echo "  /buddy pet       Pet your buddy"
echo "  /buddy customize Change appearance"
echo "  /buddy hunt      Find your dream buddy"
echo "  /buddy mute      Silence reactions"
echo "  /buddy off       Hide buddy"
echo ""

# Transfer buddy from another machine
if [ ! -f "$HOME/.claude-buddy/buddy.json" ]; then
  echo "Tip: To transfer your buddy from another PC, copy"
  echo "  ~/.claude-buddy/buddy.json"
  echo "from your old machine to this one."
  echo ""
fi
