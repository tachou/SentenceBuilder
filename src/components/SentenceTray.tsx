import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../store/gameStore';
import { DraggableTile } from './DraggableTile';
import { t } from '../data/i18n';

const MAX_TRAY = 12;

export function SentenceTray() {
  const sentenceTray = useGameStore((s) => s.sentenceTray);
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const feedback = useGameStore((s) => s.feedback);
  const locale = t(uiLanguage);

  const { setNodeRef, isOver } = useDroppable({ id: 'sentence-tray' });

  const emptySlots = MAX_TRAY - sentenceTray.length;

  const glowClass = feedback
    ? feedback.result === 'correct'
      ? 'ring-4 ring-green-400 bg-green-50/60'
      : feedback.result === 'partial'
        ? 'ring-4 ring-yellow-400 bg-yellow-50/60'
        : 'bg-white/80'
    : isOver
      ? 'bg-purple-50/60 ring-2 ring-purple-300'
      : 'bg-white/80';

  return (
    <section className="px-3 md:px-6 pb-1 md:pb-2 shrink-0" aria-label="Sentence tray">
      <div
        ref={setNodeRef}
        aria-live="polite"
        aria-atomic="false"
        className={`
          flex items-center gap-2 md:gap-3
          p-3 md:p-4 rounded-2xl
          border-2 border-dashed border-gray-300
          min-h-[60px] md:min-h-[90px]
          transition-all duration-300
          ${glowClass}
        `}
      >
        {sentenceTray.map((tile, index) => (
          <DraggableTile key={tile.instanceId} tile={tile} area="tray" index={index} />
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-16 h-12 md:w-20 md:h-14 rounded-xl border-2 border-dashed border-gray-200 flex-shrink-0"
          />
        ))}
      </div>

      {/* Tile count badge */}
      <div className="flex justify-between items-center mt-1.5 px-1">
        <span className="text-xs text-gray-400">
          {sentenceTray.length}/{MAX_TRAY} {locale.tileCount}
        </span>
        {sentenceTray.length >= MAX_TRAY && (
          <span className="text-xs text-orange-500 font-semibold animate-bounce">
            {locale.trayFull}
          </span>
        )}
      </div>
    </section>
  );
}
