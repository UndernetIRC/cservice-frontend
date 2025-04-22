<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background pt-12 pb-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 p-10 bg-slate-800 rounded-xl shadow-2xl">
      <div class="flex flex-row items-center justify-center mb-6 space-x-3">
        <!-- Logo Link to Landing Page -->
        <router-link to="/">
          <img src="/images/logo.png" alt="UnderNET Logo" class="h-12 w-auto" />
        </router-link>
        <h1 class="text-xl font-semibold text-text-secondary">UnderNET Cservice</h1>
      </div>
      <div>
        <h2
          v-if="!hasMfaStarted"
          class="text-center text-3xl font-bold tracking-tight text-text-primary"
        >
          Sign in to UnderNET Portal
        </h2>
        <h2 v-else class="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
          Enter Verification Code
        </h2>
      </div>

      <!-- Standard Login Form -->
      <form v-if="!hasMfaStarted" class="mt-8 space-y-8" @submit.prevent="handleLoginSubmit">
        <!-- Username Field -->
        <div>
          <BaseInput
            id="username"
            v-model="username"
            label="Username"
            type="text"
            autocomplete="username"
            required
          />
        </div>

        <!-- Password Field -->
        <div>
          <BaseInput
            id="password"
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            required
            data-com-onepassword-filled=""
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-primary bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
          >
            <!-- Lock Icon -->
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors duration-150 ease-in-out"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>

      <!-- Sign Up Link -->
      <div v-if="!hasMfaStarted" class="text-sm text-center">
        <span class="text-text-secondary">Don't have an account? </span>
        <router-link
          to="/signup"
          class="font-medium blue-link transition-colors duration-150 ease-in-out"
        >
          Sign up
        </router-link>
      </div>

      <!-- MFA Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleMfaSubmit">
        <p class="text-center text-sm text-text-secondary">
          Enter the code from your authenticator app.
        </p>

        <!-- MFA Input Field -->
        <div>
          <BaseInput
            id="otp"
            v-model="otpCode"
            label="6-digit code"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="one-time-code"
            required
            :error="otpError"
          />
          <p v-if="otpError" class="mt-1 text-xs text-red-400">{{ otpError }}</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-primary bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
          >
            {{ isLoading ? 'Verifying...' : 'Verify Code' }}
          </button>
        </div>
      </form>

      <!-- Common Error Display (Should now only show non-OTP errors) -->
      <div v-if="error" class="text-red-400 text-sm text-center mt-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const { error, isLoading, isMfaRequired } = storeToRefs(authStore)

const username = ref('')
const password = ref('')
const otpCode = ref('')
const otpError = ref('')

const hasMfaStarted = ref(false)
watch(isMfaRequired, (value) => {
  if (value) {
    hasMfaStarted.value = true
  }
})

// Watcher to clear OTP error when user types
watch(otpCode, () => {
  if (otpError.value) {
    otpError.value = ''
  }
})

const handleLoginSubmit = async () => {
  const success = await authStore.login({
    username: username.value,
    password: password.value,
  })

  if (success && !isMfaRequired.value) {
    router.push('/dashboard')
  }
}

const handleMfaSubmit = async () => {
  otpError.value = '' // Clear previous inline OTP error
  authStore.clearError() // Clear previous global error

  const otpValue = otpCode.value.trim()

  // Client-side validation
  if (!otpValue) {
    otpError.value = 'Please enter the 6-digit code.'
    return
  }
  if (!/^\d{6}$/.test(otpValue)) {
    // Check for exactly 6 digits
    otpError.value = 'Code must be exactly 6 digits.'
    return
  }

  const success = await authStore.verifyMfa(otpValue) // Use trimmed value

  if (success) {
    router.push('/dashboard')
  } else {
    // If verifyMfa failed, assume the error message belongs to the OTP input
    otpError.value = error.value || 'Invalid code or verification failed.' // Copy error from store to local state
    authStore.clearError() // Clear the global error state immediately
    otpCode.value = '' // Clear the input field for retry
  }
}
</script>
