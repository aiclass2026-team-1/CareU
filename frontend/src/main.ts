import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'

import './assets/styles/tokens.css'
import './assets/styles/fonts.css'
import './assets/styles/common.css'
import './assets/styles/base.css'

/**
 * Care U - Application Entry (Phase 5 Shared Setup)
 *
 * 註冊全域 Tokens、字體宣告、共用 Baseline 樣式，
 * 註冊 Vue Router 與 Pinia 實例，掛載根元件至 #app。
 */
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
