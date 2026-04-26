import type { ResumeData, TemplateTheme } from '@/types';

interface Props { data: ResumeData; theme: TemplateTheme; }

export default function TemplateCn026({ data, theme }: Props) {
  const orange = '#f0a321';
  return (
    <div className="mx-auto grid min-h-[297mm] w-[210mm] grid-cols-[245px_1fr] bg-white text-[12.5px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <aside className="bg-[#2b2d31] px-7 py-8 text-white">
        <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4" style={{ borderColor: orange }}>{data.personal.photo ? <img src={data.personal.photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[#3a3d42] text-5xl text-white/50">{data.personal.name?.[0]}</div>}</div>
        <h1 className="mt-5 text-center text-3xl font-bold tracking-[0.16em]" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</h1>
        <p className="mt-2 text-center text-sm tracking-[0.24em]" style={{ color: orange }}>{data.intention?.position || data.personal.status}</p>
        <SideTitle>CONTACT</SideTitle>
        <div className="space-y-2 text-xs text-slate-200"><p>☎ {data.personal.phone}</p><p>✉ {data.personal.email}</p><p>⌖ {data.personal.city}</p><p>◆ {data.personal.website || data.personal.wechat}</p></div>
        <SideTitle>SKILLS</SideTitle>
        <div className="space-y-3">{data.skills.map(s => <div key={s.name}><div className="mb-1 flex justify-between text-xs"><span>{s.name}</span><span style={{ color: orange }}>{s.level * 20}%</span></div><div className="h-1.5 bg-white/20"><div className="h-1.5" style={{ width: `${Math.min(100, s.level * 20)}%`, background: orange }} /></div></div>)}</div>
        {data.languages?.length ? <><SideTitle>LANGUAGE</SideTitle>{data.languages.map(l => <p key={l.language} className="text-xs text-slate-200">{l.language} · {l.level}</p>)}</> : null}
      </aside>
      <main className="px-9 py-9">
        <Header title="个人简介" icon="◉" />{data.summary && <p className="mb-5 whitespace-pre-line">{data.summary}</p>}
        <List title="工作经历" icon="▣" items={data.workExperience} />
        <List title="项目经验" icon="◆" items={data.projects} />
        <List title="教育背景" icon="●" items={data.education} />
        {data.certificates?.length ? <List title="证书奖项" icon="★" items={data.certificates} /> : null}
      </main>
    </div>
  );
}
function SideTitle({children}:{children:string}){return <div className="mt-7 mb-3 flex items-center gap-2 text-sm font-bold tracking-[0.25em] text-[#f0a321]"><span className="h-3 w-3 bg-[#f0a321]" />{children}</div>;}
function Header({title,icon}:{title:string;icon:string}){return <h2 className="mb-3 flex items-center gap-3 border-b-2 border-[#f0a321] pb-1 text-xl font-bold text-[#2b2d31]"><span className="text-[#f0a321]">{icon}</span>{title}</h2>;}
function List({title,icon,items}:{title:string;icon:string;items:any[]}){return items?.length ? <section className="mb-5"><Header title={title} icon={icon}/><div className="space-y-3">{items.map((i,idx)=><div key={idx} className="border-l-2 border-[#f0a321] pl-4"><div className="flex justify-between font-bold text-slate-900"><span>{i.company||i.name||i.school}</span><span className="text-xs text-slate-500">{i.period||i.date}</span></div><div className="text-xs font-semibold text-[#f0a321]">{i.position||i.role||[i.degree,i.major].filter(Boolean).join(' / ')}</div>{i.description&&<p className="mt-1 whitespace-pre-line">{i.description}</p>}{i.techStack&&<p className="mt-1 text-xs text-slate-500">技术栈：{i.techStack}</p>}</div>)}</div></section> : null;}
