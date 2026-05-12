<template>
  <div class="min-h-screen flex bg-slate-100 dark:bg-slate-900">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col"
      :class="{ 'hidden md:flex': !sidebarOpen }"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
        <router-link to="/" class="flex items-center gap-2">
          <n-icon size="24" color="#0ea5e9">
            <HomeOutline />
          </n-icon>
          <span class="font-bold text-lg text-slate-800 dark:text-white">Blog Admin</span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          :class="{ 'bg-primary-50 dark:bg-slate-700 text-primary-600 dark:text-primary-400': isActive(item.path) }"
        >
          <n-icon :size="20">
            <component :is="item.icon" />
          </n-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- User Info -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <n-avatar round :size="40">
            {{ userStore.user?.username?.charAt(0).toUpperCase() }}
          </n-avatar>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-800 dark:text-white truncate">
              {{ userStore.user?.username }}
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ userStore.user?.role }}
            </p>
          </div>
          <n-button quaternary circle @click="handleLogout">
            <template #icon>
              <n-icon><LogOutOutline /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Bar -->
      <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <n-button quaternary circle class="md:hidden" @click="sidebarOpen = !sidebarOpen">
            <template #icon>
              <n-icon><MenuOutline /></n-icon>
            </template>
          </n-button>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-white">
            {{ currentPageTitle }}
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <n-button quaternary circle @click="settingsStore.toggleDark">
            <template #icon>
              <n-icon>
                <SunnyOutline v-if="settingsStore.isDark" />
                <MoonOutline v-else />
              </n-icon>
            </template>
          </n-button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useMessage } from 'naive-ui'
import {
  HomeOutline,
  DocumentTextOutline,
  FolderOutline,
  PricetagsOutline,
  PeopleOutline,
  SettingsOutline,
  LogOutOutline,
  MenuOutline,
  SunnyOutline,
  MoonOutline
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const message = useMessage()

const sidebarOpen = ref(true)

const menuItems = [
  { path: '/admin', label: '仪表盘', icon: HomeOutline },
  { path: '/admin/articles', label: '文章管理', icon: DocumentTextOutline },
  { path: '/admin/categories', label: '分类管理', icon: FolderOutline },
  { path: '/admin/tags', label: '标签管理', icon: PricetagsOutline },
  { path: '/admin/users', label: '用户管理', icon: PeopleOutline },
  { path: '/admin/settings', label: '系统设置', icon: SettingsOutline }
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item?.label || '管理后台'
})

const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

const handleLogout = () => {
    userStore.logout()
    message.success('已退出登录')
    router.push({ name: 'Login' })
}
</script>
