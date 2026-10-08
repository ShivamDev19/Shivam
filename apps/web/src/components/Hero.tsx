'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import HeroVisual from './HeroVisual';
import { RevealLines } from './Reveal';
import type { Profile, ResumeMeta } from '@/lib/api';

const STACK = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'AI'];
const btn = 'inline-flex min-h-11 items-center px-6 py-3 text-sm transition-transform duration-200 hover:-translate-y-0.5';

export default function Hero({ profile, resume }: { profile: Profile | null; resume: ResumeMeta }) {
  const reduce = useReducedMotion();
  const text = profile?.heroText ?? 'Building digital products with code, design & AI.';
  const lines = text.split(/(?= with )/).map((l) => l.trim());
  const fade = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay } });
  return (
    <section className="relative mx-auto grid min-h-[calc(100svh-57px)] max-w-7xl items-center gap-10 px-5 py-12 md:px-10 lg:grid-cols-[1.25fr_1fr] lg:py-0">
      <div>
        <motion.p {...fade(0)} className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">{profile?.name ?? 'Shivam Sonawane'} — {profile?.title ?? 'Full Stack Developer'}</motion.p>
        <h1 className="w-full max-w-full overflow-hidden text-[clamp(2.5rem,7.2vw,7rem)] font-semibold leading-[0.98] tracking-tight">
  <RevealLines lines={lines} />
</h1>
        <motion.p {...fade(0.5)} className="mt-8 max-w-xl text-[clamp(1rem,1.4vw,1.2rem)] text-muted">
          {profile?.shortBio ?? 'Full Stack Developer focused on building modern web applications, AI-assisted products and thoughtful digital experiences.'}
        </motion.p>
        <motion.div {...fade(0.65)} className="mt-8 flex flex-wrap gap-3">
          <Link href="/#projects" className={`${btn} bg-fg text-bg`}>View Projects</Link>
          <Link href="/#contact" className={`${btn} border border-line hover:border-accent`}>Let&apos;s Talk</Link>
          {resume && <a href={resume.url} className={`${btn} text-muted hover:text-fg`}>Download Resume ↓</a>}
        </motion.div>
        <motion.ul {...fade(0.8)} aria-label="Core technologies" className="mt-12 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {STACK.map((s, i) => <li key={s}>{s}{i < STACK.length - 1 && <span aria-hidden className="ml-3 text-line">/</span>}</li>)}
        </motion.ul>
      </div>
      <motion.div {...(reduce ? {} : { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1.1, delay: 0.3 } })}><HeroVisual /></motion.div>
      <div aria-hidden className="absolute bottom-6 left-5 hidden items-center gap-3 text-xs text-muted md:left-10 lg:flex"><span className="h-px w-10 bg-muted" />Scroll</div>
    </section>
  );
}
