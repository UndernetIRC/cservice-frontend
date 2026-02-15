<template>
  <div class="channel-settings-form space-y-6">
    <!-- Group sections -->
    <div v-for="group in visibleGroups" :key="group.id" class="space-y-3">
      <h3
        data-testid="group-header"
        class="text-sm font-semibold text-gray-400 uppercase tracking-wider"
      >
        {{ group.label }}
      </h3>

      <!-- Float Limit group: split toggle from sub-fields -->
      <template v-if="group.id === 'floatlim'">
        <div
          v-if="floatLimToggleField"
          :class="[
            'py-3 px-4 rounded-md transition-all',
            isDirty(floatLimToggleField.key)
              ? 'border-l-2 border-cyan-500 bg-slate-800/50'
              : 'border-l-2 border-transparent',
          ]"
        >
          <div class="settings-field-row flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-200">{{
                floatLimToggleField.label
              }}</label>
              <p class="text-xs text-gray-500 mt-0.5">{{ floatLimToggleField.description }}</p>
            </div>
            <el-switch
              :model-value="formData[floatLimToggleField.key] as boolean"
              active-color="#06b6d4"
              @update:model-value="
                (val: boolean) => onFieldChange(floatLimToggleField!.key, val)
              "
            />
          </div>
        </div>

        <!-- Sub-fields with collapse transition -->
        <el-collapse-transition>
          <div v-show="isFloatLimEnabled" class="float-sub-fields space-y-3 pl-4 border-l-2 border-gray-700 ml-2">
            <div
              v-for="field in floatSubFields"
              :key="field.key"
              :class="[
                'py-3 px-4 rounded-md transition-all',
                isDirty(field.key)
                  ? 'border-l-2 border-cyan-500 bg-slate-800/50'
                  : 'border-l-2 border-transparent',
              ]"
            >
              <div class="settings-field-row flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium text-gray-200">{{ field.label }}</label>
                  <p class="text-xs text-gray-500 mt-0.5">{{ field.description }}</p>
                  <p
                    v-if="field.validation.min !== undefined && field.validation.max !== undefined"
                    class="text-xs text-gray-600 mt-0.5"
                  >
                    Range: {{ field.validation.min }} – {{ field.validation.max }}
                  </p>
                </div>
                <el-input-number
                  :model-value="formData[field.key] as number"
                  :min="field.validation.min"
                  :max="field.validation.max"
                  size="small"
                  class="settings-field-control ml-4"
                  @update:model-value="
                    (val: number | undefined) => {
                      if (val !== undefined && val !== null) onFieldChange(field.key, val)
                    }
                  "
                />
              </div>
              <p v-if="errors[field.key]" class="text-xs text-red-400 mt-1">
                {{ errors[field.key] }}
              </p>
            </div>
          </div>
        </el-collapse-transition>
      </template>

      <!-- Standard groups -->
      <template v-else>
        <div
          v-for="field in group.fields"
          :key="field.key"
          :class="[
            'py-3 px-4 rounded-md transition-all',
            isDirty(field.key)
              ? 'border-l-2 border-cyan-500 bg-slate-800/50'
              : 'border-l-2 border-transparent',
          ]"
        >
          <div class="settings-field-row flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <label class="text-sm font-medium text-gray-200">{{ field.label }}</label>
              <p class="text-xs text-gray-500 mt-0.5">{{ field.description }}</p>
            </div>

            <!-- Boolean: el-switch -->
            <el-switch
              v-if="field.type === 'boolean'"
              :model-value="formData[field.key] as boolean"
              active-color="#06b6d4"
              class="settings-field-control ml-4 flex-shrink-0"
              @update:model-value="(val: boolean) => onFieldChange(field.key, val)"
            />

            <!-- Number: el-input-number -->
            <div v-else-if="field.type === 'number'" class="settings-field-control ml-4 flex-shrink-0">
              <el-input-number
                :model-value="formData[field.key] as number"
                :min="field.validation.min"
                :max="field.validation.max"
                size="small"
                @update:model-value="
                  (val: number | undefined) => {
                    if (val !== undefined && val !== null) onFieldChange(field.key, val)
                  }
                "
              />
              <p
                v-if="field.validation.min !== undefined && field.validation.max !== undefined"
                class="text-xs text-gray-600 mt-0.5 text-right"
              >
                Range: {{ field.validation.min }} – {{ field.validation.max }}
              </p>
            </div>

            <!-- Select (userflags): el-radio-group -->
            <el-radio-group
              v-else-if="field.type === 'select'"
              :model-value="formData[field.key] as number"
              size="small"
              class="settings-field-control ml-4 flex-shrink-0"
              @update:model-value="(val: string | number | boolean | undefined) => onFieldChange(field.key, Number(val))"
            >
              <el-radio-button
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </el-radio-button>
            </el-radio-group>

            <!-- Keywords: tag input -->
            <div v-else-if="field.key === 'keywords'" class="settings-field-control ml-4 flex-shrink-0 max-w-sm w-full">
              <div class="keyword-tags-container">
                <el-tag
                  v-for="(tag, index) in keywordTags"
                  :key="index"
                  closable
                  :disable-transitions="false"
                  size="default"
                  class="keyword-tag"
                  @close="removeKeyword(index)"
                >
                  {{ tag }}
                </el-tag>
                <input
                  v-model="keywordInput"
                  class="keyword-input"
                  placeholder="Add keyword..."
                  @keydown.enter.prevent="addKeyword"
                  @keydown.space.prevent="addKeyword"
                  @keydown.,="addKeyword"
                  @blur="addKeyword"
                />
              </div>
              <div class="flex justify-between mt-1">
                <p v-if="errors.keywords" class="text-xs text-red-400">
                  {{ errors.keywords }}
                </p>
                <span class="text-xs text-gray-600 ml-auto">
                  {{ keywordCharCount }} / {{ field.validation.maxLength }}
                </span>
              </div>
            </div>

            <!-- String: el-input -->
            <el-input
              v-else-if="field.type === 'string'"
              :model-value="formData[field.key] as string"
              :type="field.key === 'description' ? 'textarea' : field.key === 'url' ? 'url' : 'text'"
              :maxlength="field.validation.maxLength"
              show-word-limit
              :rows="field.key === 'description' ? 3 : undefined"
              class="settings-field-control ml-4 flex-shrink-0 max-w-sm"
              @update:model-value="(val: string) => onFieldChange(field.key, val)"
            />
          </div>

          <!-- Inline validation error (keywords handles its own) -->
          <p v-if="errors[field.key] && field.key !== 'keywords'" class="text-xs text-red-400 mt-1">
            {{ errors[field.key] }}
          </p>
        </div>
      </template>
    </div>

    <!-- Sticky save bar -->
    <div
      v-if="dirtyCount > 0"
      :class="[
        'save-bar sticky bottom-0 z-10 mt-6 p-4 border-t border-gray-700 rounded-b-lg shadow-lg transition-colors duration-300',
        saveSuccess ? 'bg-emerald-900/50' : 'bg-slate-800',
      ]"
    >
      <span class="text-sm text-gray-300 whitespace-nowrap">
        <span class="font-semibold text-cyan-400">{{ dirtyCount }}</span>
        {{ dirtyCount === 1 ? 'change' : 'changes' }}
      </span>
      <div class="save-bar-actions">
        <el-button :disabled="isSaving" size="small" @click="handleCancel"> Cancel </el-button>
        <el-button
          type="primary"
          :loading="isSaving"
          :disabled="isSaveDisabled"
          size="small"
          class="save-btn"
          @click="handleSave"
        >
          Save
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ChannelSettings, UpdateChannelSettingsRequest } from '@/types/api'
import { getVisibleGroups, validateField } from '@/composables/useChannelSettings'
import type { SettingField } from '@/composables/useChannelSettings'
import apiService from '@/services/api'

interface Props {
  settings: ChannelSettings
  accessLevel: number
  channelId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [dirtyFields: UpdateChannelSettingsRequest]
  cancel: []
}>()

// --- Reactive State ---

const formData = ref<ChannelSettings>({ ...props.settings })
const dirtyFields = ref<Set<keyof ChannelSettings>>(new Set())
const errors = reactive<Partial<Record<keyof ChannelSettings, string | null>>>({})
const isSaving = ref(false)
const saveSuccess = ref(false)
const keywordInput = ref('')

// --- Computed ---

const visibleGroups = computed(() => getVisibleGroups(props.accessLevel, true))

const dirtyCount = computed(() => dirtyFields.value.size)

const hasErrors = computed(() =>
  Object.values(errors).some((e) => e !== null && e !== undefined),
)

const isSaveDisabled = computed(() => dirtyCount.value === 0 || hasErrors.value || isSaving.value)

const isFloatLimEnabled = computed(() => formData.value.floatlim)

const floatLimToggleField = computed<SettingField | undefined>(() =>
  visibleGroups.value
    .find((g) => g.id === 'floatlim')
    ?.fields.find((f) => f.key === 'floatlim'),
)

const floatSubFields = computed<SettingField[]>(
  () =>
    visibleGroups.value
      .find((g) => g.id === 'floatlim')
      ?.fields.filter((f) => f.key !== 'floatlim') || [],
)

// --- Float Limit Sub-Fields ---

const FLOAT_SUB_FIELDS: (keyof ChannelSettings)[] = [
  'floatgrace',
  'floatmargin',
  'floatmax',
  'floatperiod',
]

watch(isFloatLimEnabled, (newVal) => {
  if (!newVal) {
    for (const key of FLOAT_SUB_FIELDS) {
      ;(formData.value as Record<string, unknown>)[key] = props.settings[key]
      dirtyFields.value.delete(key)
      delete errors[key]
    }
    dirtyFields.value = new Set(dirtyFields.value)
  }
})

// --- Keywords Tag Helpers ---

function normalizeKeywords(value: string | undefined | null): string {
  if (!value) return ''
  return value.split(',').map((k) => k.trim()).filter(Boolean).join(',')
}

const keywordTags = computed<string[]>(() => {
  const raw = formData.value.keywords as string
  if (!raw || !raw.trim()) return []
  return raw.split(',').map((k) => k.trim()).filter(Boolean)
})

const keywordCharCount = computed(() => (formData.value.keywords as string)?.length ?? 0)

function addKeyword() {
  const tag = keywordInput.value.replace(/[,\s]/g, '').trim()
  if (!tag) return
  keywordInput.value = ''
  const current = keywordTags.value
  if (current.includes(tag)) return // no duplicates
  const updated = [...current, tag].join(',')
  onFieldChange('keywords', updated)
}

function removeKeyword(index: number) {
  const updated = keywordTags.value.filter((_, i) => i !== index).join(',')
  onFieldChange('keywords', updated)
}

// --- Methods ---

function onFieldChange(
  key: keyof ChannelSettings,
  value: ChannelSettings[keyof ChannelSettings],
) {
  ;(formData.value as Record<string, unknown>)[key] = value

  const originalValue = props.settings[key]
  const isEqual =
    key === 'keywords'
      ? normalizeKeywords(value as string) === normalizeKeywords(originalValue as string)
      : value === originalValue

  if (isEqual) {
    dirtyFields.value.delete(key)
    delete errors[key]
  } else {
    dirtyFields.value.add(key)
    const error = validateField(key, value)
    errors[key] = error
  }

  dirtyFields.value = new Set(dirtyFields.value)
}

function isDirty(key: keyof ChannelSettings): boolean {
  return dirtyFields.value.has(key)
}

async function handleSave() {
  // Validate all dirty fields before save
  for (const key of dirtyFields.value) {
    const error = validateField(key, formData.value[key])
    errors[key] = error
  }
  if (hasErrors.value) return

  isSaving.value = true
  try {
    // TODO: Validate concurrent edit handling — check if API uses optimistic locking
    // (e.g., If-Match / ETag) to prevent stale overwrites
    const payload: UpdateChannelSettingsRequest = {}
    for (const key of dirtyFields.value) {
      ;(payload as Record<string, unknown>)[key] = formData.value[key]
    }

    await apiService.updateChannelSettings(props.channelId, payload)

    // Brief emerald flash on save bar
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)

    emit('save', payload)

    // Reset dirty tracking
    dirtyFields.value = new Set()
    for (const key of Object.keys(errors)) {
      delete errors[key as keyof ChannelSettings]
    }
  } catch (err: unknown) {
    const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
    const message =
      (data?.error as { message?: string })?.message ||
      (data?.message as string) ||
      'Failed to save settings'
    ElMessage.error(message)
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  formData.value = { ...props.settings }
  dirtyFields.value = new Set()
  keywordInput.value = ''
  for (const key of Object.keys(errors)) {
    delete errors[key as keyof ChannelSettings]
  }
  emit('cancel')
}

// Watch for external settings prop changes (e.g., after parent re-fetches)
watch(
  () => props.settings,
  (newSettings) => {
    formData.value = { ...newSettings }
    dirtyFields.value = new Set()
    for (const key of Object.keys(errors)) {
      delete errors[key as keyof ChannelSettings]
    }
  },
  { deep: true },
)

// Expose for testing
defineExpose({
  formData,
  dirtyFields,
  dirtyCount,
  errors,
  isFloatLimEnabled,
  isSaveDisabled,
  onFieldChange,
  handleSave,
  handleCancel,
})
</script>

<style scoped>
.save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.save-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.save-btn {
  --el-button-bg-color: #06b6d4;
  --el-button-border-color: #06b6d4;
  --el-button-hover-bg-color: #0891b2;
  --el-button-hover-border-color: #0891b2;
}

.keyword-tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  background-color: #1e293b;
  border: 1px solid #334155;
  min-height: 38px;
  transition: border-color 0.15s;
}

.keyword-tags-container:focus-within {
  border-color: #06b6d4;
}

.keyword-tag {
  --el-tag-bg-color: rgba(6, 182, 212, 0.15);
  --el-tag-border-color: rgba(6, 182, 212, 0.3);
  --el-tag-text-color: #67e8f9;
  --el-tag-hover-color: #06b6d4;
}

.keyword-input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  background: transparent;
  color: #f1f5f9;
  font-size: 13px;
  padding: 2px 4px;
}

.keyword-input::placeholder {
  color: #64748b;
}

/* ===== Mobile Responsive ===== */
@media (max-width: 640px) {
  .settings-field-row {
    flex-direction: column;
    align-items: stretch !important;
    gap: 8px;
  }

  .settings-field-control {
    margin-left: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  .float-sub-fields {
    padding-left: 8px !important;
    margin-left: 0 !important;
  }
}
</style>
