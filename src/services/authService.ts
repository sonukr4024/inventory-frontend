import axiosInstance from '../utils/axiosConfig';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, LoginResponseData } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponseData>>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  hasRole: (role: string) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  isAdmin: () => {
    return authService.hasRole('ROLE_ADMIN');
  }
};
