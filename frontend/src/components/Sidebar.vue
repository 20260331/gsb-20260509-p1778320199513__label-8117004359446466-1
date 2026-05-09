<template>
  <aside class="space-y-6">
    <!-- About Card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-4">关于博客</h3>
      <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
        {{ settingsStore.siteDescription }}
      </p>
    </div>

    <!-- Categories -->
    <div v-if="categories.length > 0" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-4">分类</h3>
      <div v-if="loading" class="flex justify-center py-4">
        <n-spin size="small" />
      </div>
      <div v-else class="space-y-2">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/category/${category.id}`"
          class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
        >
          <span class="text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {{ category.name }}
          </span>
          <span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {{ category.articleCount }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- Tags Cloud -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-4">标签</h3>
      <div v-if="loading" class="flex justify-center py-4">
        <n-spin size="small" />
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <router-link
          v-for="tag in tags"
          :key="tag.id"
          :to="`/tag/${tag.id}`"
          class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          #{{ tag.name }}
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api'

interface Category {
  id: number
  name: string
  articleCount: number
}

interface Tag {
  id: number
  name: string
}

const settingsStore = useSettingsStore()
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [categoriesRes, tagsRes] = await Promise.all([
      api.categories.list(),
      api.tags.list()
    ])
    categories.value = (categoriesRes as any).categories || []
    tags.value = (tagsRes as any).tags || []
  } catch (error) {
    console.error('Failed to load sidebar data:', error)
  } finally {
    loading.value = false
  }
})
</script>
