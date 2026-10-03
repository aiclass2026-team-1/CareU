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
    class="safety-modal-shell"
    :is-open="isOpen"
    dialog-id="reportSafetyDialog"
    backdrop-class="dialog-backdrop safety-modal-backdrop"
    card-class="dialog-card safety-modal-card"
    aria-labelledby="safetyTitle"
    aria-describedby="safetyDesc"
    :close-on-esc="false"
    :close-on-overlay="false"
    :show-close-button="false"
    :custom-layout="true"
  >
    <div class="safety-modal-content" id="safetyDesc">
      <div class="safety-icon-wrap" aria-hidden="true">
        <div class="safety-exclamation">
          <span class="safety-bar"></span>
          <span class="safety-dot"></span>
        </div>
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
.safety-modal-shell {
  --cu-modal-width: 500px;
  --cu-modal-max-width: calc(100vw - 48px);
  --cu-modal-min-width: 0;
  --cu-modal-padding: 40px 48px 36px;
  --cu-modal-radius: var(--cu-radius-modal, 32px);
  --cu-modal-overflow: visible;
  --cu-modal-scrollbar-gutter: auto;
}

.safety-modal-card {
  color: var(--cu-color-navy, #07295c);
  text-align: left;
}

.safety-modal-content {
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-align: left;
}

.safety-icon-wrap {
  width: 44px;
  height: 44px;
  border: 2.5px solid var(--cu-color-orange, #fb8f54);
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-sizing: border-box;
}

.safety-exclamation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.safety-bar {
  width: 3px;
  height: 15px;
  border-radius: 999px;
  background: var(--cu-color-orange, #fb8f54);
  display: block;
}

.safety-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--cu-color-orange, #fb8f54);
  display: block;
}

.dialog-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--cu-color-navy, #07295c);
  text-align: center;
  margin: 0 0 20px;
  padding: 0;
  line-height: 1.4;
  letter-spacing: normal;
}

.safety-primary-text {
  font-size: 15px;
  color: var(--cu-color-ink, #304866);
  line-height: 1.65;
  margin: 0 0 20px;
  padding: 0;
}

.safety-highlight-callout {
  background: rgba(235, 147, 142, 0.15);
  background: color-mix(in srgb, var(--cu-color-coral, #eb938e) 15%, transparent);
  border: 0;
  padding: 16px 20px;
  border-radius: 10px;
  margin: 0 0 20px;
  box-sizing: border-box;
  font-size: 15px;
  font-weight: 700;
  color: var(--cu-color-navy, #07295c);
  line-height: 1.6;
}

.safety-supporting-texts {
  font-size: 14px;
  color: var(--cu-color-text-muted, #60718a);
  line-height: 1.65;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 28px;
  padding: 0;
}

.safety-supporting-texts p {
  margin: 0;
  padding: 0;
}

.safety-ack-btn {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--cu-radius-pill, 9999px);
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
}

@media (max-width: 600px) {
  .safety-modal-shell {
    --cu-modal-width: calc(100vw - 32px);
    --cu-modal-max-width: 100%;
    --cu-modal-padding: 28px 20px 24px;
  }

  .safety-icon-wrap {
    width: 40px;
    height: 40px;
    border-width: 2.5px;
    margin-bottom: 16px;
  }

  .safety-bar {
    width: 2.8px;
    height: 14px;
  }

  .safety-dot {
    width: 3.5px;
    height: 3.5px;
  }

  .safety-exclamation {
    gap: 2.5px;
  }

  .dialog-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .safety-highlight-callout {
    padding: 12px 14px;
    font-size: 14px;
  }
}
</style>
