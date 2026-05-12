<template>
  <div class="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="flex-1">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            标签: #{{ tag?.name }}
          </h1>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <n-spin size="large" />
        </div>

        <div v-else-if="articles.length === 0" class="text-center py-12">
          <n-icon size="64" class="text-slate-300 dark:text-slate-600 mb-4">
            <DocumentTextOutline />
          </n-icon>
          <p class="text-slate-500 dark:text-slate-400">该标签下暂无文章</p>
        </div>

        <div v-else class="grid md:grid-cols-2 gap-6">
          <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        </div>
      </div>

      <div class="w-full lg:w-80">
        <Sidebar />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import ArticleCard from '@/components/ArticleCard.vue'
import Sidebar from '@/components/Sidebar.vue'
import { DocumentTextOutline } from '@vicons/ionicons5'

const route = useRoute()
const tag = ref<any>(null)
const articles = ref<any[]>([])
const loading = ref(true)

const loadData = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const [tagRes, articlesRes] = await Promise.all([
      api.tags.get(id),
      api.articles.list({ tag: id })
    ])
    tag.value = (tagRes as any).tag
    articles.value = (articlesRes as any).articles || []
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
watch(() => route.params.id, loadData)
</script>
