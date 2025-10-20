<template>
  <div
    class="channel-row group hover:bg-gray-700/50 border-b border-gray-700 last:border-b-0 transition-colors duration-150"
  >
    <div class="flex items-center gap-4 p-4">
      <!-- Channel Name Column -->
      <div class="flex-1 min-w-0">
        <span class="text-gray-100 font-medium truncate block">{{ channel.channel_name }}</span>
      </div>

      <!-- Access Level Column -->
      <div class="w-24 flex-shrink-0">
        <span
          :class="accessLevelBadgeClass"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
        >
          {{ accessLevelText }}
        </span>
      </div>

      <!-- Members Column -->
      <div class="w-32 flex-shrink-0 flex items-center gap-2 text-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <span class="text-sm">{{ memberCountText }}</span>
      </div>

      <!-- Joined Column -->
      <div class="w-40 flex-shrink-0 flex items-center gap-2 text-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        <span class="text-sm">{{ joinDateText }}</span>
      </div>

      <!-- Actions Column -->
      <div class="w-auto flex-shrink-0 flex items-center gap-2 relative">
        <el-button
          v-if="isOwner"
          type="primary"
          size="small"
          @click="$emit('edit', channel)"
          class="!px-3 !py-1"
        >
          Edit
        </el-button>
        <button
          @click="toggleActionsMenu"
          class="p-2 hover:bg-gray-600 rounded transition-colors"
          title="More actions"
        >
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
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </button>

        <!-- Actions Menu Dropdown -->
        <div
          v-if="showActionsMenu"
          class="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl py-1 z-10 min-w-[160px]"
        >
          <button
            @click="handleViewDetails"
            class="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View Details
          </button>
          <button
            @click="handleCopyName"
            class="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
              />
            </svg>
            Copy Name
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElButton } from 'element-plus'
import type { ChannelInfo } from '@/types/api'
import {
  formatAccessLevel,
  getAccessLevelBadgeClass,
  formatJoinDate,
  formatMemberCount,
} from '@/utils/channelHelpers'

interface Props {
  channel: ChannelInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [channel: ChannelInfo]
  viewDetails: [channel: ChannelInfo]
  copyName: [channelName: string]
}>()

const showActionsMenu = ref(false)

const isOwner = computed(() => props.channel.access_level >= 500)
const accessLevelText = computed(() => formatAccessLevel(props.channel.access_level))
const accessLevelBadgeClass = computed(() => getAccessLevelBadgeClass(props.channel.access_level))
const memberCountText = computed(() => formatMemberCount(props.channel.member_count))
const joinDateText = computed(() => formatJoinDate(props.channel.joined_at))

function toggleActionsMenu() {
  showActionsMenu.value = !showActionsMenu.value
}

function handleViewDetails() {
  showActionsMenu.value = false
  emit('viewDetails', props.channel)
}

function handleCopyName() {
  showActionsMenu.value = false
  emit('copyName', props.channel.channel_name)
}

// Close menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.channel-row')) {
    showActionsMenu.value = false
  }
}

// Add event listener for clicking outside
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.channel-row {
  position: relative;
}
</style>
