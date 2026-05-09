<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <!-- Header -->
    <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white">文章管理</h2>
      <router-link to="/admin/articles/create">
        <n-button type="primary">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          写新文章
        </n-button>
      </router-link>
    </div>

    <!-- Filters -->
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4 flex-wrap">
      <n-select
        v-model:value="filters.status"
        :options="statusOptions"
        placeholder="状态"
        clearable
        class="w-32"
        @update:value="loadArticles"
      />
      <n-input
        v-model:value="filters.search"
        placeholder="搜索文章..."
        clearable
        class="w-64"
        @keyup.enter="loadArticles"
      >
        <template #prefix><n-icon><SearchOutline /></n-icon></template>
      </n-input>
    </div>

    <!-- Table -->
    <n-data-table
      :columns="columns"
      :data="articles"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: any) => row.id"
      @update:page="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NSpace, NPopconfirm, useMessage } from 'naive-ui'
import api from '@/api'
import { AddOutline, SearchOutline } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

const loading = ref(true)
const articles = ref<any[]>([])
const filters = ref({ status: null, search: '' })

const pagination = ref({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  showSizePicker: false,
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
})

const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '已归档', value: 'archived' }
]

const columns = [
  {
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true }
  },
  {
    title: '分类',
    key: 'category',
    width: 100,
    render: (row: any) => row.category?.name || '-'
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => {
      const typeMap: any = { published: 'success', draft: 'warning', archived: 'default' }
      const labelMap: any = { published: '已发布', draft: '草稿', archived: '已归档' }
      return h(NTag, { type: typeMap[row.status], size: 'small' }, () => labelMap[row.status])
    }
  },
  {
    title: '浏览量',
    key: 'viewCount',
    width: 80
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 120,
    render: (row: any) => new Date(row.createdAt).toLocaleDateString('zh-CN')
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: any) => {
      return h(NSpace, null, () => [
        h(NButton, { size: 'small', onClick: () => router.push(`/admin/articles/${row.id}/edit`) }, () => '编辑'),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
          trigger: () => h(NButton, { size: 'small', type: 'error' }, () => '删除'),
          default: () => '确定删除这篇文章吗？'
        })
      ])
    }
  }
]

const loadArticles = async () => {
  loading.value = true
  try {
    const response = await api.articles.list({
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      status: filters.value.status || undefined,
      search: filters.value.search || undefined
    }) as any
    articles.value = response.articles || []
    pagination.value.pageCount = response.pagination?.pages || 1
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadArticles()
}

const handleDelete = async (id: number) => {
  try {
    await api.articles.delete(id)
    message.success('删除成功')
    loadArticles()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadArticles)
</script>
