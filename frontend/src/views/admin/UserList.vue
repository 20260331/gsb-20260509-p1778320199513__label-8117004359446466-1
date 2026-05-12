<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <div class="p-6 border-b border-slate-200 dark:border-slate-700">
      <h2 class="text-xl font-bold text-slate-800 dark:text-white">用户管理</h2>
    </div>

    <n-data-table
      :columns="columns"
      :data="users"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: any) => row.id"
      @update:page="handlePageChange"
    />

    <n-modal v-model:show="showModal" preset="dialog" title="编辑用户">
      <n-form ref="formRef" :model="formData" label-placement="top">
        <n-form-item label="用户名">
          <n-input v-model:value="formData.username" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="formData.email" />
        </n-form-item>
        <n-form-item label="角色">
          <n-select v-model:value="formData.role" :options="roleOptions" />
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
import { NButton, NTag, NSpace, NPopconfirm, useMessage } from 'naive-ui'
import api from '@/api'

const message = useMessage()
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const users = ref<any[]>([])
const formData = ref({ username: '', email: '', role: 'user' })

const pagination = ref({ page: 1, pageSize: 10, pageCount: 1 })
const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '用户', value: 'user' }
]

const columns = [
  { title: '用户名', key: 'username' },
  { title: '邮箱', key: 'email' },
  {
    title: '角色', key: 'role', width: 100,
    render: (row: any) => {
      const map: any = { admin: 'error', editor: 'warning', user: 'default' }
      const label: any = { admin: '管理员', editor: '编辑', user: '用户' }
      return h(NTag, { type: map[row.role], size: 'small' }, () => label[row.role])
    }
  },
  { title: '注册时间', key: 'createdAt', width: 120, render: (row: any) => new Date(row.createdAt).toLocaleDateString('zh-CN') },
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

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await api.users.list({ page: pagination.value.page, limit: pagination.value.pageSize }) as any
    users.value = response.users || []
    pagination.value.pageCount = response.pagination?.pages || 1
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadUsers()
}

const handleEdit = (row: any) => {
  editingId.value = row.id
  formData.value = { username: row.username, email: row.email, role: row.role }
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    saving.value = true
    await api.users.update(editingId.value!, formData.value)
    message.success('修改成功')
    showModal.value = false
    loadUsers()
  } catch (error: any) {
    message.error(error.message || '修改失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await api.users.delete(id)
    message.success('删除成功')
    loadUsers()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

onMounted(loadUsers)
</script>
