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
    const rawToken = localStorage.getItem('access_token')
    // No token means not authenticated
    if (!rawToken) {
      isAuthCheckComplete.value = true
      return false
    }

    // Always attempt a silent refresh to validate refresh token cookie
    try {
      const response = await apiService.refreshToken()
      const newToken = (response.data as JwtResponse).access_token
      localStorage.setItem('access_token', newToken)
      accessToken.value = newToken
    } catch {
      clearAuth()
      isAuthCheckComplete.value = true
      return false
    }

    // If user info already fetched, skip re-fetch
    if (isAuthenticated.value && userInfo.value) {
      isAuthCheckComplete.value = true
      return true
    }

    try {
      // Fetch user info and mark authenticated
      await fetchUserInfo()
      return isAuthenticated.value
    } catch {
      clearAuth()
      return false
    } finally {
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
    if (!mfaStateToken.value || isMfaTokenExpired.value) {
      error.value = 'MFA session expired or invalid. Please log in again.'
      clearAuth() // Clear everything including MFA state
      return false
    }

    isLoading.value = true
    error.value = null // Clear previous errors specifically for MFA step

    try {
      const requestData: FactorVerifyRequest = {
        state_token: mfaStateToken.value,
        otp: otp,
      }
      const response = await apiService.factorVerify(requestData)
      const jwtData = response.data as JwtResponse // Should be JwtResponse on success

      setAuthentication(jwtData)
      await fetchUserInfo()
      console.log('MFA verification successful, tokens set.')
      return true // Indicate successful verification and login
    } catch (err) {
      const axiosError = err as ApiError
      console.error('MFA verification failed:', axiosError)
      // Keep MFA state if it's just an invalid OTP (401), otherwise clear?
      // For now, let's keep the state token valid for retries on 401.
      if (axiosError.response?.status === 401) {
        error.value = axiosError.response?.data?.message || 'Invalid OTP code. Please try again.'
      } else {
        error.value = axiosError.response?.data?.message || 'MFA verification failed.'
        // Consider clearing auth completely for non-401 errors during MFA
        // clearAuth();
      }
      return false // Indicate MFA verification failure
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
    // No need to check isAuthenticated here, called internally after auth or by checkAuth
    isLoading.value = true
    error.value = null // Clear previous errors before fetching

    try {
      const data = await apiService.getMe()

      // Always get admin level from JWT token since it's not in /me response
      const token = localStorage.getItem('access_token')
      if (token) {
        const decoded = decodeToken(token)
        if (decoded && decoded.adm !== undefined) {
          data.admin_level = decoded.adm
          // console.log('Admin level from JWT token:', decoded.adm)
        } else {
          console.warn('No admin level (adm) found in JWT token')
        }
      } else {
        console.warn('No access token found for fetchUserInfo')
        // If no token, we shouldn't be able to fetch user info (API should 401)
        // Throw an error to be caught below, ensuring clean-up
        throw new Error('No access token available for fetching user info.')
      }

      userInfo.value = data
      isAuthenticated.value = true // Mark as authenticated *after* successful fetch
      console.log('Updated user info with admin level:', userInfo.value)
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
  }
})
