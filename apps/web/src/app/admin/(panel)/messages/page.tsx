'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';

type M = { id: string; name: string; email: string; phone?: string | null; subject?: string | null; message: string; status: string; createdAt: string };
const STATUSES = ['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'];

export default function MessagesPage() {
  const [rows, setRows] = useState<M[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<M | null>(null);
  const [err, setErr] = useState('');
  const limit = 10;
  const load = useCallback(async () => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit), ...(status && { status }), ...(q && { search: q }) });
    const r = await adminFetch<M[]>(`/contact?${qs}`);
    if (!r.ok) { setErr(r.error ?? 'Failed to load'); setRows([]); return; }
    setErr(''); setRows(r.data ?? []); setTotal(r.meta?.total ?? 0);
  }, [page, status, q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  async function setSt(m: M, s: string) {
    const r = await adminFetch<M>(`/contact/${m.id}`, { method: 'PATCH', body: { status: s } });
    if (r.ok && r.data) setSel(r.data); else setErr(r.error ?? 'Update failed');
    load();
  }
  async function del(m: M) {
    if (!window.confirm('Delete this message permanently?')) return;
    const r = await adminFetch(`/contact/${m.id}`, { method: 'DELETE' });
    if (r.ok) setSel(null); else setErr(r.error ?? 'Delete failed');
    load();
  }
  const open = (m: M) => { setSel(m); if (m.status === 'UNREAD') setSt(m, 'READ'); };
  const pages = Math.max(1, Math.ceil(total / limit));
  const ctl = 'min-h-11 border border-line bg-transparent px-3';
  return (
    <div>
      <h1 className="mb-6 text-2xl">Messages</h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <input aria-label="Search messages" placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className={ctl} />
        <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={ctl}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <p role="alert" className="text-red-500">{err}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>{rows === null ? <div aria-busy="true" className="h-32 animate-pulse bg-line/40" /> : rows.length === 0 ? <p className="text-muted">No messages found.</p> :
          <ul className="divide-y divide-line border-y border-line">{rows.map((m) => (
            <li key={m.id}><button onClick={() => open(m)} className={`min-h-11 w-full px-2 py-3 text-left text-sm ${sel?.id === m.id ? 'bg-line/40' : ''}`}>
              <span className="flex justify-between gap-2"><span className="truncate">{m.status === 'UNREAD' && <b aria-label="unread">● </b>}{m.name}</span><time className="shrink-0 text-muted">{new Date(m.createdAt).toLocaleDateString()}</time></span>
              <span className="block truncate text-muted">{m.subject ?? m.message}</span></button></li>))}</ul>}
          <div className="mt-4 flex items-center gap-3 text-sm"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${ctl} disabled:opacity-30`}>Prev</button>Page {page} of {pages}<button disabled={page >= pages} onClick={() => setPage(page + 1)} className={`${ctl} disabled:opacity-30`}>Next</button></div></div>
        {sel && <article className="min-w-0 border border-line p-5 text-sm" aria-label="Message detail">
          <h2 className="text-lg">{sel.subject ?? 'No subject'}</h2><p className="text-muted">{sel.name} · <a className="underline" href={`mailto:${sel.email}`}>{sel.email}</a>{sel.phone && ` · ${sel.phone}`}</p>
          <p className="text-muted">{new Date(sel.createdAt).toLocaleString()} · {sel.status}</p>
          <p className="my-4 whitespace-pre-wrap break-words">{sel.message}</p>
          <div className="flex flex-wrap gap-2">{['READ', 'REPLIED', 'ARCHIVED'].map((s) => <button key={s} disabled={sel.status === s} onClick={() => setSt(sel, s)} className={`${ctl} disabled:opacity-40`}>{s === 'READ' ? 'Mark read' : s === 'REPLIED' ? 'Mark replied' : 'Archive'}</button>)}
            <button onClick={() => del(sel)} className={`${ctl} text-red-500`}>Delete</button></div></article>}
      </div>
    </div>
  );
}
