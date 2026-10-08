import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db';
import { COOKIE, requireAuth, signToken } from '../middleware';

export const auth = Router();
const limiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true });
const body = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });
const prod = process.env.NODE_ENV === 'production';
const cookieOpts = { httpOnly: true, secure: prod, sameSite: (prod ? 'none' : 'lax') as 'none' | 'lax' };
const DUMMY = bcrypt.hashSync('dummy-password', 12);

auth.post('/login', limiter, async (req, res, next) => {
  try {
    const { email, password } = body.parse(req.body);
    const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY);
    if (!user || !ok) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    res.cookie(COOKIE, signToken(user.id), { ...cookieOpts, maxAge: 7 * 864e5 });
    res.json({ success: true, data: { email: user.email } });
  } catch (e) { next(e); }
});
auth.post('/logout', (_req, res) => { res.clearCookie(COOKIE, cookieOpts); res.json({ success: true }); });
auth.get('/me', requireAuth, async (req, res, next) => {
  try {
    const id = (req as unknown as { adminId: string }).adminId;
    res.json({ success: true, data: await prisma.adminUser.findUnique({ where: { id }, select: { id: true, email: true } }) });
  } catch (e) { next(e); }
});
