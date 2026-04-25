import { api } from './client';
import { Resume, ResumeData } from '@/types';

export interface CreateResumeInput {
  templateId: number;
  title: string;
  content: ResumeData;
}

export interface UpdateResumeInput {
  title?: string;
  content?: ResumeData;
}

export const resumesApi = {
  list: () => api.get<Resume[]>('/api/resumes'),
  getById: (id: number) => api.get<Resume>(`/api/resumes/${id}`),
  create: (data: CreateResumeInput) => api.post<Resume>('/api/resumes', data),
  update: (id: number, data: UpdateResumeInput) =>
    api.put<Resume>(`/api/resumes/${id}`, data),
  delete: (id: number) => api.delete<void>(`/api/resumes/${id}`),
};
