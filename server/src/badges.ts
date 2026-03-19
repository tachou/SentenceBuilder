import { query, queryOne, run, persist } from './db.js';

export interface BadgeDefinition {
  id: string;
  icon: string;
  nameKey: string;
  descriptionKey: string;
  condition: BadgeCondition;
}

export type BadgeCondition =
  | { type: 'first_sentence' }
  | { type: 'correct_count'; threshold: number }
  | { type: 'total_count'; threshold: number }
  | { type: 'all_languages' }
  | { type: 'streak'; count: number }
  | { type: 'daily_count'; threshold: number };

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first-sentence', icon: '\u2b50', nameKey: 'badgeFirstSentence', descriptionKey: 'badgeFirstSentenceDesc', condition: { type: 'first_sentence' } },
  { id: 'correct-10', icon: '\ud83c\udf96\ufe0f', nameKey: 'badgeCorrect10', descriptionKey: 'badgeCorrect10Desc', condition: { type: 'correct_count', threshold: 10 } },
  { id: 'correct-50', icon: '\ud83c\udfc6', nameKey: 'badgeCorrect50', descriptionKey: 'badgeCorrect50Desc', condition: { type: 'correct_count', threshold: 50 } },
  { id: 'correct-100', icon: '\ud83d\udc51', nameKey: 'badgeCorrect100', descriptionKey: 'badgeCorrect100Desc', condition: { type: 'correct_count', threshold: 100 } },
  { id: 'polyglot', icon: '\ud83c\udf0d', nameKey: 'badgePolyglot', descriptionKey: 'badgePolyglotDesc', condition: { type: 'all_languages' } },
  { id: 'streak-5', icon: '\ud83d\udd25', nameKey: 'badgeStreak5', descriptionKey: 'badgeStreak5Desc', condition: { type: 'streak', count: 5 } },
  { id: 'streak-10', icon: '\u26a1', nameKey: 'badgeStreak10', descriptionKey: 'badgeStreak10Desc', condition: { type: 'streak', count: 10 } },
  { id: 'daily-5', icon: '\ud83d\udcc5', nameKey: 'badgeDaily5', descriptionKey: 'badgeDaily5Desc', condition: { type: 'daily_count', threshold: 5 } },
];

export function evaluateBadges(deviceId: string): string[] {
  const earned = new Set(
    query<{ badge_id: string }>(`SELECT badge_id FROM earned_badges WHERE device_id = ?`, [deviceId])
      .map(r => r.badge_id)
  );

  const totals = queryOne<{ total: number; correct: number }>(
    `SELECT COUNT(*) as total, SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct
     FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted'`,
    [deviceId]
  ) ?? { total: 0, correct: 0 };

  const languages = query<{ language: string }>(
    `SELECT DISTINCT language FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted'`,
    [deviceId]
  );

  const todayRow = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' AND date(created_at) = date('now')`,
    [deviceId]
  );
  const todayCount = todayRow?.count ?? 0;

  // Current correct streak
  const recentResults = query<{ result: string }>(
    `SELECT result FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' ORDER BY created_at DESC LIMIT 100`,
    [deviceId]
  );

  let currentStreak = 0;
  for (const r of recentResults) {
    if (r.result === 'correct') currentStreak++;
    else break;
  }

  const newlyEarned: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (earned.has(badge.id)) continue;

    let satisfied = false;
    const c = badge.condition;

    switch (c.type) {
      case 'first_sentence': satisfied = totals.total >= 1; break;
      case 'correct_count': satisfied = (totals.correct ?? 0) >= c.threshold; break;
      case 'total_count': satisfied = totals.total >= c.threshold; break;
      case 'all_languages': satisfied = languages.length >= 3; break;
      case 'streak': satisfied = currentStreak >= c.count; break;
      case 'daily_count': satisfied = todayCount >= c.threshold; break;
    }

    if (satisfied) {
      run(`INSERT OR IGNORE INTO earned_badges (device_id, badge_id) VALUES (?, ?)`, [deviceId, badge.id]);
      newlyEarned.push(badge.id);
    }
  }

  if (newlyEarned.length > 0) persist();
  return newlyEarned;
}
