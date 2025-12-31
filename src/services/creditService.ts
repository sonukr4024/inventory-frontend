import axiosInstance from '../utils/axiosConfig';
import { PaymentRequest, OutstandingCustomer, ApiResponse } from '../types';

export const creditService = {
  recordPayment: async (data: PaymentRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>('/api/credit/payment', data);
    return response.data;
  },

  getAllOutstanding: async (): Promise<ApiResponse<OutstandingCustomer[]>> => {
    const response = await axiosInstance.get<ApiResponse<OutstandingCustomer[]>>('/api/credit/outstanding');
    return response.data;
  },

  getCustomerOutstanding: async (customerId: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get<ApiResponse<any>>(`/api/credit/outstanding/customer/${customerId}`);
    return response.data;
  }
};
