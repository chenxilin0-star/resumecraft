import { ResumeData, TemplateTheme } from '@/types';

export default function TimelineTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div className="pdf-resume" style={{ '--resume-primary': c.primary, '--resume-secondary': c.secondary, '--resume-text': c.text, '--resume-muted': c.textMuted, '--resume-border': c.border, '--resume-bg': c.background, '--resume-accent': c.accent } as React.CSSProperties}>
      <header className="pb-4 mb-5">
        <h1 className="text-2xl font-bold" style={{ color: c.primary }}>{data.personal.name}</h1>
        {data.intention?.position && <p className="text-sm font-medium mt-1" style={{ color: c.textMuted }}>{data.intention.position}</p>}
        <div className="flex flex-wrap gap-4 text-xs mt-2" style={{ color: c.textMuted }}>
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.city && <span>{data.personal.city}</span>}
        </div>
      </header>

      {data.workExperience?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: c.primary }}>工作经历</h2>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ backgroundColor: c.secondary }} />
            {data.workExperience.map((work, i) => (
              <div key={i} className="relative pl-8 pb-5">
                <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 bg-white" style={{ borderColor: c.secondary }} />
                <div className="inline-block px-2 py-0.5 rounded-full text-xs text-white mb-1" style={{ backgroundColor: c.secondary }}>
                  {work.period}
                </div>
                <div className="text-sm font-medium" style={{ color: c.text }}>{work.company}</div>
                <div className="text-xs mb-1" style={{ color: c.textMuted }}>{work.position}</div>
                <div className="text-sm" style={{ color: c.text }}>{work.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold mb-2" style={{ color: c.primary }}>技能特长</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-md text-xs" style={{ backgroundColor: c.accent, color: c.primary }}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-sm font-semibold mb-2" style={{ color: c.primary }}>教育经历</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{edu.school}</span>
                <span style={{ color: c.textMuted }}>{edu.period}</span>
              </div>
              <div className="text-xs" style={{ color: c.textMuted }}>{edu.degree} · {edu.major}</div>
            </div>
          ))}
        </section>
      )}

      {data.certificates && data.certificates.length > 0 && (
        <section className="resume-section">
          <h2 className="text-sm font-semibold mb-2" style={{ color: c.primary }}>证书与荣誉</h2>
          {data.certificates.map((cert, i) => (
            <div key={i} className="mb-1 text-sm" style={{ color: c.text }}>
              {cert.name} <span style={{ color: c.textMuted }}>({cert.date})</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
