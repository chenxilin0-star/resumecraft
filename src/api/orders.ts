import { api } from './client';
import { Order } from '@/types';

export interface CreateOrderInput {
  type: 'monthly' | 'single';
  amount: number;
}

export const ordersApi = {
  list: () => api.get<Order[]>('/api/orders'),
  create: (data: CreateOrderInput) => api.post<Order>('/api/orders', data),
};
