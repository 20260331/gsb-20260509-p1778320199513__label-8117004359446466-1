<template>
  <header class="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
          B
        </div>
        <span class="font-bold text-xl text-slate-800 dark:text-white hidden sm:block">
          {{ settingsStore.siteTitle }}
        </span>
      </router-link>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center gap-6">
        <router-link
          to="/"
          class="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
          :class="{ 'text-primary-600 dark:text-primary-400': $route.path === '/' }"
        >
          首页
        </router-link>
        <router-link
          to="/about"
          class="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
          :class="{ 'text-primary-600 dark:text-primary-400': $route.path === '/about' }"
        >
          关于
        </router-link>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Dark Mode Toggle -->
        <n-button quaternary circle @click="settingsStore.toggleDark">
          <template #icon>
            <n-icon size="20">
              <SunnyOutline v-if="settingsStore.isDark" />
              <MoonOutline v-else />
            </n-icon>
          </template>
        </n-button>

        <!-- User Menu -->
        <template v-if="userStore.isLoggedIn">
          <n-dropdown :options="userMenuOptions" @select="handleUserMenu">
            <n-button quaternary class="!px-2">
              <div class="flex items-center gap-2">
                <n-avatar round :size="32">
                  {{ userStore.user?.username?.charAt(0).toUpperCase() }}
                </n-avatar>
                <span class="hidden sm:block text-slate-700 dark:text-slate-200">
                  {{ userStore.user?.username }}
                </span>
              </div>
            </n-button>
          </n-dropdown>
        </template>
        <template v-else>
          <router-link to="/login">
            <n-button type="primary" secondary>登录</n-button>
          </router-link>
        </template>

        <!-- Mobile Menu -->
        <n-button quaternary circle class="md:hidden" @click="showMobileMenu = true">
          <template #icon>
            <n-icon size="24"><MenuOutline /></n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <n-drawer v-model:show="showMobileMenu" placement="right" :width="280">
      <n-drawer-content title="菜单">
        <div class="flex flex-col gap-2">
          <router-link
            to="/"
            class="px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            @click="showMobileMenu = false"
          >
            首页
          </router-link>
          <router-link
            to="/about"
            class="px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            @click="showMobileMenu = false"
          >
            关于
          </router-link>
        </div>
      </n-drawer-content>
    </n-drawer>
  </header>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import {
  SunnyOutline,
  MoonOutline,
  MenuOutline,
  PersonOutline,
  SettingsOutline,
  LogOutOutline
} from '@vicons/ionicons5'

const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const message = useMessage()

const showMobileMenu = ref(false)

const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const userMenuOptions = [
  {
    label: '管理后台',
    key: 'admin',
    icon: renderIcon(SettingsOutline),
    show: userStore.isAdmin
  },
  {
    label: '个人资料',
    key: 'profile',
    icon: renderIcon(PersonOutline)
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
].filter(item => item.show !== false)

const handleUserMenu = (key: string) => {
  switch (key) {
    case 'admin':
      router.push('/admin')
      break
    case 'profile':
      message.info('个人资料功能开发中')
      break
    case 'logout':
      userStore.logout()
      message.success('已退出登录')
      router.push('/')
      break
  }
}
</script>
