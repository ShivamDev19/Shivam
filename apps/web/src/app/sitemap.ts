import type { MetadataRoute } from "next";
import { get, Project } from "@/lib/api";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const ps = await get<Project[]>("/projects", []);
  return [{ url: base }, ...ps.map((p) => ({ url: `${base}/projects/${p.slug}` }))];
}
