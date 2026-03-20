import type { Language, WordTile } from '../types';

/** A slot type that a template position can accept */
type SlotType = 'det' | 'noun' | 'verb_copula' | 'verb_intrans' | 'verb_trans' | 'adj' | 'adv' | 'adv_intensifier' | 'prep' | 'pronoun' | 'particle';

/** Map slot types to the tile filter logic */
const DETERMINERS = new Set(['the', 'a', 'my', 'some', 'many', 'un', 'une', 'des', 'du', 'de la', 'le', 'la', '一个', '这个', '那个', '一些', '很多']);
const PRONOUNS = new Set(['I', '我']);
const PREPOSITIONS_EN = new Set(['in the', 'on the', 'to the', 'with a', 'at the', 'under the', 'next to', 'in front of', 'behind the', 'above the', 'near the', 'inside the', 'around the', 'from the']);
const PREPOSITIONS_FR = new Set(['dans', 'sur', 'avec', 'pour', 'sous', 'à côté de', 'devant', 'derrière', 'au-dessus de', 'près de', 'autour de', 'vers', 'entre']);
const PREPOSITIONS_ZH = new Set(['在', '到']);
const PARTICLES_ZH = new Set(['的', '了']);

/** Intensifier adverbs — safe to use in copula templates (noun est très adj) */
const INTENSIFIERS_FR = new Set(['très', 'vraiment', 'bien']);
const INTENSIFIERS_EN = new Set(['very', 'really']);
const INTENSIFIERS_ZH = new Set(['很', '真']);

/** Copula verbs — link subject to adjective/description */
const COPULA_EN = new Set(['is']);
const COPULA_FR = new Set(['est']);
const COPULA_ZH = new Set(['是']);

function getCopulaSet(lang: Language): Set<string> {
  return lang === 'fr' ? COPULA_FR : lang === 'zh-Hans' ? COPULA_ZH : COPULA_EN;
}

/** Intransitive verbs — can stand alone without an object */
const INTRANSITIVE_EN = new Set([
  'runs', 'jumps', 'sleeps', 'walks', 'sings', 'dances', 'flies',
  'swims', 'climbs', 'sits', 'stands', 'plays', 'grows', 'hides',
]);
const INTRANSITIVE_FR = new Set([
  'court', 'saute', 'dort', 'marche', 'chante', 'danse', 'vole',
  'nage', 'grimpe', 'joue', 'parle', 'pousse',
]);
const INTRANSITIVE_ZH = new Set([
  '跑', '跳', '飞', '游泳', '走', '坐', '站', '睡觉', '唱歌', '跳舞', '爬', '长',
]);

/** Transitive verbs — require an object to form a complete sentence */
const TRANSITIVE_EN = new Set([
  'eats', 'drinks', 'sees', 'likes', 'loves', 'has', 'reads',
  'cooks', 'draws', 'makes', 'gives', 'wants', 'finds', 'throws',
  'catches', 'builds', 'helps', 'opens', 'closes', 'rides',
]);
const TRANSITIVE_FR = new Set([
  'mange', 'boit', 'voit', 'aime', 'adore', 'lit',
  'cuisine', 'dessine', 'fait', 'veut', 'trouve',
  'lance', 'attrape', 'construit', 'aide', 'ouvre', 'ferme', 'porte', 'regarde',
]);
const TRANSITIVE_ZH = new Set([
  '吃', '喝', '看', '喜欢', '爱', '有', '读', '做饭', '画画',
  '给', '要', '找', '藏', '扔', '接', '建', '帮助', '开', '关', '骑',
]);

/**
 * French gender agreement data.
 * Feminine nouns start with "la " or are known feminine.
 * Gender-invariant adjectives end in -e and work with both genders.
 */
const FEMININE_NOUNS_FR = new Set([
  'la maison', "l'école", 'la balle', 'la voiture', 'la fille',
  "l'étoile", 'la fleur', 'la pomme', "l'eau", 'la grenouille',
  'la chaussure', 'la poule', 'la pizza', 'la pluie', 'la neige',
  'la reine', 'la classe', 'la lune', 'maman',
]);
const ADJ_GENDER_INVARIANT_FR = new Set([
  // Adjectives already ending in -e: same form for masculine/feminine
  'rouge', 'triste', 'rapide', 'drôle', 'calme', 'jaune',
  'orange', 'brave', 'minuscule',
]);

/** Check if a French combo has gender agreement issues */
function hasFrenchGenderConflict(combo: WordTile[], slots: SlotType[]): boolean {
  let nounWord: string | null = null;
  let adjWord: string | null = null;
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === 'noun') nounWord = combo[i].word;
    if (slots[i] === 'adj') adjWord = combo[i].word;
  }
  if (!nounWord || !adjWord) return false;
  // Feminine noun + masculine-only adjective = conflict
  if (FEMININE_NOUNS_FR.has(nounWord) && !ADJ_GENDER_INVARIANT_FR.has(adjWord)) {
    return true;
  }
  return false;
}

function getIntransitiveSet(lang: Language): Set<string> {
  return lang === 'fr' ? INTRANSITIVE_FR : lang === 'zh-Hans' ? INTRANSITIVE_ZH : INTRANSITIVE_EN;
}

function getTransitiveSet(lang: Language): Set<string> {
  return lang === 'fr' ? TRANSITIVE_FR : lang === 'zh-Hans' ? TRANSITIVE_ZH : TRANSITIVE_EN;
}

function getTilesForSlot(tiles: WordTile[], slot: SlotType, lang: Language): WordTile[] {
  switch (slot) {
    case 'det':
      return tiles.filter(t => DETERMINERS.has(t.word));
    case 'noun':
      return tiles.filter(t => t.pos === 'noun');
    case 'verb_copula': {
      const copula = getCopulaSet(lang);
      return tiles.filter(t => t.pos === 'verb' && copula.has(t.word));
    }
    case 'verb_intrans': {
      const intrans = getIntransitiveSet(lang);
      return tiles.filter(t => t.pos === 'verb' && intrans.has(t.word));
    }
    case 'verb_trans': {
      const trans = getTransitiveSet(lang);
      return tiles.filter(t => t.pos === 'verb' && trans.has(t.word));
    }
    case 'adj':
      return tiles.filter(t => t.pos === 'adjective');
    case 'adv':
      return tiles.filter(t => t.pos === 'adverb');
    case 'adv_intensifier': {
      const intensifiers = lang === 'fr' ? INTENSIFIERS_FR : lang === 'zh-Hans' ? INTENSIFIERS_ZH : INTENSIFIERS_EN;
      return tiles.filter(t => t.pos === 'adverb' && intensifiers.has(t.word));
    }
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
    // Intransitive: no object needed
    { slots: ['det', 'noun', 'verb_intrans'] },                        // The cat runs
    { slots: ['det', 'adj', 'noun', 'verb_intrans'] },                 // The big bird flies
    { slots: ['det', 'noun', 'verb_intrans', 'adv'] },                 // The cat sleeps quietly
    { slots: ['det', 'adj', 'noun', 'verb_intrans', 'adv'] },          // The fast horse runs quickly
    // Transitive: require an object
    { slots: ['det', 'noun', 'verb_trans', 'det', 'noun'] },           // The dog eats a cookie
    { slots: ['det', 'noun', 'verb_trans', 'prep', 'noun'] },          // The cat hides in the house
    { slots: ['pronoun', 'verb_trans', 'det', 'noun'] },               // I see the moon
    { slots: ['pronoun', 'verb_trans', 'det', 'adj', 'noun'] },        // I like the big dog
  ],
  fr: [
    // Intransitive (FR nouns already include their article, e.g. "le chat")
    { slots: ['noun', 'verb_intrans'] },                                // Le chat court
    { slots: ['noun', 'verb_intrans', 'adv'] },                        // Le garçon chante bien
    // Transitive (direct object only, no preposition)
    { slots: ['noun', 'verb_trans', 'noun'] },                         // La fille mange la pomme
    // Copula (only "est")
    { slots: ['noun', 'verb_copula', 'adj'] },                         // Le chat est petit
    { slots: ['noun', 'verb_copula', 'adv_intensifier', 'adj'] },      // Le chat est très petit
  ],
  'zh-Hans': [
    // Intransitive
    { slots: ['noun', 'verb_intrans'] },                                // 猫跑
    { slots: ['adj', 'particle', 'noun', 'verb_intrans'] },            // 大的猫跑
    { slots: ['noun', 'verb_intrans', 'particle'] },                   // 猫跑了
    // Transitive
    { slots: ['noun', 'verb_trans', 'noun'] },                         // 狗吃鱼
    { slots: ['pronoun', 'verb_trans', 'noun'] },                      // 我看书
    { slots: ['noun', 'prep', 'noun', 'verb_intrans'] },               // 鸟在树飞
    // Adj predicate
    { slots: ['noun', 'adv', 'adj'] },                                 // 猫很大
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

      // French gender agreement check
      if (lang === 'fr' && hasFrenchGenderConflict(combo, template.slots)) continue;

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
