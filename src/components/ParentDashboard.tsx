import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';
import { fetchProgressStats } from '../lib/api';
import type { ProgressStats } from '../lib/api';

interface ParentDashboardProps {
  onClose: () => void;
}

export function ParentDashboard({ onClose }: ParentDashboardProps) {
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const locale = t(uiLanguage);

  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxDaily = stats ? Math.max(...stats.dailyCounts.map(d => d.total), 1) : 1;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog" aria-modal="true" aria-label={locale.viewProgress || 'Progress'}>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-purple-700">{locale.viewProgress || 'Progress'}</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center">
            {'\u2715'}
          </button>
        </div>

        {loading && <p className="text-gray-500 text-center py-8">Loading...</p>}

        {!loading && !stats && (
          <p className="text-gray-500 text-center py-8">{locale.noDataYet || 'No data yet'}</p>
        )}

        {stats && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-purple-50 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-700">{stats.totalSentences}</p>
                <p className="text-xs text-purple-500 font-semibold">{locale.totalSentences || 'Total'}</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{stats.accuracyPercent}%</p>
                <p className="text-xs text-green-500 font-semibold">{locale.correctPercent || 'Correct'}</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-700">{stats.streakDays}</p>
                <p className="text-xs text-orange-500 font-semibold">{locale.streak || 'Day streak'}</p>
              </div>
            </div>

            {/* Per-language breakdown */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{locale.perLanguage || 'By Language'}</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['en', 'fr', 'zh-Hans'] as const).map((lang) => {
                  const data = stats.byLanguage[lang];
                  return (
                    <div key={lang} className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-xs font-bold text-gray-600 mb-1">{lang.toUpperCase()}</p>
                      <p className="text-lg font-bold text-gray-700">{data?.total || 0}</p>
                      <p className="text-xs text-gray-500">
                        {data ? Math.round((data.correct / Math.max(data.total, 1)) * 100) : 0}% {locale.correctPercent || 'correct'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily chart */}
            {stats.dailyCounts.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{locale.last30Days || 'Last 30 Days'}</h3>
                <div className="flex items-end gap-[2px] h-24 bg-gray-50 rounded-xl p-2">
                  {stats.dailyCounts.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col justify-end h-full"
                      title={`${day.date}: ${day.total} (${day.correct} correct)`}>
                      <div className="bg-purple-400 rounded-t-sm min-h-[2px]"
                        style={{ height: `${(day.total / maxDaily) * 100}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most used words */}
            {stats.mostUsedWords.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{locale.mostUsedWords || 'Most Used Words'}</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.mostUsedWords.map((w) => (
                    <span key={w.word} className="bg-purple-50 px-2.5 py-1 rounded-full text-xs font-semibold text-purple-700">
                      {w.word} ({w.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
