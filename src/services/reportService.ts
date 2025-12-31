import axiosInstance from '../utils/axiosConfig';
import {
  DailySalesReport,
  MonthlySalesReport,
  ProductSalesReport,
  OutstandingCustomer,
  LowStockProduct,
  InventoryValuation,
  ApiResponse
} from '../types';

export const reportService = {
  getDailySalesReport: async (date: string): Promise<ApiResponse<DailySalesReport>> => {
    const response = await axiosInstance.get<ApiResponse<DailySalesReport>>('/api/reports/sales/daily', {
      params: { date }
    });
    return response.data;
  },

  getMonthlySalesReport: async (year: number, month: number): Promise<ApiResponse<MonthlySalesReport>> => {
    const response = await axiosInstance.get<ApiResponse<MonthlySalesReport>>('/api/reports/sales/monthly', {
      params: { year, month }
    });
    return response.data;
  },

  getCustomSalesReport: async (startDate: string, endDate: string): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get<ApiResponse<any>>('/api/reports/sales/custom', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getProductSalesReport: async (
    productId: number,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ProductSalesReport>> => {
    const response = await axiosInstance.get<ApiResponse<ProductSalesReport>>(
      `/api/reports/sales/product/${productId}`,
      {
        params: { startDate, endDate }
      }
    );
    return response.data;
  },

  getOutstandingReport: async (): Promise<ApiResponse<OutstandingCustomer[]>> => {
    const response = await axiosInstance.get<ApiResponse<OutstandingCustomer[]>>('/api/reports/outstanding');
    return response.data;
  },

  getLowStockReport: async (): Promise<ApiResponse<LowStockProduct[]>> => {
    const response = await axiosInstance.get<ApiResponse<LowStockProduct[]>>('/api/reports/inventory/low-stock');
    return response.data;
  },

  getInventoryValuationReport: async (): Promise<ApiResponse<InventoryValuation>> => {
    const response = await axiosInstance.get<ApiResponse<InventoryValuation>>('/api/reports/inventory/valuation');
    return response.data;
  }
};
