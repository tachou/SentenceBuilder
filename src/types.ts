export type Language = 'en' | 'fr' | 'zh-Hans';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrase'
  | 'conjunction'
  | 'particle'
  | 'other';

export interface WordEntry {
  id: string;
  word: string;
  pos: PartOfSpeech;
  lang: Language;
  phonetic?: string;
}

export interface WordTile extends WordEntry {
  instanceId: string; // unique per round instance
}

export type ValidationResult = 'correct' | 'incorrect' | 'partial';

export interface GrammarFeedback {
  result: ValidationResult;
  hint: string;
  errorTileIds?: string[];
}

// Badge definition as returned by the API
export interface BadgeInfo {
  id: string;
  icon: string;
  nameKey: string;
  descriptionKey: string;
  earned: boolean;
}

export const POS_COLORS: Record<PartOfSpeech, { bg: string; border: string; label: string }> = {
  noun: { bg: 'bg-noun', border: 'border-noun-border', label: 'N' },
  verb: { bg: 'bg-verb', border: 'border-verb-border', label: 'V' },
  adjective: { bg: 'bg-adjective', border: 'border-adjective-border', label: 'Adj' },
  adverb: { bg: 'bg-adverb', border: 'border-adverb-border', label: 'Adv' },
  phrase: { bg: 'bg-phrase', border: 'border-phrase-border', label: 'Phr' },
  conjunction: { bg: 'bg-conjunction', border: 'border-conjunction-border', label: 'Con' },
  particle: { bg: 'bg-phrase', border: 'border-phrase-border', label: 'Ptc' },
  other: { bg: 'bg-conjunction', border: 'border-conjunction-border', label: '...' },
};
