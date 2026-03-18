import type { Language, WordTile, GrammarFeedback, PartOfSpeech } from '../types';
import { t } from './i18n';
import { LLM_ENABLED } from '../config';
import { validateWithLLM } from './llmValidator';

function hasPOS(tiles: WordTile[], pos: PartOfSpeech): boolean {
  return tiles.some((tile) => tile.pos === pos);
}

function findTilesOfPOS(tiles: WordTile[], pos: PartOfSpeech): number[] {
  return tiles.reduce<number[]>((acc, tile, i) => {
    if (tile.pos === pos) acc.push(i);
    return acc;
  }, []);
}

function validateEnglish(tiles: WordTile[], uiLang: Language): GrammarFeedback {
  const locale = t(uiLang);
  const hasNoun = hasPOS(tiles, 'noun');
  const hasVerb = hasPOS(tiles, 'verb');

  if (!hasNoun && !hasVerb) {
    return {
      result: 'incorrect',
      hint: locale.noNounOrVerb,
      errorTileIds: tiles.map((t) => t.instanceId),
    };
  }

  if (!hasNoun) {
    return {
      result: 'incorrect',
      hint: locale.noNoun,
      errorTileIds: tiles.filter((t) => t.pos === 'verb').map((t) => t.instanceId),
    };
  }

  if (!hasVerb) {
    return {
      result: 'incorrect',
      hint: locale.noVerb,
      errorTileIds: tiles.filter((t) => t.pos === 'noun').map((t) => t.instanceId),
    };
  }

  // Check basic SVO pattern: noun should come before verb
  const nounIndices = findTilesOfPOS(tiles, 'noun');
  const verbIndices = findTilesOfPOS(tiles, 'verb');
  const firstNoun = Math.min(...nounIndices);
  const firstVerb = Math.min(...verbIndices);

  if (firstVerb < firstNoun) {
    return {
      result: 'partial',
      hint: locale.nounBeforeVerb,
      errorTileIds: [tiles[firstVerb].instanceId],
    };
  }

  // Check that phrases aren't at the very end without a following noun
  const phraseIndices = findTilesOfPOS(tiles, 'phrase');
  for (const pi of phraseIndices) {
    if (pi === tiles.length - 1 && tiles[pi].word !== 'a' && tiles[pi].word !== 'the') {
      return {
        result: 'partial',
        hint: locale.danglingPhrase,
        errorTileIds: [tiles[pi].instanceId],
      };
    }
  }

  return { result: 'correct', hint: locale.correct };
}

function validateFrench(tiles: WordTile[], uiLang: Language): GrammarFeedback {
  const locale = t(uiLang);
  const hasNoun = hasPOS(tiles, 'noun');
  const hasVerb = hasPOS(tiles, 'verb');

  if (!hasNoun && !hasVerb) {
    return {
      result: 'incorrect',
      hint: locale.noNounOrVerb,
      errorTileIds: tiles.map((t) => t.instanceId),
    };
  }

  if (!hasNoun) {
    return {
      result: 'incorrect',
      hint: locale.noNoun,
      errorTileIds: tiles.filter((t) => t.pos === 'verb').map((t) => t.instanceId),
    };
  }

  if (!hasVerb) {
    return {
      result: 'incorrect',
      hint: locale.noVerb,
      errorTileIds: tiles.filter((t) => t.pos === 'noun').map((t) => t.instanceId),
    };
  }

  // Basic SVO check for French
  const nounIndices = findTilesOfPOS(tiles, 'noun');
  const verbIndices = findTilesOfPOS(tiles, 'verb');
  const firstNoun = Math.min(...nounIndices);
  const firstVerb = Math.min(...verbIndices);

  if (firstVerb < firstNoun) {
    return {
      result: 'partial',
      hint: locale.nounBeforeVerb,
      errorTileIds: [tiles[firstVerb].instanceId],
    };
  }

  return { result: 'correct', hint: locale.correct };
}

function validateChinese(tiles: WordTile[], uiLang: Language): GrammarFeedback {
  const locale = t(uiLang);
  const hasNoun = hasPOS(tiles, 'noun');
  const hasVerb = hasPOS(tiles, 'verb');

  if (!hasNoun && !hasVerb) {
    return {
      result: 'incorrect',
      hint: locale.noNounOrVerb,
      errorTileIds: tiles.map((t) => t.instanceId),
    };
  }

  if (!hasNoun) {
    return {
      result: 'incorrect',
      hint: locale.noNoun,
      errorTileIds: tiles.filter((t) => t.pos === 'verb').map((t) => t.instanceId),
    };
  }

  if (!hasVerb) {
    return {
      result: 'incorrect',
      hint: locale.noVerb,
      errorTileIds: tiles.filter((t) => t.pos === 'noun').map((t) => t.instanceId),
    };
  }

  // Chinese: SVO - noun should generally come before verb
  const nounIndices = findTilesOfPOS(tiles, 'noun');
  const verbIndices = findTilesOfPOS(tiles, 'verb');
  const firstNoun = Math.min(...nounIndices);
  const firstVerb = Math.min(...verbIndices);

  if (firstVerb < firstNoun) {
    // But allow adverb + verb + noun patterns
    const firstTilePos = tiles[0]?.pos;
    if (firstTilePos !== 'adverb' && firstTilePos !== 'phrase') {
      return {
        result: 'partial',
        hint: locale.nounBeforeVerb,
        errorTileIds: [tiles[firstVerb].instanceId],
      };
    }
  }

  return { result: 'correct', hint: locale.correct };
}

export function validateGrammar(tiles: WordTile[], lang: Language, uiLang: Language): GrammarFeedback {
  if (tiles.length < 3) {
    const locale = t(uiLang);
    return {
      result: 'incorrect',
      hint: locale.needMoreTiles,
      errorTileIds: [],
    };
  }

  switch (lang) {
    case 'en':
      return validateEnglish(tiles, uiLang);
    case 'fr':
      return validateFrench(tiles, uiLang);
    case 'zh-Hans':
      return validateChinese(tiles, uiLang);
  }
}

/**
 * Tier 2: Async grammar validation using LLM.
 * Returns tier1 result immediately, plus a promise for tier2 if LLM is enabled
 * and tier1 returned 'correct'.
 */
export function validateGrammarAsync(
  tiles: WordTile[],
  lang: Language,
  uiLang: Language
): { tier1: GrammarFeedback; tier2Promise?: Promise<GrammarFeedback | null> } {
  const tier1 = validateGrammar(tiles, lang, uiLang);

  // Only escalate to LLM if tier1 says correct and LLM is available
  if (tier1.result === 'correct' && LLM_ENABLED) {
    const separator = lang === 'zh-Hans' ? '' : ' ';
    const sentence = tiles.map((t) => t.word).join(separator);
    const tier2Promise = validateWithLLM(sentence, lang, uiLang);
    return { tier1, tier2Promise };
  }

  return { tier1 };
}
