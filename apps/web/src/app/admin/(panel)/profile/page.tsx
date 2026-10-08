'use client';
import { FormEvent, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';

type P = Record<string, string>;
const F: [string, string, boolean?][] = [['name', 'Name'], ['title', 'Title'], ['shortBio', 'Short bio'], ['longBio', 'Long bio (About section)', true], ['heroText', 'Hero headline'], ['location', 'Location'], ['email', 'Email'], ['phone', 'Phone'], ['currentFocus', 'Current focus (comma separated)']];

export default function ProfilePage() {
  const [v, setV] = useState<P | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    adminFetch<Record<string, unknown> | null>('/profile').then((r) => {
      const d = r.data ?? {};
      setV(Object.fromEntries(F.map(([k]) => [k, Array.isArray(d[k]) ? (d[k] as string[]).join(', ') : String(d[k] ?? '')])));
    });
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!v || busy) return;
    setBusy(true);
    const opt = (k: string) => (v[k] === '' ? null : v[k]);
    const r = await adminFetch('/profile', { method: 'PUT', body: { name: v.name, title: v.title, shortBio: v.shortBio, longBio: v.longBio, heroText: opt('heroText'), location: opt('location'), email: opt('email'), phone: opt('phone'), currentFocus: v.currentFocus.split(',').map((s) => s.trim()).filter(Boolean) } });
    setBusy(false);
    setMsg(r.ok ? { ok: true, t: 'Profile saved.' } : { ok: false, t: `${r.error ?? 'Save failed'} ${Object.entries(r.details ?? {}).map(([k, x]) => `${k}: ${x[0]}`).join('; ')}` });
  }
  if (!v) return <div aria-busy="true" className="h-40 animate-pulse bg-line/40" />;
  return (
    <form onSubmit={save} className="grid max-w-2xl gap-4">
      <h1 className="text-2xl">Profile</h1>
      {F.map(([k, label, big]) => <label key={k} className="grid gap-1 text-sm">{label}
        {big ? <textarea rows={6} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="border border-line bg-transparent px-3 py-2" />
          : <input value={v[k]} required={['name', 'title', 'shortBio'].includes(k)} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="min-h-11 border border-line bg-transparent px-3 py-2" />}</label>)}
      <button disabled={busy} className="min-h-11 bg-fg px-5 text-bg disabled:opacity-50">{busy ? 'Saving…' : 'Save profile'}</button>
      <p aria-live="polite" className={msg?.ok ? 'text-green-600' : 'text-red-500'}>{msg?.t}</p>
    </form>
  );
}
