import { Router } from 'express';
import { query } from '../db.js';
import { BADGE_DEFINITIONS, evaluateBadges } from '../badges.js';

const router = Router();

// GET /api/badges
router.get('/', (req, res) => {
  const earned = new Set(
    query<{ badge_id: string }>(`SELECT badge_id FROM earned_badges WHERE device_id = ?`, [req.deviceId])
      .map(r => r.badge_id)
  );

  const badges = BADGE_DEFINITIONS.map(b => ({
    ...b,
    earned: earned.has(b.id),
  }));

  res.json(badges);
});

// POST /api/badges/check
router.post('/check', (req, res) => {
  const newlyEarned = evaluateBadges(req.deviceId);
  res.json({ newlyEarned });
});

export default router;
