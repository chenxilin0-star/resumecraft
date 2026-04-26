import type { ResumeData, TemplateTheme } from '@/types';

interface Props { data: ResumeData; theme: TemplateTheme; }

export default function TemplateCn061({ data, theme }: Props) {
  return (
    <div className="mx-auto min-h-[297mm] w-[210mm] bg-white text-[12.5px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <header className="grid grid-cols-[235px_1fr] bg-[#253142] text-white">
        <div className="bg-[#1c2532] p-7"><div className="h-40 overflow-hidden border-4 border-[#28bdd4] bg-[#303b4b]">{data.personal.photo ? <img src={data.personal.photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl text-white/30">{data.personal.name?.[0]}</div>}</div></div>
        <div className="flex flex-col justify-center px-9"><h1 className="text-5xl font-bold tracking-[0.16em]" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</h1><p className="mt-3 text-lg tracking-[0.28em] text-[#28bdd4]">{data.intention?.position || data.personal.status}</p><div className="mt-5 flex gap-4 text-xs text-slate-300"><span>{data.personal.phone}</span><span>{data.personal.email}</span><span>{data.personal.city}</span></div></div>
      </header>
      <div className="grid grid-cols-[235px_1fr]">
        <aside className="min-h-[226mm] bg-[#303b4b] px-7 py-7 text-white">
          <Side title="PROFILE">{data.summary && <p className="whitespace-pre-line text-slate-200">{data.summary}</p>}</Side>
          <Side title="SKILLS">{data.skills.map(s => <div key={s.name} className="mb-3"><div className="mb-1 flex justify-between text-xs"><span>{s.name}</span><span className="text-[#28bdd4]">{s.level}</span></div><div className="h-2 bg-white/15"><div className="h-2 bg-[#28bdd4]" style={{ width: `${Math.min(100, s.level * 20)}%` }} /></div></div>)}</Side>
          <Side title="ICONS"><div className="flex flex-wrap gap-3">{['✦','⌘','✎','☁','★','◎'].map(x=><span key={x} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#28bdd4] text-[#28bdd4]">{x}</span>)}</div></Side>
        </aside>
        <main className="px-9 py-7">
          <List title="WORK EXPERIENCE" items={data.workExperience}/>
          <List title="PROJECT EXPERIENCE" items={data.projects}/>
          <List title="EDUCATION" items={data.education}/>
          {data.certificates?.length ? <List title="CERTIFICATES" items={data.certificates}/> : null}
        </main>
      </div>
    </div>
  );
}
function Side({title,children}:{title:string;children:any}){return <section className="mb-7"><h2 className="mb-3 border-b border-[#28bdd4] pb-2 text-sm font-bold tracking-[0.28em] text-[#28bdd4]">{title}</h2><div className="text-xs">{children}</div></section>;}
function List({title,items}:{title:string;items:any[]}){return items?.length ? <section className="mb-6"><h2 className="mb-4 text-lg font-black tracking-[0.2em] text-[#28bdd4]">{title}</h2><div className="space-y-4">{items.map((i,idx)=><div key={idx} className="border-l-4 border-[#28bdd4] bg-slate-50 p-4"><div className="flex justify-between font-bold text-[#253142]"><span>{i.company||i.name||i.school}</span><span className="text-xs text-slate-500">{i.period||i.date}</span></div><div className="text-xs font-semibold text-[#28bdd4]">{i.position||i.role||[i.degree,i.major].filter(Boolean).join(' / ')}</div>{i.description&&<p className="mt-1 whitespace-pre-line">{i.description}</p>}{i.techStack&&<p className="mt-1 text-xs text-slate-500">技术栈：{i.techStack}</p>}</div>)}</div></section> : null;}
