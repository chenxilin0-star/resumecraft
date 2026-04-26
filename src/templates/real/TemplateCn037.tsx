import type { ResumeData, TemplateTheme } from '@/types';

interface Props { data: ResumeData; theme: TemplateTheme; }

export default function TemplateCn037({ data, theme }: Props) {
  const blue = '#1e88c8';
  const cyan = '#29c1d6';
  return (
    <div className="mx-auto grid min-h-[297mm] w-[210mm] grid-cols-[235px_1fr] bg-white text-[12.5px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <aside className="bg-[#eef1f4] px-6 py-8">
        <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-8 border-white shadow">{data.personal.photo ? <img src={data.personal.photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-slate-200 text-5xl text-slate-400">{data.personal.name?.[0]}</div>}</div>
        <h1 className="mt-5 text-center text-3xl font-bold text-slate-800" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</h1>
        <p className="text-center text-sm" style={{ color: blue }}>{data.intention?.position || data.personal.status}</p>
        <Side title="联系信息"><p>{data.personal.phone}</p><p>{data.personal.email}</p><p>{data.personal.city}</p><p>{data.personal.website}</p></Side>
        <Side title="技能水平">{data.skills.map(s => <div key={s.name} className="mb-3"><div className="mb-1 text-xs font-semibold">{s.name}</div><div className="h-2 bg-white"><div className="h-2" style={{ width: `${Math.min(100, s.level * 20)}%`, background: cyan }} /></div></div>)}</Side>
      </aside>
      <main className="px-8 py-8">
        <Top title="个人简介" color={blue}/>{data.summary && <p className="mb-5 whitespace-pre-line">{data.summary}</p>}
        <List title="工作经历" color={blue} items={data.workExperience}/>
        <List title="项目经验" color={cyan} items={data.projects}/>
        <List title="教育背景" color={blue} items={data.education}/>
        <div className="mt-8 flex gap-5 border-t pt-5 text-center text-xs text-slate-500">
          {['✈','♫','⌘','☕','✎'].map((i,idx)=><div key={idx} className="flex flex-col items-center gap-1"><span className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-white" style={{background: idx%2?cyan:blue}}>{i}</span><span>兴趣</span></div>)}
        </div>
      </main>
    </div>
  );
}
function Side({title,children}:{title:string;children:any}){return <section className="mt-7"><h2 className="mb-3 border-b-2 border-[#1e88c8] pb-1 text-base font-bold tracking-[0.2em] text-slate-800">{title}</h2><div className="text-xs text-slate-600">{children}</div></section>;}
function Top({title,color}:{title:string;color:string}){return <h2 className="mb-3 rounded-r-full px-4 py-2 text-lg font-bold tracking-[0.2em] text-white" style={{background:`linear-gradient(90deg, ${color}, #29c1d6)`}}>{title}</h2>;}
function List({title,color,items}:{title:string;color:string;items:any[]}){return items?.length ? <section className="mb-5"><Top title={title} color={color}/><div className="space-y-3">{items.map((i,idx)=><div key={idx} className="pl-3"><div className="flex justify-between font-bold text-slate-900"><span>{i.company||i.name||i.school}</span><span className="text-xs text-slate-400">{i.period}</span></div><div className="text-xs font-semibold" style={{color}}>{i.position||i.role||[i.degree,i.major].filter(Boolean).join(' / ')}</div>{i.description&&<p className="mt-1 whitespace-pre-line">{i.description}</p>}</div>)}</div></section> : null;}
