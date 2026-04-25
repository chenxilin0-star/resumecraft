import { Check, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer';

const plans = [
  {
    name: '基础版',
    price: '免费',
    desc: '适合偶尔制作简历的用户',
    features: ['5 套基础模板', '基础编辑功能', '3 次/月 PDF 导出', '在线预览'],
    cta: '免费使用',
    variant: 'secondary' as const,
    popular: false,
  },
  {
    name: '月度会员',
    price: '¥19.9',
    period: '/月',
    desc: '无限次导出 + 全部高级模板',
    features: ['全部 8+ 套模板', '无限次 PDF 导出', 'AI 智能辅助写作', '简历诊断报告', '无广告体验'],
    cta: '立即订阅',
    variant: 'primary' as const,
    popular: true,
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
  },
];

export default function Pricing() {
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
                <Button variant={plan.variant} className="w-full mt-8">
                  {plan.cta}
                </Button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.3}>
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              阶段一暂不接入真实支付，仅展示界面。后续将支持微信支付。
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
