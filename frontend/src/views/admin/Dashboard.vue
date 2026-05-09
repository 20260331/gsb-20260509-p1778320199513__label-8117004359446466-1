<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-slate-800 dark:text-white mt-1">{{ stat.value }}</p>
          </div>
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor]">
            <n-icon :size="24" :color="stat.iconColor">
              <component :is="stat.icon" />
            </n-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Articles & Quick Actions -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Recent Articles -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg text-slate-800 dark:text-white">最近文章</h3>
          <router-link to="/admin/articles" class="text-primary-600 dark:text-primary-400 text-sm hover:underline">
            查看全部
          </router-link>
        </div>
        <div v-if="loading" class="flex justify-center py-8">
          <n-spin size="medium" />
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="article in recentArticles"
            :key="article.id"
            class="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-800 dark:text-white truncate">{{ article.title }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ formatDate(article.createdAt) }}
              </p>
            </div>
            <n-tag :type="getStatusType(article.status)" size="small">
              {{ getStatusLabel(article.status) }}
            </n-tag>
          </div>
          <div v-if="recentArticles.length === 0" class="text-center py-8 text-slate-500">
            暂无文章
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-4">快捷操作</h3>
        <div class="space-y-3">
          <router-link to="/admin/articles/create">
            <n-button type="primary" block>
              <template #icon><n-icon><AddOutline /></n-icon></template>
              写新文章
            </n-button>
          </router-link>
          <router-link to="/admin/categories">
            <n-button secondary block>
              <template #icon><n-icon><FolderOutline /></n-icon></template>
              管理分类
            </n-button>
          </router-link>
          <router-link to="/admin/tags">
            <n-button secondary block>
              <template #icon><n-icon><PricetagsOutline /></n-icon></template>
              管理标签
            </n-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import {
  DocumentTextOutline,
  FolderOutline,
  PricetagsOutline,
  PeopleOutline,
  AddOutline
} from '@vicons/ionicons5'

const loading = ref(true)
const recentArticles = ref<any[]>([])
const stats = ref([
  { label: '文章总数', value: 0, icon: DocumentTextOutline, bgColor: 'bg-blue-100 dark:bg-blue-900', iconColor: '#0ea5e9' },
  { label: '分类数量', value: 0, icon: FolderOutline, bgColor: 'bg-green-100 dark:bg-green-900', iconColor: '#22c55e' },
  { label: '标签数量', value: 0, icon: PricetagsOutline, bgColor: 'bg-purple-100 dark:bg-purple-900', iconColor: '#a855f7' },
  { label: '用户数量', value: 0, icon: PeopleOutline, bgColor: 'bg-orange-100 dark:bg-orange-900', iconColor: '#f97316' }
])

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'published': return 'success'
    case 'draft': return 'warning'
    case 'archived': return 'default'
    default: return 'default'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'published': return '已发布'
    case 'draft': return '草稿'
    case 'archived': return '已归档'
    default: return status
  }
}

onMounted(async () => {
  try {
    const [articlesRes, categoriesRes, tagsRes, usersRes] = await Promise.all([
      api.articles.list({ limit: 5, status: '' }),
      api.categories.list(),
      api.tags.list(),
      api.users.list({ limit: 1 })
    ])

    recentArticles.value = (articlesRes as any).articles || []
    stats.value[0].value = (articlesRes as any).pagination?.total || 0
    stats.value[1].value = (categoriesRes as any).categories?.length || 0
    stats.value[2].value = (tagsRes as any).tags?.length || 0
    stats.value[3].value = (usersRes as any).pagination?.total || 0
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>
