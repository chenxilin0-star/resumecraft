import type { ResumeData, TemplateTheme } from '@/types';

interface Props {
  data: ResumeData;
  theme: TemplateTheme;
}

const contactItems = (data: ResumeData) => [data.personal.phone, data.personal.email, data.personal.city, data.personal.wechat, data.personal.website].filter(Boolean) as string[];
const clamp = (n: number) => Math.max(8, Math.min(100, n * 20));
const initials = (name: string) => (name || 'RC').slice(0, 2).toUpperCase();
const lines = (text?: string) => (text || '').split(/\n|；|;/).map((s) => s.trim()).filter(Boolean).slice(0, 3);

function Photo({ data, className = '', fallbackClass = '' }: { data: ResumeData; className?: string; fallbackClass?: string }) {
  if (data.personal.photo) return <img src={data.personal.photo} alt={data.personal.name} className={`object-cover ${className}`} />;
  return <div className={`flex items-center justify-center font-bold tracking-widest ${className} ${fallbackClass}`}>{initials(data.personal.name)}</div>;
}

function MiniList({ items, className = '' }: { items: string[]; className?: string }) {
  return <div className={className}>{items.map((item, i) => <div key={i} className="truncate">{item}</div>)}</div>;
}

function SkillBars({ data, color = '#0ea5e9', track = '#e5e7eb' }: { data: ResumeData; color?: string; track?: string }) {
  return <div className="space-y-2">{data.skills.slice(0, 7).map((s) => <div key={s.name}><div className="mb-1 flex justify-between text-[10px]"><span>{s.name}</span><span>{clamp(s.level)}%</span></div><div className="h-1.5 rounded-full" style={{ background: track }}><div className="h-full rounded-full" style={{ width: `${clamp(s.level)}%`, background: color }} /></div></div>)}</div>;
}

function WorkBlocks({ data, accent = '#2563eb', markers = false }: { data: ResumeData; accent?: string; markers?: boolean }) {
  return <div className="space-y-3">{data.workExperience.slice(0, 3).map((w, i) => <div key={`${w.company}-${i}`} className="relative pl-5"><span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full" style={{ background: accent }} /><div className="flex items-baseline justify-between gap-2"><b className="text-[13px]">{w.company}</b><span className="whitespace-nowrap text-[10px] text-gray-500">{w.period}</span></div><div className="text-[11px] font-semibold" style={{ color: accent }}>{w.position}</div>{lines(w.description).map((l) => <p key={l} className="text-[10.5px] leading-4 text-gray-600">{markers ? '• ' : ''}{l}</p>)}</div>)}</div>;
}

function EduProject({ data, accent = '#2563eb' }: { data: ResumeData; accent?: string }) {
  return <>{data.education.slice(0, 2).map((e) => <div key={e.school} className="mb-2"><div className="flex justify-between text-[12px]"><b>{e.school}</b><span className="text-[10px] text-gray-500">{e.period}</span></div><div className="text-[10.5px] text-gray-600">{e.degree} · {e.major}</div></div>)}{data.projects.slice(0, 2).map((p) => <div key={p.name} className="mb-2 border-l-2 pl-2" style={{ borderColor: accent }}><div className="text-[12px] font-bold">{p.name}</div><div className="text-[10px] text-gray-500">{p.role} · {p.period}</div><p className="text-[10.5px] leading-4 text-gray-600">{lines(p.description)[0]}</p></div>)}</>;
}

export default function TemplateCn016({ data, theme }: Props) {
  const fontFamily = theme.font.body;
  return (
    <main className="mx-auto grid min-h-[297mm] w-[210mm] grid-cols-[64mm_1fr] bg-white shadow-sm" style={{ fontFamily }}>
      <aside className="bg-[#e8eef5] p-6"><Photo data={data} className="mx-auto h-32 w-28 rounded object-cover shadow" fallbackClass="bg-slate-300 text-slate-700" /><h1 className="mt-4 text-center text-2xl font-black text-[#27496d]">{data.personal.name}</h1><p className="text-center text-xs text-slate-600">{data.intention?.position}</p><div className="mt-6 rounded bg-white p-3"><MiniList items={contactItems(data)} className="space-y-2 text-[11px] text-slate-600" /></div><h3 className="mt-6 bg-[#27496d] px-3 py-1 text-sm font-bold text-white">SKILLS</h3><SkillBars data={data} color="#27496d" track="#cbd5e1" /></aside>
      <section className="p-8"><div className="mb-8 text-right"><div className="text-3xl font-black tracking-widest text-[#27496d]">PERSONAL</div><div className="text-3xl font-light tracking-widest text-gray-400">RESUME</div></div><div className="mb-6 border-t-4 border-[#27496d] pt-3 text-[11px] leading-5">{data.summary}</div><h2 className="mb-3 text-sm font-black text-[#27496d]">CAREER HISTORY</h2><WorkBlocks data={data} accent="#27496d" /><h2 className="mb-3 mt-6 text-sm font-black text-[#27496d]">QUALIFICATION</h2><EduProject data={data} accent="#64748b" /></section>
    </main>
  );
}
