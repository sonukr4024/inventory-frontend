import axiosInstance from '../utils/axiosConfig';
import { DashboardStats } from '../types';
import { format } from 'date-fns';

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const [dailySales, outstanding, lowStock] = await Promise.all([
      axiosInstance.get('/api/reports/sales/daily', { params: { date: today } }),
      axiosInstance.get('/api/credit/outstanding'),
      axiosInstance.get('/api/products/low-stock')
    ]);

    const pendingDues = outstanding.data.reduce(
      (sum: number, customer: any) => sum + customer.currentOutstanding,
      0
    );

    return {
      todaySales: dailySales.data.netSales || 0,
      pendingDues: pendingDues,
      lowStockCount: lowStock.data.length || 0,
      todayBills: dailySales.data.totalBills || 0
    };
  }
};
