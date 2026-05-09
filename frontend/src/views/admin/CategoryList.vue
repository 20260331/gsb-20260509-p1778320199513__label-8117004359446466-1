<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white">分类管理</h2>
      <n-button type="primary" @click="showModal = true; editingId = null; formData = { name: '', description: '' }">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        添加分类
      </n-button>
    </div>

    <n-data-table :columns="columns" :data="categories" :loading="loading" :row-key="(row: any) => row.id" />

    <!-- Modal -->
    <n-modal v-model:show="showModal" preset="dialog" :title="editingId ? '编辑分类' : '添加分类'">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
        <n-form-item label="分类名称" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入分类名称" />
        </n-form-item>
        <n-form-item label="分类描述" path="description">
          <n-input v-model:value="formData.description" type="textarea" placeholder="请输入分类描述" :rows="3" />
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
const categories = ref<any[]>([])
const formRef = ref<FormInst | null>(null)
const formData = ref({ name: '', description: '' })
const rules = { name: { required: true, message: '请输入分类名称', trigger: 'blur' } }

const columns = [
  { title: '名称', key: 'name' },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
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

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await api.categories.list() as any
    categories.value = response.categories || []
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: any) => {
  editingId.value = row.id
  formData.value = { name: row.name, description: row.description || '' }
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true
    if (editingId.value) {
      await api.categories.update(editingId.value, formData.value)
      message.success('修改成功')
    } else {
      await api.categories.create(formData.value)
      message.success('添加成功')
    }
    showModal.value = false
    loadCategories()
  } catch (error: any) {
    if (error?.message) message.error(error.message)
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await api.categories.delete(id)
    message.success('删除成功')
    loadCategories()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadCategories)
</script>
