import axiosInstance from '../utils/axiosConfig';
import { Category, CreateCategoryRequest } from '../types';

export const categoryService = {
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await axiosInstance.post<Category>('/api/categories', data);
    return response.data;
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get<Category[]>('/api/categories');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await axiosInstance.get<Category>(`/api/categories/${id}`);
    return response.data;
  },

  updateCategory: async (id: number, data: CreateCategoryRequest): Promise<Category> => {
    const response = await axiosInstance.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/categories/${id}`);
  }
};
