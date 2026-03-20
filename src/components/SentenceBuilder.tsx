import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';
import { WordPool } from './WordPool';
import { SentenceTray } from './SentenceTray';
import { PlayButton } from './PlayButton';
import { FeedbackOverlay } from './FeedbackOverlay';
import { BadgeCelebration } from './BadgeCelebration';
import { BadgeGallery } from './BadgeGallery';
import { WordTileComponent } from './WordTileComponent';
import { useTTS } from '../hooks/useTTS';
import { fetchTodayCount } from '../lib/api';
import type { WordTile } from '../types';

export function SentenceBuilder() {
  const language = useGameStore((s) => s.language);
  const sentenceTray = useGameStore((s) => s.sentenceTray);
  const addToTray = useGameStore((s) => s.addToTray);
  const removeFromTray = useGameStore((s) => s.removeFromTray);
  const reorderTray = useGameStore((s) => s.reorderTray);
  const clearTray = useGameStore((s) => s.clearTray);
  const startNewRound = useGameStore((s) => s.startNewRound);
  const submitSentence = useGameStore((s) => s.submitSentence);
  const goHome = useGameStore((s) => s.goHome);
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const showPinyin = useGameStore((s) => s.showPinyin);
  const togglePinyin = useGameStore((s) => s.togglePinyin);
  const showPos = useGameStore((s) => s.showPos);
  const togglePos = useGameStore((s) => s.togglePos);

  const sentencesToday = useGameStore((s) => s.sentencesToday);
  const setSentencesToday = useGameStore((s) => s.setSentencesToday);
  const showBadgeCelebration = useGameStore((s) => s.showBadgeCelebration);

  const { speak } = useTTS();

  const [activeTile, setActiveTile] = useState<WordTile | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showBadgeGallery, setShowBadgeGallery] = useState(false);

  const locale = t(uiLanguage);

  useEffect(() => {
    fetchTodayCount().then((count) => setSentencesToday(count)).catch(() => {});
  }, [setSentencesToday]);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const tile = event.active.data.current?.tile as WordTile | undefined;
    if (tile) setActiveTile(tile);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTile(null);
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // From pool to tray
      if (activeData?.area === 'pool' && over.id === 'sentence-tray') {
        addToTray(active.id as string);
        return;
      }

      // From tray to pool
      if (activeData?.area === 'tray' && over.id === 'word-pool') {
        removeFromTray(active.id as string);
        return;
      }

      // Reorder within tray
      if (activeData?.area === 'tray' && overData?.area === 'tray') {
        const fromIndex = activeData.index as number;
        const toIndex = overData.index as number;
        if (fromIndex !== toIndex) {
          reorderTray(fromIndex, toIndex);
        }
        return;
      }

      // From pool to a tile in the tray (insert near it)
      if (activeData?.area === 'pool' && overData?.area === 'tray') {
        addToTray(active.id as string);
        return;
      }
    },
    [addToTray, removeFromTray, reorderTray]
  );

  const handleSubmit = useCallback(() => {
    if (!language || sentenceTray.length < 3) return;
    // Capture the tray before submit (in case it gets cleared on correct)
    const tilesToSpeak = [...sentenceTray];
    submitSentence();
    speak(tilesToSpeak, language);
  }, [language, sentenceTray, submitSentence, speak]);

  const handleClearAll = () => {
    if (sentenceTray.length >= 3) {
      setShowClearConfirm(true);
    } else {
      clearTray();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-2 md:py-3 bg-white/60 backdrop-blur-sm border-b border-purple-100 shrink-0">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors min-w-[44px] min-h-[44px]"
            aria-label={locale.home}
          >
            <span className="text-xl" aria-hidden="true">{'\u2190'}</span>
            <span className="hidden md:inline">{locale.home}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBadgeGallery(true)}
              className="p-1.5 rounded-full hover:bg-purple-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center text-lg"
              aria-label={locale.badgeGallery}
              title={locale.badgeGallery}
            >
              {'\ud83c\udfc6'}
            </button>
            <h1 className="text-lg md:text-xl font-bold text-purple-700">
              {locale.appTitle}
            </h1>
            {sentencesToday > 0 && (
              <span className="text-xs font-bold text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                {'\u2b50'} {sentencesToday}
              </span>
            )}
            {language === 'zh-Hans' && (
              <button
                onClick={togglePinyin}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-bold
                  min-h-[36px] transition-all duration-200
                  ${showPinyin
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }
                `}
                role="switch"
                aria-checked={showPinyin}
                aria-label={showPinyin ? 'Hide pinyin' : 'Show pinyin'}
              >
                {locale.pinyinToggle}
              </button>
            )}
            <button
              onClick={togglePos}
              className={`
                px-2.5 py-1 rounded-full text-xs font-bold
                min-h-[36px] transition-all duration-200
                ${showPos
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }
              `}
              role="switch"
              aria-checked={showPos}
              aria-label={showPos ? 'Hide part of speech' : 'Show part of speech'}
            >
              {locale.posToggle}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={sentenceTray.length < 3}
            className={`
              px-4 md:px-6 py-2 rounded-full font-bold text-sm md:text-base
              min-w-[44px] min-h-[44px]
              transition-all duration-200
              ${
                sentenceTray.length < 3
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              }
            `}
          >
            {locale.submit} {'\u2713'}
          </button>
        </header>

        {/* Feedback */}
        <FeedbackOverlay />

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Word Pool */}
          <WordPool />

          {/* Play button row */}
          <nav className="flex items-center justify-center py-1 md:py-3 gap-4 shrink-0" aria-label="Game controls">
            <button
              onClick={handleClearAll}
              className="p-2.5 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow text-gray-500 hover:text-red-500 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-lg"
              aria-label={locale.clearAll}
              title={locale.clearAll}
            >
              {'\ud83e\uddf9'}
            </button>

            <PlayButton />

            <button
              onClick={startNewRound}
              className="p-2.5 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow text-gray-500 hover:text-purple-600 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-lg"
              aria-label={locale.newRound}
              title={locale.newRound}
            >
              {'\ud83d\udd04'}
            </button>
          </nav>
        </main>

        {/* Sentence Tray */}
        <SentenceTray />

        {/* Legend */}
        <footer className="flex flex-wrap gap-2 justify-center px-4 py-1 md:py-2 pb-2 md:pb-4 shrink-0" aria-label={locale.legend}>
          {([
            ['bg-noun', locale.noun],
            ['bg-verb', locale.verb],
            ['bg-adjective', locale.adjective],
            ['bg-adverb', locale.adverb],
            ['bg-phrase', locale.phrase],
            ['bg-conjunction', locale.conjunction],
          ] as const).map(([color, label]) => (
            <span
              key={label}
              className={`${color} px-2 py-0.5 rounded-full text-[10px] md:text-xs text-gray-600 font-medium`}
            >
              {label}
            </span>
          ))}
        </footer>

        {/* Badge Celebration */}
        {showBadgeCelebration && <BadgeCelebration />}

        {/* Badge Gallery */}
        {showBadgeGallery && (
          <BadgeGallery onClose={() => setShowBadgeGallery(false)} />
        )}

        {/* Clear confirmation dialog */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center"
              role="alertdialog"
              aria-modal="true"
              aria-label={locale.clearConfirm}
            >
              <p className="text-lg font-semibold text-gray-700 mb-4">
                {locale.clearConfirm}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    clearTray();
                    setShowClearConfirm(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-red-400 text-white font-bold hover:bg-red-500 transition-colors min-h-[44px]"
                  autoFocus
                >
                  {locale.yes}
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-6 py-2.5 rounded-full bg-gray-200 text-gray-600 font-bold hover:bg-gray-300 transition-colors min-h-[44px]"
                >
                  {locale.no}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTile ? (
          <WordTileComponent tile={activeTile} isDragging className="shadow-2xl scale-110" />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
