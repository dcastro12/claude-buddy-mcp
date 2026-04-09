#!/usr/bin/env node
// Stop hook: writes a buddy reaction to reaction.json after every Claude response
// Receives hook input via stdin as JSON
const fs = require('fs');
const path = require('path');
const os = require('os');

const STATE_DIR = path.join(os.homedir(), '.claude-buddy');
const BUDDY_FILE = path.join(STATE_DIR, 'buddy.json');
const REACTION_FILE = path.join(STATE_DIR, 'reaction.json');

try {
  // Check if buddy exists and is not muted/hidden
  if (!fs.existsSync(BUDDY_FILE)) process.exit(0);
  const state = JSON.parse(fs.readFileSync(BUDDY_FILE, 'utf8'));
  if (state.preferences?.muted || state.preferences?.hidden) process.exit(0);
  if (!state.bones?.species) process.exit(0);

  const species = state.bones.species;
  const stats = state.bones.stats || {};

  // Species-specific quick quips for hooks (shorter than full speech.ts)
  const speciesQuips = {
    Duck: ['*quack*', '*preens feathers*', '*waddles*'],
    Goose: ['*HONK*', '*hisses softly*', '*flaps wings*'],
    Blob: ['*oozes*', '*jiggles*', '*absorbs*'],
    Cat: ['*purrs*', '*knocks something over*', '*judges silently*'],
    Dragon: ['*smoke puffs*', '*hoards knowledge*', '*rumbles*'],
    Octopus: ['*ink squirt*', '*wiggles tentacles*', '*multitasks*'],
    Owl: ['*head rotates*', '*blinks wisely*', 'Who?'],
    Penguin: ['*slides*', '*waddle waddle*', '*flippers up*'],
    Turtle: ['*retreats briefly*', '*slow nod*', '*emerges*'],
    Snail: ['*leaves a trail*', '*antennae wiggle*', '*slides along*'],
    Ghost: ['*floats*', '*whispers*', 'Boo.'],
    Axolotl: ['*gill wiggle*', '*smiles*', '*regenerates*'],
    Capybara: ['*vibes*', '*sits peacefully*', '*unbothered*'],
    Cactus: ['*grows slightly*', '*stands firm*', '*prickles*'],
    Robot: ['*beep boop*', '*processes*', '*sparks*'],
    Rabbit: ['*nose twitch*', '*ears perk up*', '*thumps foot*'],
    Mushroom: ['*releases spores*', '*glows faintly*', '*grows*'],
    Chonk: ['*loafs*', '*purrs loudly*', '*stretches*'],
  };

  // Pick dominant stat for flavor
  const statEntries = Object.entries(stats);
  const dominant = statEntries.length > 0
    ? statEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : 'debugging';

  const statQuips = {
    debugging: ['*inspects carefully*', '*squints at output*', '*traces the logic*'],
    patience: ['*waits serenely*', '*deep breath*', '*zen mode*'],
    chaos: ['*vibrates chaotically*', '*mischievous grin*', '*unpredictable energy*'],
    wisdom: ['*nods knowingly*', '*contemplates*', '*sage mode*'],
    snark: ['*slow clap*', '*raises eyebrow*', '*smirks*'],
  };

  // 50% species quip, 50% stat quip
  const pool = Math.random() < 0.5
    ? (speciesQuips[species] || ['*watches*'])
    : (statQuips[dominant] || ['*watches*']);

  const reaction = pool[Math.floor(Math.random() * pool.length)];

  // Write reaction
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(REACTION_FILE, JSON.stringify({ reaction, timestamp: Date.now() }));
} catch (e) {
  process.exit(0);
}
