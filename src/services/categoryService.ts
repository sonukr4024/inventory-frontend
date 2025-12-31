import axiosInstance from '../utils/axiosConfig';
import { Category, CreateCategoryRequest, ApiResponse } from '../types';

export const categoryService = {
  createCategory: async (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.post<ApiResponse<Category>>('/api/categories', data);
    return response.data;
  },

  getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>('/api/categories');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.get<ApiResponse<Category>>(`/api/categories/${id}`);
    return response.data;
  },

  updateCategory: async (id: number, data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.put<ApiResponse<Category>>(`/api/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/api/categories/${id}`);
    return response.data;
  }
};
