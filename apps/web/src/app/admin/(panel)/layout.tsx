'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/adminApi';

const NAV = [['/admin', 'Dashboard'], ['/admin/profile', 'Profile'], ['/admin/projects', 'Projects'], ['/admin/skills', 'Skills'], ['/admin/experience', 'Experience'], ['/admin/education', 'Education'], ['/admin/certifications', 'Certifications'], ['/admin/social-links', 'Social links'], ['/admin/messages', 'Messages'], ['/admin/resume', 'Resume'], ['/admin/settings', 'Settings']];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);
  async function logout() { await adminFetch('/auth/logout', { method: 'POST', body: {} }); router.replace('/admin/login'); router.refresh(); }
  const nav = (
    <nav aria-label="Admin" className="grid gap-1 p-4 text-sm">
      {NAV.map(([href, label]) => <a key={href} href={href} aria-current={path === href ? 'page' : undefined} className={`min-h-11 px-3 py-3 ${path === href ? 'bg-fg text-bg' : 'hover:bg-line/40'}`}>{label}</a>)}
      <button onClick={logout} className="mt-4 min-h-11 border border-line px-3 py-3 text-left">Log out</button>
    </nav>
  );
  return (
    <div className="md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-line md:block">{nav}</aside>
      <div className="border-b border-line p-3 md:hidden"><button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="drawer" className="min-h-11 border border-line px-4">Menu</button></div>
      {open && <div id="drawer" className="border-b border-line md:hidden">{nav}</div>}
      <div className="min-w-0 p-5 md:p-10">{children}</div>
    </div>
  );
}
