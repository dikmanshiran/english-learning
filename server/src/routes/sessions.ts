import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const questionSchema = z.object({
  kind: z.enum(['E2H', 'H2E', 'SENTENCE', 'LISTEN', 'LETTER_CHOICE', 'LETTER_TYPE']),
  questionText: z.string(),
  answer: z.string(),
  chosen: z.string(),
  correct: z.boolean(),
  firstTry: z.boolean(),
});

const sessionSchema = z.object({
  profileId: z.string(),
  units: z.array(z.number()).default([]),
  questionCount: z.number(),
  score: z.number(),
  stars: z.number().min(0).max(3),
  livesLeft: z.number().min(0).max(3),
  questions: z.array(questionSchema),
});

// POST /api/sessions
router.post('/', authenticate, validate(sessionSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const body = req.body as z.infer<typeof sessionSchema>;

  // Verify profile belongs to this parent
  const profile = await prisma.childProfile.findFirst({
    where: { id: body.profileId, parentId: req.parentId },
  });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const session = await prisma.gameSession.create({
    data: {
      profileId: body.profileId,
      units: body.units,
      questionCount: body.questionCount,
      score: body.score,
      stars: body.stars,
      livesLeft: body.livesLeft,
      questions: {
        create: body.questions.map((q) => ({
          kind: q.kind,
          questionText: q.questionText,
          answer: q.answer,
          chosen: q.chosen,
          correct: q.correct,
          firstTry: q.firstTry,
        })),
      },
    },
    include: { questions: true },
  });

  // Update profile totals and word stats
  const starsEarned = body.stars;
  await prisma.childProfile.update({
    where: { id: body.profileId },
    data: {
      totalGames: { increment: 1 },
      totalStars: { increment: starsEarned },
    },
  });

  for (const q of body.questions) {
    const key = q.questionText;
    const existing = await prisma.wordStat.findUnique({
      where: { profileId_wordKey: { profileId: body.profileId, wordKey: key } },
    });
    if (existing) {
      const correct = existing.correct + (q.firstTry ? 1 : 0);
      const wrong = existing.wrong + (!q.firstTry ? 1 : 0);
      const total = correct + wrong;
      const accuracy = total > 0 ? correct / total : 0;
      const mastery = accuracy < 0.3 ? 'STRUGGLING' : accuracy < 0.7 ? 'LEARNING' : 'MASTERED';
      await prisma.wordStat.update({
        where: { id: existing.id },
        data: { correct, wrong, mastery, lastSeen: new Date() },
      });
    } else {
      const mastery = q.firstTry ? 'LEARNING' : 'STRUGGLING';
      await prisma.wordStat.create({
        data: {
          profileId: body.profileId,
          wordKey: key,
          correct: q.firstTry ? 1 : 0,
          wrong: q.firstTry ? 0 : 1,
          mastery,
          lastSeen: new Date(),
        },
      });
    }
  }

  res.status(201).json({ id: session.id });
});

export default router;
