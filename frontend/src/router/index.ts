import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ScaffoldHomeView from '@/views/ScaffoldHomeView.vue'

/**
 * Care U - Router Configuration
 *
 * 【階段規範與邊界】
 * 1. 骨架與驗收路由：
 *    - '/' (scaffold-home): 骨架占位首頁
 *    - '/scaffold-verify' (scaffold-verify): 骨架路由切換驗證頁
 *    - '/preview/splash' (preview-splash): Phase 4 第一批 入口頁驗收預覽路由 (滿版、hideLayout)
 * 2. 暫採 Hash History (createWebHashHistory) 作為骨架執行選擇；
 *    正式整站 URL、守衛與 History 模式留待 Phase 6（Routing & Page Flow）定案。
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
  {
    path: '/preview/splash',
    name: 'preview-splash',
    component: () => import('@/views/SplashView.vue'),
    meta: {
      hideLayout: true,
    },
  },
  {
    path: '/preview/home',
    name: 'preview-home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      hideLayout: true,
    },
  },
  {
    path: '/preview/loading-1',
    name: 'preview-loading-one',
    component: () => import('@/views/LoadingOneView.vue'),
    meta: {
      hideLayout: true,
    },
  },
  {
    path: '/preview/questionnaire',
    name: 'preview-questionnaire',
    component: () => import('@/views/QuestionnaireView.vue'),
    meta: {
      hideLayout: true,
    },
  },
  {
    path: '/preview/report',
    name: 'preview-report',
    component: () => import('@/views/ReportView.vue'),
    meta: {
      hideLayout: true,
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router


