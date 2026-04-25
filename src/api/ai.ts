import { api } from './client';
import type { AiAction } from '@/utils/ai';

export interface AiOptimizeRequest {
  action: AiAction;
  section: string;
  text: string;
  targetRole?: string;
}

export interface AiOptimizeResponse {
  text: string;
  model: string;
}

export const aiApi = {
  optimize: (payload: AiOptimizeRequest) => api.post<AiOptimizeResponse>('/api/ai/optimize', payload),
};
