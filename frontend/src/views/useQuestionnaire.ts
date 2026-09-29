import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  clearUploadFlow,
  setSubmissionId,
  getSubmissionId,
  setAssessmentId,
  setLiveReportData,
  getReportId,
} from '@/utils/flowContext'

import { adaptTargetQuestionnairePlan, adaptTargetAnswersToSubmission } from '@/adapters/questionnaireAdapter'
import { liveQuestionnaireService } from '@/services/liveQuestionnaireService'
import { liveReportService } from '@/services/liveReportService'
import type { TargetQuestionnairePlan, QuestionnaireAnswerValue } from '@/types'





export type QuestionnaireMode = 'supplement' | 'full'
export type QuestionnaireStep =
  | 'basic'
  | 'diet'
  | 'activity'
  | 'sleep'
  | 'measurements'
  | 'allergies'
  | 'safety'
  | 'complete'
export type ActiveScreen = 'question' | 'analysis' | 'report'

export interface QuestionnaireAnswers {
  basic?: {
    age?: string
    sex?: 'female' | 'male' | 'other' | string
    weight?: string
  }
  diet?: number | string
  activity?: number | string
  sleep?: number | string
  measurements?: {
    waist?: string
    waistUnknown?: boolean
    systolic?: string
    diastolic?: string
    bpUnknown?: boolean
  }
  allergies?: string[]
  allergyOther?: string
  safety?: {
    pregnant?: '是' | '否' | string
    breastfeeding?: '是' | '否' | string
  }
  [key: string]: any
}

export interface UseQuestionnaireOptions {
  networkBackRef: Ref<HTMLElement | null>
  appRef: Ref<HTMLElement | null>
  questionPanelRef: Ref<HTMLElement | null>
  analysisErrorRef: Ref<HTMLElement | null>
}

const SESSION_STORAGE_KEY = 'careu-questionnaire'

export const baseSteps: QuestionnaireStep[] = ['basic', 'diet', 'activity', 'sleep', 'measurements', 'allergies']
export const supplementSteps: QuestionnaireStep[] = ['diet', 'activity', 'sleep', 'measurements', 'allergies', 'safety']
export const fullProgressOrder: QuestionnaireStep[] = [
  'basic',
  'diet',
  'activity',
  'sleep',
  'measurements',
  'allergies',
  'safety',
  'complete',
]
export const supplementProgressOrder: QuestionnaireStep[] = [
  'diet',
  'activity',
  'sleep',
  'measurements',
  'allergies',
  'safety',
  'complete',
]

export const optionSets = {
  diet: ['充足', '不足', '不確定'],
  activity: ['150 分鐘以上', '75～150 分鐘', '少於 75 分鐘', '幾乎不動'],
  sleep: ['很好', '尚可', '不好', '很差'],
}

export const allergyOptions = [
  '牛奶及乳製品',
  '大豆及其製品',
  '芝麻',
  '黑豆',
  '魚類及其製品',
  '含麩質穀物',
  '乳糖不耐',
  '真菌類（如菇蕈類）',
  '花生／堅果',
  '其他',
  '無已知過敏',
]

export const analysisStages = [
  { text: '正在整理你提供的資料', duration: 1600 },
  { text: '正在理解你的身體訊息', duration: 1800 },
  { text: '正在整理適合你的保健方向', duration: 1800 },
  { text: '正在準備你的個人化報告', duration: 1200 },
]

export function useQuestionnaire({
  networkBackRef,
  appRef,
  questionPanelRef,
  analysisErrorRef,
}: UseQuestionnaireOptions) {

  const router = useRouter()
  const route = useRoute()

  // 畫面與模式
  const activeScreen = ref<ActiveScreen>('question')
  const currentMode = ref<QuestionnaireMode>('full')

  const currentQuestion = ref(0)
  const activeSteps = ref<QuestionnaireStep[]>([...baseSteps, 'complete'])
  const answers = ref<QuestionnaireAnswers>({})
  const validationMessage = ref('')
  const isSubmitting = ref(false)
  const panelAnimationKey = ref(0)

  // Loading-2 狀態
  const analysisStatusText = ref(analysisStages[0].text)
  const isAnalysisChanging = ref(false)
  const isAnalysisErrorVisible = ref(false)

  // Demo 控制面板
  const isDemoPanelOpen = ref(false)

  // ==========================================
  // LIVE FULL MODE CANARY INTEGRATION STATE
  // ==========================================
  const isPlanLoading = ref(false)
  const planError = ref<string | null>(null)
  const rawPlan = ref<TargetQuestionnairePlan | null>(null)
  const rawAnswers = ref<Record<number, { value: QuestionnaireAnswerValue; detailText?: string }>>({})
  const liveStepIndex = ref(0) // 0: basic, 1..N: live question groups, N+1: complete
  const planLoadedGender = ref<'MALE' | 'FEMALE' | null>(null)

  const isPreviewContext = computed(() => {
    return route.path.startsWith('/preview/')
  })

  // LIVE full mode is active ONLY for formal /questionnaire route with mode=full
  const isLiveFullMode = computed(() => {
    return !isPreviewContext.value && currentMode.value === 'full'
  })

  // LIVE supplement mode is active ONLY for formal /questionnaire route with mode=supplement
  const isLiveSupplementMode = computed(() => {
    return !isPreviewContext.value && currentMode.value === 'supplement'
  })

  const isLiveMode = computed(() => {
    return isLiveFullMode.value || isLiveSupplementMode.value
  })

  const livePlanViewModel = computed(() => {
    if (!rawPlan.value) {
      return adaptTargetQuestionnairePlan({
        reportId: null,
        mode: currentMode.value === 'supplement' ? 'supplement' : 'full',
        recognizedMetrics: [],
        missingMetrics: [],
        questions: [],
      })
    }
    return adaptTargetQuestionnairePlan(rawPlan.value)
  })

  // Dynamic Pagination (Hybrid Architecture: Backend pageKey/layoutHint -> Frontend filtered page grouping)
  const livePages = computed<Array<{
    key: string
    layoutHint: 'single' | 'pair_measurement' | 'pair_binary' | 'standalone'
    questions: typeof livePlanViewModel.value.questions
  }>>(() => {
    const questions = livePlanViewModel.value.questions
    if (!questions || questions.length === 0) return []

    const pageMap = new Map<string, typeof questions>()
    questions.forEach((q) => {
      const pk = q.pageKey || q.groupKey || 'default'
      const existing = pageMap.get(pk) || []
      existing.push(q)
      pageMap.set(pk, existing)
    })

    const list: Array<{
      key: string
      layoutHint: 'single' | 'pair_measurement' | 'pair_binary' | 'standalone'
      questions: typeof questions
    }> = []

    pageMap.forEach((qList, pk) => {
      if (qList.length === 0) return
      let layoutHint: 'single' | 'pair_measurement' | 'pair_binary' | 'standalone' = 'single'
      if (qList.some((q) => q.layoutHint === 'pair_measurement')) {
        layoutHint = 'pair_measurement'
      } else if (qList.some((q) => q.layoutHint === 'pair_binary')) {
        layoutHint = 'pair_binary'
      } else if (qList.some((q) => q.layoutHint === 'standalone')) {
        layoutHint = 'standalone'
      } else if (qList[0]?.layoutHint) {
        layoutHint = qList[0].layoutHint
      }

      list.push({
        key: pk,
        layoutHint,
        questions: qList,
      })
    })

    return list
  })

  const totalLivePages = computed(() => livePages.value.length)
  const currentLivePageIndex = computed(() => {
    if (isLiveFullMode.value) {
      return Math.max(0, liveStepIndex.value - 1)
    }
    return liveStepIndex.value
  })
  const currentLivePage = computed(() => {
    return livePages.value[currentLivePageIndex.value] || null
  })
  const currentLivePageQuestions = computed(() => {
    return currentLivePage.value?.questions || []
  })

  // Retain compatibility alias for template/tests
  const totalLiveGroups = computed(() => totalLivePages.value)
  const currentLiveGroupIndex = computed(() => currentLivePageIndex.value)
  const currentLiveGroupQuestions = computed(() => currentLivePageQuestions.value)

  // Progress State Machine: PREPARING -> QUESTIONNAIRE -> COMPLETE -> ANALYSIS
  const isPreparing = computed(() => {
    return isLiveMode.value && isPlanLoading.value && (!rawPlan.value || totalLivePages.value === 0)
  })

  const isBasicStep = computed(() => {
    return (
      isLiveFullMode.value &&
      currentStep.value === 'basic' &&
      !isPlanLoading.value
    )
  })

  const isLivePlanStep = computed(() => {
    if (isPreparing.value) return false
    if (isLiveFullMode.value) {
      return liveStepIndex.value > 0 && liveStepIndex.value <= totalLivePages.value
    }
    if (isLiveSupplementMode.value) {
      return liveStepIndex.value < totalLivePages.value
    }
    return false
  })

  const isLiveCompleteStep = computed(() => {
    if (isPreparing.value) return false
    if (isLiveFullMode.value) {
      return liveStepIndex.value > totalLivePages.value
    }
    if (isLiveSupplementMode.value) {
      return liveStepIndex.value >= totalLivePages.value
    }
    return false
  })





  // 內部變數與計時器
  let timers: number[] = []
  let isDisposed = false



  const checkReducedMotion = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const clearTimers = () => {
    timers.forEach((id) => clearTimeout(id))
    timers = []
  }

  const later = (fn: () => void, delay: number) => {
    const reduced = checkReducedMotion()
    const actualDelay = reduced ? Math.min(delay, 500) : delay
    const id = window.setTimeout(() => {
      if (!isDisposed) fn()
    }, actualDelay)
    timers.push(id)
    return id
  }

  const showScreen = (screen: ActiveScreen) => {
    activeScreen.value = screen
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: checkReducedMotion() ? 'auto' : 'smooth' })
    }
  }

  const persistState = () => {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          mode: currentMode.value,
          answers: answers.value,
          currentQuestion: currentQuestion.value,
          liveStepIndex: liveStepIndex.value,
          rawAnswers: rawAnswers.value,
        }),
      )
    } catch (_) {}
  }

  const restoreState = (mode: QuestionnaireMode) => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved?.mode === mode && saved?.answers) {
          answers.value = saved.answers
          currentQuestion.value = Number.isInteger(saved.currentQuestion) ? saved.currentQuestion : 0
          liveStepIndex.value = Number.isInteger(saved.liveStepIndex) ? saved.liveStepIndex : 0
          if (saved.rawAnswers && typeof saved.rawAnswers === 'object') {
            rawAnswers.value = saved.rawAnswers
          }
          return
        }
      }
    } catch (_) {}
    answers.value = {}
    currentQuestion.value = 0
    liveStepIndex.value = 0
    rawAnswers.value = {}
  }

  const clearSessionState = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (_) {}
  }

  const computeSteps = () => {
    activeSteps.value = currentMode.value === 'supplement' ? [...supplementSteps] : [...baseSteps]
    if (currentMode.value === 'full' && answers.value.basic?.sex === 'female') {
      activeSteps.value.push('safety')
    }
    activeSteps.value.push('complete')
    if (currentQuestion.value >= activeSteps.value.length) {
      currentQuestion.value = Math.max(0, activeSteps.value.length - 1)
    }
  }

  const currentStep = computed<QuestionnaireStep>(() => {
    if (isLiveMode.value) {
      if (isLiveFullMode.value && liveStepIndex.value === 0) return 'basic'
      if (isLiveCompleteStep.value) return 'complete'
      return 'measurements'
    }
    return activeSteps.value[currentQuestion.value] || 'basic'
  })

  const progressPercent = computed<number>(() => {
    if (isLiveMode.value) {
      if (isPreparing.value) {
        return 0
      }
      if (isLiveFullMode.value) {
        const totalSteps = 1 + totalLivePages.value + 1 // basic + pages + complete
        const current = liveStepIndex.value + 1
        return Math.min(100, Math.round((current / totalSteps) * 100))
      }
      if (isLiveSupplementMode.value) {
        const totalSteps = totalLivePages.value + 1 // pages + complete
        const current = liveStepIndex.value + 1
        return Math.min(100, Math.round((current / totalSteps) * 100))
      }
    }
    const progressOrder = currentMode.value === 'supplement' ? supplementProgressOrder : fullProgressOrder
    const step = currentStep.value
    const position = Math.max(0, progressOrder.indexOf(step))
    return ((position + 1) / progressOrder.length) * 100
  })

  const questionHeaderInfo = computed(() => {
    if (isPreparing.value) {
      return {
        eyebrow: isLiveSupplementMode.value ? '資料補充' : '健康問卷',
        title: isLiveSupplementMode.value ? '我們已讀取你提供的體檢資料' : '先從幾個日常問題開始',
        intro: isLiveSupplementMode.value ? '正在取得需補充的問卷題目，請稍候...' : '正在取得問卷題目，請稍候...',
      }
    }
    if (isLiveSupplementMode.value) {
      if (isLiveCompleteStep.value) {
        return {
          eyebrow: '資料補充 — 完成',
          title: '問卷填寫完成',
          intro: '確認送出後，將結合您的健檢資料進行整合分析並準備個人化報告。',
        }
      }
      return {
        eyebrow: `資料補充 — 階段 ${currentLivePageIndex.value + 1}/${totalLivePages.value}`,
        title: '我們已讀取你提供的體檢資料',
        intro: '接下來只需要補充幾項資訊，幫助我們更完整地了解你的日常狀況。',
      }
    }
    if (isLiveFullMode.value) {
      if (liveStepIndex.value === 0) {
        return {
          eyebrow: '健康問卷',
          title: '先從幾個日常問題開始',
          intro: '沒有體檢資料也沒關係，我們會從你的生活習慣與健康狀況開始了解。',
        }
      }
      if (isLiveCompleteStep.value) {
        return {
          eyebrow: '健康問卷 — 完成',
          title: '問卷填寫完成',
          intro: '確認送出後，將為您進行整合分析並準備個人化報告。',
        }
      }
      return {
        eyebrow: `健康問卷 — 階段 ${currentLivePageIndex.value + 1}/${totalLivePages.value}`,
        title: '健康與生活型態對應問卷',
        intro: '請根據您近期的真實日常狀態與身體數值作答。',
      }
    }
    if (currentMode.value === 'supplement') {
      return {
        eyebrow: '資料補充',
        title: '我們已讀取你提供的體檢資料',
        intro: '接下來只需要補充幾項資訊，幫助我們更完整地了解你的日常狀況。',
      }
    }
    return {
      eyebrow: '健康問卷',
      title: '先從幾個日常問題開始',
      intro: '沒有體檢資料也沒關係，我們會從你的生活習慣與健康狀況開始了解。',
    }
  })

  const isCurrentLiveGroupValid = computed(() => {
    if (isLiveFullMode.value && liveStepIndex.value === 0) {
      return Boolean(answers.value.basic?.age && answers.value.basic?.sex && answers.value.basic?.weight)
    }
    if (isLiveCompleteStep.value) {
      return true
    }
    for (const q of currentLivePageQuestions.value) {
      if (!q.required) continue
      const ans = rawAnswers.value[q.id]
      if (!ans) return false
      if (q.controlType === 'multi_choice') {
        const arr = ans.value as (string | number)[]
        if (!arr || arr.length === 0) return false
        for (const optKey of arr) {
          const opt = q.options.find((o) => o.key === optKey)
          if (opt?.detailInput?.required && !ans.detailText?.trim()) return false
        }
      } else if (q.controlType === 'number') {
        if (ans.value === q.numericConfig?.unknownOption?.key) {
          continue
        }
        if (ans.value === '' || ans.value === undefined || ans.value === null) return false
        const numVal = Number(ans.value)
        if (isNaN(numVal)) return false
        if (q.numericConfig?.min !== undefined && numVal < q.numericConfig.min) return false
        if (q.numericConfig?.max !== undefined && numVal > q.numericConfig.max) return false
      } else if (q.controlType === 'composite_bp') {
        if (ans.value === q.bpConfig?.unknownOption?.key || ans.value === 'unknown') {
          continue
        }
        if (typeof ans.value !== 'string' || !ans.value.trim()) return false
        const bpMatch = /^\s*(\d{1,3})\s*\/\s*(\d{1,3})\s*$/.test(ans.value.trim())
        if (!bpMatch) return false
      } else if (q.controlType === 'text') {
        if (typeof ans.value !== 'string' || !ans.value.trim()) return false
      } else {
        if (ans.value === '' || ans.value === undefined || ans.value === null) return false
      }
    }
    return true
  })


  const isStepValid = (step: QuestionnaireStep): boolean => {
    if (isLiveMode.value) {
      return isCurrentLiveGroupValid.value
    }
    if (step === 'basic') {
      return Boolean(answers.value.basic?.age && answers.value.basic?.sex && answers.value.basic?.weight)
    }
    if (['diet', 'activity', 'sleep'].includes(step)) {
      return answers.value[step] !== undefined && answers.value[step] !== ''
    }
    if (step === 'measurements') {
      const waistReady = Boolean(answers.value.measurements?.waist || answers.value.measurements?.waistUnknown)
      const bpReady =
        currentMode.value === 'supplement' ||
        Boolean(
          (answers.value.measurements?.systolic && answers.value.measurements?.diastolic) ||
            answers.value.measurements?.bpUnknown,
        )
      return waistReady && bpReady
    }
    if (step === 'allergies') {
      const selected = answers.value.allergies || []
      return Boolean(
        selected.length &&
          (!selected.includes('其他') ||
            (answers.value.allergyOther && answers.value.allergyOther.trim().length > 0)),
      )
    }
    if (step === 'safety') {
      return Boolean(answers.value.safety?.pregnant && answers.value.safety?.breastfeeding)
    }
    if (step === 'complete') return true
    return false
  }

  const isCurrentStepValid = computed<boolean>(() => {
    if (isLiveMode.value) {
      return isCurrentLiveGroupValid.value
    }
    return isStepValid(currentStep.value)
  })



  const focusFirstInput = () => {
    if (questionPanelRef.value) {
      const firstInput = questionPanelRef.value.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled])',
      )
      firstInput?.focus({ preventScroll: true })
    }
  }

  const focusAnalysisError = () => {
    later(() => {
      if (analysisErrorRef.value) {
        analysisErrorRef.value.focus({ preventScroll: true })
      }
    }, 60)
  }

  const fetchLivePlan = async (options: { mode: 'full' | 'supplement'; reportId?: string | null; gender?: 'MALE' | 'FEMALE' }) => {
    isPlanLoading.value = true
    planError.value = null
    validationMessage.value = ''
    try {
      const plan = await liveQuestionnaireService.getPlan({
        reportId: options.reportId ?? null,
        mode: options.mode,
        profile: options.gender ? { gender: options.gender } : undefined,
      })
      rawPlan.value = plan
      if (options.gender) {
        planLoadedGender.value = options.gender
      }
      // Initialize raw answers for all questions
      plan.questions.forEach((q) => {
        if (!rawAnswers.value[q.id]) {
          rawAnswers.value[q.id] = {
            value: q.controlType === 'multi_choice' ? [] : '',
          }
        }
      })
      isPlanLoading.value = false
      return true
    } catch (err: any) {
      isPlanLoading.value = false
      planError.value = err?.message || '無法取得問卷題目，請確認網路連線或稍後再試。'
      validationMessage.value = planError.value || ''
      return false
    }
  }

  const openQuestionnaire = async (source: 'analyzed' | 'direct', reset = false) => {
    clearTimers()
    currentMode.value = source === 'analyzed' ? 'supplement' : 'full'
    if (reset) {
      answers.value = {}
      currentQuestion.value = 0
      liveStepIndex.value = 0
      rawAnswers.value = {}
      rawPlan.value = null
      planLoadedGender.value = null
    } else {
      restoreState(currentMode.value)
    }
    if (currentMode.value === 'supplement' && !answers.value.basic?.age) {
      answers.value.basic = { age: '42', sex: 'female', weight: '58' }
    }
    computeSteps()
    validationMessage.value = ''
    isSubmitting.value = false
    panelAnimationKey.value++
    showScreen('question')

    // If live supplement mode, fetch plan immediately
    if (isLiveSupplementMode.value && !rawPlan.value) {
      const repId = getReportId()
      if (repId) {
        await fetchLivePlan({ mode: 'supplement', reportId: repId })
      }
    }
  }


  // Live question handlers
  const setLiveSingle = (questionId: number, key: string | number) => {
    rawAnswers.value[questionId] = { value: key }
    persistState()
    validationMessage.value = ''
  }

  const setLiveNum = (questionId: number, val: string | number) => {
    rawAnswers.value[questionId] = { value: val }
    persistState()
    validationMessage.value = ''
  }

  const toggleLiveNumUnknown = (questionId: number, unknownKey: string | number) => {
    const cur = rawAnswers.value[questionId]?.value
    const isUnknown = cur === unknownKey
    rawAnswers.value[questionId] = { value: isUnknown ? '' : unknownKey }
    persistState()
    validationMessage.value = ''
  }

  // Composite BP helpers
  const rawBpState = ref<Record<number, { sbp: string; dbp: string; isUnknown: boolean }>>({})

  const updateBpSbp = (questionId: number, val: string) => {
    const cur = rawBpState.value[questionId] || { sbp: '', dbp: '', isUnknown: false }
    cur.sbp = val
    cur.isUnknown = false
    rawBpState.value[questionId] = { ...cur }

    if (cur.sbp.trim() && cur.dbp.trim()) {
      rawAnswers.value[questionId] = { value: `${cur.sbp.trim()}/${cur.dbp.trim()}` }
    } else {
      rawAnswers.value[questionId] = { value: '' }
    }
    persistState()
    validationMessage.value = ''
  }

  const updateBpDbp = (questionId: number, val: string) => {
    const cur = rawBpState.value[questionId] || { sbp: '', dbp: '', isUnknown: false }
    cur.dbp = val
    cur.isUnknown = false
    rawBpState.value[questionId] = { ...cur }

    if (cur.sbp.trim() && cur.dbp.trim()) {
      rawAnswers.value[questionId] = { value: `${cur.sbp.trim()}/${cur.dbp.trim()}` }
    } else {
      rawAnswers.value[questionId] = { value: '' }
    }
    persistState()
    validationMessage.value = ''
  }

  const toggleBpUnknownState = (questionId: number, unknownKey: string | number) => {
    const cur = rawBpState.value[questionId] || { sbp: '', dbp: '', isUnknown: false }
    const nextUnknown = !cur.isUnknown
    rawBpState.value[questionId] = {
      sbp: nextUnknown ? '' : cur.sbp,
      dbp: nextUnknown ? '' : cur.dbp,
      isUnknown: nextUnknown,
    }
    rawAnswers.value[questionId] = { value: nextUnknown ? String(unknownKey) : '' }
    persistState()
    validationMessage.value = ''
  }

  const setLiveText = (questionId: number, text: string) => {
    rawAnswers.value[questionId] = { value: text }
    persistState()
    validationMessage.value = ''
  }

  const handleNumericKeydown = (e: KeyboardEvent, allowDecimal = false) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault()
    }
    if (!allowDecimal && e.key === '.') {
      e.preventDefault()
    }
  }

  const handleNumericPaste = (e: ClipboardEvent, allowDecimal = false) => {
    e.preventDefault()
    const text = e.clipboardData?.getData('text') || ''
    let cleaned = ''
    let hasDecimal = false
    for (const char of text) {
      if (char >= '0' && char <= '9') {
        cleaned += char
      } else if (allowDecimal && char === '.' && !hasDecimal) {
        cleaned += char
        hasDecimal = true
      }
    }
    const target = e.target as HTMLInputElement
    if (target) {
      const start = target.selectionStart || 0
      const end = target.selectionEnd || 0
      const currentVal = target.value
      target.value = currentVal.substring(0, start) + cleaned + currentVal.substring(end)
      target.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  const clearLiveNumUnknownIfChecked = (questionId: number, unknownKey?: string | number) => {
    const cur = rawAnswers.value[questionId]?.value
    if (unknownKey !== undefined && cur === unknownKey) {
      rawAnswers.value[questionId] = { value: '' }
      persistState()
      validationMessage.value = ''
    }
  }

  const clearBpUnknownIfChecked = (questionId: number) => {
    const cur = rawBpState.value[questionId]
    if (cur?.isUnknown) {
      rawBpState.value[questionId] = { ...cur, isUnknown: false }
      rawAnswers.value[questionId] = { value: '' }
      persistState()
      validationMessage.value = ''
    }
  }


  const toggleLiveMulti = (questionId: number, optKey: string | number, isExclusive?: boolean) => {
    const cur = rawAnswers.value[questionId] || { value: [] }
    let arr = Array.isArray(cur.value) ? [...(cur.value as (string | number)[])] : []
    if (isExclusive) {
      arr = arr.includes(optKey) ? [] : [optKey]
    } else {
      const q = livePlanViewModel.value.questions.find((i) => i.id === questionId)
      const exKeys = q?.options.filter((o) => o.exclusive).map((o) => o.key) || []
      arr = arr.filter((k) => !exKeys.includes(k))
      arr = arr.includes(optKey) ? arr.filter((k) => k !== optKey) : [...arr, optKey]
    }
    rawAnswers.value[questionId] = { ...cur, value: arr as QuestionnaireAnswerValue }
    persistState()
    validationMessage.value = ''
  }

  const updateLiveDetail = (questionId: number, text: string) => {
    rawAnswers.value[questionId] = {
      ...(rawAnswers.value[questionId] || { value: [] }),
      detailText: text,
    }
    persistState()
    validationMessage.value = ''
  }

  const isLiveMultiSelected = (questionId: number, optKey: string | number): boolean => {
    const cur = rawAnswers.value[questionId]?.value
    return Array.isArray(cur) && (cur as (string | number)[]).includes(optKey)
  }





  // Basic handlers
  const updateBasicField = (field: 'age' | 'sex' | 'weight', val: string) => {
    answers.value.basic = { ...answers.value.basic, [field]: val }
    if (field === 'sex') {
      computeSteps()
    }
    persistState()
    validationMessage.value = ''
  }

  // Lifestyle handlers
  const setSingleChoice = (step: 'diet' | 'activity' | 'sleep', index: number) => {
    answers.value[step] = index
    persistState()
    validationMessage.value = ''
  }

  // Measurement handlers
  const updateWaist = (val: string) => {
    answers.value.measurements = {
      ...answers.value.measurements,
      waist: val,
      waistUnknown: false,
    }
    persistState()
    validationMessage.value = ''
  }

  const toggleWaistUnknown = (checked: boolean) => {
    answers.value.measurements = {
      ...answers.value.measurements,
      waistUnknown: checked,
      ...(checked ? { waist: '' } : {}),
    }
    persistState()
    validationMessage.value = ''
  }

  const cancelWaistUnknown = () => {
    if (answers.value.measurements?.waistUnknown) {
      answers.value.measurements = {
        ...answers.value.measurements,
        waistUnknown: false,
      }
      persistState()
      validationMessage.value = ''
    }
  }

  const updateSystolic = (val: string) => {
    answers.value.measurements = {
      ...answers.value.measurements,
      systolic: val,
      bpUnknown: false,
    }
    persistState()
    validationMessage.value = ''
  }

  const updateDiastolic = (val: string) => {
    answers.value.measurements = {
      ...answers.value.measurements,
      diastolic: val,
      bpUnknown: false,
    }
    persistState()
    validationMessage.value = ''
  }

  const toggleBpUnknown = (checked: boolean) => {
    answers.value.measurements = {
      ...answers.value.measurements,
      bpUnknown: checked,
      ...(checked ? { systolic: '', diastolic: '' } : {}),
    }
    persistState()
    validationMessage.value = ''
  }

  const cancelBpUnknown = () => {
    if (answers.value.measurements?.bpUnknown) {
      answers.value.measurements = {
        ...answers.value.measurements,
        bpUnknown: false,
      }
      persistState()
      validationMessage.value = ''
    }
  }

  // Allergy handlers
  const toggleAllergy = (option: string, checked: boolean) => {
    let selected = [...(answers.value.allergies || [])]
    if (checked) {
      if (option === '無已知過敏') {
        selected = ['無已知過敏']
        answers.value.allergyOther = ''
      } else {
        selected = selected.filter((item) => item !== '無已知過敏')
        if (!selected.includes(option)) {
          selected.push(option)
        }
      }
    } else {
      selected = selected.filter((item) => item !== option)
      if (option === '其他') {
        answers.value.allergyOther = ''
      }
    }
    answers.value.allergies = selected
    persistState()
    validationMessage.value = ''
  }

  const updateAllergyOther = (val: string) => {
    answers.value.allergyOther = val
    persistState()
    validationMessage.value = ''
  }

  // Safety handlers
  const updateSafetyField = (field: 'pregnant' | 'breastfeeding', val: '是' | '否') => {
    answers.value.safety = {
      ...answers.value.safety,
      [field]: val,
    }
    persistState()
    validationMessage.value = ''
  }

  // Navigation handlers
  const handlePrevious = () => {
    if (isLiveMode.value) {
      if (liveStepIndex.value > 0) {
        liveStepIndex.value--
        panelAnimationKey.value++
        validationMessage.value = ''
        persistState()
      }
      return
    }
    if (currentQuestion.value > 0) {
      currentQuestion.value--
      panelAnimationKey.value++
      validationMessage.value = ''
    }
  }

  const handleNext = async () => {
    if (isLiveMode.value) {
      if (!isCurrentLiveGroupValid.value) {
        validationMessage.value = '請完成這個步驟的必填項目後再繼續。'
        focusFirstInput()
        return
      }
      validationMessage.value = ''

      // Full mode Step 0: Basic
      if (isLiveFullMode.value && liveStepIndex.value === 0) {
        const gender: 'MALE' | 'FEMALE' = answers.value.basic?.sex === 'female' ? 'FEMALE' : 'MALE'
        if (!rawPlan.value || planLoadedGender.value !== gender) {
          const ok = await fetchLivePlan({ mode: 'full', gender })
          if (!ok) return
        }
        liveStepIndex.value++
        panelAnimationKey.value++
        persistState()
        return
      }

      // Moving through question groups
      const maxGroupIndex = isLiveFullMode.value ? totalLiveGroups.value : totalLiveGroups.value - 1
      if (liveStepIndex.value < maxGroupIndex) {
        liveStepIndex.value++
        panelAnimationKey.value++
        persistState()
        return
      }

      // Reaching complete step
      if (liveStepIndex.value === maxGroupIndex) {
        liveStepIndex.value++
        panelAnimationKey.value++
        persistState()
        return
      }

      // Submitting from complete step
      if (isLiveCompleteStep.value) {
        const activeReportId = isLiveSupplementMode.value ? getReportId() : null
        const activeMode = isLiveSupplementMode.value ? 'supplement' : 'full'
        const payload = adaptTargetAnswersToSubmission(activeReportId, activeMode, rawAnswers.value)
        isSubmitting.value = true
        validationMessage.value = ''
        try {
          const res = await liveQuestionnaireService.submitAnswers(payload)
          if (res.submissionId) {
            setSubmissionId(res.submissionId)
          }
          isSubmitting.value = false
          persistState()
          runAnalysis(false)
        } catch (err: any) {
          isSubmitting.value = false
          validationMessage.value = err?.message || '問卷提交失敗，請檢查網路連線或稍後再試。'
        }
        return
      }
      return
    }

    const step = currentStep.value
    if (!isStepValid(step)) {
      validationMessage.value = '請完成這個步驟，或選擇「目前不知道」。'
      focusFirstInput()
      return
    }
    validationMessage.value = ''
    if (currentQuestion.value < activeSteps.value.length - 1) {
      currentQuestion.value++
      panelAnimationKey.value++
      persistState()
      return
    }

    // Submit step for supplement / mock mode
    persistState()
    isSubmitting.value = true
    later(() => {
      isSubmitting.value = false
      runAnalysis(false)
    }, 450)
  }

  const retryLoadPlan = async () => {
    if (isLiveSupplementMode.value) {
      const repId = getReportId()
      if (repId) {
        const ok = await fetchLivePlan({ mode: 'supplement', reportId: repId })
        if (ok) {
          liveStepIndex.value = 0
          panelAnimationKey.value++
          persistState()
        }
      }
    } else {
      const gender: 'MALE' | 'FEMALE' = answers.value.basic?.sex === 'female' ? 'FEMALE' : 'MALE'
      const ok = await fetchLivePlan({ mode: 'full', gender })
      if (ok) {
        liveStepIndex.value = 1
        panelAnimationKey.value++
        persistState()
      }
    }
  }






  // Loading-2 handlers
  const changeAnalysisStatus = (text: string) => {
    isAnalysisChanging.value = true
    later(() => {
      analysisStatusText.value = text
      isAnalysisChanging.value = false
    }, 220)
  }

  const showAnalysisError = () => {
    isAnalysisErrorVisible.value = true
    focusAnalysisError()
  }

  const runAnalysis = (shouldFail = false) => {
    clearTimers()
    isAnalysisErrorVisible.value = false
    analysisStatusText.value = analysisStages[0].text
    showScreen('analysis')

    // If live full mode with real submissionId, trigger finalize-health-report in parallel
    const subId = getSubmissionId()
    let finalizePromise: Promise<any> | null = null
    if (isLiveFullMode.value && subId && !shouldFail) {
      finalizePromise = liveReportService.finalizeHealthReport(subId)
    }

    let elapsed = 0
    const count = shouldFail ? 2 : analysisStages.length
    for (let i = 1; i < count; i++) {
      elapsed += analysisStages[i - 1].duration
      const targetText = analysisStages[i].text
      later(() => changeAnalysisStatus(targetText), elapsed)
    }
    elapsed += analysisStages[count - 1].duration
    later(async () => {
      if (shouldFail) {
        showAnalysisError()
        return
      }

      if (finalizePromise) {
        try {
          const reportResult = await finalizePromise
          if (reportResult?.assessmentId) {
            setAssessmentId(reportResult.assessmentId)
          }
          if (reportResult) {
            setLiveReportData(reportResult)
          }
        } catch (err: any) {
          console.error('Finalize health report error:', err)
          showAnalysisError()
          return
        }
      }

      changeAnalysisStatus('報告準備完成')
      later(() => {
        clearUploadFlow()
        clearSessionState()
        router.replace('/report')
      }, 650)
    }, elapsed)
  }


  const handleRetryAnalysis = () => {
    runAnalysis(false)
  }

  const handleReturnQuestionnaire = () => {
    openQuestionnaire(currentMode.value === 'supplement' ? 'analyzed' : 'direct', false)
  }



  // Demo Controller handlers
  const toggleDemoPanel = () => {
    isDemoPanelOpen.value = !isDemoPanelOpen.value
  }

  const handleDemoAction = (action: 'supplement' | 'full' | 'analysis' | 'analysis-error' | 'restart') => {
    isDemoPanelOpen.value = false
    if (action === 'supplement') openQuestionnaire('analyzed', true)
    if (action === 'full') openQuestionnaire('direct', true)
    if (action === 'analysis') runAnalysis(false)
    if (action === 'analysis-error') runAnalysis(true)
    if (action === 'restart') {
      clearSessionState()
      openQuestionnaire(currentMode.value === 'supplement' ? 'analyzed' : 'direct', true)
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return
    if (networkBackRef.value) {
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      networkBackRef.value.style.transform = `translate3d(${x * -7}px, ${y * -5}px, 0) scale(1.08)`
    }
  }

  const handlePointerLeave = () => {
    if (networkBackRef.value) {
      networkBackRef.value.style.transform = 'translate3d(0,0,0) scale(1.08)'
    }
  }

  onMounted(() => {
    isDisposed = false
    const modeParam = route.query.mode === 'supplement' ? 'supplement' : 'full'
    currentMode.value = modeParam

    nextTick(() => {
      if (appRef.value) {
        appRef.value.addEventListener('pointermove', handlePointerMove)
        appRef.value.addEventListener('pointerleave', handlePointerLeave)
      }
      openQuestionnaire(modeParam === 'supplement' ? 'analyzed' : 'direct', false)
    })
  })

  onUnmounted(() => {
    isDisposed = true
    clearTimers()
    if (appRef.value) {
      appRef.value.removeEventListener('pointermove', handlePointerMove)
      appRef.value.removeEventListener('pointerleave', handlePointerLeave)
    }
  })



  return {
    // 狀態
    activeScreen,
    currentMode,
    currentQuestion,
    activeSteps,
    currentStep,
    answers,
    validationMessage,
    isSubmitting,
    panelAnimationKey,
    progressPercent,
    questionHeaderInfo,
    isCurrentStepValid,

    // Live Integration State
    isLiveMode,
    isLiveFullMode,
    isLiveSupplementMode,
    isPreparing,
    isBasicStep,
    isPlanLoading,
    planError,
    isLivePlanStep,
    isLiveCompleteStep,
    liveStepIndex,
    currentLivePageIndex,
    totalLivePages,
    currentLivePage,
    currentLivePageQuestions,
    currentLiveGroupIndex,
    totalLiveGroups,
    currentLiveGroupQuestions,
    rawAnswers,
    rawBpState,

    // Live Handlers
    setLiveSingle,
    setLiveNum,
    toggleLiveNumUnknown,
    updateBpSbp,
    updateBpDbp,
    toggleBpUnknownState,
    setLiveText,
    toggleLiveMulti,
    updateLiveDetail,
    isLiveMultiSelected,
    retryLoadPlan,
    handleNumericKeydown,
    handleNumericPaste,
    clearLiveNumUnknownIfChecked,
    clearBpUnknownIfChecked,


    // Loading-2
    analysisStatusText,
    isAnalysisChanging,
    isAnalysisErrorVisible,


    // Demo 控制面板
    isDemoPanelOpen,

    // 表單操作
    updateBasicField,
    setSingleChoice,
    updateWaist,
    toggleWaistUnknown,
    cancelWaistUnknown,
    updateSystolic,
    updateDiastolic,
    toggleBpUnknown,
    cancelBpUnknown,
    toggleAllergy,
    updateAllergyOther,
    updateSafetyField,

    // 流程操作
    handlePrevious,
    handleNext,
    handleRetryAnalysis,
    handleReturnQuestionnaire,
    toggleDemoPanel,
    handleDemoAction,
  }
}


