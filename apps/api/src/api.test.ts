import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

process.env.JWT_SECRET = 'x'.repeat(40);
const prisma = vi.hoisted(() => ({
  adminUser: { findUnique: vi.fn() },
  contactMessage: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  project: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
}));
vi.mock('./db', () => ({ prisma }));
import app from './app';

let cookie: string[] = [];
beforeAll(async () => {
  const passwordHash = await bcrypt.hash('correct-horse-battery', 4);
  prisma.adminUser.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.co', passwordHash });
});

describe('auth', () => {
  it('rejects wrong password', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'nope' });
    expect(r.status).toBe(401);
  });
  it('rejects malformed body with 400', async () => {
    expect((await request(app).post('/api/auth/login').send({ email: 'bad' })).status).toBe(400);
  });
  it('logs in and sets an HTTP-only cookie without leaking the hash', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'correct-horse-battery' });
    expect(r.status).toBe(200);
    expect(JSON.stringify(r.body)).not.toContain('passwordHash');
    cookie = r.headers['set-cookie'] as unknown as string[];
    expect(cookie[0]).toMatch(/HttpOnly/i);
  });
  it('protects /me', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    prisma.adminUser.findUnique.mockResolvedValueOnce({ id: 'u1', email: 'a@b.co' });
    expect((await request(app).get('/api/auth/me').set('Cookie', cookie)).status).toBe(200);
  });
});

describe('contact', () => {
  it('validates input', async () => {
    const r = await request(app).post('/api/contact').send({ name: '', email: 'x', message: 'short' });
    expect(r.status).toBe(400);
    expect(r.body.details).toBeDefined();
  });
  it('rejects filled honeypot', async () => {
    const r = await request(app).post('/api/contact').send({ name: 'A', email: 'a@b.co', message: 'hello there friend', website: 'spam' });
    expect(r.status).toBe(400);
  });
  it('stores a sanitised message', async () => {
    prisma.contactMessage.create.mockResolvedValue({});
    const r = await request(app).post('/api/contact').send({ name: '<b>Ann</b>', email: 'a@b.co', message: 'Hello <script>x</script> there' });
    expect(r.status).toBe(201);
    expect(prisma.contactMessage.create.mock.calls[0][0].data.name).toBe('Ann');
  });
  it('requires auth to read the inbox', async () => {
    expect((await request(app).get('/api/contact')).status).toBe(401);
  });
});

describe('projects', () => {
  it('lists only published projects publicly', async () => {
    prisma.project.findMany.mockResolvedValue([]);
    prisma.project.count.mockResolvedValue(0);
    await request(app).get('/api/projects');
    expect(prisma.project.findMany.mock.calls[0][0].where.published).toBe(true);
  });
  it('blocks unauthenticated create', async () => {
    expect((await request(app).post('/api/projects').send({})).status).toBe(401);
  });
  it('validates slug and creates when valid', async () => {
    const base = { title: 'T', shortDescription: 's', description: 'd', category: 'AI', projectType: 'Project' };
    const bad = await request(app).post('/api/projects').set('Cookie', cookie).send({ ...base, slug: 'Bad Slug' });
    expect(bad.status).toBe(400);
    prisma.project.create.mockResolvedValue({ id: 'p1' });
    const ok = await request(app).post('/api/projects').set('Cookie', cookie).send({ ...base, slug: 'good-slug' });
    expect(ok.status).toBe(201);
  });
});
