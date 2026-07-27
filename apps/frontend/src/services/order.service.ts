import { api } from '../lib/api';
import type { OrderDisplay, BackendOrderStatus } from '../types';

export async function fetchOrders(status?: BackendOrderStatus): Promise<OrderDisplay[]> {
  const res = await api.get('/orders', { params: status ? { status } : {} });
  return res.data.orders;
}

export async function updateOrderStatus(id: string, status: BackendOrderStatus): Promise<OrderDisplay> {
  const res = await api.put(`/orders/${id}/status`, { status });
  return res.data.order;
}