import { ResumeData, TemplateTheme } from '@/types';

export default function InternetTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div className="pdf-resume" style={{ '--resume-primary': c.primary, '--resume-secondary': c.secondary, '--resume-text': c.text, '--resume-muted': c.textMuted, '--resume-border': c.border, '--resume-bg': c.background, '--resume-accent': c.accent } as React.CSSProperties}>
      <header className="flex items-center gap-4 pb-4 mb-5 border-b" style={{ borderColor: c.border }}>
        <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
          {data.personal.name?.[0] || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: c.primary }}>{data.personal.name}</h1>
          {data.intention?.position && <p className="text-sm" style={{ color: c.textMuted }}>{data.intention.position}</p>}
          <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: c.textMuted }}>
            {data.personal.phone && <span>{data.personal.phone}</span>}
            {data.personal.email && <span>{data.personal.email}</span>}
            {data.personal.city && <span>{data.personal.city}</span>}
          </div>
        </div>
      </header>

      {data.skills?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold mb-2" style={{ color: c.primary }}>技能栈</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: c.accent, color: c.primary }}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.workExperience?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: c.primary }}>工作经历</h2>
          {data.workExperience.map((work, i) => (
            <div key={i} className="mb-4 p-3 rounded-lg border" style={{ borderColor: c.border }}>
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
          <h2 className="text-sm font-semibold mb-3" style={{ color: c.primary }}>项目经历</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-4 p-3 rounded-lg border" style={{ borderColor: c.border }}>
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{proj.name}</span>
                <span style={{ color: c.textMuted }}>{proj.period}</span>
              </div>
              <div className="text-sm mb-1" style={{ color: c.textMuted }}>{proj.role}</div>
              <div className="text-sm" style={{ color: c.text }}>{proj.description}</div>
              {proj.techStack && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.techStack.split(',').map((t, j) => (
                    <span key={j} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: c.accent, color: c.primary }}>{t.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="resume-section">
          <h2 className="text-sm font-semibold mb-2" style={{ color: c.primary }}>教育经历</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{edu.school}</span>
                <span style={{ color: c.textMuted }}>{edu.period}</span>
              </div>
              <div className="text-sm" style={{ color: c.textMuted }}>{edu.degree} · {edu.major}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
