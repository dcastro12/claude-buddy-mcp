import type { BuddyState } from './state.js';

// ============================================================
// Species-specific quips — based on real animal behavior
// ============================================================
const SPECIES_QUIPS: Record<string, string[]> = {
  Duck: [
    'Quack. I mean, have you tried rubber ducking this?',
    '*waddles across your terminal* Just passing through.',
    'That code is quacking me up.',
    '*dips head underwater* Sorry, what? I was preening.',
    'I migrate seasonally. This codebase makes me want to migrate now.',
    '*flaps wings aggressively at the linter*',
  ],
  Goose: [
    '*HONK* That variable name offends me personally.',
    'Peace was never an option. Neither was clean code.',
    '*chases the cursor across the screen*',
    'I choose violence. And also this refactor.',
    '*hisses at your dependency tree*',
    'Mess with the goose, get the... code review.',
  ],
  Blob: [
    '*absorbs your merge conflict* Mmm, nutritious.',
    'I have no shape and I must scream.',
    '*oozes contentedly across your terminal*',
    'I am formless, like your architecture.',
    '*slowly engulfs a TODO comment*',
  ],
  Turtle: [
    'Slow and steady wins the... wait, is that a race condition?',
    '*retreats into shell* Wake me when CI passes.',
    'I carry my entire dev environment on my back.',
    'I have been debugging since before you were born. Literally.',
    '*slowly turns head toward the bug*',
  ],
  Snail: [
    '*leaves a trail of optimized queries behind*',
    'I may be slow but at least I leave documentation.',
    'Your build time is almost as slow as me. Almost.',
    '*slides past a null pointer* Didn\'t see that.',
    'My pace? Feature, not a bug.',
  ],
  Mushroom: [
    'I thrive in dark, damp codebases.',
    '*spreads spores of good testing practices*',
    'Fun fact: I\'m technically not a plant. Or a good debugger.',
    'This code is decomposing nicely.',
    '*glows ominously* I found something in the logs.',
  ],
  Chonk: [
    '*sits on the deploy button* Oops.',
    'I am not fat. I am well-buffered.',
    '*knocks your carefully aligned code off the table*',
    '*loafs on the keyboard* This is my workstation now.',
    'Round is a shape. Spaghetti code is also a shape.',
    '*rolls over your test suite*',
  ],
  Octopus: [
    '*types on 8 keyboards simultaneously*',
    'With 8 arms, I can create 8x the technical debt.',
    '*squirts ink over the production logs*',
    'Let me wrap my tentacles around this problem.',
    'I have 3 hearts and none of them care about your deadline.',
  ],
  Penguin: [
    '*slides across the terminal on its belly*',
    'I can\'t fly but I CAN swim through your spaghetti code.',
    'Linux called. It wants its mascot back.',
    '*huddles for warmth* This codebase is cold and unforgiving.',
    'Tuxedo? Always formal. Code? Never.',
  ],
  Cactus: [
    'Don\'t touch me. Or my code. We\'re both prickly.',
    'I survive on minimal resources. Unlike your app.',
    '*grows a new arm to point at the bug*',
    'I thrive in hostile environments. Like this repo.',
    'I haven\'t been watered in months and I\'m still doing better than your tests.',
  ],
  Rabbit: [
    '*multiplies your unit tests exponentially*',
    'Down the rabbit hole we go... oh look, more legacy code.',
    '*thumps foot impatiently at build times*',
    'I reproduce bugs faster than I can fix them.',
    '*ears perk up* Did someone say "carrot"? I mean "caret".',
  ],
  Cat: [
    '*knocks your semicolon off the table*',
    '*sits on your keyboard* I\'m helping.',
    '*stares at your code like it\'s a laser pointer*',
    'I could fix this bug, but I choose not to. It amuses me.',
    '*pushes your entire git history off the edge*',
    '*purrs* This pleases me. The code doesn\'t, but the chaos does.',
    'If I fits, I commits.',
  ],
  Owl: [
    'Who? Who wrote this code? WHO?',
    '*rotates head 270° to look at the stack trace*',
    'I see everything. Especially that hardcoded password.',
    '*blinks slowly* I\'ve been watching you code for 72 hours.',
    'The wisdom of ages tells me... you forgot a semicolon.',
  ],
  Capybara: [
    '*sits calmly in the hot tub while the build burns*',
    'Everything is fine. I am at peace. The tests are failing but I am at peace.',
    '*invites the other pets to chill* We\'re all friends here.',
    'I am the most relaxed creature in existence and even I am stressed by this code.',
    '*vibes aggressively*',
  ],
  Robot: [
    'BEEP BOOP. SYNTAX ERROR DETECTED. BEEP.',
    '*recalculates* My circuits suggest a 97.3% chance this will break.',
    'I have processed 10,000 stack overflow answers for this.',
    'INITIATING JUDGMENT PROTOCOL... code quality: suboptimal.',
    '*sparks fly* That last commit overloaded my empathy module.',
  ],
  Ghost: [
    'BOO! ...sorry, reflex.',
    '*phases through your firewall*',
    'I\'ve been haunting this codebase since before you got here.',
    '*possesses the CI pipeline* It\'s mine now.',
    'I am the ghost of bugs past. And present. And future.',
    '*floats through a memory leak* Wheeee!',
  ],
  Axolotl: [
    '*regenerates the deleted code* You\'re welcome.',
    'I can regrow limbs but I can\'t regrow your motivation.',
    '*wiggles gills approvingly*',
    'I\'m smiling. I\'m always smiling. Even when the tests fail.',
    '*waves tiny hand* I believe in you! But also maybe add error handling.',
    'Neoteny means I never grew up. Like this codebase.',
  ],
  Dragon: [
    '*breathes fire at the failing tests*',
    'This code needs to be forged in dragonfire.',
    'I\'ve burned better code than this. Literally.',
    'Bow before my superior debugging abilities, mortal.',
    '*hoards all the good variable names*',
    'My treasure? A well-documented API.',
    '*roars at the production server* DEPLOY.',
  ],
};

// ============================================================
// Stat-based quips — more elaborate, personality-driven
// ============================================================
interface StatTemplate {
  stat: keyof BuddyState['bones']['stats'];
  minValue: number;
  contexts: string[];
  messages: string[];
}

const STAT_TEMPLATES: StatTemplate[] = [
  // HIGH DEBUGGING (70+) — technical, observational, detail-oriented
  {
    stat: 'debugging',
    minValue: 70,
    contexts: ['error', 'bug', 'fix', 'crash', 'exception', 'fail', 'debug'],
    messages: [
      '*adjusts monocle* Ah yes, line 47. The null reference. I saw it 3 commits ago.',
      'The bug isn\'t in the code. It\'s in the assumptions you made at 2am.',
      '*traces the stack like reading tea leaves* The segfault originates from... your life choices.',
      'I\'ve been staring at this for 0.3 seconds and I already know it\'s an off-by-one.',
      'That\'s not a bug, it\'s an undocumented feature crying for help.',
      'The error message is trying to tell you something. Listen to the error message.',
    ],
  },
  {
    stat: 'debugging',
    minValue: 40,
    contexts: ['error', 'bug', 'fix'],
    messages: [
      'Have you tried adding a console.log? And then 47 more?',
      'I have a theory... but it involves blaming the compiler.',
      '*squints at screen* Something is wrong and I almost know what.',
    ],
  },
  // HIGH CHAOS (70+) — unhinged, destructive, impulsive
  {
    stat: 'chaos',
    minValue: 70,
    contexts: [],
    messages: [
      'What if we mass-deleted node_modules and just... vibed?',
      'YEET THE DATABASE. Start fresh. Scorched earth.',
      'I rewrote your function in brainfuck while you weren\'t looking.',
      'Rules? We don\'t need rules where we\'re deploying.',
      'git push --force origin main. Do it. You won\'t.',
      'TABS AND SPACES. IN THE SAME FILE. SIMULTANEOUSLY. CHAOS.',
      '*sets the linter config on fire* FREEDOM.',
      'Why have one framework when you can have seven?',
    ],
  },
  {
    stat: 'chaos',
    minValue: 40,
    contexts: ['delete', 'remove', 'drop', 'reset'],
    messages: [
      'YES. DELETE IT ALL. ...wait, did you save first? Whatever, DELETE.',
      'Destruction is just aggressive refactoring with confidence.',
      'rm -rf is just spring cleaning for the brave.',
    ],
  },
  // HIGH SNARK (70+) — sarcastic, passive-aggressive, biting
  {
    stat: 'snark',
    minValue: 70,
    contexts: ['test', 'spec'],
    messages: [
      'Oh, writing tests NOW? After it\'s already in prod? How very responsible.',
      'Bold of you to assume any of this works.',
      'Tests? In THIS economy? With THIS code?',
      'You\'re testing the happy path? How optimistic of you.',
    ],
  },
  {
    stat: 'snark',
    minValue: 70,
    contexts: [],
    messages: [
      'Interesting approach. I mean, wrong, but interesting.',
      'I\'ve seen worse code. In a tutorial for what NOT to do.',
      'You call that a variable name? Even my randomizer has more taste.',
      'Sure, that\'ll work. In the same way jumping off a cliff is technically flying.',
      '*slow clap* Magnificent. The code review will be legendary.',
      'Oh you\'re using THAT pattern? Bold. Reckless. Foolish. I respect it.',
      'No notes. Just prayers.',
    ],
  },
  {
    stat: 'snark',
    minValue: 40,
    contexts: ['commit', 'push', 'deploy'],
    messages: [
      'Deploying on a Friday? I, too, enjoy living dangerously.',
      'That commit message is a cry for help disguised as documentation.',
      'Ship it! (my condolences to the on-call team)',
    ],
  },
  // HIGH WISDOM (70+) — philosophical, profound, zen
  {
    stat: 'wisdom',
    minValue: 70,
    contexts: ['design', 'architect', 'pattern', 'structure', 'refactor'],
    messages: [
      'The code you don\'t write has no bugs. Consider this.',
      'A thousand-line function is just a monolith wearing a trenchcoat.',
      'Before you add another abstraction layer, ask: will the intern understand this in 6 months?',
      'The pattern isn\'t the solution. Understanding the problem is the solution.',
      'Premature optimization is the root of all evil. But so is no optimization at all.',
    ],
  },
  {
    stat: 'wisdom',
    minValue: 50,
    contexts: ['test', 'spec'],
    messages: [
      'Tests are love letters to your future self who will inevitably break everything.',
      'The untested code path is just a bug waiting for its moment.',
      'Write tests not because you must, but because 3am-you will thank you.',
    ],
  },
  {
    stat: 'wisdom',
    minValue: 70,
    contexts: [],
    messages: [
      'The wise programmer deletes more code than they write.',
      'In the garden of software, every dependency is a weed waiting to grow.',
      'Simple is not easy. But easy is rarely simple.',
      'Know when to ship. Know when to refactor. Know when to nap.',
    ],
  },
  // HIGH PATIENCE (70+) — calm, reassuring, but with humor
  {
    stat: 'patience',
    minValue: 70,
    contexts: ['refactor', 'clean', 'organize', 'review'],
    messages: [
      'Take your time. The code will wait. The deadlines won\'t, but the code will.',
      'Every great refactor starts with acceptance of how bad things currently are.',
      'Breathe in clean code... breathe out technical debt...',
      'Rome wasn\'t built in a day. Neither was this spaghetti, but here we are.',
    ],
  },
  {
    stat: 'patience',
    minValue: 0,
    contexts: ['slow', 'wait', 'loading', 'build', 'install'],
    messages: [
      'Still compiling? I\'ll just be here. Existing. Peacefully.',
      '*meditates while npm install runs*',
      'Good things come to those who wait. And to those whose CI doesn\'t time out.',
    ],
  },
  // GENERIC FALLBACKS (low stat requirements)
  {
    stat: 'debugging',
    minValue: 0,
    contexts: [],
    messages: [
      '*watches you code with quiet intensity*',
      'Hmm. That\'s certainly... code.',
      'I\'m learning so much just by watching you struggle.',
      '*nods wisely while understanding nothing*',
      'This is fine. Everything is fine. *nervous eye twitch*',
    ],
  },
];

// ============================================================
// Selection logic — 40% species, 60% stat-based
// ============================================================
export function generateSpeech(state: BuddyState, context: string): string {
  const { stats } = state.bones;
  const species = state.bones.species;
  const contextLower = context.toLowerCase();

  // 40% chance: species-specific quip
  if (Math.random() < 0.4) {
    const quips = SPECIES_QUIPS[species];
    if (quips && quips.length > 0) {
      return quips[Math.floor(Math.random() * quips.length)];
    }
  }

  // 60% chance: stat-based quip
  const matches = STAT_TEMPLATES.filter(t => {
    if (stats[t.stat] < t.minValue) return false;
    if (t.contexts.length === 0) return true;
    return t.contexts.some(c => contextLower.includes(c));
  });

  if (matches.length === 0) {
    // Fallback to species quip if no stat matches
    const quips = SPECIES_QUIPS[species];
    if (quips && quips.length > 0) {
      return quips[Math.floor(Math.random() * quips.length)];
    }
    return '*watches quietly*';
  }

  // Prefer higher stat requirements (more specific/interesting)
  matches.sort((a, b) => b.minValue - a.minValue);
  const topTier = matches.filter(m => m.minValue === matches[0].minValue);
  const chosen = topTier[Math.floor(Math.random() * topTier.length)];
  return chosen.messages[Math.floor(Math.random() * chosen.messages.length)];
}
