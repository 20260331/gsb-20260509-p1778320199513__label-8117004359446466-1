<template>
  <router-link
    :to="`/article/${article.id}`"
    class="block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover group"
  >
    <!-- Cover Image -->
    <div class="aspect-video bg-gradient-to-br from-primary-400 to-purple-500 relative overflow-hidden">
      <img
        v-if="article.coverImage"
        :src="article.coverImage"
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <n-icon size="48" class="text-white/50">
          <ImageOutline />
        </n-icon>
      </div>
      <!-- Category Badge -->
      <div v-if="article.category" class="absolute top-4 left-4">
        <span class="px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium backdrop-blur-sm">
          {{ article.category.name }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Title -->
      <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {{ article.title }}
      </h3>

      <!-- Summary -->
      <p class="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
        {{ article.summary }}
      </p>

      <!-- Meta -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2">
          <n-avatar round :size="24">
            {{ article.author?.username?.charAt(0).toUpperCase() }}
          </n-avatar>
          <span class="text-slate-600 dark:text-slate-300">{{ article.author?.username }}</span>
        </div>
        <div class="flex items-center gap-4 text-slate-400">
          <span class="flex items-center gap-1">
            <n-icon size="14"><TimeOutline /></n-icon>
            {{ formatDate(article.createdAt) }}
          </span>
          <span class="flex items-center gap-1">
            <n-icon size="14"><EyeOutline /></n-icon>
            {{ article.viewCount }}
          </span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="article.tags?.length" class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="tag in article.tags.slice(0, 3)"
          :key="tag.id"
          class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs"
        >
          #{{ tag.name }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { ImageOutline, TimeOutline, EyeOutline } from '@vicons/ionicons5'

interface Article {
  id: number
  title: string
  summary: string
  coverImage?: string
  viewCount: number
  createdAt: string
  author?: { username: string }
  category?: { id: number; name: string }
  tags?: { id: number; name: string }[]
}

defineProps<{ article: Article }>()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
