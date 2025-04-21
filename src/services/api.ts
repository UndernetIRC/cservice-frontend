import axios from 'axios'
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  LogoutRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleListResponse,
  FactorVerifyRequest,
  FactorVerifyResponse,
  RefreshResponse,
} from '@/types/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't add Authorization header for login or factor verify requests
    if (config.url?.includes('/login') || config.url?.includes('/authn/factor_verify')) {
      return config
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh token yet
    // and the request is not to the refresh endpoint or login endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/authn/refresh') &&
      !originalRequest.url?.includes('/login')
    ) {
      originalRequest._retry = true

      try {
        // Direct API call to refresh token
        const response = await api.post<RefreshResponse>('/authn/refresh')
        const newToken = response.data.access_token

        // Update token in localStorage
        localStorage.setItem('access_token', newToken)

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear token
        localStorage.removeItem('access_token')
        // Let the auth store handle the redirect
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// API methods
const apiService = {
  login: async (data: LoginRequest) => {
    // Return the full AxiosResponse to access headers/status if needed later
    const response = await api.post<LoginResponse>('/login', data)
    return response // Return the whole response object
  },

  logout: async (data: LogoutRequest) => {
    const response = await api.post('/logout', data)
    return response
  },

  factorVerify: async (data: FactorVerifyRequest) => {
    // This endpoint returns JWT tokens on success
    const response = await api.post<FactorVerifyResponse>('/authn/factor_verify', data)
    return response // Return the whole response object
  },

  getMe: async () => {
    const response = await api.get<MeResponse>('/me')
    return response.data
  },

  refreshToken: async () => {
    // Call refresh endpoint, returns JSON with access_token and refresh_token
    const response = await api.post<RefreshResponse>('/authn/refresh')
    return response
  },

  // Role Management
  getRoles: async () => {
    const response = await api.get<RoleListResponse>('/admin/roles')
    return response.data.roles
  },

  createRole: async (data: CreateRoleRequest) => {
    const response = await api.post<Role>('/admin/roles', data)
    return response.data
  },

  updateRole: async (id: number, data: UpdateRoleRequest) => {
    const response = await api.put<Role>(`/admin/roles/${id}`, data)
    return response.data
  },

  deleteRole: async (id: number) => {
    await api.delete(`/admin/roles/${id}`)
  },
}

export default apiService
