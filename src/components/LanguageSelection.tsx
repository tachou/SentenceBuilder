import { useState } from 'react';
import type { Language } from '../types';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';
import { PinGate } from './PinGate';
import { Settings } from './Settings';
import { WordListUpload } from './WordListUpload';

const languages: { code: Language; name: string; native: string; emoji: string; color: string }[] = [
  { code: 'en', name: 'English', native: 'English', emoji: '\ud83d\udc36', color: 'from-blue-100 to-blue-200' },
  { code: 'fr', name: 'French', native: 'Fran\u00e7ais', emoji: '\ud83d\udc13', color: 'from-red-100 to-pink-200' },
  { code: 'zh-Hans', name: 'Chinese', native: '\u4e2d\u6587', emoji: '\ud83d\udc3c', color: 'from-amber-100 to-yellow-200' },
];

const uiLanguageOptions: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'zh-Hans', label: '\u4e2d\u6587' },
];

export function LanguageSelection() {
  const setLanguage = useGameStore((s) => s.setLanguage);
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const setUiLanguage = useGameStore((s) => s.setUiLanguage);

  const locale = t(uiLanguage);

  const [showPinGate, setShowPinGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUploadPinGate, setShowUploadPinGate] = useState(false);
  const [showWordListUpload, setShowWordListUpload] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center p-6 relative">
      {/* Settings gear icon — top right */}
      <button
        onClick={() => setShowPinGate(true)}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 hover:bg-white/90 shadow-sm hover:shadow-md flex items-center justify-center text-xl text-gray-500 hover:text-purple-600 transition-all duration-200"
        aria-label={locale.settings}
      >
        {'\u2699\ufe0f'}
      </button>

      {/* Instructional language toggle */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-semibold text-purple-500">
          {locale.instructionLanguage}
        </span>
        <div className="flex gap-1 bg-white/60 rounded-full p-1 shadow-sm">
          {uiLanguageOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setUiLanguage(opt.code)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-bold
                min-h-[36px] transition-all duration-200
                ${uiLanguage === opt.code
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-white/80'
                }
              `}
              aria-label={`Set instructions to ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-purple-700 mb-3 tracking-tight">
          {locale.appTitle}
        </h1>
        <p className="text-xl md:text-2xl text-purple-500 font-semibold">
          {locale.selectLanguage}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {languages.map((lang) => (
          <div
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLanguage(lang.code); } }}
            role="button"
            tabIndex={0}
            className={`
              group relative w-52 h-52 md:w-56 md:h-56
              rounded-3xl bg-gradient-to-br ${lang.color}
              border-4 border-white/60
              shadow-lg hover:shadow-2xl
              transform hover:scale-105 active:scale-95
              transition-all duration-200 ease-out
              flex flex-col items-center justify-center gap-3
              cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-400
            `}
            aria-label={`Select ${lang.name}`}
          >
            <span className="text-7xl md:text-8xl drop-shadow-md group-hover:animate-bounce">
              {lang.emoji}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-gray-700">
              {lang.native}
            </span>
          </div>
        ))}
      </div>


      {/* PIN Gate */}
      {showPinGate && (
        <PinGate
          onSuccess={() => {
            setShowPinGate(false);
            setShowSettings(true);
          }}
          onCancel={() => setShowPinGate(false)}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      {/* Upload PIN Gate */}
      {showUploadPinGate && (
        <PinGate
          onSuccess={() => {
            setShowUploadPinGate(false);
            setShowWordListUpload(true);
          }}
          onCancel={() => setShowUploadPinGate(false)}
        />
      )}

      {/* Word List Upload */}
      {showWordListUpload && (
        <WordListUpload onClose={() => setShowWordListUpload(false)} />
      )}
    </div>
  );
}
