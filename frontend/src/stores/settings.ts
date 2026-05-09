import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
    const darkMode = ref(false)
    const siteTitle = ref('My Blog')
    const siteDescription = ref('一个现代化的博客系统')

    const isDark = computed(() => darkMode.value)

    function toggleDark() {
        darkMode.value = !darkMode.value
    }

    function setDark(value: boolean) {
        darkMode.value = value
    }

    function setSiteInfo(title: string, description: string) {
        siteTitle.value = title
        siteDescription.value = description
    }

    return {
        darkMode,
        siteTitle,
        siteDescription,
        isDark,
        toggleDark,
        setDark,
        setSiteInfo
    }
}, {
    persist: true
})
