import type { ResumeData, TemplateTheme } from '@/types';

interface Props { data: ResumeData; theme: TemplateTheme; }

export default function TemplateCn023({ data, theme }: Props) {
  const blue = '#8fb8d8';
  const ink = theme.colors.primary || '#3f79a8';
  return (
    <div className="mx-auto min-h-[297mm] w-[210mm] bg-[#f8fcff] p-8 text-[12.5px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <div className="relative min-h-[281mm] border-[3px] border-[#b8d6ea] bg-white/80 p-7">
        <svg className="absolute left-2 top-2 h-40 w-48 opacity-30" viewBox="0 0 200 160" fill="none"><path d="M16 96C52 18 106 16 178 31" stroke={ink} strokeWidth="2"/><path d="M56 93c-19-23-10-45 12-53 10 23 2 42-12 53Zm43-25c-3-28 15-43 38-39-1 27-17 39-38 39Zm-47 48c30-6 53 8 70 31-33 5-55-7-70-31Z" fill={blue}/><circle cx="35" cy="42" r="16" fill={ink}/><path d="M24 130c44-32 93-43 153-28" stroke={ink} strokeWidth="1.5" strokeDasharray="4 5"/></svg>
        <header className="relative grid grid-cols-[1fr_132px] gap-6 pb-6">
          <div className="pt-8">
            <div className="text-sm uppercase tracking-[0.45em] text-[#8fb8d8]">Resume</div>
            <h1 className="mt-2 text-4xl font-light tracking-[0.25em] text-slate-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</h1>
            <p className="mt-3 text-base tracking-[0.2em] text-[#4f86ad]">{data.intention?.position || data.personal.status}</p>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-1 text-xs text-slate-500"><span>{data.personal.phone}</span><span>{data.personal.email}</span><span>{data.personal.city}</span><span>{data.personal.website}</span></div>
          </div>
          <div className="rounded-t-full border-[7px] border-[#d7ecf8] bg-[#eef7fc] p-1 shadow-inner">
            <div className="h-40 overflow-hidden rounded-t-full bg-blue-50">{data.personal.photo ? <img src={data.personal.photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl text-[#b8d6ea]">{data.personal.name?.[0]}</div>}</div>
          </div>
        </header>
        <Divider />
        <div className="grid grid-cols-[1fr_210px] gap-8 pt-5">
          <main className="space-y-5">
            <Section title="个人简介" color={ink}>{data.summary}</Section>
            <ListSection title="工作经历" color={ink} items={data.workExperience} />
            <ListSection title="项目经验" color={ink} items={data.projects} />
            <ListSection title="教育背景" color={ink} items={data.education} />
          </main>
          <aside className="space-y-6 bg-[#eef7fc]/80 p-4">
            <h2 className="text-base font-bold tracking-[0.2em] text-[#4f86ad]">技能专长</h2>
            {data.skills.map((skill) => <div key={skill.name}><div className="mb-1 flex justify-between text-xs"><span>{skill.name}</span><span>{skill.level * 20}%</span></div><div className="h-2 rounded-full bg-white"><div className="h-2 rounded-full" style={{ width: `${Math.min(100, skill.level * 20)}%`, background: blue }} /></div></div>)}
            {data.languages?.length ? <div><h2 className="mb-2 text-base font-bold tracking-[0.2em] text-[#4f86ad]">语言</h2>{data.languages.map(l => <p key={l.language} className="text-xs">{l.language} / {l.level}</p>)}</div> : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
function Divider(){return <div className="h-[1px] bg-gradient-to-r from-transparent via-[#9fc8e1] to-transparent"/>;}
function Section({title,color,children}:{title:string;color:string;children?: string}){return children ? <section><h2 className="mb-2 border-b pb-1 text-lg font-semibold" style={{color,borderColor:'#cde3f2'}}>{title}</h2><p className="whitespace-pre-line">{children}</p></section> : null;}
function ListSection({title,color,items}:{title:string;color:string;items:any[]}){return items?.length ? <section><h2 className="mb-2 border-b pb-1 text-lg font-semibold" style={{color,borderColor:'#cde3f2'}}>{title}</h2><div className="space-y-3">{items.map((i,idx)=><div key={idx}><div className="flex justify-between font-semibold text-slate-800"><span>{i.company||i.name||i.school}</span><span className="text-xs text-slate-400">{i.period}</span></div><div className="text-xs text-[#6ea4c8]">{i.position||i.role||[i.degree,i.major].filter(Boolean).join(' / ')}</div>{i.description&&<p className="mt-1 whitespace-pre-line">{i.description}</p>}</div>)}</div></section> : null;}
