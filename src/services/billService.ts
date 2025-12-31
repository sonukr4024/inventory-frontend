import axiosInstance from '../utils/axiosConfig';
import { Bill, CreateBillRequest, ApiResponse } from '../types';

export const billService = {
  createBill: async (data: CreateBillRequest): Promise<ApiResponse<Bill>> => {
    const response = await axiosInstance.post<ApiResponse<Bill>>('/api/bills', data);
    return response.data;
  },

  getAllBills: async (): Promise<ApiResponse<Bill[]>> => {
    const response = await axiosInstance.get<ApiResponse<Bill[]>>('/api/bills');
    return response.data;
  },

  getBillById: async (id: number): Promise<ApiResponse<Bill>> => {
    const response = await axiosInstance.get<ApiResponse<Bill>>(`/api/bills/${id}`);
    return response.data;
  }
};
