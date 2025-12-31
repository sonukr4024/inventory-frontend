import axiosInstance from '../utils/axiosConfig';
import { DashboardStats, ApiResponse, DailySalesReport, OutstandingCustomer, LowStockProduct } from '../types';
import { format } from 'date-fns';

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const today = format(new Date(), 'yyyy-MM-dd');

    const [dailySales, outstanding, lowStock] = await Promise.all([
      axiosInstance.get<ApiResponse<DailySalesReport>>('/api/reports/sales/daily', { params: { date: today } }),
      axiosInstance.get<ApiResponse<OutstandingCustomer[]>>('/api/credit/outstanding'),
      axiosInstance.get<ApiResponse<LowStockProduct[]>>('/api/products/low-stock')
    ]);

    const pendingDues = outstanding.data.data.reduce(
      (sum: number, customer: any) => sum + customer.totalOutstanding,
      0
    );

    const salesData = dailySales.data.data;
    const netSales = salesData.netSales || salesData.totalSales || 0;

    return {
      todaySales: netSales,
      pendingDues: pendingDues,
      lowStockCount: lowStock.data.data.length || 0,
      todayBills: salesData.totalBills || 0
    };
  }
};
