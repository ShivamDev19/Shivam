'use client';
import { FormEvent, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';

const F = [['siteTitle', 'Site title'], ['seoTitle', 'SEO title'], ['seoDescription', 'SEO description'], ['siteDescription', 'Site description'], ['contactEmail', 'Contact email'], ['phone', 'Phone'], ['location', 'Location'], ['ogImage', 'OG image URL']] as const;

export default function SettingsPage() {
  const [v, setV] = useState<Record<string, string> | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  useEffect(() => { adminFetch<Record<string, string>>('/settings').then((r) => setV({ defaultTheme: 'system', ...Object.fromEntries(F.map(([k]) => [k, ''])), ...(r.data ?? {}) })); }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    const r = await adminFetch('/settings', { method: 'PUT', body: v });
    setMsg(r.ok ? { ok: true, t: 'Settings saved.' } : { ok: false, t: `${r.error ?? 'Save failed'} ${Object.entries(r.details ?? {}).map(([k, x]) => `${k}: ${x[0]}`).join('; ')}` });
  }
  if (!v) return <div aria-busy="true" className="h-40 animate-pulse bg-line/40" />;
  return (
    <form onSubmit={save} className="grid max-w-2xl gap-4">
      <h1 className="text-2xl">Settings</h1>
      {F.map(([k, l]) => <label key={k} className="grid gap-1 text-sm">{l}<input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="min-h-11 border border-line bg-transparent px-3 py-2" /></label>)}
      <label className="grid gap-1 text-sm">Default theme<select value={v.defaultTheme} onChange={(e) => setV({ ...v, defaultTheme: e.target.value })} className="min-h-11 border border-line bg-transparent px-3"><option>system</option><option>dark</option><option>light</option></select></label>
      <button className="min-h-11 bg-fg px-5 text-bg">Save settings</button>
      <p aria-live="polite" className={msg?.ok ? 'text-green-600' : 'text-red-500'}>{msg?.t}</p>
    </form>
  );
}
