<template>
  <div class="dashboard-view px-4 py-8 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Dashboard</h1>

    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center p-10 text-gray-500 dark:text-gray-400"
    >
      <div
        class="spinner border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full w-10 h-10 animate-spin mb-4"
      ></div>
      <p>Loading user information...</p>
    </div>

    <div
      v-else-if="error"
      class="text-center p-10 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <p>{{ error }}</p>
      <button
        @click="fetchUserInfo"
        class="mt-4 px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150 ease-in-out"
      >
        Retry
      </button>
    </div>

    <div v-else-if="userInfo" class="user-info space-y-6">
      <!-- User Information Box -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <h2
          class="p-4 text-lg font-semibold border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
        >
          User Information
        </h2>
        <div class="p-4 space-y-3">
          <div class="flex">
            <span class="w-28 font-medium text-gray-600 dark:text-gray-400">Username:</span>
            <span class="flex-1 text-gray-800 dark:text-gray-200">{{ userInfo.username }}</span>
          </div>
          <div class="flex">
            <span class="w-28 font-medium text-gray-600 dark:text-gray-400">Email:</span>
            <span class="flex-1 text-gray-800 dark:text-gray-200">{{ userInfo.email }}</span>
          </div>
          <div class="flex">
            <span class="w-28 font-medium text-gray-600 dark:text-gray-400">Admin Level:</span>
            <span class="flex-1 text-gray-800 dark:text-gray-200">{{
              userInfo.admin_level || 'None'
            }}</span>
          </div>
          <div class="flex">
            <span class="w-28 font-medium text-gray-600 dark:text-gray-400">Last Login:</span>
            <span class="flex-1 text-gray-800 dark:text-gray-200">{{
              formatDate(userInfo.last_login)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Channel List -->
      <channel-list :channels="userInfo.channels" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import ChannelList from '@/components/dashboard/ChannelList.vue'

const authStore = useAuthStore()
const { userInfo, isLoading, error } = storeToRefs(authStore)
const { fetchUserInfo } = authStore

// Add watchers for debugging
watch(
  userInfo,
  (newValue) => {
    console.log('UserInfo value changed:', newValue)
  },
  { deep: true },
)

watch(isLoading, (newValue) => {
  console.log('Loading state changed:', newValue)
})

watch(error, (newValue) => {
  console.log('Error state changed:', newValue)
})

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  console.log('Dashboard mounted, current userInfo:', userInfo.value)
  if (!userInfo.value) {
    console.log('No user data, fetching...')
    fetchUserInfo()
  }
})
</script>

<style scoped>
.spinner {
  /* Keep spinner animation if not replaced by a component library spinner */
  /* border: 4px solid rgba(0, 0, 0, 0.1); */
  /* border-radius: 50%; */
  /* border-top: 4px solid #3498db; */
  /* width: 40px; */
  /* height: 40px; */
  /* animation: spin 1s linear infinite; */
  /* margin-bottom: 16px; */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Add any additional fine-tuning styles here if needed */
</style>
