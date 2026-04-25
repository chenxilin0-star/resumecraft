export interface User {
  id: number;
  email: string;
  nickname?: string;
  avatar?: string;
  isVip: boolean;
  vipExpireAt?: number;
}

export interface ResumeData {
  personal: {
    name: string;
    phone: string;
    email: string;
    wechat?: string;
    website?: string;
    city?: string;
    status?: string;
    photo?: string;
  };
  intention?: {
    position: string;
    city: string;
    salary: string;
    availableTime: string;
  };
  education: Array<{
    school: string;
    degree: string;
    major: string;
    period: string;
    description?: string;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    period: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    role: string;
    period: string;
    description: string;
    techStack?: string;
    link?: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
  }>;
  certificates?: Array<{
    name: string;
    date: string;
    description?: string;
  }>;
  summary?: string;
  languages?: Array<{
    language: string;
    level: string;
  }>;
}

export interface TemplateTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  font: {
    heading: string;
    body: string;
  };
}

export interface TemplateConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  layout: string;
  supportsPhoto: boolean;
  supportsMultiPage: boolean;
  defaultSections: string[];
  isPremium: boolean;
  category: string;
  tags: string[];
  thumbnail: string;
  useCount?: number;
  themes: TemplateTheme[];
  fonts: {
    heading: string;
    body: string;
  };
}

export interface TemplateCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
}

export interface Resume {
  id: number;
  userId: number;
  templateId: number;
  title: string;
  content: ResumeData;
  isPublic: boolean;
  publicSlug?: string;
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
