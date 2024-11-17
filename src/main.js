import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import { Icon } from '@iconify/vue'
import { createPinia } from 'pinia'

const pinia = createPinia()

const app = createApp(App)

app.component('Icon', Icon)
app.use(pinia)
app.use(router)
app.mount('#app')
