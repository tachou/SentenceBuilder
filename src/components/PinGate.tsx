import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';

interface PinGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PinGate({ onSuccess, onCancel }: PinGateProps) {
  const parentPin = useGameStore((s) => s.parentPin);
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const locale = t(uiLanguage);

  const [entered, setEntered] = useState<string>('');
  const [error, setError] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      if (entered.length >= 4) return;
      const next = entered + digit;
      setEntered(next);
      setError(false);

      if (next.length === 4) {
        if (next === parentPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setEntered('');
            setError(false);
          }, 800);
        }
      }
    },
    [entered, parentPin, onSuccess]
  );

  const handleDelete = useCallback(() => {
    setEntered((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-xs w-full text-center"
        role="dialog"
        aria-modal="true"
        aria-label={locale.enterPin}
      >
        <h3 className="text-lg font-bold text-purple-700 mb-4">{locale.enterPin}</h3>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`
                w-4 h-4 rounded-full border-2 transition-all duration-200
                ${
                  error
                    ? 'bg-red-400 border-red-400 animate-[shake_0.5s_ease-in-out]'
                    : i < entered.length
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-gray-300'
                }
              `}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm font-semibold mb-2">{locale.incorrectPin}</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '\u232b'].map(
            (key) => {
              if (key === '') return <div key="empty" />;
              if (key === '\u232b') {
                return (
                  <button
                    key="delete"
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-600 mx-auto flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]"
                    aria-label="Delete"
                  >
                    {key}
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  onClick={() => handleDigit(key)}
                  className="w-16 h-16 rounded-2xl bg-purple-50 hover:bg-purple-100 text-2xl font-bold text-purple-700 mx-auto flex items-center justify-center transition-colors min-w-[44px] min-h-[44px] active:scale-90"
                  aria-label={key}
                >
                  {key}
                </button>
              );
            }
          )}
        </div>

        <button
          onClick={onCancel}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] px-4"
        >
          {locale.close}
        </button>
      </div>
    </div>
  );
}
