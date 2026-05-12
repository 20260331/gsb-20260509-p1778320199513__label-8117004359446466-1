<template>
  <div class="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-sm">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-6">关于</h1>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          欢迎来到 {{ settingsStore.siteTitle }}！
        </p>

        <p class="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
          {{ settingsStore.siteDescription }}
        </p>

        <h2 class="text-xl font-bold text-slate-800 dark:text-white mt-8 mb-4">技术栈</h2>
        <ul class="space-y-2 text-slate-600 dark:text-slate-300">
          <li>前端: Vue 3 + TypeScript + Vite + Naive UI + Tailwind CSS</li>
          <li>后端: Node.js + Express + Sequelize</li>
          <li>数据库: MySQL 8.0</li>
          <li>部署: Docker Compose</li>
        </ul>

        <h2 class="text-xl font-bold text-slate-800 dark:text-white mt-8 mb-4">联系方式</h2>
        <p class="text-slate-600 dark:text-slate-300">
          如有任何问题或建议，请通过以下方式联系我们。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>
