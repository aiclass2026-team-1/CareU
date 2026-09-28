import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useToast } from '@/composables/useToast'

interface UseHomeOptions {
  networkBackRef: Ref<HTMLElement | null>
  networkLeftRef: Ref<HTMLElement | null>
  networkRightRef: Ref<HTMLElement | null>
  fileInputRef: Ref<HTMLInputElement | null>
  heroRef: Ref<HTMLElement | null>
  explanationRef: Ref<HTMLElement | null>
}

export function useHome({
  networkBackRef,
  networkLeftRef,
  networkRightRef,
  fileInputRef,
  heroRef,
  explanationRef,
}: UseHomeOptions) {
  // 狀態管理
  const isUploadOpen = ref(false)
  const isRouteScreenOpen = ref(false)
  const isDesktopSnap = ref(false)
  const selectedFiles = ref<File[]>([])
  const uploadErrorMessage = ref('')
  const isOnExplanation = ref(false)
  const isDragOver = ref(false)

  // Auth 彈窗狀態 (Phase 5 共用 LoginModal，維持 Demo Auth 邊界)
  const isAuthModalOpen = ref(false)
  const authMode = ref<'login' | 'register' | 'forgot'>('login')
  const authEmail = ref('')
  const authPassword = ref('')
  const authConfirmPassword = ref('')
  const isPasswordVisible = ref(false)
  const authErrorMessage = ref('')

  // Toast 狀態 (使用共用 useToast)
  const { isToastVisible, toastMessage, toastKind, showToast } = useToast(2800)
  let wheelTimer: ReturnType<typeof setTimeout> | null = null
  let wheelLocked = false
  let mediaQueryList: MediaQueryList | null = null
  let isDisposed = false

  interface StyleBackup {
    value: string
    priority: string
  }
  const prevStyles: Record<string, StyleBackup> = {}
  const styleProps = ['scroll-behavior', 'scroll-snap-type', 'overscroll-behavior-y']

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

  // 會員登入視窗控制 (Phase 5 共用 LoginModal，維持 Demo Auth 規範)
  const openAuth = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    authMode.value = mode
    authErrorMessage.value = ''
    isPasswordVisible.value = false
    authEmail.value = ''
    authPassword.value = ''
    authConfirmPassword.value = ''
    isAuthModalOpen.value = true
  }

  const closeAuth = () => {
    isAuthModalOpen.value = false
    authErrorMessage.value = ''
  }

  const setAuthMode = (mode: 'login' | 'register' | 'forgot') => {
    authMode.value = mode
    authErrorMessage.value = ''
    authPassword.value = ''
    authConfirmPassword.value = ''
    isPasswordVisible.value = false
  }

  const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
  }

  const handleAuthSubmit = () => {
    const email = authEmail.value.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      authErrorMessage.value = '請輸入正確的電子郵件格式'
      return
    }

    if (authMode.value === 'forgot') {
      closeAuth()
      showToast('重設密碼預覽已送出（示範體驗）')
      return
    }

    if (!authPassword.value || authPassword.value.length < 8) {
      authErrorMessage.value = '密碼長度至少需要 8 碼'
      return
    }

    if (authMode.value === 'register' && authPassword.value !== authConfirmPassword.value) {
      authErrorMessage.value = '兩次輸入的密碼不一致'
      return
    }

    closeAuth()
    showToast('登入成功（示範體驗）')
  }

  const quickDemoLogin = () => {
    closeAuth()
    showToast('已使用示範帳號登入（示範體驗）')
  }

  const handleMemberLoginClick = () => {
    openAuth('login')
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

  const handleHeroPointerMove = (event: PointerEvent) => {
    if (!checkFinePointer()) return
    const hero = heroRef.value
    if (!hero) return

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
  }

  const handleHeroPointerLeave = () => {
    if (networkBackRef.value) {
      networkBackRef.value.style.transform = 'translate3d(0,0,0) scale(1.08)'
    }
    if (networkLeftRef.value) {
      networkLeftRef.value.style.transform = 'translate3d(0,0,0) scale(1)'
    }
    if (networkRightRef.value) {
      networkRightRef.value.style.transform = 'translate3d(0,0,0) scale(1)'
    }
  }

  const handleScroll = () => {
    isOnExplanation.value = window.scrollY >= window.innerHeight * 0.5
  }

  const handleWheel = (event: WheelEvent) => {
    // 只有在真正接管整屏切換的桌面環境下才攔截，彈窗開啟時不觸發雙屏滾動
    if (!isDesktopSnap.value || isUploadOpen.value || isRouteScreenOpen.value || isAuthModalOpen.value) {
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
    isAuthModalOpen,
    authMode,
    authEmail,
    authPassword,
    authConfirmPassword,
    isPasswordVisible,
    authErrorMessage,
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
    openAuth,
    closeAuth,
    setAuthMode,
    togglePasswordVisibility,
    handleAuthSubmit,
    quickDemoLogin,
  }
}


