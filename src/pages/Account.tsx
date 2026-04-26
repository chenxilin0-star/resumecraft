import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Crown,
  Gift,
  LogOut,
  Loader2,
  FileText,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { ordersApi } from '@/api/orders';
import { api } from '@/api/client';
import type { Order } from '@/types';
import { isValidRedeemCode, formatRedeemCode } from '@/utils/validate';

export default function Account() {
  const navigate = useNavigate();
  const { user, token, logout, setAuth } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemError, setRedeemError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await ordersApi.list();
      setOrders(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleRedeem = async () => {
    setRedeemMsg('');
    setRedeemError('');
    const formatted = formatRedeemCode(redeemCode);
    if (!isValidRedeemCode(formatted)) {
      setRedeemError('兑换码格式不正确，应为 XXXX-XXXX-XXXX');
      return;
    }
    setRedeemLoading(true);
    try {
      const res = await api.post<{ expireAt: number }>('/api/redeem', { code: formatted });
      setRedeemMsg(res.message || '兑换成功');
      setRedeemCode('');
      // Refresh user info
      if (token) {
        const me = await api.get<{ isVip: boolean; vipExpireAt?: number; email: string; nickname?: string; id: number }>('/api/auth/me');
        if (me.data) {
          setAuth(
            {
              id: me.data.id,
              email: me.data.email,
              nickname: me.data.nickname,
              isVip: me.data.isVip,
              vipExpireAt: me.data.vipExpireAt,
            },
            token
          );
        }
      }
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : '兑换失败');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) return null;

  const vipStatusText = user.isVip
    ? user.vipExpireAt
      ? `VIP 会员（到期：${new Date(user.vipExpireAt * 1000).toLocaleDateString('zh-CN')}）`
      : 'VIP 会员'
    : '免费用户';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">账户中心</h1>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <FadeIn>
            <div className="md:col-span-1 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-3">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{user.nickname || user.email}</h2>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                  <Crown className="w-3 h-3" />
                  {vipStatusText}
                </div>
                <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  退出登录
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Redeem */}
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-semibold text-gray-900">兑换码激活</h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入兑换码 XXXX-XXXX-XXXX"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRedeem();
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleRedeem} disabled={redeemLoading}>
                    {redeemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '兑换'}
                  </Button>
                </div>
                {redeemMsg && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {redeemMsg}
                  </div>
                )}
                {redeemError && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {redeemError}
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-400">
                  没有兑换码？前往价格页选择会员方案，或联系客服获取。
                </p>
              </div>
            </FadeIn>

            {/* Orders */}
            <FadeIn delay={0.15}>
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                    <h3 className="text-base font-semibold text-gray-900">我的订单</h3>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/pricing')}>
                    去购买
                  </Button>
                </div>
                {loadingOrders ? (
                  <div className="py-8 text-center text-gray-400">加载中...</div>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">暂无订单</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {o.type === 'monthly' ? '月度会员' : o.type === 'single' ? '单次导出' : o.type}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{o.orderNo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">¥{(o.amount / 100).toFixed(2)}</p>
                          <span
                            className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                              o.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700'
                                : o.status === 'paid'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {o.status === 'pending' ? '待支付' : o.status === 'paid' ? '已支付' : o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
