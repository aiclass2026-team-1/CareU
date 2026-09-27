import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ScaffoldHomeView from '@/views/ScaffoldHomeView.vue'

/**
 * Care U - Phase 3 Scaffold Router Configuration
 *
 * 【階段規範與邊界】
 * 1. 僅配置 2 個最小技術驗證路由，驗證 RouterLink 切換與視圖載入。
 * 2. 暫採 Hash History (createWebHashHistory) 作為骨架執行選擇；
 *    正式整站 URL、守衛與 History 模式留待 Phase 6（Routing & Page Flow）定案。
 * 3. 路由名稱與內容明確標記為 scaffold 驗證用途，不預先建立業務路由。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'scaffold-home',
    component: ScaffoldHomeView,
  },
  {
    path: '/scaffold-verify',
    name: 'scaffold-verify',
    component: () => import('@/views/ScaffoldAboutView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

