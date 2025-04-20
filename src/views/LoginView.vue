<template>
  <!-- Header: Logo Only -->
  <header class="w-full p-4 sm:p-6 md:p-8 absolute top-0 left-0 z-10">
    <div class="max-w-7xl mx-auto flex justify-start items-center">
      <!-- Logo Link to Landing Page -->
      <router-link to="/" class="flex-shrink-0 flex items-center">
        <!-- Logo height adjusted for header -->
        <img src="/images/logo.png" alt="UnderNET Logo" class="h-8 w-auto" />
      </router-link>
    </div>
  </header>

  <div
    class="min-h-screen flex items-center justify-center bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 p-10 bg-slate-800 rounded-xl shadow-2xl">
      <div>
        <h2
          v-if="!isMfaRequired"
          class="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary"
        >
          Sign in to UnderNET Portal
        </h2>
        <h2 v-else class="mt-6 text-center text-3xl font-bold tracking-tight text-text-primary">
          Enter Verification Code
        </h2>
      </div>

      <!-- Standard Login Form -->
      <form v-if="!isMfaRequired" class="mt-8 space-y-8" @submit.prevent="handleLoginSubmit">
        <!-- Username Field -->
        <div class="relative z-0">
          <input
            id="username"
            v-model="username"
            name="username"
            type="text"
            autocomplete="username"
            class="peer block w-full px-3 py-3 appearance-none rounded-md border border-slate-600 bg-transparent placeholder-transparent text-text-primary focus:outline-none focus:ring-0 focus:border-primary sm:text-sm"
            placeholder=" "
          />
          <label
            for="username"
            class="absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] left-3 px-1 peer-focus:text-primary peer-focus:bg-slate-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-500 peer-focus:scale-75 peer-focus:-translate-y-6 pointer-events-none"
          >
            Username
          </label>
        </div>

        <!-- Password Field -->
        <div class="relative z-0">
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            class="peer block w-full px-3 py-3 appearance-none rounded-md border border-slate-600 bg-transparent placeholder-transparent text-text-primary focus:outline-none focus:ring-0 focus:border-primary sm:text-sm"
            placeholder=" "
          />
          <label
            for="password"
            class="absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] left-3 px-1 peer-focus:text-primary peer-focus:bg-slate-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-500 peer-focus:scale-75 peer-focus:-translate-y-6 pointer-events-none"
          >
            Password
          </label>
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

      <!-- MFA Form -->
      <form v-else class="mt-8 space-y-8" @submit.prevent="handleMfaSubmit">
        <p class="text-center text-sm text-text-secondary">
          Enter the code from your authenticator app.
        </p>

        <!-- MFA Input Field with Floating Label -->
        <div class="relative z-0">
          <input
            id="otp"
            v-model="otpCode"
            name="otp"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="one-time-code"
            class="peer block w-full px-3 py-3 appearance-none rounded-md border border-slate-600 bg-transparent placeholder-transparent text-text-primary focus:outline-none focus:ring-0 focus:border-primary sm:text-sm"
            placeholder=" "
          />
          <label
            for="otp"
            class="absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] left-3 px-1 peer-focus:text-primary peer-focus:bg-slate-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-500 peer-focus:scale-75 peer-focus:-translate-y-6 pointer-events-none"
          >
            6-digit code
          </label>
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

      <!-- Common Error Display -->
      <div v-if="error" class="text-red-400 text-sm text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
// Use storeToRefs to keep reactivity for error, isLoading, and isMfaRequired
const { error, isLoading, isMfaRequired } = storeToRefs(authStore)

const username = ref('')
const password = ref('')
const otpCode = ref('') // Ref for the OTP code input

// Renamed original submit handler
const handleLoginSubmit = async () => {
  const success = await authStore.login({
    username: username.value,
    password: password.value,
  })

  // If login was successful (returned true) or MFA is not required, redirect.
  // If MFA is required, login returns false, and we stay on this view.
  if (success && !isMfaRequired.value) {
    router.push('/dashboard')
  }
  // Error handling is done within the store, displayed via the template
}

// New handler for MFA form submission
const handleMfaSubmit = async () => {
  const success = await authStore.verifyMfa(otpCode.value)

  if (success) {
    router.push('/dashboard')
  } else {
    // Clear OTP input on failure to allow retry
    otpCode.value = ''
  }
  // Error handling is done within the store, displayed via the template
}
</script>
