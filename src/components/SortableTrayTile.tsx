import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WordTile } from '../types';
import { WordTileComponent } from './WordTileComponent';
import { useGameStore } from '../store/gameStore';
import { useTTS } from '../hooks/useTTS';

interface SortableTrayTileProps {
  tile: WordTile;
  index: number;
}

export function SortableTrayTile({ tile, index }: SortableTrayTileProps) {
  const removeFromTray = useGameStore((s) => s.removeFromTray);
  const highlightedTileIndex = useGameStore((s) => s.highlightedTileIndex);
  const feedback = useGameStore((s) => s.feedback);
  const language = useGameStore((s) => s.language);
  const sentenceTray = useGameStore((s) => s.sentenceTray);
  const tapToHearEnabled = useGameStore((s) => s.tapToHearEnabled);
  const { speakWord } = useTTS();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tile.instanceId,
    data: { tile, area: 'tray', index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isHighlighted = highlightedTileIndex === index;
  const isError = feedback?.errorTileIds?.includes(tile.instanceId);
  const capitalize =
    index === 0 && (language === 'en' || language === 'fr');

  const ariaDescription =
    `Word ${index + 1} of ${sentenceTray.length} in sentence. Click to remove.`;

  const handleClick = () => {
    if (tapToHearEnabled && language) {
      speakWord(tile.word, language);
    }
    removeFromTray(tile.instanceId);
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
