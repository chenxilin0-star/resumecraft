import type { ResumeData, TemplateTheme } from '@/types';

interface Props { data: ResumeData; theme: TemplateTheme; }

export default function TemplateCn053({ data, theme }: Props) {
  return (
    <div className="mx-auto min-h-[297mm] w-[210mm] bg-[#f6f5f3] p-8 text-[12.5px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <div className="relative grid min-h-[281mm] grid-cols-[225px_1fr] gap-7 overflow-hidden">
        <div className="absolute right-10 top-32 h-52 w-52 rounded-3xl bg-white/45" /><div className="absolute bottom-20 left-36 h-44 w-80 rounded-3xl bg-[#ead4d7]/45" />
        <aside className="relative z-10 space-y-5 pt-56">
          <Card title="CONTACT"><p>{data.personal.phone}</p><p>{data.personal.email}</p><p>{data.personal.city}</p><p>{data.personal.website}</p></Card>
          <Card title="SKILLS">{data.skills.map(s => <div key={s.name} className="mb-2"><div className="flex justify-between text-xs"><span>{s.name}</span><span>{s.level * 20}%</span></div><div className="h-1.5 bg-white"><div className="h-1.5 bg-[#c99da5]" style={{ width: `${Math.min(100, s.level * 20)}%` }} /></div></div>)}</Card>
        </aside>
        <main className="relative z-10">
          <header className="mb-7 grid grid-cols-[1fr_150px] gap-5 rounded-[34px] bg-[#ead4d7] p-6 shadow-sm">
            <div><div className="text-xs uppercase tracking-[0.5em] text-white">Portfolio</div><h1 className="mt-5 text-5xl font-light tracking-[0.16em] text-slate-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</h1><p className="mt-3 text-base tracking-[0.24em] text-[#9f6972]">{data.intention?.position || data.personal.status}</p></div>
            <div className="h-40 overflow-hidden rounded-[26px] bg-white/60 p-2">{data.personal.photo ? <img src={data.personal.photo} alt="" className="h-full w-full rounded-[20px] object-cover" /> : <div className="flex h-full items-center justify-center text-5xl text-white">{data.personal.name?.[0]}</div>}</div>
          </header>
          {data.summary && <Section title="ABOUT"><p className="whitespace-pre-line">{data.summary}</p></Section>}
          <List title="EXPERIENCE" items={data.workExperience}/>
          <List title="PROJECTS" items={data.projects}/>
          <List title="EDUCATION" items={data.education}/>
        </main>
      </div>
    </div>
  );
}
function Card({title,children}:{title:string;children:any}){return <section className="rounded-3xl bg-white/75 p-5 shadow-sm backdrop-blur"><h2 className="mb-3 text-sm font-bold tracking-[0.28em] text-[#9f6972]">{title}</h2><div className="text-xs text-slate-600">{children}</div></section>;}
function Section({title,children}:{title:string;children:any}){return <section className="mb-5 rounded-3xl bg-white/70 p-5 shadow-sm"><h2 className="mb-3 text-lg font-bold tracking-[0.22em] text-[#9f6972]">{title}</h2>{children}</section>;}
function List({title,items}:{title:string;items:any[]}){return items?.length ? <Section title={title}><div className="space-y-3">{items.map((i,idx)=><div key={idx} className="grid grid-cols-[12px_1fr] gap-3"><span className="mt-2 h-3 w-3 rounded-full bg-[#c99da5]"/><div><div className="flex justify-between font-bold text-slate-900"><span>{i.company||i.name||i.school}</span><span className="text-xs text-slate-400">{i.period}</span></div><div className="text-xs text-[#9f6972]">{i.position||i.role||[i.degree,i.major].filter(Boolean).join(' / ')}</div>{i.description&&<p className="mt-1 whitespace-pre-line">{i.description}</p>}</div></div>)}</div></Section> : null;}
