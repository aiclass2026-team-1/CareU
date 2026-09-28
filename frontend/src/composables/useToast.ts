import { ref, onUnmounted } from 'vue'

export type ToastKind = 'info' | 'error'

/**
 * Care U｜Toast 浮動提示 Composable
 */
export function useToast(defaultDuration = 3000) {
  const isToastVisible = ref(false)
  const toastMessage = ref('')
  const toastKind = ref<ToastKind>('info')

  let toastTimer: ReturnType<typeof setTimeout> | null = null

  const showToast = (message: string, kind: ToastKind = 'info', duration = defaultDuration) => {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    toastMessage.value = message
    toastKind.value = kind
    isToastVisible.value = true

    toastTimer = setTimeout(() => {
      isToastVisible.value = false
      toastTimer = null
    }, duration)
  }

  const hideToast = () => {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    isToastVisible.value = false
  }

  onUnmounted(() => {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
  })

  return {
    isToastVisible,
    toastMessage,
    toastKind,
    showToast,
    hideToast,
  }
}
