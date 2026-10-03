<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'

/**
 * Care U｜通用模態視窗外殼 (AppModal)
 *
 * 【設計與行為規範（Technical PM Review Condition 1）】
 * 1. 僅共用 Overlay 半透明遮罩、Dialog 容器與基礎關閉互動。
 * 2. 嚴格支援 closeOnEsc 與 closeOnOverlay 參數。
 *    - 一般 Modal 預設為 true。
 *    - 健檢排除視窗 (ExcludeModal) 必須傳入 false（落實 DEC-04，禁止 ESC 與遮罩關閉）。
 * 3. 整合 useBodyScrollLock 安全管理背景捲動鎖定。
 * 4. 不新增未經測試的通用 Focus Trap，保留各頁面已驗收之焦點控制。
 * 5. 支援 Opt-in CSS Variables 佈局擴充 (customLayout)。
 */
const props = withDefaults(
  defineProps<{
    isOpen: boolean
    dialogId?: string
    ariaLabelledby?: string
    ariaLabel?: string
    ariaDescribedby?: string
    backdropClass?: string
    cardClass?: string
    closeOnEsc?: boolean
    closeOnOverlay?: boolean
    showCloseButton?: boolean
    closeButtonLabel?: string
    customLayout?: boolean
  }>(),
  {
    closeOnEsc: true,
    closeOnOverlay: true,
    showCloseButton: false,
    closeButtonLabel: '關閉視窗',
    customLayout: false,
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { lockBodyScroll, unlockBodyScroll } = useBodyScrollLock()

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget && props.closeOnOverlay) {
    emit('close')
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.isOpen && props.closeOnEsc && event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (props.isOpen) {
    unlockBodyScroll()
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<template>
  <div
    v-if="isOpen"
    :class="[
      'app-modal-backdrop',
      { 'app-modal-backdrop--custom': customLayout },
      backdropClass,
    ]"
    @click="handleBackdropClick"
  >
    <section
      :id="dialogId"
      :class="[
        'app-modal-card',
        { 'app-modal-card--custom': customLayout },
        cardClass,
      ]"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="ariaLabelledby"
      :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby"
      tabindex="-1"
    >
      <button
        v-if="showCloseButton"
        class="icon-button dialog-close"
        type="button"
        :aria-label="closeButtonLabel"
        @click="emit('close')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <slot />
    </section>
  </div>
</template>

<style scoped>
.app-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(7, 41, 92, 0.48);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow-y: auto;
}

.app-modal-card {
  position: relative;
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: var(--cu-radius-modal, 32px);
  background: #ffffff;
  box-shadow: var(--cu-shadow-modal, 0 35px 90px rgba(7, 41, 92, 0.24));
  outline: none;
}

/* Opt-in 自訂佈局支援：只有 customLayout: true 時生效 */
.app-modal-backdrop--custom {
  align-items: var(--cu-modal-backdrop-align, center);
  justify-content: var(--cu-modal-backdrop-justify, center);
  padding: var(--cu-modal-backdrop-padding, 20px);
  overflow: var(--cu-modal-backdrop-overflow, auto);
}

.app-modal-card--custom {
  width: var(--cu-modal-width, auto);
  max-width: var(--cu-modal-max-width, 100%);
  min-width: var(--cu-modal-min-width, 0);
  height: var(--cu-modal-height, auto);
  max-height: var(--cu-modal-max-height, none);
  padding: var(--cu-modal-padding, 0);
  border-radius: var(--cu-modal-radius, var(--cu-radius-modal, 32px));
  overflow: var(--cu-modal-overflow, visible);
  overflow-y: var(--cu-modal-overflow-y, var(--cu-modal-overflow, visible));
  scrollbar-gutter: var(--cu-modal-scrollbar-gutter, auto);
}
</style>
