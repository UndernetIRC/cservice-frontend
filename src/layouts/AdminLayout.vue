<template>
  <div class="admin-layout">
    <div class="admin-header">
      <h1>{{ title }}</h1>
    </div>
    <div class="admin-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => {
  switch (route.name) {
    case 'admin-channels':
      return 'Channel Management'
    case 'admin-roles':
      return 'Role Management'
    default:
      return 'Admin Dashboard'
  }
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-header {
  background-color: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.admin-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
