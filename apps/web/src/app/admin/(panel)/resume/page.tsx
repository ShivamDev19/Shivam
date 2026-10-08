'use client';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';

type R = { id: string; fileName: string; url: string; size: number; active: boolean; uploadedAt: string };
export default function ResumePage() {
  const [rows, setRows] = useState<R[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const r = await adminFetch<R[]>('/resume?all=1'); setRows(r.data ?? []); if (!r.ok) setMsg({ ok: false, t: r.error ?? 'Failed to load' }); }, []);
  useEffect(() => { load(); }, [load]);
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.type !== 'application/pdf') return setMsg({ ok: false, t: 'Only PDF files are allowed.' });
    if (f.size > 5 * 1024 * 1024) return setMsg({ ok: false, t: 'File exceeds the 5 MB limit.' });
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData(); fd.append('file', f);
      const res = await fetch('/api/resume', { method: 'POST', body: fd, credentials: 'include' });
      const j = await res.json().catch(() => ({}));
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      setMsg(res.ok ? { ok: true, t: 'Uploaded. It is now the active resume.' } : { ok: false, t: j.error ?? 'Upload failed' });
    } catch { setMsg({ ok: false, t: 'Network error. Please try again.' }); }
    setBusy(false); load();
  }
  async function del(r: R) {
    if (!window.confirm(`Delete ${r.fileName}?`)) return;
    const x = await adminFetch(`/resume/${r.id}`, { method: 'DELETE' });
    setMsg(x.ok ? { ok: true, t: 'Deleted.' } : { ok: false, t: x.error ?? 'Delete failed' }); load();
  }
  return (
    <div>
      <h1 className="mb-6 text-2xl">Resume</h1>
      <label className="inline-flex min-h-11 cursor-pointer items-center bg-fg px-5 text-bg focus-within:outline">{busy ? 'Uploading…' : 'Upload new PDF (max 5 MB)'}<input type="file" accept="application/pdf" onChange={upload} disabled={busy} className="sr-only" /></label>
      <p aria-live="polite" className={`my-4 text-sm ${msg?.ok ? 'text-green-600' : 'text-red-500'}`}>{msg?.t}</p>
      {rows === null ? <div aria-busy="true" className="h-24 animate-pulse bg-line/40" /> : rows.length === 0 ? <p className="text-muted">No resume uploaded yet.</p> :
        <ul className="divide-y divide-line border-y border-line">{rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0"><p className="truncate">{r.fileName} {r.active && <b>(active)</b>}</p><p className="text-muted">{(r.size / 1024).toFixed(0)} KB · {new Date(r.uploadedAt).toLocaleString()}</p></div>
            <div className="flex gap-2"><a href={r.url} download className="min-h-11 border border-line px-3 py-3">Download</a><button onClick={() => del(r)} className="min-h-11 border border-line px-3 text-red-500">Delete</button></div></li>))}</ul>}
    </div>
  );
}
