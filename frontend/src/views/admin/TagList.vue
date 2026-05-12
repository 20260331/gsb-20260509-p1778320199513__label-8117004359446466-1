<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white">标签管理</h2>
      <n-button type="primary" @click="showModal = true; editingId = null; formData.name = ''">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        添加标签
      </n-button>
    </div>

    <n-data-table :columns="columns" :data="tags" :loading="loading" :row-key="(row: any) => row.id" />

    <n-modal v-model:show="showModal" preset="dialog" :title="editingId ? '编辑标签' : '添加标签'">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
        <n-form-item label="标签名称" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入标签名称" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="handleSubmit">确定</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { NButton, NSpace, NPopconfirm, useMessage, type FormInst } from 'naive-ui'
import api from '@/api'
import { AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const tags = ref<any[]>([])
const formRef = ref<FormInst | null>(null)
const formData = ref({ name: '' })
const rules = { name: { required: true, message: '请输入标签名称', trigger: 'blur' } }

const columns = [
  { title: '名称', key: 'name' },
  { title: '文章数', key: 'articleCount', width: 100 },
  {
    title: '操作', key: 'actions', width: 150,
    render: (row: any) => h(NSpace, null, () => [
      h(NButton, { size: 'small', onClick: () => handleEdit(row) }, () => '编辑'),
      h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
        trigger: () => h(NButton, { size: 'small', type: 'error' }, () => '删除'),
        default: () => '确定删除吗？'
      })
    ])
  }
]

const loadTags = async () => {
  loading.value = true
  try {
    const response = await api.tags.list() as any
    tags.value = response.tags || []
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: any) => {
  editingId.value = row.id
  formData.value.name = row.name
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true
    if (editingId.value) {
      await api.tags.update(editingId.value, formData.value)
      message.success('修改成功')
    } else {
      await api.tags.create(formData.value)
      message.success('添加成功')
    }
    showModal.value = false
    loadTags()
  } catch (error: any) {
    if (error?.message) message.error(error.message)
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await api.tags.delete(id)
    message.success('删除成功')
    loadTags()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadTags)
</script>
