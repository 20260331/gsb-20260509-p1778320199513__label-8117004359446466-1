import axios, { type AxiosError } from 'axios'
import { createDiscreteApi } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const { message: discreteMessage } = createDiscreteApi(['message'])

const http = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

let isHandling401 = false

http.interceptors.request.use(
    (config) => {
        const userStore = useUserStore()
        if (userStore.token) {
            config.headers.Authorization = `Bearer ${userStore.token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

http.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError<{ error: string }>) => {
        const message = error.response?.data?.error || error.message || '请求失败'

        if (error.response?.status === 401 && !isHandling401) {
            const userStore = useUserStore()

            if (userStore.initialized) {
                isHandling401 = true
                const wasLoggedIn = userStore.isLoggedIn
                userStore.logout()

                if (wasLoggedIn) {
                    discreteMessage.warning('登录已过期，请重新登录')
                    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
                }
                setTimeout(() => { isHandling401 = false }, 0)
            }
        }

        return Promise.reject(new Error(message))
    }
)

// Auth API
const auth = {
    login: (email: string, password: string) =>
        http.post('/auth/login', { email, password }),
    register: (username: string, email: string, password: string) =>
        http.post('/auth/register', { username, email, password }),
    profile: () => http.get('/auth/profile'),
    updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
        http.put('/auth/profile', data),
    changePassword: (currentPassword: string, newPassword: string) =>
        http.put('/auth/password', { currentPassword, newPassword })
}

// Articles API
const articles = {
    list: (params?: { page?: number; limit?: number; category?: number; tag?: number; search?: string; status?: string }) =>
        http.get('/articles', { params }),
    get: (id: number) => http.get(`/articles/${id}`),
    create: (data: { title: string; content: string; summary?: string; coverImage?: string; categoryId?: number; status?: string; tagIds?: number[] }) =>
        http.post('/articles', data),
    update: (id: number, data: { title?: string; content?: string; summary?: string; coverImage?: string; categoryId?: number; status?: string; tagIds?: number[] }) =>
        http.put(`/articles/${id}`, data),
    delete: (id: number) => http.delete(`/articles/${id}`)
}

// Categories API
const categories = {
    list: () => http.get('/categories'),
    get: (id: number) => http.get(`/categories/${id}`),
    create: (data: { name: string; description?: string }) => http.post('/categories', data),
    update: (id: number, data: { name?: string; description?: string }) => http.put(`/categories/${id}`, data),
    delete: (id: number) => http.delete(`/categories/${id}`)
}

// Tags API
const tags = {
    list: () => http.get('/tags'),
    get: (id: number) => http.get(`/tags/${id}`),
    create: (data: { name: string }) => http.post('/tags', data),
    update: (id: number, data: { name: string }) => http.put(`/tags/${id}`, data),
    delete: (id: number) => http.delete(`/tags/${id}`)
}

// Users API
const users = {
    list: (params?: { page?: number; limit?: number }) => http.get('/users', { params }),
    get: (id: number) => http.get(`/users/${id}`),
    update: (id: number, data: { username?: string; email?: string; role?: string; bio?: string }) =>
        http.put(`/users/${id}`, data),
    delete: (id: number) => http.delete(`/users/${id}`)
}

// Settings API
const settings = {
    get: () => http.get('/settings'),
    update: (data: Record<string, string>) => http.put('/settings', { settings: data })
}

// Upload API
const upload = {
    image: (file: File) => {
        const formData = new FormData()
        formData.append('image', file)
        return http.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}

export default {
    auth,
    articles,
    categories,
    tags,
    users,
    settings,
    upload
}
