<template>
  <footer class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-auto">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Copyright -->
        <div class="text-slate-500 dark:text-slate-400 text-sm">
          © {{ currentYear }} {{ settingsStore.siteTitle }}. All rights reserved.
        </div>

        <!-- Links -->
        <div class="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <n-icon size="20"><LogoGithub /></n-icon>
          </a>
          <router-link
            to="/about"
            class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
          >
            关于
          </router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { LogoGithub } from '@vicons/ionicons5'

const settingsStore = useSettingsStore()
const currentYear = computed(() => new Date().getFullYear())
</script>
