import { useState, useMemo, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { templateRegistry, templateComponents } from '@/templates';
import { TemplateConfig, ResumeData } from '@/types';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';

const styles = ['极简', '商务', '双栏', '清新', '创意', '时间线', '深色'];
const styleAliases: Record<string, string[]> = {
  极简: ['极简', '简约', 'minimal'],
  商务: ['商务', 'business'],
  双栏: ['双栏', '分栏', 'two-column', 'modern'],
  清新: ['清新', 'fresh'],
  创意: ['创意', 'creative'],
  时间线: ['时间线', '时间轴', 'timeline'],
  深色: ['深色', '黑色', 'dark'],
};
const industries = ['技术', '设计', '市场', '财务', '医护', '管理', '外贸', '教育', '应届', '通用'];
const colors = [
  { name: '蓝色', value: '#3B82F6' },
  { name: '绿色', value: '#10B981' },
  { name: '红色', value: '#EF4444' },
  { name: '黑色', value: '#111827' },
  { name: '紫色', value: '#8B5CF6' },
  { name: '橙色', value: '#F97316' },
];

const demoLibrary: Record<string, ResumeData> = {
  tech: {
    personal: { name: '林澈', phone: '13800138000', email: 'linche@example.com', city: '深圳', website: 'github.com/linche' },
    intention: { position: '高级前端工程师', city: '深圳', salary: '30-45K', availableTime: '随时到岗' },
    education: [{ school: '华南理工大学', degree: '本科', major: '软件工程', period: '2017.09 - 2021.06' }],
    workExperience: [
      { company: '某互联网科技公司', position: '高级前端工程师', period: '2021.07 - 至今', description: '主导设计中后台组件体系，沉淀40+通用组件；优化首屏加载链路，核心页面性能提升35%。' },
      { company: '某云服务平台', position: '前端开发工程师', period: '2020.06 - 2021.06', description: '负责监控大屏与权限系统开发，落地可视化图表与低代码配置能力。' },
    ],
    projects: [
      { name: '企业级数据看板', role: '核心开发', period: '2022.03 - 2023.01', description: '搭建可配置报表系统，支持20+业务线复用，报表交付周期缩短50%。', techStack: 'React, TypeScript, ECharts' },
      { name: '移动端商城小程序', role: '前端负责人', period: '2021.08 - 2022.02', description: '完成商品、订单、支付链路开发，活动期间稳定支撑10万级访问。', techStack: 'Taro, React' },
    ],
    skills: [{ name: 'React', level: 5 }, { name: 'TypeScript', level: 5 }, { name: 'Node.js', level: 4 }, { name: '性能优化', level: 4 }, { name: '工程化', level: 5 }],
    certificates: [{ name: '软件设计师', date: '2023' }],
    languages: [{ language: '英语', level: 'CET-6' }],
    summary: '5年前端开发经验，熟悉React与工程化体系。擅长复杂业务拆解、组件体系建设与性能优化，能够推动跨团队协作并交付稳定产品。',
  },
  design: {
    personal: { name: '沈一诺', phone: '13900001111', email: 'yinuo.design@example.com', city: '上海', website: 'portfolio.cn/yinuo' },
    intention: { position: '视觉设计师', city: '上海', salary: '18-28K', availableTime: '两周内' },
    education: [{ school: '中国美术学院', degree: '本科', major: '视觉传达设计', period: '2018.09 - 2022.06' }],
    workExperience: [
      { company: '某品牌设计工作室', position: '视觉设计师', period: '2022.07 - 至今', description: '负责品牌视觉体系、活动主视觉与线上物料设计，累计支持30+商业项目落地。' },
      { company: '某互联网公司', position: 'UI设计实习生', period: '2021.06 - 2022.03', description: '参与移动端界面改版与设计规范整理，提升组件复用一致性。' },
    ],
    projects: [
      { name: '新消费品牌视觉升级', role: '主设计师', period: '2023.04 - 2023.08', description: '完成LOGO延展、包装、社媒与线下物料体系，品牌曝光提升40%。' },
      { name: '设计系统搭建', role: '视觉规范负责人', period: '2022.10 - 2023.02', description: '整理色彩、字体、图标与组件规范，提高多端设计协作效率。' },
    ],
    skills: [{ name: '品牌设计', level: 5 }, { name: 'Figma', level: 5 }, { name: 'Illustrator', level: 5 }, { name: '动效', level: 3 }, { name: '排版', level: 5 }],
    certificates: [{ name: 'Adobe Certified Professional', date: '2022' }],
    languages: [{ language: '英语', level: 'CET-4' }],
    summary: '视觉传达专业背景，擅长品牌视觉、活动主视觉与设计系统建设。具备从概念提案到落地交付的完整经验，关注商业目标与审美表达的统一。',
  },
  marketing: {
    personal: { name: '周雨桐', phone: '13700002222', email: 'marketing@example.com', city: '杭州' },
    intention: { position: '市场营销经理', city: '杭州', salary: '20-35K', availableTime: '一个月内' },
    education: [{ school: '浙江大学', degree: '本科', major: '市场营销', period: '2016.09 - 2020.06' }],
    workExperience: [
      { company: '某消费品集团', position: '市场营销经理', period: '2021.03 - 至今', description: '统筹新品上市营销方案，整合小红书、抖音与私域渠道，单季销售额提升28%。' },
      { company: '某广告传媒公司', position: '策划专员', period: '2020.07 - 2021.02', description: '参与品牌传播与活动策划，负责竞品分析、方案撰写和执行复盘。' },
    ],
    projects: [{ name: '新品上市整合营销', role: '项目负责人', period: '2023.03 - 2023.06', description: '策划KOL种草、直播转化与社群裂变组合打法，新增私域用户3.2万人。' }],
    skills: [{ name: '品牌策划', level: 5 }, { name: '内容营销', level: 5 }, { name: '数据分析', level: 4 }, { name: '渠道投放', level: 4 }],
    summary: '4年消费品市场经验，擅长新品上市、内容种草与渠道整合。能够围绕增长目标制定策略，并通过数据复盘持续优化投放效率。',
  },
  finance: {
    personal: { name: '陈嘉禾', phone: '13600003333', email: 'finance@example.com', city: '广州' },
    intention: { position: '财务分析师', city: '广州', salary: '15-25K', availableTime: '随时到岗' },
    education: [{ school: '中山大学', degree: '本科', major: '会计学', period: '2017.09 - 2021.06' }],
    workExperience: [
      { company: '某制造业集团', position: '财务分析师', period: '2021.07 - 至今', description: '负责预算编制、经营分析与成本测算，搭建月度经营看板，支持管理层决策。' },
      { company: '某会计师事务所', position: '审计助理', period: '2020.10 - 2021.06', description: '参与年审项目底稿编制、科目核对与风险点整理。' },
    ],
    projects: [{ name: '成本分析模型优化', role: '分析负责人', period: '2022.05 - 2022.10', description: '重构成本分摊口径，识别异常费用项，推动年度费用节约约80万元。' }],
    skills: [{ name: '财务分析', level: 5 }, { name: 'Excel', level: 5 }, { name: '预算管理', level: 4 }, { name: 'SQL', level: 3 }],
    certificates: [{ name: '初级会计职称', date: '2020' }],
    summary: '具备制造业财务分析与预算管理经验，熟悉成本核算、经营分析和报表自动化。重视数据准确性，能够将财务指标转化为经营建议。',
  },
  medical: {
    personal: { name: '王若宁', phone: '13500004444', email: 'nurse@example.com', city: '南京' },
    intention: { position: '临床护士', city: '南京', salary: '8-12K', availableTime: '随时到岗' },
    education: [{ school: '南京医科大学', degree: '本科', major: '护理学', period: '2018.09 - 2022.06' }],
    workExperience: [
      { company: '三甲综合医院', position: '临床护士', period: '2022.07 - 至今', description: '负责病区护理、医嘱执行和患者宣教，熟悉静脉输液、术后护理与护理文书规范。' },
      { company: '市人民医院', position: '实习护士', period: '2021.07 - 2022.04', description: '轮转内科、外科、急诊等科室，掌握基础护理操作与医患沟通流程。' },
    ],
    projects: [{ name: '病区健康宣教优化', role: '执行护士', period: '2023.01 - 2023.04', description: '整理常见病宣教材料，提升患者出院指导覆盖率与满意度。' }],
    skills: [{ name: '基础护理', level: 5 }, { name: '静脉输液', level: 5 }, { name: '急救配合', level: 4 }, { name: '护理文书', level: 4 }],
    certificates: [{ name: '护士执业资格证', date: '2022' }],
    summary: '护理学本科背景，具备三甲医院临床护理经验。熟悉病区护理流程、患者沟通与护理文书规范，工作细致、责任心强。',
  },
  management: {
    personal: { name: '赵亦辰', phone: '13400005555', email: 'pm@example.com', city: '北京' },
    intention: { position: '项目经理', city: '北京', salary: '25-40K', availableTime: '一个月内' },
    education: [{ school: '北京理工大学', degree: '本科', major: '信息管理与信息系统', period: '2015.09 - 2019.06' }],
    workExperience: [
      { company: '某企业服务公司', position: '项目经理', period: '2020.03 - 至今', description: '统筹SaaS交付项目，协调产品、研发、测试与客户资源，项目准时交付率保持95%以上。' },
      { company: '某咨询公司', position: '项目助理', period: '2019.07 - 2020.02', description: '负责需求记录、进度跟踪和会议纪要，支撑多个客户项目并行推进。' },
    ],
    projects: [{ name: '集团数字化系统上线', role: '项目经理', period: '2022.04 - 2023.01', description: '管理12人跨职能团队完成系统上线，覆盖8个业务部门，培训用户超300人。' }],
    skills: [{ name: '项目管理', level: 5 }, { name: '需求分析', level: 4 }, { name: '沟通协调', level: 5 }, { name: '风险管理', level: 4 }],
    certificates: [{ name: 'PMP', date: '2022' }],
    summary: '5年项目管理与企业服务交付经验，擅长复杂项目拆解、跨部门沟通和风险控制。关注交付质量与客户满意度。',
  },
  trade: {
    personal: { name: '李安琪', phone: '13300006666', email: 'trade@example.com', city: '宁波' },
    intention: { position: '外贸业务员', city: '宁波', salary: '10-18K', availableTime: '随时到岗' },
    education: [{ school: '上海对外经贸大学', degree: '本科', major: '国际经济与贸易', period: '2018.09 - 2022.06' }],
    workExperience: [{ company: '某进出口贸易公司', position: '外贸业务员', period: '2022.07 - 至今', description: '负责欧美客户开发、询盘跟进与订单履约，维护20+长期客户，年度成交额持续增长。' }],
    projects: [{ name: '海外客户开发专项', role: '业务负责人', period: '2023.02 - 2023.09', description: '通过展会、邮件与LinkedIn拓客，新增有效客户80+，转化订单12单。' }],
    skills: [{ name: '商务英语', level: 5 }, { name: '客户开发', level: 4 }, { name: '外贸单证', level: 4 }, { name: '谈判沟通', level: 4 }],
    languages: [{ language: '英语', level: 'TEM-8' }],
    summary: '国际贸易专业背景，熟悉外贸订单全流程与客户开发。英语沟通流畅，能够独立完成询盘、报价、跟单和售后维护。',
  },
  campus: {
    personal: { name: '许知夏', phone: '13200007777', email: 'student@example.com', city: '武汉' },
    intention: { position: '管培生', city: '上海', salary: '面议', availableTime: '2026.07' },
    education: [{ school: '武汉大学', degree: '本科', major: '工商管理', period: '2022.09 - 2026.06' }],
    workExperience: [{ company: '某快消品牌', position: '市场实习生', period: '2025.06 - 2025.09', description: '参与校园渠道调研和活动执行，完成问卷回收1200份并输出分析报告。' }],
    projects: [{ name: '校园社团品牌活动', role: '负责人', period: '2024.09 - 2024.12', description: '组织策划校园公益市集，协调30名志愿者，活动覆盖学生2000+。' }],
    skills: [{ name: '活动策划', level: 4 }, { name: '数据分析', level: 3 }, { name: 'PPT', level: 5 }, { name: '沟通协调', level: 5 }],
    certificates: [{ name: '校级优秀学生干部', date: '2025' }],
    summary: '工商管理专业应届生，具备市场实习、校园活动组织和数据分析经验。执行力强，擅长沟通协调和结构化表达。',
  },
};

function templateMatchesStyle(template: TemplateConfig, style: string): boolean {
  const aliases = styleAliases[style] || [style];
  const haystack = [template.category, template.layout, template.name, ...template.tags]
    .join(' ')
    .toLowerCase();
  return aliases.some((alias) => haystack.includes(alias.toLowerCase()));
}

function getDemoData(template: TemplateConfig): ResumeData {
  const key = [template.category, ...template.tags, template.name].join(' ');
  if (/医护|护士|临床|medical/.test(key)) return demoLibrary.medical;
  if (/视觉|设计|创意|艺术|美术/.test(key)) return demoLibrary.design;
  if (/市场|营销/.test(key)) return demoLibrary.marketing;
  if (/财务|会计|finance/.test(key)) return demoLibrary.finance;
  if (/管理|经理|客户经理|负责人/.test(key)) return demoLibrary.management;
  if (/外贸|贸易|国际/.test(key)) return demoLibrary.trade;
  if (/应届|校招|学生/.test(key)) return demoLibrary.campus;
  if (/技术|开发|工程师|互联网/.test(key)) return demoLibrary.tech;
  return demoLibrary.management;
}

export default function Templates() {
  const [search, setSearch] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showPremium, setShowPremium] = useState<boolean | null>(null);
  const [sort, setSort] = useState<'default' | 'newest' | 'popular'>('default');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null);
  const [previewThemeId, setPreviewThemeId] = useState<string>('');

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let list = [...templateRegistry];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (selectedStyles.length) {
      list = list.filter((t) => selectedStyles.some((s) => templateMatchesStyle(t, s)));
    }
    if (selectedIndustries.length) {
      list = list.filter((t) => selectedIndustries.some((s) => t.tags.includes(s) || t.category.includes(s)));
    }
    if (selectedColors.length) {
      list = list.filter((t) =>
        selectedColors.some((c) =>
          t.themes.some((th) => th.colors.primary.toLowerCase().includes(c.toLowerCase()))
        )
      );
    }
    if (showPremium !== null) {
      list = list.filter((t) => t.isPremium === showPremium);
    }
    if (sort === 'popular') {
      list.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
    }
    return list;
  }, [search, selectedStyles, selectedIndustries, selectedColors, showPremium, sort]);

  const activePreviewTheme = useMemo(() => {
    if (!previewTemplate) return null;
    return previewTemplate.themes.find((t) => t.id === previewThemeId) || previewTemplate.themes[0];
  }, [previewTemplate, previewThemeId]);

  const PreviewComponent = previewTemplate ? templateComponents[previewTemplate.id] : null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">精选简历模板</h1>
            <p className="mt-2 text-gray-500">由专业设计师打造，让 HR 眼前一亮的简历</p>
          </div>
        </FadeIn>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">筛选</span>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">风格</h4>
                <div className="flex flex-wrap gap-2">
                  {styles.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggle(selectedStyles, s, setSelectedStyles)}
                      className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                        selectedStyles.includes(s)
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">行业</h4>
                <div className="flex flex-wrap gap-2">
                  {industries.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggle(selectedIndustries, s, setSelectedIndustries)}
                      className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                        selectedIndustries.includes(s)
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-700 mb-2">颜色</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => toggle(selectedColors, c.value, setSelectedColors)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        selectedColors.includes(c.value)
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">类型</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '全部', value: null },
                    { label: '免费', value: false },
                    { label: 'VIP', value: true },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setShowPremium(opt.value as boolean | null)}
                      className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                        showPremium === opt.value
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索模板..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-primary-500"
                >
                  <option value="default">默认排序</option>
                  <option value="popular">最受欢迎</option>
                  <option value="newest">最新上架</option>
                </select>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">共 {filtered.length} 个模板</p>

            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filtered.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TemplateCard
                      template={t}
                      onPreview={() => { setPreviewTemplate(t); setPreviewThemeId(t.themes[0]?.id || ''); }}
                      Component={templateComponents[t.id]}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">没有找到匹配的模板</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {previewTemplate && activePreviewTheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{previewTemplate.name}</h2>
                  <p className="text-sm text-gray-500">{previewTemplate.description}</p>
                </div>
                <button onClick={() => setPreviewTemplate(null)} className="p-2 rounded-md hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Theme selector */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-500">主题：</span>
                  {previewTemplate.themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPreviewThemeId(t.id)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        previewThemeId === t.id ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: t.colors.primary }}
                      title={t.name}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{activePreviewTheme.name}</span>
                </div>

                {/* Preview */}
                <div className="bg-gray-100 rounded-lg p-4 flex justify-center overflow-auto">
                  <div className="bg-white shadow-lg origin-top" style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.55)', transformOrigin: 'top center' }}>
                    {PreviewComponent && <PreviewComponent data={getDemoData(previewTemplate)} theme={activePreviewTheme} />}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>关闭</Button>
                <Link to={`/editor/${previewTemplate.id}`}>
                  <Button>
                    <Eye className="w-4 h-4 mr-1" />
                    使用此模板
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplateCard({
  template,
  onPreview,
  Component,
}: {
  template: TemplateConfig;
  onPreview: () => void;
  Component?: ComponentType<{ data: ResumeData; theme: TemplateConfig['themes'][number] }>;
}) {
  const theme = template.themes[0];
  const data = getDemoData(template);
  return (
    <div className="group block cursor-pointer" onClick={onPreview}>
      <div className="relative rounded-xl overflow-hidden bg-white shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
        <div className="aspect-[3/4] overflow-hidden bg-slate-100 flex items-start justify-center relative">
          {Component && theme ? (
            <div
              className="origin-top pointer-events-none select-none bg-white shadow-sm"
              style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.235)', transformOrigin: 'top center' }}
            >
              <Component data={data} theme={theme} />
            </div>
          ) : (
            <span className="text-5xl font-bold text-gray-300 mt-20">{template.name[0]}</span>
          )}
          {template.id.startsWith('cn-') && (
            <div className="absolute left-2 top-2 rounded bg-black/55 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">实际预览</div>
          )}
        </div>
        {template.isPremium && (
          <div className="absolute top-3 right-3">
            <Badge variant="vip">VIP</Badge>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-semibold">{template.name}</h3>
          <div className="flex gap-2 mt-2">
            {template.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          <button className="mt-3 w-full py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm">
            查看预览
          </button>
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
        <div className="flex gap-2 mt-1">
          {template.tags.map((tag) => (
            <span key={tag} className="text-xs text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
