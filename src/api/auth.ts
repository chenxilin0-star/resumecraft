import { api } from './client';
import { User } from '@/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  nickname?: string;
}

export const authApi = {
  login: (data: LoginInput) =>
    api.post<{ token: string; user: User }>('/api/auth/login', data),
  register: (data: RegisterInput) =>
    api.post<{ token: string; user: User }>('/api/auth/register', data),
  me: () => api.get<{ user: User }>('/api/auth/me'),
};
