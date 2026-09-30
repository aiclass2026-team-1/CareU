<script setup lang="ts">
import '@/assets/report/report.css'
import ReportHero from './ReportHero.vue'
import ReportChartSection from './ReportChartSection.vue'
import ReportInsightSection from './ReportInsightSection.vue'
import ReportRecommendationSection from './ReportRecommendationSection.vue'
import ReportBundleSection from './ReportBundleSection.vue'
import LoginModal from '@/components/auth/LoginModal.vue'
import CartModal from './CartModal.vue'
import AppToast from '@/components/common/AppToast.vue'
import AppModal from '@/components/common/AppModal.vue'
import { useReport } from './useReport'
import { checkDemoMode } from '@/utils/demoMode'
const isDemo = checkDemoMode()


const {
  activeProfileKey,
  isMember,
  selectedCategoryForChart,
  selectedProducts,
  expandedCandidateDirections,
  isAuthModalOpen,
  authMode,
  authEmail,
  authPassword,
  authConfirmPassword,
  isPasswordVisible,
  authErrorMessage,
  toastMessage,
  isToastVisible,
  isDemoPanelOpen,
  isCartModalOpen,
  cartConfirmMode,
  isMemberModalOpen,
  openMemberModal,
  closeMemberModal,
  confirmLogout,
  currentProfile,
  currentSummary,
  chartRows,
  selectedChartItem,
  insightRows,
  recommendationDirections,
  deferredDirections,
  category,
  product,
  candidatesFor,
  uniqueSelected,
  bundleTotal,
  formatMoney,
  supplementationReason,
  doseTone,
  isTablet,
  toggleChartCategory,
  setBrowsingProduct,
  getActiveProductForDirection,
  getProductReason,
  selectProduct,
  removeProduct,
  toggleCandidates,
  openAuth,
  closeAuth,
  setAuthMode,
  togglePasswordVisibility,
  handleAuthSubmit,
  quickDemoLogin,
  logout,
  showToast,
  switchProfile,
  restoreDefaultBundle,
  clearBundle,
  openCart,
  closeCart,
  confirmPurchase,
  scrollToSection,
} = useReport()

function handleDemoLink(name: string) {
  showToast(`${name}：此為原型示意入口，正式內容待整合。`)
}
</script>

<template>
  <div class="report-container">
    <!-- SVG Sprite for Icons -->
    <svg id="symbolSprite" width="0" height="0" style="position: absolute" aria-hidden="true">
      <defs>
        <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" /></symbol>
        <symbol id="i-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></symbol>
        <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.1" /></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></symbol>
        <symbol id="i-cart" viewBox="0 0 24 24"><path d="M2 3h3l2 13h12l2-9H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></symbol>
        <symbol id="i-spark" viewBox="0 0 24 24"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" /></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></symbol>
        <symbol id="i-eye-off" viewBox="0 0 24 24"><path d="m3 3 18 18M10.5 5.2A12 12 0 0 1 12 5c6.5 0 10 7 10 7a19 19 0 0 1-3 3.8M6.1 6.1A22 22 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.9-1.5M10 10a3 3 0 0 0 4 4" /></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></symbol>
      </defs>
    </svg>

    <a class="skip" href="#chartSection" @click.prevent="scrollToSection('chartTitle')">跳至分析內容</a>

    <div id="reportApp" class="report-enter">
      <!-- HERO -->
      <ReportHero
        :is-member="isMember"
        :summary="currentSummary"
        @open-cart="openCart(false)"
        @open-auth="openAuth('login')"
        @open-member-modal="openMemberModal"
        @logout="logout"
      />

      <!-- Side Navigation -->
      <nav class="page-nav" aria-label="報告區段">
        <a href="#chartSection" aria-label="保健關注圖表" @click.prevent="scrollToSection('chartTitle')">保健關注圖表</a>
        <a href="#insightSection" aria-label="重點保健方向" @click.prevent="scrollToSection('insightTitle')">重點保健方向</a>
        <a href="#recommendSection" aria-label="保健食品推薦" @click.prevent="scrollToSection('recommendTitle')">
          保健食品推薦
          <svg v-if="!isMember" class="icon" aria-hidden="true"><use href="#i-lock" /></svg>
        </a>
        <a href="#bundleAnchor" aria-label="專屬保健組合" @click.prevent="scrollToSection('bundleTitle', 'bundleAnchor')">專屬保健組合</a>
      </nav>

      <main>
        <!-- SECTION 1: CHART -->
        <ReportChartSection
          :chart-rows="chartRows"
          :selected-category-for-chart="selectedCategoryForChart"
          :selected-chart-item="selectedChartItem"
          :category="category"
          @open-auth="openAuth('login')"
          @toggle-category="toggleChartCategory"
        />

        <!-- SECTION 2: INSIGHTS -->
        <ReportInsightSection
          :is-member="isMember"
          :insight-rows="insightRows"
          :category="category"
          @open-auth="openAuth('login')"
        />

        <!-- SECTION 3 & 4: COMMERCE (RECOMMENDATIONS & PERSONAL BUNDLE) -->
        <section class="commerce" id="recommendSection" aria-labelledby="recommendTitle">
          <div class="wrap">
            <ReportRecommendationSection
              :is-member="isMember"
              :current-profile="currentProfile"
              :recommendation-directions="recommendationDirections"
              :deferred-directions="deferredDirections"
              :selected-products="selectedProducts"
              :category="category"
              :product="product"
              :candidates-for="candidatesFor"
              :get-active-product-for-direction="getActiveProductForDirection"
              :get-product-reason="getProductReason"
              :format-money="formatMoney"
              :dose-tone="doseTone"
              :is-tablet="isTablet"
              @open-auth="openAuth('login')"
              @set-browsing-product="setBrowsingProduct"
              @select-product="selectProduct"
            />

            <ReportBundleSection
              :is-member="isMember"
              :product-directions="currentProfile.productDirections"
              :selected-products="selectedProducts"
              :expanded-candidate-directions="expandedCandidateDirections"
              :unique-selected="uniqueSelected()"
              :bundle-total="bundleTotal()"
              :category="category"
              :product="product"
              :candidates-for="candidatesFor"
              :get-product-reason="getProductReason"
              :supplementation-reason="supplementationReason"
              :format-money="formatMoney"
              :dose-tone="doseTone"
              :is-tablet="isTablet"
              @toggle-candidates="toggleCandidates"
              @remove-product="removeProduct"
              @select-product="selectProduct"
              @open-cart="openCart(true)"
            />
          </div>
        </section>
      </main>

      <!-- FOOTER -->
      <footer class="footer">
        <div class="footer__inner">
          <span>© Care U Prototype</span>
          <nav class="footer__links" aria-label="頁尾連結">
            <a href="#privacy-demo" @click.prevent="handleDemoLink('隱私權政策')">隱私權政策</a>
            <a href="#source-demo" @click.prevent="handleDemoLink('資料來源')">資料來源</a>
            <a href="#terms-demo" @click.prevent="handleDemoLink('使用條款')">使用條款</a>
            <a href="#notice-demo" @click.prevent="handleDemoLink('健康資訊聲明')">健康資訊聲明</a>
          </nav>
        </div>
      </footer>
    </div>

    <!-- DEMO CONTROLLER -->
    <aside v-if="isDemo" class="demo-controller" id="demoController" aria-label="原型展示控制">
      <div v-if="isDemoPanelOpen" class="demo-panel" id="demoPanel">
        <h3>Demo Controller</h3>
        <p>切換展示情境。個人分析為預設示範資料，不進行真實健康評分。</p>
        <label for="profileSelect">Demo C｜不同使用者</label>
        <select
          id="profileSelect"
          :value="activeProfileKey"
          @change="switchProfile(($event.target as HTMLSelectElement).value as any)"
        >
          <option value="a">小安｜3 品項・過敏待核對・黃色提醒</option>
          <option value="b">小晴｜1 品項・僅 1 款可選</option>
          <option value="c">阿哲｜4 品項・紅／黃提醒</option>
          <option value="g">小柔｜禁用條件・候選品項全數排除</option>
        </select>
        <button class="button" id="demoGuest" type="button" @click="logout">
          Demo A｜回到未登入
        </button>
        <button class="button" id="demoLogin" type="button" @click="openAuth('login')">
          Demo B｜開啟登入／註冊
        </button>
        <div class="demo-sub">
          <button class="button" id="restoreBundle" type="button" @click="restoreDefaultBundle">
            重設本情境的保健組合
          </button>
          <button class="button" id="clearBundle" type="button" @click="clearBundle">
            清空組合，測試空狀態
          </button>
        </div>
      </div>
      <button
        class="demo-toggle"
        id="demoToggle"
        type="button"
        :aria-expanded="isDemoPanelOpen ? 'true' : 'false'"
        aria-controls="demoPanel"
        @click="isDemoPanelOpen = !isDemoPanelOpen"
      >
        Demo
      </button>
    </aside>

    <!-- AUTH MODAL -->
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

    <!-- MEMBER LOGOUT CONFIRMATION MODAL -->
    <AppModal
      :is-open="isMemberModalOpen"
      dialog-id="auxDialog"
      backdrop-class="dialog-backdrop"
      card-class="dialog-card cart-dialog"
      aria-labelledby="auxTitle"
      :close-on-esc="true"
      :close-on-overlay="true"
      @close="closeMemberModal"
    >
      <button
        class="icon-button dialog-close"
        id="auxClose"
        type="button"
        aria-label="關閉視窗"
        @click="closeMemberModal"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>

      <div id="auxContent">
        <h2 id="auxTitle" class="dialog-title">示範會員</h2>
        <p class="dialog-intro">
          完整分析與選購功能已解鎖。<br />目前沒有建立真實會員帳號。
        </p>
        <button
          class="button outline"
          id="logoutButton"
          type="button"
          style="width: 100%; margin-top: 16px"
          @click="confirmLogout"
        >
          登出示範會員
        </button>
      </div>
    </AppModal>

    <!-- CART MODAL -->
    <CartModal
      :is-open="isCartModalOpen"
      :confirm-mode="cartConfirmMode"
      :items="uniqueSelected()"
      :total="bundleTotal()"
      @close="closeCart"
      @confirm="confirmPurchase"
    />

    <!-- TOAST NOTIFICATION -->
    <AppToast variant="report" :is-open="isToastVisible" :message="toastMessage" />
  </div>
</template>
