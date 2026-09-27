import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface UseHomeOptions {
  networkBackRef: Ref<HTMLElement | null>
  networkLeftRef: Ref<HTMLElement | null>
  networkRightRef: Ref<HTMLElement | null>
  fileInputRef: Ref<HTMLInputElement | null>
  canvasRef: Ref<HTMLCanvasElement | null>
  heroRef: Ref<HTMLElement | null>
  explanationRef: Ref<HTMLElement | null>
}

interface CanvasPoint {
  x: number
  y: number
  phase: number
  alpha: number
}

export function useHome({
  networkBackRef,
  networkLeftRef,
  networkRightRef,
  fileInputRef,
  canvasRef,
  heroRef,
  explanationRef,
}: UseHomeOptions) {
  // 狀態管理
  const isUploadOpen = ref(false)
  const isRouteScreenOpen = ref(false)
  const isDesktopSnap = ref(false)
  const selectedFiles = ref<File[]>([])
  const uploadErrorMessage = ref('')
  const toastMessage = ref('')
  const toastKind = ref<'info' | 'error'>('info')
  const isToastVisible = ref(false)
  const isOnExplanation = ref(false)
  const isDragOver = ref(false)

  let toastTimer: ReturnType<typeof setTimeout> | null = null
  let wheelTimer: ReturnType<typeof setTimeout> | null = null
  let wheelLocked = false
  let rafId = 0
  let mediaQueryList: MediaQueryList | null = null
  let isDisposed = false

  interface StyleBackup {
    value: string
    priority: string
  }
  const prevStyles: Record<string, StyleBackup> = {}
  const styleProps = ['scroll-behavior', 'scroll-snap-type', 'overscroll-behavior-y']

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

  const saveOriginalScrollStyles = () => {
    const el = document.documentElement
    styleProps.forEach(prop => {
      prevStyles[prop] = {
        value: el.style.getPropertyValue(prop),
        priority: el.style.getPropertyPriority(prop),
      }
    })
  }

  const updateSnapMode = () => {
    if (isDisposed) return
    const isDesktopWidth = typeof window !== 'undefined' && window.innerWidth > 820
    const isFine = checkFinePointer()
    const isReduced = checkReducedMotion()

    if (!isDesktopWidth || !isFine || isReduced) {
      isDesktopSnap.value = false
      applyScrollStyles()
      return
    }

    const expEl = explanationRef.value
    const heroEl = heroRef.value
    if (!expEl || !heroEl) {
      isDesktopSnap.value = false
      applyScrollStyles()
      return
    }

    const expHeight = expEl.scrollHeight
    const heroContentEl = heroEl.querySelector('.hero__content') as HTMLElement | null
    const heroContentHeight = heroContentEl ? heroContentEl.scrollHeight : heroEl.clientHeight
    const vh = window.innerHeight

    // 檢查 Hero 核心文字內容與第二屏說明內容是否可完整容納於視窗內
    const fits = expHeight <= vh + 5 && heroContentHeight <= vh + 5

    isDesktopSnap.value = fits
    applyScrollStyles()
  }

  const applyScrollStyles = () => {
    const el = document.documentElement
    const reduced = checkReducedMotion()

    el.style.setProperty('scroll-behavior', reduced ? 'auto' : 'smooth')
    if (isDesktopSnap.value) {
      el.style.setProperty('scroll-snap-type', 'y mandatory')
    } else {
      el.style.removeProperty('scroll-snap-type')
    }
  }

  const handleMediaChange = () => {
    updateSnapMode()
    if (checkReducedMotion()) {
      cancelRaf()
    } else if (pointer.active) {
      cancelRaf()
      rafId = requestAnimationFrame(drawField)
    }
  }

  const restoreOriginalScrollStyles = () => {
    const el = document.documentElement
    styleProps.forEach(prop => {
      const backup = prevStyles[prop]
      if (backup && backup.value) {
        el.style.setProperty(prop, backup.value, backup.priority)
      } else {
        el.style.removeProperty(prop)
      }
    })
  }

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const validFile = (file: File): boolean => {
    return /^(application\/pdf|image\/(jpeg|png))$/.test(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name)
  }

  const showToast = (message: string, kind: 'info' | 'error' = 'info') => {
    if (toastTimer) clearTimeout(toastTimer)
    toastMessage.value = message
    toastKind.value = kind
    isToastVisible.value = true
    toastTimer = setTimeout(() => {
      isToastVisible.value = false
    }, 2800)
  }

  const openUploadSheet = () => {
    uploadErrorMessage.value = ''
    isUploadOpen.value = true
  }

  const closeUploadSheet = () => {
    isUploadOpen.value = false
  }

  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }


  const processIncomingFiles = (incoming: File[]) => {
    if (!incoming.length) return
    const invalid = incoming.filter(file => !validFile(file))
    const tooLarge = incoming.filter(file => file.size > 25 * 1024 * 1024)
    uploadErrorMessage.value = ''

    if (invalid.length) {
      uploadErrorMessage.value = '僅支援 PDF、JPG、JPEG、PNG 格式。'
      showToast('檔案格式不符合：僅支援 PDF、JPG、PNG。', 'error')
    }
    if (tooLarge.length) {
      uploadErrorMessage.value = '單一檔案請勿超過 25MB。'
      showToast('檔案容量超過限制：單一檔案請勿超過 25MB。', 'error')
    }

    const acceptable = incoming.filter(file => validFile(file) && file.size <= 25 * 1024 * 1024)
    const existingKeys = new Set(selectedFiles.value.map(file => `${file.name}:${file.size}:${file.lastModified}`))
    const newFiles = acceptable.filter(file => !existingKeys.has(`${file.name}:${file.size}:${file.lastModified}`))
    const remainingSlots = Math.max(0, 10 - selectedFiles.value.length)

    selectedFiles.value = [...selectedFiles.value, ...newFiles.slice(0, remainingSlots)]
    if (newFiles.length > remainingSlots) {
      uploadErrorMessage.value = '一次最多保留 10 個檔案。'
    }
    if (selectedFiles.value.length) {
      isUploadOpen.value = true
    }
  }

  const handleFileInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    processIncomingFiles(files)
    if (input) input.value = ''
  }

  const removeFile = (index: number) => {
    selectedFiles.value.splice(index, 1)
    if (!selectedFiles.value.length && fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }

  const startReadingFiles = () => {
    if (!selectedFiles.value.length) return
    isUploadOpen.value = false
    isRouteScreenOpen.value = true
  }

  const closeRouteScreen = () => {
    isRouteScreenOpen.value = false
  }

  const handleQuestionnaireClick = (event: MouseEvent) => {
    event.preventDefault()
    showToast('原型提示：此處將前往健康問卷頁')
  }

  const handleMemberLoginClick = () => {
    showToast('原型提示：此處將開啟會員登入')
  }

  const handleDemoLinkClick = (event: MouseEvent) => {
    event.preventDefault()
    showToast('此連結將在正式版本開啟完整說明')
  }

  const handleScrollCueClick = (event: MouseEvent) => {
    event.preventDefault()
    const reduced = checkReducedMotion()
    explanationRef.value?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeUploadSheet()
    }
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = true
  }

  const handleDragLeave = () => {
    isDragOver.value = false
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false
    const files = Array.from(event.dataTransfer?.files || [])
    processIncomingFiles(files)
  }

  const buildField = () => {
    cancelRaf()
    const canvas = canvasRef.value
    const hero = heroRef.value
    if (!canvas || !hero) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = hero.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvasWidth = rect.width
    canvasHeight = rect.height

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

  const handleHeroPointerMove = (event: PointerEvent) => {
    if (!checkFinePointer()) return
    const hero = heroRef.value
    if (!hero) return

    const rect = hero.getBoundingClientRect()
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true }
    const x = event.clientX / window.innerWidth - 0.5
    const y = event.clientY / window.innerHeight - 0.5

    if (networkBackRef.value) {
      networkBackRef.value.style.transform = `translate3d(${x * -7}px, ${y * -5}px, 0) scale(1.08)`
    }
    if (networkLeftRef.value) {
      networkLeftRef.value.style.transform = `translate3d(${x * -34}px, ${y * -23}px, 0) scale(1)`
    }
    if (networkRightRef.value) {
      networkRightRef.value.style.transform = `translate3d(${x * 28}px, ${y * 19}px, 0) scale(1)`
    }

    cancelRaf()
    rafId = requestAnimationFrame(drawField)
  }

  const handleHeroPointerLeave = () => {
    pointer.active = false
    if (networkBackRef.value) {
      networkBackRef.value.style.transform = 'translate3d(0,0,0) scale(1.08)'
    }
    if (networkLeftRef.value) {
      networkLeftRef.value.style.transform = 'translate3d(0,0,0) scale(1)'
    }
    if (networkRightRef.value) {
      networkRightRef.value.style.transform = 'translate3d(0,0,0) scale(1)'
    }

    cancelRaf()
    drawField(performance.now())
  }

  const handleScroll = () => {
    isOnExplanation.value = window.scrollY >= window.innerHeight * 0.5
  }

  const handleWheel = (event: WheelEvent) => {
    // 只有在真正接管整屏切換的桌面環境下才攔截
    if (!isDesktopSnap.value || isUploadOpen.value || isRouteScreenOpen.value) {
      return
    }
    if (Math.abs(event.deltaY) < 8) return

    event.preventDefault()
    if (wheelLocked) return

    const onHero = window.scrollY < window.innerHeight * 0.5
    if ((onHero && event.deltaY > 0) || (!onHero && event.deltaY < 0)) {
      wheelLocked = true
      const target = onHero ? explanationRef.value : heroRef.value
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      wheelTimer = setTimeout(() => {
        wheelLocked = false
      }, 780)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeUploadSheet()
      closeRouteScreen()
    }
  }

  const handleResize = () => {
    updateSnapMode()
    buildField()
  }

  onMounted(() => {
    isDisposed = false
    saveOriginalScrollStyles()

    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQueryList.addEventListener?.('change', handleMediaChange)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    updateSnapMode()
    buildField()
    handleScroll()

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (isDisposed) return
        updateSnapMode()
      })
    }
  })

  onUnmounted(() => {
    isDisposed = true
    restoreOriginalScrollStyles()

    if (mediaQueryList) {
      mediaQueryList.removeEventListener?.('change', handleMediaChange)
      mediaQueryList = null
    }

    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeyDown)

    cancelRaf()
    if (toastTimer) clearTimeout(toastTimer)
    if (wheelTimer) clearTimeout(wheelTimer)
  })

  return {
    isUploadOpen,
    isRouteScreenOpen,
    isDesktopSnap,
    selectedFiles,
    uploadErrorMessage,
    toastMessage,
    toastKind,
    isToastVisible,
    isOnExplanation,
    isDragOver,
    formatBytes,
    showToast,
    openUploadSheet,
    closeUploadSheet,
    triggerFileInput,
    handleFileInputChange,
    removeFile,
    startReadingFiles,
    closeRouteScreen,
    handleQuestionnaireClick,
    handleMemberLoginClick,
    handleDemoLinkClick,
    handleScrollCueClick,
    handleBackdropClick,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleHeroPointerMove,
    handleHeroPointerLeave,
  }
}


