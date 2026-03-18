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

export function selectRoundWords(
  lang: Language,
  count: number = 14,
  usageCounts: Record<string, number> = {}
): WordEntry[] {
  const all = getWordList(lang);

  // Group by POS
  const byPos = {
    noun: all.filter((w) => w.pos === 'noun'),
    verb: all.filter((w) => w.pos === 'verb'),
    adjective: all.filter((w) => w.pos === 'adjective'),
    adverb: all.filter((w) => w.pos === 'adverb'),
    phrase: all.filter((w) => w.pos === 'phrase' || w.pos === 'particle'),
    conjunction: all.filter((w) => w.pos === 'conjunction'),
  };

  // Guaranteed POS picks with usage bias
  const selected: WordEntry[] = [
    ...weightedPick(byPos.noun, 3, usageCounts),
    ...weightedPick(byPos.verb, 3, usageCounts),
    ...weightedPick(byPos.adjective, 2, usageCounts),
    ...weightedPick(byPos.adverb, 1, usageCounts),
    ...weightedPick(byPos.phrase, 3, usageCounts),
    ...weightedPick(byPos.conjunction, 1, usageCounts),
  ];

  // Fill remaining slots from all unused words (also biased)
  const usedIds = new Set(selected.map((w) => w.id));
  const remaining = all.filter((w) => !usedIds.has(w.id));
  const needed = count - selected.length;

  if (needed > 0) {
    selected.push(...weightedPick(remaining, needed, usageCounts));
  }

  return shuffle(selected);
}
