import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../db';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev-refresh-secret';
const ACCESS_TTL = '15m';
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function makeAccessToken(parentId: string) {
  return jwt.sign({ parentId }, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

function makeRefreshToken(parentId: string) {
  return jwt.sign({ parentId }, REFRESH_SECRET, { expiresIn: '30d' });
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as z.infer<typeof registerSchema>;
  const existing = await prisma.parent.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const parent = await prisma.parent.create({ data: { email, passwordHash } });
  const accessToken = makeAccessToken(parent.id);
  const refreshToken = makeRefreshToken(parent.id);
  await prisma.refreshToken.create({
    data: { token: refreshToken, parentId: parent.id, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: REFRESH_TTL_MS,
  });
  res.status(201).json({ accessToken, parentId: parent.id, email: parent.email });
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const parent = await prisma.parent.findUnique({ where: { email } });
  if (!parent) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const match = await bcrypt.compare(password, parent.passwordHash);
  if (!match) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const accessToken = makeAccessToken(parent.id);
  const refreshToken = makeRefreshToken(parent.id);
  await prisma.refreshToken.create({
    data: { token: refreshToken, parentId: parent.id, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: REFRESH_TTL_MS,
  });
  res.json({ accessToken, parentId: parent.id, email: parent.email });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as { parentId: string };
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Refresh token expired or invalid' });
      return;
    }
    // Rotate token
    await prisma.refreshToken.delete({ where: { token } });
    const newRefresh = makeRefreshToken(payload.parentId);
    await prisma.refreshToken.create({
      data: { token: newRefresh, parentId: payload.parentId, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
    });
    const accessToken = makeAccessToken(payload.parentId);
    res.cookie('refresh_token', newRefresh, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: REFRESH_TTL_MS,
    });
    res.json({ accessToken, parentId: payload.parentId });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  res.clearCookie('refresh_token');
  res.json({ ok: true });
});

export default router;
