import { ref } from 'vue'

let lockCount = 0
let originalBodyOverflow = ''
let originalBodyPriority = ''
let originalHtmlOverflow = ''
let originalHtmlPriority = ''

/**
 * Care U｜Body 捲動鎖定 Composable
 *
 * 採用計數器機制 (Reference Counting)，支援多個模態視窗同時或接續開啟，
 * 同時鎖定 body 與 documentElement，確保在所有鎖定解除時精準還原原本的 overflow 與 priority。
 */
export function useBodyScrollLock() {
  const isLocked = ref(lockCount > 0)

  const lockBodyScroll = () => {
    if (typeof document === 'undefined') return
    if (lockCount === 0) {
      originalBodyOverflow = document.body.style.getPropertyValue('overflow')
      originalBodyPriority = document.body.style.getPropertyPriority('overflow')
      originalHtmlOverflow = document.documentElement.style.getPropertyValue('overflow')
      originalHtmlPriority = document.documentElement.style.getPropertyPriority('overflow')

      document.body.style.setProperty('overflow', 'hidden', 'important')
      document.documentElement.style.setProperty('overflow', 'hidden', 'important')
    }
    lockCount++
    isLocked.value = true
  }

  const unlockBodyScroll = () => {
    if (typeof document === 'undefined') return
    if (lockCount > 0) {
      lockCount--
    }
    if (lockCount === 0) {
      if (originalBodyOverflow) {
        document.body.style.setProperty('overflow', originalBodyOverflow, originalBodyPriority)
      } else {
        document.body.style.removeProperty('overflow')
      }
      if (originalHtmlOverflow) {
        document.documentElement.style.setProperty('overflow', originalHtmlOverflow, originalHtmlPriority)
      } else {
        document.documentElement.style.removeProperty('overflow')
      }
      originalBodyOverflow = ''
      originalBodyPriority = ''
      originalHtmlOverflow = ''
      originalHtmlPriority = ''
    }
    isLocked.value = lockCount > 0
  }

  return {
    isLocked,
    lockBodyScroll,
    unlockBodyScroll,
  }
}
