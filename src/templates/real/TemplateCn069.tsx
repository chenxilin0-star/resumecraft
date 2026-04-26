import type { ResumeData, TemplateTheme } from '@/types';
import type { ReactNode } from 'react';

type Props = { data: ResumeData; theme: TemplateTheme };
const Photo = ({ src }: { src?: string }) => src ? <img src={src} className="w-28 h-32 object-cover border-4 border-white" /> : <div className="w-28 h-32 bg-rose-100 border-4 border-white flex items-center justify-center text-rose-500 text-xs">PHOTO</div>;
const parts = (t?: string) => (t || '').split(/\n|；|;/).map(x => x.trim()).filter(Boolean).slice(0, 3);
const Icon = ({ children }: { children: ReactNode }) => <span className="inline-flex w-6 h-6 rounded-full bg-rose-500 text-white items-center justify-center text-xs mr-2">{children}</span>;

export default function TemplateCn069({ data, theme }: Props) {
  const coral = theme.colors.primary || '#ef7f73';
  const box = (title: string, children: ReactNode) => <section className="border-2 border-rose-100 bg-white p-4 mb-4 shadow-sm"><h2 className="text-rose-600 font-black tracking-[0.18em] mb-3"><Icon>◆</Icon>{title}</h2>{children}</section>;
  return (
    <div className="min-h-[297mm] bg-rose-50/70 p-7 text-[12px] text-slate-700 leading-relaxed" style={{ fontFamily: theme.font.body }}>
      <header className="flex bg-white mb-5 shadow-sm">
        <div className="flex-1 p-7"><p className="text-rose-500 tracking-[0.35em] text-xs">PERSONAL RESUME</p><h1 className="text-4xl font-black mt-2 text-slate-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name || '姓名'}</h1><div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">{[data.personal.phone, data.personal.email, data.personal.city, data.personal.website].filter(Boolean).map((c, i) => <span key={i}>● {c}</span>)}</div></div>
        <div className="w-44 flex items-center justify-center" style={{ backgroundColor: coral }}><Photo src={data.personal.photo} /></div>
      </header>
      <main className="grid grid-cols-[1fr_1.28fr] gap-5">
        <aside>{data.summary && box('ABOUT', <p>{data.summary}</p>)}{box('SKILLS', <div className="space-y-3">{data.skills.map((s, i) => <div key={i}><div className="flex justify-between font-semibold"><span>{s.name}</span><span>{s.level}</span></div><div className="h-2 bg-rose-100 rounded"><div className="h-full rounded bg-rose-500" style={{ width: `${Math.min(100, s.level * 20)}%` }} /></div></div>)}</div>)}{box('EDUCATION', <>{data.education.map((e, i) => <p key={i} className="mb-3"><b>{e.school}</b><br/>{e.major} · {e.degree}<br/><span className="text-rose-500">{e.period}</span></p>)}</>)}</aside>
        <section>{box('WORK', <>{data.workExperience.map((w, i) => <div key={i} className="mb-4"><div className="flex justify-between font-bold text-slate-900"><span>{w.company}</span><span className="text-rose-500">{w.period}</span></div><p className="font-semibold">{w.position}</p><ul className="ml-5 list-disc marker:text-rose-500">{parts(w.description).map((b, j) => <li key={j}>{b}</li>)}</ul></div>)}</>)}{box('PROJECTS', <>{data.projects.map((p, i) => <div key={i} className="mb-3 bg-rose-50 p-3"><b>{p.name}</b> <span className="text-rose-500">/{p.role}</span><p>{p.description}</p></div>)}</>)}</section>
      </main>
      <footer className="mt-5 bg-white p-3 flex justify-around text-rose-500 border-t-4 border-rose-300"><span>☎</span><span>✉</span><span>⌂</span><span>★</span><span>●</span></footer>
    </div>
  );
}
