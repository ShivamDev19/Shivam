import Link from 'next/link';
import { get, Profile, Project, Skill, Exp, Edu, Cert, ResumeMeta, Social } from '@/lib/api';
import Hero from '@/components/Hero';
import Reveal from '@/components/Reveal';
import ProjectGrid from '@/components/ProjectGrid';
import ContactForm from '@/components/ContactForm';

export const revalidate = 60;
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
const sec = 'mx-auto w-full max-w-7xl border-t border-line px-5 py-20 md:px-10 md:py-32';
const Label = ({ n, children }: { n: string; children: string }) => <p className="mb-10 text-xs uppercase tracking-[0.25em] text-muted">{n} — {children}</p>;
const Empty = ({ children }: { children: string }) => <p className="text-muted">{children}</p>;
const ORDER = ['Frontend', 'Backend', 'Database', 'Tools & Infrastructure', 'AI & Automation'];
const link = 'inline-flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline';

export default async function Home() {
  const [profile, projects, skills, exp, edu, certs, resume, social] = await Promise.all([
    get<Profile | null>('/profile', null), get<Project[]>('/projects?limit=50', []), get<Skill[]>('/skills', []),
    get<Exp[]>('/experience', []), get<Edu[]>('/education', []), get<Cert[]>('/certifications', []), get<ResumeMeta>('/resume', null), get<Social[]>('/social-links', []),
  ]);
  const groups = skills.reduce<Record<string, string[]>>((a, s) => { (a[s.category] ??= []).push(s.name); return a; }, {});
  const cats = [...ORDER.filter((c) => groups[c]), ...Object.keys(groups).filter((c) => !ORDER.includes(c))];
  const focus = profile?.currentFocus ?? [];
  return (
    <main>
      <Hero profile={profile} resume={resume} />

      <Reveal as="section" id="about" className={sec}>
        <Label n="01">About</Label>
        <div className="grid gap-10 lg:grid-cols-12">
          <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-tight lg:col-span-8">Software is where logic, systems and experience meet.</h2>
          <p className="max-w-md text-muted lg:col-span-4 lg:self-end">{profile?.longBio || profile?.shortBio || 'Bio not added yet.'}</p>
        </div>
      </Reveal>

      <Reveal as="section" id="focus" className={sec}>
        <Label n="02">Current focus</Label>
        {focus.length ? (
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {focus.map((f, i) => (
              <li key={f} className="group bg-bg p-6 transition-colors hover:bg-line/30 md:min-h-44">
                <span className="text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-8 text-xl font-medium transition-transform group-hover:translate-x-1 group-hover:text-accent md:mt-14">{f}</p>
              </li>))}
          </ul>) : <Empty>Nothing listed yet.</Empty>}
      </Reveal>

      <Reveal as="section" id="skills" className={sec}>
        <Label n="03">Technology</Label>
        {cats.length ? <div>{cats.map((c) => (
          <div key={c} className="group grid gap-3 border-t border-line py-6 md:grid-cols-[240px_1fr] md:gap-10">
            <h3 className="text-sm text-muted transition-colors group-hover:text-accent">{c}</h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[clamp(1.1rem,2vw,1.6rem)]">{groups[c].map((s) => <li key={s} className="transition-opacity hover:text-accent group-hover:opacity-90">{s}</li>)}</ul>
          </div>))}</div> : <Empty>No skills added yet.</Empty>}
      </Reveal>

      <section id="projects" className={sec}>
        <Label n="04">Selected work</Label>
        {projects.length ? <ProjectGrid projects={projects} /> : <Empty>No projects published yet.</Empty>}
      </section>

      <Reveal as="section" id="experience" className={sec}>
        <Label n="05">Experience</Label>
        {exp.length ? <ol className="border-l border-line">{exp.map((e) => (
          <li key={e.id} className="relative grid gap-2 py-8 pl-6 md:grid-cols-[200px_1fr] md:gap-10 md:pl-10">
            <span aria-hidden className="absolute -left-[5px] top-10 h-2.5 w-2.5 bg-accent" />
            <p className="text-sm text-muted">{fmt(e.startDate)}{(e.startDate || e.endDate || e.current) && ' — '}{e.current ? 'Present' : fmt(e.endDate)}</p>
            <div><h3 className="text-2xl font-medium">{e.role}</h3><p className="text-muted">{e.organization} · {e.type}</p><p className="mt-3 max-w-2xl text-muted">{e.description}</p>
              {e.technologies.length > 0 && <p className="mt-3 text-xs text-muted">{e.technologies.join(' / ')}</p>}</div>
          </li>))}</ol> : <Empty>No experience entries yet.</Empty>}
      </Reveal>

      <Reveal as="section" id="education" className={sec}>
        <Label n="06">Education</Label>
        {edu.length ? edu.map((e) => (
          <div key={e.id} className="grid gap-2 border-t border-line py-6 md:grid-cols-[200px_1fr_auto] md:gap-10">
            <p className="text-sm text-muted">{e.endDate ? new Date(e.endDate).getFullYear() : ''}</p>
            <div><h3 className="text-2xl font-medium">{e.degree}</h3><p className="text-muted">{e.institution}</p></div>
            {e.grade && <p className="text-sm text-muted">{e.grade}</p>}
          </div>)) : <Empty>No education added yet.</Empty>}
      </Reveal>

      <Reveal as="section" id="certifications" className={sec}>
        <Label n="07">Certifications</Label>
        {certs.length ? certs.map((c) => <div key={c.id} className="flex flex-wrap justify-between gap-2 border-t border-line py-5"><h3 className="text-xl">{c.name}</h3><p className="text-muted">{c.issuer}</p></div>) : <Empty>No certifications listed yet.</Empty>}
      </Reveal>

      <Reveal as="section" id="resume" className={sec}>
        <Label n="08">Resume</Label>
        {resume ? (
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-[1.05] lg:col-span-7">The short version, on paper.</h2>
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <a href={resume.url} className="inline-flex min-h-11 items-center bg-fg px-6 py-3 text-bg transition-transform hover:-translate-y-0.5">View Resume</a>
              <a href={resume.url} download className="inline-flex min-h-11 items-center border border-line px-6 py-3 transition-colors hover:border-accent">Download Resume ↓</a>
            </div>
          </div>) : <Empty>Resume not uploaded yet.</Empty>}
      </Reveal>

      <Reveal as="section" id="contact" className={sec}>
        <Label n="09">Contact</Label>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="text-[clamp(2.4rem,7vw,6rem)] font-semibold leading-[0.98] tracking-tight">Have an idea?<br />Let&apos;s build it.</h2>
            <ul className="mt-10 grid gap-1">
              {profile?.email && <li><a className={link} href={`mailto:${profile.email}`}>{profile.email}</a></li>}
              {social.map((s) => <li key={s.id}><a className={link} href={s.url} rel="noopener noreferrer" target="_blank">{s.label || s.platform} ↗</a></li>)}
            </ul>
          </div>
          <div className="lg:col-span-6"><ContactForm /></div>
        </div>
      </Reveal>

      <footer className="mx-auto max-w-7xl overflow-hidden border-t border-line px-5 pb-8 pt-16 md:px-10">
        <p
  aria-hidden
  className="w-full max-w-full select-none whitespace-nowrap overflow-hidden text-[clamp(2rem,8vw,10rem)] font-semibold leading-none tracking-tighter text-fg/10"
>
  Shivam Sonawane
</p>
        <div className="mt-10 grid gap-8 text-sm md:grid-cols-[1fr_auto] md:items-end">
          <div><p className="font-medium">Shivam Sonawane</p><p className="text-muted">Full Stack Developer</p></div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6">
            {[['/#about', 'About'], ['/#projects', 'Projects'], ['/#experience', 'Experience'], ['/#resume', 'Resume'], ['/#contact', 'Contact']].map(([h, l]) => <Link key={h} href={h} className={link}>{l}</Link>)}
            {social.map((s) => <a key={s.id} href={s.url} rel="noopener noreferrer" target="_blank" className={link}>{s.label || s.platform}</a>)}
            {profile?.email && <a href={`mailto:${profile.email}`} className={link}>Email</a>}
          </nav>
        </div>
        <p className="mt-8 flex flex-wrap justify-between gap-2 border-t border-line pt-6 text-xs text-muted"><span>© 2026 Shivam Sonawane</span><span>Designed &amp; built by Shivam Sonawane</span></p>
      </footer>
    </main>
  );
}
