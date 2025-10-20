<template>
  <div
    class="channel-list bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <div
      class="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700"
    >
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Channels</h2>
      <BaseInput v-model="searchQuery" label="Search channels..." class="w-48" />
    </div>
    <div
      v-if="!channels || channels.length === 0"
      class="p-4 text-center text-gray-500 dark:text-gray-400"
    >
      You are not currently part of any channels.
    </div>
    <div v-else class="p-4">
      <!-- Custom List Container -->
      <div class="space-y-2 mb-4">
        <div
          v-for="channel in paginatedChannels"
          :key="channel.channel_id"
          class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 ease-in-out"
        >
          <span class="text-gray-800 dark:text-gray-200">{{ channel.channel_name }}</span>
          <el-button
            v-if="isOwner(channel.access_level)"
            type="primary"
            size="small"
            @click="handleEdit(channel)"
            class="ml-auto"
          >
            Edit
          </el-button>
        </div>
      </div>

      <div class="flex justify-center w-full mt-4">
        <Pagination
          :total="filteredChannels.length"
          v-model:modelValue="currentPage"
          v-model:pageSize="pageSize"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElButton } from 'element-plus'
import type { ChannelInfo } from '@/types/api'
import Pagination from '@/components/ui/Pagination.vue' // Import custom pagination
import BaseInput from '@/components/ui/BaseInput.vue' // Import reusable input

interface Props {
  channels?: ChannelInfo[]
}

const props = withDefaults(defineProps<Props>(), {
  channels: () => [],
})

const currentPage = ref(1)
const pageSize = ref(10) // Default page size
const searchQuery = ref('') // Ref for search input

const filteredChannels = computed(() => {
  if (!props.channels) return []
  return props.channels
    .filter((channel) => channel.channel_name?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .sort((a, b) => (a.channel_name || '').localeCompare(b.channel_name || ''))
})

const paginatedChannels = computed(() => {
  const list = filteredChannels.value
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

// Reset to page 1 if channels change and current page becomes invalid
watch(
  () => props.channels,
  (newChannels) => {
    const totalPages = Math.ceil((newChannels?.length || 0) / pageSize.value)
    if (currentPage.value > totalPages && totalPages > 0) {
      currentPage.value = totalPages
    } else if (currentPage.value <= 0 && totalPages > 0) {
      currentPage.value = 1 // Ensure currentPage is at least 1 if there are pages
    } else if (!newChannels || newChannels.length === 0) {
      currentPage.value = 1 // Reset to 1 if no channels
    }
  },
  { immediate: true },
) // Check immediately on mount

function isOwner(accessLevel: number): boolean {
  return accessLevel === 500
}

function handleEdit(channel: ChannelInfo): void {
  console.log('Edit channel:', channel)
  // TODO: Implement navigation or modal for editing the channel
  // Example: router.push(`/channels/${channel.channel_id}/edit`)
}
</script>

<style scoped>
/* Remove all dark mode pagination styles - moved to global style.css */
/*
.dark :deep(.el-pagination) {
  ...
}

.dark :deep(.el-select-dropdown__item) {
  ...
}
.dark :deep(.el-select-dropdown__item.hover),
.dark :deep(.el-select-dropdown__item:hover) {
  ...
}
.dark :deep(.el-select-dropdown__item.selected) {
  ...
}

.dark :deep(.el-pagination .el-select .el-input) {
  ...
}

.dark :deep(.el-pagination .el-select .el-select__input) {
  ...
}

.dark :deep(.el-pagination__jump .el-input) {
  ...
}
.dark :deep(.el-pagination__jump .el-input__inner) {
  ...
}

.dark :deep(.el-pagination button),
.dark :deep(.el-pager li) {
  ...
}

.dark :deep(.el-pager li.is-active) {
  ...
}

.dark :deep(.el-pagination button:disabled) {
  ...
}
*/

/* Keep only non-dark-mode pagination styles if any were added */
:deep(.el-pagination) {
  /* Base variables (light mode) */
  --el-pagination-button-bg-color: theme('colors.white', #ffffff);
  --el-pagination-button-disabled-bg-color: theme('colors.slate.100', #f3f4f6);
  --el-pagination-text-color: theme('colors.slate.600', #4b5563);
  --el-pagination-button-color: theme('colors.slate.600', #4b5563);
  --el-pagination-hover-color: theme('colors.primary', #2563eb);
  padding-top: 0.5rem;
}

/* Add any other component-specific fine-tuning styles if needed */
</style>
