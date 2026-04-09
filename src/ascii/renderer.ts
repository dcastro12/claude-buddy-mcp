import { SPRITES } from './sprites.js';
import { EYE_VARIANTS } from './eyes.js';
import { HAT_STYLES, HAT_NAMES } from './hats.js';
import type { BuddyState } from '../state.js';

function getSprite(state: BuddyState, frame?: number): string[] {
  const { bones } = state;
  const spriteFrames = SPRITES[bones.species];
  if (!spriteFrames) return [`[Unknown: ${bones.species}]`];

  const frameIdx = frame ?? 0;
  const body = [...spriteFrames[frameIdx % spriteFrames.length]];

  // Replace eye placeholder
  const eye = EYE_VARIANTS[bones.eyeVariant] ?? EYE_VARIANTS[0];
  const replaced = body.map(line => line.replaceAll('·', eye));

  // Add hat line above, centered to sprite width
  const hatName = HAT_NAMES[bones.hatStyle] ?? 'none';
  const hatRaw = HAT_STYLES[hatName];
  const spriteWidth = Math.max(...replaced.map(l => l.length));
  let lines: string[];
  if (hatRaw) {
    const hatTrimmed = hatRaw.trim();
    const padLeft = Math.max(0, Math.ceil((spriteWidth - hatTrimmed.length) / 2));
    const padRight = Math.max(0, spriteWidth - hatTrimmed.length - padLeft);
    const centeredHat = ' '.repeat(padLeft) + hatTrimmed + ' '.repeat(padRight);
    lines = [centeredHat, ...replaced];
  } else {
    lines = [...replaced];
  }

  // Add shiny sparkles on sides
  if (bones.isShiny) {
    return lines.map((line, i) => {
      if (i % 2 === 0) return '✨' + line + '✨';
      return '  ' + line + '  ';
    });
  }

  return lines;
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSpeechBox(text: string, maxWidth = 32): string[] {
  const textLines = wrapText(text, maxWidth - 4);
  const innerW = Math.max(...textLines.map(l => l.length));
  const boxW = innerW + 4;

  const lines: string[] = [];
  lines.push('┌' + '─'.repeat(boxW - 2) + '┐');
  for (const tl of textLines) {
    lines.push('│ ' + tl.padEnd(innerW) + ' │');
  }
  lines.push('└' + '─'.repeat(boxW - 2) + '┘');
  return lines;
}

function sideBySide(leftBlock: string[], rightBlock: string[], gap = 3): string[] {
  const leftW = Math.max(...leftBlock.map(l => l.length), 0);
  const maxH = Math.max(leftBlock.length, rightBlock.length);
  const result: string[] = [];

  for (let i = 0; i < maxH; i++) {
    // Bottom-align: offset shorter block
    const lIdx = i - (maxH - leftBlock.length);
    const rIdx = i - (maxH - rightBlock.length);
    const lLine = lIdx >= 0 ? leftBlock[lIdx] : '';
    const rLine = rIdx >= 0 ? rightBlock[rIdx] : '';
    result.push(lLine.padEnd(leftW) + ' '.repeat(gap) + rLine);
  }

  return result;
}

export function renderBuddy(state: BuddyState, frame?: number): string {
  const spriteLines = getSprite(state, frame);
  const name = state.soul?.name ?? state.bones.species;
  // Center name under sprite
  const spriteW = Math.max(...spriteLines.map(l => l.length));
  const pad = Math.max(0, Math.floor((spriteW - name.length) / 2));
  const nameLine = ' '.repeat(pad) + name;
  return [...spriteLines, nameLine].join('\n');
}

export function renderWithSpeech(state: BuddyState, speech: string, frame?: number): string {
  if (!speech || state.preferences.muted) return renderBuddy(state, frame);

  const speechBox = buildSpeechBox(speech);
  const spriteLines = getSprite(state, frame);
  const name = state.soul?.name ?? state.bones.species;
  const spriteW = Math.max(...spriteLines.map(l => l.length));
  const pad = Math.max(0, Math.floor((spriteW - name.length) / 2));
  const spriteWithName = [...spriteLines, ' '.repeat(pad) + name];

  // Dash connector between bubble and sprite
  const connectorLine = Math.floor(speechBox.length / 2);
  const speechWithConnector = speechBox.map((line, i) => {
    if (i === connectorLine) return line + ' ─ ';
    return line + '   ';
  });

  const combined = sideBySide(speechWithConnector, spriteWithName);
  return combined.join('\n');
}

export function renderPetAnimation(state: BuddyState): string {
  const spriteLines = getSprite(state, 1);
  const name = state.soul?.name ?? state.bones.species;
  const spriteW = Math.max(...spriteLines.map(l => l.length));
  const pad = Math.max(0, Math.floor((spriteW - name.length) / 2));

  const hearts = '  ❤️  💕  ❤️';
  return [hearts, ...spriteLines, ' '.repeat(pad) + name, hearts].join('\n');
}

export function renderHatchAnimation(state: BuddyState): string {
  const spriteLines = getSprite(state, 0);
  const species = state.bones.species;
  const rarity = state.bones.rarity;
  const shiny = state.bones.isShiny ? ' ✨ SHINY! ✨' : '';

  return [
    '    *  . *  .  *',
    '  .    *    .',
    '    🥚 → 🎉',
    '  .    *    .',
    '    *  . *  .  *',
    '',
    `A wild ${species} appeared!`,
    `Rarity: ${rarity}${shiny}`,
    '',
    ...spriteLines,
    '',
    'Your buddy has hatched! It needs a name and personality.',
  ].join('\n');
}

export function renderBuddyOnly(state: BuddyState, frame?: number): string[] {
  return getSprite(state, frame);
}
