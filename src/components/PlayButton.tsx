import { useGameStore } from '../store/gameStore';
import { useTTS } from '../hooks/useTTS';
import { t } from '../data/i18n';

export function PlayButton() {
  const sentenceTray = useGameStore((s) => s.sentenceTray);
  const language = useGameStore((s) => s.language);
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const isPlaying = useGameStore((s) => s.isPlaying);
  const { speak, stop } = useTTS();

  const disabled = sentenceTray.length < 3;
  const locale = t(uiLanguage);

  const handleClick = () => {
    if (!language) return;
    if (isPlaying) {
      stop();
    } else {
      speak(sentenceTray, language);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-14 h-14 md:w-20 md:h-20 rounded-full
        flex items-center justify-center
        text-2xl md:text-4xl
        shadow-lg
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-purple-300
        ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isPlaying
              ? 'bg-red-400 text-white hover:bg-red-500 active:scale-90'
              : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 active:scale-90 animate-[pulse_3s_ease-in-out_infinite]'
        }
      `}
      aria-label={isPlaying ? 'Stop' : locale.play}
      title={disabled ? locale.needMoreTiles : ''}
    >
      {isPlaying ? '⏹' : '▶️'}
    </button>
  );
}
