import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

interface User {
    id: number
    username: string
    email: string
    role: 'admin' | 'editor' | 'user'
    avatar?: string
    bio?: string
}

export const useUserStore = defineStore('user', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)

    const isLoggedIn = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'editor')

    async function login(email: string, password: string) {
        const response = await api.auth.login(email, password)
        user.value = response.user
        token.value = response.token
        return response
    }

    async function register(username: string, email: string, password: string) {
        const response = await api.auth.register(username, email, password)
        user.value = response.user
        token.value = response.token
        return response
    }

    async function fetchProfile() {
        if (!token.value) return
        try {
            const response = await api.auth.profile()
            user.value = response.user
        } catch {
            logout()
        }
    }

    function logout() {
        user.value = null
        token.value = null
    }

    return {
        user,
        token,
        isLoggedIn,
        isAdmin,
        login,
        register,
        fetchProfile,
        logout
    }
}, {
    persist: {
        paths: ['token']
    }
})
