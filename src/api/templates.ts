import { api } from './client';
import { TemplateConfig, TemplateCategory } from '@/types';

export interface TemplateListParams {
  category?: string;
  style?: string;
  color?: string;
  scene?: string;
  isPremium?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface TemplateListResponse {
  list: TemplateConfig[];
  total: number;
  page: number;
  limit: number;
}

export const templatesApi = {
  list: (params?: TemplateListParams) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return api.get<TemplateListResponse>(`/api/templates${suffix}`);
  },
  categories: () => api.get<TemplateCategory[]>('/api/templates/categories'),
  getById: (id: string) => api.get<TemplateConfig>(`/api/templates/${id}`),
};
