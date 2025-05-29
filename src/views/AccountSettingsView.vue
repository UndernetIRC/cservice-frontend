<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account preferences, security settings, and profile information.
        </p>
      </div>

      <!-- Tab Navigation -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <nav class="flex border-b border-gray-200 dark:border-gray-700" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-sm font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-10 transition-colors duration-200',
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
            ]"
            :aria-current="activeTab === tab.id ? 'page' : undefined"
          >
            <div class="flex items-center justify-center space-x-2">
              <component :is="tab.icon" class="h-5 w-5" />
              <span>{{ tab.name }}</span>
            </div>
            <span
              v-if="activeTab === tab.id"
              aria-hidden="true"
              class="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400"
            ></span>
          </button>
        </nav>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <SecuritySettings />
          </div>

          <!-- Profile Tab -->
          <div v-else-if="activeTab === 'profile'" class="space-y-6">
            <div class="max-w-4xl mx-auto">
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Profile Information
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    View and manage your basic profile information.
                  </p>
                </div>
                <div class="p-6 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Username</label
                      >
                      <div
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                      >
                        {{ userInfo?.username || 'N/A' }}
                      </div>
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Username cannot be changed
                      </p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Email</label
                      >
                      <div
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                      >
                        {{ userInfo?.email || 'N/A' }}
                      </div>
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Contact support to change your email
                      </p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >User ID</label
                      >
                      <div
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                      >
                        {{ userInfo?.id || 'N/A' }}
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Last Seen</label
                      >
                      <div
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                      >
                        {{ formatDate(userInfo?.last_seen) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preferences Tab -->
          <div v-else-if="activeTab === 'preferences'" class="space-y-6">
            <div class="max-w-4xl mx-auto">
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Preferences
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Customize your account preferences and settings.
                  </p>
                </div>
                <div class="p-6 space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div
                          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                        >
                          {{ userInfo?.language_name || 'N/A' }}
                        </div>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Current language setting
                        </p>
                      </div>
                      <div>
                        <div
                          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                        >
                          {{ userInfo?.language_code || 'N/A' }}
                        </div>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Language code</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Limits
                    </label>
                    <div>
                      <div
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                      >
                        {{ userInfo?.max_logins || 'N/A' }}
                      </div>
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Maximum simultaneous logins allowed
                      </p>
                    </div>
                  </div>

                  <div
                    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-4"
                  >
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Preference Updates Coming Soon
                        </h3>
                        <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                          <p>
                            Additional preference settings and customization options will be
                            available in future updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sessions Tab -->
          <div v-else-if="activeTab === 'sessions'" class="space-y-6">
            <div class="max-w-4xl mx-auto">
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Active Sessions
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage your active login sessions across devices.
                  </p>
                </div>
                <div class="p-6">
                  <div class="space-y-4">
                    <div
                      class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                          <svg
                            class="h-8 w-8 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Current Session
                          </p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            This device • Active now
                          </p>
                        </div>
                      </div>
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        Current
                      </span>
                    </div>

                    <div class="text-center py-8">
                      <svg
                        class="mx-auto h-12 w-12 text-gray-400"
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
                      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        Session Management
                      </h3>
                      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Detailed session management features will be available in future updates.
                      </p>
                    </div>

                    <div
                      class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600"
                    >
                      <button
                        @click="handleLogoutAllDevices"
                        :disabled="isLoggingOut"
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        {{ isLoggingOut ? 'Signing out...' : 'Sign out of all devices' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import SecuritySettings from '@/components/settings/SecuritySettings.vue'

// Icon components
const ShieldCheckIcon = () =>
  h(
    'svg',
    {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'h-5 w-5',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      }),
    ],
  )

const UserIcon = () =>
  h(
    'svg',
    {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'h-5 w-5',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      }),
    ],
  )

const CogIcon = () =>
  h(
    'svg',
    {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'h-5 w-5',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      }),
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      }),
    ],
  )

const ComputerDesktopIcon = () =>
  h(
    'svg',
    {
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      class: 'h-5 w-5',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      }),
    ],
  )

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)

const activeTab = ref('preferences')
const isLoggingOut = ref(false)

const tabs = [
  { id: 'preferences', name: 'Preferences', icon: CogIcon },
  { id: 'profile', name: 'Profile', icon: UserIcon },
  { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  { id: 'sessions', name: 'Sessions', icon: ComputerDesktopIcon },
]

function formatDate(timestamp: number | undefined) {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleString()
}

async function handleLogoutAllDevices() {
  isLoggingOut.value = true
  try {
    await authStore.logout({ logout_all: true })
  } catch (error) {
    console.error('Failed to logout from all devices:', error)
  } finally {
    isLoggingOut.value = false
  }
}

onMounted(async () => {
  // Ensure user info is loaded
  if (!userInfo.value) {
    await authStore.fetchUserInfo()
  }
})
</script>
