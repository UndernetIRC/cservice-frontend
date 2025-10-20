<template>
  <div
    class="channel-list bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden"
  >
    <!-- Header with Controls -->
    <div class="p-4 border-b border-gray-700 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h2 class="text-lg font-semibold text-gray-100">Your Channels</h2>

        <!-- View Toggle -->
        <div class="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              viewMode === 'grid'
                ? 'bg-gray-600 text-white'
                : 'text-gray-300 hover:text-white',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 inline"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-gray-600 text-white'
                : 'text-gray-300 hover:text-white',
            ]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 inline"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Search -->
        <div class="flex-1 min-w-[200px] relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 text-gray-400"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search channels..."
            class="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <!-- Filter by Access Level -->
        <select
          v-model="filterAccessLevel"
          class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Access Levels</option>
          <option value="owner">Owned</option>
          <option value="manager">Managed</option>
          <option value="user">Member</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortField"
          class="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="name">Sort by Name</option>
          <option value="members">Sort by Members</option>
          <option value="joined">Sort by Join Date</option>
        </select>

        <!-- Sort Direction -->
        <button
          @click="toggleSortDirection"
          class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
          :title="sortDirection === 'asc' ? 'Ascending' : 'Descending'"
        >
          <svg
            v-if="sortDirection === 'asc'"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
            />
          </svg>
        </button>
      </div>

      <!-- Results count -->
      <div class="text-sm text-gray-400">
        Showing {{ displayedChannels.length }} of {{ totalChannels }} channels
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!props.channels || props.channels.length === 0"
      class="p-8 text-center text-gray-400"
    >
      You are not currently part of any channels.
    </div>

    <!-- No Results from Filter/Search -->
    <div
      v-else-if="displayedChannels.length === 0"
      class="p-8 text-center text-gray-400"
    >
      No channels match your current filters.
    </div>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <ChannelCard
        v-for="channel in paginatedChannels"
        :key="channel.channel_id"
        :channel="channel"
        @edit="handleEdit"
        @view-details="handleViewDetails"
        @copy-name="handleCopyName"
      />
    </div>

    <!-- List View -->
    <div v-else class="divide-y divide-gray-700">
      <!-- Table Header -->
      <div class="bg-gray-750 p-4 hidden md:block">
        <div class="flex items-center">
          <div class="flex-1 min-w-0 pr-4 text-sm font-semibold text-gray-300">Channel</div>
          <div class="w-28 flex-shrink-0 px-2 text-sm font-semibold text-gray-300">Access</div>
          <div class="w-36 flex-shrink-0 px-2 text-sm font-semibold text-gray-300">Members</div>
          <div class="w-44 flex-shrink-0 px-2 text-sm font-semibold text-gray-300">Added</div>
          <div class="w-32 flex-shrink-0 pl-2 text-sm font-semibold text-gray-300 text-right">Actions</div>
        </div>
      </div>

      <!-- Table Body -->
      <ChannelListCompact
        v-for="channel in paginatedChannels"
        :key="channel.channel_id"
        :channel="channel"
        @edit="handleEdit"
        @view-details="handleViewDetails"
        @copy-name="handleCopyName"
      />
    </div>

    <!-- Pagination -->
    <div v-if="displayedChannels.length > 0" class="flex justify-center w-full p-4 border-t border-gray-700">
      <Pagination
        :total="displayedChannels.length"
        v-model:modelValue="currentPage"
        v-model:pageSize="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { ChannelInfo } from '@/types/api'
import { sortChannels, getAccessLevelCategory } from '@/utils/channelHelpers'
import type { SortField, SortDirection } from '@/utils/channelHelpers'
import ChannelCard from './ChannelCard.vue'
import ChannelListCompact from './ChannelListCompact.vue'
import Pagination from '@/components/ui/Pagination.vue'

interface Props {
  channels?: ChannelInfo[]
}

const props = withDefaults(defineProps<Props>(), {
  channels: () => [],
})

// View mode state
const viewMode = ref<'grid' | 'list'>('grid')

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)

// Search and filter state
const searchQuery = ref('')
const filterAccessLevel = ref<'all' | 'owner' | 'manager' | 'user'>('all')
const sortField = ref<SortField>('name')
const sortDirection = ref<SortDirection>('asc')

// Total channels count
const totalChannels = computed(() => props.channels?.length || 0)

// Filtered and sorted channels
const displayedChannels = computed(() => {
  if (!props.channels) return []

  let result = [...props.channels]

  // Apply search filter
  if (searchQuery.value) {
    result = result.filter((channel) =>
      channel.channel_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Apply access level filter
  if (filterAccessLevel.value !== 'all') {
    result = result.filter(
      (channel) => getAccessLevelCategory(channel.access_level) === filterAccessLevel.value
    )
  }

  // Apply sorting
  result = sortChannels(result, sortField.value, sortDirection.value)

  return result
})

// Paginated channels
const paginatedChannels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return displayedChannels.value.slice(start, end)
})

// Reset to page 1 when filters/search change
watch([searchQuery, filterAccessLevel, sortField, sortDirection], () => {
  currentPage.value = 1
})

// Reset to page 1 if current page becomes invalid
watch(
  () => displayedChannels.value.length,
  (newLength) => {
    const totalPages = Math.ceil(newLength / pageSize.value)
    if (currentPage.value > totalPages && totalPages > 0) {
      currentPage.value = totalPages
    }
  }
)

// Load view preference from localStorage
onMounted(() => {
  const savedView = localStorage.getItem('channelListViewMode')
  if (savedView === 'grid' || savedView === 'list') {
    viewMode.value = savedView
  }
})

// Save view preference to localStorage
watch(viewMode, (newView) => {
  localStorage.setItem('channelListViewMode', newView)
})

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

function handleEdit(channel: ChannelInfo): void {
  console.log('Edit channel:', channel)
  // TODO: Implement navigation or modal for editing the channel
}

function handleViewDetails(channel: ChannelInfo): void {
  console.log('View details:', channel)
  // TODO: Implement details view/modal
}

function handleCopyName(channelName: string): void {
  navigator.clipboard.writeText(channelName).then(
    () => {
      console.log('Channel name copied:', channelName)
      // TODO: Show toast notification
    },
    (err) => {
      console.error('Failed to copy channel name:', err)
    }
  )
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
