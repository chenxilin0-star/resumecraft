import type { ResumeData, TemplateTheme } from '@/types';
import type { ReactNode } from 'react';

type Props = { data: ResumeData; theme: TemplateTheme };
const Photo = ({ src }: { src?: string }) => src ? <img src={src} className="w-24 h-28 object-cover" /> : <div className="w-24 h-28 bg-teal-50 flex items-center justify-center text-teal-600 text-xs">PHOTO</div>;
const arr = (t?: string) => (t || '').split(/\n|；|;/).map(x => x.trim()).filter(Boolean).slice(0, 3);

export default function TemplateCn161({ data, theme }: Props) {
  const teal = theme.colors.primary || '#139c95';
  const Row = ({ label, children }: { label: string; children: ReactNode }) => <section className="grid grid-cols-[140px_1fr] mb-5"><div className="relative"><div className="text-white font-bold px-4 py-2 tracking-[0.12em]" style={{ backgroundColor: teal }}>{label}</div><div className="absolute right-[-18px] top-0 border-y-[17px] border-y-transparent border-l-[18px]" style={{ borderLeftColor: teal }} /></div><div className="border-t-2 border-gray-200 pl-8 pt-3">{children}</div></section>;
  return <div className="min-h-[297mm] bg-white p-9 text-[12px] text-gray-700 leading-relaxed" style={{ fontFamily: theme.font.body }}>
    <header className="relative border-b-2 border-teal-600 pb-6 mb-7"><p className="text-teal-700 tracking-[0.5em] font-bold">PERSONAL RESUME</p><h1 className="text-4xl font-light tracking-[0.2em] mt-3 text-gray-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name || '姓名'}</h1><div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-gray-600">{[data.personal.phone, data.personal.email, data.personal.city, data.personal.website].filter(Boolean).map((c, i) => <span key={i}>{c}</span>)}</div><div className="absolute right-0 top-0 p-1 border border-teal-600"><Photo src={data.personal.photo} /></div></header>
    {data.summary && <Row label="ABOUT"><p>{data.summary}</p></Row>}
    <Row label="WORK">{data.workExperience.map((w, i) => <div key={i} className="mb-4"><div className="flex justify-between font-bold text-gray-900"><span>{w.company} · {w.position}</span><span className="text-teal-700">{w.period}</span></div><ul className="ml-5 list-disc marker:text-teal-600">{arr(w.description).map((b, j) => <li key={j}>{b}</li>)}</ul></div>)}</Row>
    <Row label="PROJECT">{data.projects.map((p, i) => <div key={i} className="mb-3"><b>{p.name}</b> <span className="text-teal-700">{p.role} / {p.period}</span><p>{p.description}</p></div>)}</Row>
    <Row label="EDUCATION">{data.education.map((e, i) => <p key={i} className="mb-2"><b>{e.school}</b> · {e.major} · {e.degree}<span className="float-right text-teal-700">{e.period}</span></p>)}</Row>
    <Row label="SKILLS"><div className="grid grid-cols-2 gap-3">{data.skills.map((s, i) => <div key={i} className="flex items-center gap-3"><span className="w-24">{s.name}</span><div className="h-1.5 flex-1 bg-gray-200"><div className="h-full bg-teal-600" style={{ width: `${Math.min(100, s.level * 20)}%` }} /></div></div>)}</div></Row>
  </div>;
}
