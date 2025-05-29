<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Password Change Section -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update your password to keep your account secure.
        </p>
      </div>
      <div class="p-6">
        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <div>
            <BaseInput
              id="current-password"
              v-model="passwordForm.currentPassword"
              label="Current Password"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>
          <div>
            <BaseInput
              id="new-password"
              v-model="passwordForm.newPassword"
              label="New Password (min 10 characters)"
              type="password"
              autocomplete="new-password"
              required
              :error="passwordErrors.newPassword"
            />
            <p v-if="passwordErrors.newPassword" class="mt-1 text-xs text-red-400">
              {{ passwordErrors.newPassword }}
            </p>
          </div>
          <div>
            <BaseInput
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              label="Confirm New Password"
              type="password"
              autocomplete="new-password"
              required
              :error="passwordErrors.confirmPassword"
            />
            <p v-if="passwordErrors.confirmPassword" class="mt-1 text-xs text-red-400">
              {{ passwordErrors.confirmPassword }}
            </p>
          </div>
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="securityStore.isLoading || !isPasswordFormValid"
              class="group relative flex justify-center py-3 px-4 border border-primary bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
            >
              {{ securityStore.isLoading ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Two-Factor Authentication Section -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Two-Factor Authentication
            </h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account with TOTP.
            </p>
          </div>
          <div class="flex items-center">
            <span
              :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                userInfo?.totp_enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
              ]"
            >
              {{ userInfo?.totp_enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>
      </div>
      <div class="p-6">
        <!-- 2FA Disabled State -->
        <div v-if="!userInfo?.totp_enabled && !securityStore.isEnrolling" class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Two-factor authentication is currently disabled. Enable it to add an extra layer of
                security to your account.
              </p>
            </div>
          </div>
          <form @submit.prevent="handleTOTPEnrollment" class="space-y-4">
            <div>
              <BaseInput
                id="totp-current-password"
                v-model="totpForm.currentPassword"
                label="Current Password"
                type="password"
                autocomplete="current-password"
                required
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter your current password to enable 2FA
              </p>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="securityStore.isLoading || !totpForm.currentPassword"
                class="group relative flex justify-center py-3 px-4 border border-green-600 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
              >
                {{ securityStore.isLoading ? 'Setting up...' : 'Enable 2FA' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 2FA Enrollment State -->
        <div
          v-else-if="securityStore.isEnrolling && securityStore.totpEnrollmentData"
          class="space-y-6"
        >
          <div class="text-center">
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Set up your authenticator app
            </h4>
            <div class="bg-white p-4 rounded-lg border border-gray-200 inline-block mb-4">
              <img
                :src="qrCodeDataUri"
                alt="QR Code for 2FA setup"
                class="w-48 h-48 mx-auto"
                @error="handleQrCodeError"
                @load="handleQrCodeLoad"
              />
              <!-- Debug info (remove in production) -->
              <div v-if="isDev" class="mt-2 text-xs text-gray-500 break-all">
                <p>
                  <strong>QR Data Length:</strong>
                  {{ securityStore.totpEnrollmentData?.qr_code_base64?.length || 0 }}
                </p>
                <p>
                  <strong>First 50 chars:</strong>
                  {{ securityStore.totpEnrollmentData?.qr_code_base64?.substring(0, 50) }}...
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p class="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                {{ securityStore.totpEnrollmentData.secret }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manual entry code (if you can't scan the QR code)
              </p>
            </div>
          </div>

          <form @submit.prevent="handleTOTPActivation" class="space-y-4">
            <div>
              <BaseInput
                id="otp-code"
                v-model="totpForm.otpCode"
                label="6-digit verification code"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                required
                :class="'text-center text-lg tracking-widest'"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            <div class="flex justify-between">
              <button
                type="button"
                @click="securityStore.cancelTOTPEnrollment"
                class="group relative flex justify-center py-3 px-4 border border-gray-300 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-gray-500 transition-all duration-150 ease-in-out shadow hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="
                  securityStore.isLoading || !totpForm.otpCode || totpForm.otpCode.length !== 6
                "
                class="group relative flex justify-center py-3 px-4 border border-green-600 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
              >
                {{ securityStore.isLoading ? 'Activating...' : 'Activate 2FA' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 2FA Enabled State -->
        <div v-else-if="userInfo?.totp_enabled" class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Two-factor authentication is currently enabled. You'll need your authenticator app
                to sign in.
              </p>
            </div>
          </div>

          <!-- Warning Panel (Informational Only) -->
          <div
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-4"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Disable Two-Factor Authentication
                </h3>
                <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    Disabling 2FA will reduce your account security. You'll need your current
                    password and a code from your authenticator app to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Disable 2FA Form (Separate) -->
          <form @submit.prevent="handleTOTPDisable" class="space-y-4">
            <div>
              <BaseInput
                id="disable-current-password"
                v-model="disableTotpForm.currentPassword"
                label="Current password"
                type="password"
                autocomplete="current-password"
                required
              />
            </div>
            <div>
              <BaseInput
                id="disable-otp-code"
                v-model="disableTotpForm.otpCode"
                label="6-digit code"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                required
                :class="'text-center tracking-widest'"
              />
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="
                  securityStore.isLoading ||
                  !disableTotpForm.currentPassword ||
                  !disableTotpForm.otpCode ||
                  disableTotpForm.otpCode.length !== 6
                "
                class="group relative flex justify-center py-3 px-4 border border-red-600 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
              >
                {{ securityStore.isLoading ? 'Disabling...' : 'Disable 2FA' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div
      v-if="securityStore.error"
      class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800 dark:text-red-200">{{ securityStore.error }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="securityStore.success"
      class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800 dark:text-green-200">{{ securityStore.success }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useSecurityStore } from '@/stores/security'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useDebounceFn } from '@vueuse/core'

const securityStore = useSecurityStore()
const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

// Password change form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Password validation errors
const passwordErrors = reactive({
  newPassword: '',
  confirmPassword: '',
})

// TOTP forms
const totpForm = ref({
  currentPassword: '',
  otpCode: '',
})

const disableTotpForm = ref({
  currentPassword: '',
  otpCode: '',
})

// Password validation functions
function validateNewPassword(password: string) {
  if (password.length === 0) {
    passwordErrors.newPassword = ''
    return
  }
  if (password.length < 10) {
    passwordErrors.newPassword = 'Password must be at least 10 characters long.'
  } else if (password.length > 72) {
    passwordErrors.newPassword = 'Password must not exceed 72 characters.'
  } else {
    passwordErrors.newPassword = ''
  }

  // Re-validate confirm password if it's not empty
  if (passwordForm.value.confirmPassword) {
    validateConfirmPassword(passwordForm.value.confirmPassword)
  }
}

function validateConfirmPassword(confirmPassword: string) {
  if (confirmPassword.length === 0) {
    passwordErrors.confirmPassword = ''
    return
  }
  if (confirmPassword !== passwordForm.value.newPassword) {
    passwordErrors.confirmPassword = 'Passwords do not match.'
  } else {
    passwordErrors.confirmPassword = ''
  }
}

// Debounced validation
const debouncedValidateNewPassword = useDebounceFn(validateNewPassword, 500)
const debouncedValidateConfirmPassword = useDebounceFn(validateConfirmPassword, 500)

// Watch form changes for validation
watch(
  () => passwordForm.value.newPassword,
  (newVal) => {
    passwordErrors.newPassword = ''
    debouncedValidateNewPassword(newVal)
  },
)

watch(
  () => passwordForm.value.confirmPassword,
  (newVal) => {
    passwordErrors.confirmPassword = ''
    debouncedValidateConfirmPassword(newVal)
  },
)

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword.length >= 10 &&
    passwordForm.value.newPassword.length <= 72 &&
    !passwordErrors.newPassword &&
    !passwordErrors.confirmPassword
  )
})

async function handlePasswordChange() {
  if (!isPasswordFormValid.value) return

  const success = await securityStore.changePassword({
    current_password: passwordForm.value.currentPassword,
    new_password: passwordForm.value.newPassword,
    confirm_password: passwordForm.value.confirmPassword,
  })

  if (success) {
    // Clear form on success
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
    // Clear validation errors
    passwordErrors.newPassword = ''
    passwordErrors.confirmPassword = ''
  }
}

async function handleTOTPEnrollment() {
  if (!totpForm.value.currentPassword) return

  await securityStore.enrollTOTP({
    current_password: totpForm.value.currentPassword,
  })

  // Clear password but keep form for OTP entry
  totpForm.value.currentPassword = ''
}

async function handleTOTPActivation() {
  if (!totpForm.value.otpCode || totpForm.value.otpCode.length !== 6) return

  const success = await securityStore.activateTOTP({
    otp_code: totpForm.value.otpCode,
  })

  if (success) {
    // Clear form and refresh user info
    totpForm.value = {
      currentPassword: '',
      otpCode: '',
    }
    await authStore.fetchUserInfo()
  }
}

async function handleTOTPDisable() {
  if (
    !disableTotpForm.value.currentPassword ||
    !disableTotpForm.value.otpCode ||
    disableTotpForm.value.otpCode.length !== 6
  )
    return

  const success = await securityStore.disableTOTP({
    current_password: disableTotpForm.value.currentPassword,
    otp_code: disableTotpForm.value.otpCode,
  })

  if (success) {
    // Clear form and refresh user info
    disableTotpForm.value = {
      currentPassword: '',
      otpCode: '',
    }
    await authStore.fetchUserInfo()
  }
}

const qrCodeDataUri = computed(() => {
  if (!securityStore.totpEnrollmentData || !securityStore.totpEnrollmentData.qr_code_base64) {
    return ''
  }

  const base64Data = securityStore.totpEnrollmentData.qr_code_base64

  // Check if the base64 data already includes the data URI prefix
  if (base64Data.startsWith('data:')) {
    return base64Data
  }

  // Add the data URI prefix for PNG images
  return `data:image/png;base64,${base64Data}`
})

function handleQrCodeError(event: Event) {
  console.error('Error loading QR code:', event)
  console.error(
    'QR code data:',
    securityStore.totpEnrollmentData?.qr_code_base64?.substring(0, 100),
  )
}

function handleQrCodeLoad(event: Event) {
  console.log('QR code loaded successfully')
}

const isDev = computed(() => {
  return import.meta.env.DEV
})

onMounted(() => {
  // Clear any previous messages when component mounts
  securityStore.clearMessages()
})
</script>
