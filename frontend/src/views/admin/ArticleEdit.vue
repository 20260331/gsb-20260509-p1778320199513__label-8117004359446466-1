<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <div class="p-6 border-b border-slate-200 dark:border-slate-700">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white">
        {{ isEdit ? '编辑文章' : '创建文章' }}
      </h2>
    </div>

    <div class="p-6">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <n-form-item label="文章标题" path="title">
              <n-input v-model:value="formData.title" placeholder="请输入文章标题" />
            </n-form-item>

            <n-form-item label="文章摘要" path="summary">
              <n-input
                v-model:value="formData.summary"
                type="textarea"
                placeholder="请输入文章摘要"
                :rows="3"
              />
            </n-form-item>

            <n-form-item label="文章内容" path="content">
              <n-input
                v-model:value="formData.content"
                type="textarea"
                placeholder="请输入文章内容（支持 HTML）"
                :rows="15"
              />
            </n-form-item>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <n-form-item label="发布状态" path="status">
              <n-select v-model:value="formData.status" :options="statusOptions" />
            </n-form-item>

            <n-form-item label="文章分类" path="categoryId">
              <n-select
                v-model:value="formData.categoryId"
                :options="categoryOptions"
                placeholder="选择分类"
                clearable
              />
            </n-form-item>

            <n-form-item label="文章标签" path="tagIds">
              <n-select
                v-model:value="formData.tagIds"
                :options="tagOptions"
                placeholder="选择标签"
                multiple
                clearable
              />
            </n-form-item>

            <n-form-item label="封面图片">
              <n-upload
                :max="1"
                :custom-request="handleUpload"
                list-type="image-card"
                :default-file-list="defaultFileList"
                @remove="handleRemoveCover"
              >
                点击上传
              </n-upload>
            </n-form-item>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <n-button @click="router.back()">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '发布文章' }}
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, type FormInst, type UploadCustomRequestOptions } from 'naive-ui'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const isEdit = computed(() => !!route.params.id)

const formData = ref({
  title: '',
  summary: '',
  content: '',
  status: 'draft',
  categoryId: null as number | null,
  tagIds: [] as number[],
  coverImage: ''
})

const defaultFileList = ref<any[]>([])
const categoryOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已归档', value: 'archived' }
]

const rules = {
  title: { required: true, message: '请输入文章标题', trigger: 'blur' },
  content: { required: true, message: '请输入文章内容', trigger: 'blur' }
}

const handleUpload = async ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  try {
    const response = await api.upload.image(file.file as File) as any
    formData.value.coverImage = response.url
    onFinish()
    message.success('上传成功')
  } catch (error) {
    onError()
    message.error('上传失败')
  }
}

const handleRemoveCover = () => {
  formData.value.coverImage = ''
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true

    const data = {
      title: formData.value.title,
      content: formData.value.content,
      summary: formData.value.summary,
      status: formData.value.status,
      categoryId: formData.value.categoryId,
      tagIds: formData.value.tagIds,
      coverImage: formData.value.coverImage
    }

    if (isEdit.value) {
      await api.articles.update(Number(route.params.id), data)
      message.success('修改成功')
    } else {
      await api.articles.create(data)
      message.success('创建成功')
    }
    router.push('/admin/articles')
  } catch (error: any) {
    if (error?.message) {
      message.error(error.message)
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const [categoriesRes, tagsRes] = await Promise.all([
      api.categories.list(),
      api.tags.list()
    ])

    categoryOptions.value = ((categoriesRes as any).categories || []).map((c: any) => ({
      label: c.name,
      value: c.id
    }))

    tagOptions.value = ((tagsRes as any).tags || []).map((t: any) => ({
      label: t.name,
      value: t.id
    }))

    if (isEdit.value) {
      const response = await api.articles.get(Number(route.params.id)) as any
      const article = response.article
      formData.value = {
        title: article.title,
        summary: article.summary || '',
        content: article.content,
        status: article.status,
        categoryId: article.categoryId,
        tagIds: article.tags?.map((t: any) => t.id) || [],
        coverImage: article.coverImage || ''
      }
      if (article.coverImage) {
        defaultFileList.value = [{ id: '1', status: 'finished', url: article.coverImage }]
      }
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})
</script>
