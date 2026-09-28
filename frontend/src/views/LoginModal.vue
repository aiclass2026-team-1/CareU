<script setup lang="ts">
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
  <div v-if="isOpen" class="dialog-backdrop auth-layer" id="authLayer" @click.self="emit('close')">
    <section
      class="dialog-card"
      id="authDialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="authTitle"
      tabindex="-1"
    >
      <button
        class="icon-button dialog-close"
        type="button"
        aria-label="關閉會員視窗"
        @click="emit('close')"
      >
        <svg class="icon"><use href="#i-close" /></svg>
      </button>

      <div class="auth-logo" aria-hidden="true">
        <svg class="careu-logo" viewBox="0 0 300 378.011" role="img" aria-label="Care U Logo">
          <path
            d="M299.989,90.76c-7.253,0-10.187-.218-19.47.2-36.608,1.65-54.184,25.083-54.938,61.78-.565,27.517.078,55.1-1.162,82.57C222.757,272.145,188.034,303.75,150,303.75s-72.757-31.605-74.419-68.439c-1.24-27.475-.6-55.053-1.162-82.57-.754-36.7-18.33-60.13-54.938-61.78-9.283-.419-12.217-.2-19.47-.2C.011,177.278-.43,225.7,4.25,256.881,13.5,318.511,66.564,378.011,150,378.011s136.5-59.5,145.75-121.13C300.43,225.7,299.989,177.278,299.989,90.76Z"
            fill="#197afc"
          />
          <circle class="logo-dot" cx="150" cy="54.1" r="54.1" fill="#fb8f54" />
          <path
            d="M184.782,187.729H167V169.947a17,17,0,0,0-34,0v17.782h-17.78a17,17,0,1,0,0,34H133v17.783a17,17,0,0,0,34,0V221.729h17.779a17,17,0,1,0,0-34Z"
            fill="#197afc"
          />
        </svg>
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
              <svg class="icon" aria-hidden="true">
                <use :href="isPasswordVisible ? '#i-eye-off' : '#i-eye'" />
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
    </section>
  </div>
</template>
