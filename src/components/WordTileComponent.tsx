import { forwardRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { WordTile } from '../types';
import { POS_COLORS } from '../types';
import { useGameStore } from '../store/gameStore';

interface WordTileProps {
  tile: WordTile;
  onClick?: () => void;
  isHighlighted?: boolean;
  isError?: boolean;
  isDragging?: boolean;
  capitalize?: boolean;
  style?: React.CSSProperties;
  className?: string;
  'aria-description'?: string;
}

export const WordTileComponent = forwardRef<HTMLDivElement, WordTileProps>(
  function WordTileComponent(
    { tile, onClick, isHighlighted, isError, isDragging, capitalize, style, className = '', 'aria-description': ariaDescription, ...props },
    ref
  ) {
    const showPinyin = useGameStore((s) => s.showPinyin);
    const showPos = useGameStore((s) => s.showPos);
    const colors = POS_COLORS[tile.pos];
    const displayWord = capitalize
      ? tile.word.charAt(0).toUpperCase() + tile.word.slice(1)
      : tile.word;

    const bgColorClass = isError
      ? 'bg-orange-200 border-orange-400'
      : isHighlighted
        ? 'bg-yellow-300 border-yellow-500 ring-2 ring-yellow-400'
        : `${colors.bg} ${colors.border}`;

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      },
      [onClick]
    );

    return (
      <div
        ref={ref}
        style={style}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`
          inline-flex items-center gap-1.5
          px-4 py-2.5 rounded-2xl
          border-2 ${bgColorClass}
          font-bold text-gray-700
          select-none
          ${isDragging ? 'opacity-50 scale-105 shadow-xl' : 'shadow-md hover:shadow-lg'}
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
          ${isHighlighted ? 'animate-pulse scale-110' : ''}
          ${isError ? 'animate-[shake_0.5s_ease-in-out]' : ''}
          transition-all duration-150 ease-out
          min-w-[44px] min-h-[44px] justify-center
          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
          ${className}
        `}
        role="button"
        aria-label={`${tile.word} - ${tile.pos}`}
        aria-description={ariaDescription}
        tabIndex={0}
        {...props}
      >
        {showPos && (
          <span className="text-[10px] uppercase font-medium text-gray-500 bg-white/50 rounded px-1" aria-hidden="true">
            {colors.label}
          </span>
        )}
        {tile.phonetic && showPinyin ? (
          <ruby className="text-base md:text-lg">
            {displayWord}
            <rp>(</rp>
            <rt className="text-[10px] font-normal text-gray-500">{tile.phonetic}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span className="text-base md:text-lg">{displayWord}</span>
        )}
      </div>
    );
  }
);
