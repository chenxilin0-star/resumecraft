import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Gift, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer';
import { useAuthStore } from '@/stores/authStore';
import { ordersApi } from '@/api/orders';
import { api } from '@/api/client';
import { isValidRedeemCode, formatRedeemCode } from '@/utils/validate';

const plans = [
  {
    name: '基础版',
    price: '免费',
    desc: '适合偶尔制作简历的用户',
    features: ['5 套基础模板', '基础编辑功能', '3 次/月 PDF 导出', '在线预览'],
    cta: '免费使用',
    variant: 'secondary' as const,
    popular: false,
    type: null,
    amount: 0,
  },
  {
    name: '月度会员',
    price: '¥19.9',
    period: '/月',
    desc: '无限次导出 + 全部高级模板',
    features: ['全部 30+ 套模板', '无限次 PDF 导出', 'AI 智能辅助写作', '简历诊断报告', '无广告体验'],
    cta: '立即订阅',
    variant: 'primary' as const,
    popular: true,
    type: 'monthly' as const,
    amount: 1990,
  },
  {
    name: '单次导出',
    price: '¥5.9',
    period: '/次',
    desc: '临时使用高级模板导出',
    features: ['任选 1 套高级模板', '1 次 PDF 导出', '7 天内可重复导出'],
    cta: '单次购买',
    variant: 'secondary' as const,
    popular: false,
    type: 'single' as const,
    amount: 590,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated, token, setAuth } = useAuthStore();
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [orderLoading, setOrderLoading] = useState<string | null>(null);
  const [orderMsg, setOrderMsg] = useState('');

  const handleRedeem = async () => {
    setRedeemMsg('');
    setRedeemError('');
    const formatted = formatRedeemCode(redeemCode);
    if (!isValidRedeemCode(formatted)) {
      setRedeemError('兑换码格式不正确，应为 XXXX-XXXX-XXXX');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRedeemLoading(true);
    try {
      const res = await api.post<{ expireAt: number }>('/api/redeem', { code: formatted });
      setRedeemMsg(res.message || '兑换成功');
      setRedeemCode('');
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

  const handleCreateOrder = async (plan: typeof plans[number]) => {
    if (!plan.type) {
      navigate('/templates');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setOrderLoading(plan.type);
    setOrderMsg('');
    try {
      const res = await ordersApi.create({ type: plan.type, amount: plan.amount });
      setOrderMsg(`订单 ${res.data.orderNo} 已创建，请联系客服完成支付后激活会员`);
    } catch (err) {
      setOrderMsg(err instanceof Error ? err.message : '创建订单失败');
    } finally {
      setOrderLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">选择适合你的方案</h1>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              基础模板永久免费，会员解锁全部高级功能
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <StaggerItem key={plan.name}>
              <div
                className={`relative bg-white rounded-xl border p-8 shadow-sm transition-all hover:shadow-lg ${
                  plan.popular ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                      <Sparkles className="w-3 h-3" />
                      最受欢迎
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-gray-500">{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.variant}
                  className="w-full mt-8"
                  onClick={() => handleCreateOrder(plan)}
                  disabled={!!orderLoading && orderLoading === plan.type}
                >
                  {orderLoading && orderLoading === plan.type ? <Loader2 className="w-4 h-4 animate-spin" /> : plan.cta}
                </Button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Redeem */}
        <FadeIn delay={0.3}>
          <div className="max-w-md mx-auto mt-12 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
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
          </div>
        </FadeIn>

        {orderMsg && (
          <FadeIn delay={0.1}>
            <div className="max-w-lg mx-auto mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
              {orderMsg}
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.4}>
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              阶段一暂不接入真实支付，仅展示界面与订单闭环。后续将支持微信支付。
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
