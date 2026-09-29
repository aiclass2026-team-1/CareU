<script setup lang="ts">
import BrandMark from '@/components/common/BrandMark.vue'
import AppModal from '@/components/common/AppModal.vue'
import { checkDemoMode } from '@/utils/demoMode'
const isDemo = checkDemoMode()


/**
 * Care U｜全域共用會員登入視窗 (LoginModal)
 *
 * 【設計與行為規範】
 * 1. 支援「登入」、「註冊」、「忘記密碼」三種模式。
 * 2. 支援密碼眼睛明文切換與示範帳號一鍵體驗。
 * 3. 純前端 Demo Auth 狀態與驗證，不涉及正式後端鑑權。
 * 4. 外殼接入 AppModal，共用 Overlay 結構與背景捲動鎖定。
 */
defineProps<{
  isOpen: boolean
  mode: 'login' | 'register' | 'forgot'
  email: string
  password: string
  confirmPassword: string
  isPasswordVisible: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'setMode', mode: 'login' | 'register' | 'forgot'): void
  (e: 'update:email', val: string): void
  (e: 'update:password', val: string): void
  (e: 'update:confirmPassword', val: string): void
  (e: 'togglePassword'): void
  (e: 'submit'): void
  (e: 'quickDemoLogin'): void
}>()
</script>

<template>
  <AppModal
    :is-open="isOpen"
    dialog-id="authDialog"
    backdrop-class="dialog-backdrop auth-layer"
    card-class="dialog-card"
    aria-labelledby="authTitle"
    :close-on-esc="true"
    :close-on-overlay="true"
    @close="emit('close')"
  >
    <button
      class="dialog-close"
      type="button"
      aria-label="關閉會員視窗"
      @click="emit('close')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    </button>

    <div class="auth-logo" aria-hidden="true">
      <BrandMark class="careu-logo" dot-class="logo-dot" />
    </div>

    <h2 class="dialog-title" id="authTitle">
      {{ mode === 'login' ? '歡迎回到 Care U' : mode === 'register' ? '開始你的保健探索' : '忘記密碼了嗎？' }}
    </h2>
    <p class="dialog-intro" id="authIntro">
      <template v-if="mode === 'forgot'">
        輸入電子郵件，預覽重設密碼流程。<br />本原型不會實際寄送郵件。
      </template>
      <template v-else>
        登入後，接續了解你的完整報告<br />與專屬保健組合。
      </template>
    </p>

    <div v-if="mode !== 'forgot'" class="auth-tabs" id="authTabs" aria-label="會員操作">
      <button
        type="button"
        id="loginTab"
        :aria-pressed="mode === 'login' ? 'true' : 'false'"
        @click="emit('setMode', 'login')"
      >
        登入
      </button>
      <button
        type="button"
        id="registerTab"
        :aria-pressed="mode === 'register' ? 'true' : 'false'"
        @click="emit('setMode', 'register')"
      >
        註冊
      </button>
    </div>

    <form id="authForm" novalidate @submit.prevent="emit('submit')">
      <label class="form-field" for="authEmail">
        電子郵件
        <input
          id="authEmail"
          :value="email"
          type="email"
          inputmode="email"
          autocomplete="off"
          placeholder="name@example.com"
          required
          @input="emit('update:email', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label v-if="mode !== 'forgot'" class="form-field" id="passwordField" for="authPassword">
        密碼
        <span class="password-wrap">
          <input
            id="authPassword"
            :value="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            autocomplete="off"
            placeholder="請輸入示範密碼"
            minlength="8"
            required
            @input="emit('update:password', ($event.target as HTMLInputElement).value)"
          />
          <button
            class="show-pass"
            type="button"
            :aria-label="isPasswordVisible ? '隱藏密碼' : '顯示密碼'"
            :aria-pressed="isPasswordVisible ? 'true' : 'false'"
            @click="emit('togglePassword')"
          >
            <svg v-if="isPasswordVisible" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m3 3 18 18M10.5 5.2A12 12 0 0 1 12 5c6.5 0 10 7 10 7a19 19 0 0 1-3 3.8M6.1 6.1A22 22 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.9-1.5M10 10a3 3 0 0 0 4 4" />
            </svg>
            <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </span>
      </label>

      <label v-if="mode === 'register'" class="form-field" id="confirmField" for="authConfirm">
        確認密碼
        <input
          id="authConfirm"
          :value="confirmPassword"
          :type="isPasswordVisible ? 'text' : 'password'"
          autocomplete="off"
          placeholder="再次輸入示範密碼"
          minlength="8"
          required
          @input="emit('update:confirmPassword', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <div v-if="mode === 'login'" class="form-meta" id="forgotRow">
        <button class="text-button" type="button" id="forgotPassword" @click="emit('setMode', 'forgot')">
          忘記密碼？
        </button>
      </div>

      <p v-if="errorMessage" class="form-error" id="authError" role="alert">
        {{ errorMessage }}
      </p>

      <button class="button primary auth-submit" type="submit" id="authSubmit">
        {{ mode === 'login' ? '登入' : mode === 'register' ? '建立帳號並登入' : '預覽重設密碼' }}
      </button>
    </form>

    <p class="auth-switch" id="authSwitch">
      <template v-if="mode === 'forgot'">
        返回 <button class="text-button" type="button" @click="emit('setMode', 'login')">登入畫面</button>
      </template>
      <template v-else-if="mode === 'register'">
        已有帳號？ <button class="text-button" type="button" @click="emit('setMode', 'login')">立即登入</button>
      </template>
      <template v-else>
        還沒有帳號？ <button class="text-button" type="button" @click="emit('setMode', 'register')">建立帳號</button>
      </template>
    </p>

    <template v-if="isDemo">
      <p class="demo-auth-note" id="authDemoNote">
        本次為模擬登入，請勿輸入真實密碼。<br />不傳送註冊資料，也不儲存電子郵件或密碼。
      </p>
      <button
        v-if="mode !== 'forgot'"
        class="button outline small demo-auth-button"
        id="quickDemoLogin"
        type="button"
        @click="emit('quickDemoLogin')"
      >
        使用示範帳號體驗
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
/* Prototype 精修版 Auth Backdrop 結構 (外層捲動、隱藏捲軸) */
:deep(.auth-layer) {
  display: grid;
  place-items: center;
  padding: 16px;
  background: #07295c55;
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
  overflow: auto;
  scrollbar-width: none;
}

:deep(.auth-layer)::-webkit-scrollbar {
  display: none;
}

/* Prototype 精修版 Auth Card (寬度 440px、內距 24px 30px、圓角 24px、卡片自身不雙重捲動) */
:deep(.dialog-card) {
  position: relative;
  width: min(440px, 100%) !important;
  height: auto;
  max-height: none;
  min-height: 0;
  overflow: visible;
  scrollbar-gutter: auto;
  border-radius: 24px;
  background: #ffffff;
  padding: 24px 30px;
  box-shadow: 0 25px 90px rgba(7, 41, 92, 0.2);
  box-sizing: border-box;
  outline: none;
  font-family: "CareU LINE Seed TW", "LINE Seed TW", "Microsoft JhengHei", sans-serif;
  line-height: 1.65;
  user-select: text;
}

.dialog-close {
  position: absolute;
  right: 16px;
  top: 16px;
  border: 0;
  background: #f7f8fa;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: rgba(7, 41, 92, 0.64);
  padding: 0;
  flex: 0 0 auto;
  transition: background 0.2s, transform 0.2s, color 0.2s;
}

.dialog-close:hover {
  background: #eff4fc;
  color: #07295c;
  transform: translateY(-2px);
}

.dialog-close:focus-visible {
  outline: 3px solid #197afc;
  outline-offset: 4px;
}

.dialog-close .icon {
  width: 20px;
  height: 20px;
  stroke-width: 1.7;
  vertical-align: middle;
}

/* Logo 40px 高、50px 寬、底部間距 8px */
.auth-logo {
  height: 40px;
  width: 50px;
  margin: 0 auto 8px;
}

.auth-logo svg,
.auth-logo :deep(svg) {
  height: 100%;
  width: 100%;
}

/* 標題 25px、底部間距 6px */
.dialog-title {
  text-align: center;
  font-size: 25px;
  letter-spacing: -0.04em;
  color: #07295c;
  margin: 0 0 6px;
  font-weight: 700;
  line-height: 1.35;
}

/* 簡介 13px、底部間距 12px */
.dialog-intro {
  text-align: center;
  font-size: 13px;
  margin: 0 0 12px;
  line-height: 1.8;
  color: #60718a;
}

/* Tabs 底部間距 12px、按鈕 padding 7px */
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f1f5fb;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 12px;
  gap: 4px;
}

.auth-tabs button {
  border: 0;
  background: none;
  border-radius: 9px;
  padding: 7px;
  min-height: 42px;
  color: #60718a;
  font-size: 14px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-tabs button[aria-pressed="true"] {
  color: #156bd9;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(7, 41, 92, 0.06);
  font-weight: 700;
}

/* 表單欄位 12px、底部間距 10px、輸入框高度 42px */
.form-field {
  display: block;
  font-size: 12px;
  margin-bottom: 10px;
  color: #304866;
  text-align: left;
}

.form-field input {
  display: block;
  width: 100%;
  min-height: 42px;
  border: 1px solid #d9e3f0;
  border-radius: 12px;
  padding: 9px 12px;
  background: #fafcff;
  color: #07295c;
  margin-top: 7px;
  font-size: 15px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-field input:focus-visible {
  outline: 3px solid #197afc;
  outline-offset: 4px;
}

.password-wrap {
  display: block;
  position: relative;
  margin-top: 7px;
}

.password-wrap input {
  margin-top: 0;
  padding-right: 48px !important;
}

.password-wrap .show-pass {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: none;
  width: 42px;
  height: 42px;
  min-height: 0;
  padding: 0;
  font-size: 12px;
  color: #3669a8;
  display: grid;
  place-items: center;
  cursor: pointer;
  border-radius: 10px;
}

.show-pass .icon {
  width: 20px;
  height: 20px;
  stroke-width: 1.7;
  vertical-align: middle;
}

/* 忘記密碼列 */
.form-meta {
  text-align: right;
  margin: 0;
}

.form-meta .text-button {
  font-size: 12px;
  background: none;
  border: 0;
  color: #1466cf;
  cursor: pointer;
  font-weight: 700;
  font-family: inherit;
  min-height: 30px;
  padding: 2px;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
}

/* 送出按鈕 */
.auth-submit {
  width: 100%;
  border-radius: 999px;
  min-height: 42px;
  padding: 8px 14px;
  margin-top: 5px;
  font-size: 15px;
  font-weight: 700;
  background: #126cde;
  color: #ffffff;
  box-shadow: 0 8px 22px rgba(25, 122, 252, 0.13);
  border: 0;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  box-sizing: border-box;
}

.auth-submit:hover {
  background: #0969e9;
  transform: translateY(-2px);
}

/* 錯誤提示 */
.form-error {
  font-size: 12px;
  color: #a43838;
  background: #fff2f2;
  border-radius: 10px;
  padding: 6px 9px;
  margin-bottom: 7px;
  text-align: left;
}

/* 切換模式列 */
.auth-switch {
  text-align: center;
  font-size: 13px;
  margin-top: 7px;
  color: #60718a;
}

.auth-switch .text-button {
  font-size: 13px;
  background: none;
  border: 0;
  color: #1466cf;
  cursor: pointer;
  font-weight: 700;
  font-family: inherit;
  padding: 2px 4px;
  min-height: auto;
  display: inline;
}

/* 示範提示與按鈕 */
.demo-auth-note {
  text-align: center;
  font-size: 10px;
  padding-top: 9px;
  border-top: 1px solid #e1e8f1;
  margin-top: 7px;
  color: #7a8ca3;
  line-height: 1.8;
}

.demo-auth-button {
  width: 100%;
  margin-top: 7px;
  min-height: 42px;
  padding: 8px 14px;
  border: 1px solid #e1e8f1;
  background: #ffffff;
  color: #07295c;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: background 0.2s, transform 0.2s;
}

.demo-auth-button:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

/* 響應式規則：小螢幕 (<= 720px) */
@media (max-width: 720px) {
  :deep(.auth-layer) {
    align-items: safe center;
    padding: 12px;
  }
  :deep(.dialog-card) {
    padding: 24px;
    height: auto;
    max-height: none;
    min-height: 0;
  }
  .dialog-close {
    top: 10px;
  }
}

/* 響應式規則：低高度螢幕 (<= 690px) */
@media (max-height: 690px) {
  :deep(.dialog-card) {
    padding: 18px 24px;
  }
  .auth-logo,
  .dialog-intro,
  .auth-switch {
    display: none;
  }
  .dialog-title {
    font-size: 22px;
    margin-bottom: 10px;
  }
  .demo-auth-note {
    line-height: 1.5;
  }
  .form-field {
    margin-bottom: 7px;
  }
}

/* 響應式規則：極窄螢幕 (<= 420px) */
@media (max-width: 420px) {
  :deep(.auth-layer) {
    padding: 0;
    align-items: stretch;
  }
  :deep(.dialog-card) {
    width: 100% !important;
    max-height: 100dvh;
    height: 100dvh;
    border-radius: 0;
    padding: calc(28px + env(safe-area-inset-top, 0px)) 24px calc(24px + env(safe-area-inset-bottom, 0px));
  }
  .dialog-close {
    top: calc(12px + env(safe-area-inset-top, 0px));
  }
  .auth-logo {
    margin-top: 16px;
  }
}
</style>
