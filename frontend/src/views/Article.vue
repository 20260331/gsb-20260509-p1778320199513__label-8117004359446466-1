<template>
  <div class="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-24">
      <n-spin size="large" />
    </div>

    <!-- Article Content -->
    <article v-else-if="article" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <!-- Cover Image -->
      <div v-if="article.coverImage" class="aspect-video">
        <img :src="article.coverImage" :alt="article.title" class="w-full h-full object-cover" />
      </div>

      <!-- Content -->
      <div class="p-8 md:p-12">
        <!-- Category -->
        <router-link
          v-if="article.category"
          :to="`/category/${article.category.id}`"
          class="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-4 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
        >
          {{ article.category.name }}
        </router-link>

        <!-- Title -->
        <h1 class="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
          {{ article.title }}
        </h1>

        <!-- Meta -->
        <div class="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-sm mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <n-avatar round :size="32">
              {{ article.author?.username?.charAt(0).toUpperCase() }}
            </n-avatar>
            <span>{{ article.author?.username }}</span>
          </div>
          <div class="flex items-center gap-1">
            <n-icon><CalendarOutline /></n-icon>
            <span>{{ formatDate(article.createdAt) }}</span>
          </div>
          <div class="flex items-center gap-1">
            <n-icon><EyeOutline /></n-icon>
            <span>{{ article.viewCount }} 阅读</span>
          </div>
        </div>

        <!-- Content -->
        <div class="article-content prose dark:prose-invert max-w-none" v-html="article.content">
        </div>

        <!-- Tags -->
        <div v-if="article.tags?.length" class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div class="flex flex-wrap gap-2">
            <router-link
              v-for="tag in article.tags"
              :key="tag.id"
              :to="`/tag/${tag.id}`"
              class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              #{{ tag.name }}
            </router-link>
          </div>
        </div>
      </div>
    </article>

    <!-- Not Found -->
    <div v-else class="text-center py-24">
      <n-icon size="64" class="text-slate-300 dark:text-slate-600 mb-4">
        <DocumentTextOutline />
      </n-icon>
      <p class="text-slate-500 dark:text-slate-400 mb-4">文章不存在</p>
      <router-link to="/">
        <n-button type="primary">返回首页</n-button>
      </router-link>
    </div>

    <!-- Navigation -->
    <div class="mt-8">
      <router-link to="/" class="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline">
        <n-icon><ArrowBackOutline /></n-icon>
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { CalendarOutline, EyeOutline, DocumentTextOutline, ArrowBackOutline } from '@vicons/ionicons5'

interface Article {
  id: number
  title: string
  content: string
  summary: string
  coverImage?: string
  viewCount: number
  createdAt: string
  author?: { username: string; bio?: string }
  category?: { id: number; name: string }
  tags?: { id: number; name: string }[]
}

const route = useRoute()
const article = ref<Article | null>(null)
const loading = ref(true)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const loadArticle = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const response = await api.articles.get(id) as any
    article.value = response.article
  } catch (error) {
    console.error('Failed to load article:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadArticle)
watch(() => route.params.id, loadArticle)
</script>
