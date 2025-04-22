<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import TheMinimalFooter from '@/components/TheMinimalFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const { isAuthenticated, isAuthCheckComplete } = storeToRefs(authStore)
const route = useRoute()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader v-if="isAuthenticated && !route.meta.requiresGuest" />
    <main class="flex-1" :class="{ 'pt-16': isAuthenticated && !route.meta.requiresGuest }">
      <router-view />
    </main>
    <!-- Only render footers after initial auth check is complete -->
    <template v-if="isAuthCheckComplete">
      <TheMinimalFooter v-if="isAuthenticated" />
      <TheFooter v-else />
    </template>
  </div>
</template>
