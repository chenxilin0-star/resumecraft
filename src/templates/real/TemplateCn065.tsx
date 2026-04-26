import type { ResumeData, TemplateTheme } from '@/types';
import type { ReactNode } from 'react';

type Props = { data: ResumeData; theme: TemplateTheme };
const Photo = ({ src }: { src?: string }) => src ? <img src={src} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" /> : <div className="w-28 h-28 rounded-full bg-emerald-50 border-4 border-white shadow-md flex items-center justify-center text-emerald-500 text-xs">PHOTO</div>;
const bullets = (t?: string) => (t || '').split(/\n|；|;/).map(v => v.trim()).filter(Boolean).slice(0, 3);

export default function TemplateCn065({ data, theme }: Props) {
  const mint = theme.colors.primary || '#87b9a7';
  const contacts = [data.personal.phone, data.personal.email, data.personal.city, data.personal.wechat].filter(Boolean);
  const section = (title: string, children: ReactNode, wide = false) => <section className={`${wide ? 'col-span-2' : ''} bg-white/80 p-4`}><div className="flex items-center gap-3 mb-3"><span className="h-px flex-1 bg-emerald-200" /><h2 className="text-[13px] font-bold tracking-[0.22em] text-emerald-800">{title}</h2><span className="h-px flex-1 bg-emerald-200" /></div>{children}</section>;
  return (
    <div className="min-h-[297mm] bg-white p-7 text-[12px] text-stone-700 leading-relaxed" style={{ fontFamily: theme.font.body }}>
      <div className="relative min-h-[280mm] border-[10px] border-emerald-50 p-8 overflow-hidden">
        <div className="absolute -right-16 top-24 w-40 h-40 rounded-full bg-emerald-100/70" />
        <div className="absolute left-10 bottom-24 w-24 h-24 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-[10px] tracking-widest rotate-[-18deg]">RESUME</div>
        <header className="relative flex justify-between items-start mb-10">
          <div className="pt-4"><p className="text-emerald-700 tracking-[0.45em] text-xs">CURRICULUM VITAE</p><h1 className="text-4xl mt-3 font-light tracking-[0.18em] text-stone-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name || '姓名'}</h1><div className="mt-5 w-48 h-px" style={{ backgroundColor: mint }} /></div>
          <Photo src={data.personal.photo} />
        </header>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6 relative">
          {section('CONTACT', <div className="space-y-2">{contacts.map((c, i) => <p key={i} className="border-b border-emerald-100 pb-1">{c}</p>)}</div>)}
          {data.summary && section('ABOUT', <p>{data.summary}</p>)}
          {section('EXPERIENCE', <div>{data.workExperience.slice(0, 3).map((w, i) => <div key={i} className="mb-4"><p className="font-bold text-stone-800">{w.company}</p><p className="text-emerald-700">{w.position} · {w.period}</p><ul className="mt-1 list-[circle] ml-4">{bullets(w.description).map((b, j) => <li key={j}>{b}</li>)}</ul></div>)}</div>, true)}
          {section('EDUCATION', <div>{data.education.map((e, i) => <p key={i} className="mb-2"><b>{e.school}</b><br/><span className="text-emerald-700">{e.major} / {e.degree}</span><br/>{e.period}</p>)}</div>)}
          {section('SKILLS', <div className="space-y-2">{data.skills.map((s, i) => <div key={i}><div className="flex justify-between"><span>{s.name}</span><span>{s.level * 20}%</span></div><div className="h-1 bg-emerald-50"><div className="h-full bg-emerald-300" style={{ width: `${Math.min(100, s.level * 20)}%` }} /></div></div>)}</div>)}
        </div>
      </div>
    </div>
  );
}
