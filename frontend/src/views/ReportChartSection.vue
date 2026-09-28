<script setup lang="ts">
import type { Category, ResultItem } from './reportData'

defineProps<{
  chartRows: (ResultItem & { rank: number; isLocked: boolean; isTopThree: boolean })[]
  selectedCategoryForChart: string | null
  selectedChartItem: ResultItem | null
  category: (id: string) => Category
}>()

const emit = defineEmits<{
  (e: 'openAuth'): void
  (e: 'toggleCategory', id: string): void
}>()

function handleRowClick(event: MouseEvent, categoryId: string) {
  emit('toggleCategory', categoryId)

  // Replay animation on the clicked row's bar, faithful to Prototype behavior
  const target = event.currentTarget as HTMLElement | null
  const bar = target?.querySelector('.bar') as HTMLElement | null
  if (bar && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bar.classList.remove('replay')
    void bar.offsetWidth
    bar.classList.add('replay')
  }
}
</script>

<template>
  <section class="report-section wrap" id="chartSection" aria-labelledby="chartTitle">
    <div class="section-head reveal visible">
      <div>
        <span class="section-index">01 / UNDERSTAND</span>
        <h2 id="chartTitle">先看看，你的身體優先關注方向</h2>
        <p>依目前提供的資料，整理值得優先了解的保健方向。</p>
      </div>
    </div>
    <div class="card chart-layout reveal visible">
      <div class="chart-main">
        <div class="chart-list" id="chartList">
          <template v-for="row in chartRows" :key="row.categoryId">
            <!-- Locked row -->
            <button
              v-if="row.isLocked"
              class="chart-row locked"
              type="button"
              :data-anchor="'rank-' + row.rank"
              :aria-label="'第 ' + row.rank + ' 名，登入查看'"
              @click="emit('openAuth')"
            >
              <span class="rank">{{ String(row.rank).padStart(2, '0') }}</span>
              <span class="lock-label">
                <svg class="icon"><use href="#i-lock" /></svg>
                登入會員查看
              </span>
              <span class="locked-track" aria-hidden="true"></span>
              <span class="score" aria-hidden="true">—</span>
            </button>

            <!-- Unlocked row -->
            <button
              v-else
              class="chart-row"
              type="button"
              :class="{ 'top-three': row.isTopThree }"
              :data-anchor="'rank-' + row.rank"
              :aria-expanded="selectedCategoryForChart === row.categoryId ? 'true' : 'false'"
              aria-controls="chartDetail"
              @click="handleRowClick($event, row.categoryId)"
            >
              <span class="rank">{{ String(row.rank).padStart(2, '0') }}</span>
              <span>{{ category(row.categoryId).name }}</span>
              <span class="track" aria-hidden="true">
                <span
                  class="bar"
                  :style="{ '--value': row.score + '%', width: row.score + '%', display: 'block' }"
                ></span>
              </span>
              <span class="score">{{ row.score }}</span>
            </button>
          </template>
        </div>

        <!-- Chart detail card -->
        <div v-if="selectedChartItem" id="chartDetail" class="chart-detail">
          <strong>{{ category(selectedChartItem.categoryId).name }} · 優先度 {{ selectedChartItem.score }}</strong>
          <p>{{ selectedChartItem.summary }}</p>
          <p style="font-size: 12px">此數值為示範排序，不代表疾病風險或補充必要性。</p>
        </div>
      </div>

      <div class="chart-note" id="chartNote">
        <h3>分數，代表關注順序</h3>
        <p>數值越高，代表依目前資料排在較優先關注的位置。不是健康狀態分數，也不代表疾病風險、實際健康程度或醫療上的補充必要性。</p>
      </div>
    </div>
  </section>
</template>
