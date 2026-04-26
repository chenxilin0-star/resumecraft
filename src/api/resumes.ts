import { api } from './client';
import { Resume, ResumeData } from '@/types';

export interface CreateResumeInput {
  templateId: string;
  title: string;
  content: ResumeData;
}

export interface UpdateResumeInput {
  title?: string;
  content?: ResumeData;
  isPublic?: boolean;
  publicSlug?: string;
}

export const resumesApi = {
  list: () => api.get<Resume[]>('/api/resumes'),
  getById: (id: number) => api.get<Resume>(`/api/resumes/${id}`),
  create: (data: CreateResumeInput) => api.post<Resume>('/api/resumes', data),
  update: (id: number, data: UpdateResumeInput) =>
    api.put<Resume>(`/api/resumes/${id}`, data),
  delete: (id: number) => api.delete<void>(`/api/resumes/${id}`),
  duplicate: (id: number) => api.post<{ id: number }>(`/api/resumes/${id}/duplicate`, {}),
  logExport: (id: number, data: { format?: string; isPremiumTemplate?: boolean }) =>
    api.post<void>(`/api/resumes/${id}/export`, data),
  share: (id: number, data: { isPublic: boolean; regenerateSlug?: boolean }) =>
    api.post<{ publicSlug: string; shareUrl: string }>(`/api/resumes/${id}/share`, data),
  getPublic: (slug: string) => api.get<{ resume: Resume; user: { nickname?: string } }>(`/api/resumes/public/${slug}`),
};
