import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware';

export const settings = Router();
type Row = { key: string; value: string };
const schema = z.object({
  siteTitle: z.string().max(100), siteDescription: z.string().max(300), seoTitle: z.string().max(100), seoDescription: z.string().max(300),
  contactEmail: z.string().email().or(z.literal('')), phone: z.string().max(30), location: z.string().max(100), ogImage: z.string().url().or(z.literal('')),
  defaultTheme: z.enum(['system', 'dark', 'light']),
}).partial();

settings.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.siteSetting.findMany();
    res.json({ success: true, data: Object.fromEntries(rows.map((r: Row) => [r.key, r.value])) });
  } catch (e) { next(e); }
});
settings.put('/', requireAuth, async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    await prisma.$transaction(Object.entries(data).map(([key, value]) => prisma.siteSetting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })));
    const rows = await prisma.siteSetting.findMany();
    res.json({ success: true, data: Object.fromEntries(rows.map((r: Row) => [r.key, r.value])) });
  } catch (e) { next(e); }
});
