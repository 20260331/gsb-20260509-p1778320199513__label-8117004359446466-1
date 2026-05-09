<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            B
          </div>
        </router-link>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white mt-4">创建账户</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">加入我们的博客社区</p>
      </div>

      <!-- Register Form -->
      <n-card class="shadow-xl">
        <n-form ref="formRef" :model="formData" :rules="rules" @submit.prevent="handleSubmit">
          <n-form-item label="用户名" path="username">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入用户名"
              size="large"
            >
              <template #prefix>
                <n-icon><PersonOutline /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="邮箱" path="email">
            <n-input
              v-model:value="formData.email"
              placeholder="请输入邮箱"
              size="large"
            >
              <template #prefix>
                <n-icon><MailOutline /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password-on="click"
            >
              <template #prefix>
                <n-icon><LockClosedOutline /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="确认密码" path="confirmPassword">
            <n-input
              v-model:value="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password-on="click"
            >
              <template #prefix>
                <n-icon><LockClosedOutline /></n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleSubmit"
          >
            注册
          </n-button>
        </n-form>

        <div class="mt-6 text-center">
          <span class="text-slate-500 dark:text-slate-400">已有账户？</span>
          <router-link to="/login" class="text-primary-600 dark:text-primary-400 hover:underline ml-1">
            立即登录
          </router-link>
        </div>
      </n-card>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <router-link to="/" class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormInst } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { PersonOutline, MailOutline, LockClosedOutline } from '@vicons/ionicons5'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度2-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        return value === formData.value.password
      },
      message: '两次输入的密码不一致',
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    await userStore.register(
      formData.value.username,
      formData.value.email,
      formData.value.password
    )
    message.success('注册成功')
    router.push('/')
  } catch (error: any) {
    if (error?.message) {
      message.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>
