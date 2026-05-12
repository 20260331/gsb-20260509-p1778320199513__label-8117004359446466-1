<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
    <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-6">系统设置</h2>

    <n-form ref="formRef" :model="formData" label-placement="left" label-width="120">
      <n-form-item label="网站标题">
        <n-input v-model:value="formData.site_title" placeholder="请输入网站标题" />
      </n-form-item>

      <n-form-item label="网站描述">
        <n-input v-model:value="formData.site_description" type="textarea" placeholder="请输入网站描述" :rows="3" />
      </n-form-item>

      <n-form-item label="网站关键词">
        <n-input v-model:value="formData.site_keywords" placeholder="请输入网站关键词，用逗号分隔" />
      </n-form-item>

      <n-form-item label="页脚文本">
        <n-input v-model:value="formData.footer_text" placeholder="请输入页脚文本" />
      </n-form-item>

      <n-form-item>
        <n-button type="primary" :loading="saving" @click="handleSubmit">
          保存设置
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api'

const message = useMessage()
const settingsStore = useSettingsStore()
const saving = ref(false)

const formData = ref({
  site_title: '',
  site_description: '',
  site_keywords: '',
  footer_text: ''
})

const loadSettings = async () => {
  try {
    const response = await api.settings.get() as any
    const settings = response.settings || {}
    formData.value = {
      site_title: settings.site_title || 'My Blog',
      site_description: settings.site_description || '',
      site_keywords: settings.site_keywords || '',
      footer_text: settings.footer_text || ''
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const handleSubmit = async () => {
  try {
    saving.value = true
    await api.settings.update(formData.value)
    settingsStore.setSiteInfo(formData.value.site_title, formData.value.site_description)
    message.success('设置已保存')
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>
