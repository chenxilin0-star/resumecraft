import { create } from 'zustand';
import { ResumeData, TemplateTheme } from '@/types';

interface EditorState {
  resumeData: ResumeData;
  activeSection: string;
  visibleSections: string[];
  theme: TemplateTheme | null;
  zoom: number;
  setResumeData: (data: ResumeData) => void;
  updateSection: <K extends keyof ResumeData>(section: K, data: ResumeData[K]) => void;
  setActiveSection: (section: string) => void;
  setVisibleSections: (sections: string[]) => void;
  addSection: (section: string) => void;
  removeSection: (section: string) => void;
  setTheme: (theme: TemplateTheme) => void;
  setZoom: (zoom: number) => void;
  addItem: (section: string, item: unknown) => void;
  removeItem: (section: string, index: number) => void;
  updateItem: (section: string, index: number, item: unknown) => void;
}

const defaultData: ResumeData = {
  personal: {
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    city: '北京',
  },
  intention: {
    position: '高级前端工程师',
    city: '北京',
    salary: '30-50K',
    availableTime: '随时到岗',
  },
  education: [
    { school: '清华大学', degree: '本科', major: '计算机科学与技术', period: '2018.09 - 2022.06' },
    { school: '北京师范大学附属中学', degree: '高中', major: '理科', period: '2015.09 - 2018.06' },
  ],
  workExperience: [
    {
      company: '某互联网科技公司',
      position: '高级前端工程师',
      period: '2022.07 - 至今',
      description: '负责核心产品的前端架构设计与开发，带领团队完成多个重要项目。优化页面加载性能，首屏加载时间减少30%。推动组件库建设，提升团队开发效率15%。',
    },
    {
      company: '某软件服务公司',
      position: '前端开发工程师',
      period: '2021.03 - 2022.06',
      description: '参与企业级SaaS平台的前端开发，负责数据可视化模块。实现了多个复杂表单组件和数据展示功能，获得客户高度认可。',
    },
  ],
  projects: [
    {
      name: '在线简历编辑器',
      role: '前端架构师',
      period: '2023.06 - 2024.01',
      description: '负责整体前端架构设计，采用React 18 + TypeScript + Tailwind CSS技术栈。实现实时预览、PDF导出、多模板切换等核心功能。支持响应式布局和暗色模式。',
      techStack: 'React 18, TypeScript, Tailwind CSS, Vite',
    },
    {
      name: '数据可视化平台',
      role: '核心开发',
      period: '2022.09 - 2023.05',
      description: '参与企业数据分析平台的前端开发，实现了图表组件库、拖拽排布系统、实时数据联动。项目月活跃用户超过10万。',
      techStack: 'Vue 3, ECharts, WebSocket',
    },
    {
      name: '移动端商城小程序',
      role: '前端开发',
      period: '2021.06 - 2021.12',
      description: '独立负责电商小程序前端开发，包括商品列表、购物车、订单管理、支付模块。上线后日活跃用户超过5000人。',
      techStack: 'Taro, React, 微信小程序 API',
    },
  ],
  skills: [
    { name: 'React', level: 5 },
    { name: 'TypeScript', level: 5 },
    { name: 'Node.js', level: 4 },
    { name: 'Vue.js', level: 4 },
    { name: 'Tailwind CSS', level: 5 },
    { name: 'Git', level: 4 },
  ],
  certificates: [
    { name: '软件设计师（中级）', date: '2023-05', description: '' },
    { name: 'AWS 云服务认证', date: '2022-11', description: '' },
  ],
  languages: [
    { language: '英语', level: 'CET-6' },
    { language: '普通话', level: '二甲' },
  ],
  summary: '5年前端开发经验，精通React和Vue生态。强烈的技术探索欲望，善于技术选型和团队管理。具备产品思维，能够从用户角度思考问题。追求简洁优雅的代码，注重性能优化和用户体验。',
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

export const useEditorStore = create<EditorState>((set, get) => ({
  resumeData: defaultData,
  activeSection: 'personal',
  visibleSections: ['personal', 'intention', 'education', 'workExperience', 'projects', 'skills', 'certificates', 'languages', 'summary'],
  theme: null,
  zoom: 1,
  setResumeData: (data) => set({ resumeData: data }),
  updateSection: (section, data) =>
    set((state) => ({
      resumeData: { ...state.resumeData, [section]: data },
    })),
  setActiveSection: (section) => set({ activeSection: section }),
  setVisibleSections: (sections) => set({ visibleSections: sections }),
  addSection: (section) => {
    const state = get();
    if (state.visibleSections.includes(section)) return;

    const updates: Partial<EditorState> = {
      visibleSections: [...state.visibleSections, section],
      activeSection: section,
    };

    // Initialize empty data if the field is currently undefined
    if (state.resumeData[section as keyof ResumeData] === undefined) {
      updates.resumeData = {
        ...state.resumeData,
        [section]: getEmptySectionData(section),
      } as ResumeData;
    }

    set(updates);
  },
  removeSection: (section) => {
    if (section === 'personal') return;
    const state = get();
    const nextSections = state.visibleSections.filter((s) => s !== section);
    set({
      visibleSections: nextSections,
      activeSection: state.activeSection === section ? nextSections[0] || 'personal' : state.activeSection,
    });
  },
  setTheme: (theme) => set({ theme }),
  setZoom: (zoom) => set({ zoom }),
  addItem: (section, item) => {
    set((state) => {
      const arr = (state.resumeData[section as keyof ResumeData] as unknown[] || []) as unknown[];
      return {
        resumeData: { ...state.resumeData, [section]: [...arr, item] },
      };
    });
  },
  removeItem: (section, index) => {
    set((state) => {
      const arr = [...((state.resumeData[section as keyof ResumeData] as unknown[] || []) as unknown[])];
      arr.splice(index, 1);
      return {
        resumeData: { ...state.resumeData, [section]: arr },
      };
    });
  },
  updateItem: (section, index, item) => {
    set((state) => {
      const arr = [...((state.resumeData[section as keyof ResumeData] as unknown[] || []) as unknown[])];
      arr[index] = item;
      return {
        resumeData: { ...state.resumeData, [section]: arr },
      };
    });
  },
}));
