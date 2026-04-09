import { SPECIES_BY_RARITY, RARITY_WEIGHTS, RARITY_STAT_FLOORS, type Rarity, type SpeciesInfo } from './species.js';

const SALT = 'friend-2026-401';

export interface BuddyBones {
  species: string;
  rarity: Rarity;
  isShiny: boolean;
  stats: {
    debugging: number;
    patience: number;
    chaos: number;
    wisdom: number;
    snark: number;
  };
  eyeVariant: number;
  hatStyle: number;
}

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function hashWithSuffix(userId: string, suffix: string): number {
  return fnv1a(userId + SALT + suffix);
}

function selectSpecies(hash: number): SpeciesInfo {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = hash % total;

  const rarityOrder: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  for (const rarity of rarityOrder) {
    roll -= RARITY_WEIGHTS[rarity];
    if (roll < 0) {
      const species = SPECIES_BY_RARITY[rarity];
      const idx = hash % species.length;
      return species[idx];
    }
  }

  return SPECIES_BY_RARITY.Common[0];
}

function generateStat(hash: number, floor: number): number {
  const range = 100 - floor;
  return floor + (hash % (range + 1));
}

export function generateBones(userId: string): BuddyBones {
  const primaryHash = fnv1a(userId + SALT);
  const species = selectSpecies(primaryHash);
  const floor = RARITY_STAT_FLOORS[species.rarity];

  return {
    species: species.name,
    rarity: species.rarity,
    isShiny: (hashWithSuffix(userId, 'shiny') % 100) === 0,
    stats: {
      debugging: generateStat(hashWithSuffix(userId, 'debug'), floor),
      patience: generateStat(hashWithSuffix(userId, 'patience'), floor),
      chaos: generateStat(hashWithSuffix(userId, 'chaos'), floor),
      wisdom: generateStat(hashWithSuffix(userId, 'wisdom'), floor),
      snark: generateStat(hashWithSuffix(userId, 'snark'), floor),
    },
    eyeVariant: hashWithSuffix(userId, 'eyes') % 6,
    hatStyle: hashWithSuffix(userId, 'hat') % 8, // 8 hat styles: none + 7 hats
  };
}
