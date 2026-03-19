import { useState } from 'react';
import type { Language } from '../types';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';
import { CLOUD_TTS_ENABLED } from '../config';
import { WordListUpload } from './WordListUpload';
import { ParentDashboard } from './ParentDashboard';

const uiLanguageOptions: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh-Hans', label: '\u4e2d\u6587' },
];

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const setUiLanguage = useGameStore((s) => s.setUiLanguage);
  const highContrast = useGameStore((s) => s.highContrast);
  const setHighContrast = useGameStore((s) => s.setHighContrast);
  const ttsProvider = useGameStore((s) => s.ttsProvider);
  const setTTSProvider = useGameStore((s) => s.setTTSProvider);
  const setParentPin = useGameStore((s) => s.setParentPin);

  const locale = t(uiLanguage);

  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [showWordLists, setShowWordLists] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const handlePinChange = () => {
    if (newPin.length === 4 && /^\d{4}$/.test(newPin)) {
      setParentPin(newPin);
      setPinMessage(locale.pinChanged);
      setNewPin('');
      setChangingPin(false);
      setTimeout(() => setPinMessage(''), 2000);
    }
  };

  if (showWordLists) {
    return <WordListUpload onClose={() => setShowWordLists(false)} />;
  }

  if (showProgress) {
    return <ParentDashboard onClose={() => setShowProgress(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-sm w-full"
        role="dialog"
        aria-modal="true"
        aria-label={locale.settings}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-purple-700">{locale.settings}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={locale.close}
          >
            {'\u2715'}
          </button>
        </div>

        {/* Instructional Language */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-600 block mb-2">
            {locale.instructionLanguage}
          </label>
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            {uiLanguageOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setUiLanguage(opt.code)}
                className={`
                  flex-1 px-3 py-2 rounded-full text-sm font-bold
                  min-h-[40px] transition-all duration-200
                  ${uiLanguage === opt.code
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-white/80'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        <div className="mb-5 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-600">
            {locale.highContrastMode}
          </label>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`
              w-14 h-8 rounded-full transition-colors duration-200 relative
              ${highContrast ? 'bg-purple-500' : 'bg-gray-300'}
            `}
            role="switch"
            aria-checked={highContrast}
            aria-label={locale.highContrastMode}
          >
            <div
              className={`
                w-6 h-6 rounded-full bg-white shadow-md absolute top-1
                transition-transform duration-200
                ${highContrast ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* TTS Provider */}
        {CLOUD_TTS_ENABLED && (
          <div className="mb-5">
            <label className="text-sm font-semibold text-gray-600 block mb-2">
              {locale.ttsProviderLabel}
            </label>
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setTTSProvider('browser')}
                className={`
                  flex-1 px-3 py-2 rounded-full text-sm font-bold
                  min-h-[40px] transition-all duration-200
                  ${ttsProvider === 'browser'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-white/80'
                  }
                `}
              >
                {locale.browser}
              </button>
              <button
                onClick={() => setTTSProvider('cloud')}
                className={`
                  flex-1 px-3 py-2 rounded-full text-sm font-bold
                  min-h-[40px] transition-all duration-200
                  ${ttsProvider === 'cloud'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-white/80'
                  }
                `}
              >
                {locale.cloud}
              </button>
            </div>
          </div>
        )}

        {/* Word Lists & Progress buttons */}
        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setShowWordLists(true)}
            className="flex-1 px-4 py-2.5 rounded-full bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors min-h-[44px]"
          >
            {locale.uploadWordList}
          </button>
          <button
            onClick={() => setShowProgress(true)}
            className="flex-1 px-4 py-2.5 rounded-full bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100 transition-colors min-h-[44px]"
          >
            {locale.viewProgress}
          </button>
        </div>

        {/* Change PIN */}
        <div className="mb-2">
          {!changingPin ? (
            <button
              onClick={() => setChangingPin(true)}
              className="text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors min-h-[44px]"
            >
              {locale.changePin}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-20 px-3 py-2 rounded-lg border-2 border-gray-200 text-center text-lg font-bold focus:border-purple-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handlePinChange}
                disabled={newPin.length !== 4}
                className={`
                  px-4 py-2 rounded-full text-sm font-bold transition-all min-h-[40px]
                  ${newPin.length === 4
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {'\u2713'}
              </button>
              <button
                onClick={() => {
                  setChangingPin(false);
                  setNewPin('');
                }}
                className="text-gray-400 hover:text-gray-600 min-h-[40px] px-2"
              >
                {'\u2715'}
              </button>
            </div>
          )}
          {pinMessage && (
            <p className="text-green-600 text-sm font-semibold mt-1">{pinMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
