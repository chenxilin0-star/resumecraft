import type { ResumeData, TemplateTheme } from '@/types';
import { ReactNode } from 'react';

interface Props {
  data: ResumeData;
  theme: TemplateTheme;
  layout: 'two-column-dark' | 'two-column-light' | 'single-business' | 'single-creative' | 'single-minimal' | 'single-fresh' | 'single-tech' | 'single-medical';
  bgSvg?: ReactNode;
  accentPosition?: 'top' | 'left' | 'right' | 'bottom' | 'none';
}

export default function RealTemplateBase({ data, theme, layout, bgSvg, accentPosition = 'none' }: Props) {
  const { colors } = theme;
  const { personal, intention, education, workExperience, projects, skills, certificates, summary, languages } = data;

  const accentBar = accentPosition !== 'none' ? (
    <div
      className={`absolute z-10 ${
        accentPosition === 'top' ? 'top-0 left-0 right-0 h-1.5' :
        accentPosition === 'left' ? 'top-0 left-0 bottom-0 w-1.5' :
        accentPosition === 'right' ? 'top-0 right-0 bottom-0 w-1.5' :
        'bottom-0 left-0 right-0 h-1.5'
      }`}
      style={{ background: colors.primary }}
    />
  ) : null;

  // Photo
  const Photo = ({ size = 'md', shape = 'square' }: { size?: 'sm' | 'md' | 'lg'; shape?: 'square' | 'circle' }) => {
    const sizeMap = { sm: 'w-20 h-24', md: 'w-24 h-28', lg: 'w-28 h-32' };
    if (!personal?.photo) {
      // Placeholder avatar - small and subtle
      return (
        <div className={`${sizeMap[size]} flex items-center justify-center text-white text-lg font-bold`} style={{ background: colors.primary }}>
          {(personal?.name || '?').charAt(0)}
        </div>
      );
    }
    return (
      <img
        src={personal.photo}
        alt={personal.name}
        className={`${sizeMap[size]} object-cover ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
        style={shape === 'square' ? { border: `3px solid ${colors.primary}` } : undefined}
      />
    );
  };

  // Section Header with refined style
  const SectionHeader = ({ title, icon: Icon, line = true }: { title: string; icon?: ReactNode; line?: boolean }) => (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <span className="flex-shrink-0" style={{ color: colors.primary }}>{Icon}</span>}
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: colors.primary }}>{title}</h3>
      {line && <div className="flex-1 h-px ml-1" style={{ background: colors.border }} />}
    </div>
  );

  // Skill bar
  const SkillBar = ({ name, level }: { name: string; level: number }) => (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-0.5" style={{ color: colors.textMuted }}>
        <span>{name}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: colors.border }}>
        <div className="h-full rounded-full" style={{ width: `${(level / 5) * 100}%`, background: colors.primary }} />
      </div>
    </div>
  );

  // Contact item
  const ContactItem = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="text-[10px] leading-relaxed" style={{ color: 'inherit' }}>
        <span className="opacity-60">{label}</span> {value}
      </div>
    );
  };

  // ──────────────────────────────────────────────
  // LAYOUT 1: TWO-COLUMN DARK (elegant sidebar)
  // ──────────────────────────────────────────────
  const TwoColumnDark = () => (
    <div className="relative flex min-h-[297mm]" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      {/* Sidebar */}
      <div className="w-[32%] flex flex-col flex-shrink-0" style={{ background: colors.primary }}>
        <div className="p-5 flex-1 flex flex-col text-white">
          <div className="mb-5 text-center">
            <Photo size="md" shape="circle" />
          </div>
          <div className="mb-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">基本信息</h3>
            <div className="space-y-1 text-[10px]">
              <ContactItem label="电话" value={personal?.phone} />
              <ContactItem label="邮箱" value={personal?.email} />
              <ContactItem label="城市" value={personal?.city} />
              <ContactItem label="微信" value={personal?.wechat} />
            </div>
          </div>
          {skills && skills.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">技能专长</h3>
              {skills.slice(0, 8).map((s, i) => (
                <div key={i} className="mb-1.5">
                  <div className="text-[10px] mb-0.5">{s.name}</div>
                  <div className="h-1 bg-white/20 rounded-full">
                    <div className="h-full rounded-full bg-white/80" style={{ width: `${(s.level / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {languages && languages.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">语言能力</h3>
              {languages.map((l, i) => (
                <div key={i} className="text-[10px]">{l.language} — {l.level}</div>
              ))}
            </div>
          )}
          {certificates && certificates.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">证书</h3>
              {certificates.slice(0, 5).map((c, i) => (
                <div key={i} className="text-[10px] leading-relaxed">• {c.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Main */}
      <div className="w-[68%] p-6">
        <div className="mb-6 pb-4" style={{ borderBottom: `2px solid ${colors.primary}` }}>
          <h1 className="text-3xl font-bold mb-1" style={{ color: colors.text, letterSpacing: '0.05em' }}>{personal?.name || '姓名'}</h1>
          {intention?.position && (
            <p className="text-xs font-medium tracking-wide" style={{ color: colors.primary }}>{intention.position}</p>
          )}
        </div>
        {summary && (
          <div className="mb-5">
            <SectionHeader title="自我评价" line />
            <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>{summary}</p>
          </div>
        )}
        {education && education.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="教育背景" line />
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{edu.school}</span>
                    <span className="text-[10px] ml-2" style={{ color: colors.textMuted }}>{edu.major} · {edu.degree}</span>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: colors.primary }}>{edu.period}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {workExperience && workExperience.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="工作经历" line />
            <div className="space-y-3">
              {workExperience.map((work, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{work.company}</span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{work.period}</span>
                  </div>
                  <div className="text-[10px] mb-1" style={{ color: colors.primary }}>{work.position}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {projects && projects.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="项目经历" line />
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{proj.name}</span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{proj.period}</span>
                  </div>
                  <div className="text-[10px] mb-0.5" style={{ color: colors.primary }}>{proj.role}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{proj.description}</p>
                  {proj.techStack && <div className="text-[10px] mt-0.5" style={{ color: colors.secondary }}>技术栈：{proj.techStack}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // LAYOUT 2: TWO-COLUMN LIGHT (soft sidebar)
  // ──────────────────────────────────────────────
  const TwoColumnLight = () => (
    <div className="relative flex min-h-[297mm]" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      <div className="w-[30%] flex flex-col flex-shrink-0" style={{ background: colors.surface }}>
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-5 text-center">
            <Photo size="md" />
          </div>
          <div className="mb-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>基本信息</h3>
            <div className="space-y-1 text-[10px]" style={{ color: colors.textMuted }}>
              <ContactItem label="电话" value={personal?.phone} />
              <ContactItem label="邮箱" value={personal?.email} />
              <ContactItem label="城市" value={personal?.city} />
            </div>
          </div>
          {skills && skills.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>技能专长</h3>
              {skills.slice(0, 8).map((s, i) => <SkillBar key={i} name={s.name} level={s.level} />)}
            </div>
          )}
          {languages && languages.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>语言能力</h3>
              {languages.map((l, i) => (
                <div key={i} className="text-[10px]" style={{ color: colors.textMuted }}>{l.language} — {l.level}</div>
              ))}
            </div>
          )}
          {certificates && certificates.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>证书</h3>
              {certificates.slice(0, 5).map((c, i) => (
                <div key={i} className="text-[10px]" style={{ color: colors.textMuted }}>• {c.name}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w-[70%] p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>{personal?.name || '姓名'}</h1>
          {intention?.position && <p className="text-xs font-medium tracking-wide" style={{ color: colors.primary }}>{intention.position}</p>}
        </div>
        {summary && (
          <div className="mb-5">
            <SectionHeader title="自我评价" line />
            <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>{summary}</p>
          </div>
        )}
        {education && education.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="教育背景" line />
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{edu.school}</span>
                    <span className="text-[10px] ml-2" style={{ color: colors.textMuted }}>{edu.major} · {edu.degree}</span>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: colors.primary }}>{edu.period}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {workExperience && workExperience.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="工作经历" line />
            <div className="space-y-3">
              {workExperience.map((work, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{work.company}</span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{work.period}</span>
                  </div>
                  <div className="text-[10px] mb-1" style={{ color: colors.primary }}>{work.position}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {projects && projects.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="项目经历" line />
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{proj.name}</span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{proj.period}</span>
                  </div>
                  <div className="text-[10px] mb-0.5" style={{ color: colors.primary }}>{proj.role}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // LAYOUT 3: SINGLE BUSINESS (classic top header)
  // ──────────────────────────────────────────────
  const SingleBusiness = () => (
    <div className="relative min-h-[297mm]" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      {/* Header band */}
      <div className="px-8 pt-8 pb-5" style={{ background: colors.surface }}>
        <div className="flex items-start gap-5">
          <Photo size="sm" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-0.5" style={{ color: colors.text }}>{personal?.name || '姓名'}</h1>
            {intention?.position && (
              <p className="text-[11px] font-medium mb-2 tracking-wide" style={{ color: colors.primary }}>{intention.position}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]" style={{ color: colors.textMuted }}>
              {personal?.phone && <span>{personal.phone}</span>}
              {personal?.email && <span>{personal.email}</span>}
              {personal?.city && <span>{personal.city}</span>}
              {personal?.website && <span>{personal.website}</span>}
            </div>
          </div>
        </div>
      </div>
      {/* Accent line */}
      <div className="h-1" style={{ background: colors.primary }} />

      <div className="px-8 py-5">
        {summary && (
          <div className="mb-5">
            <SectionHeader title="自我评价" line />
            <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>{summary}</p>
          </div>
        )}
        {education && education.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="教育背景" line />
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{edu.school}</span>
                    <span className="text-[10px] ml-2" style={{ color: colors.textMuted }}>{edu.major} · {edu.degree}</span>
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: colors.primary }}>{edu.period}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {workExperience && workExperience.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="工作经历" line />
            <div className="space-y-3">
              {workExperience.map((work, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{work.company}</span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{work.period}</span>
                  </div>
                  <div className="text-[10px] mb-1" style={{ color: colors.primary }}>{work.position}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {projects && projects.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="项目经历" line />
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{proj.name}</span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{proj.period}</span>
                  </div>
                  <div className="text-[10px] mb-0.5" style={{ color: colors.primary }}>{proj.role}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {skills && skills.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="专业技能" line />
            <div className="grid grid-cols-3 gap-x-4">
              {skills.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // LAYOUT 4: SINGLE MINIMAL (ultra clean)
  // ──────────────────────────────────────────────
  const SingleMinimal = () => (
    <div className="relative min-h-[297mm] p-8" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      <div className="mb-6 pb-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <h1 className="text-3xl font-light mb-1" style={{ color: colors.text }}>{personal?.name || '姓名'}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]" style={{ color: colors.textMuted }}>
          {personal?.phone && <span>{personal.phone}</span>}
          {personal?.email && <span>{personal.email}</span>}
          {personal?.city && <span>{personal.city}</span>}
        </div>
      </div>
      {summary && (
        <div className="mb-5">
          <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>{summary}</p>
        </div>
      )}
      {education && education.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="教育背景" line={false} />
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-semibold" style={{ color: colors.text }}>{edu.school}</span>
                  <span className="text-[10px] ml-2" style={{ color: colors.textMuted }}>{edu.major} · {edu.degree}</span>
                </div>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>{edu.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {workExperience && workExperience.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="工作经历" line={false} />
          <div className="space-y-3">
            {workExperience.map((work, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-semibold" style={{ color: colors.text }}>{work.company}</span>
                  <span className="text-[10px]" style={{ color: colors.textMuted }}>{work.period}</span>
                </div>
                <div className="text-[10px] mb-1" style={{ color: colors.primary }}>{work.position}</div>
                <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {projects && projects.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="项目经历" line={false} />
          <div className="space-y-2">
            {projects.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold" style={{ color: colors.text }}>{proj.name}</span>
                  <span className="text-[10px]" style={{ color: colors.textMuted }}>{proj.period}</span>
                </div>
                <div className="text-[10px] mb-0.5" style={{ color: colors.primary }}>{proj.role}</div>
                <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {skills && skills.length > 0 && (
        <div>
          <SectionHeader title="专业技能" line={false} />
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5" style={{ background: colors.surface, color: colors.textMuted, border: `1px solid ${colors.border}` }}>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ──────────────────────────────────────────────
  // LAYOUT 5: SINGLE CREATIVE (asymmetric + bold)
  // ──────────────────────────────────────────────
  const SingleCreative = () => (
    <div className="relative min-h-[297mm]" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      {/* Bold header with background */}
      <div className="px-8 pt-8 pb-6 relative overflow-hidden" style={{ background: colors.surface }}>
        <div className="flex items-end gap-6">
          <Photo size="lg" shape="circle" />
          <div>
            <h1 className="text-4xl font-bold mb-1" style={{ color: colors.text }}>{personal?.name || '姓名'}</h1>
            {intention?.position && <p className="text-sm font-medium tracking-wider" style={{ color: colors.primary }}>{intention.position}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[10px]" style={{ color: colors.textMuted }}>
          {personal?.phone && <span>{personal.phone}</span>}
          {personal?.email && <span>{personal.email}</span>}
          {personal?.city && <span>{personal.city}</span>}
        </div>
      </div>
      <div className="px-8 py-6">
        {summary && (
          <div className="mb-5 p-4" style={{ background: colors.surface, borderLeft: `3px solid ${colors.primary}` }}>
            <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>{summary}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-6">
          <div>
            {education && education.length > 0 && (
              <div className="mb-5">
                <SectionHeader title="教育背景" />
                {education.map((edu, i) => (
                  <div key={i} className="mb-2">
                    <div className="text-xs font-bold" style={{ color: colors.text }}>{edu.school}</div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>{edu.major} · {edu.degree}</div>
                    <div className="text-[10px]" style={{ color: colors.primary }}>{edu.period}</div>
                  </div>
                ))}
              </div>
            )}
            {certificates && certificates.length > 0 && (
              <div className="mb-5">
                <SectionHeader title="证书" />
                {certificates.map((c, i) => (
                  <div key={i} className="text-[10px]" style={{ color: colors.textMuted }}>• {c.name}</div>
                ))}
              </div>
            )}
          </div>
          <div>
            {workExperience && workExperience.length > 0 && (
              <div className="mb-5">
                <SectionHeader title="工作经历" />
                {workExperience.map((work, i) => (
                  <div key={i} className="mb-3">
                    <div className="text-xs font-bold" style={{ color: colors.text }}>{work.company}</div>
                    <div className="text-[10px] mb-0.5" style={{ color: colors.primary }}>{work.position} | {work.period}</div>
                    <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {projects && projects.length > 0 && (
          <div className="mb-5">
            <SectionHeader title="项目经历" />
            <div className="grid grid-cols-2 gap-3">
              {projects.map((proj, i) => (
                <div key={i} className="p-3" style={{ background: colors.surface }}>
                  <div className="text-xs font-bold" style={{ color: colors.text }}>{proj.name}</div>
                  <div className="text-[10px]" style={{ color: colors.primary }}>{proj.role} | {proj.period}</div>
                  <p className="text-[10px] mt-1 leading-relaxed" style={{ color: colors.textMuted }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {skills && skills.length > 0 && (
          <div>
            <SectionHeader title="专业技能" />
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className="px-3 py-1 text-[10px] text-white" style={{ background: colors.primary }}>{s.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // LAYOUT 6: SINGLE FRESH (soft + rounded)
  // ──────────────────────────────────────────────
  const SingleFresh = () => (
    <div className="relative min-h-[297mm] p-8" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      <div className="flex items-center gap-5 mb-6 pb-5" style={{ borderBottom: `2px solid ${colors.primary}` }}>
        <Photo size="md" shape="circle" />
        <div>
          <h1 className="text-2xl font-bold mb-0.5" style={{ color: colors.text }}>{personal?.name || '姓名'}</h1>
          {intention?.position && <p className="text-[11px] font-medium" style={{ color: colors.primary }}>{intention.position}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6 text-[10px]" style={{ color: colors.textMuted }}>
        {personal?.phone && <span>{personal.phone}</span>}
        {personal?.email && <span>{personal.email}</span>}
        {personal?.city && <span>{personal.city}</span>}
      </div>
      {summary && (
        <div className="mb-5 p-4 rounded-lg" style={{ background: colors.surface }}>
          <SectionHeader title="自我评价" />
          <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>{summary}</p>
        </div>
      )}
      {education && education.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="教育背景" />
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: colors.surface }}>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold" style={{ color: colors.text }}>{edu.school}</span>
                  <span className="text-[10px]" style={{ color: colors.primary }}>{edu.period}</span>
                </div>
                <div className="text-[10px]" style={{ color: colors.textMuted }}>{edu.major} · {edu.degree}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {workExperience && workExperience.length > 0 && (
        <div className="mb-5">
          <SectionHeader title="工作经历" />
          <div className="space-y-2">
            {workExperience.map((work, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: colors.surface }}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-bold" style={{ color: colors.text }}>{work.company}</span>
                  <span className="text-[10px]" style={{ color: colors.textMuted }}>{work.period}</span>
                </div>
                <div className="text-[10px] mb-1" style={{ color: colors.primary }}>{work.position}</div>
                <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {skills && skills.length > 0 && (
        <div>
          <SectionHeader title="专业技能" />
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-[10px]" style={{ background: colors.primary, color: '#fff' }}>{s.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ──────────────────────────────────────────────
  // LAYOUT 7: SINGLE TECH (card-based modern)
  // ──────────────────────────────────────────────
  const SingleTech = () => (
    <div className="relative min-h-[297mm] p-6" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      {/* Header */}
      <div className="flex items-center gap-5 mb-6 p-5 rounded-xl" style={{ background: colors.surface }}>
        <Photo size="md" shape="circle" />
        <div>
          <h1 className="text-2xl font-bold mb-0.5" style={{ color: colors.text }}>{personal?.name || '姓名'}</h1>
          {intention?.position && <p className="text-[11px] font-medium" style={{ color: colors.primary }}>{intention.position}</p>}
          <div className="flex gap-3 mt-1.5 text-[10px]" style={{ color: colors.textMuted }}>
            {personal?.email && <span>{personal.email}</span>}
            {personal?.phone && <span>{personal.phone}</span>}
            {personal?.city && <span>{personal.city}</span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-4">
          {skills && skills.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: colors.surface }}>
              <SectionHeader title="技能" />
              {skills.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} />)}
            </div>
          )}
          {education && education.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: colors.surface }}>
              <SectionHeader title="教育" />
              {education.map((edu, i) => (
                <div key={i} className="mb-2">
                  <div className="text-xs font-bold" style={{ color: colors.text }}>{edu.school}</div>
                  <div className="text-[10px]" style={{ color: colors.textMuted }}>{edu.major}</div>
                  <div className="text-[10px]" style={{ color: colors.primary }}>{edu.period}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-2 space-y-4">
          {workExperience && workExperience.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: colors.surface }}>
              <SectionHeader title="工作经历" />
              {workExperience.map((work, i) => (
                <div key={i} className="mb-3 pb-3" style={{ borderBottom: i < workExperience.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{work.company}</span>
                    <span className="text-[10px]" style={{ color: colors.textMuted }}>{work.period}</span>
                  </div>
                  <div className="text-[10px] mb-1" style={{ color: colors.primary }}>{work.position}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
                </div>
              ))}
            </div>
          )}
          {projects && projects.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: colors.surface }}>
              <SectionHeader title="项目" />
              <div className="grid grid-cols-2 gap-3">
                {projects.map((proj, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: colors.background }}>
                    <div className="text-xs font-bold" style={{ color: colors.text }}>{proj.name}</div>
                    <div className="text-[10px]" style={{ color: colors.primary }}>{proj.role}</div>
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: colors.textMuted }}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  // LAYOUT 8: SINGLE MEDICAL (soft professional)
  // ──────────────────────────────────────────────
  const SingleMedical = () => (
    <div className="relative min-h-[297mm] p-8" style={{ background: colors.background }}>
      {bgSvg}
      {accentBar}
      <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl" style={{ background: colors.surface }}>
        <Photo size="lg" shape="circle" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-0.5" style={{ color: colors.text }}>{personal?.name || '姓名'}</h1>
          {intention?.position && <p className="text-[11px] font-medium mb-2" style={{ color: colors.primary }}>{intention.position}</p>}
          <div className="flex flex-wrap gap-2 text-[10px]">
            {personal?.phone && <span className="px-2 py-1 rounded-md" style={{ background: colors.background, color: colors.textMuted }}>{personal.phone}</span>}
            {personal?.email && <span className="px-2 py-1 rounded-md" style={{ background: colors.background, color: colors.textMuted }}>{personal.email}</span>}
            {personal?.city && <span className="px-2 py-1 rounded-md" style={{ background: colors.background, color: colors.textMuted }}>{personal.city}</span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          {education && education.length > 0 && (
            <div className="mb-5">
              <SectionHeader title="教育背景" />
              {education.map((edu, i) => (
                <div key={i} className="mb-2 p-3 rounded-lg" style={{ background: colors.surface }}>
                  <div className="text-xs font-bold" style={{ color: colors.text }}>{edu.school}</div>
                  <div className="text-[10px]" style={{ color: colors.textMuted }}>{edu.major} · {edu.degree}</div>
                  <div className="text-[10px]" style={{ color: colors.primary }}>{edu.period}</div>
                </div>
              ))}
            </div>
          )}
          {certificates && certificates.length > 0 && (
            <div className="mb-5">
              <SectionHeader title="证书资格" />
              {certificates.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] mb-1" style={{ color: colors.textMuted }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.primary }} />
                  {c.name} {c.date && `(${c.date})`}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {workExperience && workExperience.length > 0 && (
            <div className="mb-5">
              <SectionHeader title="工作经历" />
              {workExperience.map((work, i) => (
                <div key={i} className="mb-2 p-3 rounded-lg" style={{ background: colors.surface }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold" style={{ color: colors.text }}>{work.company}</span>
                    <span className="text-[10px]" style={{ color: colors.primary }}>{work.period}</span>
                  </div>
                  <div className="text-[10px] mb-0.5" style={{ color: colors.secondary }}>{work.position}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: colors.textMuted }}>{work.description}</p>
                </div>
              ))}
            </div>
          )}
          {skills && skills.length > 0 && (
            <div>
              <SectionHeader title="专业技能" />
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-[10px]" style={{ background: colors.surface, color: colors.primary, border: `1px solid ${colors.border}` }}>{s.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Route to correct layout
  switch (layout) {
    case 'two-column-dark': return <TwoColumnDark />;
    case 'two-column-light': return <TwoColumnLight />;
    case 'single-business': return <SingleBusiness />;
    case 'single-minimal': return <SingleMinimal />;
    case 'single-creative': return <SingleCreative />;
    case 'single-fresh': return <SingleFresh />;
    case 'single-tech': return <SingleTech />;
    case 'single-medical': return <SingleMedical />;
    default: return <SingleBusiness />;
  }
}
