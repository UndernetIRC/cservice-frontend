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

      <!-- Registration Success Message -->
      <div
        v-if="isRegistrationComplete"
        class="text-center p-4 bg-green-900/50 border border-green-700 rounded-md"
      >
        <h2 class="text-2xl font-bold tracking-tight text-text-primary mb-2">
          Registration Successful!
        </h2>
        <p class="text-text-secondary">
          Thank you for registering. A confirmation email has been sent to {{ formData.email }}.
          Please click the link in the email within 1 hour to activate your account.
        </p>
        <router-link
          to="/login"
          class="mt-4 inline-block font-medium text-primary hover:text-blue-500 transition-colors duration-150 ease-in-out"
        >
          Proceed to Login
        </router-link>
      </div>

      <!-- Registration Form -->
      <div v-else>
        <h2 class="text-center text-3xl font-bold tracking-tight text-text-primary mb-8">
          Create your Account
        </h2>
        <form class="space-y-6" @submit.prevent="handleSignUpSubmit">
          <!-- Username Field -->
          <div>
            <BaseInput
              id="username"
              v-model="formData.username"
              label="Username (2-12 chars, alphanumeric)"
              type="text"
              autocomplete="username"
              required
              :minlength="2"
              :maxlength="12"
              :error="errors.username"
            />
            <p v-if="errors.username" class="mt-1 text-xs text-red-400">{{ errors.username }}</p>
          </div>

          <!-- Email Field -->
          <div>
            <BaseInput
              id="email"
              v-model="formData.email"
              label="Email Address"
              type="email"
              autocomplete="email"
              required
              :error="errors.email"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <BaseInput
              id="password"
              v-model="formData.password"
              label="Password (min 10 chars)"
              type="password"
              autocomplete="new-password"
              required
              :minlength="10"
              :maxlength="72"
              :error="errors.password"
              data-com-onepassword-filled=""
            />
            <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <BaseInput
              id="passwordConfirm"
              v-model="formData.passwordConfirm"
              label="Confirm Password"
              type="password"
              autocomplete="new-password"
              required
              :error="errors.passwordConfirm"
              data-com-onepassword-filled=""
            />
            <p v-if="errors.passwordConfirm" class="mt-1 text-xs text-red-400">
              {{ errors.passwordConfirm }}
            </p>
          </div>

          <!-- Checkboxes -->
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="eula"
                  v-model="formData.eula"
                  name="eula"
                  type="checkbox"
                  required
                  class="focus:ring-primary h-4 w-4 text-primary border-slate-600 rounded bg-slate-700 focus:ring-offset-slate-800"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="eula" class="font-medium text-text-secondary"
                  >I agree to the
                  <button
                    type="button"
                    @click="isEulaModalVisible = true"
                    class="text-primary hover:text-blue-500 underline"
                  >
                    EULA
                  </button>
                </label>
              </div>
            </div>
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="coppa"
                  v-model="formData.coppa"
                  name="coppa"
                  type="checkbox"
                  required
                  class="focus:ring-primary h-4 w-4 text-primary border-slate-600 rounded bg-slate-700 focus:ring-offset-slate-800"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="coppa" class="font-medium text-text-secondary"
                  >I confirm I am over 13 or have parental consent (<button
                    type="button"
                    @click="isCoppaModalVisible = true"
                    class="text-primary hover:text-blue-500 underline"
                  >
                    COPPA</button
                  >)</label
                >
              </div>
            </div>
            <p v-if="errors.agreements" class="text-xs text-red-400">{{ errors.agreements }}</p>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="group relative w-full flex justify-center py-3 px-4 border border-primary bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out shadow hover:shadow-md"
            >
              {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
            </button>
          </div>

          <!-- API Error Display (from authStore) -->
          <div v-if="apiError" class="text-red-400 text-sm text-center">
            {{ apiError }}
          </div>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-sm text-center">
          <span class="text-text-secondary">Already have an account? </span>
          <router-link
            to="/login"
            class="font-medium text-primary hover:text-blue-500 transition-colors duration-150 ease-in-out"
          >
            Login here
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- EULA Modal -->
  <el-dialog v-model="isEulaModalVisible" title="End User License Agreement (EULA)" width="500px">
    <p class="text-sm text-text-secondary">
      Placeholder for EULA text. Please refer to the official UnderNET website for the full
      agreement. By checking the box, you confirm you have read and agree to the terms.
    </p>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="isEulaModalVisible = false">Close</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- COPPA Modal -->
  <el-dialog
    v-model="isCoppaModalVisible"
    title="Children's Online Privacy Protection Act (COPPA)"
    width="500px"
  >
    <p class="text-sm text-text-secondary">
      Placeholder for COPPA information. UnderNET services are generally intended for users aged 13
      and older. If you are under 13, you must have consent from a parent or guardian to use our
      services. By checking the box, you confirm you meet the age requirement or have the necessary
      consent.
    </p>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="isCoppaModalVisible = false">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { ElDialog, ElButton } from 'element-plus'
import { useDebounceFn } from '@vueuse/core'
import BaseInput from '@/components/ui/BaseInput.vue'

const authStore = useAuthStore()
const { isLoading, error: apiError } = storeToRefs(authStore)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  eula: false,
  coppa: false,
})

const isRegistrationComplete = ref(false)
const isEulaModalVisible = ref(false)
const isCoppaModalVisible = ref(false)

const errors = reactive({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreements: '',
})

const USERNAME_REGEX = /^[a-zA-Z0-9]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isFormValid = computed(() => {
  return (
    formData.username.length >= 2 &&
    formData.username.length <= 12 &&
    USERNAME_REGEX.test(formData.username) &&
    formData.email.length > 0 &&
    EMAIL_REGEX.test(formData.email) &&
    formData.password.length >= 10 &&
    formData.password.length <= 72 &&
    formData.eula &&
    formData.coppa &&
    !errors.username &&
    !errors.email &&
    !errors.password &&
    formData.passwordConfirm.length > 0 &&
    formData.password === formData.passwordConfirm &&
    !errors.passwordConfirm
  )
})

function validateUsername(newVal: string) {
  if (newVal.length === 0) {
    errors.username = 'Username is required.'
  } else if (newVal.length < 2 || newVal.length > 12) {
    errors.username = 'Username must be between 2 and 12 characters.'
  } else if (!USERNAME_REGEX.test(newVal)) {
    errors.username = 'Username must be alphanumeric.'
  } else {
    errors.username = ''
  }
}

function validateEmail(newVal: string) {
  if (newVal.length === 0) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_REGEX.test(newVal)) {
    errors.email = 'Please enter a valid email address.'
  } else {
    errors.email = ''
  }
}

function validatePassword(newVal: string) {
  if (newVal.length === 0) {
    errors.password = 'Password is required.'
  } else if (newVal.length < 10 || newVal.length > 72) {
    errors.password = 'Password must be between 10 and 72 characters.'
  } else {
    errors.password = ''
  }
}

function validatePasswordConfirm(newVal: string) {
  if (newVal.length === 0) {
    errors.passwordConfirm = 'Please confirm your password.'
  } else if (newVal !== formData.password) {
    errors.passwordConfirm = 'Passwords do not match.'
  } else {
    errors.passwordConfirm = ''
  }
}

const debouncedValidateUsername = useDebounceFn(validateUsername, 500)
const debouncedValidateEmail = useDebounceFn(validateEmail, 500)
const debouncedValidatePassword = useDebounceFn(validatePassword, 500)
const debouncedValidatePasswordConfirm = useDebounceFn(validatePasswordConfirm, 500)

watch(
  () => formData.username,
  (newVal) => {
    errors.username = ''
    debouncedValidateUsername(newVal)
  },
)
watch(
  () => formData.email,
  (newVal) => {
    errors.email = ''
    debouncedValidateEmail(newVal)
  },
)
watch(
  () => formData.password,
  (newVal) => {
    errors.password = ''
    debouncedValidatePassword(newVal)
    if (formData.passwordConfirm.length > 0) {
      validatePasswordConfirm(formData.passwordConfirm)
    }
  },
)
watch(
  () => formData.passwordConfirm,
  (newVal) => {
    errors.passwordConfirm = ''
    debouncedValidatePasswordConfirm(newVal)
  },
)

watch([() => formData.eula, () => formData.coppa], ([newEula, newCoppa]) => {
  if (newEula && newCoppa) {
    errors.agreements = ''
  }
})

async function handleSignUpSubmit() {
  validateUsername(formData.username)
  validateEmail(formData.email)
  validatePassword(formData.password)
  validatePasswordConfirm(formData.passwordConfirm)

  if (!formData.eula || !formData.coppa) {
    errors.agreements = 'You must agree to the EULA and confirm COPPA compliance.'
  }

  if (!isFormValid.value) {
    console.log('Form is invalid, submission blocked.')
    return
  }

  isRegistrationComplete.value = false
  authStore.clearError()

  const success = await authStore.register({
    username: formData.username,
    password: formData.password,
    email: formData.email,
    eula: formData.eula,
    coppa: formData.coppa,
  })

  if (success) {
    isRegistrationComplete.value = true
  } else {
    // API error is handled by the store and displayed below
  }
}
</script>
