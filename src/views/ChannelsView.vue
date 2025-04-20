<template>
  <div class="channels-view">
    <h1 class="text-2xl font-bold mb-6">Channels</h1>
    <div v-if="loading" class="loading">Loading channels...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="channels.length === 0" class="empty-state">
      <p>You don't have access to any channels yet.</p>
    </div>
    <div v-else class="channels-list">
      <div v-for="channel in channels" :key="channel.id" class="channel-card">
        <h3 class="channel-name">{{ channel.name }}</h3>
        <p class="channel-description">{{ channel.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Define a basic Channel interface
interface Channel {
  id: number
  name: string
  description: string
}

const channels = ref<Channel[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchChannels = async () => {
  try {
    loading.value = true
    error.value = null
    // This is a placeholder - implement the actual API call when available
    // channels.value = await apiService.getChannels()
    channels.value = []
  } catch (err) {
    console.error('Failed to fetch channels:', err)
    error.value = 'Failed to load channels. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchChannels()
})
</script>

<style scoped>
.channels-view {
  padding: 20px;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #e53e3e;
}

.channels-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.channel-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.channel-name {
  font-weight: 600;
  margin-bottom: 8px;
}

.channel-description {
  color: #666;
  font-size: 0.9rem;
}
</style>
