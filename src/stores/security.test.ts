import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSecurityStore } from './security'
import apiService from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    changePassword: vi.fn(),
    enrollTOTP: vi.fn(),
    activateTOTP: vi.fn(),
    disableTOTP: vi.fn(),
  },
}))

describe('Security Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useSecurityStore()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.success).toBeNull()
      expect(store.totpEnrollmentData).toBeNull()
      expect(store.isEnrolling).toBe(false)
    })
  })

  describe('clearMessages', () => {
    it('should clear error and success messages', () => {
      const store = useSecurityStore()

      // Set some messages
      store.error = 'Test error'
      store.success = 'Test success'

      // Clear
      store.clearMessages()

      expect(store.error).toBeNull()
      expect(store.success).toBeNull()
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'oldpass123',
        new_password: 'newpass456',
        confirm_password: 'newpass456',
      }

      vi.mocked(apiService.changePassword).mockResolvedValue({} as Record<string, never>)

      const result = await store.changePassword(mockData)

      expect(result).toBe(true)
      expect(store.success).toBe('Password changed successfully')
      expect(store.error).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(apiService.changePassword).toHaveBeenCalledWith(mockData)
    })

    it('should handle API error', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'wrongpass',
        new_password: 'newpass456',
        confirm_password: 'newpass456',
      }

      const mockError = {
        response: {
          data: {
            message: 'Current password is incorrect',
          },
        },
      }

      vi.mocked(apiService.changePassword).mockRejectedValue(mockError)

      const result = await store.changePassword(mockData)

      expect(result).toBe(false)
      expect(store.error).toBe('Current password is incorrect')
      expect(store.success).toBeNull()
      expect(store.isLoading).toBe(false)
    })

    it('should handle API error without message', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'oldpass',
        new_password: 'newpass',
        confirm_password: 'newpass',
      }

      vi.mocked(apiService.changePassword).mockRejectedValue(new Error('Network error'))

      const result = await store.changePassword(mockData)

      expect(result).toBe(false)
      expect(store.error).toBe('Failed to change password')
      expect(store.success).toBeNull()
    })

    it('should set loading state during operation', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      }

      let loadingDuringCall = false

      vi.mocked(apiService.changePassword).mockImplementation(async () => {
        loadingDuringCall = store.isLoading
        return {} as Record<string, never>
      })

      await store.changePassword(mockData)

      expect(loadingDuringCall).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should clear previous messages before operation', async () => {
      const store = useSecurityStore()

      // Set previous messages
      store.error = 'Previous error'
      store.success = 'Previous success'

      vi.mocked(apiService.changePassword).mockResolvedValue({} as Record<string, never>)

      await store.changePassword({
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      })

      // Previous error should be cleared, new success should be set
      expect(store.success).toBe('Password changed successfully')
    })
  })

  describe('enrollTOTP', () => {
    it('should enroll TOTP successfully', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'mypassword123',
      }

      const mockResponse = {
        qr_code_base64: 'base64qrcode',
        secret: 'JBSWY3DPEHPK3PXP',
      }

      vi.mocked(apiService.enrollTOTP).mockResolvedValue(mockResponse)

      const result = await store.enrollTOTP(mockData)

      expect(result).toBe(true)
      expect(store.totpEnrollmentData).toEqual(mockResponse)
      expect(store.isEnrolling).toBe(true)
      expect(store.success).toBe(
        'TOTP enrollment initiated. Please scan the QR code and enter the verification code.',
      )
      expect(store.error).toBeNull()
      expect(apiService.enrollTOTP).toHaveBeenCalledWith(mockData)
    })

    it('should handle enrollment error', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'wrongpassword',
      }

      const mockError = {
        response: {
          data: {
            message: 'Incorrect password',
          },
        },
      }

      vi.mocked(apiService.enrollTOTP).mockRejectedValue(mockError)

      const result = await store.enrollTOTP(mockData)

      expect(result).toBe(false)
      expect(store.error).toBe('Incorrect password')
      expect(store.totpEnrollmentData).toBeNull()
      expect(store.isEnrolling).toBe(false)
    })

    it('should handle enrollment error without message', async () => {
      const store = useSecurityStore()

      vi.mocked(apiService.enrollTOTP).mockRejectedValue(new Error('Network error'))

      const result = await store.enrollTOTP({ current_password: 'pass' })

      expect(result).toBe(false)
      expect(store.error).toBe('Failed to enroll TOTP')
    })
  })

  describe('activateTOTP', () => {
    it('should activate TOTP successfully', async () => {
      const store = useSecurityStore()

      // Set enrollment data first
      store.totpEnrollmentData = {
        qr_code_base64: 'base64qrcode',
        secret: 'JBSWY3DPEHPK3PXP',
      }
      store.isEnrolling = true

      const mockData = {
        otp_code: '123456',
      }

      vi.mocked(apiService.activateTOTP).mockResolvedValue({} as Record<string, never>)

      const result = await store.activateTOTP(mockData)

      expect(result).toBe(true)
      expect(store.success).toBe('2FA has been successfully activated')
      expect(store.error).toBeNull()
      // Enrollment data should be cleared after successful activation
      expect(store.totpEnrollmentData).toBeNull()
      expect(store.isEnrolling).toBe(false)
      expect(apiService.activateTOTP).toHaveBeenCalledWith(mockData)
    })

    it('should handle activation error', async () => {
      const store = useSecurityStore()
      const mockData = {
        otp_code: '999999',
      }

      const mockError = {
        response: {
          data: {
            message: 'Invalid OTP code',
          },
        },
      }

      vi.mocked(apiService.activateTOTP).mockRejectedValue(mockError)

      const result = await store.activateTOTP(mockData)

      expect(result).toBe(false)
      expect(store.error).toBe('Invalid OTP code')
      expect(store.success).toBeNull()
    })

    it('should handle activation error without message', async () => {
      const store = useSecurityStore()

      vi.mocked(apiService.activateTOTP).mockRejectedValue(new Error('Network error'))

      const result = await store.activateTOTP({ otp_code: '123456' })

      expect(result).toBe(false)
      expect(store.error).toBe('Failed to activate TOTP')
    })

    it('should not clear enrollment data on activation failure', async () => {
      const store = useSecurityStore()

      const enrollmentData = {
        qr_code_base64: 'base64qrcode',
        secret: 'JBSWY3DPEHPK3PXP',
      }

      store.totpEnrollmentData = enrollmentData
      store.isEnrolling = true

      vi.mocked(apiService.activateTOTP).mockRejectedValue(new Error('Invalid OTP'))

      await store.activateTOTP({ otp_code: '123456' })

      // Enrollment data should still be there so user can retry
      expect(store.totpEnrollmentData).toEqual(enrollmentData)
      expect(store.isEnrolling).toBe(true)
    })
  })

  describe('disableTOTP', () => {
    it('should disable TOTP successfully', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'mypassword',
        otp_code: '123456',
      }

      vi.mocked(apiService.disableTOTP).mockResolvedValue({} as Record<string, never>)

      const result = await store.disableTOTP(mockData)

      expect(result).toBe(true)
      expect(store.success).toBe('2FA has been successfully disabled')
      expect(store.error).toBeNull()
      expect(apiService.disableTOTP).toHaveBeenCalledWith(mockData)
    })

    it('should handle disable error', async () => {
      const store = useSecurityStore()
      const mockData = {
        current_password: 'wrongpass',
        otp_code: '123456',
      }

      const mockError = {
        response: {
          data: {
            message: 'Incorrect password or OTP',
          },
        },
      }

      vi.mocked(apiService.disableTOTP).mockRejectedValue(mockError)

      const result = await store.disableTOTP(mockData)

      expect(result).toBe(false)
      expect(store.error).toBe('Incorrect password or OTP')
      expect(store.success).toBeNull()
    })

    it('should handle disable error without message', async () => {
      const store = useSecurityStore()

      vi.mocked(apiService.disableTOTP).mockRejectedValue(new Error('Network error'))

      const result = await store.disableTOTP({
        current_password: 'pass',
        otp_code: '123456',
      })

      expect(result).toBe(false)
      expect(store.error).toBe('Failed to disable TOTP')
    })
  })

  describe('cancelTOTPEnrollment', () => {
    it('should cancel TOTP enrollment and reset state', () => {
      const store = useSecurityStore()

      // Set enrollment state
      store.totpEnrollmentData = {
        qr_code_base64: 'base64qrcode',
        secret: 'JBSWY3DPEHPK3PXP',
      }
      store.isEnrolling = true
      store.error = 'Some error'
      store.success = 'Some success'

      store.cancelTOTPEnrollment()

      expect(store.totpEnrollmentData).toBeNull()
      expect(store.isEnrolling).toBe(false)
      expect(store.error).toBeNull()
      expect(store.success).toBeNull()
    })

    it('should work when no enrollment in progress', () => {
      const store = useSecurityStore()

      // No enrollment data
      expect(store.totpEnrollmentData).toBeNull()
      expect(store.isEnrolling).toBe(false)

      // Should not throw
      store.cancelTOTPEnrollment()

      expect(store.totpEnrollmentData).toBeNull()
      expect(store.isEnrolling).toBe(false)
    })
  })

  describe('Complete Enrollment Flow', () => {
    it('should handle complete TOTP enrollment flow', async () => {
      const store = useSecurityStore()

      // Step 1: Enroll
      const enrollResponse = {
        qr_code_base64: 'base64qrcode',
        secret: 'JBSWY3DPEHPK3PXP',
      }

      vi.mocked(apiService.enrollTOTP).mockResolvedValue(enrollResponse)

      const enrollResult = await store.enrollTOTP({ current_password: 'mypass' })

      expect(enrollResult).toBe(true)
      expect(store.isEnrolling).toBe(true)
      expect(store.totpEnrollmentData).toEqual(enrollResponse)

      // Step 2: Activate
      vi.mocked(apiService.activateTOTP).mockResolvedValue({} as Record<string, never>)

      const activateResult = await store.activateTOTP({ otp_code: '123456' })

      expect(activateResult).toBe(true)
      expect(store.isEnrolling).toBe(false)
      expect(store.totpEnrollmentData).toBeNull()
      expect(store.success).toBe('2FA has been successfully activated')
    })

    it('should handle enrollment cancellation flow', async () => {
      const store = useSecurityStore()

      // Start enrollment
      vi.mocked(apiService.enrollTOTP).mockResolvedValue({
        qr_code_base64: 'qr',
        secret: 'secret',
      })

      await store.enrollTOTP({ current_password: 'pass' })

      expect(store.isEnrolling).toBe(true)

      // Cancel
      store.cancelTOTPEnrollment()

      expect(store.isEnrolling).toBe(false)
      expect(store.totpEnrollmentData).toBeNull()
    })
  })

  describe('State Management', () => {
    it('should maintain loading state correctly across operations', async () => {
      const store = useSecurityStore()

      expect(store.isLoading).toBe(false)

      // Start operation
      const promise = store.changePassword({
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      })

      // Loading should be true immediately
      expect(store.isLoading).toBe(true)

      vi.mocked(apiService.changePassword).mockResolvedValue({} as Record<string, never>)

      await promise

      // Loading should be false after completion
      expect(store.isLoading).toBe(false)
    })

    it('should clear messages independently from enrollment state', () => {
      const store = useSecurityStore()

      store.totpEnrollmentData = { qr_code_base64: 'qr', secret: 'secret' }
      store.isEnrolling = true
      store.error = 'Error'
      store.success = 'Success'

      store.clearMessages()

      // Messages cleared
      expect(store.error).toBeNull()
      expect(store.success).toBeNull()

      // Enrollment state unchanged
      expect(store.totpEnrollmentData).not.toBeNull()
      expect(store.isEnrolling).toBe(true)
    })
  })
})
