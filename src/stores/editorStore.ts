import { create } from 'zustand';
import { ResumeData, TemplateTheme } from '@/types';

interface EditorState {
  resumeData: ResumeData;
  activeSection: string;
  theme: TemplateTheme | null;
  zoom: number;
  setResumeData: (data: ResumeData) => void;
  updateSection: <K extends keyof ResumeData>(section: K, data: ResumeData[K]) => void;
  setActiveSection: (section: string) => void;
  setTheme: (theme: TemplateTheme) => void;
  setZoom: (zoom: number) => void;
}

const defaultData: ResumeData = {
  personal: {
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    city: '北京',
  },
  education: [
    {
      school: '清华大学',
      degree: '本科',
      major: '计算机科学',
      period: '2018-2022',
    },
  ],
  workExperience: [
    {
      company: '某科技有限公司',
      position: '前端工程师',
      period: '2022-至今',
      description: '负责公司核心产品的前端开发与维护',
    },
  ],
  projects: [],
  skills: [
    { name: 'React', level: 4 },
    { name: 'TypeScript', level: 4 },
    { name: 'Node.js', level: 3 },
  ],
  summary: '热爱技术，善于沟通，具备优秀的团队协作能力。',
};

export const useEditorStore = create<EditorState>((set) => ({
  resumeData: defaultData,
  activeSection: 'personal',
  theme: null,
  zoom: 1,
  setResumeData: (data) => set({ resumeData: data }),
  updateSection: (section, data) =>
    set((state) => ({
      resumeData: { ...state.resumeData, [section]: data },
    })),
  setActiveSection: (section) => set({ activeSection: section }),
  setTheme: (theme) => set({ theme }),
  setZoom: (zoom) => set({ zoom }),
}));
