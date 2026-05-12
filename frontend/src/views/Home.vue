<template>
  <div class="animate-fade-in">
    <!-- Hero Section -->
    <section class="py-16 md:py-24 relative overflow-hidden">
      <!-- Background Decoration -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-20 left-10 w-72 h-72 bg-primary-400/30 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
      </div>

      <div class="max-w-6xl mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          <span class="gradient-text">{{ settingsStore.siteTitle }}</span>
        </h1>
        <p class="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
          {{ settingsStore.siteDescription }}
        </p>
        <div class="flex justify-center gap-4">
          <n-button type="primary" size="large" @click="scrollToArticles">
            开始阅读
            <template #icon>
              <n-icon><ArrowDownOutline /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section id="articles" class="max-w-6xl mx-auto px-4 py-12">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Articles Grid -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white whitespace-nowrap">
              最新文章
            </h2>
            <n-input
              v-model:value="searchQuery"
              placeholder="搜索文章..."
              class="w-64"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <n-icon><SearchOutline /></n-icon>
              </template>
            </n-input>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex justify-center py-12">
            <n-spin size="large" />
          </div>

          <!-- Empty State -->
          <div v-else-if="articles.length === 0" class="text-center py-12">
            <n-icon size="64" class="text-slate-300 dark:text-slate-600 mb-4">
              <DocumentTextOutline />
            </n-icon>
            <p class="text-slate-500 dark:text-slate-400">暂无文章</p>
          </div>

          <!-- Articles Grid -->
          <div v-else class="grid md:grid-cols-2 gap-6">
            <ArticleCard
              v-for="article in articles"
              :key="article.id"
              :article="article"
            />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-12">
            <n-pagination
              v-model:page="currentPage"
              :page-count="totalPages"
              :page-slot="5"
              @update:page="loadArticles"
            />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="w-full lg:w-80">
          <Sidebar />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api'
import ArticleCard from '@/components/ArticleCard.vue'
import Sidebar from '@/components/Sidebar.vue'
import { ArrowDownOutline, SearchOutline, DocumentTextOutline } from '@vicons/ionicons5'

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

const settingsStore = useSettingsStore()
const articles = ref<Article[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')

const scrollToArticles = () => {
  document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })
}

const loadArticles = async () => {
  loading.value = true
  try {
    const response = await api.articles.list({
      page: currentPage.value,
      limit: 10,
      search: searchQuery.value || undefined
    }) as any
    articles.value = response.articles || []
    totalPages.value = response.pagination?.pages || 1
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadArticles()
}

onMounted(() => {
  loadArticles()
})
</script>
