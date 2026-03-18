import { useCallback, useRef } from 'react';
import type { Language, WordTile } from '../types';
import { CLOUD_TTS_API_KEY, CLOUD_TTS_ENABLED } from '../config';
import { useGameStore } from '../store/gameStore';

const VOICE_MAP: Record<Language, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Wavenet-C' },
  fr: { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-A' },
  'zh-Hans': { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-A' },
};

/** Simple in-memory cache for audio blobs */
const audioCache = new Map<string, string>();

export function useCloudTTS() {
  const setIsPlaying = useGameStore((s) => s.setIsPlaying);
  const setHighlightedTileIndex = useGameStore((s) => s.setHighlightedTileIndex);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speak = useCallback(
    async (tiles: WordTile[], lang: Language) => {
      if (!CLOUD_TTS_ENABLED || tiles.length === 0) return;

      const separator = lang === 'zh-Hans' ? '' : ' ';
      const text = tiles.map((t) => t.word).join(separator);
      const cacheKey = `${lang}:${text}`;

      setIsPlaying(true);
      setHighlightedTileIndex(0);

      let audioUrl = audioCache.get(cacheKey);

      if (!audioUrl) {
        try {
          const voice = VOICE_MAP[lang];
          const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${CLOUD_TTS_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                input: { text },
                voice: {
                  languageCode: voice.languageCode,
                  name: voice.name,
                },
                audioConfig: {
                  audioEncoding: 'MP3',
                  speakingRate: 0.85,
                  pitch: 1.5,
                },
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Cloud TTS failed: ${response.status}`);
          }

          const data = await response.json();
          const audioContent = data.audioContent as string;

          // Convert base64 to blob URL
          const binaryString = atob(audioContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/mp3' });
          audioUrl = URL.createObjectURL(blob);
          audioCache.set(cacheKey, audioUrl);
        } catch (error) {
          console.error('Cloud TTS error:', error);
          setIsPlaying(false);
          setHighlightedTileIndex(null);
          return;
        }
      }

      // Play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Karaoke highlighting via timer (estimate ~80ms per character)
      const totalDuration = text.length * 80;
      const interval = totalDuration / tiles.length;
      let currentIndex = 0;

      timerRef.current = setInterval(() => {
        currentIndex++;
        if (currentIndex < tiles.length) {
          setHighlightedTileIndex(currentIndex);
        } else if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }, interval);

      audio.onended = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsPlaying(false);
        setHighlightedTileIndex(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsPlaying(false);
        setHighlightedTileIndex(null);
        audioRef.current = null;
      };

      audio.play().catch(() => {
        setIsPlaying(false);
        setHighlightedTileIndex(null);
      });
    },
    [setIsPlaying, setHighlightedTileIndex]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { speak, stop };
}
