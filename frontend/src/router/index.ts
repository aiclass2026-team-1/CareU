import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ScaffoldHomeView from '@/views/ScaffoldHomeView.vue'
import { hasUploadFlowActive } from '@/utils/flowContext'

/**
 * Care U - Router Configuration (Phase 6 Formal Routing & Preview Coexistence)
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'splash',
    component: () => import('@/views/SplashView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/loading-1',
    name: 'loading-one',
    component: () => import('@/views/LoadingOneView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/questionnaire',
    name: 'questionnaire',
    component: () => import('@/views/QuestionnaireView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('@/views/ReportView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/scaffold-home',
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
    meta: { hideLayout: true },
  },
  {
    path: '/preview/home',
    name: 'preview-home',
    component: () => import('@/views/HomeView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/preview/loading-1',
    name: 'preview-loading-one',
    component: () => import('@/views/LoadingOneView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/preview/questionnaire',
    name: 'preview-questionnaire',
    component: () => import('@/views/QuestionnaireView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/preview/report',
    name: 'preview-report',
    component: () => import('@/views/ReportView.vue'),
    meta: { hideLayout: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from) => {
  // 正式路由守衛檢查 (Preview 路由不強制阻擋)
  const isPreview = to.path.startsWith('/preview/')

  if (!isPreview) {
    if (to.path === '/loading-1') {
      if (!hasUploadFlowActive()) {
        return '/home'
      }
    }
    if (to.path === '/questionnaire') {
      const mode = to.query.mode
      if (mode !== 'full' && mode !== 'supplement') {
        return { path: '/questionnaire', query: { mode: 'full' }, replace: true }
      }
      if (mode === 'supplement' && !hasUploadFlowActive()) {
        return '/home'
      }
    }
  }
  return true
})

export default router


