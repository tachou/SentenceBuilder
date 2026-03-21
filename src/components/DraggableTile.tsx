import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { WordTile } from '../types';
import { WordTileComponent } from './WordTileComponent';
import { useGameStore } from '../store/gameStore';
import { useTTS } from '../hooks/useTTS';

interface DraggableTileProps {
  tile: WordTile;
  area: 'pool' | 'tray';
  index?: number;
}

export function DraggableTile({ tile, area, index }: DraggableTileProps) {
  const addToTray = useGameStore((s) => s.addToTray);
  const removeFromTray = useGameStore((s) => s.removeFromTray);
  const highlightedTileIndex = useGameStore((s) => s.highlightedTileIndex);
  const feedback = useGameStore((s) => s.feedback);
  const language = useGameStore((s) => s.language);
  const sentenceTray = useGameStore((s) => s.sentenceTray);
  const tapToHearEnabled = useGameStore((s) => s.tapToHearEnabled);
  const { speakWord } = useTTS();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.instanceId,
    data: { tile, area, index },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 50 : undefined }
    : undefined;

  const isHighlighted = area === 'tray' && highlightedTileIndex === index;
  const isError =
    area === 'tray' && feedback?.errorTileIds?.includes(tile.instanceId);
  const capitalize =
    area === 'tray' && index === 0 && (language === 'en' || language === 'fr');

  // ARIA: provide context about tile position in sentence
  const ariaDescription =
    area === 'tray' && index !== undefined
      ? `Word ${index + 1} of ${sentenceTray.length} in sentence. Click to remove.`
      : area === 'pool'
        ? 'Click to add to sentence.'
        : undefined;

  const handleClick = () => {
    if (tapToHearEnabled && language) {
      speakWord(tile.word, language);
    }
    if (area === 'pool') {
      addToTray(tile.instanceId);
    } else {
      removeFromTray(tile.instanceId);
    }
  };

  return (
    <WordTileComponent
      ref={setNodeRef}
      tile={tile}
      onClick={handleClick}
      isHighlighted={isHighlighted}
      isError={isError}
      isDragging={isDragging}
      capitalize={capitalize}
      style={style}
      aria-description={ariaDescription}
      {...attributes}
      {...listeners}
    />
  );
}
