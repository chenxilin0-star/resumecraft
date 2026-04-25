import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { templateRegistry } from '@/templates';
import { TemplateConfig } from '@/types';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';

const styles = ['极简', '商务', '现代', '清新', '创意', '学术'];
const scenes = ['校招', '社招', '转行', '留学'];
const colors = [
  { name: '蓝色', value: '#3B82F6' },
  { name: '绿色', value: '#10B981' },
  { name: '红色', value: '#EF4444' },
  { name: '黑色', value: '#111827' },
  { name: '紫色', value: '#8B5CF6' },
  { name: '橙色', value: '#F97316' },
];

export default function Templates() {
  const [search, setSearch] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showPremium, setShowPremium] = useState<boolean | null>(null);
  const [sort, setSort] = useState<'default' | 'newest' | 'popular'>('default');

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
      list = list.filter((t) => selectedStyles.some((s) => t.tags.includes(s)));
    }
    if (selectedScenes.length) {
      list = list.filter((t) => selectedScenes.some((s) => t.tags.includes(s) || t.category.includes(s)));
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
  }, [search, selectedStyles, selectedScenes, selectedColors, showPremium, sort]);

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
                <h4 className="text-sm font-medium text-gray-700 mb-2">场景</h4>
                <div className="flex flex-wrap gap-2">
                  {scenes.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggle(selectedScenes, s, setSelectedScenes)}
                      className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                        selectedScenes.includes(s)
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
                    <TemplateCard template={t} />
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
    </div>
  );
}

function TemplateCard({ template }: { template: TemplateConfig }) {
  return (
    <Link to={`/editor/${template.id}`} className="group block">
      <div className="relative rounded-xl overflow-hidden bg-white shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
        <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-5xl font-bold text-gray-300">{template.name[0]}</span>
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
            使用模板
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
    </Link>
  );
}
