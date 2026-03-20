import type { Language, WordEntry } from '../../types';
import { englishWords } from './en';
import { frenchWords } from './fr';
import { chineseWords } from './zh';

const wordLists: Record<Language, WordEntry[]> = {
  en: englishWords,
  fr: frenchWords,
  'zh-Hans': chineseWords,
};

export function getWordList(lang: Language): WordEntry[] {
  return wordLists[lang];
}

/**
 * Anchor words — always included in every round to guarantee
 * the child can form at least 4 valid sentences.
 * 8 per language, covering determiners, copula, pronouns,
 * conjunctions, and key function words.
 */
const ANCHOR_WORDS: Record<Language, string[]> = {
  'en': ['the', 'a', 'and', 'is', 'I', 'my', 'to the', 'has'],
  'fr': ['est', 'un', 'une', 'et', 'le', 'la', 'a', 'dans'],
  'zh-Hans': ['\u7684', '\u662f', '\u5728', '\u5f88', '\u4e86', '\u548c', '\u6211', '\u4e00\u4e2a'],
  // zh-Hans: 的, 是, 在, 很, 了, 和, 我, 一个
};

/**
 * Weighted random sampling: picks `n` items from `arr`,
 * biasing toward items with lower usage counts.
 */
function weightedPick(
  arr: WordEntry[],
  n: number,
  usageCounts: Record<string, number>
): WordEntry[] {
  if (arr.length <= n) return [...arr];

  const weighted = arr.map((w) => ({
    entry: w,
    weight: 1 / (1 + (usageCounts[w.id] || 0)),
  }));

  const picked: WordEntry[] = [];
  const remaining = [...weighted];

  for (let i = 0; i < n && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;

    let chosen = 0;
    for (let j = 0; j < remaining.length; j++) {
      rand -= remaining[j].weight;
      if (rand <= 0) {
        chosen = j;
        break;
      }
    }

    picked.push(remaining[chosen].entry);
    remaining.splice(chosen, 1);
  }

  return picked;
}

/**
 * Simple shuffle (Fisher-Yates).
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Look up anchor WordEntry objects from a word list by their word strings.
 */
function resolveAnchors(wordList: WordEntry[], anchorWords: string[]): WordEntry[] {
  const anchors: WordEntry[] = [];
  for (const word of anchorWords) {
    const entry = wordList.find((w) => w.word === word);
    if (entry) anchors.push(entry);
  }
  return anchors;
}

export function selectRoundWords(
  lang: Language,
  count: number = 20,
  usageCounts: Record<string, number> = {}
): WordEntry[] {
  const all = getWordList(lang);
  const anchorWords = ANCHOR_WORDS[lang] || [];
  const anchors = resolveAnchors(all, anchorWords);
  return selectFromPool(all, count, usageCounts, anchors);
}

/**
 * Select words from a custom word pool. Anchors are pulled from the
 * built-in word list to guarantee sentence viability even with
 * small or specialized custom lists.
 */
export function selectRoundWordsFromCustom(
  customWords: WordEntry[],
  count: number = 20,
  usageCounts: Record<string, number> = {},
  lang?: Language
): WordEntry[] {
  let anchors: WordEntry[] = [];
  if (lang) {
    const builtIn = getWordList(lang);
    const anchorWords = ANCHOR_WORDS[lang] || [];
    anchors = resolveAnchors(builtIn, anchorWords);
  }
  return selectFromPool(customWords, count, usageCounts, anchors);
}

function selectFromPool(
  all: WordEntry[],
  count: number,
  usageCounts: Record<string, number>,
  anchors: WordEntry[] = []
): WordEntry[] {
  // Start with anchor words
  const anchorIds = new Set(anchors.map((w) => w.id));
  const selected: WordEntry[] = [...anchors];
  const remainingCount = count - anchors.length;

  // Filter out anchors from the random pool to prevent duplicates
  const pool = all.filter((w) => !anchorIds.has(w.id));

  if (pool.length <= remainingCount) {
    selected.push(...pool);
    return shuffle(selected);
  }

  // Group remaining pool by POS
  const byPos = {
    noun: pool.filter((w) => w.pos === 'noun'),
    verb: pool.filter((w) => w.pos === 'verb'),
    adjective: pool.filter((w) => w.pos === 'adjective'),
    adverb: pool.filter((w) => w.pos === 'adverb'),
    phrase: pool.filter((w) => w.pos === 'phrase' || w.pos === 'particle'),
    conjunction: pool.filter((w) => w.pos === 'conjunction'),
  };

  // Adjusted POS targets for the random slots
  // (anchors already provide phrases, conjunctions, and function words)
  const targets: [keyof typeof byPos, number][] = [
    ['noun', 4], ['verb', 3], ['adjective', 2],
    ['adverb', 1], ['phrase', 1], ['conjunction', 0],
  ];

  const randomSelected: WordEntry[] = [];
  for (const [pos, desired] of targets) {
    const available = byPos[pos];
    if (available.length > 0) {
      randomSelected.push(...weightedPick(available, Math.min(desired, available.length), usageCounts));
    }
  }

  // Fill remaining slots from all unused words
  const usedIds = new Set([...anchorIds, ...randomSelected.map((w) => w.id)]);
  const remaining = pool.filter((w) => !usedIds.has(w.id));
  const needed = remainingCount - randomSelected.length;

  if (needed > 0) {
    randomSelected.push(...weightedPick(remaining, needed, usageCounts));
  }

  selected.push(...randomSelected);
  return shuffle(selected);
}
