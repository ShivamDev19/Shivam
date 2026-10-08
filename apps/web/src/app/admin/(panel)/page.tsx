'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';

type Msg = { id: string; name: string; email: string; subject?: string | null; status: string; createdAt: string };
type Proj = { id: string; title: string; published: boolean };
type Stats = { projects: Proj[]; totalProjects: number; skills: number; experience: number; certs: number; unread: number; messages: Msg[] } | null;

export default function Dashboard() {
  const [s, setS] = useState<Stats>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    (async () => {
      const [p, sk, ex, ce, un, ms] = await Promise.all([
        adminFetch<Proj[]>('/projects?limit=50'), adminFetch<unknown[]>('/skills'), adminFetch<unknown[]>('/experience'), adminFetch<unknown[]>('/certifications'),
        adminFetch<Msg[]>('/contact?status=UNREAD&limit=1'), adminFetch<Msg[]>('/contact?limit=5'),
      ]);
      if (!p.ok || !un.ok) { setErr(p.error ?? un.error ?? 'Failed to load'); return; }
      setS({ projects: p.data ?? [], totalProjects: p.meta?.total ?? 0, skills: sk.data?.length ?? 0, experience: ex.data?.length ?? 0, certs: ce.data?.length ?? 0, unread: un.meta?.total ?? 0, messages: ms.data ?? [] });
    })();
  }, []);
  if (err) return <p role="alert" className="text-red-500">{err}</p>;
  if (!s) return <div aria-busy="true" className="h-40 animate-pulse bg-line/40" />;
  const cards: [string, number][] = [['Projects', s.totalProjects], ['Published', s.projects.filter((x) => x.published).length], ['Skills', s.skills], ['Experience', s.experience], ['Certifications', s.certs], ['Unread messages', s.unread]];
  return (
    <div>
      <h1 className="mb-6 text-2xl">Dashboard</h1>
      <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-3">{cards.map(([k, v]) => <div key={k} className="bg-bg p-5"><dt className="text-sm text-muted">{k}</dt><dd className="text-3xl">{v}</dd></div>)}</dl>
      <h2 className="mb-3 mt-10 text-lg">Recent messages</h2>
      {s.messages.length ? <ul className="divide-y divide-line border-y border-line">{s.messages.map((m) => <li key={m.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{m.status === 'UNREAD' && <b aria-label="unread">● </b>}{m.name} · {m.subject ?? m.email}</span><time className="text-muted">{new Date(m.createdAt).toLocaleDateString()}</time></li>)}</ul> : <p className="text-muted">No messages yet.</p>}
      <h2 className="mb-3 mt-10 text-lg">Projects</h2>
      {s.projects.length ? <ul className="text-sm">{s.projects.slice(0, 5).map((p) => <li key={p.id}>{p.title} {p.published ? '' : '(draft)'}</li>)}</ul> : <p className="text-muted">No projects yet.</p>}
    </div>
  );
}
