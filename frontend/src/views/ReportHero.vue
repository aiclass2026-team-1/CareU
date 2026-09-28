<script setup lang="ts">
import networkBackImg from '@/assets/images/network-back.png'
import logoLockupSvg from '@/assets/brand/CareU_VIS-logogroup-01.svg'
import BrandMark from '@/components/common/BrandMark.vue'

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
        <div class="brand" aria-label="Care U 品牌商標">
          <img class="brand-lockup" alt="Care U" :src="logoLockupSvg" />
        </div>
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
            <BrandMark class="careu-logo" dot-class="logo-dot" />
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
