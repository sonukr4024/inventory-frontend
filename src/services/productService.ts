import axiosInstance from '../utils/axiosConfig';
import { Product, CreateProductRequest, RateOverrideRequest, LowStockProduct } from '../types';

export const productService = {
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await axiosInstance.post<Product>('/api/products', data);
    return response.data;
  },

  getAllProducts: async (): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>('/api/products');
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  updateProduct: async (id: number, data: CreateProductRequest): Promise<Product> => {
    const response = await axiosInstance.put<Product>(`/api/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/products/${id}`);
  },

  searchProducts: async (name: string): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>('/api/products/search', {
      params: { name }
    });
    return response.data;
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>(`/api/products/category/${categoryId}`);
    return response.data;
  },

  overrideRate: async (id: number, data: RateOverrideRequest): Promise<void> => {
    await axiosInstance.post(`/api/products/${id}/rate-override`, data);
  },

  getLowStockProducts: async (): Promise<LowStockProduct[]> => {
    const response = await axiosInstance.get<LowStockProduct[]>('/api/products/low-stock');
    return response.data;
  }
};
