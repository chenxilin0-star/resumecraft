import type { ResumeData, TemplateTheme } from '@/types';

interface Props { data: ResumeData; theme: TemplateTheme; }

export default function TemplateCn044({ data, theme }: Props) {
  const red = '#d83434';
  return (
    <div className="mx-auto grid min-h-[297mm] w-[210mm] grid-cols-[88px_1fr] bg-white text-[12.5px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <aside className="relative bg-black py-8"><div className="absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 overflow-hidden rounded-full border-4 border-white bg-slate-200">{data.personal.photo ? <img src={data.personal.photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl text-slate-400">{data.personal.name?.[0]}</div>}</div><div className="mt-48 flex flex-col items-center gap-5 text-white/70"><span>☎</span><span>✉</span><span>⌖</span><span>◆</span></div></aside>
      <main className="px-10 py-9">
        <header className="mb-7 border-b-4 pb-5" style={{ borderColor: red }}><h1 className="text-5xl font-black tracking-[0.18em] text-black" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</h1><p className="mt-2 text-lg tracking-[0.28em]" style={{ color: red }}>{data.intention?.position || data.personal.status}</p><div className="mt-3 flex flex-wrap gap-x-5 text-xs text-slate-500"><span>{data.personal.phone}</span><span>{data.personal.email}</span><span>{data.personal.city}</span></div></header>
        {data.summary && <section className="mb-5"><Title icon="●" title="个人简介"/><p className="whitespace-pre-line">{data.summary}</p></section>}
        <Timeline title="工作经历" items={data.workExperience}/>
        <Timeline title="项目经验" items={data.projects}/>
        <Timeline title="教育背景" items={data.education}/>
        <section className="mt-5"><Title icon="■" title="专业技能"/><div className="flex flex-wrap gap-2">{data.skills.map(s=><span key={s.name} className="rounded-sm bg-[#d83434] px-3 py-1 text-xs text-white">{s.name}</span>)}</div></section>
      </main>
    </div>
  );
}
function Title({title,icon}:{title:string;icon:string}){return <h2 className="mb-3 flex items-center gap-3 text-xl font-bold text-black"><span className="text-[#d83434]">{icon}</span>{title}</h2>;}
function Timeline({title,items}:{title:string;items:any[]}){return items?.length ? <section className="mb-5"><Title icon="◆" title={title}/><div className="space-y-3 border-l-2 border-[#d83434] pl-5">{items.map((i,idx)=><div key={idx} className="relative"><span className="absolute -left-[29px] top-1 h-4 w-4 rounded-full border-2 border-white bg-[#d83434]"/><div className="flex justify-between font-bold text-slate-900"><span>{i.company||i.name||i.school}</span><span className="text-xs text-slate-500">{i.period}</span></div><div className="text-xs font-semibold text-[#d83434]">{i.position||i.role||[i.degree,i.major].filter(Boolean).join(' / ')}</div>{i.description&&<p className="mt-1 whitespace-pre-line">{i.description}</p>}</div>)}</div></section> : null;}
