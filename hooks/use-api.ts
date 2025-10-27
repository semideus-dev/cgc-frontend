"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiServices, AnalysisRequest, AnalysisResult } from '@/lib/api/services';
import { toast } from 'sonner';

// Query keys for React Query
export const queryKeys = {
  analysis: {
    all: ['analysis'] as const,
    byId: (id: string) => ['analysis', id] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
  },
  health: ['health'] as const,
};

// Analysis hooks
export const useAnalysis = {
  // Get all analyses
  useGetAll: () => {
    return useQuery({
      queryKey: queryKeys.analysis.all,
      queryFn: () => apiServices.analysis.getAll(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  // Get analysis by ID
  useGetById: (id: string) => {
    return useQuery({
      queryKey: queryKeys.analysis.byId(id),
      queryFn: () => apiServices.analysis.getById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  // Create analysis mutation
  useCreate: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (data: AnalysisRequest) => apiServices.analysis.create(data),
      onSuccess: (data) => {
        // Invalidate and refetch analyses
        queryClient.invalidateQueries({ queryKey: queryKeys.analysis.all });
        toast.success('Analysis created successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to create analysis';
        toast.error(message);
      },
    });
  },

  // Update analysis mutation
  useUpdate: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<AnalysisRequest> }) =>
        apiServices.analysis.update(id, data),
      onSuccess: (data, variables) => {
        // Update the specific analysis in cache
        queryClient.invalidateQueries({ queryKey: queryKeys.analysis.byId(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.analysis.all });
        toast.success('Analysis updated successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update analysis';
        toast.error(message);
      },
    });
  },

  // Delete analysis mutation
  useDelete: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (id: string) => apiServices.analysis.delete(id),
      onSuccess: (data, id) => {
        // Remove from cache
        queryClient.removeQueries({ queryKey: queryKeys.analysis.byId(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.analysis.all });
        toast.success('Analysis deleted successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to delete analysis';
        toast.error(message);
      },
    });
  },
};

// User hooks
export const useUser = {
  // Get user profile
  useProfile: () => {
    return useQuery({
      queryKey: queryKeys.user.profile,
      queryFn: () => apiServices.user.getProfile(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },

  // Update user profile mutation
  useUpdateProfile: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (data: any) => apiServices.user.updateProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
        toast.success('Profile updated successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      },
    });
  },
};

// Health check hook
export const useHealth = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiServices.health.check(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Export all hooks for convenience
export const useApi = {
  analysis: useAnalysis,
  user: useUser,
  health: useHealth,
};