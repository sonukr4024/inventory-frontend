import axiosInstance from '../utils/axiosConfig';
import { AIReportRequest, AIReportResponse, ApiResponse } from '../types';

export const aiReportService = {
  generateReport: async (data: AIReportRequest): Promise<ApiResponse<AIReportResponse>> => {
    const response = await axiosInstance.post<ApiResponse<AIReportResponse>>('/api/ai-reports/generate', data);
    return response.data;
  },

  generateReportAsync: async (data: AIReportRequest): Promise<ApiResponse<AIReportResponse>> => {
    const response = await axiosInstance.post<ApiResponse<AIReportResponse>>('/api/ai-reports/generate/async', data);
    return response.data;
  }
};
