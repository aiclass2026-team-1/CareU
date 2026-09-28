<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Care U｜入口頁 (Splash Page) View
 *
 * 【設計與工程規範依據】
 * 1. 來源原型：source/prototypes/CareU_入口頁原型.html
 * 2. 規格文件：source/page-specs/CareU_入口頁_頁面規格.md, docs/specs/page-specs/01-splash-page.md
 * 3. 視覺與動畫：
 *    - Logo 造型、SVG clipPath 遮罩水平線升起 (1.14s)、藍色清晰化 (1.28s)、Slogan 淡入 (0.66s)。
 *    - 一般模式 2850ms 自動進入；Reduced Motion 模式停止自動進入，直接顯示完整靜態版。
 *    - 支援點擊、觸控、Enter/Space 鍵主動略過動畫。
 *    - 依 Phase 2 規格移除重播按鈕與示意首頁。
 * 4. 路由轉場：
 *    - 骨架預覽階段暫時導向占位首頁 ('/')，正式整站流程留待 Phase 6。
 */

const router = useRouter()
const isLeaving = ref(false)
const splashRef = ref<HTMLElement | null>(null)

let autoEnterTimer: ReturnType<typeof setTimeout> | null = null
let leaveTimer: ReturnType<typeof setTimeout> | null = null
let mediaQueryList: MediaQueryList | null = null

const checkReducedMotion = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

const scheduleAutoEnter = () => {
  if (autoEnterTimer) {
    clearTimeout(autoEnterTimer)
    autoEnterTimer = null
  }
  if (!checkReducedMotion()) {
    autoEnterTimer = setTimeout(() => {
      enter()
    }, 2850)
  }
}

const enter = () => {
  if (isLeaving.value) return
  isLeaving.value = true

  if (autoEnterTimer) {
    clearTimeout(autoEnterTimer)
    autoEnterTimer = null
  }

  const isReduced = checkReducedMotion()
  // 時序說明：
  // - 2850ms：一般模式自動觸發 enter()
  // - 170ms：一般模式觸發 enter() 後的導航延遲（對齊原型基準）
  // - 440ms：CSS .splash.is-leaving 淡出 transition 時間（保持原樣）
  // - Reduced Motion：不自動進入；手動進入延遲為 0ms
  const delay = isReduced ? 0 : 170

  leaveTimer = setTimeout(() => {
    router.replace('/home')
  }, delay)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    enter()
  }
}

const handleMediaChange = () => {
  scheduleAutoEnter()
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryList.addEventListener?.('change', handleMediaChange)
  }
  scheduleAutoEnter()
  splashRef.value?.focus({ preventScroll: true })
})

onUnmounted(() => {
  if (autoEnterTimer) {
    clearTimeout(autoEnterTimer)
    autoEnterTimer = null
  }
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  if (mediaQueryList) {
    mediaQueryList.removeEventListener?.('change', handleMediaChange)
    mediaQueryList = null
  }
})
</script>

<template>
  <main
    ref="splashRef"
    class="screen splash"
    :class="{ 'is-leaving': isLeaving }"
    role="region"
    aria-label="Care U 開場動畫"
    :tabindex="isLeaving ? -1 : 0"
    @click="enter"
    @keydown="handleKeyDown"
  >
    <div class="splash__content" aria-hidden="true">
      <svg class="logo" viewBox="0 0 500 630.018" role="img" aria-label="Care U">
        <defs>
          <!-- 圓點最終位置的下緣（y=180.334）作為不可見的水平線遮罩 -->
          <clipPath id="dot-horizon" clipPathUnits="userSpaceOnUse">
            <rect x="159.833" y="-1" width="180.334" height="181.334" />
          </clipPath>
        </defs>
        <g class="logo__blue">
          <path
            d="M499.981,151.266c-12.088,0-16.978-.363-32.45.335-61.012,2.751-90.306,41.805-91.563,102.967-.942,45.862.13,91.825-1.936,137.617C371.262,453.575,313.39,506.251,250,506.251S128.738,453.575,125.968,392.185c-2.066-45.792-.994-91.755-1.936-137.617C122.775,193.406,93.481,154.352,32.469,151.6c-15.472-.7-20.362-.335-32.45-.335,0,144.2-.736,224.892,7.064,276.869C22.5,530.852,110.94,630.018,250,630.018s227.5-99.166,242.917-201.883C500.717,376.158,499.981,295.463,499.981,151.266Z"
            fill="#197afc"
          />
          <path
            d="M307.97,312.882H278.338V283.244a28.338,28.338,0,0,0-56.675,0v29.638H192.03a28.334,28.334,0,1,0,0,56.667h29.633v29.637a28.338,28.338,0,0,0,56.675,0V369.549H307.97a28.334,28.334,0,1,0,0-56.667Z"
            fill="#197afc"
          />
        </g>
        <g clip-path="url(#dot-horizon)">
          <circle class="logo__dot" cx="250" cy="90.167" r="90.167" fill="#fb8f54" />
        </g>
      </svg>

      <div class="brand-line" aria-label="Care U，為你的健康導航">
        <span class="brand-line__name">Care U</span>
        <span class="brand-line__separator">．</span>
        <span>為你的健康導航</span>
      </div>
    </div>

    <p class="enter-hint" aria-hidden="true">點擊畫面進入</p>
    <p class="visually-hidden">Care U，為你的健康導航。點擊或按 Enter 進入首頁</p>
  </main>
</template>


<style scoped>
.screen {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}

.splash {
  --brand-blue: #197afc;
  --brand-orange: #fb8f54;
  --brand-navy: #07295c;
  --surface: #f7f8fa;
  --motion-smooth: cubic-bezier(.22, .7, .18, 1);

  z-index: 100;
  width: 100vw;
  height: 100vh;
  height: 100svh;
  box-sizing: border-box;
  padding: clamp(24px, 5vw, 64px);
  background: var(--surface);
  color: var(--brand-navy);
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
  cursor: pointer;
  opacity: 1;
  visibility: visible;
  transition:
    opacity 440ms ease,
    visibility 0s linear 440ms;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  overflow: hidden;
  outline: none;
}

.splash:focus-visible {
  outline: 3px solid rgba(25, 122, 252, .32);
  outline-offset: -6px;
}

.splash.is-leaving {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.splash__content {
  display: flex;
  width: min(700px, 100%);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 4.4vh, 40px);
  text-align: center;
  transform: translateY(-1vh);
}

.logo {
  display: block;
  width: clamp(119px, 16.2vw, 176px);
  height: auto;
  overflow: visible;
}

.logo__blue {
  transform-origin: 250px 392px;
  animation: blue-clear 1.28s var(--motion-smooth) .28s both;
  will-change: opacity, filter, transform;
}

.logo__dot {
  animation: sunrise 1.14s var(--motion-smooth) .34s both;
  will-change: transform;
}

.brand-line {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-size: clamp(1.05rem, 2.2vw, 1.42rem);
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--brand-navy);
  animation: copy-in .66s ease 1.58s both;
  will-change: opacity, transform;
}

.brand-line__name {
  letter-spacing: -.02em;
}

.brand-line__separator {
  display: inline-block;
  margin: 0 .14em;
  font-size: .92em;
  opacity: .72;
}

.enter-hint {
  position: absolute;
  left: 50%;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  margin: 0;
  color: rgba(7, 41, 92, .48);
  font-size: .82rem;
  letter-spacing: .12em;
  pointer-events: none;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes blue-clear {
  0% {
    opacity: .18;
    filter: blur(15px);
    transform: scale(.985);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
}

@keyframes sunrise {
  0% {
    transform: translateY(180.334px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes copy-in {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .splash__content {
    gap: 22px;
  }

  .brand-line {
    font-size: 1rem;
    letter-spacing: -.02em;
  }

  .brand-line__separator {
    margin: 0 .08em;
    font-size: .88em;
  }

  .enter-hint {
    font-size: .7rem;
    letter-spacing: .08em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash,
  .logo__blue,
  .logo__dot,
  .brand-line {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    filter: none !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .splash.is-leaving {
    display: none !important;
  }
}
</style>
