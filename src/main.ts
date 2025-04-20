import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Import Element Plus and styles
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // For dark mode CSS variables

import './style.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus) // Use Element Plus plugin

app.mount('#app')
