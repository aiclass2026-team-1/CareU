import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import { clearUploadFlow } from '@/utils/flowContext'





interface UseLoadingOneOptions {
  networkBackRef: Ref<HTMLElement | null>
  excludeModalRef: Ref<HTMLElement | null>
  modalHomeRef: Ref<HTMLButtonElement | null>
  modalQuestionnaireRef: Ref<HTMLButtonElement | null>
  fileInputRef: Ref<HTMLInputElement | null>
  questionTitleRef: Ref<HTMLElement | null>
  homeTitleRef: Ref<HTMLElement | null>
}

interface LoadingStage {
  text: string
  time: number
}

const STAGES: LoadingStage[] = [
  { text: '讀取檔案中', time: 1800 },
  { text: '正在分析資料', time: 2400 },
  { text: '正在整理需補充資訊', time: 2200 },
  { text: '正在準備下一步', time: 1100 },
]

export const QUESTIONS = [
  {
    title: '近一個月主觀睡眠品質如何？',
    options: ['很好', '尚可', '不好', '很差'],
  },
  {
    title: '每週中高強度活動總時數？',
    options: ['150 分鐘以上', '75～150 分鐘', '少於 75 分鐘', '幾乎沒有'],
  },
  {
    title: '一等親是否有高血脂或心血管病史？',
    options: ['無', '有', '不確定'],
  },
]

export function useLoadingOne({
  networkBackRef,
  excludeModalRef,
  modalHomeRef,
  modalQuestionnaireRef,
  fileInputRef,
  questionTitleRef: _questionTitleRef,
  homeTitleRef: _homeTitleRef,
}: UseLoadingOneOptions) {
  const router = useRouter()

  // 畫面與狀態
  const activeScreen = ref<'loading' | 'questionnaire' | 'home'>('loading')
  const isExcludeOpen = ref(false)
  const isDemoPanelOpen = ref(false)
  const currentScenario = ref<'success' | 'exclude'>('success')

  const { isLocked: isBodyScrollLocked, lockBodyScroll, unlockBodyScroll } = useBodyScrollLock()

  // Loading 狀態文字
  const statusText = ref(STAGES[0].text)
  const isStatusFading = ref(false)

  // 問卷示範狀態 (Demo Only 占位)
  const questionnaireSource = ref<'supplement' | 'full'>('supplement')
  const currentQuestionIndex = ref(0)
  const selectedAnswers = ref<Record<number, string>>({})
  const isDemoCompleted = ref(false)

  // 生命週期與定時器
  let isDisposed = false
  let navToken = 0
  let timers: ReturnType<typeof setTimeout>[] = []
  let fadeTimer: ReturnType<typeof setTimeout> | null = null
  let focusTimer: ReturnType<typeof setTimeout> | null = null

  const checkReducedMotion = (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }

  const checkFinePointer = (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(pointer: fine)').matches
    }
    return true
  }

  const clearTimers = () => {
    timers.forEach(t => clearTimeout(t))
    timers = []
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null }
    if (focusTimer) { clearTimeout(focusTimer); focusTimer = null }
  }

  const later = (fn: () => void, delay: number) => {
    const reduced = checkReducedMotion()
    const id = setTimeout(fn, reduced ? Math.min(delay, 500) : delay)
    timers.push(id)
    return id
  }

  // 狀態文字平滑切換 (220ms 延遲符合原型)
  const changeStatus = (newText: string) => {
    if (isDisposed) return
    isStatusFading.value = true
    later(() => {
      if (isDisposed) return
      statusText.value = newText
      isStatusFading.value = false
    }, 220)
  }

  const showScreen = (name: 'loading' | 'questionnaire' | 'home') => {
    activeScreen.value = name
    const reduced = checkReducedMotion()
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  // 排除視窗控制 (鎖定持有狀態、焦點定時器防護)
  const openExclude = () => {
    if (isDisposed) return
    isExcludeOpen.value = true
    lockBodyScroll()
    if (focusTimer) {
      clearTimeout(focusTimer)
      focusTimer = null
    }
    const currentToken = navToken
    focusTimer = setTimeout(() => {
      if (!isDisposed && isExcludeOpen.value && navToken === currentToken) {
        excludeModalRef.value?.focus()
      }
    }, 80)
  }

  const closeExclude = () => {
    isExcludeOpen.value = false
    if (focusTimer) {
      clearTimeout(focusTimer)
      focusTimer = null
    }
    unlockBodyScroll()
  }

  const isPreviewContext = () => {
    return typeof window !== 'undefined' && window.location.hash.includes('/preview/')
  }

  // 流程推進 (還原來源 later 與累積 elapsed 時序)
  const runLoading = (mode: 'success' | 'exclude' = 'success') => {
    if (isDisposed) return
    const currentToken = ++navToken
    currentScenario.value = mode
    clearTimers()
    closeExclude()
    showScreen('loading')
    isDemoCompleted.value = false
    statusText.value = STAGES[0].text
    isStatusFading.value = false

    let elapsed = 0
    const endAt = mode === 'exclude' ? 2 : STAGES.length
    for (let i = 1; i < endAt; i++) {
      elapsed += STAGES[i - 1].time
      const text = STAGES[i].text
      later(() => {
        if (!isDisposed && navToken === currentToken) {
          changeStatus(text)
        }
      }, elapsed)
    }
    elapsed += STAGES[endAt - 1].time
    later(() => {
      if (isDisposed || navToken !== currentToken) return
      if (mode === 'exclude') openExclude()
      else {
        if (isPreviewContext()) {
          showQuestionnaire('supplement')
        } else {
          router.replace('/questionnaire?mode=supplement')
        }
      }
    }, elapsed)
  }

  // 問卷切換 (Demo Only 占位，支援 Preview 與 Formal 隔離)
  const showQuestionnaire = async (source: 'supplement' | 'full') => {
    if (isPreviewContext()) {
      if (isDisposed) return
      const currentToken = ++navToken
      clearTimers()
      questionnaireSource.value = source
      currentQuestionIndex.value = 0
      selectedAnswers.value = {}
      isDemoCompleted.value = false
      showScreen('questionnaire')

      await nextTick()
      if (isDisposed || navToken !== currentToken || activeScreen.value !== 'questionnaire') return
      closeExclude()
    } else {
      if (source === 'full') {
        clearUploadFlow()
        router.push('/questionnaire?mode=full')
      } else {
        router.push('/questionnaire?mode=supplement')
      }
    }
  }

  const handleSelectOption = (qIndex: number, option: string) => {
    selectedAnswers.value = { ...selectedAnswers.value, [qIndex]: option }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex.value < QUESTIONS.length - 1) {
      currentQuestionIndex.value += 1
    } else {
      isDemoCompleted.value = true
    }
  }

  const handleResetQuestionnaire = () => {
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    isDemoCompleted.value = false
  }

  // 排除視窗雙按鈕 (DEC-01，支援 Preview 與 Formal 隔離)
  const handleModalHome = async () => {
    clearUploadFlow()
    if (isPreviewContext()) {
      if (isDisposed) return
      const currentToken = ++navToken
      clearTimers()
      showScreen('home')

      await nextTick()
      if (isDisposed || navToken !== currentToken || activeScreen.value !== 'home') return
      closeExclude()
    } else {
      closeExclude()
      router.push('/home')
    }
  }

  const handleModalQuestionnaire = () => {
    clearUploadFlow()
    closeExclude()
    try {
      sessionStorage.removeItem('careu-questionnaire')
    } catch (_) {}
    if (isPreviewContext()) {
      showQuestionnaire('full')
    } else {
      router.push('/questionnaire?mode=full')
    }
  }

  // 首頁外殼互動 (Demo Only)
  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  const handleFileInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      input.value = ''
      runLoading('success')
    }
  }

  const handleStartFromQuestionnaire = (e: MouseEvent) => {
    e.preventDefault()
    showQuestionnaire('full')
  }

  // Demo 控制面板
  const toggleDemoPanel = () => {
    isDemoPanelOpen.value = !isDemoPanelOpen.value
  }

  const runSuccessDemo = () => {
    isDemoPanelOpen.value = false
    runLoading('success')
  }

  const runExcludeDemo = () => {
    isDemoPanelOpen.value = false
    runLoading('exclude')
  }

  const restartDemo = () => {
    isDemoPanelOpen.value = false
    runLoading(currentScenario.value)
  }

  // Focus Trap for Exclude Modal (DEC-04)
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isExcludeOpen.value) return
    if (event.key === 'Tab') {
      const first = modalHomeRef.value
      const last = modalQuestionnaireRef.value
      const modal = excludeModalRef.value
      const active = document.activeElement

      // 初始焦點在 dialog 或對話框內其他元素
      if (active === modal || (active !== first && active !== last)) {
        event.preventDefault()
        if (event.shiftKey) {
          last?.focus()
        } else {
          first?.focus()
        }
        return
      }

      // 雙按鈕循環
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    // DEC-04: 不支援 Escape 關閉排除視窗
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!checkFinePointer()) return
    const x = event.clientX / window.innerWidth - 0.5
    const y = event.clientY / window.innerHeight - 0.5

    if (networkBackRef.value) {
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
    window.addEventListener('keydown', handleKeyDown)
    runLoading('success')
  })

  onUnmounted(() => {
    isDisposed = true
    clearTimers()
    closeExclude()
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    activeScreen,
    isExcludeOpen,
    isBodyScrollLocked,
    isDemoPanelOpen,
    statusText,
    isStatusFading,
    questionnaireSource,
    currentQuestionIndex,
    selectedAnswers,
    isDemoCompleted,
    openExclude,
    closeExclude,
    runLoading,
    showQuestionnaire,
    handleSelectOption,
    handleNextQuestion,
    handleResetQuestionnaire,
    handleModalHome,
    handleModalQuestionnaire,
    triggerFileInput,
    handleFileInputChange,
    handleStartFromQuestionnaire,
    toggleDemoPanel,
    runSuccessDemo,
    runExcludeDemo,
    restartDemo,
    handlePointerMove,
    handlePointerLeave,
  }
}
