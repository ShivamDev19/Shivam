import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars)');
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const email = ADMIN_EMAIL.toLowerCase();
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });

  if (!(await prisma.profile.count()))
    await prisma.profile.create({ data: { name: 'Shivam Sonawane', title: 'Full Stack Developer', shortBio: 'Full Stack Developer focused on building modern, scalable and intelligent web experiences.', longBio: 'Computer Engineering graduate building full-stack web applications with modern JavaScript technologies.', heroText: 'Building digital products with code, design & AI.', currentFocus: ['Advanced TypeScript', 'Next.js', 'PostgreSQL', 'AI-powered applications', 'Docker', 'Redis', 'Scalable backend architecture', 'WebGL', 'Automation'] } });
  if (!(await prisma.education.count()))
    await prisma.education.create({ data: { institution: 'Set institution in admin', degree: 'Computer Engineering', endDate: new Date('2025-06-01'), grade: '7.03 / 10 CGPA' } });
  if (!(await prisma.skill.count())) {
    const groups: Record<string, string[]> = {
      Frontend: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
      Backend: ['Node.js', 'Express.js', 'REST APIs', 'JWT', 'Authentication', 'Multer', 'Nodemailer'],
      Database: ['MongoDB', 'Mongoose', 'PostgreSQL', 'Prisma'],
      'Tools & Infrastructure': ['Git', 'GitHub', 'Docker', 'Redis', 'Nginx', 'Postman', 'Vite'],
      'AI & Automation': ['OpenAI', 'Groq', 'Prompt Engineering', 'n8n', 'AI APIs'],
    };
    await prisma.skill.createMany({ data: Object.entries(groups).flatMap(([category, names]) => names.map((name, i) => ({ name, category, sortOrder: i }))) });
  }
  await prisma.project.upsert({ where: { slug: 'playpower-airbnb-clone' }, update: {}, create: { slug: 'playpower-airbnb-clone', title: 'Airbnb-style Listing Page', shortDescription: 'Take-home assignment: Airbnb-style listing page. Sample entry, edit in admin.', description: 'Assignment built for a hiring process. Not a commercial product.', category: 'Full Stack', projectType: 'Assignment', technologies: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express.js'], published: true, featured: true } });
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
