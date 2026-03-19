import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { t } from '../data/i18n';
import { fetchBadges } from '../lib/api';
import type { BadgeInfo } from '../types';
import { useState } from 'react';

export function BadgeCelebration() {
  const showBadgeCelebration = useGameStore((s) => s.showBadgeCelebration);
  const newlyEarnedBadges = useGameStore((s) => s.newlyEarnedBadges);
  const dismissBadgeCelebration = useGameStore((s) => s.dismissBadgeCelebration);
  const uiLanguage = useGameStore((s) => s.uiLanguage);
  const locale = t(uiLanguage);
  const firedRef = useRef(false);

  const [badgeData, setBadgeData] = useState<BadgeInfo | null>(null);

  const currentBadgeId = newlyEarnedBadges[0];

  useEffect(() => {
    if (!currentBadgeId) { setBadgeData(null); return; }
    fetchBadges().then((badges) => {
      const found = (badges as BadgeInfo[]).find(b => b.id === currentBadgeId);
      setBadgeData(found || null);
    });
  }, [currentBadgeId]);

  useEffect(() => {
    if (showBadgeCelebration && !firedRef.current) {
      firedRef.current = true;
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#eab308', '#f59e0b', '#fbbf24', '#a855f7', '#ec4899'],
      });
    }
    if (!showBadgeCelebration) {
      firedRef.current = false;
    }
  }, [showBadgeCelebration]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!showBadgeCelebration) return;
    const timer = setTimeout(dismissBadgeCelebration, 4000);
    return () => clearTimeout(timer);
  }, [showBadgeCelebration, dismissBadgeCelebration]);

  if (!showBadgeCelebration || !badgeData) return null;

  const badgeName = (locale as unknown as Record<string, string>)[badgeData.nameKey] || badgeData.nameKey;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4"
      onClick={dismissBadgeCelebration}>
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-xs w-full text-center animate-[slideUp_0.3s_ease-out]">
        <p className="text-6xl mb-3">{badgeData.icon}</p>
        <p className="text-sm font-semibold text-purple-500 mb-1">{locale.badgeEarned || 'Badge Earned!'}</p>
        <p className="text-xl font-bold text-gray-700">{badgeName}</p>
      </div>
    </div>
  );
}
