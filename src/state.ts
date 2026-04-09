import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { BuddyBones } from './hash.js';

const STATE_DIR = path.join(os.homedir(), '.claude-buddy');
const STATE_FILE = path.join(STATE_DIR, 'buddy.json');
const REACTION_FILE = path.join(STATE_DIR, 'reaction.json');

export interface BuddySoul {
  name: string;
  personality: string;
  catchphrase: string;
  quirk: string;
}

export interface BuddyState {
  userId: string;
  bones: BuddyBones;
  soul: BuddySoul | null;
  customized: boolean;
  preferences: {
    muted: boolean;
    hidden: boolean;
  };
  interactions: {
    totalPets: number;
    lastSeen: string;
    hatchDate: string;
  };
}

async function ensureDirectory(): Promise<void> {
  await fs.mkdir(STATE_DIR, { recursive: true });
}

export async function loadState(): Promise<BuddyState | null> {
  // Try main file first, fall back to backup if corrupted
  for (const file of [STATE_FILE, STATE_FILE + '.bak']) {
    try {
      const data = await fs.readFile(file, 'utf-8');
      return JSON.parse(data) as BuddyState;
    } catch {}
  }
  return null;
}

export async function saveState(state: BuddyState): Promise<void> {
  await ensureDirectory();
  state.interactions.lastSeen = new Date().toISOString();
  const data = JSON.stringify(state, null, 2);
  const tmpFile = STATE_FILE + '.tmp';
  // Write to temp file first
  await fs.writeFile(tmpFile, data, 'utf-8');
  // Backup current state before overwriting
  try { await fs.copyFile(STATE_FILE, STATE_FILE + '.bak'); } catch {}
  // Atomic rename
  await fs.rename(tmpFile, STATE_FILE);
}

export interface BuddyReaction {
  reaction: string;
  timestamp: number;
}

export async function saveReaction(reaction: string): Promise<void> {
  await ensureDirectory();
  const data: BuddyReaction = { reaction, timestamp: Date.now() };
  await fs.writeFile(REACTION_FILE, JSON.stringify(data), 'utf-8');
}

export async function loadReaction(): Promise<BuddyReaction | null> {
  try {
    const data = await fs.readFile(REACTION_FILE, 'utf-8');
    return JSON.parse(data) as BuddyReaction;
  } catch {
    return null;
  }
}

export function createInitialState(userId: string, bones: BuddyBones): BuddyState {
  const now = new Date().toISOString();
  return {
    userId,
    bones,
    soul: null,
    customized: false,
    preferences: {
      muted: false,
      hidden: false,
    },
    interactions: {
      totalPets: 0,
      lastSeen: now,
      hatchDate: now,
    },
  };
}
