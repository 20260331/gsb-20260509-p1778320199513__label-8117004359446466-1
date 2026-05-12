<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
    <div class="text-center px-4">
      <h1 class="text-9xl font-bold gradient-text mb-4">404</h1>
      <p class="text-2xl text-slate-600 dark:text-slate-300 mb-8">页面不存在</p>
      <router-link to="/">
        <n-button type="primary" size="large">返回首页</n-button>
      </router-link>
    </div>
  </div>
</template>
