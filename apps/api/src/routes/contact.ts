import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware';

export const contact = Router();
const stripControl = (s: string) => Array.from(s).filter((ch) => { const c = ch.charCodeAt(0); return c >= 32 || c === 9 || c === 10 || c === 13; }).join('');
const clean = (s: string) => stripControl(s.replace(/<[^>]*>/g, '')).trim();
const text = (max: number, min = 1) => z.string().transform(clean).pipe(z.string().min(min).max(max));
const input = z.object({
  name: text(100), email: z.string().email().max(200), phone: text(30).optional(), subject: text(150).optional(), message: text(5000, 10),
  website: z.string().max(0).optional(), // honeypot
});
const statusEnum = z.enum(['UNREAD', 'READ', 'REPLIED', 'ARCHIVED']);
contact.post('/', rateLimit({ windowMs: 60 * 60_000, limit: 5 }), async (req, res, next) => {
  try {
    const { website, ...data } = input.parse(req.body);
    void website;
    await prisma.contactMessage.create({ data });
    res.status(201).json({ success: true, message: 'Message received' });
  } catch (e) { next(e); }
});
const list = z.object({ status: statusEnum.optional(), search: z.string().max(100).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
contact.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, search, page, limit } = list.parse(req.query);
    const ci = (f: string) => ({ [f]: { contains: search, mode: 'insensitive' as const } });
    const where = { ...(status ? { status } : {}), ...(search ? { OR: [ci('name'), ci('email'), ci('message')] } : {}) };
    const [data, total] = await Promise.all([prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.contactMessage.count({ where })]);
    res.json({ success: true, data, meta: { page, limit, total } });
  } catch (e) { next(e); }
});
contact.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { status } = z.object({ status: statusEnum }).parse(req.body);
    res.json({ success: true, data: await prisma.contactMessage.update({ where: { id: req.params.id }, data: { status } }) });
  } catch (e) { next(e); }
});
contact.delete('/:id', requireAuth, async (req, res, next) => { try { await prisma.contactMessage.delete({ where: { id: req.params.id } }); res.json({ success: true }); } catch (e) { next(e); } });
