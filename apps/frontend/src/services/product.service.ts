import { api } from '../lib/api';
import type { Product } from '../types';

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  priceSelling: number;
  priceWholesale: number;
  stockQty: number;
  isAvailable: boolean;
  isActive?: boolean;
  imageFile?: File | null;
}

function buildFormData(data: Partial<ProductFormData>): FormData {
  const fd = new FormData();
  if (data.title !== undefined) fd.append('title', data.title);
  if (data.description !== undefined) fd.append('description', data.description);
  if (data.category !== undefined) fd.append('category', data.category);
  if (data.priceSelling !== undefined) fd.append('priceSelling', String(data.priceSelling));
  if (data.priceWholesale !== undefined) fd.append('priceWholesale', String(data.priceWholesale));
  if (data.stockQty !== undefined) fd.append('stockQty', String(data.stockQty));
  if (data.isAvailable !== undefined) fd.append('isAvailable', String(data.isAvailable));
  if (data.isActive !== undefined) fd.append('isActive', String(data.isActive));
  if (data.imageFile) fd.append('image', data.imageFile);
  return fd;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await api.get('/products');
  return res.data.products;
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const fd = buildFormData(data);
  const res = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.product;
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  const fd = buildFormData(data);
  const res = await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.product;
}

export async function deleteProductApi(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}