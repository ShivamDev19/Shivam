"use client";
import { FormEvent, useState } from "react";
import { clientApi } from "@/lib/api";

type State = { status: "idle" | "sending" | "ok" | "error"; error?: string; fields?: Record<string, string[]> };
export default function ContactForm() {
  const [s, setS] = useState<State>({ status: "idle" });
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (s.status === "sending") return;
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const body = Object.fromEntries(Object.entries(fd).filter(([, v]) => v !== ""));
    setS({ status: "sending" });
    try {
      const r = await fetch(`${clientApi}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (r.ok) { form.reset(); setS({ status: "ok" }); }
      else setS({ status: "error", error: r.status === 429 ? "Too many messages. Try again later." : j.error ?? "Failed", fields: j.details });
    } catch { setS({ status: "error", error: "Network error. Please try again." }); }
  }
  const field = "w-full border border-line bg-transparent px-3 py-3 min-h-11";
  const err = (k: string) => s.fields?.[k] && <p role="alert" className="text-sm text-red-500">{s.fields[k][0]}</p>;
  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <label className="grid gap-1 text-sm">Name<input name="name" required maxLength={100} className={field} />{err("name")}</label>
      <label className="grid gap-1 text-sm">Email<input name="email" type="email" required className={field} />{err("email")}</label>
      <label className="grid gap-1 text-sm">Subject (optional)<input name="subject" maxLength={150} className={field} />{err("subject")}</label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="grid gap-1 text-sm">Message<textarea name="message" required minLength={10} maxLength={5000} rows={5} className={field} />{err("message")}</label>
      <button disabled={s.status === "sending"} className="min-h-11 bg-fg px-6 py-3 text-bg disabled:opacity-50">{s.status === "sending" ? "Sending…" : "Send message"}</button>
      <p aria-live="polite" className="text-sm">{s.status === "ok" && "Thanks, your message was sent."}{s.status === "error" && <span className="text-red-500">{s.error}</span>}</p>
    </form>
  );
}
