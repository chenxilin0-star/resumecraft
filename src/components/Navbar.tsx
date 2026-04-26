import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, FileText, User, LogOut, Settings } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useAuthStore } from '@/stores/authStore';

const navLinks = [
  { to: '/', label: '首页' },
  { to: '/templates', label: '模板中心' },
  { to: '/pricing', label: '价格' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 border-b',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-black/5'
          : 'bg-white/80 backdrop-blur-sm border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">ResumeCraft</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'text-sm font-medium transition-colors relative',
                location.pathname === link.to
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              )}
            >
              {link.label}
              {location.pathname === link.to && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                <User className="w-4 h-4" />
                {user?.nickname || user?.email || '我的简历'}
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600 transition-colors"
                title="账户中心"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                登录
              </Link>
              <Link
                to="/templates"
                className="text-sm font-medium bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors shadow-sm"
              >
                开始制作
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg md:hidden">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium',
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  我的简历
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  账户中心
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
