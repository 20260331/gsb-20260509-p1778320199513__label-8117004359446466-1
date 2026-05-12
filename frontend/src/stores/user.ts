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
    const initialized = ref(false)
    let initPromise: Promise<void> | null = null

    const isLoggedIn = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'editor')

    async function initialize(): Promise<'restored' | 'expired' | 'none'> {
        if (initPromise) {
            return initPromise
        }

        initPromise = _doInitialize()
        return initPromise
    }

    async function _doInitialize(): Promise<'restored' | 'expired' | 'none'> {
        if (!token.value) {
            initialized.value = true
            return 'none'
        }
        if (user.value) {
            initialized.value = true
            return 'none'
        }
        try {
            const response = await api.auth.profile()
            user.value = response.user
            initialized.value = true
            return 'restored'
        } catch {
            user.value = null
            token.value = null
            initialized.value = true
            return 'expired'
        }
    }

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

    function logout() {
        user.value = null
        token.value = null
    }

    return {
        user,
        token,
        initialized,
        isLoggedIn,
        isAdmin,
        initialize,
        login,
        register,
        logout
    }
}, {
    persist: {
        paths: ['token']
    }
})
