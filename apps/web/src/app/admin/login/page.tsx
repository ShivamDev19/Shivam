'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminApi';

export default function Login() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true); setError('');
    const r = await adminFetch('/auth/login', { method: 'POST', body: { email: f.get('email'), password: f.get('password') } });
    setBusy(false);
    if (r.ok) { router.replace('/admin'); router.refresh(); return; }
    setError(r.status === 401 ? 'Invalid email or password.' : r.status === 429 ? 'Too many attempts. Try again in 15 minutes.' : r.status === 0 ? 'Network error. Please try again.' : r.error ?? 'Login failed.');
  }
  const field = 'w-full border border-line bg-transparent px-3 py-3 min-h-11';
  return (
    <main className="mx-auto grid min-h-[80vh] max-w-sm content-center px-5">
      <h1 className="mb-6 text-2xl">Admin sign in</h1>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1 text-sm">Email<input name="email" type="email" required autoComplete="username" className={field} /></label>
        <label className="grid gap-1 text-sm">Password
          <span className="flex"><input name="password" type={show ? 'text' : 'password'} required autoComplete="current-password" className={field} />
            <button type="button" onClick={() => setShow(!show)} aria-pressed={show} className="min-h-11 border border-l-0 border-line px-3 text-sm">{show ? 'Hide' : 'Show'}</button></span></label>
        <button disabled={busy} className="min-h-11 bg-fg px-6 py-3 text-bg disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
        <p role="alert" aria-live="polite" className="text-sm text-red-500">{error}</p>
      </form>
    </main>
  );
}
