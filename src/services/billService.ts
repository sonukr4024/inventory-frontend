import axiosInstance from '../utils/axiosConfig';
import { Bill, CreateBillRequest } from '../types';

export const billService = {
  createBill: async (data: CreateBillRequest): Promise<Bill> => {
    const response = await axiosInstance.post<Bill>('/api/bills', data);
    return response.data;
  },

  getAllBills: async (): Promise<Bill[]> => {
    const response = await axiosInstance.get<Bill[]>('/api/bills');
    return response.data;
  },

  getBillById: async (id: number): Promise<Bill> => {
    const response = await axiosInstance.get<Bill>(`/api/bills/${id}`);
    return response.data;
  }
};
