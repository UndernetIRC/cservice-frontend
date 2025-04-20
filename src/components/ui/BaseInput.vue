<template>
  <div class="relative">
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="(event) => $emit('update:modelValue', event.target.value)"
      placeholder=" "
      class="peer block w-full px-3 py-3 appearance-none rounded-md border border-slate-600 bg-transparent placeholder-transparent text-text-primary focus:outline-none focus:ring-0 focus:border-primary sm:text-sm"
    />
    <label
      :for="id"
      class="absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] left-3 px-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-500 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-primary peer-focus:bg-white dark:peer-focus:bg-gray-800 pointer-events-none"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, defineEmits } from 'vue'

interface Props {
  modelValue: string
  label: string
  id?: string
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  type: () => 'text',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped></style>
