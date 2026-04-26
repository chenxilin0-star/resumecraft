import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, Sparkles, Crown } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import type { ResumeData } from '@/types';

// Lazy import parsers to avoid bundling if modal never opened
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  // @ts-ignore pdfjs-dist types
  pdfjs.GlobalWorkerOptions.workerSrc = '';
  const arrayBuffer = await file.arrayBuffer();
  // @ts-ignore getDocument types
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // @ts-ignore items type
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text.trim();
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return extractTextFromPDF(file);
  if (name.endsWith('.docx')) return extractTextFromDOCX(file);
  if (name.endsWith('.doc') || name.endsWith('.txt')) {
    return file.text();
  }
  throw new Error('不支持的文件格式，请上传 PDF 或 Word (.docx)');
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (data: ResumeData) => void;
}

export default function ResumeImportModal({ isOpen, onClose, onParsed }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [step, setStep] = useState<'upload' | 'preview' | 'parsing' | 'done'>('upload');
  const [error, setError] = useState('');

  const isVip = user?.isVip ?? false;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleFile = async (f: File) => {
    setError('');
    setFile(f);
    try {
      const extracted = await extractText(f);
      if (extracted.length < 50) {
        setError('提取的文本过少，请确认文件内容可读');
        return;
      }
      setText(extracted);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
    }
  };

  const handleParse = async () => {
    if (!text) return;
    setStep('parsing');
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/ai/parse-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '解析失败');
      }
      onParsed(data.data as ResumeData);
      setStep('done');
      setTimeout(() => {
        onClose();
        setStep('upload');
        setFile(null);
        setText('');
      }, 800);
    } catch (err) {
      setStep('preview');
      setError(err instanceof Error ? err.message : '解析失败');
    }
  };

  const handleClose = () => {
    onClose();
    setStep('upload');
    setFile(null);
    setText('');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="导入简历">
      <div className="w-[520px] max-w-full">
        {/* VIP badge */}
        <div className="flex items-center gap-1.5 mb-4">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">会员专属功能</span>
        </div>

        {!isAuthenticated && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            请先登录后使用导入功能
          </div>
        )}

        {step === 'upload' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">拖拽简历文件到此处</p>
            <p className="text-xs text-gray-400 mt-1">支持 PDF、Word (.docx)</p>
            <label className="mt-4 inline-block">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <span className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer">
                或点击选择文件
              </span>
            </label>
          </div>
        )}

        {step === 'preview' && file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-primary-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">文本长度: {text.length} 字</p>
              </div>
              <button onClick={() => { setFile(null); setText(''); setStep('upload'); }} className="p-1 hover:bg-gray-200 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-xs text-gray-500 whitespace-pre-wrap">{text.slice(0, 600)}{text.length > 600 ? '...' : ''}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setFile(null); setText(''); setStep('upload'); }}>重新上传</Button>
              <Button size="sm" onClick={handleParse} disabled={!isVip}>
                <Sparkles className="w-4 h-4 mr-1" />
                {isVip ? 'AI 解析并填入' : '会员专属'}
              </Button>
            </div>
            {!isVip && (
              <p className="text-xs text-amber-600">开通会员后即可使用 AI 导入功能</p>
            )}
          </div>
        )}

        {step === 'parsing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600">AI 正在解析简历内容...</p>
            <p className="text-xs text-gray-400 mt-1">可能需要 10-20 秒</p>
          </div>
        )}

        {step === 'done' && (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">导入成功</p>
            <p className="text-xs text-gray-500 mt-1">简历内容已填入编辑器</p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-500">{error}</p>
        )}
      </div>
    </Modal>
  );
}
