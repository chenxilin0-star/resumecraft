import { ResumeData, TemplateTheme } from '@/types';

export default function BusinessTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div className="pdf-resume" style={{ '--resume-primary': c.primary, '--resume-secondary': c.secondary, '--resume-text': c.text, '--resume-muted': c.textMuted, '--resume-border': c.border, '--resume-bg': c.background, '--resume-accent': c.accent } as React.CSSProperties}>
      <div className="px-6 py-5 mb-5 rounded-sm" style={{ backgroundColor: c.primary }}>
        <h1 className="text-3xl font-bold text-white">{data.personal.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-white/90 mt-2">
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.city && <span>{data.personal.city}</span>}
        </div>
      </div>

      {data.intention && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-4 rounded-sm" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>求职意向</h2>
          </div>
          <div className="flex flex-wrap gap-6 text-sm pl-3" style={{ color: c.text }}>
            {data.intention.position && <span>期望岗位：{data.intention.position}</span>}
            {data.intention.city && <span>期望城市：{data.intention.city}</span>}
            {data.intention.salary && <span>期望薪资：{data.intention.salary}</span>}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-4 rounded-sm" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>教育经历</h2>
          </div>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2 pl-3">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{edu.school}</span>
                <span style={{ color: c.textMuted }}>{edu.period}</span>
              </div>
              <div className="text-sm" style={{ color: c.textMuted }}>{edu.degree} · {edu.major}</div>
            </div>
          ))}
        </section>
      )}

      {data.workExperience?.length > 0 && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-4 rounded-sm" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>工作经历</h2>
          </div>
          {data.workExperience.map((work, i) => (
            <div key={i} className="mb-3 pl-3">
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

      {data.skills?.length > 0 && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-4 rounded-sm" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>技能特长</h2>
          </div>
          <div className="flex flex-wrap gap-2 pl-3">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-md text-xs" style={{ backgroundColor: c.accent, color: c.primary }}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.summary && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-4 rounded-sm" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>自我评价</h2>
          </div>
          <p className="text-sm pl-3" style={{ color: c.text }}>{data.summary}</p>
        </section>
      )}
    </div>
  );
}
