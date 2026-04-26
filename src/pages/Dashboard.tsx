import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Clock,
  Eye,
  Trash2,
  Copy,
  Pencil,
  X,
  Check,
  Search,
  ArrowUpDown,
  Globe,
  Link as LinkIcon,
  CheckCircle,
} from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { resumesApi } from '@/api/resumes';
import { useAuthStore } from '@/stores/authStore';
import type { Resume } from '@/types';

type SortKey = 'updatedAt' | 'createdAt';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('updatedAt');
  const [shareResume, setShareResume] = useState<Resume | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadResumes();
  }, [isAuthenticated, navigate]);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const res = await resumesApi.list();
      setResumes(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await resumesApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await resumesApi.duplicate(id);
      loadResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制失败');
    }
  };

  const handleRename = async (id: number) => {
    try {
      await resumesApi.update(id, { title: renameValue });
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, title: renameValue } : r))
      );
      setRenamingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重命名失败');
    }
  };


  const openShare = async (resume: Resume) => {
    setShareResume(resume);
    setShareUrl('');
    setShareCopied(false);
    if (!resume.isPublic) {
      setShareLoading(true);
      try {
        const res = await resumesApi.share(resume.id, { isPublic: true, regenerateSlug: true });
        setShareUrl(res.data.shareUrl);
        setResumes((prev) =>
          prev.map((r) =>
            r.id === resume.id
              ? { ...r, isPublic: true, publicSlug: res.data.publicSlug }
              : r
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : '开启分享失败');
      } finally {
        setShareLoading(false);
      }
    } else {
      const base = window.location.origin;
      setShareUrl(`${base}/r/${resume.publicSlug}`);
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const filteredResumes = useMemo(() => {
    let list = [...resumes];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sort === 'updatedAt') return (b.updatedAt || 0) - (a.updatedAt || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return list;
  }, [resumes, search, sort]);

  const formatDate = (ts: number) => {
    if (!ts) return '-';
    const d = new Date(ts * 1000);
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的简历</h1>
              <p className="mt-1 text-gray-500">管理你创建的所有简历</p>
            </div>
            <Link to="/templates">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                新建简历
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索简历..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-primary-500"
            >
              <option value="updatedAt">最近更新</option>
              <option value="createdAt">最近创建</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">加载中...</div>
        ) : filteredResumes.length === 0 ? (
          <FadeIn>
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">还没有简历</h3>
              <p className="mt-2 text-gray-500">从模板中心选择一套模板，开始制作你的第一份简历</p>
              <Link to="/templates" className="inline-block mt-6">
                <Button>去选模板</Button>
              </Link>
            </div>
          </FadeIn>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((r) => (
              <Card key={r.id} hover>
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center relative">
                  <FileText className="w-12 h-12 text-gray-300" />
                  {r.isPublic && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500 text-white text-[10px]">
                      <Globe className="w-3 h-3" />
                      公开
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {renamingId === r.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(r.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                      />
                      <button onClick={() => handleRename(r.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setRenamingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3
                      className="font-medium text-gray-900 cursor-pointer hover:text-primary-600"
                      onClick={() => {
                        setRenamingId(r.id);
                        setRenameValue(r.title);
                      }}
                      title="点击重命名"
                    >
                      {r.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(r.updatedAt)}
                    {r.isPublic && (
                      <>
                        <span className="mx-1">·</span>
                        <Eye className="w-3 h-3" />
                        {r.viewCount || 0}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Link to={`/editor/${r.templateId}?resumeId=${r.id}`}>
                      <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500" title="编辑">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
                      title="重命名"
                      onClick={() => {
                        setRenamingId(r.id);
                        setRenameValue(r.title);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
                      title="复制"
                      onClick={() => handleDuplicate(r.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 rounded-md text-gray-500 ${r.isPublic ? 'text-green-600 hover:bg-green-50' : 'hover:bg-gray-100'}`}
                      title={r.isPublic ? '已公开，点击复制链接' : '开启公开分享'}
                      onClick={() => openShare(r)}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500"
                      title="删除"
                      onClick={() => setDeleteId(r.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="确认删除">
        <p className="text-sm text-gray-600 mb-4">删除后无法恢复，确定删除这份简历吗？</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>取消</Button>
          <Button variant="danger" size="sm" onClick={() => deleteId && handleDelete(deleteId)}>删除</Button>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={!!shareResume} onClose={() => setShareResume(null)} title="公开分享">
        <div className="py-2">
          {shareLoading ? (
            <div className="py-6 text-center text-gray-400">开启分享中...</div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                任何人都可以通过以下链接查看这份简历：
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 bg-gray-50"
                />
                <Button size="sm" onClick={copyShareUrl}>
                  {shareCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {shareCopied ? '已复制' : '复制'}
                </Button>
              </div>
              {shareResume?.isPublic && (
                <button
                  className="mt-3 text-xs text-red-500 hover:underline"
                  onClick={async () => {
                    if (!shareResume) return;
                    try {
                      await resumesApi.share(shareResume.id, { isPublic: false });
                      setResumes((prev) =>
                        prev.map((rr) => (rr.id === shareResume.id ? { ...rr, isPublic: false } : rr))
                      );
                      setShareResume(null);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  关闭公开分享
                </button>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
