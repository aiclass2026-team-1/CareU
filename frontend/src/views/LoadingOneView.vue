<script setup lang="ts">
import { ref } from 'vue'
import { useLoadingOne, QUESTIONS } from './useLoadingOne'
import networkBackImg from '@/assets/loading-one/network-back.png'
import '@/assets/loading-one/loading-one.css'

/**
 * Care U｜Loading頁-1 與排除視窗 View
 *
 * 【設計與工程規範依據】
 * 1. 來源原型：source/prototypes/CareU_Loading頁-1_排除視窗_原型.html
 * 2. 規格文件：source/page-specs/CareU_Loading頁-1_排除視窗_頁面規格.md, docs/specs/page-specs/03-loading-1-exclude-modal.md
 * 3. 4 階段狀態文字推進、Logo 橘點跳動、動態三點起伏、Canvas 點陣資料場。
 * 4. 排除視窗（ExcludeModal）：落實 DEC-01 雙分支（返回首頁 / 直接填寫問卷）與 DEC-04（不支援 Escape 與遮罩關閉，Tab 焦點鎖定）。
 * 5. 內嵌問卷與首頁外殼僅為頁內展示驗證（Demo Only），不代表正式跨頁資料結構。
 */

const networkBackRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const excludeModalRef = ref<HTMLElement | null>(null)
const modalHomeRef = ref<HTMLButtonElement | null>(null)
const modalQuestionnaireRef = ref<HTMLButtonElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const questionTitleRef = ref<HTMLElement | null>(null)
const homeTitleRef = ref<HTMLElement | null>(null)

const {
  activeScreen,
  isExcludeOpen,
  isDemoPanelOpen,
  statusText,
  isStatusFading,
  questionnaireSource,
  currentQuestionIndex,
  selectedAnswers,
  isDemoCompleted,
  handleSelectOption,
  handleNextQuestion,
  handleResetQuestionnaire,
  handleModalHome,
  handleModalQuestionnaire,
  triggerFileInput,
  handleFileInputChange,
  handleStartFromQuestionnaire,
  toggleDemoPanel,
  runSuccessDemo,
  runExcludeDemo,
  restartDemo,
  handlePointerMove,
  handlePointerLeave,
} = useLoadingOne({
  networkBackRef,
  canvasRef,
  excludeModalRef,
  modalHomeRef,
  modalQuestionnaireRef,
  fileInputRef,
  questionTitleRef,
  homeTitleRef,
})
</script>

<template>
  <div
    class="loading-one-container"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <canvas id="dataField" ref="canvasRef" aria-hidden="true" />

    <!-- 後景節點圖層 -->
    <div id="networkBack" ref="networkBackRef" class="network-layer network-layer--back" aria-hidden="true">
      <img :src="networkBackImg" alt="" />
    </div>

    <!-- 柔和徑向光暈 -->
    <div class="soft-orb soft-orb--one" aria-hidden="true" />
    <div class="soft-orb soft-orb--two" aria-hidden="true" />

    <!-- 1. Loading 畫面 -->
    <section
      id="loadingScreen"
      class="screen loading-screen"
      :class="{ 'is-active': activeScreen === 'loading' }"
      aria-label="資料處理中"
    >
      <div class="loading-card">
        <svg class="loading-logo brand-mark" viewBox="0 0 300 378.011" role="img" aria-label="Care U Logo">
          <path d="M299.989,90.76c-7.253,0-10.187-.218-19.47.2-36.608,1.65-54.184,25.083-54.938,61.78-.565,27.517.078,55.1-1.162,82.57C222.757,272.145,188.034,303.75,150,303.75s-72.757-31.605-74.419-68.439c-1.24-27.475-.6-55.053-1.162-82.57-.754-36.7-18.33-60.13-54.938-61.78-9.283-.419-12.217-.2-19.47-.2C.011,177.278-.43,225.7,4.25,256.881,13.5,318.511,66.564,378.011,150,378.011s136.5-59.5,145.75-121.13C300.43,225.7,299.989,177.278,299.989,90.76Z" fill="#197afc"/>
          <circle class="logo-dot" cx="150" cy="54.1" r="54.1" fill="#fb8f54"/>
          <path d="M184.782,187.729H167V169.947a17,17,0,0,0-34,0v17.782h-17.78a17,17,0,1,0,0,34H133v17.783a17,17,0,0,0,34,0V221.729h17.779a17,17,0,1,0,0-34Z" fill="#197afc"/>
        </svg>

        <div class="loading-typing-status typing-status" id="loadingStatus" role="status" aria-live="polite" :aria-label="`${statusText}，請稍候`">
          <p class="status-line">
            <span class="status-copy typing-status__copy" :class="{ 'is-changing': isStatusFading }" id="statusCopy">{{ statusText }}</span>
            <span class="typing-status__dots" aria-hidden="true">
              <i>.</i><i>.</i><i>.</i>
            </span>
          </p>
        </div>
      </div>

      <p class="loading-note" id="loadingNote">請保持頁面開啟，我們正在整理你提供的資料。</p>
    </section>

    <!-- 2. 排除視窗 (Exclude Modal) -->
    <div
      id="excludeBackdrop"
      class="modal-backdrop"
      :class="{ 'is-open': isExcludeOpen }"
      :aria-hidden="isExcludeOpen ? 'false' : 'true'"
    >
      <div
        id="excludeModal"
        ref="excludeModalRef"
        class="exclude-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="excludeTitle"
        aria-describedby="excludeDesc"
        tabindex="-1"
      >
        <div class="modal-symbol" aria-hidden="true">
          <!-- 使用者確認保留的叉叉圖示 -->
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="rgba(235, 147, 142, .18)" />
            <path d="M14 14l12 12M26 14L14 26" stroke="#EB938E" stroke-width="2.6" stroke-linecap="round" />
          </svg>
        </div>
        <h2 id="excludeTitle">目前無法使用這份資料</h2>
        <p id="excludeDesc">這份檔案可能不是體檢或健康相關資料，或內容暫時無法辨識。你可以返回首頁重新上傳其他檔案，或直接填寫健康問卷。</p>
        <div class="modal-actions">
          <div class="modal-action">
            <button
              id="modalHome"
              ref="modalHomeRef"
              class="button primary"
              type="button"
              @click="handleModalHome"
            >
              返回首頁
            </button>
            <small>重新上傳檔案</small>
          </div>
          <div class="modal-action">
            <button
              id="modalQuestionnaire"
              ref="modalQuestionnaireRef"
              class="button secondary"
              type="button"
              @click="handleModalQuestionnaire"
            >
              直接填寫問卷
            </button>
            <small aria-hidden="true">&nbsp;</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 示範問卷畫面 (Demo Only) -->
    <section
      id="questionnaireScreen"
      class="screen"
      :class="{ 'is-active': activeScreen === 'questionnaire' }"
      aria-label="健康問卷示範"
    >
      <div class="question-shell">
        <div class="question-header">
          <p class="eyebrow" id="questionSource">
            {{ questionnaireSource === 'supplement' ? '資料補充（示範）' : '健康問卷（示範）' }}
          </p>
          <h1 id="questionTitle" ref="questionTitleRef" tabindex="-1">
            {{ questionnaireSource === 'supplement' ? '我們已讀取你提供的體檢資料' : '先從幾個日常問題開始' }}
          </h1>
          <p id="questionIntro">
            {{ questionnaireSource === 'supplement'
              ? '接下來只需要補充幾項資訊，幫助我們更完整地了解你的日常狀況。'
              : '沒有體檢資料也沒關係，我們會從你的生活習慣與健康狀況開始了解。'
            }}
          </p>
        </div>

        <div class="progress-row">
          <div class="progress-track"><div class="progress-fill" :style="{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }"></div></div>
          <div class="progress-count">{{ currentQuestionIndex + 1 }} / {{ QUESTIONS.length }}</div>
        </div>

        <div v-if="!isDemoCompleted">
          <div class="question-panel">
            <h2 id="activeQuestion">{{ QUESTIONS[currentQuestionIndex].title }}</h2>
            <div class="option-grid" role="radiogroup" aria-labelledby="activeQuestion">
              <label
                v-for="opt in QUESTIONS[currentQuestionIndex].options"
                :key="opt"
                class="option"
                :class="{ 'is-selected': selectedAnswers[currentQuestionIndex] === opt }"
              >
                <input
                  type="radio"
                  :name="`question-${currentQuestionIndex}`"
                  :value="opt"
                  :checked="selectedAnswers[currentQuestionIndex] === opt"
                  @change="handleSelectOption(currentQuestionIndex, opt)"
                />
                <span class="option-mark" aria-hidden="true"></span>
                <span>{{ opt }}</span>
              </label>
            </div>
          </div>
          <div class="question-actions">
            <button
              class="button secondary"
              type="button"
              :disabled="currentQuestionIndex === 0"
              @click="currentQuestionIndex--"
            >
              上一題
            </button>
            <button
              class="button primary"
              type="button"
              :disabled="!selectedAnswers[currentQuestionIndex]"
              @click="handleNextQuestion"
            >
              {{ currentQuestionIndex < QUESTIONS.length - 1 ? '下一題' : '完成示範' }}
            </button>
          </div>
        </div>

        <div v-else class="prototype-end is-visible">
          <h2>示範問卷已完成</h2>
          <p>此處為 Loading-1 示範流程。正式問卷將於後續階段串接。</p>
          <button class="button primary" type="button" @click="handleResetQuestionnaire">
            重新示範填答
          </button>
        </div>
      </div>
    </section>

    <!-- 4. 示範首頁外殼 (Demo Only) -->
    <section
      id="homeScreen"
      class="screen"
      :class="{ 'is-active': activeScreen === 'home' }"
      aria-label="首頁示範"
    >
      <div class="home-shell">
        <div class="home-lockup">
          <svg viewBox="0 0 300 378.011" aria-hidden="true">
            <path d="M299.989,90.76c-7.253,0-10.187-.218-19.47.2-36.608,1.65-54.184,25.083-54.938,61.78-.565,27.517.078,55.1-1.162,82.57C222.757,272.145,188.034,303.75,150,303.75s-72.757-31.605-74.419-68.439c-1.24-27.475-.6-55.053-1.162-82.57-.754-36.7-18.33-60.13-54.938-61.78-9.283-.419-12.217-.2-19.47-.2C.011,177.278-.43,225.7,4.25,256.881,13.5,318.511,66.564,378.011,150,378.011s136.5-59.5,145.75-121.13C300.43,225.7,299.989,177.278,299.989,90.76Z" fill="#197afc"/>
            <circle cx="150" cy="54.1" r="54.1" fill="#fb8f54"/>
            <path d="M184.782,187.729H167V169.947a17,17,0,0,0-34,0v17.782h-17.78a17,17,0,1,0,0,34H133v17.783a17,17,0,0,0,34,0V221.729h17.779a17,17,0,1,0,0-34Z" fill="#197afc"/>
          </svg>
          <strong>Care U</strong>
        </div>
        <p class="typing-label">［你的身體］正在輸入訊息……</p>
        <h1 id="homeTitle" ref="homeTitleRef" tabindex="-1">如果身體會說話，<br>最近想跟你說什麼？</h1>
        <div class="home-actions">
          <button class="button primary home-primary" type="button" @click="triggerFileInput">
            從體檢資料開始瞭解（示範）
          </button>
          <a href="#questionnaire" class="home-link" @click="handleStartFromQuestionnaire">
            沒有資料？先從問卷開始 &rarr;
          </a>
          <p class="privacy-note">此為排除視窗返回之示範首頁</p>
        </div>
        <input
          id="demoFileInput"
          ref="fileInputRef"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          hidden
          @change="handleFileInputChange"
        />
      </div>
    </section>

    <!-- 5. Demo 控制面板 -->
    <aside class="demo-controller" aria-label="原型情境控制">
      <div class="demo-panel" id="demoPanel" :hidden="!isDemoPanelOpen">
        <p>此面板只供原型展示，不屬於正式網站介面。</p>
        <div class="demo-buttons">
          <button type="button" @click="runSuccessDemo">播放正常流程</button>
          <button type="button" @click="runExcludeDemo">播放排除流程</button>
          <button type="button" @click="restartDemo">重新開始</button>
        </div>
      </div>
      <button
        class="demo-toggle"
        id="demoToggle"
        type="button"
        :aria-expanded="isDemoPanelOpen ? 'true' : 'false'"
        aria-controls="demoPanel"
        @click="toggleDemoPanel"
      >
        Demo
      </button>
    </aside>
  </div>
</template>
