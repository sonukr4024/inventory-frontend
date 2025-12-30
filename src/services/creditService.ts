import axiosInstance from '../utils/axiosConfig';
import { PaymentRequest, OutstandingCustomer } from '../types';

export const creditService = {
  recordPayment: async (data: PaymentRequest): Promise<void> => {
    await axiosInstance.post('/api/credit/payment', data);
  },

  getAllOutstanding: async (): Promise<OutstandingCustomer[]> => {
    const response = await axiosInstance.get<OutstandingCustomer[]>('/api/credit/outstanding');
    return response.data;
  },

  getCustomerOutstanding: async (customerId: number): Promise<any> => {
    const response = await axiosInstance.get(`/api/credit/outstanding/customer/${customerId}`);
    return response.data;
  }
};
