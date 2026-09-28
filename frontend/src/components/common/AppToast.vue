<script setup lang="ts">
/**
 * Care U｜通用 Toast 浮動提示元件 (AppToast)
 *
 * 【設計規範】
 * 支援 variant="home" (淺白對話氣泡 + 小角) 與 variant="report" (深海軍藍卡片)，
 * 100% 精準還原兩份原型之視覺外觀、陰影、字體與轉場動效。
 */
withDefaults(
  defineProps<{
    isOpen: boolean
    message: string
    kind?: 'info' | 'error'
    variant?: 'home' | 'report'
    toastId?: string
  }>(),
  {
    kind: 'info',
    variant: 'home',
    toastId: 'toast',
  }
)
</script>

<template>
  <div
    :id="toastId"
    class="toast"
    :class="[
      `toast--${variant}`,
      {
        'is-visible': isOpen,
        'is-error': kind === 'error',
      },
    ]"
    role="status"
    aria-live="polite"
  >
    {{ message }}
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  box-sizing: border-box;
}

/* Home Variant: 淺白氣泡 + 藍色小角 */
.toast--home {
  right: 22px;
  bottom: max(22px, env(safe-area-inset-bottom, 22px));
  max-width: min(360px, calc(100% - 44px));
  padding: 11px 16px;
  border: 1px solid rgba(25, 122, 252, 0.16);
  border-radius: 18px;
  color: rgba(7, 41, 92, 0.76);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 40px rgba(7, 41, 92, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.5;
  transform: translateY(10px);
  transition: opacity 180ms ease, transform 220ms cubic-bezier(0.22, 0.76, 0.22, 1);
}

.toast--home::after {
  content: "";
  position: absolute;
  left: 24px;
  bottom: -7px;
  width: 12px;
  height: 12px;
  border-right: 1px solid rgba(25, 122, 252, 0.16);
  border-bottom: 1px solid rgba(25, 122, 252, 0.16);
  background: rgba(255, 255, 255, 0.94);
  transform: rotate(45deg);
}

.toast--home.is-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.toast--home.is-error {
  border-color: rgba(235, 147, 142, 0.4);
  color: #994b47;
}

.toast--home.is-error::after {
  border-color: rgba(235, 147, 142, 0.4);
}

/* Report Variant: 深海軍藍膠囊卡片，中央底部定位 */
.toast--report {
  left: 50%;
  right: auto;
  bottom: 30px;
  max-width: calc(100% - 34px);
  padding: 13px 22px;
  border-radius: 14px;
  background: #07295c;
  color: #ffffff;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
  box-shadow: 0 10px 35px rgba(7, 41, 92, 0.133);
  transform: translate(-50%, 10px);
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 0.8, 0.32, 1);
}

.toast--report.is-visible {
  opacity: 1;
  transform: translate(-50%, 0);
  pointer-events: auto;
}

.toast--report.is-error {
  background: #991b1b;
  border: 1px solid #eb938e;
}

@media (max-width: 720px) {
  .toast--report {
    bottom: 74px;
    font-size: 12px;
    width: max-content;
  }
}
</style>
