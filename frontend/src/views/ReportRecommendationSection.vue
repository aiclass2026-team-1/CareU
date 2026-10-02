<script setup lang="ts">
import type { Category, Product, Profile, ResultItem } from './reportData'

defineProps<{
  isMember: boolean
  currentProfile: Profile
  recommendationDirections: ResultItem[]
  deferredDirections: ResultItem[]
  selectedProducts: Record<string, string>
  category: (id: string) => Category
  product: (id: string) => Product | undefined
  candidatesFor: (id: string) => string[]
  getActiveProductForDirection: (cid: string) => Product | undefined
  getProductReason: (cid: string, pid: string | number) => string
  formatMoney: (v: number) => string
  doseTone: (id: string) => string
  isTablet: (id: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'openAuth'): void
  (e: 'setBrowsingProduct', cid: string, pid: string): void
  (e: 'selectProduct', cid: string, pid: string): void
}>()
</script>

<template>
  <div class="recommend-container">
    <div class="section-head reveal visible">
      <div>
        <span class="section-index">03 / DISCOVER</span>
        <h2 id="recommendTitle">為你準備的專屬保健組合</h2>
        <p>先了解推薦依據，再自由選擇想進一步了解的商品。</p>
      </div>
    </div>

      <div id="recommendations">
        <!-- Guest Member Preview -->
        <div v-if="!isMember" class="member-preview reveal visible" data-anchor="recommend-preview">
          <div class="preview-ghosts" aria-hidden="true">
            <div class="ghost"><div class="dose-shapes"><i class="dose"></i></div></div>
            <div class="ghost"><div class="dose-shapes"><i class="dose"></i></div></div>
            <div class="ghost"><div class="dose-shapes"><i class="dose"></i></div></div>
          </div>
          <div class="preview-content">
            <span class="icon-button"><svg class="icon"><use href="#i-lock" /></svg></span>
            <h3>讓保健選擇，更有方向</h3>
            <p>登入查看推薦理由與候選品項，<br />依自己的步調，調整專屬保健組合。</p>
            <button class="button primary" id="productUnlock" type="button" @click="emit('openAuth')">
              登入查看專屬保健組合
              <svg class="icon"><use href="#i-arrow" /></svg>
            </button>
          </div>
        </div>

        <!-- Logged In Recommendation List -->
        <div v-else class="recommend-list">
          <template v-for="r in recommendationDirections" :key="'rec-' + r.categoryId">
            <article
              class="recommend-card has-products"
              :id="'recommend-' + r.categoryId"
              :data-anchor="'recommend-' + r.categoryId"
            >
              <div class="recommend-header">
                <div>
                  <span class="label">DIRECTION {{ String(currentProfile.results.indexOf(r) + 1).padStart(2, '0') }}</span>
                  <h3>{{ category(r.categoryId).name }}</h3>
                </div>
              </div>
              <p class="recommend-intro">{{ r.summary }}</p>

              <!-- Analysis evidence disclosure -->
              <details class="reason-disclosure">
                <summary>
                  查看分析依據
                  <svg class="icon"><use href="#i-down" /></svg>
                </summary>
                <div class="reason">
                  <ul>
                    <li v-for="(ev, evI) in r.evidence" :key="evI">{{ ev.value }}</li>
                  </ul>
                  <p>{{ r.reason }}</p>
                </div>
              </details>

              <!-- Candidates Chips -->
              <div class="recommend-browse" aria-label="切換查看候選品項">
                <button
                  v-for="otherId in candidatesFor(r.categoryId)"
                  :key="otherId"
                  class="browse-product"
                  type="button"
                  :aria-pressed="getActiveProductForDirection(r.categoryId)?.id === otherId ? 'true' : 'false'"
                  @click="emit('setBrowsingProduct', r.categoryId, otherId)"
                >
                  <span class="choice-status">
                    <template v-if="selectedProducts[r.categoryId] === otherId">
                      <svg class="icon"><use href="#i-check" /></svg>目前組合品項
                    </template>
                    <template v-else>候選品項</template>
                  </span>
                  <span class="choice-name" :title="product(otherId)?.name">
                    {{ product(otherId)?.name }}
                  </span>
                </button>
              </div>

              <!-- Active Featured Product -->
              <div v-if="getActiveProductForDirection(r.categoryId)" class="product-focus">
                <div class="featured-product">
                  <!-- Dose Artwork -->
                  <div
                    class="product-art"
                    :class="isTablet(getActiveProductForDirection(r.categoryId)!.id) ? 'tablet-art' : 'capsule-art'"
                    :style="{ '--dose-color': doseTone(getActiveProductForDirection(r.categoryId)!.id) }"
                    role="img"
                    aria-label="膠囊與錠劑示意，非實際商品外觀"
                  >
                    <div class="dose-shapes" aria-hidden="true"><i class="dose"></i></div>
                    <span class="art-caption">劑型示意</span>
                  </div>

                  <!-- Product info -->
                  <div class="product-info">
                    <h4>{{ getActiveProductForDirection(r.categoryId)!.name }}</h4>
                    <p
                      v-if="getProductReason(r.categoryId, getActiveProductForDirection(r.categoryId)!.id)"
                      class="recommend-reason-subtitle"
                    >
                      {{ getProductReason(r.categoryId, getActiveProductForDirection(r.categoryId)!.id) }}
                    </p>
                    <span class="product-price">
                      {{ formatMoney(getActiveProductForDirection(r.categoryId)!.price) }}
                      <small>／30 粒</small>
                    </span>
                    <p class="unit-price">
                      {{ formatMoney(getActiveProductForDirection(r.categoryId)!.unitPrice) }}／粒
                    </p>
                  </div>

                  <!-- Action button -->
                  <div class="recommend-actions">
                    <button
                      v-if="selectedProducts[r.categoryId] !== getActiveProductForDirection(r.categoryId)!.id"
                      class="button primary small"
                      type="button"
                      @click="emit('selectProduct', r.categoryId, getActiveProductForDirection(r.categoryId)!.id)"
                    >
                      {{ selectedProducts[r.categoryId] ? '換入組合' : '加入組合' }}
                      <svg class="icon"><use href="#i-arrow" /></svg>
                    </button>
                    <span v-else class="button small selected-caption">
                      <svg class="icon"><use href="#i-check" /></svg>已加入組合
                    </span>
                  </div>
                </div>

                <!-- Product details disclosure -->
                <details class="product-details">
                  <summary>
                    <svg class="icon"><use href="#i-info" /></svg>
                    功效宣稱、證據與品項注意事項
                    <svg class="icon"><use href="#i-down" /></svg>
                  </summary>
                  <div class="product-detail-content">
                    <div class="source-grid">
                      <div>
                        <h4>來源記載的主要成分</h4>
                        <p>{{ getActiveProductForDirection(r.categoryId)!.ingredients }}</p>
                      </div>
                      <div>
                        <h4>證據類型｜{{ getActiveProductForDirection(r.categoryId)!.claims[r.categoryId]?.type || '來源未標示' }}</h4>
                        <p>{{ getActiveProductForDirection(r.categoryId)!.claims[r.categoryId]?.text || '此方向尚無可引用的商品宣稱。' }}</p>
                      </div>
                      <div class="full">
                        <h4>警語</h4>
                        <p>{{ getActiveProductForDirection(r.categoryId)!.warnings || '來源欄位未提供警語；不代表沒有禁忌或交互作用風險。' }}</p>
                      </div>
                      <div class="full">
                        <h4>注意事項</h4>
                        <p>{{ getActiveProductForDirection(r.categoryId)!.precautions || '來源尚未提供，需進一步確認。' }}</p>
                      </div>
                    </div>
                    <div class="source-meta">
                      <span>核准字號：{{ getActiveProductForDirection(r.categoryId)!.license || '未標示' }}</span>
                      <span>核准日期：{{ getActiveProductForDirection(r.categoryId)!.approvalDate || '未標示' }}</span>
                      <span>申請商：{{ getActiveProductForDirection(r.categoryId)!.applicant || '未標示' }}</span>
                    </div>
                    <p style="font-size: 11px; margin-top: 13px">
                      以上為資料集記載，研究條件不等同於你的個人情況。來源的 evidence_score 未用於本頁關注排序或個人化配對。
                    </p>
                  </div>
                </details>
              </div>
            </article>
          </template>
        </div>

        <!-- Deferred directions note -->
        <section v-if="isMember && deferredDirections.length > 0" class="deferred-note" aria-labelledby="deferredTitle">
          <div class="deferred-heading">
            <svg class="icon"><use href="#i-info" /></svg>
            <h3 id="deferredTitle">{{ currentProfile.exclusionSummary?.title || '本次未列入保健組合的方向' }}</h3>
          </div>
          <p>{{ currentProfile.exclusionSummary?.text || '部分方向仍需補充資料或確認適用性，因此先保留分析，不自動加入商品。未列入不代表不需要關注。' }}</p>
          <span v-if="currentProfile.exclusionSummary?.demo" class="scenario-tag">情境示範</span>
          <details class="deferred-details">
            <summary>
              查看 {{ deferredDirections.length }} 個方向與原因
              <svg class="icon"><use href="#i-down" /></svg>
            </summary>
            <div>
              <div v-for="dr in deferredDirections" :key="'def-' + dr.categoryId" class="deferred-row">
                <strong>{{ category(dr.categoryId).name }}</strong>
                <p>{{ currentProfile.withheld[dr.categoryId] || (currentProfile.id === 'g' ? '孕期適用性尚未確認，暫不提供候選品項。' : '目前資料不足，暫不推薦商品。') }}</p>
              </div>
            </div>
          </details>
        </section>
      </div>

      <div class="notice safety-public">
        <svg class="icon" aria-hidden="true"><use href="#i-info" /></svg>
        <p>
          <strong>選購前，先留意適用性。</strong>本頁推薦配對、價格與組合均為示範，尚未完成個人適用性及併用風險檢查。有過敏、懷孕或哺乳、服藥或既有疾病者，請先向醫療專業人員確認。商品警語與注意事項不代表完整的交互作用資料。
        </p>
      </div>
    </div>
</template>
