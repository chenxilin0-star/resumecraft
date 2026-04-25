import { ResumeData, TemplateTheme } from '@/types';

export default function FreshTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div className="pdf-resume" style={{ '--resume-primary': c.primary, '--resume-secondary': c.secondary, '--resume-text': c.text, '--resume-muted': c.textMuted, '--resume-border': c.border, '--resume-bg': c.background, '--resume-accent': c.accent } as React.CSSProperties}>
      <header className="pb-4 mb-5">
        <h1 className="text-3xl font-bold" style={{ color: c.primary }}>{data.personal.name}</h1>
        <div className="w-24 h-1 rounded-full mt-2" style={{ background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})` }} />
        <div className="flex flex-wrap gap-4 text-sm mt-3" style={{ color: c.textMuted }}>
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.city && <span>{data.personal.city}</span>}
        </div>
      </header>

      {data.education?.length > 0 && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>教育经历</h2>
          </div>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2 pl-4">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{edu.school}</span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: c.accent, color: c.primary }}>{edu.period}</span>
              </div>
              <div className="text-sm" style={{ color: c.textMuted }}>{edu.degree} · {edu.major}</div>
            </div>
          ))}
        </section>
      )}

      {data.workExperience?.length > 0 && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>工作经历</h2>
          </div>
          {data.workExperience.map((work, i) => (
            <div key={i} className="mb-3 pl-4">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{work.company}</span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: c.accent, color: c.primary }}>{work.period}</span>
              </div>
              <div className="text-sm mb-1" style={{ color: c.textMuted }}>{work.position}</div>
              <div className="text-sm" style={{ color: c.text }}>{work.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.projects?.length > 0 && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>项目经历</h2>
          </div>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3 pl-4">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{proj.name}</span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: c.accent, color: c.primary }}>{proj.period}</span>
              </div>
              <div className="text-sm mb-1" style={{ color: c.textMuted }}>{proj.role}</div>
              <div className="text-sm" style={{ color: c.text }}>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="resume-section mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.primary }} />
            <h2 className="text-sm font-semibold" style={{ color: c.primary }}>技能特长</h2>
          </div>
          <div className="flex flex-wrap gap-2 pl-4">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: c.accent, color: c.primary }}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
