import type { ResumeData, TemplateTheme } from '@/types';

interface Props { data: ResumeData; theme: TemplateTheme; }

export default function TemplateCn027({ data, theme }: Props) {
  const green = '#2f8f68';
  const orange = '#ee8b24';
  return (
    <div className="relative mx-auto min-h-[297mm] w-[210mm] overflow-hidden bg-white p-9 text-[12.5px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#e2f2eb]" />
      <div className="relative grid grid-cols-[170px_1fr] gap-7">
        <aside className="pt-5">
          <div className="h-40 w-40 overflow-hidden rounded-[42px_42px_12px_42px] border-4 border-[#2f8f68] bg-[#edf7f2]">{data.personal.photo ? <img src={data.personal.photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl text-green-200">{data.personal.name?.[0]}</div>}</div>
          <div className="mt-8 space-y-4 rounded-3xl bg-[#f2faf6] p-5">
            <Side title="联系"><p>{data.personal.phone}</p><p>{data.personal.email}</p><p>{data.personal.city}</p></Side>
            <Side title="技能">{data.skills.map(s => <span key={s.name} className="mb-2 mr-2 inline-block rounded-full bg-white px-3 py-1 text-xs text-[#2f8f68]">{s.name}</span>)}</Side>
          </div>
        </aside>
        <main>
          <header className="mb-7 border-b-4 border-[#2f8f68] pb-5">
            <h1 className="text-5xl font-black tracking-[0.12em] text-slate-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</h1>
            <p className="mt-3 inline-block rounded-full px-5 py-1 text-sm font-bold tracking-[0.24em] text-white" style={{ background: green }}>{data.intention?.position || data.personal.status}</p>
          </header>
          {data.summary && <Section title="关于我"><p className="whitespace-pre-line">{data.summary}</p></Section>}
          <List title="工作经历" items={data.workExperience}/>
          <List title="项目经验" items={data.projects}/>
          <List title="教育背景" items={data.education}/>
        </main>
      </div>
      <svg className="absolute bottom-8 right-8 h-24 w-24" viewBox="0 0 100 100"><rect x="42" y="10" width="16" height="70" rx="8" fill={orange}/><rect x="15" y="37" width="70" height="16" rx="8" fill={orange}/><circle cx="50" cy="50" r="17" fill="#fff"/><path d="M40 51l7 7 15-19" stroke={green} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}
function Side({title,children}:{title:string;children:any}){return <div><h3 className="mb-2 text-sm font-bold tracking-[0.25em] text-[#2f8f68]">{title}</h3><div className="text-xs text-slate-600">{children}</div></div>;}
function Section({title,children}:{title:string;children:any}){return <section className="mb-5"><h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-[#2f8f68]"><span className="h-3 w-3 rounded-full bg-[#ee8b24]" />{title}</h2>{children}</section>;}
function List({title,items}:{title:string;items:any[]}){return items?.length ? <Section title={title}><div className="space-y-3">{items.map((i,idx)=><div key={idx} className="rounded-2xl border border-[#dceee6] p-3"><div className="flex justify-between font-bold text-slate-900"><span>{i.company||i.name||i.school}</span><span className="text-xs text-[#ee8b24]">{i.period}</span></div><div className="text-xs text-[#2f8f68]">{i.position||i.role||[i.degree,i.major].filter(Boolean).join(' / ')}</div>{i.description&&<p className="mt-1 whitespace-pre-line">{i.description}</p>}</div>)}</div></Section> : null;}
