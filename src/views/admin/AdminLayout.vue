<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <nav>
        <router-link to="/admin/roles" class="nav-item">
          <i class="fas fa-users-cog"></i>
          <span>Roles</span>
        </router-link>
      </nav>
    </aside>
    <main class="admin-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  console.log('AdminLayout mounted')
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: calc(100vh - 64px); /* Subtract header height */
}

.admin-sidebar {
  width: 250px;
  background-color: #1a1a1a;
  padding: 1rem;
  color: white;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #fff;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.nav-item:hover {
  background-color: #2a2a2a;
}

.nav-item.router-link-active {
  background-color: #3a3a3a;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  background-color: #f3f4f6;
}
</style>
