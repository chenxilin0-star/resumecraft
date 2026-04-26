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

export default function TemplateCn014({ data, theme }: Props) {
  const fontFamily = theme.font.body;
  return (
    <main className="mx-auto grid min-h-[297mm] w-[210mm] grid-cols-[63mm_1fr] bg-white shadow-sm" style={{ fontFamily }}>
      <aside className="bg-gray-100 p-6"><Photo data={data} className="h-28 w-28 rounded-full border-4 border-white shadow" fallbackClass="bg-green-100 text-green-700" /><h1 className="mt-4 text-3xl font-black text-gray-800">{data.personal.name}</h1><p className="text-green-600">{data.intention?.position}</p><MiniList items={contactItems(data)} className="mt-5 space-y-2 text-[11px] text-gray-600" /><div className="mt-6 space-y-2"><span className="inline-block bg-green-500 px-3 py-1 text-xs font-bold text-white">GREEN</span><span className="ml-2 inline-block bg-blue-500 px-3 py-1 text-xs font-bold text-white">BLUE</span><span className="inline-block bg-orange-400 px-3 py-1 text-xs font-bold text-white">ORANGE</span></div><div className="mt-5"><SkillBars data={data} color="#22c55e" track="#d1d5db" /></div></aside>
      <section className="p-8"><div className="mb-5 rounded-xl bg-gradient-to-r from-green-50 via-blue-50 to-orange-50 p-4 text-[11px] leading-5">{data.summary}</div><h2 className="mb-3 border-b-2 border-green-500 pb-1 font-black text-green-700">WORK EXPERIENCE</h2><WorkBlocks data={data} accent="#22c55e" markers /><h2 className="mb-3 mt-6 border-b-2 border-blue-500 pb-1 font-black text-blue-700">EDUCATION / PROJECT</h2><EduProject data={data} accent="#3b82f6" /></section>
    </main>
  );
}
