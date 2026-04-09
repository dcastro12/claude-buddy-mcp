#!/usr/bin/env node
// Claude Code status line — renders buddy RIGHT-ALIGNED with animations
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const STATE_DIR = path.join(os.homedir(), '.claude-buddy');
const BUDDY_FILE = path.join(STATE_DIR, 'buddy.json');
const REACTION_FILE = path.join(STATE_DIR, 'reaction.json');

try {
  if (!fs.existsSync(BUDDY_FILE)) process.exit(0);

  const state = JSON.parse(fs.readFileSync(BUDDY_FILE, 'utf8'));
  const bones = state.bones || {};
  const soul = state.soul || {};
  const prefs = state.preferences || {};

  if (prefs.hidden) process.exit(0);

  const species = bones.species || '';
  const rarity = bones.rarity || '';
  const name = soul.name || species;
  const eyeIdx = bones.eyeVariant || 0;
  const hatIdx = bones.hatStyle || 0;
  const isShiny = bones.isShiny || false;
  const muted = prefs.muted || false;

  // Terminal width
  let cols = process.stdout.columns || 80;
  if (!cols || cols < 40) {
    try { cols = parseInt(execSync('tput cols 2>/dev/null').toString().trim()) || 80; } catch(e) { cols = 80; }
  }

  const eyes = ['·', '✦', '×', '◉', '@', '°'];
  const eye = eyes[eyeIdx] || '·';

  const colors = {
    Common: '\x1b[38;2;120;120;150m',
    Uncommon: '\x1b[38;2;80;200;120m',
    Rare: '\x1b[38;2;100;149;237m',
    Epic: '\x1b[38;2;200;120;255m',
    Legendary: '\x1b[38;2;255;200;60m',
  };
  const clr = colors[rarity] || '\x1b[0m';
  const rst = '\x1b[0m';

  const hatList = ['', '\\^^^/', '[___]', '-+-', '(   )', '/^\\', '(___)', ',>'];
  const hat = hatList[hatIdx] || '';

  // All 18 species × 3 animation frames
  const sprites = {
    Duck: [
      ['    __      ', '  <(E )___  ', '   (  ._>   ', "    `--´    "],
      ['    __      ', '  <(E )___  ', '   (  ._>   ', "    `--´~   "],
      ['    __      ', '  <(E )___  ', '   (  .__>  ', "    `--´    "],
    ],
    Goose: [
      ['     (E>    ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
      ['    (E>     ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
      ['     (E>>   ', '     ||     ', '   _(__)_   ', '    ^^^^    '],
    ],
    Blob: [
      ['   .----.   ', '  ( E  E )  ', '  (      )  ', "   `----´   "],
      ['  .------.  ', ' (  E  E  ) ', ' (        ) ', "  `------´  "],
      ['    .--.    ', '   (E  E)   ', '   (    )   ', "    `--´    "],
    ],
    Cat: [
      ['   /\\_/\\    ', '  ( E   E)  ', '  (  ω  )   ', '  (")_(")   '],
      ['   /\\_/\\    ', '  ( E   E)  ', '  (  ω  )   ', '  (")_(")~  '],
      ['   /\\-/\\    ', '  ( E   E)  ', '  (  ω  )   ', '  (")_(")   '],
    ],
    Dragon: [
      ['  /^\\  /^\\  ', ' <  E  E  > ', ' (   ~~   ) ', "  `-vvvv-´  "],
      ['  /^\\  /^\\  ', ' <  E  E  > ', ' (        ) ', "  `-vvvv-´  "],
      ['  /^\\  /^\\  ', ' <  E  E  > ', ' (   ~~   ) ', "  `-vvvv-´  "],
    ],
    Octopus: [
      ['   .----.   ', '  ( E  E )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
      ['   .----.   ', '  ( E  E )  ', '  (______)  ', '  \\/\\/\\/\\/  '],
      ['   .----.   ', '  ( E  E )  ', '  (______)  ', '  /\\/\\/\\/\\  '],
    ],
    Owl: [
      ['   /\\  /\\   ', '  ((E)(E))  ', '  (  ><  )  ', "   `----´   "],
      ['   /\\  /\\   ', '  ((E)(E))  ', '  (  ><  )  ', '   .----.   '],
      ['   /\\  /\\   ', '  ((E)(-))  ', '  (  ><  )  ', "   `----´   "],
    ],
    Penguin: [
      ['  .---.     ', '  (E>E)     ', ' /(   )\\    ', "  `---´     "],
      ['  .---.     ', '  (E>E)     ', ' |(   )|    ', "  `---´     "],
      ['  .---.     ', '  (E>E)     ', ' /(   )\\    ', "  `---´     "],
    ],
    Turtle: [
      ['   _,--._   ', '  ( E  E )  ', ' /[______]\\ ', '  ``    ``  '],
      ['   _,--._   ', '  ( E  E )  ', ' /[______]\\ ', '   ``  ``   '],
      ['   _,--._   ', '  ( E  E )  ', ' /[======]\\ ', '  ``    ``  '],
    ],
    Snail: [
      [' E    .--.  ', '  \\  ( @ )  ', "   \\_`--´   ", '  ~~~~~~~   '],
      ['  E   .--.  ', '  |  ( @ )  ', "   \\_`--´   ", '  ~~~~~~~   '],
      [' E    .--.  ', '  \\  ( @  ) ', "   \\_`--´   ", '   ~~~~~~   '],
    ],
    Ghost: [
      ['   .----.   ', '  / E  E \\  ', '  |      |  ', '  ~`~``~`~  '],
      ['   .----.   ', '  / E  E \\  ', '  |      |  ', '  `~`~~`~`  '],
      ['   .----.   ', '  / E  E \\  ', '  |      |  ', '  ~~`~~`~~  '],
    ],
    Axolotl: [
      ['}~(______)~{', '}~(E .. E)~{', '  ( .--. )  ', '  (_/  \\_)  '],
      ['~}(______){~', '~}(E .. E){~', '  ( .--. )  ', '  (_/  \\_)  '],
      ['}~(______)~{', '}~(E .. E)~{', '  (  --  )  ', '  ~_/  \\_~  '],
    ],
    Capybara: [
      ['  n______n  ', ' ( E    E ) ', ' (   oo   ) ', "  `------´  "],
      ['  n______n  ', ' ( E    E ) ', ' (   Oo   ) ', "  `------´  "],
      ['  u______n  ', ' ( E    E ) ', ' (   oo   ) ', "  `------´  "],
    ],
    Cactus: [
      [' n  ____  n ', ' | |E  E| | ', ' |_|    |_| ', '   |    |   '],
      ['    ____    ', ' n |E  E| n ', ' |_|    |_| ', '   |    |   '],
      [' n  ____  n ', ' | |E  E| | ', ' |_|    |_| ', '   |    |   '],
    ],
    Robot: [
      ['   .[||].   ', '  [ E  E ]  ', '  [ ==== ]  ', "  `------´  "],
      ['   .[||].   ', '  [ E  E ]  ', '  [ -==- ]  ', "  `------´  "],
      ['   .[||].   ', '  [ E  E ]  ', '  [ ==== ]  ', "  `------´  "],
    ],
    Rabbit: [
      ['   (\\__/)   ', '  ( E  E )  ', ' =(  ..  )= ', '  (")__(")  '],
      ['   (|__/)   ', '  ( E  E )  ', ' =(  ..  )= ', '  (")__(")  '],
      ['   (\\__/)   ', '  ( E  E )  ', ' =( .  . )= ', '  (")__(")  '],
    ],
    Mushroom: [
      [' .-o-OO-o-. ', '(__________)', '   |E  E|   ', '   |____|   '],
      [' .-O-oo-O-. ', '(__________)', '   |E  E|   ', '   |____|   '],
      [' .-o-OO-o-. ', '(__________)', '   |E  E|   ', '   |____|   '],
    ],
    Chonk: [
      ['  /\\    /\\  ', ' ( E    E ) ', ' (   ..   ) ', "  `------´  "],
      ['  /\\    /|  ', ' ( E    E ) ', ' (   ..   ) ', "  `------´  "],
      ['  /\\    /\\  ', ' ( E    E ) ', ' (   ..   ) ', "  `------´~ "],
    ],
  };

  // Body animation: cycle through 3 frames every 9 seconds (3s per frame)
  const bodyFrame = Math.floor(Date.now() / 3000) % 3;
  const specFrames = sprites[species];
  const frameData = specFrames ? specFrames[bodyFrame] || specFrames[0] : ['  ???  ', '  (. .)', '  ( _ )', "  `---´"];

  // Eye replacement
  let spriteLines = frameData.map(l => l.replace(/E/g, eye));

  // Blink animation: 5s open, 1.5s closed, 1.5s open = 8s cycle
  const blinkCycle = Date.now() % 8000;
  const isBlinking = blinkCycle >= 5000 && blinkCycle < 6500;
  if (isBlinking) {
    const eyeRegex = new RegExp(eye.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    spriteLines = spriteLines.map(l => l.replace(eyeRegex, '-'));
  }

  const spriteW = Math.max(...spriteLines.map(l => l.length));

  // Center hat: use ceil so odd differences round right (toward sprite center)
  let hatLine = '';
  if (hat) {
    const padL = Math.max(0, Math.ceil((spriteW - hat.length) / 2));
    hatLine = ' '.repeat(padL) + hat;
  }

  // Check reaction (10 second expiry)
  let reaction = '';
  if (!muted) {
    try {
      if (fs.existsSync(REACTION_FILE)) {
        const r = JSON.parse(fs.readFileSync(REACTION_FILE, 'utf8'));
        const age = (Date.now() - r.timestamp) / 1000;
        if (age < 10 && r.reaction) reaction = r.reaction;
      }
    } catch (e) {}
  }

  // Build sprite block (hat + body + name)
  const spriteBlock = [];
  if (hatLine) spriteBlock.push(hatLine);
  spriteBlock.push(...spriteLines);
  const namePad = Math.max(0, Math.floor((spriteW - name.length) / 2));
  spriteBlock.push(' '.repeat(namePad) + name);

  // Build output
  let rawLines = [];

  if (reaction) {
    // Side-by-side: bubble left, sprite right
    const maxBubbleW = 28;
    const words = reaction.split(' ');
    const textLines = [];
    let cur = '';
    for (const w of words) {
      if (cur.length + w.length + 1 > maxBubbleW) { textLines.push(cur); cur = w; }
      else cur = cur ? cur + ' ' + w : w;
    }
    if (cur) textLines.push(cur);

    const innerW = Math.max(...textLines.map(l => l.length));
    const bubble = [];
    bubble.push('.─' + '─'.repeat(innerW) + '─.');
    for (const l of textLines) bubble.push('| ' + l.padEnd(innerW) + ' |');
    bubble.push("'─" + '─'.repeat(innerW) + "─'");

    const bubbleW = innerW + 4;
    const totalH = Math.max(bubble.length, spriteBlock.length);

    for (let i = 0; i < totalH; i++) {
      const bi = i - (totalH - bubble.length);
      const si = i - (totalH - spriteBlock.length);
      const bLine = bi >= 0 && bi < bubble.length ? bubble[bi] : '';
      const sLine = si >= 0 && si < spriteBlock.length ? spriteBlock[si] : '';
      const conn = bi === Math.floor(bubble.length / 2) ? ' ─ ' : '   ';
      rawLines.push(bLine.padEnd(bubbleW) + conn + sLine.padEnd(spriteW));
    }
  } else {
    rawLines = spriteBlock.map(l => l.padEnd(spriteW));
  }

  // Right-align
  const contentW = Math.max(...rawLines.map(l => l.length));
  const margin = 2;
  const leftPad = Math.max(0, cols - contentW - margin);

  const out = rawLines.map(line => {
    return ' '.repeat(leftPad) + clr + (isShiny ? '✨' + line + '✨' : line) + rst;
  });

  process.stdout.write(out.join('\n') + '\n');
} catch (e) { process.exit(0); }
