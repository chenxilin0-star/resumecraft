import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Save, Download, ChevronDown, Plus, GripVertical, Settings, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editorStore';
import { getTemplateById, templateComponents } from '@/templates';
import { exportToPDF } from '@/utils/pdf';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/helpers';
import { aiApi } from '@/api/ai';
import type { AiAction } from '@/utils/ai';
import type { ResumeData } from '@/types';

const sectionLabels: Record<string, string> = {
  personal: '个人信息',
  intention: '求职意向',
  education: '教育经历',
  workExperience: '工作经历',
  projects: '项目经历',
  skills: '技能特长',
  certificates: '证书奖项',
  summary: '自我评价',
  languages: '语言能力',
};

function getEmptySectionData(section: string): unknown {
  switch (section) {
    case 'intention':
      return { position: '', city: '', salary: '', availableTime: '' };
    case 'education':
      return [{ school: '', degree: '', major: '', period: '' }];
    case 'workExperience':
      return [{ company: '', position: '', period: '', description: '' }];
    case 'projects':
      return [{ name: '', role: '', period: '', description: '' }];
    case 'skills':
      return [{ name: '', level: 3 }];
    case 'certificates':
      return [{ name: '', date: '', description: '' }];
    case 'languages':
      return [{ language: '', level: '' }];
    case 'summary':
      return '';
    default:
      return undefined;
  }
}

export default function Editor() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = useMemo(() => getTemplateById(templateId || ''), [templateId]);
  const [activeThemeId, setActiveThemeId] = useState(template?.themes[0]?.id);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [aiLoadingAction, setAiLoadingAction] = useState<AiAction | null>(null);
  const [aiError, setAiError] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [visibleSections, setVisibleSections] = useState<string[]>(() => template?.defaultSections || []);

  const { resumeData, activeSection, setActiveSection, updateSection, zoom, setZoom } = useEditorStore();

  const theme = useMemo(
    () => template?.themes.find((t) => t.id === activeThemeId) || template?.themes[0],
    [template, activeThemeId]
  );

  const TemplateComponent = template ? templateComponents[template.id] : null;

  const handleExport = async () => {
    setShowExportModal(true);
    setExportProgress(0);
    try {
      await exportToPDF({
        elementId: 'resume-preview',
        filename: `${resumeData.personal.name || '简历'}_${template?.name || ''}`,
        onProgress: setExportProgress,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setShowExportModal(false), 500);
    }
  };

  const getActiveAiText = () => {
    if (activeSection === 'summary') return resumeData.summary || '';
    if (activeSection === 'workExperience') return resumeData.workExperience[0]?.description || '';
    if (activeSection === 'projects') return resumeData.projects[0]?.description || '';
    return '';
  };

  const applyActiveAiText = (text: string) => {
    if (activeSection === 'summary') {
      updateSection('summary', text);
      return;
    }
    if (activeSection === 'workExperience') {
      const work = [...resumeData.workExperience];
      work[0] = { ...(work[0] || { company: '', position: '', period: '', description: '' }), description: text };
      updateSection('workExperience', work);
      return;
    }
    if (activeSection === 'projects') {
      const projects = [...resumeData.projects];
      projects[0] = { ...(projects[0] || { name: '', role: '', period: '', description: '' }), description: text };
      updateSection('projects', projects);
    }
  };

  const handleAiOptimize = async (action: AiAction) => {
    const text = getActiveAiText().trim();
    if (!text) {
      setAiError('请先填写要优化的内容');
      return;
    }
    setAiError('');
    setAiLoadingAction(action);
    try {
      const res = await aiApi.optimize({
        action,
        section: activeSection,
        text,
        targetRole: resumeData.intention?.position,
      });
      applyActiveAiText(res.data.text);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 优化失败，请稍后重试');
    } finally {
      setAiLoadingAction(null);
    }
  };

  const canUseAi = ['summary', 'workExperience', 'projects'].includes(activeSection);

  const addMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    }
    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddMenu]);

  // Build preview data: hide sections not in visibleSections
  const previewData = useMemo(() => {
    const data = { ...resumeData } as Record<string, unknown>;
    const allKeys = Object.keys(sectionLabels);
    for (const key of allKeys) {
      if (!visibleSections.includes(key)) {
        data[key] = undefined;
      }
    }
    // Keep personal always visible
    data.personal = resumeData.personal;
    return data as unknown as ResumeData;
  }, [resumeData, visibleSections]);

  if (!template || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500">模板不存在</p>
          <Button className="mt-4" onClick={() => navigate('/templates')}>
            返回模板中心
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">未命名简历</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setLeftCollapsed(!leftCollapsed)}>
            <Eye className="w-4 h-4 mr-1" />
            预览
          </Button>
          <Button variant="secondary" size="sm">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button variant="vip" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            导出 PDF
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <AnimatePresence initial={false}>
          {!leftCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0"
            >
              <div className="p-5 space-y-6">
                {/* Module List */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    模块列表
                  </h3>
                  <div className="space-y-1">
                    {visibleSections.map((section) => (
                      <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors',
                          activeSection === section
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <span>{sectionLabels[section] || section}</span>
                        <div className="flex items-center gap-1">
                          {section === 'personal' && (
                            <span className="text-xs text-gray-400">必填</span>
                          )}
                          {section !== 'personal' && (
                            <span
                              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = visibleSections.filter((s) => s !== section);
                                setVisibleSections(next);
                                if (activeSection === section) {
                                  setActiveSection(next[0] || 'personal');
                                }
                              }}
                              title="移除模块"
                            >
                              <Trash2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowAddMenu(!showAddMenu)}
                      className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm text-primary-600 hover:bg-primary-50 transition-colors border border-dashed border-primary-200"
                    >
                      <Plus className="w-4 h-4" />
                      添加模块
                    </button>
                    {showAddMenu && (
                      <div ref={addMenuRef} className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                        {Object.entries(sectionLabels)
                          .filter(([key]) => !visibleSections.includes(key))
                          .map(([key, label]) => (
                            <button
                              key={key}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                setVisibleSections([...visibleSections, key]);
                                setActiveSection(key);
                                setShowAddMenu(false);
                                // Initialize empty data in store if undefined
                                const store = useEditorStore.getState();
                                const data = store.resumeData as unknown as Record<string, unknown>;
                                if (data[key] === undefined) {
                                  store.updateSection(key as never, getEmptySectionData(key) as never);
                                }
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        {Object.keys(sectionLabels).every((key) => visibleSections.includes(key)) && (
                          <div className="px-3 py-2 text-xs text-gray-400">已添加所有模块</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Area */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {sectionLabels[activeSection] || activeSection}
                  </h3>
                  <div className="space-y-4">
                    {canUseAi && (
                      <div className="rounded-xl border border-primary-100 bg-primary-50/70 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-2">
                          <Sparkles className="w-4 h-4" />
                          智能优化
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            ['polish', 'AI 优化'],
                            ['expand', 'AI 扩写'],
                            ['shorten', 'AI 精简'],
                            ['professional', '专业表达'],
                          ] as [AiAction, string][]).map(([action, label]) => (
                            <button
                              key={action}
                              type="button"
                              onClick={() => handleAiOptimize(action)}
                              disabled={!!aiLoadingAction}
                              className="inline-flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-medium text-primary-700 shadow-sm hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {aiLoadingAction === action ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              {label}
                            </button>
                          ))}
                        </div>
                        {aiError && <p className="mt-2 text-xs text-red-500">{aiError}</p>}
                        <p className="mt-2 text-xs text-primary-500">支持自我评价、工作经历、项目经历润色。</p>
                      </div>
                    )}
                    {activeSection === 'personal' && (
                      <>
                        <Input label="姓名" value={resumeData.personal.name} onChange={(e) => updateSection('personal', { ...resumeData.personal, name: e.target.value })} />
                        <Input label="电话" value={resumeData.personal.phone} onChange={(e) => updateSection('personal', { ...resumeData.personal, phone: e.target.value })} />
                        <Input label="邮箱" value={resumeData.personal.email} onChange={(e) => updateSection('personal', { ...resumeData.personal, email: e.target.value })} />
                        <Input label="城市" value={resumeData.personal.city || ''} onChange={(e) => updateSection('personal', { ...resumeData.personal, city: e.target.value })} />
                      </>
                    )}
                    {activeSection === 'intention' && (
                      <>
                        <Input label="期望岗位" value={resumeData.intention?.position || ''} onChange={(e) => updateSection('intention', { position: e.target.value, city: resumeData.intention?.city || '', salary: resumeData.intention?.salary || '', availableTime: resumeData.intention?.availableTime || '' })} />
                        <Input label="期望城市" value={resumeData.intention?.city || ''} onChange={(e) => updateSection('intention', { position: resumeData.intention?.position || '', city: e.target.value, salary: resumeData.intention?.salary || '', availableTime: resumeData.intention?.availableTime || '' })} />
                        <Input label="期望薪资" value={resumeData.intention?.salary || ''} onChange={(e) => updateSection('intention', { position: resumeData.intention?.position || '', city: resumeData.intention?.city || '', salary: e.target.value, availableTime: resumeData.intention?.availableTime || '' })} />
                      </>
                    )}
                    {activeSection === 'education' && (
                      <>
                        <Input label="学校" value={resumeData.education[0]?.school || ''} onChange={(e) => {
                          const edu = [...resumeData.education];
                          edu[0] = { ...edu[0], school: e.target.value };
                          updateSection('education', edu);
                        }} />
                        <Input label="学历" value={resumeData.education[0]?.degree || ''} onChange={(e) => {
                          const edu = [...resumeData.education];
                          edu[0] = { ...edu[0], degree: e.target.value };
                          updateSection('education', edu);
                        }} />
                        <Input label="专业" value={resumeData.education[0]?.major || ''} onChange={(e) => {
                          const edu = [...resumeData.education];
                          edu[0] = { ...edu[0], major: e.target.value };
                          updateSection('education', edu);
                        }} />
                        <Input label="时间段" value={resumeData.education[0]?.period || ''} onChange={(e) => {
                          const edu = [...resumeData.education];
                          edu[0] = { ...edu[0], period: e.target.value };
                          updateSection('education', edu);
                        }} />
                      </>
                    )}
                    {activeSection === 'workExperience' && (
                      <>
                        <Input label="公司" value={resumeData.workExperience[0]?.company || ''} onChange={(e) => {
                          const w = [...resumeData.workExperience];
                          w[0] = { ...w[0], company: e.target.value };
                          updateSection('workExperience', w);
                        }} />
                        <Input label="岗位" value={resumeData.workExperience[0]?.position || ''} onChange={(e) => {
                          const w = [...resumeData.workExperience];
                          w[0] = { ...w[0], position: e.target.value };
                          updateSection('workExperience', w);
                        }} />
                        <Input label="时间段" value={resumeData.workExperience[0]?.period || ''} onChange={(e) => {
                          const w = [...resumeData.workExperience];
                          w[0] = { ...w[0], period: e.target.value };
                          updateSection('workExperience', w);
                        }} />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">工作内容</label>
                          <textarea
                            className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100 min-h-[120px] resize-y"
                            value={resumeData.workExperience[0]?.description || ''}
                            onChange={(e) => {
                              const w = [...resumeData.workExperience];
                              w[0] = { ...(w[0] || { company: '', position: '', period: '', description: '' }), description: e.target.value };
                              updateSection('workExperience', w);
                            }}
                          />
                        </div>
                      </>
                    )}
                    {activeSection === 'projects' && (
                      <>
                        <Input label="项目名称" value={resumeData.projects[0]?.name || ''} onChange={(e) => {
                          const p = [...resumeData.projects];
                          p[0] = { ...(p[0] || { name: '', role: '', period: '', description: '' }), name: e.target.value };
                          updateSection('projects', p);
                        }} />
                        <Input label="角色" value={resumeData.projects[0]?.role || ''} onChange={(e) => {
                          const p = [...resumeData.projects];
                          p[0] = { ...(p[0] || { name: '', role: '', period: '', description: '' }), role: e.target.value };
                          updateSection('projects', p);
                        }} />
                        <Input label="时间段" value={resumeData.projects[0]?.period || ''} onChange={(e) => {
                          const p = [...resumeData.projects];
                          p[0] = { ...(p[0] || { name: '', role: '', period: '', description: '' }), period: e.target.value };
                          updateSection('projects', p);
                        }} />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                          <textarea
                            className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100 min-h-[120px] resize-y"
                            value={resumeData.projects[0]?.description || ''}
                            onChange={(e) => {
                              const p = [...resumeData.projects];
                              p[0] = { ...(p[0] || { name: '', role: '', period: '', description: '' }), description: e.target.value };
                              updateSection('projects', p);
                            }}
                          />
                        </div>
                      </>
                    )}
                    {activeSection === 'skills' && (
                      <>
                        <Input label="技能名称" value={resumeData.skills[0]?.name || ''} onChange={(e) => {
                          const s = [...resumeData.skills];
                          s[0] = { ...s[0], name: e.target.value };
                          updateSection('skills', s);
                        }} />
                        <Input label="熟练度 (1-5)" type="number" min={1} max={5} value={String(resumeData.skills[0]?.level || 3)} onChange={(e) => {
                          const s = [...resumeData.skills];
                          let level = Number(e.target.value);
                          if (Number.isNaN(level)) level = 3;
                          level = Math.max(1, Math.min(5, level));
                          s[0] = { ...s[0], level };
                          updateSection('skills', s);
                        }} />
                      </>
                    )}
                    {activeSection === 'summary' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">自我评价</label>
                        <textarea
                          className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100 min-h-[120px] resize-y"
                          value={resumeData.summary || ''}
                          onChange={(e) => updateSection('summary', e.target.value)}
                          maxLength={500}
                        />
                        <p className="mt-1 text-xs text-gray-400 text-right">{(resumeData.summary || '').length}/500</p>
                      </div>
                    )}
                    {!['personal', 'intention', 'education', 'workExperience', 'projects', 'skills', 'summary'].includes(activeSection) && (
                      <p className="text-sm text-gray-400">该模块表单占位</p>
                    )}
                  </div>
                </div>

                {/* Theme Settings */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    主题设置
                  </h3>
                  <div className="flex gap-2">
                    {template.themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveThemeId(t.id)}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-transform',
                          activeThemeId === t.id ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: t.colors.primary }}
                        title={t.name}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">当前：{theme.name}</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Right Preview */}
        <div className="flex-1 bg-gray-200 overflow-y-auto p-8 flex justify-center relative">
          <div
            id="resume-preview"
            className="bg-white shadow-xl rounded-sm origin-top transition-transform"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transform: `scale(${zoom})`,
            }}
          >
            {TemplateComponent && <TemplateComponent data={previewData} theme={theme} />}
          </div>

          {/* Zoom Controls */}
          <div className="fixed bottom-6 right-6 flex items-center bg-black/60 text-white rounded-full overflow-hidden shadow-lg">
            {([0.75, 1, 1.25] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  zoom === z ? 'bg-white/20' : 'hover:bg-white/10'
                )}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="正在导出 PDF">
        <div className="py-4">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">{exportProgress}%</p>
        </div>
      </Modal>
    </div>
  );
}
