import { ResumeData, TemplateTheme } from '@/types';

export default function AcademicTemplate({ data, theme }: { data: ResumeData; theme: TemplateTheme }) {
  const c = theme.colors;
  return (
    <div className="pdf-resume" style={{ '--resume-primary': c.primary, '--resume-secondary': c.secondary, '--resume-text': c.text, '--resume-muted': c.textMuted, '--resume-border': c.border, '--resume-bg': c.background, '--resume-accent': c.accent } as React.CSSProperties}>
      <header className="text-center pb-4 mb-5 border-b" style={{ borderColor: c.border }}>
        <h1 className="text-xl font-bold" style={{ color: c.primary }}>{data.personal.name}</h1>
        <div className="flex flex-wrap justify-center gap-3 text-xs mt-2" style={{ color: c.textMuted }}>
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.city && <span>{data.personal.city}</span>}
        </div>
      </header>

      {data.education?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: c.primary, borderColor: c.border }}>教育背景</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm font-medium" style={{ color: c.text }}>
                <span>{edu.school}</span>
                <span style={{ color: c.textMuted }}>{edu.period}</span>
              </div>
              <div className="text-sm" style={{ color: c.textMuted }}>{edu.degree} · {edu.major}</div>
              {edu.description && <div className="text-sm mt-1" style={{ color: c.text }}>{edu.description}</div>}
            </div>
          ))}
        </section>
      )}

      {data.workExperience?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: c.primary, borderColor: c.border }}>研究经历</h2>
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
          <h2 className="text-xs font-semibold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: c.primary, borderColor: c.border }}>发表论文</h2>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2 text-sm" style={{ color: c.text }}>
              <span className="font-medium">[{i + 1}]</span> {proj.name}. {proj.description} ({proj.period})
            </div>
          ))}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="resume-section mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: c.primary, borderColor: c.border }}>语言能力</h2>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: c.text }}>
            {data.skills.map((skill, i) => (
              <span key={i}>{skill.name} {skill.level > 0 && `· ${'★'.repeat(skill.level)}`}</span>
            ))}
          </div>
        </section>
      )}

      {data.summary && (
        <section className="resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-widest pb-1 mb-2 border-b" style={{ color: c.primary, borderColor: c.border }}>自我评价</h2>
          <p className="text-sm" style={{ color: c.text }}>{data.summary}</p>
        </section>
      )}
    </div>
  );
}
