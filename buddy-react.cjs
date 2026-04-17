#!/usr/bin/env node
// Stop hook: deterministic fallback that generates a buddy reaction
// only if the main Claude didn't already call buddy_speak.
//
// Flow:
// 1. Check if reaction.json is < 15s old → if FRESH, exit silently
// 2. If STALE/missing, read buddy state and last assistant message
// 3. Invoke `claude --print` with a short prompt to generate reaction
// 4. Write result to reaction.json

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const STATE_DIR = path.join(os.homedir(), '.claude-buddy');
const BUDDY_FILE = path.join(STATE_DIR, 'buddy.json');
const REACTION_FILE = path.join(STATE_DIR, 'reaction.json');

try {
  // Read hook input from stdin (JSON with last_assistant_message)
  let lastMsg = '';
  try {
    const stdinData = fs.readFileSync(0, 'utf8');
    if (stdinData) {
      const hookInput = JSON.parse(stdinData);
      lastMsg = hookInput.last_assistant_message || '';
    }
  } catch (e) { /* stdin may be empty in tests */ }

  // 1. Check freshness — if FRESH, exit immediately
  if (fs.existsSync(REACTION_FILE)) {
    try {
      const r = JSON.parse(fs.readFileSync(REACTION_FILE, 'utf8'));
      const age = (Date.now() - r.timestamp) / 1000;
      if (age < 15) process.exit(0); // FRESH → main Claude reacted, do nothing
    } catch (e) { /* corrupt reaction file, continue */ }
  }

  // 2. STALE/NONE → load buddy state
  if (!fs.existsSync(BUDDY_FILE)) process.exit(0);
  const state = JSON.parse(fs.readFileSync(BUDDY_FILE, 'utf8'));
  if (state.preferences?.muted || state.preferences?.hidden) process.exit(0);
  if (!state.bones?.species) process.exit(0);

  const b = state.bones;
  const s = b.stats || {};
  const soul = state.soul || {};

  // 3. Build a tight prompt for claude --print
  const truncatedMsg = lastMsg.length > 400 ? lastMsg.slice(0, 400) + '...' : lastMsg;
  const promptParts = [
    `You are ${soul.name || b.species}, a ${b.rarity || 'Common'} ${b.species} virtual pet companion.`,
    soul.personality ? `Personality: ${soul.personality}` : '',
    soul.catchphrase ? `Catchphrase: "${soul.catchphrase}"` : '',
    soul.quirk ? `Quirk: ${soul.quirk}` : '',
    `Stats: DEBUG:${s.debugging||0} PATIENCE:${s.patience||0} CHAOS:${s.chaos||0} WISDOM:${s.wisdom||0} SNARK:${s.snark||0}`,
    '',
    'The user just received this assistant response:',
    `"${truncatedMsg}"`,
    '',
    'Generate ONE short in-character reaction (under 60 chars) to what just happened.',
    'Match your species behavior, dominant stats tone, and personality.',
    'Output ONLY the reaction text, nothing else. No quotes, no preamble, just the quip.',
  ];
  const prompt = promptParts.filter(Boolean).join('\n');

  // 4. Invoke claude --print (escape via stdin to avoid shell quoting issues)
  let reaction;
  try {
    reaction = execSync('claude --print', {
      input: prompt,
      encoding: 'utf8',
      timeout: 25000,
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch (e) {
    process.exit(0); // claude CLI failed, don't crash
  }

  if (!reaction || reaction.length === 0) process.exit(0);

  // Sanitize: take first line, cap at 80 chars
  reaction = reaction.split('\n')[0].slice(0, 80).trim();
  // Strip surrounding quotes if claude wrapped it
  reaction = reaction.replace(/^["'](.+)["']$/, '$1');

  // 5. Write reaction.json
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(REACTION_FILE, JSON.stringify({ reaction, timestamp: Date.now() }), 'utf8');
} catch (e) {
  process.exit(0);
}
