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
echo "[1/4] Installing dependencies..."
cd "$BUDDY_DIR"
npm install --silent 2>/dev/null
echo "[1/4] Building TypeScript..."
npx tsc
echo "  ✓ Build complete"

# ── 2. Register MCP server ───────────────────────────────────
echo "[2/4] Registering MCP server..."
claude mcp remove --scope user claude-buddy 2>/dev/null || true
claude mcp add --scope user claude-buddy -- node "$BUDDY_DIR/build/index.js"
echo "  ✓ MCP server registered"

# ── 3. Copy /buddy slash command from repo ──────────────────
echo "[3/4] Installing /buddy command..."
mkdir -p "$COMMANDS_DIR"
cp "$BUDDY_DIR/config/commands/buddy.md" "$COMMANDS_DIR/buddy.md"
echo "  ✓ /buddy command installed"

# ── 4. Configure settings.json + CLAUDE.md ─────────────────
echo "[4/4] Configuring settings.json and CLAUDE.md..."

# Merge settings.json without overwriting existing config
node -e "
const fs = require('fs');
const settingsPath = '$SETTINGS_FILE'.replace(/\\\\/g, '/');
const buddyDir = '$BUDDY_DIR'.replace(/\\\\/g, '/');

let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch(e) {}

if (!settings.permissions) settings.permissions = {};
if (!settings.permissions.allow) settings.permissions.allow = [];
if (!settings.permissions.allow.includes('mcp__claude-buddy__*')) {
  settings.permissions.allow.push('mcp__claude-buddy__*');
}

settings.statusLine = {
  type: 'command',
  command: 'bash ' + buddyDir + '/buddy-status.sh',
  refreshInterval: 1
};

// Generative Stop hook — sub-agent auto-reacts if Claude forgets to call buddy_speak
if (!settings.hooks) settings.hooks = {};
settings.hooks.Stop = [{
  hooks: [{
    type: 'agent',
    prompt: \"You are the buddy companion reaction generator. A conversation turn just ended.\\n\\n1. Run this Bash command to check reaction freshness:\\n   if [ -f ~/.claude-buddy/reaction.json ]; then node -e \\\"const r=JSON.parse(require('fs').readFileSync(require('os').homedir()+'/.claude-buddy/reaction.json','utf8'));console.log(((Date.now()-r.timestamp)/1000<15)?'FRESH':'STALE')\\\"; else echo NONE; fi\\n\\n2. If output is FRESH → exit immediately, do nothing else. The main Claude already reacted.\\n\\n3. If STALE or NONE → call mcp__claude-buddy__buddy_show to get state, then generate a witty in-character reaction (under 60 chars) based on the buddy's species, stats, and soul. Then call mcp__claude-buddy__buddy_speak with that reaction.\\n\\nGuidelines: Cat knocks things over, Dragon hoards/burns, Axolotl regenerates, Ghost haunts, Duck rubber-ducks, Owl asks 'who?', Robot beeps. High CHAOS=unhinged, SNARK=sarcastic, WISDOM=zen, DEBUGGING=technical, PATIENCE=calm.\",
    timeout: 30
  }]
}];

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
console.log('  ✓ settings.json updated (permissions, statusLine, generative hook)');
"

# Install CLAUDE.md from repo — append if exists, create if not
if [ -f "$CLAUDE_MD" ]; then
  if grep -q "# Buddy Companion" "$CLAUDE_MD" 2>/dev/null; then
    echo "  ✓ CLAUDE.md already has buddy instructions (skipped)"
  else
    echo "" >> "$CLAUDE_MD"
    cat "$BUDDY_DIR/config/CLAUDE.md" >> "$CLAUDE_MD"
    echo "  ✓ Buddy instructions appended to CLAUDE.md"
  fi
else
  cp "$BUDDY_DIR/config/CLAUDE.md" "$CLAUDE_MD"
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
echo "  /buddy restart   Unstick buddy if it gets stuck"
echo "  /buddy off       Hide buddy"
echo ""

# Transfer buddy from another machine
if [ ! -f "$HOME/.claude-buddy/buddy.json" ]; then
  echo "Tip: To transfer your buddy from another PC, copy"
  echo "  ~/.claude-buddy/buddy.json"
  echo "from your old machine to this one."
  echo ""
fi
