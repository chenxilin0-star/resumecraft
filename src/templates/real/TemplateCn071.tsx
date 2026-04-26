import type { ResumeData, TemplateTheme } from '@/types';
import type { ReactNode } from 'react';

type Props = { data: ResumeData; theme: TemplateTheme };
const Photo = ({ src }: { src?: string }) => src ? <img src={src} className="w-24 h-[7.5rem] object-cover border border-slate-300" /> : <div className="w-24 h-[7.5rem] bg-slate-200 flex items-center justify-center text-slate-500 text-xs">PHOTO</div>;
const split = (s?: string) => (s || '').split(/\n|；|;/).map(v => v.trim()).filter(Boolean).slice(0, 3);

export default function TemplateCn071({ data, theme }: Props) {
  const blue = theme.colors.primary || '#1e3a5f';
  const Section = ({ icon, title, children }: { icon: string; title: string; children: ReactNode }) => <section className="mb-5"><div className="flex items-center gap-3 mb-3"><span className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: blue }}>{icon}</span><h2 className="text-[15px] font-bold text-slate-800 tracking-[0.16em]">{title}</h2><span className="h-px bg-slate-300 flex-1" /></div>{children}</section>;
  return <div className="min-h-[297mm] bg-white p-9 text-[12px] text-slate-700 leading-relaxed" style={{ fontFamily: theme.font.body }}>
    <header className="flex justify-between items-start border-b-4 border-slate-700 pb-5 mb-6"><div><h1 className="text-4xl font-bold tracking-[0.18em] text-slate-900" style={{ fontFamily: theme.font.heading }}>{data.personal.name || '姓名'}</h1><p className="mt-2 text-slate-500 tracking-[0.3em]">FORMAL RESUME</p><div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-[11px]">{[data.personal.phone, data.personal.email, data.personal.city, data.personal.wechat].filter(Boolean).map((c, i) => <span key={i}>{c}</span>)}</div></div><Photo src={data.personal.photo} /></header>
    {data.summary && <Section icon="i" title="PROFILE"><p>{data.summary}</p></Section>}
    <Section icon="W" title="WORK EXPERIENCE">{data.workExperience.map((w, i) => <div key={i} className="mb-4 pl-2"><div className="flex justify-between font-bold text-slate-900"><span>{w.company} · {w.position}</span><span>{w.period}</span></div><ul className="list-disc ml-5 mt-1">{split(w.description).map((b, j) => <li key={j}>{b}</li>)}</ul></div>)}</Section>
    <Section icon="P" title="PROJECT EXPERIENCE">{data.projects.map((p, i) => <div key={i} className="mb-3 border-b border-slate-200 pb-2"><div className="flex justify-between"><b>{p.name} · {p.role}</b><span className="text-slate-500">{p.period}</span></div><p>{p.description}</p></div>)}</Section>
    <Section icon="E" title="EDUCATION">{data.education.map((e, i) => <div key={i} className="flex justify-between mb-2"><b>{e.school} / {e.major} / {e.degree}</b><span>{e.period}</span></div>)}</Section>
    <Section icon="S" title="SKILLS"><div className="grid grid-cols-2 gap-3">{data.skills.map((s, i) => <div key={i} className="border-b border-slate-200 pb-1 flex justify-between"><span>{s.name}</span><span>{s.level * 20}%</span></div>)}</div></Section>
  </div>;
}
