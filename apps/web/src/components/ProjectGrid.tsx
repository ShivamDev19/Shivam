'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import Reveal from './Reveal';
import type { Project } from '@/lib/api';

function Visual({
  p,
  n,
  className,
}: {
  p: Project;
  n: string;
  className: string;
}) {
  /*
   * If project has an uploaded hero image,
   * show the actual image.
   */
  if (p.heroImage) {
    return (
      <div
        className={`relative overflow-hidden border border-line bg-surface transition-colors duration-500 group-hover:border-accent ${className}`}
      >
        <Image
          src={p.heroImage}
          alt={`${p.title} project preview`}
          fill
          priority={false}
          sizes="(max-width: 768px) 100vw, 70vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Subtle overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
      </div>
    );
  }

  /*
   * Fallback placeholder when no image exists.
   */
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden border border-line bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:32px_32px] transition-colors duration-500 group-hover:border-accent ${className}`}
    >
      <span className="absolute bottom-3 left-4 text-[clamp(3rem,10vw,8rem)] font-semibold leading-none text-accent/20 transition-transform duration-500 group-hover:translate-x-2">
        {n}
      </span>

      <span className="absolute right-4 top-4 text-xs uppercase tracking-[0.2em] text-muted">
        No preview
      </span>
    </div>
  );
}

function Links({ p }: { p: Project }) {
  const linkClass =
    'inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-accent hover:underline';

  return (
    <div className="mt-5 flex flex-wrap gap-x-6 text-sm">
      <Link
        href={`/projects/${p.slug}`}
        className={`${linkClass} text-accent`}
      >
        Case study →
      </Link>

      {p.githubUrl && (
        <a
          href={p.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          GitHub
        </a>
      )}

      {p.liveUrl && (
        <a
          href={p.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Live demo
        </a>
      )}
    </div>
  );
}

function Text({
  p,
  n,
}: {
  p: Project;
  n: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        {n} — {p.projectType} · {p.category}
      </p>

      <h3 className="mt-3 text-[clamp(1.7rem,3.6vw,3rem)] font-semibold leading-tight">
        {p.title}
      </h3>

      <p className="mt-2 text-lg text-muted">
        {p.shortDescription}
      </p>

      <p className="mt-4 line-clamp-3 max-w-xl text-sm text-muted">
        {p.description}
      </p>

      {p.technologies?.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          {p.technologies.join(' / ')}
        </p>
      )}

      <Links p={p} />
    </div>
  );
}

function Study({
  p,
  i,
}: {
  p: Project;
  i: number;
}) {
  const n = String(i + 1).padStart(2, '0');
  const layout = i % 4;

  const text = <Text p={p} n={n} />;

  return (
    <Reveal className="group border-t border-line py-12 md:py-20">
      {/* Layout 1 */}
      {layout === 0 && (
        <div className="grid gap-8">
          <Visual
            p={p}
            n={n}
            className="aspect-[16/8] w-full"
          />

          <div className="max-w-3xl">
            {text}
          </div>
        </div>
      )}

      {/* Layout 2 */}
      {layout === 1 && (
        <div className="grid items-center gap-8 md:grid-cols-2">
          <Visual
            p={p}
            n={n}
            className="aspect-[4/3] w-full"
          />

          {text}
        </div>
      )}

      {/* Layout 3 */}
      {layout === 2 && (
        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-5 md:order-1">
            {text}
          </div>

          <Visual
            p={p}
            n={n}
            className="aspect-square w-full md:col-span-7 md:order-2 md:aspect-[5/4]"
          />
        </div>
      )}

      {/* Layout 4 */}
      {layout === 3 && (
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            {text}
          </div>

          <Visual
            p={p}
            n={n}
            className="aspect-[21/6] min-h-28 w-full"
          />
        </div>
      )}
    </Reveal>
  );
}

export default function ProjectGrid({
  projects,
}: {
  projects: Project[];
}) {
  const categories = [
    'All',
    ...Array.from(
      new Set(projects.map((p) => p.category))
    ),
  ];

  const [category, setCategory] = useState('All');

  const shown =
    category === 'All'
      ? projects
      : projects.filter(
          (p) => p.category === category
        );

  return (
    <div>
      {/* Category filters */}
      <div
        role="group"
        aria-label="Filter projects by category"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-4 md:mx-0 md:px-0"
      >
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
            className={`min-h-11 shrink-0 border px-4 text-sm transition-colors ${
              category === item
                ? 'border-fg bg-fg text-bg'
                : 'border-line hover:border-accent'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Screen reader status */}
      <p
        className="sr-only"
        aria-live="polite"
      >
        {shown.length} projects shown
      </p>

      {/* Projects */}
      <div
        key={category}
        className="[animation:fadein_.4s_ease]"
      >
        {shown.length > 0 ? (
          shown.map((project, index) => (
            <Study
              key={project.id}
              p={project}
              i={index}
            />
          ))
        ) : (
          <div className="border-t border-line py-20 text-center text-muted">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}