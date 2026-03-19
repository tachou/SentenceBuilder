import { getOrCreateDeviceId } from './deviceId';
import type { Language, WordEntry } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

function headers(): Record<string, string> {
  return {
    'X-Device-Id': getOrCreateDeviceId(),
    'Content-Type': 'application/json',
  };
}

function fileHeaders(): Record<string, string> {
  return {
    'X-Device-Id': getOrCreateDeviceId(),
  };
}

// --- Word Lists ---

export interface CustomWordListInfo {
  id: number;
  name: string;
  language: Language;
  is_active: number;
  word_count: number;
  created_at: string;
}

export interface UploadPreviewResponse {
  preview: true;
  entries: { word: string; pos: string; phonetic?: string }[];
  totalCount: number;
  language: string;
  warnings: string[];
  duplicates: string[];
}

export interface UploadConfirmResponse {
  id: number;
  name: string;
  language: string;
  wordCount: number;
  warnings: string[];
  duplicates: string[];
}

export interface CustomWordRow {
  id: number;
  word: string;
  pos: string;
  phonetic: string | null;
  sort_order: number;
}

export async function uploadWordList(
  file: File,
  name: string,
  language: string,
  confirm: boolean,
): Promise<UploadPreviewResponse | UploadConfirmResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('language', language);
  formData.append('confirm', String(confirm));

  const res = await fetch(`${API_URL}/api/word-lists/upload`, {
    method: 'POST',
    headers: fileHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export async function fetchWordLists(): Promise<CustomWordListInfo[]> {
  const res = await fetch(`${API_URL}/api/word-lists`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch word lists');
  return res.json();
}

export async function fetchWordListWords(listId: number): Promise<{ list: { id: number; language: string }; words: CustomWordRow[] }> {
  const res = await fetch(`${API_URL}/api/word-lists/${listId}/words`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch words');
  return res.json();
}

export async function deleteWordList(listId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/word-lists/${listId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to delete list');
}

export async function toggleWordListActive(listId: number): Promise<{ isActive: boolean }> {
  const res = await fetch(`${API_URL}/api/word-lists/${listId}/active`, {
    method: 'PUT',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to toggle list');
  return res.json();
}

// --- Progress ---

export interface ProgressEvent {
  event_type: string;
  language: string;
  result?: string;
  words_used?: string[];
  sentence?: string;
}

export function logProgressEvent(event: ProgressEvent): void {
  // Fire and forget — never blocks UI
  fetch(`${API_URL}/api/progress/events`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(event),
  }).catch(() => { /* silent */ });
}

export async function fetchTodayCount(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/api/progress/today`, { headers: headers() });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.sentencesToday;
  } catch {
    return 0;
  }
}

export interface ProgressStats {
  totalSentences: number;
  correctSentences: number;
  accuracyPercent: number;
  sentencesToday: number;
  streakDays: number;
  byLanguage: Record<string, { total: number; correct: number }>;
  mostUsedWords: { word: string; count: number }[];
  dailyCounts: { date: string; total: number; correct: number }[];
}

export async function fetchProgressStats(): Promise<ProgressStats> {
  const res = await fetch(`${API_URL}/api/progress/stats`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

// --- Badges ---

export interface BadgeInfo {
  id: string;
  icon: string;
  nameKey: string;
  descriptionKey: string;
  earned: boolean;
}

export async function fetchBadges(): Promise<BadgeInfo[]> {
  try {
    const res = await fetch(`${API_URL}/api/badges`, { headers: headers() });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function checkBadges(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/badges/check`, {
      method: 'POST',
      headers: headers(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.newlyEarned;
  } catch {
    return [];
  }
}

// --- Utility: convert API custom words to WordEntry[] ---
export function customWordsToEntries(words: CustomWordRow[], language: Language, listId: number): WordEntry[] {
  return words.map((w, i) => ({
    id: `custom-${listId}-${i}`,
    word: w.word,
    pos: w.pos as WordEntry['pos'],
    lang: language,
    phonetic: w.phonetic || undefined,
  }));
}
