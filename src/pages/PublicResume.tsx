import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { resumesApi } from '@/api/resumes';
import type { Resume, ResumeData } from '@/types';

export default function PublicResume() {
  const { slug } = useParams<{ slug: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [authorName, setAuthorName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    resumesApi
      .getPublic(slug)
      .then((res) => {
        setResume(res.data.resume);
        setAuthorName(res.data.user?.nickname || '');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => setLoading(false));
  }, [slug]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || '简历不存在或尚未公开'}</p>
          <Link to="/" className="inline-block mt-4 text-primary-600 hover:underline text-sm">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <span className="text-sm font-medium text-gray-900">{resume.title}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {resume.viewCount} 次浏览
          </span>
          {authorName && <span className="text-gray-400">by {authorName}</span>}
        </div>
      </header>

      {/* Resume Preview */}
      <div className="p-8 flex justify-center">
        <ResumePreview resume={resume} />
      </div>
    </div>
  );
}

function ResumePreview({ resume }: { resume: Resume }) {
  // Try to find template component. Since templateId is numeric DB id,
  // we need a mapping. For now, we'll use a simple fallback: try to match
  // by checking if any template in registry has a numeric id matching... but registry ids are strings.
  // We'll render a simple structured preview that works for any resume data.
  const data = resume.content as ResumeData;

  return (
    <div
      className="bg-white shadow-xl rounded-sm"
      style={{ width: '210mm', minHeight: '297mm', padding: '24mm' }}
    >
      {/* Personal */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{data.personal?.name || '姓名'}</h1>
        <div className="mt-2 text-sm text-gray-600 space-x-3">
          {data.personal?.phone && <span>{data.personal.phone}</span>}
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.city && <span>{data.personal.city}</span>}
        </div>
      </div>

      {/* Intention */}
      {data.intention && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">求职意向</h2>
          <div className="text-sm text-gray-700 space-x-4">
            {data.intention.position && <span>岗位：{data.intention.position}</span>}
            {data.intention.city && <span>城市：{data.intention.city}</span>}
            {data.intention.salary && <span>薪资：{data.intention.salary}</span>}
          </div>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">自我评价</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Education */}
      {data.education?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">教育经历</h2>
          <div className="space-y-2">
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">{edu.school}</span>
                  <span className="text-gray-500 ml-2">{edu.major} · {edu.degree}</span>
                </div>
                <span className="text-gray-500">{edu.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work */}
      {data.workExperience?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">工作经历</h2>
          <div className="space-y-3">
            {data.workExperience.map((w, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{w.company} · {w.position}</span>
                  <span className="text-gray-500">{w.period}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{w.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">项目经历</h2>
          <div className="space-y-3">
            {data.projects.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{p.name} · {p.role}</span>
                  <span className="text-gray-500">{p.period}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{p.description}</p>
                {p.techStack && <p className="text-xs text-gray-500 mt-1">技术栈：{p.techStack}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">技能特长</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                {s.name} {s.level ? `· Lv.${s.level}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {(data.certificates?.length ?? 0) > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">证书奖项</h2>
          <div className="space-y-1">
            {data.certificates?.map((c, i) => (
              <div key={i} className="text-sm text-gray-700">
                {c.name} {c.date && <span className="text-gray-500">({c.date})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {(data.languages?.length ?? 0) > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">语言能力</h2>
          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
            {data.languages?.map((l, i) => (
              <span key={i}>{l.language} · {l.level}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
