import axiosInstance from '../utils/axiosConfig';
import { Product, CreateProductRequest, RateOverrideRequest, LowStockProduct, ApiResponse } from '../types';

export const productService = {
  createProduct: async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.post<ApiResponse<Product>>('/api/products', data);
    return response.data;
  },

  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>('/api/products');
    return response.data;
  },

  getProductById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.get<ApiResponse<Product>>(`/api/products/${id}`);
    return response.data;
  },

  updateProduct: async (id: number, data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    const response = await axiosInstance.put<ApiResponse<Product>>(`/api/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/api/products/${id}`);
    return response.data;
  },

  searchProducts: async (name: string): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>('/api/products/search', {
      params: { name }
    });
    return response.data;
  },

  getProductsByCategory: async (categoryId: number): Promise<ApiResponse<Product[]>> => {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(`/api/products/category/${categoryId}`);
    return response.data;
  },

  overrideRate: async (id: number, data: RateOverrideRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(`/api/products/${id}/rate-override`, data);
    return response.data;
  },

  getLowStockProducts: async (): Promise<ApiResponse<LowStockProduct[]>> => {
    const response = await axiosInstance.get<ApiResponse<LowStockProduct[]>>('/api/products/low-stock');
    return response.data;
  }
};
