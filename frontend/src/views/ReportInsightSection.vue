<script setup lang="ts">
import type { Category, ResultItem } from './reportData'

defineProps<{
  isMember: boolean
  insightRows: (ResultItem & { rank: number; isLocked: boolean; isTopThree: boolean })[]
  category: (id: string) => Category
}>()

const emit = defineEmits<{
  (e: 'openAuth'): void
}>()
</script>

<template>
  <section class="report-section wrap" id="insightSection" aria-labelledby="insightTitle">
    <div class="section-head reveal visible">
      <div>
        <span class="section-index">02 / EXPLORE</span>
        <h2 id="insightTitle">重點保健方向</h2>
        <p>從資料到日常，一起了解每個方向背後的原因。</p>
      </div>
    </div>

    <div id="insights">
      <!-- Guest Locked Pair -->
      <template v-if="!isMember">
        <div class="locked-pair">
          <div
            v-for="(_row, idx) in insightRows.slice(0, 2)"
            :key="'locked-insight-' + idx"
            class="locked-insight"
          >
            <div class="locked-card" :data-anchor="'insight-' + (idx + 1)">
              <span class="rank-big">0{{ idx + 1 }}</span>
              <div>
                <h3>會員專屬關注方向</h3>
                <p>登入後，查看項目與完整分析。</p>
              </div>
              <span class="lock-circle">
                <svg class="icon"><use href="#i-lock" /></svg>
              </span>
            </div>
          </div>
        </div>
        <div class="unlock-row">
          <button class="text-button" id="insightUnlock" type="button" @click="emit('openAuth')">
            <svg class="icon"><use href="#i-lock" /></svg>
            登入查看完整報告
            <svg class="icon"><use href="#i-arrow" /></svg>
          </button>
        </div>
      </template>

      <!-- Insight List -->
      <div class="insight-list">
        <template v-for="(row, idx) in insightRows" :key="row.categoryId">
          <details
            v-if="isMember || idx >= 2"
            class="insight-card reveal visible"
            :data-anchor="'insight-' + (idx + 1)"
            :id="'insight-' + (idx + 1)"
          >
            <summary>
              <span class="number">{{ String(idx + 1).padStart(2, '0') }}</span>
              <div>
                <h3 class="insight-heading">
                  {{ category(row.categoryId).name }}
                  <!-- Alert badge -->
                  <span
                    v-if="row.alert"
                    class="medical-alert alert-badge"
                    :class="row.alert.level"
                    role="img"
                    :aria-label="row.alert.label"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle v-if="row.alert.level === 'urgent'" cx="12" cy="12" r="10" />
                      <path v-else d="M12 2 23 21H1Z" />
                      <path class="alert-mark" d="M12 8v6m0 3v.2" />
                    </svg>
                  </span>
                </h3>
                <p class="insight-preview">{{ row.summary }}</p>
              </div>
              <span class="priority" :class="{ 'top-three': idx < 3 }">
                <span class="priority-label">優先度</span>
                <b>{{ row.score }}</b>
              </span>
              <span class="chevron">
                <svg class="icon"><use href="#i-down" /></svg>
              </span>
            </summary>

            <div class="insight-body">
              <!-- Expanded Alert -->
              <div
                v-if="row.alert"
                class="medical-alert expanded-alert"
                :class="row.alert.level"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle v-if="row.alert.level === 'urgent'" cx="12" cy="12" r="10" />
                  <path v-else d="M12 2 23 21H1Z" />
                  <path class="alert-mark" d="M12 8v6m0 3v.2" />
                </svg>
                <div>
                  <strong>{{ row.alert.label }}（示範）</strong>
                  <p>{{ row.alert.message }}</p>
                  <small>{{ row.alert.source }}。此提醒獨立於保健關注排序，不代表需要購買保健食品。</small>
                </div>
              </div>

              <p class="insight-summary">{{ row.summary }}</p>
              <div class="evidence-grid" v-if="row.evidence && row.evidence.length > 0">
                <div
                  v-for="(ev, evIdx) in row.evidence"
                  :key="evIdx"
                  class="evidence-tile"
                >
                  <small v-if="ev.label">{{ ev.label }}</small>
                  <strong>{{ ev.value }}</strong>
                </div>
              </div>
              <div v-else class="evidence-empty">
                <p class="neutral-missing" style="font-size: 13px; color: var(--muted); padding: 4px 0;">目前尚無具體評估證據項目。</p>
              </div>
              <p>{{ row.reason }}</p>
              <p class="analysis-caution">
                分析依據與分數為示範資料；檢驗異常或問卷回答不能直接推論需要特定保健食品。
              </p>
            </div>
          </details>
        </template>
      </div>
    </div>
  </section>
</template>
