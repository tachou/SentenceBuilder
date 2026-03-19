import { Router } from 'express';
import { query, queryOne, run, persist } from '../db.js';

const router = Router();

// POST /api/progress/events
router.post('/events', (req, res) => {
  const { event_type, language, result, words_used, sentence } = req.body;

  if (!event_type || !language) {
    res.status(400).json({ error: 'event_type and language are required' });
    return;
  }

  run(
    `INSERT INTO session_events (device_id, event_type, language, result, words_used, sentence) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.deviceId, event_type, language, result || null, words_used ? JSON.stringify(words_used) : null, sentence || null]
  );
  persist();

  res.json({ success: true });
});

// GET /api/progress/today
router.get('/today', (req, res) => {
  const row = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' AND date(created_at) = date('now')`,
    [req.deviceId]
  );
  res.json({ sentencesToday: row?.count ?? 0 });
});

// GET /api/progress/stats
router.get('/stats', (req, res) => {
  const deviceId = req.deviceId;

  const totals = queryOne<{ total_sentences: number; correct_sentences: number }>(
    `SELECT COUNT(*) as total_sentences, SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct_sentences
     FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted'`,
    [deviceId]
  ) ?? { total_sentences: 0, correct_sentences: 0 };

  const today = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' AND date(created_at) = date('now')`,
    [deviceId]
  ) ?? { count: 0 };

  const byLangRows = query<{ language: string; total: number; correct: number }>(
    `SELECT language, COUNT(*) as total, SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct
     FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' GROUP BY language`,
    [deviceId]
  );

  const byLanguage: Record<string, { total: number; correct: number }> = {};
  for (const row of byLangRows) {
    byLanguage[row.language] = { total: row.total, correct: row.correct };
  }

  // Most used words
  const wordEvents = query<{ words_used: string }>(
    `SELECT words_used FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' AND words_used IS NOT NULL`,
    [deviceId]
  );

  const wordCounts: Record<string, number> = {};
  for (const row of wordEvents) {
    try {
      const words = JSON.parse(row.words_used) as string[];
      for (const w of words) wordCounts[w] = (wordCounts[w] || 0) + 1;
    } catch { /* skip */ }
  }

  const mostUsedWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Daily counts (last 30 days)
  const dailyCounts = query<{ date: string; total: number; correct: number }>(
    `SELECT date(created_at) as date, COUNT(*) as total, SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct
     FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' AND created_at >= datetime('now', '-30 days')
     GROUP BY date(created_at) ORDER BY date(created_at)`,
    [deviceId]
  );

  // Streak
  const allDays = query<{ d: string }>(
    `SELECT DISTINCT date(created_at) as d FROM session_events WHERE device_id = ? AND event_type = 'sentence_submitted' ORDER BY d DESC`,
    [deviceId]
  );

  let streakDays = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  let expectedDate = todayStr;

  for (const row of allDays) {
    if (row.d === expectedDate) {
      streakDays++;
      const d = new Date(expectedDate);
      d.setDate(d.getDate() - 1);
      expectedDate = d.toISOString().split('T')[0];
    } else if (streakDays === 0) {
      // Allow starting from yesterday
      const yesterday = new Date(todayStr);
      yesterday.setDate(yesterday.getDate() - 1);
      if (row.d === yesterday.toISOString().split('T')[0]) {
        expectedDate = row.d;
        streakDays++;
        const d = new Date(expectedDate);
        d.setDate(d.getDate() - 1);
        expectedDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const totalSentences = totals.total_sentences;
  const correctSentences = totals.correct_sentences ?? 0;

  res.json({
    totalSentences,
    correctSentences,
    accuracyPercent: totalSentences > 0 ? Math.round((correctSentences / totalSentences) * 100) : 0,
    sentencesToday: today.count,
    streakDays,
    byLanguage,
    mostUsedWords,
    dailyCounts,
  });
});

export default router;
