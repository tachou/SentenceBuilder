import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../store/gameStore';
import { DraggableTile } from './DraggableTile';
import { t } from '../data/i18n';

/** Generate stable random jitter values per tile for a scattered look. */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}

interface TileJitter {
  rotation: number;   // degrees (-5 to +5)
  marginTop: number;  // px (0-8)
  marginLeft: number; // px (0-4)
}

export function WordPool() {
  const wordPool = useGameStore((s) => s.wordPool);
  const uiLanguage = useGameStore((s) => s.uiLanguage);

  const { setNodeRef, isOver } = useDroppable({ id: 'word-pool' });

  const locale = t(uiLanguage);

  // Compute stable jitter values keyed on tile IDs so they don't shift during the round
  const jitterMap = useMemo(() => {
    const map = new Map<string, TileJitter>();
    for (const tile of wordPool) {
      const r1 = seededRandom(tile.instanceId + 'rot');
      const r2 = seededRandom(tile.instanceId + 'mt');
      const r3 = seededRandom(tile.instanceId + 'ml');
      map.set(tile.instanceId, {
        rotation: (r1 - 0.5) * 10,    // -5 to +5 degrees
        marginTop: r2 * 8,            // 0-8px
        marginLeft: r3 * 4,           // 0-4px
      });
    }
    return map;
  }, [wordPool]);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-h-0 max-h-[40vh] md:max-h-none p-3 md:p-6
        flex flex-wrap gap-2 md:gap-3 content-start justify-center items-start
        rounded-2xl md:rounded-3xl mx-3 md:mx-6 mt-1 md:mt-2
        transition-colors duration-200
        ${isOver ? 'bg-blue-50/50' : ''}
        overflow-y-auto
      `}
    >
      {wordPool.map((tile) => {
        const jitter = jitterMap.get(tile.instanceId);
        const jitterStyle = jitter
          ? {
              transform: `rotate(${jitter.rotation}deg)`,
              marginTop: `${jitter.marginTop}px`,
              marginLeft: `${jitter.marginLeft}px`,
            }
          : undefined;

        return (
          <div key={tile.instanceId} style={jitterStyle} className="transition-transform duration-200">
            <DraggableTile tile={tile} area="pool" />
          </div>
        );
      })}
      {wordPool.length === 0 && (
        <p className="text-gray-400 text-lg mt-8">{locale.allWordsUsed || 'All words are in your sentence!'}</p>
      )}
    </div>
  );
}
