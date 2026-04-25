import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Save, Download, ChevronDown, Plus, GripVertical, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/stores/editorStore';
import { getTemplateById, templateComponents } from '@/templates';
import { exportToPDF } from '@/utils/pdf';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/helpers';

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

export default function Editor() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = useMemo(() => getTemplateById(templateId || ''), [templateId]);
  const [activeThemeId, setActiveThemeId] = useState(template?.themes[0]?.id);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

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
                    {template.defaultSections.map((section) => (
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
                        <span className="text-xs text-gray-400">
                          {section === 'personal' ? '✓' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm text-primary-600 hover:bg-primary-50 transition-colors border border-dashed border-primary-200">
                    <Plus className="w-4 h-4" />
                    添加模块
                  </button>
                </div>

                {/* Form Area */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {sectionLabels[activeSection] || activeSection}
                  </h3>
                  <div className="space-y-4">
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
                          s[0] = { ...s[0], level: Number(e.target.value) };
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
                    {!['personal', 'intention', 'education', 'workExperience', 'skills', 'summary'].includes(activeSection) && (
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
            {TemplateComponent && <TemplateComponent data={resumeData} theme={theme} />}
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
