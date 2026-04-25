import { ResumeData, TemplateTheme } from '@/types';

export default function MinimalTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div
      className="pdf-resume"
      style={{
        '--resume-primary': c.primary,
        '--resume-secondary': c.secondary,
        '--resume-text': c.text,
        '--resume-muted': c.textMuted,
        '--resume-border': c.border,
        '--resume-bg': c.background,
      } as React.CSSProperties}
    >
      <header className="border-b-2 pb-4 mb-5" style={{ borderColor: c.primary }}>
        <h1 className="text-2xl font-bold" style={{ color: c.primary }}>{data.personal.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm mt-2" style={{ color: c.textMuted }}>
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.city && <span>{data.personal.city}</span>}
        </div>
      </header>

      {data.intention && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: c.primary }}>
            求职意向
            <span className="block w-8 h-0.5 mt-1.5" style={{ backgroundColor: c.primary }} />
          </h2>
          <div className="flex flex-wrap gap-6 text-sm" style={{ color: c.text }}>
            {data.intention.position && <span>期望岗位：{data.intention.position}</span>}
            {data.intention.city && <span>期望城市：{data.intention.city}</span>}
            {data.intention.salary && <span>期望薪资：{data.intention.salary}</span>}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: c.primary }}>
            教育经历
            <span className="block w-8 h-0.5 mt-1.5" style={{ backgroundColor: c.primary }} />
          </h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{edu.school}</span>
                <span style={{ color: c.textMuted }}>{edu.period}</span>
              </div>
              <div className="text-sm" style={{ color: c.textMuted }}>
                {edu.degree} · {edu.major}
              </div>
            </div>
          ))}
        </section>
      )}

      {data.workExperience?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: c.primary }}>
            工作经历
            <span className="block w-8 h-0.5 mt-1.5" style={{ backgroundColor: c.primary }} />
          </h2>
          {data.workExperience.map((work, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{work.company}</span>
                <span style={{ color: c.textMuted }}>{work.period}</span>
              </div>
              <div className="text-sm mb-1" style={{ color: c.textMuted }}>{work.position}</div>
              <div className="text-sm" style={{ color: c.text }}>{work.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.projects?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: c.primary }}>
            项目经历
            <span className="block w-8 h-0.5 mt-1.5" style={{ backgroundColor: c.primary }} />
          </h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{proj.name}</span>
                <span style={{ color: c.textMuted }}>{proj.period}</span>
              </div>
              <div className="text-sm mb-1" style={{ color: c.textMuted }}>{proj.role}</div>
              <div className="text-sm" style={{ color: c.text }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: c.primary }}>
            技能特长
            <span className="block w-8 h-0.5 mt-1.5" style={{ backgroundColor: c.primary }} />
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: c.primary + '15', color: c.primary }}
              >
                {skill.name}
                {skill.level > 0 && ` · ${'★'.repeat(skill.level)}`}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.summary && (
        <section className="resume-section">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: c.primary }}>
            自我评价
            <span className="block w-8 h-0.5 mt-1.5" style={{ backgroundColor: c.primary }} />
          </h2>
          <p className="text-sm" style={{ color: c.text }}>{data.summary}</p>
        </section>
      )}
    </div>
  );
}
