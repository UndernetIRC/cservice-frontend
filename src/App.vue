<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import TheMinimalFooter from '@/components/TheMinimalFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader v-if="isAuthenticated" />
    <main class="flex-1">
      <router-view />
    </main>
    <TheMinimalFooter v-if="isAuthenticated" />
    <TheFooter v-else />
  </div>
</template>
