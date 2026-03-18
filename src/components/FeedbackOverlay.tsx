import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';

export function FeedbackOverlay() {
  const feedback = useGameStore((s) => s.feedback);
  const clearFeedback = useGameStore((s) => s.clearFeedback);
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const firedRef = useRef(false);
  const dismissRef = useRef<HTMLButtonElement>(null);
  const locale = t(uiLanguage);

  useEffect(() => {
    if (feedback?.result === 'correct' && !firedRef.current) {
      firedRef.current = true;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#eab308'],
      });
    }
    if (!feedback) {
      firedRef.current = false;
    }
  }, [feedback]);

  // Focus the dismiss button when feedback appears
  useEffect(() => {
    if (feedback && dismissRef.current) {
      dismissRef.current.focus();
    }
  }, [feedback]);

  if (!feedback) return null;

  const bgClass =
    feedback.result === 'correct'
      ? 'bg-green-100 border-green-400 text-green-800'
      : feedback.result === 'partial'
        ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
        : 'bg-orange-100 border-orange-400 text-orange-800';

  const icon =
    feedback.result === 'correct' ? '\u2b50' : feedback.result === 'partial' ? '\ud83d\udca1' : '\ud83d\udcad';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        mx-3 md:mx-6 mb-2 p-3 md:p-4
        rounded-2xl border-2
        flex items-center gap-3
        animate-[slideUp_0.3s_ease-out]
        ${bgClass}
      `}
    >
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      <p className="text-base md:text-lg font-semibold flex-1">{feedback.hint}</p>
      <button
        ref={dismissRef}
        onClick={clearFeedback}
        className="text-lg opacity-60 hover:opacity-100 transition-opacity p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={locale.close}
      >
        {'\u2715'}
      </button>
    </div>
  );
}
