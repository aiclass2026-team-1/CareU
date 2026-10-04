<script setup lang="ts">
import type { Category, Product } from './reportData'

defineProps<{
  isMember: boolean
  productDirections: string[]
  selectedProducts: Record<string, string>
  expandedCandidateDirections: Set<string>
  uniqueSelected: Product[]
  bundleTotal: number
  category: (id: string) => Category
  product: (id: string) => Product | undefined
  candidatesFor: (id: string) => string[]
  getProductReason: (cid: string, pid: string | number) => string
  supplementationReason: (cid: string, p: Product) => string
  formatMoney: (v: number) => string
  doseTone: (id: string) => string
  isTablet: (id: string) => boolean
}>()

const emit = defineEmits<{
  (e: 'toggleCandidates', cid: string): void
  (e: 'removeProduct', cid: string): void
  (e: 'selectProduct', cid: string, pid: string): void
  (e: 'openCart'): void
}>()
</script>

<template>
  <div id="bundleAnchor">
    <div v-if="isMember" id="bundleSection">
      <section class="bundle-section" aria-labelledby="bundleTitle">
        <div class="section-head">
          <div>
            <span class="section-index">04 / YOUR CHOICE</span>
            <h2 id="bundleTitle" tabindex="-1">你的專屬保健組合</h2>
            <p>留下想了解的商品，也可以換一個選擇。</p>
          </div>
        </div>

        <div class="bundle-layout">
          <div class="bundle-list" :data-count="productDirections.length">
            <div v-if="productDirections.length === 0" class="bundle-unavailable">
              本次暫不提供保健組合。<br />可先查看上方的原因說明。
            </div>

            <template v-for="cid in productDirections" :key="'bundle-dir-' + cid">
              <article class="bundle-card" :id="'bundle-' + cid" :data-anchor="'bundle-' + cid">

                <!-- Selected product card -->
                <template v-if="selectedProducts[cid] && product(selectedProducts[cid])">
                  <div class="bundle-product">
                    <div
                      class="product-art"
                      :class="isTablet(selectedProducts[cid]) ? 'tablet-art' : 'capsule-art'"
                      :style="{ '--dose-color': doseTone(selectedProducts[cid]) }"
                      role="img"
                      aria-label="膠囊與錠劑示意，非實際商品外觀"
                    >
                      <div class="dose-shapes" aria-hidden="true"><i class="dose"></i></div>
                    </div>

                    <div class="product-info">
                      <div class="product-main-copy">
                        <h4>{{ product(selectedProducts[cid])!.name }}</h4>
                        <div class="product-price-row">
                          <span class="product-price">
                            {{ formatMoney(product(selectedProducts[cid])!.price) }}
                            <small class="package-qty">／30 粒</small>
                          </span>
                          <p class="unit-price">
                            {{ formatMoney(product(selectedProducts[cid])!.unitPrice) }}／粒
                          </p>
                        </div>
                      </div>
                      <div class="bundle-actions">
                        <button
                          class="text-button"
                          :id="'change-' + cid"
                          type="button"
                          data-action="toggle-candidates"
                          :aria-expanded="expandedCandidateDirections.has(cid) ? 'true' : 'false'"
                          :aria-controls="'candidates-' + cid"
                          @click="emit('toggleCandidates', cid)"
                        >
                          <span class="desktop-text">{{ expandedCandidateDirections.has(cid) ? '收合選擇' : '更換品項' }}</span>
                          <span class="mobile-text">{{ expandedCandidateDirections.has(cid) ? '收合' : '更換' }}</span>
                          <svg class="icon"><use href="#i-down" /></svg>
                        </button>
                        <button
                          class="text-button remove-button"
                          type="button"
                          :aria-label="'從組合移除' + product(selectedProducts[cid])!.name"
                          @click="emit('removeProduct', cid)"
                        >
                          <svg class="icon"><use href="#i-close" /></svg>
                        </button>
                      </div>
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
                          <p>{{ product(selectedProducts[cid])!.ingredients }}</p>
                        </div>
                        <div>
                          <h4>證據類型｜{{ product(selectedProducts[cid])!.claims[cid]?.type || '來源未標示' }}</h4>
                          <p>{{ product(selectedProducts[cid])!.claims[cid]?.text || '此方向尚無可引用的商品宣稱。' }}</p>
                        </div>
                        <div class="full">
                          <h4>警語</h4>
                          <p>{{ product(selectedProducts[cid])!.warnings || '來源欄位未提供警語；不代表沒有禁忌或交互作用風險。' }}</p>
                        </div>
                        <div class="full">
                          <h4>注意事項</h4>
                          <p>{{ product(selectedProducts[cid])!.precautions || '來源尚未提供，需進一步確認。' }}</p>
                        </div>
                      </div>
                      <div class="source-meta">
                        <span>核准字號：{{ product(selectedProducts[cid])!.license || '未標示' }}</span>
                        <span>核准日期：{{ product(selectedProducts[cid])!.approvalDate || '未標示' }}</span>
                        <span>申請商：{{ product(selectedProducts[cid])!.applicant || '未標示' }}</span>
                      </div>
                    </div>
                  </details>
                </template>

                <!-- Empty bundle state -->
                <div v-else class="bundle-empty-row">
                  <div>
                    <h4>尚未選擇品項</h4>
                    <p>推薦理由已保留，可隨時重新加入。</p>
                  </div>
                  <button
                    class="button outline small"
                    :id="'change-' + cid"
                    type="button"
                    :aria-expanded="expandedCandidateDirections.has(cid) ? 'true' : 'false'"
                    :aria-controls="'candidates-' + cid"
                    @click="emit('toggleCandidates', cid)"
                  >
                    選擇品項
                  </button>
                </div>

                <!-- In-page Candidate selection list -->
                <div
                  v-if="expandedCandidateDirections.has(cid)"
                  class="candidates"
                  :id="'candidates-' + cid"
                >
                  <div
                    v-for="candId in candidatesFor(cid)"
                    :key="'cand-' + candId"
                    class="candidate-wrap"
                    :aria-label="product(candId)?.name"
                  >
                    <div class="candidate bundle-product">
                      <div
                        class="product-art"
                        :class="isTablet(candId) ? 'tablet-art' : 'capsule-art'"
                        :style="{ '--dose-color': doseTone(candId) }"
                        role="img"
                        aria-label="膠囊與錠劑示意，非實際商品外觀"
                      >
                        <div class="dose-shapes" aria-hidden="true"><i class="dose"></i></div>
                      </div>
                      <div class="candidate-copy product-info">
                        <div class="product-main-copy">
                          <h4 class="candidate-name">{{ product(candId)?.name }}</h4>
                          <div class="product-price-row">
                            <span class="product-price">
                              {{ formatMoney(product(candId)!.price) }}
                              <small class="package-qty">／30 粒</small>
                            </span>
                            <p class="unit-price">
                              {{ formatMoney(product(candId)!.unitPrice) }}／粒
                            </p>
                          </div>
                        </div>
                        <div class="candidate-add bundle-actions">
                          <button
                            class="button outline small candidate-action-btn"
                            type="button"
                            :disabled="selectedProducts[cid] === candId"
                            @click="emit('selectProduct', cid, candId)"
                          >
                            {{ selectedProducts[cid] === candId ? '已加入' : (selectedProducts[cid] ? '換入' : '加入') }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Candidate Product details disclosure -->
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
                            <p>{{ product(candId)!.ingredients }}</p>
                          </div>
                          <div>
                            <h4>證據類型｜{{ product(candId)!.claims[cid]?.type || '來源未標示' }}</h4>
                            <p>{{ product(candId)!.claims[cid]?.text || '此方向尚無可引用的商品宣稱。' }}</p>
                          </div>
                          <div class="full">
                            <h4>警語</h4>
                            <p>{{ product(candId)!.warnings || '來源欄位未提供警語；不代表沒有禁忌或交互作用風險。' }}</p>
                          </div>
                          <div class="full">
                            <h4>注意事項</h4>
                            <p>{{ product(candId)!.precautions || '來源尚未提供，需進一步確認。' }}</p>
                          </div>
                        </div>
                        <div class="source-meta">
                          <span>核准字號：{{ product(candId)!.license || '未標示' }}</span>
                          <span>核准日期：{{ product(candId)!.approvalDate || '未標示' }}</span>
                          <span>申請商：{{ product(candId)!.applicant || '未標示' }}</span>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </article>
            </template>
          </div>

          <!-- Summary Card (Sticky) -->
          <aside class="summary-card" data-anchor="summary">
            <h3>月組合摘要</h3>
            <p id="selectionCount">已選 {{ uniqueSelected.length }} 項，共 {{ uniqueSelected.length * 30 }} 粒</p>
            <div class="summary-items">
              <template v-if="uniqueSelected.length > 0">
                <div
                  v-for="p in uniqueSelected"
                  :key="'sum-item-' + p.id"
                  class="summary-item"
                >
                  <p>
                    {{ p.name }}<br />
                    <small>{{ formatMoney(p.unitPrice) }}／粒 × 30 粒</small>
                  </p>
                  <span>{{ formatMoney(p.price) }}</span>
                </div>
              </template>
              <div v-else class="empty-bundle">目前沒有已選品項。</div>
            </div>

            <div class="summary-total">
              <span>合計金額</span>
              <strong id="bundleTotal">{{ formatMoney(bundleTotal) }}</strong>
            </div>

            <button
              class="button primary"
              id="addToCart"
              type="button"
              :disabled="uniqueSelected.length === 0"
              @click="emit('openCart')"
            >
              將組合加入購物車
              <svg class="icon"><use href="#i-arrow" /></svg>
            </button>
          </aside>
        </div>
      </section>
    </div>
  </div>
</template>
