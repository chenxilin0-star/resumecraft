import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, Edit3, Download, Sparkles, Palette, Zap, Shield } from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer';
import { templateRegistry } from '@/templates';
import Badge from '@/components/ui/Badge';

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
    { icon: Layers, title: '选模板', desc: '从 8+ 套精美模板中挑选心仪风格' },
    { icon: Edit3, title: '填内容', desc: '模块化编辑，实时预览效果' },
    { icon: Download, title: '导出来', desc: '一键导出高清 PDF，随时投递' },
  ];

  const features = [
    { icon: Sparkles, title: '专业设计师精心打磨', desc: '每套模板都经过设计师反复推敲' },
    { icon: Palette, title: '实时预览，所见即所得', desc: '编辑与预览同步，零延迟响应' },
    { icon: Zap, title: '一键导出 PDF/Word', desc: '前端生成，样式 100% 一致' },
    { icon: Shield, title: '数据安全，云端同步', desc: '简历数据加密存储，多端同步' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#0F172A] overflow-hidden">
        <HeroCanvas />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
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
            className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto"
          >
            高颜值在线简历制作平台，专业模板 + 实时预览 + 一键导出
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
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
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-300">{t.name[0]}</span>
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
