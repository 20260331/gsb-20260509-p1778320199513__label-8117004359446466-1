import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('@/views/Home.vue'),
                meta: { title: '首页' }
            },
            {
                path: 'article/:id',
                name: 'Article',
                component: () => import('@/views/Article.vue'),
                meta: { title: '文章详情' }
            },
            {
                path: 'category/:id',
                name: 'Category',
                component: () => import('@/views/Category.vue'),
                meta: { title: '分类文章' }
            },
            {
                path: 'tag/:id',
                name: 'Tag',
                component: () => import('@/views/Tag.vue'),
                meta: { title: '标签文章' }
            },
            {
                path: 'about',
                name: 'About',
                component: () => import('@/views/About.vue'),
                meta: { title: '关于' }
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: { title: '注册' }
    },
    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/admin/Dashboard.vue'),
                meta: { title: '仪表盘' }
            },
            {
                path: 'articles',
                name: 'ArticleList',
                component: () => import('@/views/admin/ArticleList.vue'),
                meta: { title: '文章管理' }
            },
            {
                path: 'articles/create',
                name: 'ArticleCreate',
                component: () => import('@/views/admin/ArticleEdit.vue'),
                meta: { title: '创建文章' }
            },
            {
                path: 'articles/:id/edit',
                name: 'ArticleEdit',
                component: () => import('@/views/admin/ArticleEdit.vue'),
                meta: { title: '编辑文章' }
            },
            {
                path: 'categories',
                name: 'CategoryList',
                component: () => import('@/views/admin/CategoryList.vue'),
                meta: { title: '分类管理' }
            },
            {
                path: 'tags',
                name: 'TagList',
                component: () => import('@/views/admin/TagList.vue'),
                meta: { title: '标签管理' }
            },
            {
                path: 'users',
                name: 'UserList',
                component: () => import('@/views/admin/UserList.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: 'settings',
                name: 'Settings',
                component: () => import('@/views/admin/Settings.vue'),
                meta: { title: '系统设置' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '页面不存在' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

router.beforeEach(async (to, _from, next) => {
    // Set page title
    document.title = to.meta.title ? `${to.meta.title} - My Blog` : 'My Blog'

    const userStore = useUserStore()

    // Check authentication
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
    }

    // Check admin role
    if (to.meta.requiresAdmin) {
        if (userStore.token && !userStore.user) {
            try {
                await userStore.fetchProfile()
            } catch {
                next({ name: 'Home' })
                return
            }
        }
        if (!userStore.isAdmin) {
            next({ name: 'Home' })
            return
        }
    }

    next()
})

export default router
