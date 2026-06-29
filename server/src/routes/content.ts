import { Router, Request, Response } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/content — returns all game content for offline use
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const [units, vocab, phrases, sentences, listenItems] = await Promise.all([
    prisma.unit.findMany({ orderBy: { id: 'asc' } }),
    prisma.vocabItem.findMany(),
    prisma.phraseItem.findMany(),
    prisma.sentenceItem.findMany(),
    prisma.listenItem.findMany(),
  ]);
  res.json({ units, vocab, phrases, sentences, listenItems });
});

export default router;
