import axios from 'axios'
import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleListResponse,
  FactorVerifyRequest,
  FactorVerifyResponse,
  RefreshResponse,
  RegisterRequest,
  ActivateRequest,
  CurrentUserResponse,
  ChangePasswordRequest,
  EnrollTOTPRequest,
  EnrollTOTPResponse,
  ActivateTOTPRequest,
  DisableTOTPRequest,
} from '@/types/api'
import { decodeToken } from '@/utils/jwt'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Constants for token refresh coordination
const REFRESH_LOCK_KEY = 'token_refresh_lock'
const LOCK_CHECK_INTERVAL = 100 // Check every 100ms
const MAX_LOCK_CHECKS = 50 // Maximum number of attempts

// Refresh lock functions
function isLockTaken(): boolean {
  const lockData = localStorage.getItem(REFRESH_LOCK_KEY)
  if (!lockData) return false

  try {
    const parsed = JSON.parse(lockData)
    return parsed.expiry > Date.now()
  } catch (error) {
    console.error('[API] Error parsing lock data:', error)
    return false
  }
}

function waitForLockRelease(): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0

    const checkLock = () => {
      if (!isLockTaken() || attempts >= MAX_LOCK_CHECKS) {
        resolve()
        return
      }

      attempts++
      setTimeout(checkLock, LOCK_CHECK_INTERVAL)
    }

    checkLock()
  })
}

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
    // and the request is not to the refresh endpoint or login or factor verify endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/authn/refresh') &&
      !originalRequest.url?.includes('/login') &&
      !originalRequest.url?.includes('/authn/factor_verify')
    ) {
      originalRequest._retry = true

      // Before refreshing, check if another tab is already refreshing
      if (isLockTaken()) {
        console.log('[API] Token refresh lock is taken, waiting for other tab to complete')
        await waitForLockRelease()

        // After waiting, check if token was updated in localStorage
        const freshToken = localStorage.getItem('access_token')
        if (freshToken) {
          // Verify the fresh token is still valid and not expired
          const decoded = decodeToken(freshToken)
          if (decoded && decoded.exp) {
            const expiresAtMs = decoded.exp * 1000
            const nowMs = Date.now()
            const timeUntilExpiryMs = expiresAtMs - nowMs

            // If token expires in more than 30 seconds, use it
            if (timeUntilExpiryMs > 30000) {
              console.log('[API] Token was updated by another tab, using new token')
              originalRequest.headers.Authorization = `Bearer ${freshToken}`
              return api(originalRequest)
            } else {
              console.log(
                '[API] Fresh token expires too soon, proceeding with refresh',
              )
            }
          }
        }
      }

      try {
        // Direct API call to refresh token (cookie automatically sent)
        const response = await api.post<RefreshResponse>('/authn/refresh')
        const newToken = response.data.access_token

        // Update token in localStorage
        localStorage.setItem('access_token', newToken)

        // Manually dispatch storage event to sync current tab with auth store
        // (storage events don't fire in the tab that made the change)
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'access_token',
            newValue: newToken,
            oldValue: localStorage.getItem('access_token'),
            url: window.location.href,
            storageArea: localStorage,
          }),
        )

        console.log('[API] Token refreshed successfully, dispatched storage event')

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError: unknown) {
        console.error('[API] Token refresh failed:', refreshError)

        // Type guard for axios error
        const isAxiosError = (error: unknown): error is { response?: { status: number } } => {
          return typeof error === 'object' && error !== null && 'response' in error
        }

        // Check if it's a network error or auth error
        const isNetworkError = !isAxiosError(refreshError) || !refreshError.response
        const isAuthError = isAxiosError(refreshError) &&
          (refreshError.response?.status === 401 || refreshError.response?.status === 403)

        if (isAuthError) {
          // Auth errors mean session is truly invalid, clear token
          console.log('[API] Auth error during refresh, clearing token')
          localStorage.removeItem('access_token')
          // Dispatch event to notify auth store to clear state
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: 'access_token',
              newValue: null,
              oldValue: localStorage.getItem('access_token'),
              url: window.location.href,
              storageArea: localStorage,
            }),
          )
        } else if (isNetworkError) {
          // Network errors might be temporary, don't clear auth state
          console.warn('[API] Network error during refresh, keeping token for retry')
        } else if (isAxiosError(refreshError)) {
          // Other errors (5xx, etc), keep token but log error
          console.warn('[API] Server error during refresh:', refreshError.response?.status)
        }

        // Let the error propagate so caller can handle it
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
    // This endpoint may return JWT tokens or 4xx errors (400,401,429); resolve all <500 statuses so OTP errors don't throw
    const response = await api.post<FactorVerifyResponse>('/authn/factor_verify', data, {
      validateStatus: (status) => status < 500,
    })
    return response // Return the full Axios response including status and headers
  },

  getCurrentUser: async () => {
    const response = await api.get<CurrentUserResponse>('/user')
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

  // User Registration
  register: async (data: RegisterRequest) => {
    // The API returns 201 Created on success with no body, or error codes.
    // We'll return the full response to allow the store to check the status code.
    const response = await api.post('/register', data)
    return response
  },

  // Account Activation
  activate: async (data: ActivateRequest) => {
    // The API returns 200 OK on success or error codes.
    // We'll return the full response to allow the store to check the status code.
    const response = await api.post('/activate', data)
    return response
  },

  // Security/Account Management
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.put('/user/password', data)
    return response
  },

  enrollTOTP: async (data: EnrollTOTPRequest) => {
    const response = await api.post<EnrollTOTPResponse>('/user/2fa/enroll', data)
    return response.data
  },

  activateTOTP: async (data: ActivateTOTPRequest) => {
    const response = await api.post('/user/2fa/activate', data)
    return response
  },

  disableTOTP: async (data: DisableTOTPRequest) => {
    const response = await api.post('/user/2fa/disable', data)
    return response
  },
}

export default apiService
