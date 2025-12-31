import axiosInstance from '../utils/axiosConfig';
import { Customer, CreateCustomerRequest, ApiResponse } from '../types';

export const customerService = {
  createCustomer: async (data: CreateCustomerRequest): Promise<ApiResponse<Customer>> => {
    const response = await axiosInstance.post<ApiResponse<Customer>>('/api/customers', data);
    return response.data;
  },

  getAllCustomers: async (): Promise<ApiResponse<Customer[]>> => {
    const response = await axiosInstance.get<ApiResponse<Customer[]>>('/api/customers');
    return response.data;
  },

  getCustomerById: async (id: number): Promise<ApiResponse<Customer>> => {
    const response = await axiosInstance.get<ApiResponse<Customer>>(`/api/customers/${id}`);
    return response.data;
  },

  updateCustomer: async (id: number, data: CreateCustomerRequest): Promise<ApiResponse<Customer>> => {
    const response = await axiosInstance.put<ApiResponse<Customer>>(`/api/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/api/customers/${id}`);
    return response.data;
  },

  searchCustomers: async (name: string): Promise<ApiResponse<Customer[]>> => {
    const response = await axiosInstance.get<ApiResponse<Customer[]>>('/api/customers/search', {
      params: { name }
    });
    return response.data;
  },

  uploadFaceImage: async (customerId: number, file: File): Promise<ApiResponse<void>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<ApiResponse<void>>(`/api/customers/${customerId}/face-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  recognizeFace: async (file: File): Promise<ApiResponse<Customer>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<ApiResponse<Customer>>('/api/customers/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
