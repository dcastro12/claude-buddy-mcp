import type { BuddyBones } from './hash.js';

export function generateSoulPrompt(bones: BuddyBones): string {
  const shinyText = bones.isShiny ? ' ✨ SHINY!' : '';

  return `Generate a unique personality for this virtual pet buddy companion.

Species: ${bones.species} (${bones.rarity})${shinyText}
Stats (0-100):
  - DEBUGGING: ${bones.stats.debugging}
  - PATIENCE: ${bones.stats.patience}
  - CHAOS: ${bones.stats.chaos}
  - WISDOM: ${bones.stats.wisdom}
  - SNARK: ${bones.stats.snark}

Create:
1. A fitting name (creative, 1-2 words, matching the species vibe)
2. A one-sentence personality description that reflects the stats
3. A short catchphrase they say often (max 10 words)
4. A unique quirk or habit (one sentence)

Guidelines:
- High chaos = chaotic, unpredictable personality
- High wisdom = sage-like, philosophical
- High snark = sarcastic, witty
- High debugging = observant, detail-oriented
- High patience = calm, zen-like
- The species influences the flavor (a Dragon is majestic, a Blob is chill, etc.)
- Shiny buddies should feel extra special

Respond with EXACTLY this JSON format and nothing else:
{"name":"...","personality":"...","catchphrase":"...","quirk":"..."}`;
}
