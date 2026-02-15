<template>
  <el-drawer
    :model-value="modelValue"
    direction="rtl"
    :size="drawerSize"
    :before-close="handleClose"
    :destroy-on-close="true"
    class="channel-detail-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Loading State -->
    <div v-if="loading" data-testid="loading-state" class="drawer-loading">
      <div class="loading-spinner" />
      <p class="loading-text">Loading channel settings...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" data-testid="error-state" class="drawer-error">
      <div class="error-icon">!</div>
      <p class="error-message">Failed to load channel settings</p>
      <button data-testid="retry-btn" class="retry-btn" @click="fetchSettings">
        Retry
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="channelData" class="drawer-content">
      <!-- Header Section -->
      <div class="drawer-header drawer-section-animate" :style="{ animationDelay: '0ms' }">
        <div class="channel-name-row">
          <h2 class="channel-name">
            <span class="channel-hash">#</span>{{ channelName }}
          </h2>
          <div class="header-actions">
            <button
              v-if="accessLevel >= 450"
              data-testid="edit-settings-btn"
              class="edit-settings-btn"
              @click="isEditing = !isEditing"
            >
              {{ isEditing ? 'Cancel' : 'Edit' }}
            </button>
            <button
              class="close-drawer-btn"
              aria-label="Close drawer"
              @click="handleCloseClick"
            >
              &times;
            </button>
          </div>
        </div>
        <div class="channel-meta">
          <span>{{ formatMemberCount(channelData.member_count) }}</span>
          <span class="meta-separator">&middot;</span>
          <span>Created {{ formatJoinDate(channelData.created_at) }}</span>
          <span class="meta-separator">&middot;</span>
          <span>Updated {{ formatJoinDate(channelData.updated_at) }}</span>
        </div>
      </div>

      <!-- Edit Mode -->
      <ChannelSettingsForm
        v-if="isEditing"
        ref="settingsFormRef"
        :settings="channelData.settings"
        :channel-id="channelId"
        :access-level="accessLevel"
        @save="handleSettingsSaved"
        @cancel="isEditing = false"
      />

      <!-- Read-only Settings Sections -->
      <template v-else>
        <div
          v-for="(group, groupIndex) in visibleGroups"
          :key="group.id"
          data-testid="setting-group"
          class="section-card drawer-section-animate"
          :style="{ animationDelay: `${(groupIndex + 1) * 50}ms` }"
        >
          <h3 class="section-heading">{{ group.label }}</h3>

          <div :class="group.id === 'floatlim' ? 'fields-grid-float' : 'fields-list'">
            <div v-for="field in group.fields" :key="field.key" class="field-row">
              <span class="field-label">{{ field.label }}</span>

              <!-- Boolean fields -->
              <template v-if="field.type === 'boolean'">
                <span
                  v-if="channelData.settings[field.key]"
                  data-testid="badge-on"
                  class="badge badge-on"
                >
                  ON
                </span>
                <span v-else data-testid="badge-off" class="badge badge-off">
                  OFF
                </span>
              </template>

              <!-- Select fields (userflags) -->
              <template v-else-if="field.type === 'select' && field.options">
                <span class="field-value">
                  {{ getUserflagsLabel(channelData.settings[field.key] as number, field.options) }}
                </span>
              </template>

              <!-- Number fields -->
              <template v-else-if="field.type === 'number'">
                <span class="field-value field-value-mono">
                  {{ channelData.settings[field.key] }}
                </span>
              </template>

              <!-- Keywords: tag chips -->
              <template v-else-if="field.key === 'keywords'">
                <div v-if="keywordTags.length" class="keyword-tags-readonly">
                  <span v-for="(tag, i) in keywordTags" :key="i" class="keyword-chip">
                    {{ tag }}
                  </span>
                </div>
                <span v-else data-testid="not-set" class="field-value field-not-set">
                  Not set
                </span>
              </template>

              <!-- String fields -->
              <template v-else>
                <span v-if="channelData.settings[field.key]" class="field-value">
                  {{ channelData.settings[field.key] }}
                </span>
                <span v-else data-testid="not-set" class="field-value field-not-set">
                  Not set
                </span>
              </template>
            </div>
          </div>
        </div>

        <!-- Members Placeholder -->
        <div
          data-testid="members-placeholder"
          class="section-card drawer-section-animate"
          :style="{ animationDelay: `${(visibleGroups.length + 1) * 50}ms` }"
        >
          <h3 class="section-heading">Members</h3>
          <div class="members-placeholder-content">
            <span class="field-value-mono">{{ channelData.member_count }}</span>
            <span class="members-placeholder-text">Member list coming soon</span>
          </div>
        </div>
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { ElMessageBox } from 'element-plus'
import apiService from '@/services/api'
import { getVisibleGroups } from '@/composables/useChannelSettings'
import type { FieldOption } from '@/composables/useChannelSettings'
import type { ChannelDetailResponse } from '@/types/api'
import { formatJoinDate, formatMemberCount } from '@/utils/channelHelpers'

const ChannelSettingsForm = defineAsyncComponent(
  () => import('@/components/channel/ChannelSettingsForm.vue'),
)

interface Props {
  modelValue: boolean
  channelId: number
  accessLevel: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'settings-updated'): void
}>()

const loading = ref(false)
const error = ref(false)
const channelData = ref<ChannelDetailResponse | null>(null)
const isEditing = ref(false)
const settingsFormRef = ref<InstanceType<typeof ChannelSettingsForm> | null>(null)

// Responsive drawer size
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const drawerSize = computed(() => (windowWidth.value <= 640 ? '100%' : '640px'))

function onResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const channelName = computed(() => {
  if (!channelData.value) return ''
  return channelData.value.name.replace(/^#/, '')
})

const visibleGroups = computed(() => getVisibleGroups(props.accessLevel, false))

const keywordTags = computed<string[]>(() => {
  const raw = channelData.value?.settings?.keywords as string | undefined
  if (!raw || !raw.trim()) return []
  return raw.split(',').map((k) => k.trim()).filter(Boolean)
})

function getUserflagsLabel(value: number, options: FieldOption[]): string {
  const option = options.find((o) => o.value === value)
  return option ? option.label : 'None'
}

async function fetchSettings() {
  loading.value = true
  error.value = false

  try {
    channelData.value = await apiService.getChannelSettings(props.channelId)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function handleClose(done: () => void) {
  if (isEditing.value && settingsFormRef.value?.dirtyCount > 0) {
    try {
      await ElMessageBox.confirm(
        'You have unsaved changes. Are you sure you want to close?',
        'Unsaved Changes',
        {
          confirmButtonText: 'Discard',
          cancelButtonText: 'Keep Editing',
          type: 'warning',
        },
      )
      isEditing.value = false
      done()
    } catch {
      // User clicked "Keep Editing" — do nothing
    }
  } else {
    isEditing.value = false
    done()
  }
}

function handleCloseClick() {
  handleClose(() => emit('update:modelValue', false))
}

async function handleSettingsSaved() {
  isEditing.value = false
  emit('settings-updated')
  await fetchSettings()
}

watch(
  () => [props.modelValue, props.channelId] as const,
  ([isOpen, channelId]) => {
    if (isOpen && channelId) {
      isEditing.value = false
      fetchSettings()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* Drawer is teleported to <body>, so scoped :deep() cannot reach it.
   Global overrides are in src/style.css under .channel-detail-drawer */

/* Loading State */
.drawer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #2d3340;
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #9ca3af;
  font-size: 14px;
}

/* Error State */
.drawer-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
}

.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.error-message {
  color: #9ca3af;
  font-size: 14px;
}

.retry-btn {
  padding: 8px 20px;
  border: 1px solid #22d3ee;
  border-radius: 6px;
  background: transparent;
  color: #22d3ee;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.retry-btn:hover {
  background-color: rgba(34, 211, 238, 0.1);
}

/* Drawer Content */
.drawer-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.drawer-header {
  margin-bottom: 8px;
}

.channel-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.channel-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.channel-hash {
  color: #0e7490;
  margin-right: 2px;
}

.channel-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

.meta-separator {
  color: #4b5563;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Edit Button */
.edit-settings-btn {
  padding: 6px 16px;
  border: 1px solid #22d3ee;
  border-radius: 6px;
  background: transparent;
  color: #22d3ee;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.edit-settings-btn:hover {
  background-color: rgba(34, 211, 238, 0.1);
}

/* Close Drawer Button */
.close-drawer-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.close-drawer-btn:hover {
  color: #f1f5f9;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Section Cards */
.section-card {
  background-color: #22262e;
  border: 1px solid #2d3340;
  border-radius: 8px;
  padding: 16px 20px;
  transition: border-color 0.15s ease;
}

.section-card:hover {
  border-color: #3b4559;
}

.section-heading {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin: 0 0 12px 0;
}

/* Fields */
.fields-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fields-grid-float .field-row:first-child {
  grid-column: 1 / -1;
}

.fields-grid-float {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-label {
  font-size: 13px;
  color: #9ca3af;
}

.field-value {
  font-size: 13px;
  color: #e5e7eb;
}

.field-value-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #e5e7eb;
}

.field-not-set {
  color: #6b7280;
  font-style: italic;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.badge-on {
  background-color: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
}

.badge-off {
  background-color: rgba(107, 114, 128, 0.15);
  color: #6b7280;
}

/* Keyword Tags (read-only) */
.keyword-tags-readonly {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.keyword-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #67e8f9;
}

/* Members Placeholder */
.members-placeholder-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.members-placeholder-text {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
}

/* Stagger Animation */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drawer-section-animate {
  opacity: 0;
  animation: fadeSlideIn 0.3s ease-out forwards;
}

/* ===== Mobile Responsive ===== */
@media (max-width: 640px) {
  .drawer-content {
    padding: 16px;
  }

  .channel-name {
    font-size: 18px;
  }

  .channel-meta {
    flex-wrap: wrap;
    font-size: 12px;
  }

  .section-card {
    padding: 12px 14px;
  }

  .field-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .fields-grid-float {
    grid-template-columns: 1fr;
  }

  .keyword-tags-readonly {
    justify-content: flex-start;
  }
}
</style>
