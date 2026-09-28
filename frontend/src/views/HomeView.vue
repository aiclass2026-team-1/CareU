<script setup lang="ts">
import { ref } from 'vue'
import { useHome } from './useHome'
import BrandMark from '@/components/common/BrandMark.vue'
import AppToast from '@/components/common/AppToast.vue'
import LoginModal from '@/components/auth/LoginModal.vue'
import DataCanvas from '@/components/visual/DataCanvas.vue'
import networkBackImg from '@/assets/images/network-back.png'
import networkLeftImg from '@/assets/home/network-left.png'
import networkRightImg from '@/assets/home/network-right.png'
import '@/assets/home/home.css'

/**
 * Care U｜首頁 (Home & Upload Page) View
 *
 * 【設計與工程規範依據】
 * 1. 來源原型：source/prototypes/CareU_首頁原型.html
 * 2. 規格文件：source/page-specs/CareU_首頁_頁面規格.md, docs/specs/page-specs/02-home-page.md
 * 3. 雙屏垂直 Scroll Snap 架構（第一屏 Hero + 第二屏 資料說明頁 #trust）。
 * 4. 品牌進場動畫、打字跳動提示、三層節點視差、Canvas 粒子網絡。
 * 5. 上傳面板（UploadSheet）累加選檔、單檔 25MB、最多 10 檔限制、格式檢查與錯誤 Toast。
 * 6. Phase 5：整合共用 BrandMark、DataCanvas、AppToast、LoginModal 與共用背景圖。
 */

const networkBackRef = ref<HTMLElement | null>(null)
const networkLeftRef = ref<HTMLElement | null>(null)
const networkRightRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const dataCanvasRef = ref<InstanceType<typeof DataCanvas> | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const explanationRef = ref<HTMLElement | null>(null)

const {
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
  handleBackdropClick,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleHeroPointerMove,
  handleHeroPointerLeave,
  handleScrollCueClick,
  closeAuth,
  setAuthMode,
  togglePasswordVisibility,
  handleAuthSubmit,
  quickDemoLogin,
} = useHome({
  networkBackRef,
  networkLeftRef,
  networkRightRef,
  fileInputRef,
  heroRef,
  explanationRef,
})

const onHeroPointerMove = (e: PointerEvent) => {
  handleHeroPointerMove(e)
  dataCanvasRef.value?.handlePointerMove(e)
}

const onHeroPointerLeave = () => {
  handleHeroPointerLeave()
  dataCanvasRef.value?.handlePointerLeave()
}
</script>

<template>
  <div class="home-page-container" :class="{ 'is-desktop-snap': isDesktopSnap }">
    <main>
      <!-- 第一屏 Hero 區段 -->
      <section
        ref="heroRef"
        class="hero"
        aria-labelledby="hero-title"
        @pointermove="onHeroPointerMove"
        @pointerleave="onHeroPointerLeave"
      >
        <DataCanvas ref="dataCanvasRef" canvas-id="dataField" />

        <!-- 三層節點裝飾圖 -->
        <div id="networkBack" ref="networkBackRef" class="network-layer network-layer--back" aria-hidden="true">
          <img :src="networkBackImg" alt="" />
        </div>
        <div id="networkLeft" ref="networkLeftRef" class="network-layer network-layer--left" aria-hidden="true">
          <img :src="networkLeftImg" alt="" />
        </div>
        <div id="networkRight" ref="networkRightRef" class="network-layer network-layer--right" aria-hidden="true">
          <img :src="networkRightImg" alt="" />
        </div>

        <div class="soft-orb soft-orb--one" aria-hidden="true" />
        <div class="soft-orb soft-orb--two" aria-hidden="true" />

        <!-- 頂部品牌動畫區 -->
        <div class="brand-stage" aria-label="Care U">
          <div class="brand-lockup">
            <BrandMark class="brand-mark" dot-class="logo-dot" />
            <span class="wordmark-shell" aria-hidden="true">
              <svg class="brand-wordmark" viewBox="-8 -8 1016 274.897" aria-label="Care U">
                <path d="M972.486,0C957.427,0,946.2,8.265,946.2,30.082V156.916c0,32.166-19.41,48.334-49.132,48.173-29.166-.157-49.387-16.007-49.387-48.173V30.082C847.683,8.265,840.054.041,821.757,0c-18.52-.041-27.795,8.265-27.795,29.908,0,37.882.056,93.4.056,131.282,0,67.882,50.694,97.707,103.052,97.707C955.191,258.9,1000,229.072,1000,161.19c0-19.312,0-117.656,0-131.108C1000,8.265,989.564,0,972.486,0Z" fill="#07295c"/>
                <path d="M507.518,74.6c-36.891,0-73.9,18.946-73.9,70.376,0,27.079-.133,73.464-.133,87.02,0,10.955,5.457,26.9,24.458,26.9s24.55-10.577,24.55-26.9c0-21.548-.329-59.941-.329-87.02,0-11.581,7.8-25.576,26.11-25.061,23.684.667,34.666.591,38.559-15.091C550.6,89.628,539.633,74.6,507.518,74.6Z" fill="#07295c"/>
                <path d="M394.2,106.019c-17.543-20.612-44.684-31.47-71.968-31.422-18.862.033-37.792,5.278-53.664,16.117-27.288,19.417-37.683,45.094-37.683,76.406,0,53.433,36.749,91.777,91.347,91.777,30.612,0,44.79-13.694,44.79-13.694s2.416,13.694,23.6,13.694c13.185,0,22.6-9.29,22.6-23.248,0-8.3-.168-26.7-.168-68.529C413.047,139.407,407.358,121.485,394.2,106.019ZM322.249,212.457c-24.551,0-45.939-13.869-45.939-45.337,0-31.042,21.59-46.643,45.57-46.643,25.535,0,45.57,13.172,45.57,46.643C367.45,195.642,344.944,212.457,322.249,212.457Z" fill="#07295c"/>
                <path d="M642.263,73.621c-73.146,0-89.022,60.845-89.022,89.738,0,63.651,37.625,95.538,93.478,95.538,38.579,0,59.877-14.6,69.955-24.633a11.574,11.574,0,0,0-.244-16.576l-12.614-12a11.571,11.571,0,0,0-14.887-.814c-7.519,5.553-21.212,12.62-42.21,12.62-26.5,0-42.929-17.292-42.929-39.08h93.732c25.67,0,30.45-16.773,30.45-32.083C727.972,123.493,709.767,73.621,642.263,73.621ZM603.79,146.329c0-18.093,15.433-35.073,38.473-35.073,24.89,0,39.041,19.236,39.041,35.073Z" fill="#07295c"/>
                <path d="M220.032,33.2C205.448,21.025,186.154,0,122.677,0,63.062,0,0,40.867,0,128.931,0,220.058,60.123,258.9,125.771,258.9c57.59,0,77.51-21.15,90.808-33.466a11.583,11.583,0,0,0,.337-16.637L196.079,187.7a11.627,11.627,0,0,0-15.962-.513c-8.676,7.607-24.935,17.9-49.386,17.9-47.474,0-77.084-30.255-77.084-76.159,0-57.526,47.44-75.265,77.084-75.265,23.235,0,42.85,12.137,53.173,20.052a11.575,11.575,0,0,0,15.378-1.163l21.636-22.409A11.586,11.586,0,0,0,220.032,33.2Z" fill="#07295c"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Hero 主內容區 -->
        <div class="hero__content">
          <div class="typing-status" aria-label="你的身體正在輸入訊息">
            <span>［你的身體］正在輸入訊息</span>
            <span class="typing-status__dots" aria-hidden="true">
              <i>.</i><i>.</i><i>.</i><i>.</i><i>.</i><i>.</i>
            </span>
          </div>

          <div class="hero__message">
            <h1 id="hero-title">如果身體會說話，<br />最近想跟你說什麼？</h1>
            <div class="action-area">
              <button
                id="chooseFileButton"
                class="primary-cta"
                type="button"
                @click="openUploadSheet"
              >
                <span class="primary-cta__label">從體檢資料開始瞭解</span>
              </button>
              <p class="file-hint">支援 PDF、JPG、PNG，可選擇多個檔案</p>
              <p class="privacy-note">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-2h2zm0-4h-2V7h2z"
                    fill="currentColor"
                  />
                </svg>
                檔案將轉為去識別化資料保留 30 天，到期自動刪除。
              </p>
              <a
                id="questionnaireLink"
                class="questionnaire-link"
                href="#questionnaire"
                @click="handleQuestionnaireClick"
              >
                沒有資料？先從問卷開始 <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 向下箭頭捲動提示 -->
        <a class="scroll-cue" href="#trust" aria-label="前往資料說明頁" @click="handleScrollCueClick">
          <span class="scroll-cue__arrow" aria-hidden="true" />
        </a>
        <input
          id="fileInput"
          ref="fileInputRef"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          multiple
          hidden
          @change="handleFileInputChange"
        />
      </section>

      <!-- 第二屏 信任說明區段 -->
      <section id="trust" ref="explanationRef" class="explanation-page" aria-labelledby="trust-title">
        <div class="trust">
          <div class="section-inner">
            <p class="section-kicker">放心探索</p>
            <h2 id="trust-title">
              <span class="trust-title__phrase">讓資料的來源、用途</span><wbr />
              <span class="trust-title__phrase">與界線，都清楚可見。</span>
            </h2>
            <div class="trust-grid">
              <article class="trust-card">
                <span class="trust-card__number">01</span>
                <h3>資料如何使用</h3>
                <p>原始檔案在解析完成並轉為結構化資料後立即永久刪除；去識別化數值與評估紀錄保留 30 天，到期自動清除。</p>
                <a href="#privacy-demo" data-demo-link @click="handleDemoLinkClick">查看隱私說明 &rarr;</a>
              </article>
              <article class="trust-card">
                <span class="trust-card__number">02</span>
                <h3>判讀依據</h3>
                <p>依循衛福部目前公告的 14 項健康食品保健功效評估架構，推薦範圍以經衛福部審查通過的健康食品為基礎。</p>
                <a href="#source-demo" data-demo-link @click="handleDemoLinkClick">查看資料來源 &rarr;</a>
              </article>
              <article class="trust-card">
                <span class="trust-card__number">03</span>
                <h3>使用界線</h3>
                <p>Care U 協助整理體檢資訊與保健方向，結果僅供健康管理參考，不取代醫師診斷、治療或專業醫療建議。</p>
                <a href="#notice-demo" data-demo-link @click="handleDemoLinkClick">查看使用說明 &rarr;</a>
              </article>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="footer__inner">
            <span>&copy; Care U Prototype &bull; Typeface: LINE Seed TW</span>
            <nav class="footer__links" aria-label="頁尾連結">
              <a href="#privacy-demo" data-demo-link @click="handleDemoLinkClick">隱私權政策</a>
              <a href="#source-demo" data-demo-link @click="handleDemoLinkClick">資料來源</a>
              <a href="#terms-demo" data-demo-link @click="handleDemoLinkClick">使用條款</a>
              <a href="#notice-demo" data-demo-link @click="handleDemoLinkClick">健康資訊聲明</a>
            </nav>
          </div>
        </footer>
      </section>
    </main>

    <!-- 上傳面板 Modal -->
    <div
      id="uploadSheet"
      class="upload-sheet"
      :class="{ 'is-open': isUploadOpen, 'is-dragover': isDragOver }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="uploadTitle"
      @click="handleBackdropClick"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="upload-panel">
        <div class="upload-panel__top">
          <div>
            <h2 id="uploadTitle">準備讀取資料</h2>
            <p class="upload-panel__intro">確認檔案後再按「開始讀取」，目前尚未上傳。</p>
          </div>
          <button id="closeUpload" class="icon-button" type="button" aria-label="關閉" @click="closeUploadSheet">&times;</button>
        </div>
        <p class="upload-format-hint">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          支援 PDF、JPG、PNG，可選擇多個檔案。
        </p>

        <ul id="fileList" class="file-list">
          <li v-for="(file, index) in selectedFiles" :key="`${file.name}-${file.size}-${index}`" class="file-item">
            <span class="file-item__icon">{{ (file.name.split('.').pop() || 'FILE').toUpperCase().slice(0, 4) }}</span>
            <div class="file-item__meta">
              <p class="file-item__name">{{ file.name }}</p>
              <p class="file-item__size">{{ formatBytes(file.size) }}</p>
            </div>
            <button class="file-item__remove" type="button" aria-label="移除檔案" @click="removeFile(index)">&times;</button>
          </li>
        </ul>

        <p id="uploadError" class="upload-error" role="alert" :style="{ display: uploadErrorMessage ? 'block' : 'none' }">
          {{ uploadErrorMessage }}
        </p>

        <div class="sheet-actions">
          <button id="addFiles" class="secondary-button" type="button" @click="triggerFileInput">
            新增或重新選擇
          </button>
          <button
            id="startReading"
            class="start-button"
            type="button"
            :disabled="!selectedFiles.length"
            @click="startReadingFiles"
          >
            開始讀取
          </button>
        </div>
        <p class="sheet-privacy">
          原型僅模擬檔案選擇與流程，不會上傳或分析你的健康資料。正式版本須在此提供完整的資料保存與刪除規則。
        </p>
      </div>
    </div>

    <!-- 流程模擬轉場面板 -->
    <div
      id="routeScreen"
      class="route-screen"
      :class="{ 'is-open': isRouteScreenOpen }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="routeTitle"
    >
      <div class="route-screen__content">
        <div class="route-spinner" aria-hidden="true" />
        <h2 id="routeTitle">正在前往資料辨識頁</h2>
        <p id="routeDescription">首頁流程模擬至此，下一步將進入 Loading 頁。</p>
        <button id="returnHome" type="button" @click="closeRouteScreen">返回首頁原型</button>
      </div>
    </div>

    <!-- 會員登入懸浮按鈕 -->
    <button
      id="memberLogin"
      class="member-login"
      :class="{ 'is-on-explanation': isOnExplanation }"
      type="button"
      aria-label="會員登入"
      title="會員登入"
      @click="handleMemberLoginClick"
    >
      <svg viewBox="-12 -12 524 502.846" aria-hidden="true">
        <path
          d="M499.981.094c-12.088,0-16.978-.363-32.45.335C406.519,3.18,377.225,42.234,375.968,103.4c-.942,45.862.13,91.825-1.936,137.617C371.262,302.4,313.39,355.079,250,355.079S128.738,302.4,125.968,241.013c-2.066-45.792-.994-91.755-1.936-137.617C122.775,42.234,93.481,3.18,32.469.429,17-.269,12.107.094.019.094c0,144.2-.736,224.892,7.064,276.87C22.5,379.68,110.94,478.846,250,478.846S477.5,379.68,492.917,276.964C500.717,224.986,499.981,144.291,499.981.094Z"
          fill="currentColor"
        />
      </svg>
      <span class="member-login__label">Login</span>
    </button>

    <!-- 會員登入視窗 -->
    <LoginModal
      :is-open="isAuthModalOpen"
      :mode="authMode"
      :email="authEmail"
      :password="authPassword"
      :confirm-password="authConfirmPassword"
      :is-password-visible="isPasswordVisible"
      :error-message="authErrorMessage"
      @close="closeAuth"
      @set-mode="setAuthMode"
      @update:email="authEmail = $event"
      @update:password="authPassword = $event"
      @update:confirm-password="authConfirmPassword = $event"
      @toggle-password="togglePasswordVisibility"
      @submit="handleAuthSubmit"
      @quick-demo-login="quickDemoLogin"
    />

    <!-- Toast 提示組件 -->
    <AppToast variant="home" :is-open="isToastVisible" :message="toastMessage" :kind="toastKind" />
  </div>
</template>


