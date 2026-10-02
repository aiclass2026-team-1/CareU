<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import AppModal from '@/components/common/AppModal.vue'

/**
 * Care U｜Report Entry Safety Notice Modal (Phase Report Refinement)
 *
 * 【Design & Behavior Specification】
 * 1. Appears before viewing formal Report.
 * 2. Requires explicit click on "我已了解，查看報告".
 * 3. Does NOT allow dismissal by backdrop click or Escape key.
 * 4. No close X button per accessibility / spec guidelines.
 * 5. Uses sessionStorage for current assessment session acknowledgement.
 */
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'acknowledge'): void
}>()

const ackButtonRef = ref<HTMLButtonElement | null>(null)

onMounted(() => {
  if (props.isOpen) {
    nextTick(() => {
      ackButtonRef.value?.focus()
    })
  }
})
</script>

<template>
  <AppModal
    :is-open="isOpen"
    dialog-id="reportSafetyDialog"
    backdrop-class="dialog-backdrop safety-modal-backdrop"
    card-class="dialog-card safety-modal-card"
    aria-labelledby="safetyTitle"
    aria-describedby="safetyDesc"
    :close-on-esc="false"
    :close-on-overlay="false"
    :show-close-button="false"
  >
    <div class="safety-modal-content" id="safetyDesc">
      <div class="safety-icon-wrap" aria-hidden="true">
        <svg class="icon safety-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 class="dialog-title" id="safetyTitle">查看報告前，請先留意</h2>

      <p class="safety-primary-text">
        若你目前有慢性疾病、正在服用處方藥或長期用藥，開始補充任何保健食品前，請先向醫師、藥師或其他醫療專業人員確認是否適合。
      </p>

      <div class="safety-highlight-callout">
        <strong>請勿因本報告自行停藥、減藥或調整原有治療方式。</strong>
      </div>

      <div class="safety-supporting-texts">
        <p>Care U 會依你提供的健康資料整理保健方向與產品資訊，但不取代專業醫療診斷與治療建議。</p>
        <p>若你正在接受治療、懷孕或哺乳、有已知過敏，或有其他特殊健康狀況，也建議先諮詢專業人員。</p>
      </div>

      <button
        ref="ackButtonRef"
        class="button primary safety-ack-btn"
        id="safetyAckBtn"
        type="button"
        @click="emit('acknowledge')"
      >
        我已了解，查看報告
      </button>
    </div>
  </AppModal>
</template>

<style scoped>
.safety-modal-card {
  width: min(520px, calc(100% - 40px));
  padding: 36px 32px 32px;
  border-radius: var(--cu-radius-modal, 32px);
  background: #ffffff;
  color: var(--cu-navy, #07295c);
  text-align: left;
}

.safety-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(251, 143, 84, 0.15);
  color: var(--cu-orange, #fb8f54);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.safety-icon {
  width: 24px;
  height: 24px;
}

.dialog-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--cu-navy, #07295c);
  margin-bottom: 16px;
  line-height: 1.4;
}

.safety-primary-text {
  font-size: 15px;
  color: var(--cu-ink, #304866);
  line-height: 1.65;
  margin-bottom: 20px;
}

.safety-highlight-callout {
  background: rgba(251, 143, 84, 0.12);
  border-left: 4px solid var(--cu-orange, #fb8f54);
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 700;
  color: var(--cu-navy, #07295c);
  line-height: 1.6;
}

.safety-supporting-texts {
  font-size: 14px;
  color: var(--cu-muted, #60718A);
  line-height: 1.65;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.safety-ack-btn {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  justify-content: center;
}
</style>
