import { ResumeData, TemplateTheme } from '@/types';

export default function CreativeTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div className="pdf-resume" style={{ '--resume-primary': c.primary, '--resume-secondary': c.secondary, '--resume-text': c.text, '--resume-muted': c.textMuted, '--resume-border': c.border, '--resume-bg': c.background, '--resume-accent': c.accent } as React.CSSProperties}>
      <h1 className="text-4xl font-bold leading-tight mb-2" style={{ color: c.primary }}>{data.personal.name}</h1>
      <div className="flex flex-wrap gap-4 text-xs mb-8" style={{ color: c.textMuted }}>
        {data.personal.phone && <span>{data.personal.phone}</span>}
        {data.personal.email && <span>{data.personal.email}</span>}
        {data.personal.city && <span>{data.personal.city}</span>}
        {data.personal.website && <span>{data.personal.website}</span>}
      </div>

      {data.intention && (
        <section className="resume-section mb-6">
          <h2 className="text-xs font-normal uppercase tracking-[0.2em] mb-2" style={{ color: c.textMuted }}>求职意向</h2>
          <p className="text-sm" style={{ color: c.text }}>{data.intention.position} · {data.intention.city}</p>
        </section>
      )}

      {data.workExperience?.length > 0 && (
        <section className="resume-section mb-6">
          <h2 className="text-xs font-normal uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>工作经历</h2>
          {data.workExperience.map((work, i) => (
            <div key={i} className="mb-4 grid grid-cols-3 gap-2">
              <div className="text-sm font-medium" style={{ color: c.text }}>{work.company}</div>
              <div className="text-sm" style={{ color: c.textMuted }}>{work.position}</div>
              <div className="text-sm text-right" style={{ color: c.textMuted }}>{work.period}</div>
              <div className="col-span-3 text-sm mt-1" style={{ color: c.text }}>{work.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.projects?.length > 0 && (
        <section className="resume-section mb-6">
          <h2 className="text-xs font-normal uppercase tracking-[0.2em] mb-3" style={{ color: c.textMuted }}>项目作品集</h2>
          <div className="grid grid-cols-3 gap-3">
            {data.projects.map((proj, i) => (
              <div key={i} className="border p-2 rounded-sm" style={{ borderColor: c.border }}>
                <p className="text-sm font-semibold" style={{ color: c.primary }}>{proj.name}</p>
                <p className="text-xs mt-1" style={{ color: c.textMuted }}>{proj.description.slice(0, 40)}...</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="resume-section mb-6">
          <h2 className="text-xs font-normal uppercase tracking-[0.2em] mb-2" style={{ color: c.textMuted }}>教育经历</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm" style={{ color: c.text }}>
                <span className="font-medium">{edu.school}</span>
                <span style={{ color: c.textMuted }}>{edu.period}</span>
              </div>
              <div className="text-xs" style={{ color: c.textMuted }}>{edu.degree} · {edu.major}</div>
            </div>
          ))}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="resume-section">
          <h2 className="text-xs font-normal uppercase tracking-[0.2em] mb-2" style={{ color: c.textMuted }}>技能特长</h2>
          <div className="flex flex-wrap gap-3 text-sm" style={{ color: c.text }}>
            {data.skills.map((skill, i) => (
              <span key={i}>{skill.name}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
