import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const profileSchema = z.object({
  name: z.string().min(1).max(30),
  avatar: z.string().default('🦁'),
  color: z.string().default('#6c3fc5'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
});

// GET /api/profiles
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const profiles = await prisma.childProfile.findMany({
    where: { parentId: req.parentId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(profiles);
});

// POST /api/profiles
router.post('/', authenticate, validate(profileSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, avatar, color, level } = req.body as z.infer<typeof profileSchema>;
  const profile = await prisma.childProfile.create({
    data: { name, avatar, color, level, parentId: req.parentId },
  });
  res.status(201).json(profile);
});

// PATCH /api/profiles/:id
router.patch('/:id', authenticate, validate(profileSchema.partial()), async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.childProfile.findFirst({
    where: { id: req.params.id, parentId: req.parentId },
  });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  const updated = await prisma.childProfile.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
});

// DELETE /api/profiles/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.childProfile.findFirst({
    where: { id: req.params.id, parentId: req.parentId },
  });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  await prisma.childProfile.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
