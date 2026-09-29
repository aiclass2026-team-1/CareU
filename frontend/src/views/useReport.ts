import { ref, computed, watch } from 'vue'

import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { getLiveReportData } from '@/utils/flowContext'
import {
  type Category,
  type Product,
  type Profile,
  type ResultItem,
  createCatalog,
  createProfiles,
} from './reportData'

export function useReport() {
  const route = useRoute()
  const isPreview = computed(() => {
    return route?.path ? route.path.startsWith('/preview/') : false
  })

  const catalog = createCatalog()
  const profiles = createProfiles(catalog)

  const activeProfileKey = ref<'a' | 'b' | 'c' | 'g'>('a')
  const isMember = ref<boolean>(false)
  const selectedCategoryForChart = ref<string | null>(null)
  const selectedProducts = ref<Record<string, string>>({})
  const browsingProducts = ref<Record<string, string>>({})
  const expandedCandidateDirections = ref<Set<string>>(new Set())

  // Auth modal state
  const isAuthModalOpen = ref<boolean>(false)
  const authMode = ref<'login' | 'register' | 'forgot'>('login')
  const authEmail = ref<string>('')
  const authPassword = ref<string>('')
  const authConfirmPassword = ref<string>('')
  const isPasswordVisible = ref<boolean>(false)
  const authErrorMessage = ref<string>('')
  let authCallback: (() => void) | null = null

  // Toast & Demo panel
  const { isToastVisible, toastMessage, showToast } = useToast(3600)
  const isDemoPanelOpen = ref<boolean>(false)

  // Cart dialog state
  const isCartModalOpen = ref<boolean>(false)
  const cartConfirmMode = ref<boolean>(false)
  const cartProductIds = ref<string[]>([])

  // Member logout confirmation modal state
  const isMemberModalOpen = ref<boolean>(false)

  const liveReport = computed(() => {
    if (isPreview.value) return null
    return getLiveReportData()
  })

  const liveProfile = computed<Profile | null>(() => {
    if (!liveReport.value || !Array.isArray(liveReport.value.priorities) || liveReport.value.priorities.length === 0) {
      return null
    }

    const priorities = liveReport.value.priorities
    const results: ResultItem[] = []
    const productDirections: string[] = []

    priorities.forEach((p: any, idx: number) => {
      const catId = String(p.efficacyId || idx + 1)
      const rawScore = typeof p.score === 'number' && !isNaN(p.score) ? p.score : null
      results.push({
        categoryId: catId,
        score: rawScore !== null ? rawScore : 0,
        summary: p.description || `${p.efficacyName} 是維持良好健康狀態的重要方向。`,
        evidence: [
          { label: '評估指標', value: p.efficacyName },
          { label: '評估得分', value: rawScore !== null ? `${rawScore}分` : '資料評估中' },
        ],
        reason: p.exclusionNote || p.description || '依據問卷數據綜合評估。',
      })


      // Inject category if not present
      if (!catalog.categories.find(c => c.id === catId)) {
        catalog.categories.push({ id: catId, name: p.efficacyName })
      }

      // Inject product recommendations
      if (Array.isArray(p.recommendations) && p.recommendations.length > 0) {
        productDirections.push(catId)
        catalog.candidates[catId] = []
        p.recommendations.forEach((rec: any) => {
          const pid = String(rec.productId)
          catalog.candidates[catId].push(pid)
          if (!catalog.products[pid]) {
            catalog.products[pid] = {
              id: pid,
              name: rec.productName,
              ingredients: rec.efficacyClaim || '專利有效成分',
              license: '',
              approvalDate: '',
              applicant: '',
              status: '',
              category: p.efficacyName,
              warnings: rec.warnings || null,
              precautions: rec.precautions || '',
              mechanismTag: rec.mechanismTag || null,
              evidenceScore: rec.evidenceScore || 3,
              sourceFlags: { pregnant: false, breastfeeding: false, allergy: false },
              claims: {},
              price: 980,
              unitPrice: 980,
              purchaseQuantity: 1,
              isDemoPrice: false,
            }
          }
        })
      }
    })

    return {
      id: 'live',
      name: '個人化健康分析',
      source: '正式健康問卷與整合評估',
      summaryPublic: `已為您完成健康問卷評估。依據您填寫的生活與身體資料，發現 ${results.length} 項需要優先關注的保健方向。`,
      summaryMember: '已解鎖完整個人化報告與保健品建議方案。',
      results,
      missing: [],
      productDirections,
      withheld: {},
    }
  })

  const currentProfile = computed<Profile>(() => {
    if (liveProfile.value) {
      return liveProfile.value
    }
    return profiles[activeProfileKey.value] || profiles.a
  })


  const currentSummary = computed<string>(() => {
    return isMember.value
      ? currentProfile.value.summaryMember
      : currentProfile.value.summaryPublic
  })

  function category(id: string): Category {
    return (
      catalog.categories.find(c => c.id === String(id)) || {
        id: String(id),
        name: '未知分類',
      }
    )
  }

  function product(id: string): Product | undefined {
    return catalog.products[id]
  }

  function candidatesFor(id: string): string[] {
    const raw = (catalog.candidates[id] || []).filter(pid => !!catalog.products[pid])
    const limit = currentProfile.value.candidateLimits?.[id] ?? 3
    return raw.slice(0, limit)
  }

  function resetSelection() {
    selectedProducts.value = {}
    browsingProducts.value = {}
    expandedCandidateDirections.value.clear()
    currentProfile.value.productDirections.forEach(id => {
      const candidates = candidatesFor(id)
      const chosen = candidates.find(
        p => !Object.values(selectedProducts.value).includes(p)
      )
      if (chosen) {
        selectedProducts.value[id] = chosen
      }
    })
  }

  watch(
    () => currentProfile.value,
    () => {
      resetSelection()
    },
    { immediate: true }
  )


  function uniqueSelected(): Product[] {
    const ids = Array.from(
      new Set(Object.values(selectedProducts.value).filter(Boolean))
    )
    return ids.map(id => catalog.products[id]).filter(Boolean) as Product[]
  }

  function bundleTotal(): number {
    return uniqueSelected().reduce((acc, p) => acc + p.price, 0)
  }

  function formatMoney(v: number): string {
    return 'NT$ ' + new Intl.NumberFormat('zh-TW').format(v)
  }

  function supplementationReason(cid: string, p: Product): string {
    const ing = p.ingredients || ''
    let focus = '來源所列成分'
    if (/膳食纖維|半乳甘露/.test(ing)) focus = '膳食纖維'
    else if (/乳酸|乳桿|益生|比菲德|菌/.test(ing)) focus = '益生菌相關成分'
    else if (/異黃酮/.test(ing)) focus = '大豆異黃酮'
    else if (/人蔘|人參/.test(ing)) focus = '人蔘配醣體'
    else if (/GABA|γ-胺基丁酸/.test(ing)) focus = 'GABA 等來源所列成分'
    else if (/魚油|EPA|DHA/.test(ing)) focus = '魚油相關成分'
    else if (/鈣/.test(ing)) focus = '鈣相關成分'

    const context =
      cid === '2'
        ? '依飲食與排便紀錄，'
        : cid === '5'
        ? '依飲食與活動紀錄，'
        : cid === '7'
        ? '依作息與休息紀錄，'
        : '依目前提供的資料，'
    return `${context}可了解${focus}的補充選項，作為日常保健比較參考。是否需要補充仍待個人適用性確認。`
  }

  const doseTones = ['#82B3DA', '#E9B17D', '#B9A5CF', '#9DB8AB', '#E2A6A4']
  function doseTone(productId: string): string {
    const keys = Object.keys(catalog.products)
    const idx = keys.indexOf(productId)
    return doseTones[(idx >= 0 ? idx : 0) % doseTones.length]
  }

  function isTablet(productId: string): boolean {
    return /錠/.test(catalog.products[productId]?.name || '')
  }

  const chartRows = computed(() => {
    return currentProfile.value.results.slice(0, 8).map((r, index) => {
      const isLocked = !isMember.value && index < 2
      return {
        ...r,
        rank: index + 1,
        isLocked,
        isTopThree: index < 3,
      }
    })
  })

  const selectedChartItem = computed<ResultItem | null>(() => {
    if (!selectedCategoryForChart.value) return null
    const found = currentProfile.value.results.find(
      r => r.categoryId === selectedCategoryForChart.value
    )
    if (!found) return null
    const rank = currentProfile.value.results.indexOf(found)
    const isAllowed = isMember.value || rank >= 2
    return isAllowed ? found : null
  })

  function toggleChartCategory(categoryId: string) {
    if (selectedCategoryForChart.value === categoryId) {
      selectedCategoryForChart.value = null
    } else {
      selectedCategoryForChart.value = categoryId
    }
  }

  const insightRows = computed(() => {
    return currentProfile.value.results.slice(0, 5).map((r, index) => {
      const isLocked = !isMember.value && index < 2
      return {
        ...r,
        rank: index + 1,
        isLocked,
        isTopThree: index < 3,
      }
    })
  })

  const recommendationDirections = computed(() => {
    return currentProfile.value.results
      .slice(0, 5)
      .filter(
        r =>
          currentProfile.value.productDirections.includes(r.categoryId) &&
          candidatesFor(r.categoryId).length > 0
      )
  })

  const deferredDirections = computed(() => {
    return currentProfile.value.results.slice(0, 5).filter(
      r =>
        !currentProfile.value.productDirections.includes(r.categoryId) ||
        !candidatesFor(r.categoryId).length
    )
  })


  function setBrowsingProduct(categoryId: string, productId: string) {
    browsingProducts.value[categoryId] = productId
  }

  function getActiveProductForDirection(categoryId: string): Product | undefined {
    const pid =
      browsingProducts.value[categoryId] ||
      selectedProducts.value[categoryId] ||
      candidatesFor(categoryId)[0]
    return catalog.products[pid]
  }

  function selectProduct(categoryId: string, productId: string) {
    if (!isMember.value) return
    if (!currentProfile.value.productDirections.includes(categoryId)) return
    if (!candidatesFor(categoryId).includes(productId)) return

    const isDuplicate = Object.entries(selectedProducts.value).some(
      ([dir, id]) => dir !== categoryId && id === productId
    )

    if (isDuplicate) {
      showToast('這個品項已在組合中，不會重複加入。')
      return
    }

    selectedProducts.value[categoryId] = productId
    browsingProducts.value[categoryId] = productId
    expandedCandidateDirections.value.delete(categoryId)
    showToast('已更新品項選擇與組合金額')
  }

  function removeProduct(categoryId: string) {
    delete selectedProducts.value[categoryId]
    expandedCandidateDirections.value.delete(categoryId)
    showToast('已移除品項，推薦理由仍會保留')
  }

  function toggleCandidates(categoryId: string) {
    if (expandedCandidateDirections.value.has(categoryId)) {
      expandedCandidateDirections.value.delete(categoryId)
    } else {
      expandedCandidateDirections.value.add(categoryId)
    }
  }

  function openAuth(
    mode: 'login' | 'register' | 'forgot' = 'login',
    callback?: () => void
  ) {
    authMode.value = mode
    authErrorMessage.value = ''
    authCallback = callback || null
    isPasswordVisible.value = false
    authEmail.value = ''
    authPassword.value = ''
    authConfirmPassword.value = ''
    isAuthModalOpen.value = true
  }

  function closeAuth() {
    isAuthModalOpen.value = false
    authErrorMessage.value = ''
    authCallback = null
  }

  function setAuthMode(mode: 'login' | 'register' | 'forgot') {
    authMode.value = mode
    authErrorMessage.value = ''
    authPassword.value = ''
    authConfirmPassword.value = ''
    isPasswordVisible.value = false
  }

  function togglePasswordVisibility() {
    isPasswordVisible.value = !isPasswordVisible.value
  }

  function completeAuth() {
    isMember.value = true
    closeAuth()
    showToast('登入成功，完整報告已解鎖')
    if (authCallback) {
      const cb = authCallback
      authCallback = null
      cb()
    }
  }

  function handleAuthSubmit() {
    const email = authEmail.value.trim()
    const password = authPassword.value
    const confirm = authConfirmPassword.value

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      authErrorMessage.value = '請輸入格式正確的示範電子郵件。'
      return
    }

    if (authMode.value !== 'forgot' && password.length < 8) {
      authErrorMessage.value = '示範密碼請至少輸入 8 個字元。'
      return
    }

    if (authMode.value === 'register' && confirm !== password) {
      authErrorMessage.value = '兩次輸入的密碼不同，請再確認。'
      return
    }

    if (authMode.value === 'forgot') {
      authErrorMessage.value = ''
      showToast('示意流程已完成，不會實際寄送重設郵件。')
      authEmail.value = ''
      setAuthMode('login')
      return
    }

    completeAuth()
  }

  function quickDemoLogin() {
    completeAuth()
  }

  function logout() {
    isMember.value = false
    selectedCategoryForChart.value = null
    cartProductIds.value = []
    showToast('已回到未登入狀態')
  }

  function openMemberModal() {
    isMemberModalOpen.value = true
  }

  function closeMemberModal() {
    isMemberModalOpen.value = false
  }

  function confirmLogout() {
    isMemberModalOpen.value = false
    logout()
  }

  function switchProfile(key: 'a' | 'b' | 'c' | 'g') {
    activeProfileKey.value = key
    selectedCategoryForChart.value = null
    cartProductIds.value = []
    resetSelection()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(`已切換為${currentProfile.value.name}，組合與購物車已重設`)
  }

  function restoreDefaultBundle() {
    resetSelection()
    showToast('已重設此情境的預設組合')
  }

  function clearBundle() {
    if (!isMember.value) {
      openAuth('login', () => {
        selectedProducts.value = {}
        browsingProducts.value = {}
        expandedCandidateDirections.value.clear()
      })
      return
    }
    selectedProducts.value = {}
    browsingProducts.value = {}
    expandedCandidateDirections.value.clear()
    showToast('組合已清空，可重新選擇品項')
  }

  function openCart(confirm = false) {
    if (!isMember.value) {
      openAuth('login', () => openCart(false))
      return
    }
    cartConfirmMode.value = confirm
    isCartModalOpen.value = true
  }

  function closeCart() {
    isCartModalOpen.value = false
  }

  function confirmPurchase() {
    const selected = uniqueSelected()
    const newIds = selected.map(p => p.id)
    cartProductIds.value = Array.from(
      new Set([...cartProductIds.value, ...newIds])
    )
    cartConfirmMode.value = false
    showToast('已完成購買示範，未扣款或建立訂單')
  }

  function scrollToSection(targetId: string, fallbackId?: string) {
    let el = document.getElementById(targetId)
    if (!el && fallbackId) {
      el = document.getElementById(fallbackId)
    }
    if (!el) return

    // 精準定位：若 target 在某個 .section-head 內部，定位到該 .section-head；若 target 本身包含 .section-head，定位到自身 .section-head；否則以 target 頂部為基準
    const sectionHead = el.closest('.section-head') || el.querySelector('.section-head') || el
    const top = Math.max(0, window.scrollY + sectionHead.getBoundingClientRect().top - 24)
    const isReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: isReduced ? 'auto' : 'smooth' })
  }

  return {
    catalog,
    profiles,
    activeProfileKey,
    isMember,
    selectedCategoryForChart,
    selectedProducts,
    browsingProducts,
    expandedCandidateDirections,
    isAuthModalOpen,
    authMode,
    authEmail,
    authPassword,
    authConfirmPassword,
    isPasswordVisible,
    authErrorMessage,
    toastMessage,
    isToastVisible,
    isDemoPanelOpen,
    isCartModalOpen,
    cartConfirmMode,
    cartProductIds,
    isMemberModalOpen,
    openMemberModal,
    closeMemberModal,
    confirmLogout,
    currentProfile,
    currentSummary,
    chartRows,
    selectedChartItem,
    insightRows,
    recommendationDirections,
    deferredDirections,
    category,
    product,
    candidatesFor,
    resetSelection,
    uniqueSelected,
    bundleTotal,
    formatMoney,
    supplementationReason,
    doseTone,
    isTablet,
    toggleChartCategory,
    setBrowsingProduct,
    getActiveProductForDirection,
    selectProduct,
    removeProduct,
    toggleCandidates,
    openAuth,
    closeAuth,
    setAuthMode,
    togglePasswordVisibility,
    handleAuthSubmit,
    quickDemoLogin,
    logout,
    showToast,
    switchProfile,
    restoreDefaultBundle,
    clearBundle,
    openCart,
    closeCart,
    confirmPurchase,
    scrollToSection,
  }
}
