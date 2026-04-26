import type { ResumeData, TemplateTheme } from '@/types';
import type { ReactNode } from 'react';

type Props = { data: ResumeData; theme: TemplateTheme };

const Photo = ({ src, className }: { src?: string; className: string }) => (
  src ? <img src={src} className={`${className} object-cover`} /> : <div className={`${className} bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs`}>PHOTO</div>
);
const items = (text?: string) => (text || '').split(/\n|；|;/).map(s => s.trim()).filter(Boolean).slice(0, 3);

export default function TemplateCn063({ data, theme }: Props) {
  const personal = data.personal;
  const contacts = [personal.phone, personal.email, personal.city, personal.website].filter(Boolean);
  const section = (title: string, children: ReactNode) => (
    <section className="mb-4">
      <div className="bg-zinc-900 text-white text-[13px] font-bold tracking-[0.18em] px-3 py-1.5 mb-2 uppercase">{title}</div>
      {children}
    </section>
  );
  return (
    <div className="bg-white text-zinc-800 min-h-[297mm] w-full p-8 text-[12px] leading-relaxed" style={{ fontFamily: theme.font.body }}>
      <header className="relative bg-zinc-900 text-white h-36 px-8 py-7 mb-6">
        <h1 className="text-4xl font-black tracking-[0.22em]" style={{ fontFamily: theme.font.heading }}>{personal.name || '姓名'}</h1>
        <div className="mt-3 h-px bg-white/50 w-2/3" />
        <p className="mt-3 text-sm tracking-[0.35em] text-zinc-200">PERSONAL RESUME</p>
        <Photo src={personal.photo} className="absolute right-8 top-6 w-24 h-28 border-4 border-white shadow" />
      </header>
      <div className="border-b-2 border-zinc-900 pb-2 mb-4 grid grid-cols-4 gap-2 text-[11px] text-center">{contacts.map((c, i) => <span key={i} className="border-r last:border-r-0 border-zinc-300 px-1 truncate">{c}</span>)}</div>
      {data.summary && section('Profile', <p className="text-zinc-700 indent-6">{data.summary}</p>)}
      {section('Work Experience', <div>{data.workExperience.map((w, i) => <div key={i} className="mb-3"><div className="flex justify-between font-bold text-zinc-950"><span>{w.company} · {w.position}</span><span>{w.period}</span></div><ul className="list-disc ml-5 mt-1">{items(w.description).map((x, j) => <li key={j}>{x}</li>)}</ul></div>)}</div>)}
      {section('Projects', <div>{data.projects.map((p, i) => <div key={i} className="mb-3 border-l-4 border-zinc-800 pl-3"><div className="flex justify-between font-bold"><span>{p.name} / {p.role}</span><span>{p.period}</span></div><p>{p.description}</p>{p.techStack && <p className="text-zinc-500">Tech: {p.techStack}</p>}</div>)}</div>)}
      {section('Education', <div>{data.education.map((e, i) => <div key={i} className="flex justify-between mb-2"><b>{e.school} · {e.major} · {e.degree}</b><span>{e.period}</span></div>)}</div>)}
      {section('Skills', <div className="grid grid-cols-2 gap-2">{data.skills.map((s, i) => <div key={i} className="flex items-center gap-2"><span className="w-28 font-semibold">{s.name}</span><div className="h-1.5 bg-zinc-200 flex-1"><div className="h-full bg-zinc-900" style={{ width: `${Math.min(100, s.level * 20)}%` }} /></div></div>)}</div>)}
    </div>
  );
}
