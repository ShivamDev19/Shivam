'use client';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; as?: 'div' | 'section'; id?: string; className?: string; delay?: number; y?: number };
const ease = [0.22, 1, 0.36, 1] as const;

/** Scroll-triggered fade/slide. Renders plain markup when the visitor prefers reduced motion. */
export default function Reveal({ children, as = 'div', id, className, delay = 0, y = 24 }: Props) {
  const reduce = useReducedMotion();
  const Tag = as === 'section' ? motion.section : motion.div;
  if (reduce) return as === 'section' ? <section id={id} className={className}>{children}</section> : <div id={id} className={className}>{children}</div>;
  return (
    <Tag id={id} className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.7, delay, ease }}>
      {children}
    </Tag>
  );
}

/** Masked line-by-line headline reveal. */
export function RevealLines({ lines, className }: { lines: string[]; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <>
      {lines.map((line, i) => (
        <span key={line} className={`block overflow-hidden pb-[0.08em] ${className ?? ''}`}>
          <motion.span className="block" initial={reduce ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }}>{line}</motion.span>
        </span>
      ))}
    </>
  );
}
