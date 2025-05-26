<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background pt-12 pb-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 p-10 bg-slate-800 rounded-xl shadow-2xl">
      <!-- Logo and Title -->
      <div class="flex flex-row items-center justify-center mb-6 space-x-3">
        <router-link to="/">
          <img src="/images/logo.png" alt="UnderNET Logo" class="h-12 w-auto" />
        </router-link>
        <h1 class="text-xl font-semibold text-text-secondary">UnderNET Cservice</h1>
      </div>

      <!-- Activation Success Message -->
      <div
        v-if="isActivationComplete"
        class="text-center p-4 bg-green-900/50 border border-green-700 rounded-md"
      >
        <h2 class="text-2xl font-bold tracking-tight text-text-primary mb-2">Account Activated!</h2>
        <p class="text-text-secondary mb-4">
          Your account has been successfully activated. You can now log in to your account.
        </p>
        <router-link
          to="/login"
          class="inline-block font-medium blue-link transition-colors duration-150 ease-in-out"
        >
          Proceed to Login
        </router-link>
      </div>

      <!-- Activation Form -->
      <div v-else>
        <h2 class="text-center text-3xl font-bold tracking-tight text-text-primary mb-8">
          Activate Your Account
        </h2>

        <!-- Token Display (if available) -->
        <div v-if="activationToken" class="mb-6">
          <BaseInput
            id="token"
            v-model="activationToken"
            label="Activation Token"
            type="text"
            readonly
            class="opacity-75"
          />
          <p class="mt-1 text-xs text-text-secondary">
            This token was provided in your activation email.
          </p>
        </div>

        <!-- Manual Token Entry (if no token in URL) -->
        <div v-else class="mb-6">
          <BaseInput
            id="token"
            v-model="manualToken"
            label="Activation Token"
            type="text"
            required
            :error="tokenError"
          />
          <p v-if="tokenError" class="mt-1 text-xs text-red-400">{{ tokenError }}</p>
          <p class="mt-1 text-xs text-text-secondary">
            Please enter the activation token from your email.
          </p>
        </div>

        <!-- reCAPTCHA error message -->
        <div v-if="recaptchaError" class="text-xs text-red-400 text-center mb-4">
          {{ recaptchaError }}
          <button
            type="button"
            @click="loadRecaptcha"
            class="ml-2 text-blue-400 hover:text-blue-300 underline"
          >
            Retry
          </button>
        </div>

        <!-- Activate Button -->
        <div class="mb-6">
          <button
            type="button"
            @click="handleActivateSubmit"
            :disabled="!isFormValid || isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-primary bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
          >
            {{ isLoading ? 'Activating Account...' : 'Activate Account' }}
          </button>
        </div>

        <!-- API Error Display -->
        <div v-if="apiError" class="text-red-400 text-sm text-center mb-4">
          {{ apiError }}
        </div>

        <!-- Login Link -->
        <div class="text-sm text-center">
          <span class="text-text-secondary">Already have an active account? </span>
          <router-link
            to="/login"
            class="font-medium blue-link transition-colors duration-150 ease-in-out"
          >
            Login here
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import BaseInput from '@/components/ui/BaseInput.vue'
import { getRecaptchaToken, loadRecaptchaScript, hideRecaptcha, showRecaptcha } from '@/utils/recaptcha'
import { RECAPTCHA_CONFIG } from '@/config/recaptcha'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isLoading, error: apiError } = storeToRefs(authStore)

const activationToken = ref<string>('')
const manualToken = ref<string>('')
const tokenError = ref<string>('')
const isActivationComplete = ref(false)
const recaptchaError = ref<string | null>(null)
const isRecaptchaLoaded = ref(false)

// Check if token is provided in URL query parameters
onMounted(() => {
  const tokenFromUrl = route.query.token as string
  if (tokenFromUrl) {
    activationToken.value = tokenFromUrl
  }
  loadRecaptcha()

  // Show reCAPTCHA badge when on activate page
  showRecaptcha()
})

// Set up navigation guard for error cleanup and reCAPTCHA cleanup
let removeRouterGuard: (() => void) | null = null

onMounted(() => {
  // Add the router guard when component is mounted
  removeRouterGuard = router.beforeEach((to, from, next) => {
    // Only run this when navigating away from the activate page
    if (from.path === '/activate' && to.path !== '/activate') {
      console.log('Navigating away from activate page, clearing errors and reCAPTCHA')
            // Clear errors immediately when navigation starts
      authStore.clearError()

      // Hide reCAPTCHA badge when leaving activate page
      hideRecaptcha()
    }
    next()
  })
})

// Clean up when component is unmounted
onUnmounted(() => {
  // Clean up the router guard
  if (removeRouterGuard) {
    removeRouterGuard()
    console.log('Removed activate page router guard')
  }

    // Clear any remaining auth errors
  authStore.clearError()

  // Hide reCAPTCHA badge when component unmounts
  hideRecaptcha()
})

const isFormValid = computed(() => {
  const token = activationToken.value || manualToken.value
  return token.length > 0 && !tokenError.value
})

// Function to load reCAPTCHA
async function loadRecaptcha() {
  if (RECAPTCHA_CONFIG.enabled && RECAPTCHA_CONFIG.siteKey) {
    recaptchaError.value = null
    try {
      await loadRecaptchaScript()
      isRecaptchaLoaded.value = true
    } catch (error) {
      console.error('Failed to load reCAPTCHA script:', error)
      recaptchaError.value = 'Failed to load security verification. Please try again.'
      isRecaptchaLoaded.value = false
    }
  }
}

async function handleActivateSubmit() {
  const token = activationToken.value || manualToken.value

  // Basic validation
  if (!token.trim()) {
    tokenError.value = 'Activation token is required.'
    return
  }

  tokenError.value = ''
  isActivationComplete.value = false
  authStore.clearError()

  // Get reCAPTCHA token if enabled
  let recaptchaToken: string | null = null
  if (RECAPTCHA_CONFIG.enabled && RECAPTCHA_CONFIG.siteKey) {
    try {
      recaptchaToken = await getRecaptchaToken('activate')
      if (!recaptchaToken) {
        recaptchaError.value = 'Security verification failed. Please try again.'
        return
      }
    } catch (error) {
      console.error('reCAPTCHA error:', error)
      recaptchaError.value = 'Security verification failed. Please try again.'
      return
    }
  }

  const success = await authStore.activate({
    token: token.trim(),
    recaptcha_token: recaptchaToken || undefined,
  })

  if (success) {
    isActivationComplete.value = true
  }
  // API error is handled by the store and displayed via apiError
}
</script>
