import type { BuddyState } from './state.js';

function statBar(value: number): string {
  const filled = Math.round(value / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function padCenter(text: string, width: number): string {
  const pad = width - text.length;
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

export function renderStatCard(state: BuddyState): string {
  const { bones, soul, interactions } = state;
  const name = soul?.name ?? '???';
  const personality = soul?.personality ?? 'Awaiting soul generation...';
  const catchphrase = soul?.catchphrase ?? '';
  const quirk = soul?.quirk ?? '';
  const shiny = bones.isShiny ? ' ✨ SHINY ✨' : '';
  const hatchDate = interactions.hatchDate.split('T')[0];
  const w = 34; // inner width

  const lines = [
    '╔' + '═'.repeat(w) + '╗',
    '║' + padCenter('★ BUDDY CARD ★', w) + '║',
    '║' + ' '.repeat(w) + '║',
    '║' + `  Name: ${name}`.padEnd(w) + '║',
    '║' + `  Species: ${bones.species} (${bones.rarity})`.padEnd(w) + '║',
  ];

  if (bones.isShiny) {
    lines.push('║' + padCenter('✨ SHINY ✨', w) + '║');
  }

  lines.push(
    '╠' + '═'.repeat(w) + '╣',
    '║' + `  DEBUGGING  ${statBar(bones.stats.debugging)}  ${String(bones.stats.debugging).padStart(3)}` .padEnd(w) + '║',
    '║' + `  PATIENCE   ${statBar(bones.stats.patience)}  ${String(bones.stats.patience).padStart(3)}` .padEnd(w) + '║',
    '║' + `  CHAOS      ${statBar(bones.stats.chaos)}  ${String(bones.stats.chaos).padStart(3)}` .padEnd(w) + '║',
    '║' + `  WISDOM     ${statBar(bones.stats.wisdom)}  ${String(bones.stats.wisdom).padStart(3)}` .padEnd(w) + '║',
    '║' + `  SNARK      ${statBar(bones.stats.snark)}  ${String(bones.stats.snark).padStart(3)}` .padEnd(w) + '║',
    '╠' + '═'.repeat(w) + '╣',
  );

  if (catchphrase) {
    lines.push('║' + `  "${catchphrase}"`.padEnd(w) + '║');
  }
  if (personality) {
    // Word wrap personality
    const maxLine = w - 4;
    const words = personality.split(' ');
    let current = '';
    for (const word of words) {
      if (current.length + word.length + 1 > maxLine) {
        lines.push('║' + `  ${current}`.padEnd(w) + '║');
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push('║' + `  ${current}`.padEnd(w) + '║');
  }
  if (quirk) {
    lines.push('║' + `  Quirk: ${quirk}`.substring(0, w).padEnd(w) + '║');
  }

  lines.push(
    '╠' + '═'.repeat(w) + '╣',
    '║' + `  Hatched: ${hatchDate}`.padEnd(w) + '║',
    '║' + `  Pets received: ${interactions.totalPets}`.padEnd(w) + '║',
    '╚' + '═'.repeat(w) + '╝',
  );

  return lines.join('\n');
}
