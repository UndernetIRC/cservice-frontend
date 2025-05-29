<template>
  <el-dialog
    v-model="isVisible"
    title="Security Settings"
    width="900px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="security-settings-modal"
  >
    <SecuritySettings />

    <template #footer>
      <div class="flex justify-end">
        <button
          @click="handleClose"
          class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SecuritySettings from './SecuritySettings.vue'
import { useSecurityStore } from '@/stores/security'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const securityStore = useSecurityStore()
const isVisible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue
  },
)

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

function handleClose() {
  // Clear any messages when closing
  securityStore.clearMessages()
  isVisible.value = false
}
</script>

<style>
.security-settings-modal .el-dialog {
  margin-top: 5vh !important;
}

.security-settings-modal .el-dialog__body {
  padding: 0 !important;
}
</style>
