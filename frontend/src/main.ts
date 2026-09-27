import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'

import './assets/styles/base.css'

/**
 * Care U - Phase 3 Scaffold Application Entry
 *
 * 註冊 Vue Router 與 Pinia 實例，掛載根元件至 #app。
 */
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
