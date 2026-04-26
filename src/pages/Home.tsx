import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, Edit3, Download, Sparkles, Palette, Zap, Shield } from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer';
import { templateRegistry } from '@/templates';
import Badge from '@/components/ui/Badge';

function ResumePreviewMockup({ accent = '#3B82F6', compact = false }: { accent?: string; compact?: boolean }) {
  return (
    <div className="relative mx-auto aspect-[210/297] w-full max-w-[260px] overflow-hidden rounded-xl bg-white p-5 text-left shadow-2xl ring-1 ring-white/70">
      <div className="absolute inset-x-0 top-0 h-2" style={{ background: accent }} />
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-2xl" style={{ background: `${accent}22` }} />
        <div className="flex-1 pt-1">
          <div className="h-4 w-24 rounded-full" style={{ background: accent }} />
          <div className="mt-2 h-2 w-36 rounded-full bg-slate-200" />
          <div className="mt-1 h-2 w-28 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-[0.8fr_1.2fr] gap-4">
        <div className="space-y-4">
          {['技能', '教育', '证书'].map((title) => (
            <div key={title}>
              <div className="mb-2 h-2.5 w-12 rounded-full" style={{ background: accent }} />
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded bg-slate-200" />
                <div className="h-1.5 w-4/5 rounded bg-slate-100" />
                <div className="h-1.5 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {['工作经历', '项目经历', '自我评价'].slice(0, compact ? 2 : 3).map((title, idx) => (
            <div key={title} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-16 rounded-full" style={{ background: idx === 0 ? accent : '#CBD5E1' }} />
                <div className="h-1.5 w-10 rounded bg-slate-100" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-1.5 w-full rounded bg-slate-200" />
                <div className="h-1.5 w-11/12 rounded bg-slate-100" />
                <div className="h-1.5 w-3/4 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      x: number; y: number; vx: number; vy: number; radius: number;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 149, 237, 0.5)';
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 80 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(100, 149, 237, ${0.2 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10" />;
}

export default function Home() {
  const featured = templateRegistry.slice(0, 5);

  const steps = [
    { icon: Layers, title: '选模板', desc: '从 30+ 套精美模板中挑选心仪风格' },
    { icon: Edit3, title: '填内容', desc: '模块化编辑，实时预览效果' },
    { icon: Download, title: '导出来', desc: '一键导出高清 PDF，随时投递' },
  ];

  const features = [
    { icon: Sparkles, title: '专业设计师精心打磨', desc: '每套模板都经过设计师反复推敲' },
    { icon: Palette, title: '实时预览，所见即所得', desc: '编辑与预览同步，零延迟响应' },
    { icon: Zap, title: '一键导出 PDF', desc: '前端生成，样式 100% 一致' },
    { icon: Shield, title: '数据安全，云端同步', desc: '简历数据加密存储，多端同步' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#0F172A] overflow-hidden">
        <HeroCanvas />
        <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 mx-auto lg:grid-cols-[0.95fr_1.05fr]">
          <div className="text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight"
          >
            让每一份简历，都值得被看见
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0"
          >
            高颜值在线简历制作平台，真实模板预览 + AI 内容优化 + 一键导出 PDF，免费用户也能快速完成第一份专业简历。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-200 lg:justify-start"
          >
            {['30+ 中文模板', '主题实时换色', 'AI 每日免费体验', '云端保存'].map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur">{item}</span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 text-white rounded-md font-medium hover:bg-primary-600 transition-all shadow-glow hover:shadow-lg active:scale-[0.97]"
            >
              开始制作简历
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 px-8 py-3 border border-gray-600 text-gray-300 rounded-md font-medium hover:bg-white/5 transition-all"
            >
              浏览模板
            </Link>
          </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="relative hidden min-h-[560px] items-center justify-center lg:flex"
          >
            <div className="absolute h-72 w-72 rounded-full bg-primary-500/25 blur-3xl" />
            <div className="absolute left-10 top-12 w-52 -rotate-6 scale-90 opacity-90"><ResumePreviewMockup accent="#10B981" compact /></div>
            <div className="absolute right-8 bottom-14 w-52 rotate-6 scale-90 opacity-90"><ResumePreviewMockup accent="#7C3AED" compact /></div>
            <div className="relative w-[330px]"><ResumePreviewMockup accent="#3B82F6" /></div>
            <div className="absolute right-8 top-20 rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-white shadow-xl backdrop-blur">
              <div className="text-xs text-slate-300">实时编辑预览</div>
              <div className="mt-1 text-2xl font-bold">所见即所得</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">精选模板</h2>
              <p className="mt-3 text-gray-500">由专业设计师打造，让 HR 眼前一亮的简历</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {featured.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.1}>
                <Link to={`/editor/${t.id}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 p-3 flex items-center justify-center">
                      <ResumePreviewMockup accent={t.themes[0]?.colors.primary || '#3B82F6'} compact />
                    </div>
                    {t.isPremium && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="vip">VIP</Badge>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-semibold text-sm">{t.name}</h3>
                      <div className="flex gap-2 mt-2">
                        {t.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">三步制作专业简历</h2>
              <p className="mt-3 text-gray-500">简单高效，几分钟即可完成</p>
            </div>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <StaggerItem key={i}>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-500">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">功能特性</h2>
              <p className="mt-3 text-gray-500">为求职者量身打造的强大功能</p>
            </div>
          </FadeIn>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <StaggerItem key={i}>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white">立即创建你的专业简历</h2>
            <p className="mt-4 text-primary-100">免费使用基础模板，开启你的求职之旅</p>
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-white text-primary-700 rounded-md font-semibold hover:bg-gray-100 transition-all shadow-lg active:scale-[0.97]"
            >
              免费开始
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

