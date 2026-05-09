import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import './style.css'
import { useUserStore } from './stores/user'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

const userStore = useUserStore()
userStore.fetchProfile()

app.use(router)
app.use(naive)

app.mount('#app')
