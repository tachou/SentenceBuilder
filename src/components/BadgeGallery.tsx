import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';
import { fetchBadges } from '../lib/api';
import type { BadgeInfo } from '../types';

interface BadgeGalleryProps {
  onClose: () => void;
}

export function BadgeGallery({ onClose }: BadgeGalleryProps) {
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const locale = t(uiLanguage);

  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BadgeInfo | null>(null);

  useEffect(() => {
    fetchBadges()
      .then((data) => setBadges(data as BadgeInfo[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getBadgeName = (b: BadgeInfo): string => {
    return (locale as unknown as Record<string, string>)[b.nameKey] || b.nameKey;
  };

  const getBadgeDesc = (b: BadgeInfo): string => {
    return (locale as unknown as Record<string, string>)[b.descriptionKey] || b.descriptionKey;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full"
        role="dialog" aria-modal="true" aria-label={locale.badgeGallery || 'Badges'}>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-purple-700">{locale.badgeGallery || 'Badges'}</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center">
            {'\u2715'}
          </button>
        </div>

        {loading && <p className="text-gray-500 text-center py-8">Loading...</p>}

        {!loading && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {badges.map((badge) => (
              <button key={badge.id}
                onClick={() => badge.earned && setSelected(badge)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all ${
                  badge.earned
                    ? 'bg-yellow-50 hover:bg-yellow-100 cursor-pointer shadow-sm hover:shadow-md hover:scale-105'
                    : 'bg-gray-100 opacity-40 cursor-default grayscale'
                }`}
                aria-label={getBadgeName(badge)}
                title={badge.earned ? getBadgeName(badge) : (locale.locked || 'Locked')}>
                {badge.icon}
              </button>
            ))}
          </div>
        )}

        {/* Selected badge detail */}
        {selected && (
          <div className="bg-yellow-50 rounded-2xl p-4 text-center" onClick={() => setSelected(null)}>
            <span className="text-5xl">{selected.icon}</span>
            <p className="text-lg font-bold text-gray-700 mt-2">{getBadgeName(selected)}</p>
            <p className="text-sm text-gray-500">{getBadgeDesc(selected)}</p>
          </div>
        )}

        {!loading && badges.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            {badges.filter(b => b.earned).length} / {badges.length}
          </p>
        )}
      </div>
    </div>
  );
}
