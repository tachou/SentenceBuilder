import { create } from 'zustand';
import type { Language, WordTile, GrammarFeedback } from '../types';
import { selectRoundWords } from '../data/wordLists';
import { validateGrammarAsync } from '../data/grammarEngine';

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
  highContrast: boolean;
  parentPin: string;
  ttsProvider: 'browser' | 'cloud';
  wordUsageCount: Record<string, number>;
  showSettings: boolean;

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
  setHighContrast: (on: boolean) => void;
  setParentPin: (pin: string) => void;
  setTTSProvider: (provider: 'browser' | 'cloud') => void;
  setShowSettings: (show: boolean) => void;
  goHome: () => void;
}

const MAX_TRAY_SIZE = 7;

function createTileInstances(words: ReturnType<typeof selectRoundWords>): WordTile[] {
  return words.map((w, i) => ({
    ...w,
    instanceId: `${w.id}-${Date.now()}-${i}`,
  }));
}

/** Persist current settings to localStorage */
function persistSettings(state: GameState) {
  saveSettings({
    uiLanguage: state.uiLanguage,
    highContrast: state.highContrast,
    parentPin: state.parentPin,
    ttsProvider: state.ttsProvider,
    wordUsageCount: state.wordUsageCount,
  });
}

/** Increment usage counts for a set of selected words */
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

export const useGameStore = create<GameState>((set, get) => ({
  language: null,
  uiLanguage: persisted.uiLanguage || 'en',
  wordPool: [],
  sentenceTray: [],
  feedback: null,
  isPlaying: false,
  highlightedTileIndex: null,
  showPinyin: true,
  highContrast: persisted.highContrast || false,
  parentPin: persisted.parentPin || '1234',
  ttsProvider: persisted.ttsProvider || 'browser',
  wordUsageCount: persisted.wordUsageCount || {},
  showSettings: false,

  setLanguage: (lang) => {
    const state = get();
    const words = selectRoundWords(lang, 14, state.wordUsageCount);
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
    const words = selectRoundWords(state.language, 14, state.wordUsageCount);
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

    // If LLM validation is running, update feedback when it completes
    if (tier2Promise) {
      tier2Promise.then((tier2) => {
        if (tier2) {
          // Only update if the feedback hasn't been cleared by the user
          const current = get().feedback;
          if (current && current.hint === tier1.hint) {
            set({ feedback: tier2 });
          }
        }
      });
    }
  },

  clearFeedback: () => set({ feedback: null }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setHighlightedTileIndex: (index) => set({ highlightedTileIndex: index }),

  togglePinyin: () => set((s) => ({ showPinyin: !s.showPinyin })),

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
}));
