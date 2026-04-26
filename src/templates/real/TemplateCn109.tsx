import type { ResumeData, TemplateTheme } from '@/types';
import type { ReactNode } from 'react';

type Props = { data: ResumeData; theme: TemplateTheme };
const Photo = ({ src }: { src?: string }) => src ? <img src={src} className="w-20 h-24 object-cover rounded-sm" /> : <div className="w-20 h-24 bg-blue-100 rounded-sm flex items-center justify-center text-blue-500 text-xs">PHOTO</div>;
const lines = (t?: string) => (t || '').split(/\n|；|;/).map(v => v.trim()).filter(Boolean).slice(0, 3);

export default function TemplateCn109({ data, theme }: Props) {
  const blue = theme.colors.primary || '#2f76b7';
  const Section = ({ icon, title, children }: { icon: string; title: string; children: ReactNode }) => <section className="mb-5"><h2 className="flex items-center gap-2 text-blue-700 font-bold tracking-[0.15em] mb-2"><span className="w-7 h-7 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: blue }}>{icon}</span>{title}</h2><div className="pl-9 border-l border-blue-100">{children}</div></section>;
  return <div className="min-h-[297mm] bg-white p-9 text-[12px] text-gray-700 leading-relaxed" style={{ fontFamily: theme.font.body }}>
    <header className="relative bg-gray-50 border-t-4 border-blue-600 p-6 mb-6"><Photo src={data.personal.photo} /><div className="absolute left-32 top-6 right-6"><h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name || '姓名'}</h1><p className="text-blue-700 tracking-[0.25em] text-xs mt-1">CLEAN PROFESSIONAL RESUME</p><div className="mt-4 grid grid-cols-2 gap-y-1 text-[11px]">{[data.personal.phone, data.personal.email, data.personal.city, data.personal.status].filter(Boolean).map((c, i) => <span key={i}>• {c}</span>)}</div></div></header>
    {data.summary && <Section icon="✓" title="SUMMARY"><p>{data.summary}</p></Section>}
    <Section icon="✦" title="EXPERIENCE">{data.workExperience.map((w, i) => <div key={i} className="mb-4"><div className="flex justify-between font-bold text-gray-900"><span>{w.company} · {w.position}</span><span className="text-blue-600">{w.period}</span></div>{lines(w.description).map((b, j) => <p key={j}>- {b}</p>)}</div>)}</Section>
    <Section icon="◎" title="PROJECTS">{data.projects.map((p, i) => <div key={i} className="mb-3"><b>{p.name}</b> <span className="text-blue-600">{p.role} / {p.period}</span><p>{p.description}</p></div>)}</Section>
    <Section icon="▣" title="EDUCATION">{data.education.map((e, i) => <p key={i} className="mb-2"><b>{e.school}</b> · {e.major} · {e.degree} <span className="text-blue-600 float-right">{e.period}</span></p>)}</Section>
    <Section icon="★" title="SKILLS"><div className="grid grid-cols-3 gap-2">{data.skills.map((s, i) => <span key={i} className="bg-blue-50 text-blue-800 px-2 py-1 rounded">{s.name} {s.level * 20}%</span>)}</div></Section>
    <footer className="mt-8 h-1 bg-gradient-to-r from-blue-600 via-gray-300 to-blue-600" />
  </div>;
}
