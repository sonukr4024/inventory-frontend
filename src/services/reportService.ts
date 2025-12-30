import axiosInstance from '../utils/axiosConfig';
import {
  DailySalesReport,
  MonthlySalesReport,
  ProductSalesReport,
  OutstandingCustomer,
  LowStockProduct,
  InventoryValuation
} from '../types';

export const reportService = {
  getDailySalesReport: async (date: string): Promise<DailySalesReport> => {
    const response = await axiosInstance.get<DailySalesReport>('/api/reports/sales/daily', {
      params: { date }
    });
    return response.data;
  },

  getMonthlySalesReport: async (year: number, month: number): Promise<MonthlySalesReport> => {
    const response = await axiosInstance.get<MonthlySalesReport>('/api/reports/sales/monthly', {
      params: { year, month }
    });
    return response.data;
  },

  getCustomSalesReport: async (startDate: string, endDate: string): Promise<any> => {
    const response = await axiosInstance.get('/api/reports/sales/custom', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getProductSalesReport: async (
    productId: number,
    startDate: string,
    endDate: string
  ): Promise<ProductSalesReport> => {
    const response = await axiosInstance.get<ProductSalesReport>(
      `/api/reports/sales/product/${productId}`,
      {
        params: { startDate, endDate }
      }
    );
    return response.data;
  },

  getOutstandingReport: async (): Promise<OutstandingCustomer[]> => {
    const response = await axiosInstance.get<OutstandingCustomer[]>('/api/reports/outstanding');
    return response.data;
  },

  getLowStockReport: async (): Promise<LowStockProduct[]> => {
    const response = await axiosInstance.get<LowStockProduct[]>('/api/reports/inventory/low-stock');
    return response.data;
  },

  getInventoryValuationReport: async (): Promise<InventoryValuation> => {
    const response = await axiosInstance.get<InventoryValuation>('/api/reports/inventory/valuation');
    return response.data;
  }
};
