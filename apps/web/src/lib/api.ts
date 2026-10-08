const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export type Project = { id: string; slug: string; title: string; shortDescription: string; description: string; category: string; projectType: string; problem?: string | null; solution?: string | null; features: string[]; technologies: string[]; githubUrl?: string | null; liveUrl?: string | null; architecture?: string | null; challenges?: string | null; learnings?: string | null; featured: boolean };
export type Profile = { email?: string | null; name: string; title: string; shortBio: string; longBio: string; heroText?: string | null; currentFocus: string[] };
export type Skill = { id: string; name: string; category: string };
export type Edu = { endDate?: string | null; id: string; institution: string; degree: string; grade?: string | null };
export type Cert = { id: string; name: string; issuer: string };
export type Exp = { startDate?: string | null; endDate?: string | null; current: boolean; location?: string | null; technologies: string[]; id: string; organization: string; role: string; type: string; description: string };
export type ResumeMeta = { url: string; fileName: string } | null;

export async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${API}/api${path}`, { next: { revalidate: 60 } });
    if (!r.ok) return fallback;
    return ((await r.json()) as { data: T }).data ?? fallback;
  } catch { return fallback; }
}
export const clientApi = '';

export type Social = { id: string; platform: string; url: string; label?: string | null };
