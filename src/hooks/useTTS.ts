import { useCallback, useRef, useEffect } from 'react';
import type { Language, WordTile } from '../types';
import { useGameStore } from '../store/gameStore';
import { useCloudTTS } from './useCloudTTS';

const LANG_MAP: Record<Language, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  'zh-Hans': 'zh-CN',
};

/** Cache pre-selected local voices for each language (for latency). */
const voiceCache: Partial<Record<Language, SpeechSynthesisVoice>> = {};

function findBestVoice(lang: Language): SpeechSynthesisVoice | undefined {
  if (!window.speechSynthesis) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const langCode = LANG_MAP[lang];

  // Prefer local (non-remote) voices for lower latency
  const localVoices = voices.filter(
    (v) => v.lang.startsWith(langCode.split('-')[0]) && !v.localService === false
  );
  const remoteVoices = voices.filter(
    (v) => v.lang.startsWith(langCode.split('-')[0])
  );

  return localVoices[0] || remoteVoices[0];
}

function preloadVoices() {
  const langs: Language[] = ['en', 'fr', 'zh-Hans'];
  for (const lang of langs) {
    const voice = findBestVoice(lang);
    if (voice) voiceCache[lang] = voice;
  }
}

export function useTTS() {
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const setHighlightedTileIndex = useGameStore((s) => s.setHighlightedTileIndex);
  const ttsProvider = useGameStore((s) => s.ttsProvider);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cloudTTS = useCloudTTS();

  // Pre-select voices on mount and when voices change
  useEffect(() => {
    if (!window.speechSynthesis) return;

    preloadVoices();

    const handleVoicesChanged = () => preloadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  const speakBrowser = useCallback(
    (tiles: WordTile[], lang: Language) => {
      if (!window.speechSynthesis || tiles.length === 0) return;

      window.speechSynthesis.cancel();

      const separator = lang === 'zh-Hans' ? '' : ' ';
      const text = tiles.map((t) => t.word).join(separator);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[lang];
      utterance.rate = 0.85;
      utterance.pitch = 1.1;

      // Apply cached voice for better latency
      const cachedVoice = voiceCache[lang];
      if (cachedVoice) utterance.voice = cachedVoice;

      utteranceRef.current = utterance;

      // Karaoke-style highlighting
      const wordBoundaries: number[] = [];
      let charPos = 0;
      for (const tile of tiles) {
        wordBoundaries.push(charPos);
        charPos += tile.word.length + (lang === 'zh-Hans' ? 0 : 1);
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          for (let i = wordBoundaries.length - 1; i >= 0; i--) {
            if (charIndex >= wordBoundaries[i]) {
              setHighlightedTileIndex(i);
              break;
            }
          }
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setHighlightedTileIndex(0);

        // Fallback: if onboundary doesn't fire, step through tiles on a timer
        const avgDuration = (text.length * 80) / tiles.length;
        let fallbackIndex = 0;
        const fallbackTimer = setInterval(() => {
          fallbackIndex++;
          if (fallbackIndex < tiles.length) {
            setHighlightedTileIndex(fallbackIndex);
          } else {
            clearInterval(fallbackTimer);
          }
        }, avgDuration);

        utterance.onend = () => {
          clearInterval(fallbackTimer);
          setIsPlaying(false);
          setHighlightedTileIndex(null);
        };

        utterance.onerror = () => {
          clearInterval(fallbackTimer);
          setIsPlaying(false);
          setHighlightedTileIndex(null);
        };
      };

      window.speechSynthesis.speak(utterance);
    },
    [setIsPlaying, setHighlightedTileIndex]
  );

  const speak = useCallback(
    (tiles: WordTile[], lang: Language) => {
      if (tiles.length === 0) return;

      if (ttsProvider === 'cloud') {
        cloudTTS.speak(tiles, lang);
      } else {
        speakBrowser(tiles, lang);
      }
    },
    [ttsProvider, speakBrowser, cloudTTS]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    cloudTTS.stop();
    setIsPlaying(false);
    setHighlightedTileIndex(null);
  }, [setIsPlaying, setHighlightedTileIndex, cloudTTS]);

  return { speak, stop };
}
