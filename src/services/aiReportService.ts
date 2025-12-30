import axiosInstance from '../utils/axiosConfig';
import { AIReportRequest, AIReportResponse } from '../types';

export const aiReportService = {
  generateReport: async (data: AIReportRequest): Promise<AIReportResponse> => {
    const response = await axiosInstance.post<AIReportResponse>('/api/ai-reports/generate', data);
    return response.data;
  },

  generateReportAsync: async (data: AIReportRequest): Promise<AIReportResponse> => {
    const response = await axiosInstance.post<AIReportResponse>('/api/ai-reports/generate/async', data);
    return response.data;
  }
};
