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

export default function TemplateCn010({ data, theme }: Props) {
  const fontFamily = theme.font.body;
  return (
    <main className="relative mx-auto min-h-[297mm] w-[210mm] overflow-hidden bg-white p-8 shadow-sm" style={{ fontFamily }}>
      <div className="absolute left-8 top-10 h-24 w-24 rounded-full bg-blue-100" /><div className="absolute left-32 top-20 h-10 w-10 rounded-full bg-yellow-300" /><Photo data={data} className="absolute right-10 top-8 h-28 w-28 rounded-full border-6 border-blue-200 shadow" fallbackClass="bg-blue-100 text-blue-700" />
      <header className="relative z-10 w-2/3"><h1 className="text-4xl font-black text-blue-700">{data.personal.name}</h1><p className="text-yellow-600 font-bold">{data.intention?.position}</p><MiniList items={contactItems(data)} className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-gray-600" /></header>
      <section className="relative z-10 mt-8 rounded-[2rem] border-2 border-blue-100 p-5"><h2 className="text-lg font-black text-blue-600">ABOUT</h2><p className="text-[11px] leading-5">{data.summary}</p></section>
      <div className="relative z-10 mt-5 grid grid-cols-[1fr_58mm] gap-5"><div><h3 className="mb-3 rounded-full bg-blue-500 px-4 py-1 text-white">WORK BUBBLES</h3><WorkBlocks data={data} accent="#3b82f6" markers /><h3 className="mb-2 mt-5 rounded-full bg-yellow-300 px-4 py-1 text-blue-900">EDU & PROJECT</h3><EduProject data={data} accent="#facc15" /></div><aside className="rounded-3xl bg-blue-50 p-4"><SkillBars data={data} color="#facc15" track="#bfdbfe" /></aside></div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 800 150"><path fill="#60a5fa" d="M0 80 C150 140 250 20 400 80 C560 145 650 25 800 80 V150 H0Z"/><path fill="#facc15" opacity=".85" d="M0 110 C180 60 300 150 470 100 C620 55 700 135 800 100 V150 H0Z"/></svg>
    </main>
  );
}
