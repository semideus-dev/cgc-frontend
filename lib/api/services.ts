import { apiClient } from '@/lib/axios-client';

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AnalysisRequest {
  imageUrl: string;
  prompt?: string;
}

export interface AnalysisResult {
  id: string;
  status: string;
  results?: any;
  createdAt: string;
  updatedAt: string;
}

// API Service functions
export const apiServices = {
  // Analysis endpoints
  analysis: {
    // Create a new analysis
    create: async (data: AnalysisRequest): Promise<ApiResponse<AnalysisResult>> => {
      const response = await apiClient.post('/analysis', data);
      return response.data;
    },

    // Get analysis by ID
    getById: async (id: string): Promise<ApiResponse<AnalysisResult>> => {
      const response = await apiClient.get(`/analysis/${id}`);
      return response.data;
    },

    // Get all analyses for current user
    getAll: async (): Promise<ApiResponse<AnalysisResult[]>> => {
      const response = await apiClient.get('/analysis');
      return response.data;
    },

    // Update analysis
    update: async (id: string, data: Partial<AnalysisRequest>): Promise<ApiResponse<AnalysisResult>> => {
      const response = await apiClient.patch(`/analysis/${id}`, data);
      return response.data;
    },

    // Delete analysis
    delete: async (id: string): Promise<ApiResponse<void>> => {
      const response = await apiClient.delete(`/analysis/${id}`);
      return response.data;
    },
  },

  // User endpoints
  user: {
    // Get current user profile
    getProfile: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/user/profile');
      return response.data;
    },

    // Update user profile
    updateProfile: async (data: any): Promise<ApiResponse<any>> => {
      const response = await apiClient.patch('/user/profile', data);
      return response.data;
    },
  },

  // Health check
  health: {
    check: async (): Promise<ApiResponse<{ status: string }>> => {
      const response = await apiClient.get('/health');
      return response.data;
    },
  },
};

// Export individual services for convenience
export const { analysis, user, health } = apiServices;