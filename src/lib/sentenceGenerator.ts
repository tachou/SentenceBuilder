import type { Language, WordTile } from '../types';

/** A slot type that a template position can accept */
type SlotType = 'det' | 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'pronoun' | 'particle';

/** Map slot types to the tile filter logic */
const DETERMINERS = new Set(['the', 'a', 'my', 'some', 'many', 'un', 'une', 'des', 'du', 'de la', 'le', 'la', '一个', '这个', '那个', '一些', '很多']);
const PRONOUNS = new Set(['I', '我']);
const PREPOSITIONS_EN = new Set(['in the', 'on the', 'to the', 'with a', 'at the', 'under the', 'next to', 'in front of', 'behind the', 'above the', 'near the', 'inside the', 'around the', 'from the']);
const PREPOSITIONS_FR = new Set(['dans', 'sur', 'avec', 'pour', 'sous', 'à côté de', 'devant', 'derrière', 'au-dessus de', 'près de', 'autour de', 'vers', 'entre']);
const PREPOSITIONS_ZH = new Set(['在', '到']);
const PARTICLES_ZH = new Set(['的', '了']);

function getTilesForSlot(tiles: WordTile[], slot: SlotType, lang: Language): WordTile[] {
  switch (slot) {
    case 'det':
      return tiles.filter(t => DETERMINERS.has(t.word));
    case 'noun':
      return tiles.filter(t => t.pos === 'noun');
    case 'verb':
      return tiles.filter(t => t.pos === 'verb');
    case 'adj':
      return tiles.filter(t => t.pos === 'adjective');
    case 'adv':
      return tiles.filter(t => t.pos === 'adverb');
    case 'pronoun':
      return tiles.filter(t => PRONOUNS.has(t.word));
    case 'particle':
      return tiles.filter(t => PARTICLES_ZH.has(t.word));
    case 'prep': {
      const prepSet = lang === 'fr' ? PREPOSITIONS_FR : lang === 'zh-Hans' ? PREPOSITIONS_ZH : PREPOSITIONS_EN;
      return tiles.filter(t => prepSet.has(t.word));
    }
  }
}

interface SentenceTemplate {
  slots: SlotType[];
}

const TEMPLATES: Record<Language, SentenceTemplate[]> = {
  en: [
    { slots: ['det', 'noun', 'verb'] },                    // The cat runs
    { slots: ['det', 'noun', 'verb', 'det', 'noun'] },     // The dog eats a cookie
    { slots: ['det', 'adj', 'noun', 'verb'] },              // The big bird flies
    { slots: ['det', 'adj', 'noun', 'verb', 'adv'] },       // The fast horse runs quickly
    { slots: ['det', 'noun', 'verb', 'adv'] },              // The cat sleeps quietly
    { slots: ['det', 'noun', 'verb', 'prep', 'noun'] },     // The fish swims in the water
    { slots: ['pronoun', 'verb', 'det', 'noun'] },           // I see the moon
    { slots: ['pronoun', 'verb', 'det', 'adj', 'noun'] },    // I like the big dog
  ],
  fr: [
    { slots: ['noun', 'verb'] },                             // Le chat court (nouns include article)
    { slots: ['noun', 'verb', 'noun'] },                     // La fille mange la pomme
    { slots: ['noun', 'verb', 'adv'] },                      // Le garçon chante bien
    { slots: ['noun', 'verb', 'adj'] },                      // Le chat est petit
    { slots: ['noun', 'verb', 'prep', 'noun'] },             // Le poisson nage dans la maison
    { slots: ['det', 'adj', 'noun', 'verb'] },               // Un grand chien saute
  ],
  'zh-Hans': [
    { slots: ['noun', 'verb'] },                             // 猫跑
    { slots: ['noun', 'verb', 'noun'] },                     // 狗吃鱼
    { slots: ['adj', 'particle', 'noun', 'verb'] },          // 大的猫跑
    { slots: ['noun', 'adv', 'adj'] },                       // 猫很大
    { slots: ['pronoun', 'verb', 'noun'] },                   // 我看书
    { slots: ['noun', 'prep', 'noun', 'verb'] },             // 鸟在树飞
    { slots: ['noun', 'verb', 'particle'] },                  // 猫跑了
  ],
};

const MAX_PER_TEMPLATE = 50;
const MAX_TOTAL = 200;

export interface GeneratedSentence {
  words: string[];
  tiles: WordTile[];
}

/**
 * Generate all valid sentences from the current tiles using templates.
 */
export function generateSentences(tiles: WordTile[], lang: Language): GeneratedSentence[] {
  const templates = TEMPLATES[lang];
  const results: GeneratedSentence[] = [];
  const seen = new Set<string>();

  for (const template of templates) {
    if (results.length >= MAX_TOTAL) break;

    // Get candidate tiles for each slot
    const slotCandidates = template.slots.map(slot => getTilesForSlot(tiles, slot, lang));

    // Skip if any slot has no candidates
    if (slotCandidates.some(c => c.length === 0)) continue;

    // Generate combinations with a cap
    const combos = cartesianProduct(slotCandidates, MAX_PER_TEMPLATE);

    for (const combo of combos) {
      if (results.length >= MAX_TOTAL) break;

      // Ensure no tile is used twice (by instanceId)
      const ids = combo.map(t => t.instanceId);
      if (new Set(ids).size !== ids.length) continue;

      const joiner = lang === 'zh-Hans' ? '' : ' ';
      const sentence = combo.map(t => t.word).join(joiner);

      // Deduplicate by sentence text
      if (seen.has(sentence)) continue;
      seen.add(sentence);

      results.push({
        words: combo.map(t => t.word),
        tiles: combo,
      });
    }
  }

  return results;
}

/**
 * Cartesian product of arrays with a limit on total results.
 */
function cartesianProduct(arrays: WordTile[][], limit: number): WordTile[][] {
  const results: WordTile[][] = [];

  function recurse(depth: number, current: WordTile[]) {
    if (results.length >= limit) return;
    if (depth === arrays.length) {
      results.push([...current]);
      return;
    }
    for (const item of arrays[depth]) {
      if (results.length >= limit) return;
      current.push(item);
      recurse(depth + 1, current);
      current.pop();
    }
  }

  recurse(0, []);
  return results;
}
