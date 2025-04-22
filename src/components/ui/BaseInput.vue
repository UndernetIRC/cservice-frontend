<template>
  <div class="relative">
    <input
      v-bind="$attrs"
      :id="id"
      :type="type"
      :value="modelValue"
      @input="(event) => $emit('update:modelValue', (event.target as HTMLInputElement).value)"
      placeholder=" "
      class="peer block w-full px-3 py-3 appearance-none rounded-md border bg-transparent placeholder-transparent text-text-primary focus:outline-none focus:ring-0 sm:text-sm"
      :class="
        error ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-primary'
      "
    />
    <label
      :for="id"
      class="absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] left-3 px-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 pointer-events-none"
      :class="['bg-slate-800', error ? 'text-red-500' : 'text-slate-500 peer-focus:text-slate-100']"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import {} from 'vue'

interface Props {
  modelValue: string | number
  label: string
  id?: string
  type?: string
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  type: 'text',
  error: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

if (import.meta.env.DEV) {
  console.log('BaseInput props:', props)
  console.log('BaseInput emit defined:', emit)
}
</script>

<style scoped>
/* Targeted fix for 1Password autofill background */
input[data-com-onepassword-filled='true'], /* Explicitly check attribute value if needed */
input[data-com-onepassword-filled] /* Or just presence of attribute */ {
  /* Force text color */
  -webkit-text-fill-color: #f1f5f9 !important; /* text-primary */
  /* Use box-shadow to overlay the background */
  -webkit-box-shadow: 0 0 0 30px #1e293b inset !important; /* slate-800 */
  box-shadow: 0 0 0 30px #1e293b inset !important; /* slate-800 */
  /* Explicitly set caret color */
  caret-color: #f1f5f9 !important; /* text-primary */
}
</style>
