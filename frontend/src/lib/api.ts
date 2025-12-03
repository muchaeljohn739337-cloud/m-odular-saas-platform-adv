import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

// ==========================================
// API Client Configuration
// ==========================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ==========================================
// Create Axios Instance
// ==========================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// Request Interceptor
// ==========================================

api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// Response Interceptor
// ==========================================

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// API Helper Functions
// ==========================================

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

// ==========================================
// Auth API
// ==========================================

export const authApi = {
  login: (email: string, password: string) =>
    post<{ token: string; user: unknown }>("/auth/login", { email, password }),
  register: (data: { email: string; password: string; name: string }) =>
    post<{ token: string; user: unknown }>("/auth/register", data),
  logout: () => post("/auth/logout"),
  me: () => get<{ user: unknown }>("/auth/me"),
  refresh: () => post<{ token: string }>("/auth/refresh"),
};

// ==========================================
// User API
// ==========================================

export const userApi = {
  getProfile: () => get<{ user: unknown }>("/users/profile"),
  updateProfile: (data: unknown) => patch("/users/profile", data),
  changePassword: (oldPassword: string, newPassword: string) =>
    post("/users/change-password", { oldPassword, newPassword }),
};

// ==========================================
// Blog API
// ==========================================

export const blogApi = {
  list: (params?: { page?: number; limit?: number }) =>
    get<{ posts: unknown[]; total: number }>("/blog", { params }),
  get: (id: string) => get<{ post: unknown }>(`/blog/${id}`),
  create: (data: unknown) => post<{ post: unknown }>("/blog", data),
  update: (id: string, data: unknown) => put(`/blog/${id}`, data),
  delete: (id: string) => del(`/blog/${id}`),
};

// ==========================================
// AI API
// ==========================================

export const aiApi = {
  generate: (prompt: string, options?: unknown) =>
    post<{ result: string }>("/ai/generate", { prompt, ...options }),
  summarize: (content: string) =>
    post<{ summary: string }>("/ai/summarize", { content }),
  seo: (content: string) =>
    post<{ keywords: string[]; meta: string }>("/ai/seo", { content }),
};

export default api;
