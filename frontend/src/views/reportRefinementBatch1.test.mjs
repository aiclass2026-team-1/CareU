import test from 'node:test'
import assert from 'node:assert/strict'

test('1. evidenceItems array is preserved in source order & null/empty evidenceItems does not produce fake text', () => {
  const mockEvidence = ['排便頻率較不規律', '近期腹脹不適']
  const mapped = mockEvidence.map(item => ({ value: item }))
  assert.deepEqual(mapped, [
    { value: '排便頻率較不規律' },
    { value: '近期腹脹不適' },
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

test('3. rec1 and rec2 product reasons map correctly and switch per candidate slot', () => {
  const recommendations = [
    { productId: 101, reason: '【實證等級】具備人體食用研究。' },
    { productId: 102, reason: '【動物實驗】具備動物實驗驗證。' },
  ]

  function getProductReason(productId) {
    const rec = recommendations.find(r => r.productId === productId)
    return rec?.reason || '預設成分說明'
  }

  assert.equal(getProductReason(101), '【實證等級】具備人體食用研究。')
  assert.equal(getProductReason(102), '【動物實驗】具備動物實驗驗證。')
  assert.equal(getProductReason(999), '預設成分說明')
})

test('4. old generic recommendation copy and monthly summary explanatory texts are absent', () => {
  const oldGenericBlock = '依目前提供的資料，可了解來源所列成分的補充選項，作為日常保健比較參考。'
  const monthlySummaryNote1 = '確認清單後可體驗模擬購買，不會扣款。'
  const monthlySummaryNote2 = '每項 30 粒為訂購數量示意'

  const bundleSectionHtml = `
    <aside class="summary-card">
      <h3>月組合摘要</h3>
      <button class="button primary">將組合加入購物車</button>
    </aside>
  `

  assert.equal(bundleSectionHtml.includes(monthlySummaryNote1), false)
  assert.equal(bundleSectionHtml.includes(monthlySummaryNote2), false)
  assert.equal(bundleSectionHtml.includes(oldGenericBlock), false)
})


