import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import { get } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const s = await get<Record<string, string>>('/settings', {});
  const title = s.seoTitle || s.siteTitle || 'Shivam Sonawane — Full Stack Developer';
  const description = s.seoDescription || s.siteDescription || 'Full Stack Developer focused on building modern, scalable and intelligent web experiences.';
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: title, template: '%s | Shivam Sonawane' }, description,
    openGraph: { type: 'website', title, description, images: s.ogImage ? [s.ogImage] : undefined },
    twitter: { card: 'summary_large_image' },
  };
}
const themeScript = "try{var t=localStorage.getItem(\"theme\")||(matchMedia(\"(prefers-color-scheme: dark)\").matches?\"dark\":\"light\");document.documentElement.dataset.theme=t}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
