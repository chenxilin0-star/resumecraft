import type { ResumeData, TemplateTheme } from '@/types';

interface Props {
  data: ResumeData;
  theme: TemplateTheme;
}

export default function TemplateCn021({ data, theme }: Props) {
  const blue = theme.colors.primary || '#1f5f9f';
  const dark = '#163c68';
  const sections = [
    { tag: 'PROFILE', title: '个人优势', body: data.summary },
    { tag: 'WORK', title: '工作经历', body: data.workExperience },
    { tag: 'PROJECT', title: '项目经验', body: data.projects },
    { tag: 'EDU', title: '教育背景', body: data.education },
  ];

  return (
    <div className="mx-auto min-h-[297mm] w-[210mm] bg-white p-10 text-[13px] leading-relaxed text-slate-700 shadow-sm" style={{ fontFamily: theme.font.body }}>
      <div className="mb-8 grid grid-cols-[128px_1fr] items-stretch gap-5">
        <div className="relative h-40 overflow-hidden border-[6px] border-blue-100 bg-slate-100">
          {data.personal.photo ? <img src={data.personal.photo} alt={data.personal.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl font-bold text-blue-200">{data.personal.name?.slice(0, 1)}</div>}
        </div>
        <div className="flex flex-col justify-center px-8 text-white" style={{ background: dark }}>
          <div className="text-4xl font-bold tracking-[0.18em]" style={{ fontFamily: theme.font.heading }}>{data.personal.name}</div>
          <div className="mt-3 h-[2px] w-24 bg-white/70" />
          <div className="mt-3 text-lg tracking-[0.32em] text-blue-100">{data.intention?.position || data.personal.status || '求职意向'}</div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-blue-50">
            <span>{data.personal.phone}</span><span>{data.personal.email}</span><span>{data.personal.city}</span><span>{data.personal.website}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => section.body && (
          <section key={section.tag} className="grid grid-cols-[92px_1fr] gap-5">
            <div className="pt-1">
              <div className="rounded-r-full px-3 py-1 text-right text-xs font-bold tracking-widest text-white" style={{ background: blue }}>{section.tag}</div>
            </div>
            <div>
              <h2 className="mb-3 border-b pb-1 text-xl font-bold" style={{ color: dark, borderColor: blue, fontFamily: theme.font.heading }}>{section.title}</h2>
              {typeof section.body === 'string' ? <p>{section.body}</p> : <div className="space-y-3">{(section.body as any[]).map((item: any, idx: number) => <Item key={idx} item={item} />)}</div>}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-7 grid grid-cols-[92px_1fr] gap-5">
        <div className="rounded-r-full px-3 py-1 text-right text-xs font-bold tracking-widest text-white" style={{ background: blue }}>SKILLS</div>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => <span key={skill.name} className="border px-3 py-1 text-xs" style={{ borderColor: blue, color: dark }}>{skill.name}</span>)}
        </div>
      </section>
      <div className="mt-10 h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${dark}, ${blue}, transparent)` }} />
    </div>
  );
}

function Item({ item }: { item: any }) {
  return <div><div className="flex justify-between gap-4 font-semibold text-slate-900"><span>{item.company || item.name || item.school}</span><span className="text-xs text-slate-500">{item.period}</span></div><div className="text-xs font-medium text-slate-500">{item.position || item.role || [item.degree, item.major].filter(Boolean).join(' / ')}</div>{item.description && <p className="mt-1 whitespace-pre-line">{item.description}</p>}</div>;
}
