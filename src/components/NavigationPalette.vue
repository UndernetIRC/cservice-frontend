<template>
  <el-dialog
    v-model="isVisible"
    :show-close="false"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    width="600px"
    custom-class="navigation-palette-dialog"
    modal-class="navigation-palette-overlay"
    :style="{ '--el-dialog-bg-color': '#111827' }"
    @closed="handleClosed"
  >
    <template #header>
      <div class="flex items-center justify-between bg-gray-900 -m-5 p-5 border-b border-gray-700">
        <h3 class="text-lg font-semibold text-gray-200">Quick Navigation</h3>
        <div class="flex items-center gap-2">
          <kbd
            class="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800 border border-gray-700 rounded"
          >
            {{ keyboardShortcut }}
          </kbd>
          <button
            @click="isVisible = false"
            class="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <div class="navigation-palette-content bg-gray-900 -m-5 p-5">
      <!-- Search Input -->
      <div class="mb-4">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search pages..."
          class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectCurrent"
        />
      </div>

      <!-- Navigation Items List -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="filteredItems.length === 0" class="text-center py-8 text-gray-500">
          No pages found
        </div>
        <div v-else class="space-y-1">
          <button
            v-for="(item, index) in filteredItems"
            :key="item.path"
            @click="navigateToRoute(item.path)"
            @mouseenter="selectedIndex = index"
            :class="[
              'w-full text-left px-4 py-3 rounded-lg transition-colors flex items-start gap-3',
              selectedIndex === index
                ? 'bg-gray-700 border-l-4 border-primary'
                : 'hover:bg-gray-700/50 border-l-4 border-transparent',
            ]"
          >
            <!-- Icon -->
            <component
              :is="item.icon"
              class="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-200">{{ item.name }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ item.description }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, h, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

interface NavigationItem {
  path: string
  name: string
  description: string
  icon: Component
  requiresAuth?: boolean
  requiresAdmin?: boolean
}

// SVG Icon components as render functions
const DashboardIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    }),
  )

const ChannelsIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
    }),
  )

const AccountIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.903 6.903 0 010 1.99c0 .382.145.755.438.995l1.003.827c.432.355.537.956.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.496-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995a6.903 6.903 0 010-1.99c0-.382-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.128.332-.183.582-.496.645-.87l.213-1.28z',
      }),
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      }),
    ],
  )

const AdminIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    }),
  )

const RolesIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    }),
  )

const HomeIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
    },
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    }),
  )

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const isVisible = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const selectedIndex = ref(0)

// Detect platform for keyboard shortcut display
const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
const keyboardShortcut = computed(() => (isMac ? '⌘K' : 'Ctrl+K'))

// Define all navigation items
const navigationItems: NavigationItem[] = [
  {
    path: '/',
    name: 'Home',
    description: 'Landing page and introduction',
    icon: HomeIcon,
    requiresAuth: false,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    description: 'View your channels and account overview',
    icon: DashboardIcon,
    requiresAuth: true,
  },
  {
    path: '/channels',
    name: 'Channels',
    description: 'Manage your registered IRC channels',
    icon: ChannelsIcon,
    requiresAuth: true,
  },
  {
    path: '/account',
    name: 'Account Settings',
    description: 'Update profile, security, and preferences',
    icon: AccountIcon,
    requiresAuth: true,
  },
  {
    path: '/admin',
    name: 'Admin Panel',
    description: 'Administrative controls and management',
    icon: AdminIcon,
    requiresAuth: true,
    requiresAdmin: true,
  },
  {
    path: '/admin/roles',
    name: 'Role Management',
    description: 'Manage user roles and permissions',
    icon: RolesIcon,
    requiresAuth: true,
    requiresAdmin: true,
  },
]

// Filter items based on auth state and search query
const filteredItems = computed(() => {
  const isAdmin = (authStore.userInfo?.admin_level ?? 0) >= 800

  // Filter by authentication and authorization
  let items = navigationItems.filter((item) => {
    // If requires auth and user is not authenticated, hide it
    if (item.requiresAuth && !isAuthenticated.value) {
      return false
    }
    // If requires admin and user is not admin, hide it
    if (item.requiresAdmin && !isAdmin) {
      return false
    }
    return true
  })

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query),
    )
  }

  return items
})

// Keyboard navigation handlers
const navigateDown = () => {
  if (selectedIndex.value < filteredItems.value.length - 1) {
    selectedIndex.value++
  }
}

const navigateUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const selectCurrent = () => {
  const item = filteredItems.value[selectedIndex.value]
  if (item) {
    navigateToRoute(item.path)
  }
}

const navigateToRoute = (path: string) => {
  router.push(path)
  isVisible.value = false
}

const handleClosed = () => {
  searchQuery.value = ''
  selectedIndex.value = 0
}

// Global keyboard shortcut handler
const handleKeyDown = (event: KeyboardEvent) => {
  const isShortcut =
    event.key === 'k' && ((isMac && event.metaKey) || (!isMac && event.ctrlKey))

  if (isShortcut) {
    event.preventDefault()
    isVisible.value = !isVisible.value
  }

  // Close on Escape when modal is visible
  if (event.key === 'Escape' && isVisible.value) {
    isVisible.value = false
  }
}

// Watch for modal visibility to focus search input
watch(isVisible, (newValue) => {
  if (newValue) {
    // Use nextTick to ensure DOM is updated
    setTimeout(() => {
      searchInputRef.value?.focus()
    }, 100)
  }
})

// Reset selected index when search query changes
watch(searchQuery, () => {
  selectedIndex.value = 0
})

// Setup and cleanup
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style>
/* Additional dialog styling - base colors are in style.css */
.navigation-palette-dialog {
  backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
}

.navigation-palette-dialog .el-dialog__header {
  padding: 20px 24px;
  margin-right: 0;
}

.navigation-palette-dialog .el-dialog__body {
  padding: 20px 24px;
}

.navigation-palette-dialog .el-dialog__headerbtn {
  display: none;
}

/* Custom scrollbar for the navigation list */
.navigation-palette-content .max-h-96::-webkit-scrollbar {
  width: 8px;
}

.navigation-palette-content .max-h-96::-webkit-scrollbar-track {
  background: rgb(31 41 55);
  border-radius: 4px;
}

.navigation-palette-content .max-h-96::-webkit-scrollbar-thumb {
  background: rgb(75 85 99);
  border-radius: 4px;
}

.navigation-palette-content .max-h-96::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}
</style>
