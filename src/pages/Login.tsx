import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Placeholder: real auth integration in later phase
    setTimeout(() => {
      setLoading(false);
      setError('阶段一仅展示界面，登录功能待接入后端');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <FadeIn className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {mode === 'login' ? '登录以继续管理你的简历' : '注册开始使用 ResumeCraft'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="昵称"
                placeholder="请输入昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            )}
            <Input
              label="邮箱"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="密码"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" className="w-full" isLoading={loading}>
              {mode === 'login' ? '登录' : '注册'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <p className="text-gray-500">
                还没有账号？{' '}
                <button onClick={() => { setMode('register'); setError(''); }} className="text-primary-600 font-medium hover:underline">
                  立即注册
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                已有账号？{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-primary-600 font-medium hover:underline">
                  立即登录
                </button>
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
              返回首页
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
