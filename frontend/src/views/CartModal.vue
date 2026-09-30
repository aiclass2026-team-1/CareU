<script setup lang="ts">
import type { Product } from './reportData'
import AppModal from '@/components/common/AppModal.vue'

defineProps<{
  isOpen: boolean
  confirmMode: boolean
  items: Product[]
  total: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

function formatMoney(v: any): string {
  if (v === null || v === undefined || typeof v !== 'number' || isNaN(v) || v <= 0) {
    return '價格未標示'
  }
  const fixed = Number(v.toFixed(4))
  return 'NT$ ' + new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 4 }).format(fixed)
}
</script>

<template>
  <AppModal
    :is-open="isOpen"
    dialog-id="auxDialog"
    backdrop-class="dialog-backdrop"
    card-class="dialog-card cart-dialog"
    aria-labelledby="auxTitle"
    :close-on-esc="true"
    :close-on-overlay="true"
    @close="emit('close')"
  >
    <button
      class="icon-button dialog-close"
      id="auxClose"
      type="button"
      aria-label="關閉視窗"
      @click="emit('close')"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    </button>

    <div id="auxContent">
      <div v-if="!confirmMode" class="cart-success">
        <svg class="icon"><use href="#i-cart" /></svg>
      </div>

      <h2 class="dialog-title" id="auxTitle">
        {{ confirmMode ? '確認購買' : '選購結果（示範）' }}
      </h2>
      <p style="font-size: 13px">
        {{ confirmMode ? '請核對商品、數量與合計金額。本次為購買示範，不會扣款或建立正式訂單。' : '此處僅展示選購結果，不會建立訂單。' }}
      </p>

      <div class="cart-items">
        <template v-if="items.length > 0">
          <div v-for="p in items" :key="'cart-item-' + p.id" class="cart-item">
            <span>
              {{ p.name }}<br />
              <small>{{ formatMoney(p.unitPrice) }}／粒 × 30 粒</small>
            </span>
            <strong>{{ formatMoney(p.price) }}</strong>
          </div>
        </template>
        <p v-else>購物車目前沒有商品。</p>
      </div>

      <div class="summary-total" style="color: var(--muted)">
        <span>模擬合計</span>
        <strong style="color: var(--navy)">{{ formatMoney(total) }}</strong>
      </div>

      <div class="notice">
        <p>
          CareU 健康分析與商品建議不取代醫療診斷；如有異常數值，請諮詢專業醫療人員。<br /><br />
          此組合尚未完成成分重複、交互作用及個人適用性檢查，不代表已確認適合一起服用。
        </p>
      </div>

      <button
        v-if="confirmMode"
        class="button primary"
        id="confirmCart"
        type="button"
        style="width: 100%; margin-top: 20px"
        @click="emit('confirm')"
      >
        確認購買
      </button>
      <button
        v-else
        class="button outline"
        type="button"
        style="width: 100%; margin-top: 20px"
        @click="emit('close')"
      >
        繼續查看報告
      </button>
    </div>
  </AppModal>
</template>
