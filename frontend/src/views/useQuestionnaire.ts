import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'

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
  canvasRef: Ref<HTMLCanvasElement | null>
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
  canvasRef,
  networkBackRef,
  appRef,
  questionPanelRef,
  analysisErrorRef,
}: UseQuestionnaireOptions) {

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

  // 內部變數與計時器
  let timers: number[] = []
  let isDisposed = false
  let fieldRaf = 0
  let fieldPoints: { x: number; y: number; phase: number; alpha: number }[] = []
  let fieldWidth = 0
  let fieldHeight = 0
  let pointer = { x: -9999, y: -9999, active: false }



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
          return
        }
      }
    } catch (_) {}
    answers.value = {}
    currentQuestion.value = 0
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
    return activeSteps.value[currentQuestion.value] || 'basic'
  })

  const progressPercent = computed<number>(() => {
    const progressOrder = currentMode.value === 'supplement' ? supplementProgressOrder : fullProgressOrder
    const step = currentStep.value
    const position = Math.max(0, progressOrder.indexOf(step))
    return ((position + 1) / progressOrder.length) * 100
  })

  const questionHeaderInfo = computed(() => {
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

  const isStepValid = (step: QuestionnaireStep): boolean => {
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

  const openQuestionnaire = (source: 'analyzed' | 'direct', reset = false) => {
    clearTimers()
    currentMode.value = source === 'analyzed' ? 'supplement' : 'full'
    if (reset) {
      answers.value = {}
      currentQuestion.value = 0
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
    if (currentQuestion.value > 0) {
      currentQuestion.value--
      panelAnimationKey.value++
      validationMessage.value = ''
    }
  }

  const handleNext = () => {
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

    // Submit step
    persistState()
    isSubmitting.value = true
    later(() => {
      isSubmitting.value = false
      runAnalysis(false)
    }, 450)
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
    let elapsed = 0
    const count = shouldFail ? 2 : analysisStages.length
    for (let i = 1; i < count; i++) {
      elapsed += analysisStages[i - 1].duration
      const targetText = analysisStages[i].text
      later(() => changeAnalysisStatus(targetText), elapsed)
    }
    elapsed += analysisStages[count - 1].duration
    later(() => {
      if (shouldFail) {
        showAnalysisError()
      } else {
        changeAnalysisStatus('報告準備完成')
        later(() => showScreen('report'), 650)
      }
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

  // Canvas 2D Field Background
  const buildField = () => {
    if (!canvasRef.value) return
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    fieldWidth = window.innerWidth
    fieldHeight = window.innerHeight
    canvas.width = Math.round(fieldWidth * ratio)
    canvas.height = Math.round(fieldHeight * ratio)
    canvas.style.width = `${fieldWidth}px`
    canvas.style.height = `${fieldHeight}px`
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const rows: { x: number; y: number; phase: number; alpha: number }[][] = []
    const gap = fieldWidth < 600 ? 30 : 34
    let rowIndex = 0
    for (let y = 20; y < fieldHeight; y += gap, rowIndex += 1) {
      const row: { x: number; y: number; phase: number; alpha: number }[] = []
      const offset = rowIndex % 2 ? gap / 2 : 0
      for (let x = 20 + offset; x < fieldWidth; x += gap) {
        const distanceFromCenter = Math.hypot(x - fieldWidth / 2, y - fieldHeight / 2)
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
    fieldPoints = rows.flat()
    drawField(performance.now())
  }

  const drawField = (time: number) => {
    if (!canvasRef.value || isDisposed) return
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = checkReducedMotion()
    ctx.clearRect(0, 0, fieldWidth, fieldHeight)
    fieldPoints.forEach((point) => {
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
    if (!reduced && pointer.active && !isDisposed) {
      fieldRaf = requestAnimationFrame(drawField)
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return
    pointer = { x: event.clientX, y: event.clientY, active: true }
    if (networkBackRef.value) {
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      networkBackRef.value.style.transform = `translate3d(${x * -7}px, ${y * -5}px, 0) scale(1.08)`
    }
    cancelAnimationFrame(fieldRaf)
    fieldRaf = requestAnimationFrame(drawField)
  }

  const handlePointerLeave = () => {
    pointer.active = false
    if (networkBackRef.value) {
      networkBackRef.value.style.transform = 'translate3d(0,0,0) scale(1.08)'
    }
    cancelAnimationFrame(fieldRaf)
    drawField(performance.now())
  }

  const handleResize = () => {
    buildField()
  }

  onMounted(() => {
    isDisposed = false
    nextTick(() => {
      buildField()
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize, { passive: true })
      }
      if (appRef.value) {
        appRef.value.addEventListener('pointermove', handlePointerMove)
        appRef.value.addEventListener('pointerleave', handlePointerLeave)
      }
      openQuestionnaire('direct', false)
    })
  })

  onUnmounted(() => {
    isDisposed = true
    clearTimers()
    cancelAnimationFrame(fieldRaf)
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
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


