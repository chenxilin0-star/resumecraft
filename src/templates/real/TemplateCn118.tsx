import type { ResumeData, TemplateTheme } from '@/types';
import type { ReactNode } from 'react';

type Props = { data: ResumeData; theme: TemplateTheme };
const Photo = ({ src }: { src?: string }) => src ? <img src={src} className="w-28 h-32 object-cover mx-auto" /> : <div className="w-28 h-32 bg-gray-300 mx-auto flex items-center justify-center text-gray-600 text-xs">PHOTO</div>;
const cut = (t?: string) => (t || '').split(/\n|；|;/).map(x => x.trim()).filter(Boolean).slice(0, 3);

export default function TemplateCn118({ data, theme }: Props) {
  const dark = theme.colors.primary || '#333333';
  const section = (title: string, children: ReactNode) => <section className="mb-5 border border-gray-300"><h2 className="text-white px-4 py-1.5 font-bold tracking-[0.18em]" style={{ backgroundColor: dark }}>{title}</h2><div className="p-4">{children}</div></section>;
  return <div className="min-h-[297mm] bg-white grid grid-cols-[28%_72%] text-[12px] text-gray-700 leading-relaxed" style={{ fontFamily: theme.font.body }}>
    <aside className="bg-gray-100 p-7"><Photo src={data.personal.photo} /><h1 className="text-3xl font-bold text-center mt-5" style={{ fontFamily: theme.font.heading }}>{data.personal.name || '姓名'}</h1><p className="text-center tracking-[0.25em] text-xs text-gray-500 mt-1">RESUME</p><div className="mt-8"><h3 className="bg-gray-700 text-white px-3 py-1 mb-3">CONTACT</h3>{[data.personal.phone, data.personal.email, data.personal.city, data.personal.website].filter(Boolean).map((c, i) => <p key={i} className="border-b border-gray-300 py-1 break-all">{c}</p>)}<h3 className="bg-gray-700 text-white px-3 py-1 mt-6 mb-3">SKILLS</h3>{data.skills.map((s, i) => <div key={i} className="mb-3"><div className="flex justify-between"><span>{s.name}</span><span>{s.level * 20}%</span></div><div className="h-1.5 bg-white"><div className="h-full bg-gray-700" style={{ width: `${Math.min(100, s.level * 20)}%` }} /></div></div>)}</div></aside>
    <main className="p-8">{data.summary && section('SELF ASSESSMENT', <p>{data.summary}</p>)}{section('WORK EXPERIENCE', <>{data.workExperience.map((w, i) => <div key={i} className="mb-4"><div className="flex justify-between font-bold text-gray-900"><span>{w.company} · {w.position}</span><span>{w.period}</span></div><ul className="list-square ml-5">{cut(w.description).map((b, j) => <li key={j}>{b}</li>)}</ul></div>)}</>)}{section('PROJECTS', <>{data.projects.map((p, i) => <div key={i} className="mb-3 border-l-4 border-gray-500 pl-3"><b>{p.name}</b> <span className="text-gray-500">{p.role} {p.period}</span><p>{p.description}</p></div>)}</>)}{section('EDUCATION', <>{data.education.map((e, i) => <p key={i} className="mb-2"><b>{e.school}</b> · {e.major} · {e.degree}<span className="float-right">{e.period}</span></p>)}</>)}</main>
  </div>;
}
