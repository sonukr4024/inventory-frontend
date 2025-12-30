import axiosInstance from '../utils/axiosConfig';
import { Customer, CreateCustomerRequest } from '../types';

export const customerService = {
  createCustomer: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await axiosInstance.post<Customer>('/api/customers', data);
    return response.data;
  },

  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await axiosInstance.get<Customer[]>('/api/customers');
    return response.data;
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await axiosInstance.get<Customer>(`/api/customers/${id}`);
    return response.data;
  },

  updateCustomer: async (id: number, data: CreateCustomerRequest): Promise<Customer> => {
    const response = await axiosInstance.put<Customer>(`/api/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/customers/${id}`);
  },

  searchCustomers: async (name: string): Promise<Customer[]> => {
    const response = await axiosInstance.get<Customer[]>('/api/customers/search', {
      params: { name }
    });
    return response.data;
  },

  uploadFaceImage: async (customerId: number, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await axiosInstance.post(`/api/customers/${customerId}/face-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  recognizeFace: async (file: File): Promise<Customer> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<Customer>('/api/customers/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
