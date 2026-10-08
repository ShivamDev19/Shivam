import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { isAdmin, optionalAuth, requireAuth } from '../middleware';

const date = z.coerce.date().optional().nullable();
const url = z.string().url().max(500).optional().nullable().or(z.literal('').transform(() => null));
type Delegate = {
  findMany(a: object): Promise<unknown>;
  create(a: { data: unknown }): Promise<unknown>;
  update(a: { where: { id: string }; data: unknown }): Promise<unknown>;
  delete(a: { where: { id: string } }): Promise<unknown>;
};
const sort = z.number().int().default(0);

// Generic CRUD: public GET returns only visible rows, admin GET returns everything.
function crud(model: string, schema: z.ZodObject<z.ZodRawShape>, visible: object) {
  const r = Router();
  // Prisma delegates share method names but not types; the model key is a fixed internal literal.
  const m = () => (prisma as unknown as Record<string, Delegate>)[model];
  r.get('/', optionalAuth, async (req, res, next) => {
    try { res.json({ success: true, data: await m().findMany({ where: isAdmin(req) ? {} : visible, orderBy: { sortOrder: 'asc' } }) }); } catch (e) { next(e); }
  });
  r.post('/', requireAuth, async (req, res, next) => {
    try { res.status(201).json({ success: true, data: await m().create({ data: schema.parse(req.body) }) }); } catch (e) { next(e); }
  });
  r.put('/:id', requireAuth, async (req, res, next) => {
    try { res.json({ success: true, data: await m().update({ where: { id: req.params.id }, data: schema.partial().parse(req.body) }) }); } catch (e) { next(e); }
  });
  r.delete('/:id', requireAuth, async (req, res, next) => {
    try { await m().delete({ where: { id: req.params.id } }); res.json({ success: true }); } catch (e) { next(e); }
  });
  return r;
}
export const skills = crud('skill', z.object({ name: z.string().min(1).max(60), category: z.string().min(1).max(60), icon: z.string().max(60).optional().nullable(), sortOrder: sort, active: z.boolean().default(true) }), { active: true });
export const experience = crud('experience', z.object({ organization: z.string().min(1), role: z.string().min(1), type: z.string().min(1), location: z.string().optional().nullable(), startDate: date, endDate: date, current: z.boolean().default(false), description: z.string().min(1), technologies: z.array(z.string()).default([]), sortOrder: sort, published: z.boolean().default(true) }), { published: true });
export const education = crud('education', z.object({ institution: z.string().min(1), degree: z.string().min(1), field: z.string().optional().nullable(), startDate: date, endDate: date, grade: z.string().optional().nullable(), description: z.string().optional().nullable(), sortOrder: sort }), {});
export const certifications = crud('certification', z.object({ name: z.string().min(1), issuer: z.string().min(1), issueDate: date, credentialId: z.string().optional().nullable(), credentialUrl: url, description: z.string().optional().nullable(), published: z.boolean().default(true), sortOrder: sort }), { published: true });
export const socialLinks = crud('socialLink', z.object({ platform: z.string().min(1), url: z.string().url(), label: z.string().optional().nullable(), icon: z.string().optional().nullable(), active: z.boolean().default(true), sortOrder: sort }), { active: true });

const project = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase-kebab-case').max(80),
  title: z.string().min(1).max(120), shortDescription: z.string().min(1).max(300), description: z.string().min(1),
  category: z.enum(['Full Stack', 'AI', 'Frontend', 'Automation']),
  projectType: z.enum(['Project', 'Internship Project', 'Assignment', 'Personal Project']),
  problem: z.string().optional().nullable(), solution: z.string().optional().nullable(),
  features: z.array(z.string()).default([]), technologies: z.array(z.string()).default([]),
  githubUrl: url, liveUrl: url, heroImage: z.string().optional().nullable(), gallery: z.array(z.string()).default([]),
  architecture: z.string().optional().nullable(), challenges: z.string().optional().nullable(), learnings: z.string().optional().nullable(),
  featured: z.boolean().default(false), published: z.boolean().default(false), sortOrder: sort,
});
const q = z.object({ category: z.string().optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(12) });
export const projects = Router();
projects.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category, page, limit } = q.parse(req.query);
    const where = { ...(isAdmin(req) ? {} : { published: true }), ...(category && category !== 'All' ? { category } : {}) };
    const [data, total] = await Promise.all([
      prisma.project.findMany({ where, orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }], skip: (page - 1) * limit, take: limit }),
      prisma.project.count({ where }),
    ]);
    res.json({ success: true, data, meta: { page, limit, total } });
  } catch (e) { next(e); }
});
projects.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const p = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!p || (!p.published && !isAdmin(req))) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: p });
  } catch (e) { next(e); }
});
projects.post('/', requireAuth, async (req, res, next) => { try { res.status(201).json({ success: true, data: await prisma.project.create({ data: project.parse(req.body) }) }); } catch (e) { next(e); } });
projects.put('/:id', requireAuth, async (req, res, next) => { try { res.json({ success: true, data: await prisma.project.update({ where: { id: req.params.id }, data: project.partial().parse(req.body) }) }); } catch (e) { next(e); } });
projects.delete('/:id', requireAuth, async (req, res, next) => { try { await prisma.project.delete({ where: { id: req.params.id } }); res.json({ success: true }); } catch (e) { next(e); } });

const profile = z.object({ name: z.string().min(1), title: z.string().min(1), shortBio: z.string().min(1), longBio: z.string().default(''), location: z.string().optional().nullable(), email: z.string().email().optional().nullable(), phone: z.string().optional().nullable(), imageUrl: z.string().optional().nullable(), heroText: z.string().optional().nullable(), currentFocus: z.array(z.string()).default([]) });
export const profileRoute = Router();
profileRoute.get('/', async (_req, res, next) => { try { res.json({ success: true, data: await prisma.profile.findFirst() }); } catch (e) { next(e); } });
profileRoute.put('/', requireAuth, async (req, res, next) => {
  try {
    const data = profile.parse(req.body); const cur = await prisma.profile.findFirst();
    res.json({ success: true, data: cur ? await prisma.profile.update({ where: { id: cur.id }, data }) : await prisma.profile.create({ data }) });
  } catch (e) { next(e); }
});
