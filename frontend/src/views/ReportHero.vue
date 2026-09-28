<script setup lang="ts">
import networkBackImg from '@/assets/report/network-back.png'
import logoLockupSvg from '@/assets/report/CareU_VIS-logogroup-01.svg'

defineProps<{
  isMember: boolean
  summary: string
}>()

const emit = defineEmits<{
  (e: 'openCart'): void
  (e: 'openAuth'): void
  (e: 'openMemberModal'): void
  (e: 'logout'): void
}>()
</script>

<template>
  <header class="hero" id="reportTop">
    <img class="hero-bg" :src="networkBackImg" alt="" aria-hidden="true" />
    <div class="wrap">
      <div class="topbar">
        <a class="brand" href="#reportTop" aria-label="Care U 報告頂端">
          <img class="brand-lockup" alt="Care U" :src="logoLockupSvg" />
        </a>
        <div class="nav-actions">
          <button
            class="icon-button"
            id="cartButton"
            aria-label="查看購物車"
            type="button"
            @click="emit('openCart')"
          >
            <svg class="icon" aria-hidden="true"><use href="#i-cart" /></svg>
          </button>
          <button
            class="button outline small"
            id="accountButton"
            type="button"
            @click="isMember ? emit('openMemberModal') : emit('openAuth')"
          >
            <template v-if="isMember">
              <span class="member-dot"></span>
              <span>示範會員</span>
            </template>
            <template v-else>
              <svg class="icon" aria-hidden="true"><use href="#i-user" /></svg>
              <span>會員登入</span>
            </template>
          </button>
        </div>
      </div>

      <div class="hero-body">
        <div class="hero-copy">
          <span class="label">YOUR PERSONAL HEALTH REPORT</span>
          <h1 id="reportTitle" tabindex="-1">你的<span>健康分析</span>報告</h1>
          <p id="reportSummary">{{ summary }}</p>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="glow"></div>
          <div class="glow two"></div>
          <div class="hero-logo">
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
          <span class="glow three"></span>
        </div>
      </div>

      <div class="notice">
        <svg class="icon" aria-hidden="true"><use href="#i-info" /></svg>
        <p>CareU 健康分析與商品建議不取代醫療診斷；如有異常數值，請諮詢專業醫療人員。</p>
      </div>
    </div>
  </header>
</template>
