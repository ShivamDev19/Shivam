'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';

export type Field = { name: string; label: string; type: 'text' | 'textarea' | 'number' | 'checkbox' | 'date' | 'tags' | 'select'; required?: boolean; options?: string[] };
type Row = Record<string, unknown> & { id: string; sortOrder: number };
type Props = { title: string; endpoint: string; fields: Field[]; titleKey: string; subKey?: string; toggleKey?: string; emptyText: string; listQuery?: string };
type Form = Record<string, string | boolean>;

const toForm = (fields: Field[], row?: Row): Form => Object.fromEntries(fields.map((f) => {
  const v = row?.[f.name];
  if (f.type === 'checkbox') return [f.name, row ? Boolean(v) : f.name === 'active' || f.name === 'published'];
  if (f.type === 'tags') return [f.name, Array.isArray(v) ? v.join(', ') : ''];
  if (f.type === 'date') return [f.name, typeof v === 'string' ? v.slice(0, 10) : ''];
  return [f.name, v == null ? '' : String(v)];
}));
const toPayload = (fields: Field[], form: Form, sortOrder: number) => ({
  sortOrder,
  ...Object.fromEntries(fields.map((f) => {
    const v = form[f.name];
    if (f.type === 'checkbox') return [f.name, Boolean(v)];
    if (f.type === 'number') return [f.name, Number(v) || 0];
    if (f.type === 'tags') return [f.name, String(v).split(',').map((t) => t.trim()).filter(Boolean)];
    return [f.name, v === '' && !f.required ? null : v];
  })),
});

export default function ResourceManager({ title, endpoint, fields, titleKey, subKey, toggleKey, emptyText, listQuery = '' }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [form, setForm] = useState<Form>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await adminFetch<Row[]>(endpoint + listQuery);
    if (r.ok) setRows(r.data ?? []); else { setRows([]); setMsg({ ok: false, text: r.error ?? 'Failed to load' }); }
  }, [endpoint, listQuery]);
  useEffect(() => { load(); }, [load]);

  const open = (row: Row | 'new') => { setEditing(row); setForm(toForm(fields, row === 'new' ? undefined : row)); setMsg(null); };
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy || !editing) return;
    setBusy(true);
    const isNew = editing === 'new';
    const body = toPayload(fields, form, isNew ? rows?.length ?? 0 : editing.sortOrder);
    const r = await adminFetch(isNew ? endpoint : `${endpoint}/${editing.id}`, { method: isNew ? 'POST' : 'PUT', body });
    setBusy(false);
    if (!r.ok) { const d = r.details ? Object.entries(r.details).map(([k, v]) => `${k}: ${v[0]}`).join('; ') : ''; setMsg({ ok: false, text: `${r.error ?? 'Save failed'} ${d}` }); return; }
    setEditing(null); setMsg({ ok: true, text: 'Saved.' }); load();
  }
  async function remove(row: Row) {
    if (!window.confirm(`Delete "${String(row[titleKey])}"? This cannot be undone.`)) return;
    const r = await adminFetch(`${endpoint}/${row.id}`, { method: 'DELETE' });
    setMsg(r.ok ? { ok: true, text: 'Deleted.' } : { ok: false, text: r.error ?? 'Delete failed' }); load();
  }
  async function toggle(row: Row) {
    if (!toggleKey) return;
    const r = await adminFetch(`${endpoint}/${row.id}`, { method: 'PUT', body: { [toggleKey]: !row[toggleKey] } });
    if (!r.ok) setMsg({ ok: false, text: r.error ?? 'Update failed' }); load();
  }
  async function move(i: number, dir: -1 | 1) {
    if (!rows || !rows[i + dir]) return;
    const next = [...rows]; [next[i], next[i + dir]] = [next[i + dir], next[i]];
    const results = await Promise.all(next.map((r, idx) => r.sortOrder === idx ? null : adminFetch(`${endpoint}/${r.id}`, { method: 'PUT', body: { sortOrder: idx } })));
    if (results.some((r) => r && !r.ok)) setMsg({ ok: false, text: 'Reorder failed' });
    load();
  }

  const input = 'w-full border border-line bg-transparent px-3 py-2 min-h-11';
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3"><h1 className="text-2xl">{title}</h1>
        <button onClick={() => open('new')} className="min-h-11 bg-fg px-5 text-bg">Add</button></div>
      <p aria-live="polite" className={`mb-4 text-sm ${msg?.ok ? 'text-green-600' : 'text-red-500'}`}>{msg?.text}</p>
      {editing && (
        <form onSubmit={save} className="mb-8 grid gap-4 border border-line p-5" aria-label={editing === 'new' ? 'Add entry' : 'Edit entry'}>
          {fields.map((f) => f.type === 'checkbox'
            ? <label key={f.name} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} />{f.label}</label>
            : <label key={f.name} className="grid gap-1 text-sm">{f.label}{f.type === 'tags' && ' (comma separated)'}
              {f.type === 'select'
                ? <select required={f.required} value={String(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input}><option value="">Select…</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>
                : f.type === 'textarea'
                ? <textarea rows={4} required={f.required} value={String(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input} />
                : <input type={f.type === 'tags' ? 'text' : f.type} required={f.required} value={String(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={input} />}</label>)}
          <div className="flex gap-3"><button disabled={busy} className="min-h-11 bg-fg px-5 text-bg disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(null)} className="min-h-11 border border-line px-5">Cancel</button></div>
        </form>
      )}
      {rows === null ? <div aria-busy="true" className="h-24 animate-pulse bg-line/40" />
        : rows.length === 0 ? <p className="text-muted">{emptyText}</p>
        : <ul className="divide-y divide-line border-y border-line">{rows.map((row, i) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0"><p className="truncate">{String(row[titleKey])}</p>{subKey && <p className="truncate text-sm text-muted">{String(row[subKey] ?? '')}</p>}</div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="min-h-11 min-w-11 border border-line disabled:opacity-30">↑</button>
              <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="min-h-11 min-w-11 border border-line disabled:opacity-30">↓</button>
              {toggleKey && <button onClick={() => toggle(row)} aria-pressed={Boolean(row[toggleKey])} className="min-h-11 border border-line px-3">{row[toggleKey] ? 'On' : 'Off'}</button>}
              <button onClick={() => open(row)} className="min-h-11 border border-line px-3">Edit</button>
              <button onClick={() => remove(row)} className="min-h-11 border border-line px-3 text-red-500">Delete</button>
            </div></li>))}</ul>}
    </div>
  );
}
