<script setup lang="ts">
import type { Category, ResultItem } from './reportData'
import { blueprint } from './reportData'

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

              <div class="evidence-grid">
                <!-- Left Info Box: evidence_items -->
                <div class="evidence-tile">
                  <small>評估證據</small>
                  <strong v-if="(row as any).evidenceItems && (row as any).evidenceItems.length > 0">
                    <div v-for="(ev, evI) in (row as any).evidenceItems" :key="evI" style="margin-bottom: 2px;">{{ ev }}</div>
                  </strong>
                  <strong v-else class="neutral-missing">目前尚無具體評估證據項目。</strong>
                </div>
                <!-- Right Info Box: 12-efficacy warm-intro dictionary -->
                <div class="evidence-tile">
                  <small>溫馨引言</small>
                  <strong>{{ blueprint[row.categoryId]?.[0] || row.summary }}</strong>
                </div>
              </div>
              <p>{{ row.reason }}</p>
            </div>
          </details>
        </template>
      </div>
    </div>
  </section>
</template>
