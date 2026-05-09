<template>
  <n-config-provider :theme="isDark ? darkTheme : undefined" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <div :class="{ 'dark': isDark }">
              <router-view v-slot="{ Component }">
                <transition name="page" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </div>
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const isDark = computed(() => settingsStore.isDark)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0ea5e9',
    primaryColorHover: '#0284c7',
    primaryColorPressed: '#0369a1',
    primaryColorSuppl: '#38bdf8',
    borderRadius: '8px',
  },
  Button: {
    borderRadiusMedium: '8px',
  },
  Card: {
    borderRadius: '12px',
  },
  Input: {
    borderRadius: '8px',
  },
}
</script>
