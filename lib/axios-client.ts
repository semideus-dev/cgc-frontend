import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import env from '@/lib/env';


const axiosClient: AxiosInstance = axios.create({
    baseURL: env.apiUrl,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});


axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        if (env.apiUrl?.includes('ngrok')) {
            config.headers = config.headers || {};
            config.headers['ngrok-skip-browser-warning'] = 'true';
        }


        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {

                console.error('Authentication failed, redirecting to sign-in');
                if (typeof window !== 'undefined') {
                    window.location.href = '/sign-in';
                }
                return Promise.reject(error);
            } catch (refreshError) {
                console.error('Session refresh failed:', refreshError);
                return Promise.reject(refreshError);
            }
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        // Handle other HTTP errors
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        console.error('API Error:', {
            status: error.response?.status,
            message: errorMessage,
            url: error.config?.url,
        });

        return Promise.reject(error);
    }
);

// Helper functions for common HTTP methods (use these 95% of the time)
export const apiClient = {
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
        axiosClient.get(url, config),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
        axiosClient.post(url, data, config),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
        axiosClient.put(url, data, config),

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
        axiosClient.patch(url, data, config),

    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
        axiosClient.delete(url, config),
};

// Export raw client for advanced use cases (file uploads, custom configs, etc.)
// Only use this when helper functions aren't enough
export default axiosClient;