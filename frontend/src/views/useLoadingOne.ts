import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'

interface UseLoadingOneOptions {
  networkBackRef: Ref<HTMLElement | null>
  canvasRef: Ref<HTMLCanvasElement | null>
  excludeModalRef: Ref<HTMLElement | null>
  modalHomeRef: Ref<HTMLButtonElement | null>
  modalQuestionnaireRef: Ref<HTMLButtonElement | null>
  fileInputRef: Ref<HTMLInputElement | null>
  questionTitleRef: Ref<HTMLElement | null>
  homeTitleRef: Ref<HTMLElement | null>
}

interface CanvasPoint {
  x: number
  y: number
  phase: number
  alpha: number
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
  canvasRef,
  excludeModalRef,
  modalHomeRef,
  modalQuestionnaireRef,
  fileInputRef,
  questionTitleRef,
  homeTitleRef,
}: UseLoadingOneOptions) {
  // 畫面與狀態
  const activeScreen = ref<'loading' | 'questionnaire' | 'home'>('loading')
  const isExcludeOpen = ref(false)
  const isBodyScrollLocked = ref(false)
  const isDemoPanelOpen = ref(false)
  const currentScenario = ref<'success' | 'exclude'>('success')

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
  let rafId = 0
  let mediaQueryList: MediaQueryList | null = null
  let originalBodyOverflow = ''
  let originalBodyOverflowPriority = ''

  // Canvas 資料點陣內部狀態
  let points: CanvasPoint[] = []
  let canvasWidth = 0
  let canvasHeight = 0
  let pointer = { x: -9999, y: -9999, active: false }

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

  const cancelRaf = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
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

  // 排除視窗控制 (鎖定持有狀態、備份值與 priority、焦點定時器防護)
  const openExclude = () => {
    if (isDisposed) return
    isExcludeOpen.value = true
    if (!isBodyScrollLocked.value) {
      originalBodyOverflow = document.body.style.getPropertyValue('overflow')
      originalBodyOverflowPriority = document.body.style.getPropertyPriority('overflow')
      document.body.style.setProperty('overflow', 'hidden')
      isBodyScrollLocked.value = true
    }
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
    if (isBodyScrollLocked.value) {
      if (originalBodyOverflow) {
        document.body.style.setProperty('overflow', originalBodyOverflow, originalBodyOverflowPriority)
      } else {
        document.body.style.removeProperty('overflow')
      }
      isBodyScrollLocked.value = false
    }
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
      else showQuestionnaire('supplement')
    }, elapsed)
  }

  // 問卷切換 (Demo Only 占位，先移轉焦點再關閉排除視窗)
  const showQuestionnaire = async (source: 'supplement' | 'full') => {
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

    questionTitleRef.value?.focus()
    closeExclude()
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

  // 排除視窗雙按鈕 (DEC-01，先移轉焦點再關閉排除視窗)
  const handleModalHome = async () => {
    if (isDisposed) return
    const currentToken = ++navToken
    clearTimers()
    showScreen('home')

    await nextTick()
    if (isDisposed || navToken !== currentToken || activeScreen.value !== 'home') return

    homeTitleRef.value?.focus()
    closeExclude()
  }

  const handleModalQuestionnaire = () => {
    showQuestionnaire('full')
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

  // Canvas 點陣資料場
  const buildField = () => {
    cancelRaf()
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvasWidth = window.innerWidth
    canvasHeight = window.innerHeight

    canvas.width = Math.round(canvasWidth * ratio)
    canvas.height = Math.round(canvasHeight * ratio)
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

    const gap = canvasWidth < 600 ? 30 : 34
    const rows: CanvasPoint[][] = []
    let rowIndex = 0

    for (let y = 20; y < canvasHeight; y += gap, rowIndex += 1) {
      const row: CanvasPoint[] = []
      const offset = rowIndex % 2 ? gap / 2 : 0
      for (let x = 20 + offset; x < canvasWidth; x += gap) {
        const distanceFromCenter = Math.hypot(x - canvasWidth / 2, y - canvasHeight / 2)
        const centerFade = Math.min(1, Math.max(0.04, (distanceFromCenter - 135) / 360))
        row.push({
          x,
          y,
          phase: Math.random() * Math.PI * 2,
          alpha: (0.045 + Math.random() * 0.075) * centerFade,
        })
      }
      rows.push(row)
    }
    points = rows.flat()
    drawField(performance.now())
  }

  const drawField = (time: number) => {
    cancelRaf()
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    const reduced = checkReducedMotion()

    points.forEach(point => {
      const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y)
      const influence = pointer.active ? Math.max(0, 1 - distance / 125) : 0
      const pulse = reduced ? 0 : (Math.sin(time / 1350 + point.phase) + 1) * 0.11
      const radius = 1.05 + pulse + influence * 4.2
      const color = influence > 0.72 ? '251,143,84' : influence > 0.18 ? '25,122,252' : '163,211,247'
      ctx.beginPath()
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${color},${Math.min(0.78, point.alpha + influence * 0.58)})`
      ctx.fill()
    })

    if (!reduced && pointer.active) {
      rafId = requestAnimationFrame(drawField)
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!checkFinePointer()) return
    pointer = { x: event.clientX, y: event.clientY, active: true }
    const x = event.clientX / window.innerWidth - 0.5
    const y = event.clientY / window.innerHeight - 0.5

    if (networkBackRef.value) {
      networkBackRef.value.style.transform = `translate3d(${x * -7}px, ${y * -5}px, 0) scale(1.08)`
    }

    cancelRaf()
    rafId = requestAnimationFrame(drawField)
  }

  const handlePointerLeave = () => {
    pointer.active = false
    if (networkBackRef.value) {
      networkBackRef.value.style.transform = 'translate3d(0,0,0) scale(1.08)'
    }
    cancelRaf()
    drawField(performance.now())
  }

  const handleMediaChange = () => {
    if (checkReducedMotion()) {
      cancelRaf()
    } else if (pointer.active) {
      cancelRaf()
      rafId = requestAnimationFrame(drawField)
    }
  }

  onMounted(() => {
    isDisposed = false
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQueryList.addEventListener?.('change', handleMediaChange)
    }

    window.addEventListener('resize', buildField, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    buildField()
    runLoading('success')
  })

  onUnmounted(() => {
    isDisposed = true
    clearTimers()
    closeExclude()
    cancelRaf()

    if (mediaQueryList) {
      mediaQueryList.removeEventListener?.('change', handleMediaChange)
      mediaQueryList = null
    }

    window.removeEventListener('resize', buildField)
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
