/* eslint-disable vue/multi-word-component-names */
<template>
  <nav class="pagination flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
    <div class="flex gap-4 items-center">
      <div>
        <label class="sr-only">Items per page</label>
        <select
          v-model.number="localPageSize"
          @change="changeSize"
          class="rounded border border-gray-300 dark:border-gray-600 bg-transparent text-text-primary px-2 py-1"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
      <button
        :disabled="currentPage === 1"
        @click="prevPage"
        class="px-3 py-1 rounded bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <ul class="flex gap-1 mx-2">
        <li v-for="page in pagesToShow" :key="page">
          <button
            @click="goTo(page)"
            :class="{
              'bg-primary text-white': page === currentPage,
              'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300': page !== currentPage,
            }"
            class="px-2 py-1 rounded transition-colors"
          >
            {{ page }}
          </button>
        </li>
      </ul>
      <button
        :disabled="currentPage === totalPages"
        @click="nextPage"
        class="px-3 py-1 rounded bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Define component name for linting (multi-word rule)
defineOptions({ name: 'AppPagination' })
import { ref, computed, watch } from 'vue'

interface Props {
  total: number
  modelValue: number
  pageSize: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [5, 10, 20, 50],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const currentPage = ref(props.modelValue)
const localPageSize = ref(props.pageSize)

const totalPages = computed(() => Math.ceil(props.total / localPageSize.value))

watch(
  () => props.modelValue,
  (val) => {
    currentPage.value = val
  },
)

watch(
  () => props.pageSize,
  (val) => {
    localPageSize.value = val
  },
)

watch(currentPage, (val) => emit('update:modelValue', val))

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function goTo(page: number) {
  currentPage.value = page
}

function changeSize() {
  currentPage.value = 1
  emit('update:pageSize', localPageSize.value)
}

const pagesToShow = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
