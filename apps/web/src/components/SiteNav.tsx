'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  ['/#about', 'About'],
  ['/#skills', 'Skills'],
  ['/#projects', 'Projects'],
  ['/#experience', 'Experience'],
  ['/#resume', 'Resume'],
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;

    const on = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const h = document.documentElement;

        setScrolled(h.scrollTop > 8);

        setP(
          h.scrollHeight > h.clientHeight
            ? h.scrollTop / (h.scrollHeight - h.clientHeight)
            : 0
        );
      });
    };

    window.addEventListener('scroll', on, {
      passive: true,
    });

    on();

    return () => {
      window.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* Lock page scroll when mobile menu is open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', esc);

    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`
        sticky top-0 z-50
        border-b
        transition-colors duration-300
        ${
          scrolled || open
            ? 'border-line bg-bg/95 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }
      `}
    >
      {/* Scroll progress */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-accent"
        style={{
          transform: `scaleX(${p})`,
        }}
      />

      {/* Navbar */}
      <div className="relative z-50 flex items-center justify-between px-5 py-3 md:px-10">
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest"
          onClick={() => setOpen(false)}
        >
          SHIVAM SONAWANE
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 text-sm md:flex"
        >
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}

          <ThemeToggle />

          <Link
            href="/#contact"
            className="min-h-11 bg-fg px-4 py-3 text-bg"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          className="
            relative z-[60]
            flex min-h-11 min-w-11
            items-center justify-center
            border border-line
            px-3
            text-sm
            transition-colors
            hover:border-accent
            md:hidden
          "
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`
          fixed
          inset-x-0
          top-[57px]
          z-40
          h-[calc(100dvh-57px)]
          overflow-y-auto
          overscroll-contain
          bg-bg
          px-5
          pb-10
          pt-4
          shadow-2xl
          transition-all
          duration-300
          md:hidden
          ${
            open
              ? 'visible translate-y-0 opacity-100'
              : 'invisible -translate-y-3 opacity-0 pointer-events-none'
          }
        `}
      >
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col"
        >
          {[...LINKS, ['/#contact', 'Contact']].map(
            ([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="
                  flex
                  min-h-14
                  items-center
                  border-b
                  border-line
                  py-4
                  text-2xl
                  transition-colors
                  hover:text-accent
                "
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Theme toggle */}
        <div className="mt-6 border-t border-line pt-5">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}