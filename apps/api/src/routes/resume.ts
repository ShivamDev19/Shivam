import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db';
import { requireAuth } from '../middleware';
import { getStorage } from '../storage';

export const resume = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

resume.get('/', async (req, res, next) => {
  try {
    const all = req.query.all === '1';
    if (all) return requireAuth(req, res, async () => { res.json({ success: true, data: await prisma.resume.findMany({ orderBy: { uploadedAt: 'desc' } }) }); });
    res.json({ success: true, data: await prisma.resume.findFirst({ where: { active: true }, orderBy: { uploadedAt: 'desc' } }) });
  } catch (e) { next(e); }
});
resume.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const f = req.file;
    if (!f) return res.status(400).json({ success: false, error: 'File required' });
    if (f.mimetype !== 'application/pdf' || f.buffer.subarray(0, 5).toString() !== '%PDF-')
      return res.status(400).json({ success: false, error: 'Only PDF files are allowed' });
    const { key, url } = await getStorage().upload(f.buffer, '.pdf');
    await prisma.resume.updateMany({ data: { active: false } });
    const row = await prisma.resume.create({ data: { fileName: f.originalname.slice(0, 200), storageKey: key, url, size: f.size, active: true } });
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
});
resume.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await prisma.resume.delete({ where: { id: req.params.id } });
    await getStorage().delete(row.storageKey);
    res.json({ success: true });
  } catch (e) { next(e); }
});
