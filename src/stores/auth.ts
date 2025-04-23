import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import apiService from '@/services/api'
import type {
  LoginRequest,
  MeResponse,
  JwtResponse,
  MfaRequiredResponse,
  FactorVerifyRequest,
  ApiError,
  RegisterRequest,
} from '@/types/api'
import { decodeToken } from '@/utils/jwt'
import { useTimeoutFn } from '@vueuse/core'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const userInfo = ref<MeResponse | null>(null)
  const isAuthenticated = ref(false)
  const isAuthCheckComplete = ref(false)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  // MFA State
  const isMfaRequired = ref(false)
  const mfaStateToken = ref<string | null>(null)
  const mfaExpiresAt = ref<string | null>(null)
  const mfaErrorStatus = ref<number | null>(null)
  const mfaRateLimitReset = ref<number | null>(null)

  const isAdmin = computed(() => {
    return (userInfo.value?.admin_level ?? 0) >= 800
  })

  const mfaTokenExpiryTime = computed(() => {
    return mfaExpiresAt.value ? new Date(mfaExpiresAt.value) : null
  })

  const isMfaTokenExpired = computed(() => {
    const expiry = mfaTokenExpiryTime.value
    return expiry ? expiry.getTime() <= Date.now() : false
  })

  // track access token for auto-refresh scheduling
  const accessToken = ref<string | null>(localStorage.getItem('access_token'))
  let refreshTimer: ReturnType<typeof useTimeoutFn> | null = null

  // call refresh endpoint and update access token
  async function refreshAccessToken() {
    try {
      const response = await apiService.refreshToken()
      const newToken = (response.data as JwtResponse).access_token
      localStorage.setItem('access_token', newToken)
      accessToken.value = newToken
    } catch {
      clearAuth()
    }
  }

  // schedule background refresh when token is near expiry (60-90s before)
  watch(
    accessToken,
    (token) => {
      if (refreshTimer) {
        refreshTimer.stop()
        refreshTimer = null
      }

      if (token) {
        const decoded = decodeToken(token)
        if (decoded && decoded.exp) {
          const expiresAtMs = decoded.exp * 1000
          const nowMs = Date.now()
          const offsetSeconds = 60 + Math.random() * 30
          const delayMs = expiresAtMs - nowMs - offsetSeconds * 1000

          if (delayMs > 0) {
            refreshTimer = useTimeoutFn(refreshAccessToken, delayMs)
            refreshTimer.start()
          } else {
            refreshAccessToken()
          }
        }
      }
    },
    { immediate: true },
  )

  function clearAuth() {
    userInfo.value = null
    isAuthenticated.value = false
    error.value = null
    isMfaRequired.value = false // Clear MFA state
    mfaStateToken.value = null
    mfaExpiresAt.value = null
    accessToken.value = null
    localStorage.removeItem('access_token')
  }

  // Helper to set JWT tokens and user info
  function setAuthentication(tokens: JwtResponse) {
    accessToken.value = tokens.access_token
    localStorage.setItem('access_token', tokens.access_token)
    isAuthenticated.value = true
    isMfaRequired.value = false // Clear MFA state on successful auth
    mfaStateToken.value = null
    mfaExpiresAt.value = null
  }

  async function checkAuth(): Promise<boolean> {
    isAuthCheckComplete.value = false
    console.log('[checkAuth] Starting auth check...')
    const rawToken = localStorage.getItem('access_token')

    if (!rawToken) {
      console.log('[checkAuth] No token found in localStorage.')
      isAuthCheckComplete.value = true
      return false
    }

    console.log('[checkAuth] Token found, attempting refresh...')
    try {
      await apiService.refreshToken()
      console.log('[checkAuth] Token refresh successful.')
    } catch (err) {
      console.error('[checkAuth] Token refresh failed:', err)
      clearAuth()
      isAuthCheckComplete.value = true
      return false
    }

    if (isAuthenticated.value && userInfo.value) {
      console.log('[checkAuth] User info already exists, skipping fetch.')
      isAuthCheckComplete.value = true
      return true
    }

    console.log('[checkAuth] Fetching user info...')
    try {
      await fetchUserInfo()
      console.log('[checkAuth] fetchUserInfo successful.')
      return isAuthenticated.value
    } catch {
      console.error('[checkAuth] fetchUserInfo failed after refresh.')
      return false
    } finally {
      console.log(`[checkAuth] Completed. isAuthCheckComplete: true`)
      isAuthCheckComplete.value = true
    }
  }

  async function login(credentials: LoginRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null
    isMfaRequired.value = false // Reset MFA state at the start of login
    mfaStateToken.value = null
    mfaExpiresAt.value = null

    try {
      const response = await apiService.login(credentials)
      const data = response.data

      // Check if MFA is required using a type guard
      if ('status' in data && data.status === 'MFA_REQUIRED') {
        const mfaData = data as MfaRequiredResponse
        isMfaRequired.value = true
        mfaStateToken.value = mfaData.state_token
        mfaExpiresAt.value = mfaData.expires_at
        console.log('MFA Required. State token set, expires at:', mfaExpiresAt.value)
        return false // Indicate login is not fully complete
      } else {
        // Assume it's JwtResponse if not MFA_REQUIRED
        const jwtData = data as JwtResponse
        setAuthentication(jwtData)
        await fetchUserInfo()
        console.log('Login successful, tokens set.')
        return true // Indicate successful login
      }
    } catch (err) {
      const axiosError = err as ApiError

      if (axiosError.response && axiosError.response.status === 401) {
        // Handle 401 (Invalid Credentials): Set error, but DO NOT clear auth state yet.
        error.value =
          axiosError.response.data?.message || 'Invalid username or password. Please try again.'
        // No clearAuth() here - allow user to see the error and retry.
      } else {
        // Handle other errors (network, server issues, etc.): Log, set error, and clear auth state.
        console.error('Login failed with unexpected error:', axiosError)
        error.value =
          axiosError.response?.data?.message || 'An unexpected error occurred during login.'
        clearAuth() // Clear auth state for unexpected errors.
      }

      return false // Indicate login failure (whether 401 or other error)
    } finally {
      isLoading.value = false
    }
  }

  async function verifyMfa(otp: string): Promise<boolean> {
    // Reset previous MFA error statuses
    mfaErrorStatus.value = null
    mfaRateLimitReset.value = null
    if (!mfaStateToken.value || isMfaTokenExpired.value) {
      // Client-side expired/invalid session
      mfaErrorStatus.value = 400
      error.value = 'MFA session expired or invalid. Please log in again.'
      clearAuth()
      return false
    }

    isLoading.value = true
    error.value = null
    try {
      const requestData: FactorVerifyRequest = {
        state_token: mfaStateToken.value!,
        otp,
      }
      // Treat 4xx statuses (400,401,429) as resolved so we can handle them manually
      const response = await apiService.factorVerify(requestData)
      const status = response.status
      mfaErrorStatus.value = status

      if (status === 200) {
        // Successful MFA verification
        const jwtData = response.data as JwtResponse
        setAuthentication(jwtData)
        await fetchUserInfo()
        console.log('MFA verification successful, tokens set.')
        return true
      }
      if (status === 400) {
        // Session expired/invalid: clear auth first, then set error so it persists
        clearAuth()
        error.value = 'MFA session expired or invalid. Please log in again.'
        return false
      }
      if (status === 401) {
        // Invalid OTP
        const dataResp = response.data as unknown
        let otpMsg = 'Invalid OTP code. Please try again.'
        if (
          typeof dataResp === 'object' &&
          dataResp !== null &&
          'message' in dataResp &&
          typeof (dataResp as { message: unknown }).message === 'string'
        ) {
          otpMsg = (dataResp as { message: string }).message
        }
        error.value = otpMsg
        return false
      }
      if (status === 429) {
        // Rate limited
        const resetHeader = response.headers['x-ratelimit-reset'] as string | undefined
        let resetTimestamp: number | null = null
        if (resetHeader) {
          const parsed = parseInt(resetHeader, 10)
          if (!isNaN(parsed)) {
            resetTimestamp = parsed
          } else {
            const date = new Date(resetHeader)
            if (!isNaN(date.getTime())) {
              resetTimestamp = Math.floor(date.getTime() / 1000)
            }
          }
        }
        mfaRateLimitReset.value = resetTimestamp
        if (resetTimestamp) {
          const date = new Date(resetTimestamp * 1000)
          const hh = String(date.getHours()).padStart(2, '0')
          const mm = String(date.getMinutes()).padStart(2, '0')
          const ss = String(date.getSeconds()).padStart(2, '0')
          error.value = `Too many attempts. Please wait until ${hh}:${mm}:${ss}.`
        } else {
          error.value = 'Too many attempts. Please wait and try again later.'
        }
        return false
      }
      // Other 2xx or unexpected 4xx statuses
      const otherResp = response.data as unknown
      let defaultMsg = 'MFA verification failed. Please try again.'
      if (
        typeof otherResp === 'object' &&
        otherResp !== null &&
        'message' in otherResp &&
        typeof (otherResp as { message: unknown }).message === 'string'
      ) {
        defaultMsg = (otherResp as { message: string }).message
      }
      error.value = defaultMsg
      return false
    } catch (err) {
      // Network/server errors
      console.error('Unexpected MFA error:', err)
      error.value = 'An unexpected error occurred. Please try again later.'
      clearAuth()
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    error.value = null // Clear previous errors
    const token = localStorage.getItem('access_token')

    try {
      // Attempt server-side logout only if a token exists
      if (token) {
        await apiService.logout({}) // Call API first
        console.log('Server logout successful')
      } else {
        console.log('No token found, skipping server logout.')
      }
    } catch (err) {
      const axiosError = err as ApiError
      console.error('Logout API call failed:', axiosError)
      // Set an error message, but proceed to clear local state regardless
      error.value =
        axiosError.response?.data?.message || 'Failed to logout from server. Local session cleared.'
      // Don't rethrow, as we want to ensure local cleanup happens
    } finally {
      clearAuth() // Always clear local state afterwards, regardless of API call success/failure
      isLoading.value = false
      // Redirect to landing page after logout
      router.push({ name: 'landing' })
    }
  }

  async function fetchUserInfo(): Promise<void> {
    isLoading.value = true
    error.value = null
    console.log('[fetchUserInfo] Starting fetch...')

    try {
      const data = await apiService.getMe()
      console.log('[fetchUserInfo] /me response received:', data)

      const token = localStorage.getItem('access_token')
      console.log('[fetchUserInfo] Token from localStorage:', token ? 'Present' : 'Missing')
      if (token) {
        const decoded = decodeToken(token)
        console.log('[fetchUserInfo] Decoded token payload:', decoded)

        if (decoded) {
          // Extract admin level if present
          if (decoded.adm !== undefined) {
            data.admin_level = decoded.adm
          } else {
            console.warn('[fetchUserInfo] No admin level (adm) found in JWT token')
          }

          // Extract scopes if present
          if (decoded.scp !== undefined) {
            data.scopes = decoded.scp
          } else {
            console.warn('[fetchUserInfo] No scopes (scp) found in JWT token')
          }
        } else {
          console.warn('[fetchUserInfo] Failed to decode JWT token')
        }
      } else {
        console.warn('[fetchUserInfo] No access token found in localStorage')
        throw new Error('No access token available for fetching user info.')
      }

      userInfo.value = data
      isAuthenticated.value = true
      console.log(
        '[fetchUserInfo] Final userInfo state set:',
        JSON.parse(JSON.stringify(userInfo.value)),
      )
    } catch (err) {
      const axiosError = err as ApiError
      console.error('Failed to fetch user info:', axiosError)
      error.value =
        axiosError.response?.data?.message ||
        'Failed to fetch user information. Session may be invalid.'
      clearAuth() // Critical: clear auth state if user info fetch fails
      throw err // Re-throw error so callers like checkAuth know it failed
    } finally {
      isLoading.value = false
    }
  }

  // Action to clear only the error state
  function clearError() {
    error.value = null
  }

  // Action for user registration
  async function register(registrationData: RegisterRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null // Clear previous errors

    try {
      const response = await apiService.register(registrationData)

      // Check for successful creation (status 201)
      if (response.status === 201) {
        console.log('Registration successful. Please check email for verification.')
        // No tokens are returned on registration, user needs to verify email and then login
        return true // Indicate successful API call
      } else {
        // Handle unexpected success codes if any
        console.warn('Registration API returned unexpected status:', response.status)
        error.value = `Registration failed with status: ${response.status}`
        return false
      }
    } catch (err) {
      const axiosError = err as ApiError
      console.error('Registration failed:', axiosError)
      error.value =
        axiosError.response?.data?.message ||
        'An error occurred during registration. Please check your input and try again.'
      return false // Indicate failure
    } finally {
      isLoading.value = false
    }
  }

  return {
    userInfo,
    isAuthenticated,
    error,
    isLoading,
    isAdmin,
    isMfaRequired, // Expose MFA state
    mfaStateToken, // Expose for potential display/debug, though not strictly needed by UI
    mfaExpiresAt, // Expose for potential display
    isMfaTokenExpired, // Expose computed property
    isAuthCheckComplete, // Expose completion flag
    login,
    logout,
    checkAuth,
    fetchUserInfo,
    verifyMfa, // Expose MFA verification action
    register, // Export register action
    clearError, // Export clearError action
    mfaErrorStatus, // Export MFA error status code
    mfaRateLimitReset, // Export MFA rate limit reset timestamp
  }
})
