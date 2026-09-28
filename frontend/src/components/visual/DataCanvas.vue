<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Care U｜動態資料粒子背景 (DataCanvas)
 *
 * 【職責】
 * 封裝粒子點陣生成、Resize 監聽、RAF 動畫循環、游標視差互動與 Reduced Motion 適配。
 */
const props = withDefaults(
  defineProps<{
    canvasId?: string
    fullscreen?: boolean
    interactive?: boolean
  }>(),
  {
    canvasId: 'dataField',
    fullscreen: false,
    interactive: true,
  }
)

interface CanvasPoint {
  x: number
  y: number
  phase: number
  alpha: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

let points: CanvasPoint[] = []
let canvasWidth = 0
let canvasHeight = 0
let pointer = { x: -9999, y: -9999, active: false }
let rafId = 0
let mediaQueryList: MediaQueryList | null = null
let isDisposed = false

const checkReducedMotion = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

const cancelRaf = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

const buildField = () => {
  cancelRaf()
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  if (props.fullscreen) {
    canvasWidth = window.innerWidth
    canvasHeight = window.innerHeight
  } else {
    canvasWidth = canvas.parentElement?.clientWidth || window.innerWidth
    canvasHeight = canvas.parentElement?.clientHeight || window.innerHeight
  }

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
  if (isDisposed) return
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  const reduced = checkReducedMotion()

  points.forEach((point) => {
    const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y)
    const influence = pointer.active && props.interactive ? Math.max(0, 1 - distance / 125) : 0
    const pulse = reduced ? 0 : (Math.sin(time / 1350 + point.phase) + 1) * 0.11
    const radius = 1.05 + pulse + influence * 4.2
    const color =
      influence > 0.72 ? '251,143,84' : influence > 0.18 ? '25,122,252' : '163,211,247'
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${color},${Math.min(0.78, point.alpha + influence * 0.58)})`
    ctx.fill()
  })

  if (!reduced && (pointer.active || points.length > 0)) {
    rafId = requestAnimationFrame(drawField)
  }
}

const handlePointerMove = (e: PointerEvent) => {
  if (!props.interactive) return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  pointer.x = e.clientX - rect.left
  pointer.y = e.clientY - rect.top
  pointer.active = true

  if (!checkReducedMotion()) {
    cancelRaf()
    rafId = requestAnimationFrame(drawField)
  }
}

const handlePointerLeave = () => {
  pointer.active = false
  pointer.x = -9999
  pointer.y = -9999
}

const handleResize = () => {
  buildField()
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    if (window.matchMedia) {
      mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQueryList.addEventListener?.('change', () => {
        if (checkReducedMotion()) {
          cancelRaf()
        } else {
          cancelRaf()
          rafId = requestAnimationFrame(drawField)
        }
      })
    }
  }
  buildField()
})

onUnmounted(() => {
  isDisposed = true
  cancelRaf()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

defineExpose({
  handlePointerMove,
  handlePointerLeave,
  buildField,
})
</script>

<template>
  <canvas
    :id="canvasId"
    ref="canvasRef"
    :class="['data-canvas', { 'is-fullscreen': fullscreen }]"
    aria-hidden="true"
  />
</template>

<style scoped>
.data-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
  opacity: 0.9;
  pointer-events: none;
}

.data-canvas.is-fullscreen {
  position: fixed;
  z-index: 1;
}
</style>
