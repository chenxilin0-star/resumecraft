import { ResumeData, TemplateTheme } from '@/types';

export default function ModernTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div className="pdf-resume flex" style={{ '--resume-primary': c.primary, '--resume-secondary': c.secondary, '--resume-text': c.text, '--resume-muted': c.textMuted, '--resume-border': c.border, '--resume-bg': c.background, '--resume-accent': c.accent } as React.CSSProperties}>
      <div className="w-[35%] p-5 text-white" style={{ backgroundColor: c.primary }}>
        <h1 className="text-xl font-bold mb-1">{data.personal.name}</h1>
        {data.intention?.position && <p className="text-sm opacity-90 mb-4">{data.intention.position}</p>}
        <div className="space-y-1 text-xs opacity-80 mb-6">
          {data.personal.phone && <p>{data.personal.phone}</p>}
          {data.personal.email && <p>{data.personal.email}</p>}
          {data.personal.city && <p>{data.personal.city}</p>}
        </div>

        {data.skills?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">技能特长</h3>
            {data.skills.map((skill, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{skill.name}</span>
                </div>
                <div className="h-1 rounded-full bg-white/20">
                  <div className="h-1 rounded-full bg-white/80" style={{ width: `${skill.level * 20}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {data.education?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">教育经历</h3>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-2 text-xs">
                <p className="font-medium">{edu.school}</p>
                <p className="opacity-80">{edu.degree} · {edu.major}</p>
                <p className="opacity-70">{edu.period}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-[65%] p-5" style={{ backgroundColor: c.background }}>
        {data.workExperience?.length > 0 && (
          <section className="resume-section mb-5">
            <h2 className="text-sm font-semibold pb-1 mb-3 border-b" style={{ color: c.primary, borderColor: c.border }}>工作经历</h2>
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
            <h2 className="text-sm font-semibold pb-1 mb-3 border-b" style={{ color: c.primary, borderColor: c.border }}>项目经历</h2>
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

        {data.summary && (
          <section className="resume-section">
            <h2 className="text-sm font-semibold pb-1 mb-3 border-b" style={{ color: c.primary, borderColor: c.border }}>自我评价</h2>
            <p className="text-sm" style={{ color: c.text }}>{data.summary}</p>
          </section>
        )}
      </div>
    </div>
  );
}
