import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiService from '@/services/api'
import type {
  ChangePasswordRequest,
  EnrollTOTPRequest,
  EnrollTOTPResponse,
  ActivateTOTPRequest,
  DisableTOTPRequest,
} from '@/types/api'
import type { ApiError } from '@/types/auth'

export const useSecurityStore = defineStore('security', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  // 2FA Enrollment state
  const totpEnrollmentData = ref<EnrollTOTPResponse | null>(null)
  const isEnrolling = ref(false)

  function clearMessages() {
    error.value = null
    success.value = null
  }

  async function changePassword(data: ChangePasswordRequest): Promise<boolean> {
    isLoading.value = true
    clearMessages()

    try {
      await apiService.changePassword(data)
      success.value = 'Password changed successfully'
      return true
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message || 'Failed to change password'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function enrollTOTP(data: EnrollTOTPRequest): Promise<boolean> {
    isLoading.value = true
    clearMessages()

    try {
      const response = await apiService.enrollTOTP(data)
      totpEnrollmentData.value = response
      isEnrolling.value = true
      success.value =
        'TOTP enrollment initiated. Please scan the QR code and enter the verification code.'
      return true
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message || 'Failed to enroll TOTP'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function activateTOTP(data: ActivateTOTPRequest): Promise<boolean> {
    isLoading.value = true
    clearMessages()

    try {
      await apiService.activateTOTP(data)
      success.value = '2FA has been successfully activated'
      // Clear enrollment data after successful activation
      totpEnrollmentData.value = null
      isEnrolling.value = false
      return true
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message || 'Failed to activate TOTP'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function disableTOTP(data: DisableTOTPRequest): Promise<boolean> {
    isLoading.value = true
    clearMessages()

    try {
      await apiService.disableTOTP(data)
      success.value = '2FA has been successfully disabled'
      return true
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message || 'Failed to disable TOTP'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function cancelTOTPEnrollment() {
    totpEnrollmentData.value = null
    isEnrolling.value = false
    clearMessages()
  }

  return {
    // State
    isLoading,
    error,
    success,
    totpEnrollmentData,
    isEnrolling,

    // Actions
    clearMessages,
    changePassword,
    enrollTOTP,
    activateTOTP,
    disableTOTP,
    cancelTOTPEnrollment,
  }
})
