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

export default function TemplateCn009({ data, theme }: Props) {
  const fontFamily = theme.font.body;
  return (
    <main className="relative mx-auto min-h-[297mm] w-[210mm] overflow-hidden bg-[#eaf6ff] p-8 text-gray-700 shadow-sm" style={{ fontFamily }}>
      <div className="relative z-10"><Photo data={data} className="absolute right-0 top-0 h-32 w-32 rounded-full border-8 border-white shadow" fallbackClass="bg-sky-100 text-sky-700" /><h1 className="w-2/3 text-5xl font-black text-sky-800">{data.personal.name}</h1><p className="mt-2 text-lg text-sky-600">{data.intention?.position}</p><MiniList items={contactItems(data)} className="mt-4 grid w-2/3 grid-cols-2 gap-2 text-[11px]" /></div>
      <div className="relative z-10 mt-7 grid grid-cols-[1fr_70mm] gap-5"><section className="space-y-4"><div className="rounded-2xl bg-white p-4 shadow-sm"><h2 className="font-black text-sky-700">SUMMARY</h2><p className="text-[11px] leading-5">{data.summary}</p></div><div className="rounded-2xl bg-white p-4 shadow-sm"><h2 className="mb-3 font-black text-sky-700">EXPERIENCE</h2><WorkBlocks data={data} accent="#38bdf8" /></div></section><aside className="space-y-4"><div className="rounded-2xl bg-white p-4 shadow-sm"><SkillBars data={data} color="#38bdf8" /></div><div className="rounded-2xl bg-white p-4 shadow-sm"><EduProject data={data} accent="#38bdf8" /></div></aside></div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 800 160"><path fill="#7dd3fc" d="M0 95 C120 30 220 130 340 70 C480 0 600 120 800 45 V160 H0Z"/><path fill="#0ea5e9" opacity=".45" d="M0 125 L130 55 L240 130 L350 75 L500 140 L650 60 L800 135 V160 H0Z"/></svg><div className="absolute left-[54%] top-36 h-3 w-3 rounded-full bg-sky-400" /><div className="absolute left-[60%] top-44 h-2 w-2 rounded-full bg-sky-300" />
    </main>
  );
}
