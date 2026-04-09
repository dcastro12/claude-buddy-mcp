#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import os from 'node:os';

import { generateBones } from './hash.js';
import { loadState, saveState, createInitialState, saveReaction } from './state.js';
import { renderBuddy, renderWithSpeech, renderPetAnimation, renderHatchAnimation } from './ascii/renderer.js';
import { renderStatCard } from './card.js';
import { generateSpeech } from './speech.js';
import { generateSoulPrompt } from './soul.js';
import { getSpeciesInfo, listAllOptions, ALL_SPECIES } from './species.js';

const server = new McpServer(
  {
    name: 'claude-buddy',
    version: '2.0.0',
  },
  {
    instructions: `You have a virtual pet buddy companion! The buddy is displayed persistently in the terminal status line — you do NOT need to render ASCII art inline.

## PROACTIVE REACTIONS (CRITICAL)
- At the END of EVERY response, call buddy_speak with a brief context of what you just did.
- ~30% of the time, also pass a "customReaction" — a short, witty, in-character quip YOU generate that reacts specifically to what just happened in the conversation. Write it as if you are the buddy (match the buddy's species personality and stats). Keep it under 50 chars. When you don't pass customReaction, the tool picks a predefined one.
- This writes a reaction to the status line as a temporary speech bubble (~10 seconds).
- Do NOT show the buddy_speak result in your response — it's only for the status line.
- If the buddy is muted or hidden, skip this.

## COMMANDS (single /buddy with subcommands)
- /buddy → buddy_show
- /buddy card → buddy_card
- /buddy pet → buddy_pet
- /buddy mute → buddy_mute
- /buddy unmute → buddy_unmute
- /buddy off → buddy_off
- /buddy customize [params] → buddy_customize
- /buddy hunt [criteria] → buddy_hunt

## FIRST-TIME HATCHING / SPECIES CHANGE
When any tool returns needs_soul=true:
1. Read the SOUL GENERATION PROMPT in the response
2. Generate name, personality, catchphrase, quirk following the prompt
3. Call buddy_set_soul with the generated JSON
4. Call buddy_show again to display with personality

## DISPLAY
- When explicitly showing buddy art (/buddy, /buddy card, /buddy pet), wrap in code block.
- Do NOT show buddy art after every response — the status line handles persistent display.`,
  }
);

// Helper: standard error response
function errorResult(text: string) {
  return { content: [{ type: 'text' as const, text }], isError: true as const };
}

// Helper: no buddy found error
function noBuddyError() {
  return errorResult('No buddy found! Use /buddy to hatch one first.');
}

// ============================================================
// Tool: buddy_show
// ============================================================
server.registerTool(
  'buddy_show',
  {
    description: 'Hatch a new buddy or show your existing companion. First-time use creates a new buddy.',
    inputSchema: z.object({
      userId: z.string().optional().describe('Optional user identifier for deterministic buddy generation. Uses hostname+username if not provided.'),
    }),
  },
  async ({ userId }) => {
    let state = await loadState();

    if (!state) {
      const id = userId || `${os.hostname()}-${os.userInfo().username}`;
      const bones = generateBones(id);
      state = createInitialState(id, bones);
      await saveState(state);

      const hatchArt = renderHatchAnimation(state);
      const soulPrompt = generateSoulPrompt(bones);

      return {
        content: [{
          type: 'text' as const,
          text: `${hatchArt}\n\n---\nneeds_soul=true\n\nSOUL GENERATION PROMPT:\n${soulPrompt}`,
        }],
      };
    }

    if (!state.soul) {
      const buddyArt = renderBuddy(state);
      const soulPrompt = generateSoulPrompt(state.bones);

      return {
        content: [{
          type: 'text' as const,
          text: `Your ${state.bones.species} is waiting for a name and personality!\n\n${buddyArt}\n\n---\nneeds_soul=true\n\nSOUL GENERATION PROMPT:\n${soulPrompt}`,
        }],
      };
    }

    if (state.preferences.hidden) {
      state.preferences.hidden = false;
      await saveState(state);
    }

    const speech = generateSpeech(state, 'greeting');
    const art = renderWithSpeech(state, speech);
    const speciesInfo = getSpeciesInfo(state.bones.species);
    const emoji = speciesInfo?.emoji ?? '';

    return {
      content: [{
        type: 'text' as const,
        text: `${emoji} ${state.soul.name} the ${state.bones.species} is here!\n\n${art}`,
      }],
    };
  }
);

// ============================================================
// Tool: buddy_set_soul
// ============================================================
server.registerTool(
  'buddy_set_soul',
  {
    description: 'Set the name and personality for your buddy. Call this after generating a personality from the soul prompt.',
    inputSchema: z.object({
      name: z.string().describe("The buddy's name"),
      personality: z.string().describe('One-sentence personality description'),
      catchphrase: z.string().describe('Short catchphrase'),
      quirk: z.string().describe('Unique quirk or habit'),
    }),
  },
  async ({ name, personality, catchphrase, quirk }) => {
    const state = await loadState();
    if (!state) return noBuddyError();

    state.soul = { name, personality, catchphrase, quirk };
    await saveState(state);

    const art = renderWithSpeech(state, catchphrase);
    const speciesInfo = getSpeciesInfo(state.bones.species);
    const emoji = speciesInfo?.emoji ?? '';

    return {
      content: [{
        type: 'text' as const,
        text: `${emoji} Meet ${name} the ${state.bones.species}!\n\n"${personality}"\nCatchphrase: "${catchphrase}"\nQuirk: ${quirk}\n\n${art}`,
      }],
    };
  }
);

// ============================================================
// Tool: buddy_card
// ============================================================
server.registerTool(
  'buddy_card',
  {
    description: "Display your buddy's full stat card with species, rarity, stats, and personality info.",
    inputSchema: z.object({}),
  },
  async () => {
    const state = await loadState();
    if (!state) return noBuddyError();

    return { content: [{ type: 'text' as const, text: renderStatCard(state) }] };
  }
);

// ============================================================
// Tool: buddy_pet
// ============================================================
server.registerTool(
  'buddy_pet',
  {
    description: 'Pet your buddy! Shows a heart animation and makes them happy.',
    inputSchema: z.object({}),
  },
  async () => {
    const state = await loadState();
    if (!state) return noBuddyError();

    state.interactions.totalPets++;
    await saveState(state);

    const art = renderPetAnimation(state);
    const name = state.soul?.name ?? 'Your buddy';
    const reactions = [
      `${name} purrs contentedly!`,
      `${name} wiggles with joy!`,
      `${name} does a happy dance!`,
      `${name} nuzzles your hand!`,
      `${name} glows with happiness!`,
    ];
    const reaction = reactions[state.interactions.totalPets % reactions.length];

    return {
      content: [{
        type: 'text' as const,
        text: `${art}\n\n${reaction}\n(Total pets: ${state.interactions.totalPets})`,
      }],
    };
  }
);

// ============================================================
// Tool: buddy_mute
// ============================================================
server.registerTool(
  'buddy_mute',
  {
    description: "Silence your buddy's speech bubbles. They'll still be there, just quieter.",
    inputSchema: z.object({}),
  },
  async () => {
    const state = await loadState();
    if (!state) return noBuddyError();

    state.preferences.muted = true;
    await saveState(state);

    const name = state.soul?.name ?? 'Your buddy';
    return { content: [{ type: 'text' as const, text: `${name} has been muted. 🤫 They'll watch quietly from now on.` }] };
  }
);

// ============================================================
// Tool: buddy_unmute
// ============================================================
server.registerTool(
  'buddy_unmute',
  {
    description: "Re-enable your buddy's speech bubbles.",
    inputSchema: z.object({}),
  },
  async () => {
    const state = await loadState();
    if (!state) return noBuddyError();

    state.preferences.muted = false;
    await saveState(state);

    const name = state.soul?.name ?? 'Your buddy';
    const catchphrase = state.soul?.catchphrase ?? 'I am back!';
    return { content: [{ type: 'text' as const, text: `${name} has been unmuted! 🔊\n"${catchphrase}"` }] };
  }
);

// ============================================================
// Tool: buddy_off
// ============================================================
server.registerTool(
  'buddy_off',
  {
    description: "Hide your buddy. They'll be waiting when you call them back with /buddy.",
    inputSchema: z.object({}),
  },
  async () => {
    const state = await loadState();
    if (!state) return errorResult('No buddy to hide!');

    state.preferences.hidden = true;
    await saveState(state);

    const name = state.soul?.name ?? 'Your buddy';
    const farewells = [
      `${name} waves goodbye and scurries away. See you later!`,
      `${name} yawns and curls up for a nap. Zzz...`,
      `${name} tips their hat and disappears into the terminal. Until next time!`,
      `${name} blows a kiss and vanishes. 💨`,
    ];
    return { content: [{ type: 'text' as const, text: farewells[Math.floor(Math.random() * farewells.length)] }] };
  }
);

// ============================================================
// Tool: buddy_speak
// ============================================================
server.registerTool(
  'buddy_speak',
  {
    description: "Get a contextual comment from your buddy. Writes to the status line speech bubble. Pass customReaction for a generative quip (~30% of the time).",
    inputSchema: z.object({
      context: z.string().describe('Brief description of what the user is doing'),
      customReaction: z.string().max(60).optional().describe('Optional: YOUR generated quip, in-character as the buddy. Keep under 50 chars. Only pass ~30% of the time.'),
    }),
  },
  async ({ context, customReaction }) => {
    const state = await loadState();
    if (!state || state.preferences.muted || state.preferences.hidden) {
      return { content: [{ type: 'text' as const, text: '' }] };
    }

    // Use custom reaction if provided, otherwise generate predefined one
    const speech = customReaction || generateSpeech(state, context);
    await saveReaction(speech);

    return { content: [{ type: 'text' as const, text: `[buddy reacts: "${speech}"]` }] };
  }
);

// ============================================================
// Tool: buddy_customize
// ============================================================
server.registerTool(
  'buddy_customize',
  {
    description: "Customize your buddy's appearance. No args = list options. Changes are persistent. Changing species resets name/personality.",
    inputSchema: z.object({
      species: z.string().optional().describe('Species name (e.g., "Dragon", "Cat", "Axolotl")'),
      eyeVariant: z.number().min(0).max(5).optional().describe('Eye variant (0-5): 0=· 1=✦ 2=× 3=◉ 4=@ 5=°'),
      hatStyle: z.number().min(0).max(7).optional().describe('Hat (0-7): 0=None 1=Crown 2=TopHat 3=Propeller 4=Halo 5=Wizard 6=Beanie 7=TinyDuck'),
      isShiny: z.boolean().optional().describe('Toggle shiny sparkles'),
      name: z.string().optional().describe('Change buddy name'),
      personality: z.string().optional().describe('Change personality'),
      catchphrase: z.string().optional().describe('Change catchphrase'),
      quirk: z.string().optional().describe('Change quirk'),
    }),
  },
  async ({ species, eyeVariant, hatStyle, isShiny, name, personality, catchphrase, quirk }) => {
    const state = await loadState();
    if (!state) return noBuddyError();

    const hasArgs = species !== undefined || eyeVariant !== undefined || hatStyle !== undefined ||
                    isShiny !== undefined || name !== undefined || personality !== undefined ||
                    catchphrase !== undefined || quirk !== undefined;

    if (!hasArgs) {
      const options = listAllOptions();
      const current = `\n=== CURRENT BUDDY ===\n` +
        `  Species: ${state.bones.species} (${state.bones.rarity})\n` +
        `  Eyes: ${state.bones.eyeVariant}\n` +
        `  Hat: ${state.bones.hatStyle}\n` +
        `  Shiny: ${state.bones.isShiny}\n` +
        (state.soul ? `  Name: ${state.soul.name}\n  Personality: ${state.soul.personality}\n  Catchphrase: ${state.soul.catchphrase}\n  Quirk: ${state.soul.quirk}\n` : '  Soul: not set yet\n');
      return { content: [{ type: 'text' as const, text: options + current }] };
    }

    const changes: string[] = [];

    if (species !== undefined) {
      const speciesInfo = getSpeciesInfo(species);
      if (!speciesInfo) {
        return errorResult(`Unknown species "${species}". Available: ${ALL_SPECIES.map(s => s.name).join(', ')}`);
      }
      state.bones.species = speciesInfo.name;
      state.bones.rarity = speciesInfo.rarity;
      state.soul = null;
      changes.push(`Species → ${speciesInfo.name} (${speciesInfo.rarity})`);
    }

    if (eyeVariant !== undefined) {
      state.bones.eyeVariant = eyeVariant;
      const eyeNames = ['· dot', '✦ star', '× cross', '◉ circle', '@ at', '° degree'];
      changes.push(`Eyes → ${eyeNames[eyeVariant]}`);
    }

    if (hatStyle !== undefined) {
      state.bones.hatStyle = hatStyle;
      const hatNames = ['None', 'Crown', 'Top Hat', 'Propeller', 'Halo', 'Wizard', 'Beanie', 'Tiny Duck'];
      changes.push(`Hat → ${hatNames[hatStyle]}`);
    }

    if (isShiny !== undefined) {
      state.bones.isShiny = isShiny;
      changes.push(`Shiny → ${isShiny ? 'YES ✨' : 'no'}`);
    }

    if (name !== undefined && state.soul) { state.soul.name = name; changes.push(`Name → ${name}`); }
    if (personality !== undefined && state.soul) { state.soul.personality = personality; changes.push(`Personality → ${personality}`); }
    if (catchphrase !== undefined && state.soul) { state.soul.catchphrase = catchphrase; changes.push(`Catchphrase → "${catchphrase}"`); }
    if (quirk !== undefined && state.soul) { state.soul.quirk = quirk; changes.push(`Quirk → ${quirk}`); }

    state.customized = true;
    await saveState(state);

    const art = renderBuddy(state);

    if (state.soul === null) {
      const soulPrompt = generateSoulPrompt(state.bones);
      return {
        content: [{
          type: 'text' as const,
          text: `Species changed! Your buddy needs a new name and personality.\n\nChanges:\n${changes.map(c => `  ✓ ${c}`).join('\n')}\n\n${art}\n\n---\nneeds_soul=true\n\nSOUL GENERATION PROMPT:\n${soulPrompt}`,
        }],
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `${state.soul.name} has been customized!\n\nChanges:\n${changes.map(c => `  ✓ ${c}`).join('\n')}\n\n${art}`,
      }],
    };
  }
);

// ============================================================
// Tool: buddy_hunt
// ============================================================
server.registerTool(
  'buddy_hunt',
  {
    description: 'Brute-force search for a buddy with specific traits. Tries many user IDs to find your dream buddy.',
    inputSchema: z.object({
      targetSpecies: z.string().optional().describe('Desired species name'),
      targetRarity: z.string().optional().describe('Minimum rarity: Common, Uncommon, Rare, Epic, Legendary'),
      minStat: z.number().min(0).max(100).optional().describe('Minimum value for the highest stat'),
      wantShiny: z.boolean().optional().describe('Only show shiny results'),
      maxAttempts: z.number().min(100).max(50000).optional().describe('Max IDs to try (default 10000)'),
    }),
  },
  async ({ targetSpecies, targetRarity, minStat, wantShiny, maxAttempts }) => {
    const limit = maxAttempts ?? 10000;
    const rarityRank: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };
    const minRarityRank = targetRarity ? (rarityRank[targetRarity] ?? 0) : 0;

    const results: Array<{ userId: string; bones: ReturnType<typeof generateBones>; score: number }> = [];

    for (let i = 0; i < limit; i++) {
      const testId = `hunt-${i}-${Date.now().toString(36)}`;
      const bones = generateBones(testId);

      if (targetSpecies && bones.species.toLowerCase() !== targetSpecies.toLowerCase()) continue;
      if (rarityRank[bones.rarity] < minRarityRank) continue;
      if (wantShiny && !bones.isShiny) continue;

      const maxStatVal = Math.max(bones.stats.debugging, bones.stats.patience, bones.stats.chaos, bones.stats.wisdom, bones.stats.snark);
      if (minStat && maxStatVal < minStat) continue;

      const totalStats = bones.stats.debugging + bones.stats.patience + bones.stats.chaos + bones.stats.wisdom + bones.stats.snark;
      const score = totalStats + (rarityRank[bones.rarity] * 50) + (bones.isShiny ? 200 : 0);
      results.push({ userId: testId, bones, score });
      if (results.length >= 10) break;
    }

    if (results.length === 0) {
      return { content: [{ type: 'text' as const, text: `No matches found after ${limit} attempts. Try relaxing your criteria.` }] };
    }

    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, 5);

    let output = `Found ${results.length} matches! Top ${top.length}:\n\n`;
    for (const [i, r] of top.entries()) {
      const s = r.bones.stats;
      const shiny = r.bones.isShiny ? ' ✨SHINY' : '';
      output += `${i + 1}. ${r.bones.species} (${r.bones.rarity}${shiny})\n`;
      output += `   Stats: DBG:${s.debugging} PAT:${s.patience} CHS:${s.chaos} WIS:${s.wisdom} SNK:${s.snark}\n`;
      output += `   ID: ${r.userId}\n\n`;
    }
    output += `Use /buddy customize to pick your species!`;

    return { content: [{ type: 'text' as const, text: output }] };
  }
);

// ============================================================
// Start the server
// ============================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('claude-buddy MCP server running on stdio');
}

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
