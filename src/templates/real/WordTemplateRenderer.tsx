import type { ResumeData, TemplateTheme } from '@/types';

interface Props {
  id: string;
  data: ResumeData;
  theme: TemplateTheme;
}

type Palette = {
  primary: string;
  secondary: string;
  dark: string;
  light: string;
  soft: string;
  accent: string;
};

const palettes: Record<string, Palette> = {
  blue: { primary: '#2563EB', secondary: '#0EA5E9', dark: '#1E3A5F', light: '#EFF6FF', soft: '#DBEAFE', accent: '#F59E0B' },
  teal: { primary: '#0F766E', secondary: '#14B8A6', dark: '#134E4A', light: '#ECFDF5', soft: '#CCFBF1', accent: '#F97316' },
  red: { primary: '#C2410C', secondary: '#EF4444', dark: '#7F1D1D', light: '#FFF1F2', soft: '#FECACA', accent: '#F59E0B' },
  coral: { primary: '#E76F51', secondary: '#F97316', dark: '#7C2D12', light: '#FFF7ED', soft: '#FED7AA', accent: '#2A9D8F' },
  navy: { primary: '#1E40AF', secondary: '#38BDF8', dark: '#111827', light: '#F0F9FF', soft: '#BAE6FD', accent: '#F59E0B' },
  cyan: { primary: '#0891B2', secondary: '#22D3EE', dark: '#164E63', light: '#ECFEFF', soft: '#A5F3FC', accent: '#FACC15' },
  green: { primary: '#16A34A', secondary: '#84CC16', dark: '#14532D', light: '#F0FDF4', soft: '#BBF7D0', accent: '#FB923C' },
  orange: { primary: '#EA580C', secondary: '#F59E0B', dark: '#1F2937', light: '#FFF7ED', soft: '#FED7AA', accent: '#06B6D4' },
  pink: { primary: '#DB2777', secondary: '#F472B6', dark: '#831843', light: '#FDF2F8', soft: '#FBCFE8', accent: '#64748B' },
  mint: { primary: '#2D6A4F', secondary: '#95D5B2', dark: '#1B4332', light: '#F1F8F4', soft: '#D8F3DC', accent: '#D97706' },
  tan: { primary: '#A16207', secondary: '#D6A76A', dark: '#5C4033', light: '#FFFBEB', soft: '#FDE68A', accent: '#2563EB' },
  gray: { primary: '#374151', secondary: '#6B7280', dark: '#111827', light: '#F9FAFB', soft: '#E5E7EB', accent: '#DC2626' },
};

const spec: Record<string, { p: keyof typeof palettes; mode: string; title?: string }> = {
  'cn-002': { p: 'blue', mode: 'clean-tabs', title: '个人简历' },
  'cn-004': { p: 'coral', mode: 'coral-sidebar' },
  'cn-005': { p: 'navy', mode: 'navy-sidebar' },
  'cn-007': { p: 'cyan', mode: 'charcoal-cyan' },
  'cn-008': { p: 'blue', mode: 'playful-nurse' },
  'cn-009': { p: 'blue', mode: 'soft-wave' },
  'cn-010': { p: 'cyan', mode: 'bubble-wave' },
  'cn-012': { p: 'red', mode: 'red-timeline' },
  'cn-014': { p: 'green', mode: 'color-sidebar' },
  'cn-016': { p: 'blue', mode: 'corporate-side' },
  'cn-017': { p: 'green', mode: 'green-minimal' },
  'cn-021': { p: 'navy', mode: 'top-name-block' },
  'cn-023': { p: 'blue', mode: 'pale-frame' },
  'cn-026': { p: 'orange', mode: 'orange-sidebar' },
  'cn-027': { p: 'green', mode: 'clean-tabs', title: '个人简历' },
  'cn-037': { p: 'cyan', mode: 'gray-sidebar-icons' },
  'cn-044': { p: 'red', mode: 'black-red-timeline' },
  'cn-053': { p: 'pink', mode: 'pink-grid' },
  'cn-061': { p: 'cyan', mode: 'dark-header-card' },
  'cn-063': { p: 'gray', mode: 'formal-black' },
  'cn-065': { p: 'mint', mode: 'mint-frame' },
  'cn-069': { p: 'pink', mode: 'coral-boxes' },
  'cn-071': { p: 'navy', mode: 'compact-business' },
  'cn-109': { p: 'blue', mode: 'blue-minimal' },
  'cn-113': { p: 'tan', mode: 'tan-sidebar' },
  'cn-116': { p: 'teal', mode: 'teal-timeline' },
  'cn-118': { p: 'gray', mode: 'outlined-gray' },
  'cn-129': { p: 'teal', mode: 'deep-teal-sidebar' },
  'cn-161': { p: 'teal', mode: 'teal-labels', title: 'PERSONAL RESUME' },
};

function firstName(data: ResumeData) { return (data.personal?.name || '姓名').charAt(0); }
function name(data: ResumeData) { return data.personal?.name || '姓名'; }
function pos(data: ResumeData) { return data.intention?.position || '求职意向'; }

function Avatar({ data, size = 72, circle = true, color }: { data: ResumeData; size?: number; circle?: boolean; color: string }) {
  if (data.personal?.photo) return <img src={data.personal.photo} className="object-cover" style={{ width: size, height: size, borderRadius: circle ? '999px' : 8 }} />;
  return <div className="flex items-center justify-center text-white font-bold" style={{ width: size, height: size, borderRadius: circle ? '999px' : 8, background: color, fontSize: size / 3 }}>{firstName(data)}</div>;
}

function Contact({ data, color = '#666', inline = false }: { data: ResumeData; color?: string; inline?: boolean }) {
  const items = [data.personal?.phone, data.personal?.email, data.personal?.city, data.personal?.website].filter(Boolean);
  if (inline) return <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]" style={{ color }}>{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
  return <div className="space-y-1 text-[10px]" style={{ color }}>{items.map((x, i) => <div key={i}>{x}</div>)}</div>;
}

function SkillBars({ data, p, light = false }: { data: ResumeData; p: Palette; light?: boolean }) {
  return <div className="space-y-1.5">{(data.skills || []).slice(0, 7).map((s, i) => <div key={i}>
    <div className="flex justify-between text-[9px] mb-0.5" style={{ color: light ? 'rgba(255,255,255,.85)' : '#4B5563' }}><span>{s.name}</span></div>
    <div className="h-1 rounded-full overflow-hidden" style={{ background: light ? 'rgba(255,255,255,.22)' : p.soft }}><div className="h-full rounded-full" style={{ width: `${Math.min(100, s.level * 20)}%`, background: light ? '#fff' : p.primary }} /></div>
  </div>)}</div>;
}

function Section({ title, p, children, variant = 'line' }: { title: string; p: Palette; children: React.ReactNode; variant?: 'line' | 'pill' | 'bar' | 'tag' | 'circle' }) {
  if (variant === 'pill') return <section className="mb-3"><div className="inline-block rounded-full px-3 py-1 text-[11px] font-bold text-white mb-2" style={{ background: p.primary }}>{title}</div>{children}</section>;
  if (variant === 'bar') return <section className="mb-3"><div className="px-3 py-1 text-[11px] font-bold text-white mb-2" style={{ background: p.primary }}>{title}</div>{children}</section>;
  if (variant === 'tag') return <section className="mb-3 grid grid-cols-[76px_1fr] gap-3"><div className="text-[11px] font-bold text-white px-2 py-1 h-fit text-center" style={{ background: p.primary, clipPath: 'polygon(0 0,88% 0,100% 50%,88% 100%,0 100%)' }}>{title}</div><div>{children}</div></section>;
  if (variant === 'circle') return <section className="mb-3"><div className="flex items-center gap-2 mb-2"><span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center" style={{ background: p.primary }}>●</span><b className="text-[11px]" style={{ color: p.primary }}>{title}</b><div className="h-px flex-1" style={{ background: p.soft }} /></div>{children}</section>;
  return <section className="mb-3"><div className="flex items-center gap-2 mb-2"><b className="text-[11px] tracking-wider" style={{ color: p.primary }}>{title}</b><div className="h-px flex-1" style={{ background: p.soft }} /></div>{children}</section>;
}

function Edu({ data }: { data: ResumeData }) { return <div className="space-y-1.5">{(data.education || []).slice(0, 2).map((e, i) => <div key={i} className="text-[10px]"><div className="flex justify-between"><b>{e.school}</b><span className="text-gray-500">{e.period}</span></div><div className="text-gray-600">{e.major} · {e.degree}</div></div>)}</div>; }
function Work({ data }: { data: ResumeData }) { return <div className="space-y-2">{(data.workExperience || []).slice(0, 2).map((w, i) => <div key={i} className="text-[10px]"><div className="flex justify-between"><b>{w.company}</b><span className="text-gray-500">{w.period}</span></div><div className="text-gray-700 font-medium">{w.position}</div><p className="text-gray-600 leading-relaxed">{w.description}</p></div>)}</div>; }
function Projects({ data, cols = 1 }: { data: ResumeData; cols?: 1 | 2 }) { return <div className={cols === 2 ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>{(data.projects || []).slice(0, 3).map((pr, i) => <div key={i} className="text-[10px]"><div className="flex justify-between"><b>{pr.name}</b><span className="text-gray-500">{pr.period}</span></div><div className="text-gray-700">{pr.role}</div><p className="text-gray-600 leading-relaxed">{pr.description}</p></div>)}</div>; }
function Summary({ data }: { data: ResumeData }) { return data.summary ? <p className="text-[10px] text-gray-600 leading-relaxed">{data.summary}</p> : null; }

function WaveSvg({ p }: { p: Palette }) { return <svg className="absolute bottom-0 left-0 w-full h-28 pointer-events-none" viewBox="0 0 800 120" preserveAspectRatio="none"><path d="M0 80 Q120 20 250 70 T520 65 T800 35 V120 H0Z" fill={p.soft} opacity=".8"/><path d="M0 95 Q160 45 340 85 T800 70 V120 H0Z" fill={p.primary} opacity=".25"/><circle cx="650" cy="40" r="10" fill={p.accent}/><circle cx="700" cy="58" r="5" fill={p.secondary}/></svg>; }
function Dots({ p }: { p: Palette }) { return <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 800 1120"><circle cx="690" cy="100" r="5" fill={p.accent}/><circle cx="720" cy="135" r="3" fill={p.primary}/><circle cx="640" cy="160" r="4" fill={p.secondary}/><path d="M590 125 C650 70 700 90 735 140" fill="none" stroke={p.primary} strokeWidth="2" strokeDasharray="4 6" opacity=".5"/></svg>; }

function CleanTabs({ data, p, title }: { data: ResumeData; p: Palette; title: string }) {
  return <div className="relative min-h-[297mm] bg-white p-8 overflow-hidden"><Dots p={p}/><div className="flex justify-between items-start mb-5"><div><h1 className="text-3xl font-bold" style={{ color: p.dark }}>{title}</h1><div className="text-[10px] tracking-[0.3em]" style={{ color: p.primary }}>PERSONAL RESUME</div></div><Avatar data={data} size={76} circle={false} color={p.primary}/></div><div className="mb-4"><h2 className="text-2xl font-bold" style={{ color: p.primary }}>{name(data)}</h2><div className="text-xs" style={{ color: p.dark }}>{pos(data)}</div><Contact data={data} inline color="#64748B"/></div><Section title="自我评价" p={p} variant="tag"><Summary data={data}/></Section><Section title="教育背景" p={p} variant="tag"><Edu data={data}/></Section><Section title="工作经历" p={p} variant="tag"><Work data={data}/></Section><Section title="项目经历" p={p} variant="tag"><Projects data={data}/></Section><Section title="专业技能" p={p} variant="tag"><div className="flex flex-wrap gap-1.5">{(data.skills||[]).map((s,i)=><span key={i} className="px-2 py-0.5 text-[10px] text-white" style={{background:p.primary}}>{s.name}</span>)}</div></Section><div className="absolute right-8 bottom-8 text-3xl" style={{ color: p.accent }}>✦</div></div>;
}

function SidebarLayout({ data, p, dark = false, circular = true }: { data: ResumeData; p: Palette; dark?: boolean; circular?: boolean }) {
  const bg = dark ? p.dark : p.light;
  const fg = dark ? '#fff' : p.dark;
  return <div className="relative min-h-[297mm] bg-white flex overflow-hidden"><div className="w-[31%] p-5 flex flex-col" style={{ background: bg, color: fg }}><Avatar data={data} size={86} circle={circular} color={p.primary}/><div className="mt-3 mb-5"><h1 className="text-xl font-bold">{name(data)}</h1><div className="text-[10px] opacity-80">{pos(data)}</div></div><div className="mb-5"><h3 className="text-[10px] font-bold tracking-widest mb-2" style={{ color: dark ? p.secondary : p.primary }}>CONTACT</h3><Contact data={data} color={dark ? 'rgba(255,255,255,.85)' : '#64748B'}/></div><div className="mb-5"><h3 className="text-[10px] font-bold tracking-widest mb-2" style={{ color: dark ? p.secondary : p.primary }}>SKILLS</h3><SkillBars data={data} p={p} light={dark}/></div><div className="grid grid-cols-4 gap-2 mt-auto opacity-80">{['✉','☎','⌘','◎','◆','●','▣','✦'].map(x=><span key={x} className="text-center text-xs">{x}</span>)}</div></div><div className="flex-1 p-6"><div className="h-1 mb-5" style={{ background: p.primary }}/><Section title="自我评价" p={p} variant="circle"><Summary data={data}/></Section><Section title="教育背景" p={p} variant="circle"><Edu data={data}/></Section><Section title="工作经历" p={p} variant="circle"><Work data={data}/></Section><Section title="项目经历" p={p} variant="circle"><Projects data={data}/></Section></div></div>;
}

function Playful({ data, p, kind = 'wave' }: { data: ResumeData; p: Palette; kind?: string }) {
  return <div className="relative min-h-[297mm] overflow-hidden p-7" style={{ background: kind==='mint'?p.light:'#F8FBFF', border: kind==='frame'?`10px solid ${p.soft}`:undefined }}><Dots p={p}/><WaveSvg p={p}/><div className="relative z-10 flex justify-between items-start mb-5"><div><h1 className="text-3xl font-black" style={{ color: p.primary }}>个人简历</h1><div className="w-20 h-1 rounded-full mt-1" style={{ background: p.accent }}/><h2 className="mt-4 text-2xl font-bold" style={{ color: p.dark }}>{name(data)}</h2><p className="text-xs" style={{ color: p.primary }}>{pos(data)}</p><Contact data={data} inline color="#64748B"/></div><div className="relative"><div className="absolute -inset-3 rounded-full opacity-30" style={{ background: p.soft }}/><Avatar data={data} size={92} circle color={p.primary}/></div></div><div className="relative z-10 grid grid-cols-2 gap-3"><div className="space-y-3"><div className="bg-white/90 rounded-2xl p-4 shadow-sm"><Section title="自我评价" p={p} variant="pill"><Summary data={data}/></Section></div><div className="bg-white/90 rounded-2xl p-4 shadow-sm"><Section title="教育背景" p={p} variant="pill"><Edu data={data}/></Section></div><div className="bg-white/90 rounded-2xl p-4 shadow-sm"><Section title="专业技能" p={p} variant="pill"><div className="flex flex-wrap gap-1">{(data.skills||[]).slice(0,6).map((s,i)=><span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{background:p.soft,color:p.dark}}>{s.name}</span>)}</div></Section></div></div><div className="space-y-3"><div className="bg-white/90 rounded-2xl p-4 shadow-sm"><Section title="工作经历" p={p} variant="pill"><Work data={data}/></Section></div><div className="bg-white/90 rounded-2xl p-4 shadow-sm"><Section title="项目经历" p={p} variant="pill"><Projects data={data}/></Section></div></div></div></div>;
}

function Timeline({ data, p, top = false }: { data: ResumeData; p: Palette; top?: boolean }) {
  return <div className="relative min-h-[297mm] bg-white overflow-hidden"><div className="p-7" style={{ background: top ? p.primary : 'white', color: top ? 'white' : p.dark }}><div className="flex justify-between"><div><h1 className="text-3xl font-bold">{name(data)}</h1><p className="text-xs opacity-80">{pos(data)}</p><Contact data={data} inline color={top?'rgba(255,255,255,.85)':'#64748B'}/></div><Avatar data={data} size={78} circle={false} color={top?'#fff':p.primary}/></div></div><div className="p-7"><div className="relative pl-6 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px" style={{ ['--tw-content' as string]: '""' }}><div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: p.primary }}/><TItem p={p} title="自我评价"><Summary data={data}/></TItem><TItem p={p} title="教育背景"><Edu data={data}/></TItem><TItem p={p} title="工作经历"><Work data={data}/></TItem><TItem p={p} title="项目经历"><Projects data={data}/></TItem></div></div><div className="absolute right-0 bottom-0 w-0 h-0 border-l-[70px] border-t-[70px] border-l-transparent" style={{ borderTopColor: p.soft }}/></div>;
}
function TItem({ p, title, children }: { p: Palette; title: string; children: React.ReactNode }) { return <section className="relative mb-4"><span className="absolute -left-[22px] top-0 w-4 h-4 rounded-full border-4 bg-white" style={{ borderColor: p.primary }}/><h3 className="text-[12px] font-bold mb-2" style={{ color: p.primary }}>{title}</h3>{children}</section>; }

function TopBlock({ data, p, formal = false }: { data: ResumeData; p: Palette; formal?: boolean }) {
  return <div className="relative min-h-[297mm] bg-white p-7 overflow-hidden"><div className="flex items-center mb-5" style={{ background: formal ? p.dark : p.primary, color: '#fff' }}><div className="p-5 flex-1"><h1 className="text-3xl font-bold">{name(data)}</h1><p className="text-xs opacity-90 tracking-wider">{pos(data)}</p></div><div className="p-3"><Avatar data={data} size={80} circle={false} color={p.secondary}/></div></div><Contact data={data} inline color="#64748B"/><div className="mt-5"><Section title="自我评价" p={p} variant={formal?'bar':'line'}><Summary data={data}/></Section><Section title="教育背景" p={p} variant={formal?'bar':'circle'}><Edu data={data}/></Section><Section title="工作经历" p={p} variant={formal?'bar':'circle'}><Work data={data}/></Section><Section title="项目经历" p={p} variant={formal?'bar':'circle'}><Projects data={data}/></Section><Section title="专业技能" p={p} variant={formal?'bar':'line'}><SkillBars data={data} p={p}/></Section></div><div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: p.primary }}/></div>;
}

function GridModern({ data, p, pink = false }: { data: ResumeData; p: Palette; pink?: boolean }) {
  return <div className="relative min-h-[297mm] p-7 overflow-hidden" style={{ background: pink ? '#F7F3F5' : p.light }}><div className="absolute right-8 top-10 w-40 h-32 rounded-3xl opacity-50" style={{ background: p.soft }}/><div className="relative z-10 grid grid-cols-[180px_1fr] gap-5"><aside className="space-y-3"><div className="rounded-2xl p-4" style={{ background: '#fff' }}><Avatar data={data} size={90} circle color={p.primary}/><h1 className="text-xl font-bold mt-3" style={{ color: p.dark }}>{name(data)}</h1><p className="text-xs" style={{ color: p.primary }}>{pos(data)}</p></div><div className="rounded-2xl p-4 bg-white"><h3 className="text-[11px] font-bold mb-2" style={{ color: p.primary }}>CONTACT</h3><Contact data={data}/></div><div className="rounded-2xl p-4 bg-white"><h3 className="text-[11px] font-bold mb-2" style={{ color: p.primary }}>SKILLS</h3><SkillBars data={data} p={p}/></div></aside><main className="space-y-3"><div className="rounded-2xl p-4 bg-white"><Section title="自我评价" p={p}><Summary data={data}/></Section></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl p-4 bg-white"><Section title="教育背景" p={p}><Edu data={data}/></Section></div><div className="rounded-2xl p-4 bg-white"><Section title="工作经历" p={p}><Work data={data}/></Section></div></div><div className="rounded-2xl p-4 bg-white"><Section title="项目经历" p={p}><Projects data={data} cols={2}/></Section></div></main></div></div>;
}

function TealLabels({ data, p }: { data: ResumeData; p: Palette }) {
  return <div className="min-h-[297mm] bg-white p-8"><div className="flex justify-between items-start mb-5"><div><div className="text-[10px] tracking-[0.35em]" style={{ color: p.primary }}>PERSONAL RESUME</div><h1 className="text-3xl font-bold" style={{ color: p.dark }}>{name(data)}</h1><p className="text-xs" style={{ color: p.primary }}>{pos(data)}</p></div><Avatar data={data} size={78} circle={false} color={p.primary}/></div><Contact data={data} inline color="#64748B"/><div className="mt-5"><Section title="自我评价" p={p} variant="tag"><Summary data={data}/></Section><Section title="教育背景" p={p} variant="tag"><Edu data={data}/></Section><Section title="工作经历" p={p} variant="tag"><Work data={data}/></Section><Section title="项目经历" p={p} variant="tag"><Projects data={data}/></Section><Section title="专业技能" p={p} variant="tag"><div className="flex flex-wrap gap-2">{(data.skills||[]).map((s,i)=><span key={i} className="text-[10px] px-2 py-0.5" style={{background:p.light,color:p.primary,border:`1px solid ${p.soft}`}}>{s.name}</span>)}</div></Section></div></div>;
}

export default function WordTemplateRenderer({ id, data }: Props) {
  const s = spec[id] || spec['cn-002'];
  const p = palettes[s.p] || palettes.blue;
  switch (s.mode) {
    case 'clean-tabs': return <CleanTabs data={data} p={p} title={s.title || '个人简历'} />;
    case 'coral-sidebar': return <SidebarLayout data={data} p={p} dark={false} circular />;
    case 'navy-sidebar': return <SidebarLayout data={data} p={p} dark circular={false} />;
    case 'charcoal-cyan': return <SidebarLayout data={data} p={{...p,dark:'#20242B'}} dark circular />;
    case 'playful-nurse': return <Playful data={data} p={{...p,primary:'#1687E0',accent:'#B7E33A'}} kind="nurse" />;
    case 'soft-wave': return <Playful data={data} p={p} />;
    case 'bubble-wave': return <Playful data={data} p={{...p,accent:'#FACC15'}} />;
    case 'red-timeline': return <Timeline data={data} p={p} />;
    case 'color-sidebar': return <GridModern data={data} p={p} />;
    case 'corporate-side': return <SidebarLayout data={data} p={p} dark={false} circular={false} />;
    case 'green-minimal': return <SidebarLayout data={data} p={p} dark={false} circular />;
    case 'top-name-block': return <TopBlock data={data} p={p} />;
    case 'pale-frame': return <Playful data={data} p={{...p,light:'#F0F7FF'}} kind="frame" />;
    case 'orange-sidebar': return <SidebarLayout data={data} p={p} dark circular />;
    case 'gray-sidebar-icons': return <SidebarLayout data={data} p={p} dark={false} circular />;
    case 'black-red-timeline': return <div className="flex min-h-[297mm] bg-white"><div className="w-20" style={{background:'#111'}}><div className="mt-8 mx-auto"><Avatar data={data} size={54} circle color={p.primary}/></div></div><div className="flex-1"><Timeline data={data} p={p}/></div></div>;
    case 'pink-grid': return <GridModern data={data} p={p} pink />;
    case 'dark-header-card': return <TopBlock data={data} p={{...p,dark:'#1F2937'}} formal />;
    case 'formal-black': return <TopBlock data={data} p={p} formal />;
    case 'mint-frame': return <Playful data={data} p={p} kind="mint" />;
    case 'coral-boxes': return <GridModern data={data} p={{...p,primary:'#E76F51',soft:'#FAD4CC'}} pink />;
    case 'compact-business': return <TopBlock data={data} p={p} formal />;
    case 'blue-minimal': return <TopBlock data={data} p={p} />;
    case 'tan-sidebar': return <SidebarLayout data={data} p={p} dark={false} circular />;
    case 'teal-timeline': return <Timeline data={data} p={p} top />;
    case 'outlined-gray': return <GridModern data={data} p={p} />;
    case 'deep-teal-sidebar': return <SidebarLayout data={data} p={{...p,dark:'#073B3A'}} dark circular={false} />;
    case 'teal-labels': return <TealLabels data={data} p={p} />;
    default: return <CleanTabs data={data} p={p} title="个人简历" />;
  }
}
