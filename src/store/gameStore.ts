import { create } from 'zustand';
import type { Language, WordTile, WordEntry, GrammarFeedback } from '../types';
import { selectRoundWords, selectRoundWordsFromCustom } from '../data/wordLists';
import { validateGrammarAsync } from '../data/grammarEngine';
import { logProgressEvent, checkBadges } from '../lib/api';

// --- localStorage persistence helpers ---
const STORAGE_KEY = 'sentence-builder-settings';

interface PersistedSettings {
  uiLanguage: Language;
  highContrast: boolean;
  parentPin: string;
  ttsProvider: 'browser' | 'cloud';
  wordUsageCount: Record<string, number>;
}

function loadSettings(): Partial<PersistedSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveSettings(settings: PersistedSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

const persisted = loadSettings();

// --- Store types ---
interface GameState {
  language: Language | null;
  uiLanguage: Language;
  wordPool: WordTile[];
  sentenceTray: WordTile[];
  feedback: GrammarFeedback | null;
  isPlaying: boolean;
  highlightedTileIndex: number | null;
  showPinyin: boolean;
  showPos: boolean;
  highContrast: boolean;
  parentPin: string;
  ttsProvider: 'browser' | 'cloud';
  wordUsageCount: Record<string, number>;
  showSettings: boolean;

  // Custom word list
  activeCustomListId: number | null;
  customWords: WordEntry[];

  // Badge celebration
  newlyEarnedBadges: string[];
  showBadgeCelebration: boolean;

  // Progress counter
  sentencesToday: number;

  setLanguage: (lang: Language) => void;
  setUiLanguage: (lang: Language) => void;
  startNewRound: () => void;
  addToTray: (instanceId: string) => void;
  removeFromTray: (instanceId: string) => void;
  reorderTray: (fromIndex: number, toIndex: number) => void;
  clearTray: () => void;
  submitSentence: () => void;
  clearFeedback: () => void;
  setIsPlaying: (playing: boolean) => void;
  setHighlightedTileIndex: (index: number | null) => void;
  togglePinyin: () => void;
  togglePos: () => void;
  setHighContrast: (on: boolean) => void;
  setParentPin: (pin: string) => void;
  setTTSProvider: (provider: 'browser' | 'cloud') => void;
  setShowSettings: (show: boolean) => void;
  goHome: () => void;
  setActiveCustomList: (listId: number | null, words?: WordEntry[]) => void;
  dismissBadgeCelebration: () => void;
  setSentencesToday: (count: number) => void;
}

const MAX_TRAY_SIZE = 12;

function createTileInstances(words: WordEntry[]): WordTile[] {
  return words.map((w, i) => ({
    ...w,
    instanceId: `${w.id}-${Date.now()}-${i}`,
  }));
}

function persistSettings(state: GameState) {
  saveSettings({
    uiLanguage: state.uiLanguage,
    highContrast: state.highContrast,
    parentPin: state.parentPin,
    ttsProvider: state.ttsProvider,
    wordUsageCount: state.wordUsageCount,
  });
}

function incrementUsage(
  current: Record<string, number>,
  words: { id: string }[]
): Record<string, number> {
  const updated = { ...current };
  for (const w of words) {
    updated[w.id] = (updated[w.id] || 0) + 1;
  }
  return updated;
}

function pickRoundWords(state: GameState, lang: Language): WordEntry[] {
  if (state.activeCustomListId && state.customWords.length > 0) {
    return selectRoundWordsFromCustom(state.customWords, 20, state.wordUsageCount, lang);
  }
  return selectRoundWords(lang, 20, state.wordUsageCount);
}

export const useGameStore = create<GameState>((set, get) => ({
  language: null,
  uiLanguage: persisted.uiLanguage || 'en',
  wordPool: [],
  sentenceTray: [],
  feedback: null,
  isPlaying: false,
  highlightedTileIndex: null,
  showPinyin: true,
  showPos: true,
  highContrast: persisted.highContrast || false,
  parentPin: persisted.parentPin || '1234',
  ttsProvider: persisted.ttsProvider || 'browser',
  wordUsageCount: persisted.wordUsageCount || {},
  showSettings: false,
  activeCustomListId: null,
  customWords: [],
  newlyEarnedBadges: [],
  showBadgeCelebration: false,
  sentencesToday: 0,

  setLanguage: (lang) => {
    const state = get();
    const words = pickRoundWords(state, lang);
    const newUsage = incrementUsage(state.wordUsageCount, words);
    set({
      language: lang,
      wordPool: createTileInstances(words),
      sentenceTray: [],
      feedback: null,
      wordUsageCount: newUsage,
    });
    persistSettings({ ...get() });
  },

  setUiLanguage: (lang) => {
    set({ uiLanguage: lang });
    persistSettings({ ...get() });
  },

  startNewRound: () => {
    const state = get();
    if (!state.language) return;
    const words = pickRoundWords(state, state.language);
    const newUsage = incrementUsage(state.wordUsageCount, words);
    set({
      wordPool: createTileInstances(words),
      sentenceTray: [],
      feedback: null,
      wordUsageCount: newUsage,
    });
    persistSettings({ ...get() });
  },

  addToTray: (instanceId) => {
    const { wordPool, sentenceTray } = get();
    if (sentenceTray.length >= MAX_TRAY_SIZE) return;
    const tile = wordPool.find((t) => t.instanceId === instanceId);
    if (!tile) return;
    set({
      wordPool: wordPool.filter((t) => t.instanceId !== instanceId),
      sentenceTray: [...sentenceTray, tile],
      feedback: null,
    });
  },

  removeFromTray: (instanceId) => {
    const { wordPool, sentenceTray } = get();
    const tile = sentenceTray.find((t) => t.instanceId === instanceId);
    if (!tile) return;
    set({
      sentenceTray: sentenceTray.filter((t) => t.instanceId !== instanceId),
      wordPool: [...wordPool, tile],
      feedback: null,
    });
  },

  reorderTray: (fromIndex, toIndex) => {
    const { sentenceTray } = get();
    const newTray = [...sentenceTray];
    const [moved] = newTray.splice(fromIndex, 1);
    newTray.splice(toIndex, 0, moved);
    set({ sentenceTray: newTray, feedback: null });
  },

  clearTray: () => {
    const { wordPool, sentenceTray } = get();
    set({
      wordPool: [...wordPool, ...sentenceTray],
      sentenceTray: [],
      feedback: null,
    });
  },

  submitSentence: () => {
    const { sentenceTray, language, uiLanguage } = get();
    if (!language || sentenceTray.length < 3) return;

    const { tier1, tier2Promise } = validateGrammarAsync(sentenceTray, language, uiLanguage);
    set({ feedback: tier1 });

    if (tier2Promise) {
      tier2Promise.then((tier2) => {
        if (tier2) {
          const current = get().feedback;
          if (current && current.hint === tier1.hint) {
            set({ feedback: tier2 });
          }
        }
      });
    }

    // Fire-and-forget progress logging
    const joiner = language === 'zh-Hans' ? '' : ' ';
    const sentence = sentenceTray.map(t => t.word).join(joiner);
    logProgressEvent({
      event_type: 'sentence_submitted',
      language,
      result: tier1.result,
      words_used: sentenceTray.map(t => t.word),
      sentence,
    });

    set((s) => ({ sentencesToday: s.sentencesToday + 1 }));

    // Only check badges if the sentence was grammatically correct
    if (tier1.result === 'correct') {
      checkBadges().then((newlyEarned) => {
        if (newlyEarned.length > 0) {
          set({ newlyEarnedBadges: newlyEarned, showBadgeCelebration: true });
        }
      });

      // Auto-advance to a new round after a short delay
      setTimeout(() => {
        get().startNewRound();
      }, 2000);
    }
  },

  clearFeedback: () => set({ feedback: null }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setHighlightedTileIndex: (index) => set({ highlightedTileIndex: index }),
  togglePinyin: () => set((s) => ({ showPinyin: !s.showPinyin })),
  togglePos: () => set((s) => ({ showPos: !s.showPos })),

  setHighContrast: (on) => {
    set({ highContrast: on });
    persistSettings({ ...get() });
  },

  setParentPin: (pin) => {
    set({ parentPin: pin });
    persistSettings({ ...get() });
  },

  setTTSProvider: (provider) => {
    set({ ttsProvider: provider });
    persistSettings({ ...get() });
  },

  setShowSettings: (show) => set({ showSettings: show }),

  goHome: () =>
    set({
      language: null,
      wordPool: [],
      sentenceTray: [],
      feedback: null,
      isPlaying: false,
      highlightedTileIndex: null,
    }),

  setActiveCustomList: (listId, words) => {
    set({
      activeCustomListId: listId,
      customWords: words || [],
    });
  },

  dismissBadgeCelebration: () => {
    const { newlyEarnedBadges } = get();
    const remaining = newlyEarnedBadges.slice(1);
    set({
      newlyEarnedBadges: remaining,
      showBadgeCelebration: remaining.length > 0,
    });
  },

  setSentencesToday: (count) => set({ sentencesToday: count }),
}));
