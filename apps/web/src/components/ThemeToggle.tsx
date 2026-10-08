"use client";
export default function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* storage unavailable */ }
  };
  return <button onClick={toggle} aria-label="Toggle light or dark theme" className="min-h-11 min-w-11 border border-line px-3 text-sm hover:border-accent">Theme</button>;
}
