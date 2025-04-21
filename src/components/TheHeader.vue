<template>
  <header class="bg-secondary shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative flex justify-between h-16">
        <!-- Left Section: Logo and Nav -->
        <div class="flex items-center">
          <!-- Logo Link -->
          <router-link to="/dashboard" class="flex-shrink-0 flex items-center">
            <!-- Using local logo -->
            <img src="/images/logo.png" alt="UnderNET Logo" class="h-8 w-auto" />
          </router-link>
          <!-- Navigation Links -->
          <nav v-if="isAuthenticated" class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              to="/channels"
              class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-text-secondary hover:text-text-primary hover:border-slate-300"
              active-class="border-primary text-text-primary"
            >
              Channels
            </router-link>
            <router-link
              v-if="isAdmin"
              to="/admin"
              class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-text-secondary hover:text-text-primary hover:border-slate-300 cursor-pointer"
              active-class="border-primary text-text-primary"
            >
              Admin
            </router-link>
          </nav>
        </div>

        <!-- Center Section (for potential future use) -->
        <div
          class="absolute inset-y-0 left-1/2 transform -translate-x-1/2 flex items-center px-2 lg:px-0"
        >
          <!-- Can add search or other elements here -->
        </div>

        <!-- Right Section: User Menu (Hidden on sm and below) -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <Menu v-if="isAuthenticated" as="div" class="ml-3 relative">
            <div>
              <MenuButton
                class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span class="sr-only">Open user menu</span>
                <!-- User Icon SVG -->
                <svg
                  class="h-8 w-8 rounded-full text-gray-400 bg-gray-700 p-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </MenuButton>
            </div>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/profile"
                    :class="[
                      active ? 'bg-gray-100 dark:bg-gray-600' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200',
                    ]"
                  >
                    <!-- Profile Icon -->
                    <svg
                      class="mr-3 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Profile
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/account"
                    :class="[
                      active ? 'bg-gray-100 dark:bg-gray-600' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200',
                    ]"
                  >
                    <!-- Account Icon -->
                    <svg
                      class="mr-3 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    Account
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/settings"
                    :class="[
                      active ? 'bg-gray-100 dark:bg-gray-600' : '',
                      'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200',
                    ]"
                  >
                    <!-- Settings Icon -->
                    <svg
                      class="mr-3 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.903 6.903 0 010 1.99c0 .382.145.755.438.995l1.003.827c.432.355.537.956.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.496-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995a6.903 6.903 0 010-1.99c0-.382-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.128.332-.183.582-.496.645-.87l.213-1.28z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleLogout"
                    :class="[
                      active ? 'bg-gray-100 dark:bg-gray-600' : '',
                      'flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200',
                    ]"
                  >
                    <!-- Logout Icon -->
                    <svg
                      class="mr-3 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    Logout
                  </button>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>

        <!-- Mobile menu button (Visible on sm and below) -->
        <div class="-mr-2 flex items-center sm:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-controls="mobile-menu"
            :aria-expanded="isMobileMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Icon when menu is closed (Hamburger) -->
            <svg
              v-show="!isMobileMenuOpen"
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <!-- Icon when menu is open (X) -->
            <svg
              v-show="isMobileMenuOpen"
              class="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu (Visible on sm and below, toggled by button) -->
    <div v-show="isMobileMenuOpen" class="sm:hidden" id="mobile-menu">
      <div class="pt-2 pb-3 space-y-1">
        <router-link
          to="/channels"
          class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-secondary hover:bg-slate-700 hover:border-slate-600 hover:text-text-primary"
          active-class="bg-slate-700 border-primary text-text-primary"
          @click="isMobileMenuOpen = false"
          >Channels</router-link
        >
        <router-link
          v-if="isAdmin"
          to="/admin"
          class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-secondary hover:bg-slate-700 hover:border-slate-600 hover:text-text-primary"
          active-class="bg-slate-700 border-primary text-text-primary"
          @click="isMobileMenuOpen = false"
          >Admin</router-link
        >
      </div>
      <!-- Mobile User Menu Section -->
      <div v-if="isAuthenticated" class="pt-4 pb-3 border-t border-slate-700">
        <div class="flex items-center px-4 mb-3">
          <!-- Optional: Display user icon/name in mobile menu header -->
          <svg
            class="h-10 w-10 rounded-full text-gray-400 bg-gray-700 p-1 mr-3"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="font-medium text-base text-text-primary">{{ username }}</div>
        </div>
        <div class="space-y-1">
          <router-link
            to="/profile"
            class="block px-4 py-2 text-base font-medium text-text-secondary hover:bg-slate-700 hover:text-text-primary"
            @click="isMobileMenuOpen = false"
            >Profile</router-link
          >
          <router-link
            to="/account"
            class="block px-4 py-2 text-base font-medium text-text-secondary hover:bg-slate-700 hover:text-text-primary"
            @click="isMobileMenuOpen = false"
            >Account</router-link
          >
          <router-link
            to="/settings"
            class="block px-4 py-2 text-base font-medium text-text-secondary hover:bg-slate-700 hover:text-text-primary"
            @click="isMobileMenuOpen = false"
            >Settings</router-link
          >
          <button
            @click="handleMobileLogout"
            class="block w-full text-left px-4 py-2 text-base font-medium text-text-secondary hover:bg-slate-700 hover:text-text-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const router = useRouter()
const authStore = useAuthStore()
const { userInfo, isAuthenticated } = storeToRefs(authStore)

const isMobileMenuOpen = ref(false)

const username = computed(() => userInfo.value?.username || '')
const isAdmin = computed(() => {
  return (authStore.userInfo?.admin_level ?? 0) >= 800
})

const handleLogout = async () => {
  await authStore.logout()
  // Ensure mobile menu is closed if open
  isMobileMenuOpen.value = false
  // Navigation is now handled within the authStore.logout() action
}

// Separate handler for mobile to ensure menu closes before navigation potentially changes layout
const handleMobileLogout = () => {
  isMobileMenuOpen.value = false
  // Use nextTick or slight delay if needed, but usually logout handles redirect okay
  handleLogout()
}
</script>

<style scoped>
/* Add any necessary scoped styles, potentially for transitions or overrides */
</style>
