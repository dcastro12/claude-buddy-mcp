export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface SpeciesInfo {
  name: string;
  rarity: Rarity;
  emoji: string;
}

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  Common: 50,
  Uncommon: 25,
  Rare: 15,
  Epic: 8,
  Legendary: 2,
};

export const RARITY_STAT_FLOORS: Record<Rarity, number> = {
  Common: 5,
  Uncommon: 15,
  Rare: 25,
  Epic: 35,
  Legendary: 50,
};

export const SPECIES_BY_RARITY: Record<Rarity, SpeciesInfo[]> = {
  Common: [
    { name: 'Duck', rarity: 'Common', emoji: '🦆' },
    { name: 'Goose', rarity: 'Common', emoji: '🪿' },
    { name: 'Blob', rarity: 'Common', emoji: '🫠' },
    { name: 'Turtle', rarity: 'Common', emoji: '🐢' },
    { name: 'Snail', rarity: 'Common', emoji: '🐌' },
    { name: 'Mushroom', rarity: 'Common', emoji: '🍄' },
    { name: 'Chonk', rarity: 'Common', emoji: '🐈' },
  ],
  Uncommon: [
    { name: 'Octopus', rarity: 'Uncommon', emoji: '🐙' },
    { name: 'Penguin', rarity: 'Uncommon', emoji: '🐧' },
    { name: 'Cactus', rarity: 'Uncommon', emoji: '🌵' },
    { name: 'Rabbit', rarity: 'Uncommon', emoji: '🐰' },
  ],
  Rare: [
    { name: 'Cat', rarity: 'Rare', emoji: '🐱' },
    { name: 'Owl', rarity: 'Rare', emoji: '🦉' },
    { name: 'Capybara', rarity: 'Rare', emoji: '🦫' },
    { name: 'Robot', rarity: 'Rare', emoji: '🤖' },
  ],
  Epic: [
    { name: 'Ghost', rarity: 'Epic', emoji: '👻' },
    { name: 'Axolotl', rarity: 'Epic', emoji: '🦎' },
  ],
  Legendary: [
    { name: 'Dragon', rarity: 'Legendary', emoji: '🐉' },
  ],
};

export const ALL_SPECIES: SpeciesInfo[] = Object.values(SPECIES_BY_RARITY).flat();

export function getSpeciesInfo(name: string): SpeciesInfo | undefined {
  return ALL_SPECIES.find(s => s.name.toLowerCase() === name.toLowerCase());
}

export function listAllOptions(): string {
  let out = '=== AVAILABLE SPECIES ===\n\n';

  for (const [rarity, species] of Object.entries(SPECIES_BY_RARITY)) {
    out += `[${rarity}]\n`;
    for (const s of species) {
      out += `  ${s.emoji} ${s.name}\n`;
    }
    out += '\n';
  }

  out += '=== EYE VARIANTS ===\n';
  const eyeNames = ['· (dot)', '✦ (star)', '× (cross)', '◉ (circle)', '@ (at)', '° (degree)'];
  eyeNames.forEach((name, i) => { out += `  ${i}: ${name}\n`; });

  out += '\n=== HAT STYLES ===\n';
  const hatNames = ['None', 'Crown \\^^^/', 'Top Hat [___]', 'Propeller -+-', 'Halo (   )', 'Wizard /^\\', 'Beanie (___)', 'Tiny Duck ,>'];
  hatNames.forEach((name, i) => { out += `  ${i}: ${name}\n`; });

  out += '\n=== OTHER ===\n';
  out += '  Shiny: true / false (adds ✨ sparkles)\n';

  return out;
}
