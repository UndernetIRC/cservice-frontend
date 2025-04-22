<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import TheMinimalFooter from '@/components/TheMinimalFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isAuthenticated, isAuthCheckComplete } = storeToRefs(authStore)
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader v-if="isAuthenticated" />
    <main class="flex-1" :class="{ 'pt-16': isAuthenticated }">
      <router-view />
    </main>
    <!-- Only render footers after initial auth check is complete -->
    <template v-if="isAuthCheckComplete">
      <TheMinimalFooter v-if="isAuthenticated" />
      <TheFooter v-else />
    </template>
  </div>
</template>
