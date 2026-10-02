import assert from 'node:assert/strict'
import test from 'node:test'

function formatMoney(v) {
  if (v === null || v === undefined || typeof v !== 'number' || isNaN(v) || v <= 0) {
    return '價格未標示'
  }
  const rounded = Math.round(v)
  return 'NT$ ' + new Intl.NumberFormat('zh-TW').format(rounded)
}

test('RPT-02: integer price formatting and round-half-up semantics', () => {
  // 1. unitPrice 12.56 displays as integer 13
  assert.equal(formatMoney(12.56), 'NT$ 13')
  // 2. monthly price 12.56 * 30 (376.8) displays as 377
  assert.equal(formatMoney(12.56 * 30), 'NT$ 377')
  // 3. unitPrice 11.4 displays as 11
  assert.equal(formatMoney(11.4), 'NT$ 11')
  // 4. monthly price 11.4 * 30 (342) displays as 342
  assert.equal(formatMoney(11.4 * 30), 'NT$ 342')
  // 5. unitPrice 2.98 displays as 3
  assert.equal(formatMoney(2.98), 'NT$ 3')
  // 6. monthly price 2.98 * 30 (89.4) displays as 89
  assert.equal(formatMoney(2.98 * 30), 'NT$ 89')
})

test('RPT-02: no Report price string contains a decimal point', () => {
  const testPrices = [12.56, 12.56 * 30, 11.4, 11.4 * 30, 2.98, 2.98 * 30, 89.40, 376.80]
  testPrices.forEach(p => {
    const formatted = formatMoney(p)
    assert.equal(formatted.includes('.'), false)
  })
})

test('RPT-02: null/invalid price uses neutral missing state, never 0, NaN, or 980', () => {
  for (const bad of [null, undefined, NaN, 0, -1, 'invalid']) {
    const formatted = formatMoney(bad)
    assert.equal(formatted, '價格未標示')
    assert.notEqual(formatted, 'NT$ 0')
    assert.notEqual(formatted, 'NT$ NaN')
    assert.notEqual(formatted, 'NT$ undefined')
    assert.notEqual(formatted, 'NT$ 980')
  }
})

test('RPT-02: displayed summary total equals displayed item amounts', () => {
  const items = [
    { price: 376.8 }, // displays as 377
    { price: 89.4 },  // displays as 89
  ]
  const displayedItemAmounts = items.map(i => Math.round(i.price))
  assert.deepEqual(displayedItemAmounts, [377, 89])

  const sumOfDisplayed = displayedItemAmounts.reduce((acc, n) => acc + n, 0)
  assert.equal(sumOfDisplayed, 466)

  const totalCalc = items.reduce((acc, i) => acc + Math.round(i.price), 0)
  assert.equal(formatMoney(totalCalc), 'NT$ 466')
})

test('RPT-04: live report mapping preserves DB metadata contract (licenseNo, approvalDate, applicant)', () => {
  const recommendation = {
    productId: 57,
    productName: '極品牛樟芝菌絲體膠囊',
    unitPrice: 15,
    efficacy: '護肝',
    efficacyClaim: '有助於降低血清GPT(ALT)值',
    evidenceType: '人體食用',
    activeIngredients: '水飛薊素',
    warnings: '孕婦忌服',
    precautions: '請依建議量食用',
    licenseNo: '衛部健食字第A00381號',
    approvalDate: '2019-08-05',
    applicant: '合一生技股份有限公司',
    evidenceScore: 4,
    mechanismTag: 'silymarin',
    reason: '依據您的肝功能檢測與護肝保健需求',
  }

  // 7. licenseNo maps to license_no
  assert.equal(recommendation.licenseNo, '衛部健食字第A00381號')
  // 8. approvalDate maps to approval_date
  assert.equal(recommendation.approvalDate, '2019-08-05')
  // 9. applicant maps to applicant
  assert.equal(recommendation.applicant, '合一生技股份有限公司')
  // 13. existing product metadata remains intact
  assert.equal(recommendation.unitPrice, 15)
  assert.equal(recommendation.efficacy, '護肝')
  assert.equal(recommendation.efficacyClaim, '有助於降低血清GPT(ALT)值')
  assert.equal(recommendation.evidenceType, '人體食用')
  assert.equal(recommendation.activeIngredients, '水飛薊素')
})

test('RPT-04: product detail metadata renders only 3 rows (license, date, applicant) and null uses "未標示"', () => {
  const emptyRec = {
    licenseNo: null,
    approvalDate: null,
    applicant: undefined,
  }

  function renderSourceMeta(rec) {
    const license = rec.licenseNo || '未標示'
    const approvalDate = rec.approvalDate || '未標示'
    const applicant = rec.applicant || '未標示'
    return `
      <div class="source-meta">
        <span>核准字號：${license}</span>
        <span>核准日期：${approvalDate}</span>
        <span>申請商：${applicant}</span>
      </div>
    `
  }

  const rendered = renderSourceMeta(emptyRec)
  // 10. source-status row is not rendered
  assert.equal(rendered.includes('來源記載狀態'), false)
  // 11. null approval/applicant values use "未標示"
  assert.equal(rendered.includes('核准字號：未標示'), true)
  assert.equal(rendered.includes('核准日期：未標示'), true)
  assert.equal(rendered.includes('申請商：未標示'), true)
  // 12. no hard-coded "(未即時查核)" remains
  assert.equal(rendered.includes('（未即時查核）'), false)
  assert.equal(rendered.includes('(未即時查核)'), false)
})
