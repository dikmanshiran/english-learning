import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/stats/:profileId/summary
router.get('/:profileId/summary', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.childProfile.findFirst({
    where: { id: req.params.profileId, parentId: req.parentId },
  });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  const sessions = await prisma.gameSession.findMany({
    where: { profileId: req.params.profileId },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });
  res.json({
    totalGames: profile.totalGames,
    totalStars: profile.totalStars,
    recentSessions: sessions,
  });
});

// GET /api/stats/:profileId/words
router.get('/:profileId/words', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.childProfile.findFirst({
    where: { id: req.params.profileId, parentId: req.parentId },
  });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  const words = await prisma.wordStat.findMany({
    where: { profileId: req.params.profileId },
    orderBy: { lastSeen: 'desc' },
  });
  res.json(words);
});

export default router;
