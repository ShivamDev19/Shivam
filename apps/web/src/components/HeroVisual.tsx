'use client';
import dynamic from 'next/dynamic';
import { Component, ReactNode, useEffect, useState } from 'react';
import type { Tier } from './HeroScene';

const tierFor = (w: number): Tier => (w < 640 ? 'low' : w < 1100 ? 'mid' : 'high');
const Scene = dynamic(() => import('./HeroScene'), { ssr: false });

function Fallback() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full text-accent" role="img" aria-label="Abstract geometric illustration">
      {[170, 130, 90, 50].map((r, i) => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeOpacity={0.15 + i * 0.12} strokeWidth="1" strokeDasharray={i % 2 ? '2 6' : undefined} />)}
      <path d="M60 200h280M200 60v280" stroke="currentColor" strokeOpacity="0.15" />
    </svg>
  );
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Fallback /> : this.props.children; }
}

// The wrapper reserves a fixed aspect ratio so swapping fallback -> canvas causes no layout shift.
export default function HeroVisual() {
  const [mode, setMode] = useState<'pending' | 'webgl' | 'fallback'>('pending');
  const [reduced, setReduced] = useState(false);
  const [tier, setTier] = useState<Tier>('mid');
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setTier(tierFor(window.innerWidth));
    let ok = false;
    try { const c = document.createElement('canvas'); ok = Boolean(c.getContext('webgl2') || c.getContext('webgl')); } catch { ok = false; }
    const t = setTimeout(() => setMode(ok ? 'webgl' : 'fallback'), 250);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px] sm:aspect-square">
      {mode === 'webgl' ? <Boundary><Scene tier={tier} reduced={reduced} /></Boundary> : <Fallback />}
    </div>
  );
}
