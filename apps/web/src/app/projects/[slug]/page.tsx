import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { get, Project } from "@/lib/api";
import Link from 'next/link';

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };
const load = async (slug: string) => get<Project | null>(`/projects/${encodeURIComponent(slug)}`, null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).slug);
  return p ? { title: p.title, description: p.shortDescription, alternates: { canonical: `/projects/${p.slug}` } } : { title: "Not found" };
}
export default async function ProjectPage({ params }: Props) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const block = (t: string, v?: string | null) => v ? <section className="mt-10"><h2 className="mb-2 text-xl">{t}</h2><p className="whitespace-pre-line text-muted">{v}</p></section> : null;
  return (
    <main className="mx-auto max-w-4xl px-5 py-16 md:px-10">
      <p className="text-sm text-muted">{p.projectType} · {p.category}</p>
      <h1 className="mt-2 text-[clamp(2rem,5vw,4rem)] font-semibold">{p.title}</h1>
      <p className="mt-4 text-muted">{p.shortDescription}</p>
      <div className="mt-6 flex gap-3">{p.githubUrl && <a className="min-h-11 border border-line px-5 py-3" href={p.githubUrl}>GitHub</a>}{p.liveUrl && <a className="min-h-11 border border-line px-5 py-3" href={p.liveUrl}>Live demo</a>}</div>
      {block("Overview", p.description)}{block("Problem", p.problem)}{block("Solution", p.solution)}
      {p.features.length > 0 && <section className="mt-10"><h2 className="mb-2 text-xl">Features</h2><ul className="list-disc pl-5 text-muted">{p.features.map((f) => <li key={f}>{f}</li>)}</ul></section>}
      {block("Architecture", p.architecture)}{block("Challenges", p.challenges)}{block("Learnings", p.learnings)}
      <p className="mt-10 text-sm text-muted">{p.technologies.join(" · ")}</p>
      <Link href="/#projects" className="mt-10 inline-block underline">← All projects</Link>
    </main>
  );
}
