<script setup lang="ts">
import BrandMark from '@/components/common/BrandMark.vue'

/**
 * Care U｜Loading 狀態視覺外殼 (LoadingStageVisual)
 *
 * 【職責與設計規範】
 * 1. 完整還原 Loading-1 與 Loading-2 原型中的氣泡對話框視覺、小角、陰影與模糊背景。
 * 2. 封裝 U Logo 暖橘圓點跳動 (loading-logo-dot-hop) 與三點依序起伏 (loading-dot-hop)。
 * 3. 狀態文字切換提供 220ms 平滑淡入淡出 (is-changing)。
 */
withDefaults(
  defineProps<{
    statusText: string
    isStatusChanging?: boolean
    statusId?: string
    ariaLabel?: string
    variant?: 'loading-1' | 'loading-2'
  }>(),
  {
    isStatusChanging: false,
    statusId: 'loadingStatusText',
    variant: 'loading-1',
  }
)
</script>

<template>
  <div class="loading-stage-visual loading-card" :class="[`variant-${variant}`]">
    <div class="loading-logo-wrap">
      <BrandMark
        class="loading-logo brand-mark"
        dot-class="logo-dot"
        :animate-dot="true"
      />
    </div>

    <div class="loading-typing-status typing-status">
      <p
        :id="statusId"
        class="status-line"
        aria-live="polite"
        aria-atomic="true"
        :aria-label="ariaLabel || `${statusText}，請稍候`"
      >
        <span
          class="status-copy"
          :class="{ 'is-fading': isStatusChanging, 'is-changing': isStatusChanging }"
        >
          {{ statusText }}
        </span>
        <span class="typing-status__dots" aria-hidden="true">
          <i>.</i><i>.</i><i>.</i>
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.loading-stage-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 2;
}

.loading-logo-wrap {
  display: block;
}

.loading-logo {
  display: block;
  width: clamp(119px, 16.2vw, 176px);
  height: auto;
  overflow: visible;
  filter: drop-shadow(0 20px 28px rgba(25, 122, 252, 0.14));
}

.loading-logo :deep(.logo-dot) {
  transform-box: fill-box;
  transform-origin: center;
  animation: loading-logo-dot-hop 1.45s cubic-bezier(0.22, 0.8, 0.32, 1) infinite;
}

.loading-typing-status {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  min-height: 34px;
  margin: clamp(28px, 4vh, 40px) 0 0;
  padding: 15px 25px 16px;
  border: 1px solid rgba(25, 122, 252, 0.16);
  border-radius: 18px;
  color: rgba(7, 41, 92, 0.7);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 34px rgba(7, 41, 92, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: clamp(0.83rem, 1.5vw, 0.96rem);
  font-weight: 700;
}

.loading-typing-status::before,
.loading-typing-status::after {
  content: "";
  position: absolute;
  left: 25px;
  bottom: -8px;
  width: 14px;
  height: 14px;
  transform: rotate(45deg);
}

.loading-typing-status::before {
  z-index: -1;
  border-right: 1px solid rgba(25, 122, 252, 0.16);
  border-bottom: 1px solid rgba(25, 122, 252, 0.16);
  background: rgba(255, 255, 255, 0.78);
}

.loading-typing-status::after {
  left: 26px;
  bottom: -6px;
  width: 12px;
  height: 12px;
  background: #ffffff;
}

.status-line {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
}

.status-copy {
  display: inline-block;
  transition: opacity 0.23s ease, transform 0.23s ease;
}

.status-copy.is-fading,
.status-copy.is-changing {
  opacity: 0;
  transform: translateY(5px);
}

.typing-status__dots {
  display: inline-flex;
  align-items: baseline;
  min-width: 1.35em;
  color: #197afc;
  letter-spacing: 0.01em;
}

.typing-status__dots i {
  display: inline-block;
  width: 0.42em;
  font-style: normal;
  transform-origin: center bottom;
  animation: loading-dot-hop 1.2s ease-in-out infinite;
}

.typing-status__dots i:nth-child(2) {
  animation-delay: 100ms;
}

.typing-status__dots i:nth-child(3) {
  animation-delay: 200ms;
}

@keyframes loading-logo-dot-hop {
  0%, 58%, 100% {
    transform: translateY(0);
  }
  26% {
    transform: translateY(-24px);
  }
  39% {
    transform: translateY(2px);
  }
  48% {
    transform: translateY(-5px);
  }
}

@keyframes loading-dot-hop {
  0%, 58%, 100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  25% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (max-width: 650px) {
  .loading-typing-status {
    font-size: 0.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-logo :deep(.logo-dot),
  .typing-status__dots i {
    animation: none !important;
  }
  .status-copy {
    transition: none !important;
  }
}
</style>
