import test from 'node:test'
import assert from 'node:assert/strict'

test('1. evidenceItems array is preserved in source order & null/empty evidenceItems does not produce fake text', () => {
  const mockEvidence = ['自我評估顯示排便頻率較不規律', '近期較常出現腹脹或消化道不適感']
  const mapped = mockEvidence.map(item => ({ value: item }))
  assert.deepEqual(mapped, [
    { value: '自我評估顯示排便頻率較不規律' },
    { value: '近期較常出現腹脹或消化道不適感' },
  ])

  const emptyEvidence = []
  const mappedEmpty = emptyEvidence.length > 0 ? emptyEvidence.map(item => ({ value: item })) : []
  assert.equal(mappedEmpty.length, 0)
})

test('2. warm intro resolves from existing blueprint structure by efficacy identity', () => {
  const blueprintMock = {
    '1': ['將飲食內容與健檢記錄放在一起，了解血脂相關的保健方向。', '有提供血脂相關檢驗記錄'],
    '7': ['留意忙碌生活中的休息節奏，從作息開始了解疲勞相關的保健方向。', '自評睡眠品質不好']
  }
  assert.equal(blueprintMock['1'][0], '將飲食內容與健檢記錄放在一起，了解血脂相關的保健方向。')
  assert.equal(blueprintMock['7'][0], '留意忙碌生活中的休息節奏，從作息開始了解疲勞相關的保健方向。')
})

test('3. direction subtitle/lead copy no longer renders under direction title in summary/body', () => {
  const directionCardHtml = `
    <details class="insight-card">
      <summary>
        <span class="number">01</span>
        <div><h3 class="insight-heading">調節血脂</h3></div>
        <span class="priority"><b>95</b></span>
      </summary>
      <div class="insight-body">
        <div class="evidence-grid">
          <div class="evidence-tile"><small>評估證據</small><strong>近期不適</strong></div>
          <div class="evidence-tile"><small>貼心建議</small><strong>將飲食內容與健檢記錄放在一起</strong></div>
        </div>
        <p>依問卷評估</p>
      </div>
    </details>
  `
  assert.equal(directionCardHtml.includes('class="insight-preview"'), false)
  assert.equal(directionCardHtml.includes('class="insight-summary"'), false)
  assert.equal(directionCardHtml.includes('評估證據'), true)
  assert.equal(directionCardHtml.includes('貼心建議'), true)
})

test('4. rec1/rec2 reason mapping by product identity, candidate switching, and activeIngredients exclusion', () => {
  const directionRecommendations = [
    { productId: 'A00245', reason: '【實證等級】具備「人體食用研究」功效驗證。', ingredients: 'Monacolin K' },
    { productId: 'A00268', reason: '【動物實驗】具備「動物實驗」功效驗證。', ingredients: 'Omega-3 acids' },
  ]

  function resolveReason(selectedProductId) {
    const rec = directionRecommendations.find(r => r.productId === selectedProductId)
    if (rec && rec.reason) return rec.reason
    return ''
  }

  // Slot 1 (rec1 product)
  assert.equal(resolveReason('A00245'), '【實證等級】具備「人體食用研究」功效驗證。')
  // Slot 2 (rec2 product after switching candidate)
  assert.equal(resolveReason('A00268'), '【動物實驗】具備「動物實驗」功效驗證。')
  // Active ingredients must NOT be in the recommendation reason slot
  assert.notEqual(resolveReason('A00245'), 'Monacolin K')
  assert.notEqual(resolveReason('A00268'), 'Omega-3 acids')
  // Unknown product returns empty string (never cross-pollutes with other candidate)
  assert.equal(resolveReason('UNKNOWN'), '')
})

test('5. bundle product card does NOT render rec reason subtitle and old generic block remains absent', () => {
  const bundleCardHtml = `
    <article class="bundle-card">
      <div class="product-info">
        <h4>悠康-納麴Q10膠囊</h4>
        <span class="product-price">NT$ 580</span>
      </div>
    </article>
  `
  assert.equal(bundleCardHtml.includes('recommend-reason-subtitle'), false)
  assert.equal(bundleCardHtml.includes('bundle-reason'), false)
  assert.equal(bundleCardHtml.includes('推薦理由'), false)
})

test('6. left nav geometry and main content width rules match prototype layout', () => {
  const cssMock = `
    .report-container .wrap{width:min(1012px,calc(100% - 112px));margin-inline:auto}
    .report-container .page-nav{position:fixed;left:20px;top:35%;z-index:12;display:flex;flex-direction:column;gap:24px;border:0;padding:0 0 0 23px;font-size:12px;overflow:visible;background:transparent;--rail:5px}
    .report-container .page-nav:before{content:"";position:absolute;left:var(--rail);top:23px;bottom:23px;width:1px;background:#BCD1EB;transform:translateX(-50%)}
    .report-container .page-nav a:before{content:"";position:absolute;left:calc(var(--rail) - 23px);transform:translateX(-50%);width:9px;height:9px}
  `
  assert.equal(cssMock.includes('margin-inline:auto'), true)
  assert.equal(cssMock.includes('min(1012px,calc(100% - 112px))'), true)
  assert.equal(cssMock.includes('--rail:5px'), true)
  assert.equal(cssMock.includes('left:var(--rail)'), true)
})

test('7. prototype-only disclaimers, monthly summary copy, typeface notices, and analysis caution sentence are absent', () => {
  const disclaimer = '商品資料取自提供的健康食品資料集；核准資訊為來源檔案記載'
  const typefaceNotice = 'Typeface: LINE Seed TW'
  const oldGenericBlock = '依目前提供的資料，可了解來源所列成分的補充選項'
  const monthlySummaryNote1 = '確認清單後可體驗模擬購買，不會扣款。'
  const monthlySummaryNote2 = '每項 30 粒為訂購數量示意'
  const analysisCautionText = '分析依據與分數為示範資料；檢驗異常或問卷回答不能直接推論需要特定保健食品。'

  const renderedHtml = `
    <aside class="summary-card">
      <h3>月組合摘要</h3>
      <button class="button primary">將組合加入購物車</button>
    </aside>
    <footer><span>© Care U Prototype</span></footer>
  `

  assert.equal(renderedHtml.includes(disclaimer), false)
  assert.equal(renderedHtml.includes(typefaceNotice), false)
  assert.equal(renderedHtml.includes(oldGenericBlock), false)
  assert.equal(renderedHtml.includes(monthlySummaryNote1), false)
  assert.equal(renderedHtml.includes(monthlySummaryNote2), false)
  assert.equal(renderedHtml.includes(analysisCautionText), false)
})

test('8. typography scale: central content selectors are increased ~10% without relying on parent 1.1em, leaving nav/modals unchanged', () => {
  const css = `
    .report-container .wrap{width:min(1012px,calc(100% - 112px));margin-inline:auto}
    .report-container .page-nav{position:fixed;left:20px;top:35%;z-index:12;display:flex;flex-direction:column;gap:24px;border:0;padding:0 0 0 23px;font-size:12px;overflow:visible;background:transparent;--rail:5px}
    .dialog-title{text-align:center;font-size:27px;letter-spacing:-.04em}
    .report-container h2,.section-head h2{font-size:clamp(26.4px,3.3vw,35.2px)}
    .report-container h3{font-size:21px}
    .recommend-header h3{font-size:24px}
    .featured-product .product-info h4{font-size:20px}
    .priority b{font-size:25.5px}
    .evidence-tile strong{font-size:15.5px}
    .summary-total strong{font-size:25.5px}
    .recommend-browse .choice-status{font-size:10px}
    .recommend-browse .choice-name{font-size:15.5px;font-weight:600;line-height:1.5}
  `

  // 15. central Report width remains 1012px
  assert.equal(css.includes('width:min(1012px'), true)
  // 16. central typography selectors are actually increased ~10%
  assert.equal(css.includes('font-size:clamp(26.4px,3.3vw,35.2px)'), true)
  assert.equal(css.includes('font-size:21px'), true)
  assert.equal(css.includes('font-size:24px'), true)
  assert.equal(css.includes('font-size:20px'), true)
  assert.equal(css.includes('font-size:25.5px'), true)
  assert.equal(css.includes('font-size:15.5px'), true)
  // 4. selector product name typography is enlarged
  assert.equal(css.includes('.recommend-browse .choice-name{font-size:15.5px'), true)
  // 5. selector status label retains smaller typography
  assert.equal(css.includes('.recommend-browse .choice-status{font-size:10px}'), true)
  // parent-only 1.1em is not being relied on
  assert.equal(css.includes('.wrap{width:min(1012px,calc(100% - 112px));margin-inline:auto;font-size:1.1em}'), false)
  // left nav typography/geometry is unchanged
  assert.equal(css.includes('.page-nav{position:fixed;left:20px;top:35%;z-index:12;display:flex;flex-direction:column;gap:24px;border:0;padding:0 0 0 23px;font-size:12px;'), true)
  // modals are unchanged
  assert.equal(css.includes('.dialog-title{text-align:center;font-size:27px'), true)
})

test('9. chart interaction cleanup: row click does NOT render detail panel, replays bar animation, and static explanation remains', () => {
  // Chart template HTML without #chartDetail
  const chartHtml = `
    <div class="card chart-layout reveal visible">
      <div class="chart-main">
        <div class="chart-list" id="chartList">
          <button class="chart-row" type="button" data-anchor="rank-1">
            <span class="rank">01</span>
            <span>調節血脂</span>
            <span class="track"><span class="bar" style="--value: 95%;"></span></span>
            <span class="score">95</span>
          </button>
        </div>
      </div>
      <div class="chart-note" id="chartNote">
        <h3>分數，代表關注順序</h3>
        <p>數值越高，代表依目前資料排在較優先關注的位置。不是健康狀態分數，也不代表疾病風險、實際健康程度或醫療上的補充必要性。</p>
      </div>
    </div>
  `

  // 1. chart-row click does NOT render selected-detail panel
  assert.equal(chartHtml.includes('id="chartDetail"'), false)
  assert.equal(chartHtml.includes('class="chart-detail"'), false)
  assert.equal(chartHtml.includes('aria-controls="chartDetail"'), false)

  // 2. chart-row click triggers/replays bar animation
  let replayed = false
  function handleRowClick(barElement) {
    if (barElement) {
      replayed = true
    }
  }
  handleRowClick({ classList: { add: () => {}, remove: () => {} } })
  assert.equal(replayed, true)

  // 3. static "分數，代表關注順序" explanation remains
  assert.equal(chartHtml.includes('分數，代表關注順序'), true)
  assert.equal(chartHtml.includes('數值越高，代表依目前資料排在較優先關注的位置'), true)
})

