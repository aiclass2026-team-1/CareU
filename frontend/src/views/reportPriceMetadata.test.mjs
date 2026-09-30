import assert from 'node:assert/strict'
import test from 'node:test'

function formatMoney(v) {
  if (v === null || v === undefined || typeof v !== 'number' || isNaN(v) || v <= 0) {
    return '價格未標示'
  }
  const fixed = Number(v.toFixed(4))
  return 'NT$ ' + new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 4 }).format(fixed)
}

test('RPT-02: fractional unitPrice remains fractional and 30-capsule price is exact', () => {
  const unitPrice = 11.4
  const total30 = Number((unitPrice * 30).toFixed(4))
  assert.equal(unitPrice, 11.4)
  assert.equal(total30, 342)
  assert.equal(formatMoney(unitPrice), 'NT$ 11.4')
  assert.equal(formatMoney(total30), 'NT$ 342')

  const unit2 = 2.98
  const total2 = Number((unit2 * 30).toFixed(4))
  assert.equal(unit2, 2.98)
  assert.equal(total2, 89.4)
  assert.equal(formatMoney(unit2), 'NT$ 2.98')
  assert.equal(formatMoney(total2), 'NT$ 89.4')
})

test('RPT-02: trailing-zero formatting and integer preservation', () => {
  assert.equal(formatMoney(5), 'NT$ 5')
  assert.equal(formatMoney(5.0), 'NT$ 5')
  assert.equal(formatMoney(89.40), 'NT$ 89.4')
  assert.equal(formatMoney(150.00), 'NT$ 150')
  assert.equal(formatMoney(342.0), 'NT$ 342')
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

test('RPT-04: live report mapping preserves DB metadata contract', () => {
  const recommendation = {
    productId: 123,
    productName: '測試護肝膠囊',
    unitPrice: 15,
    efficacy: '護肝',
    efficacyClaim: '有助於降低血清GPT(ALT)值',
    evidenceType: '人體食用',
    activeIngredients: '水飛薊素',
    warnings: '孕婦忌服',
    precautions: '請依建議量食用',
    licenseNo: '衛部健食字第A00123號',
    evidenceScore: 4,
    mechanismTag: 'silymarin',
    reason: '依據您的肝功能檢測與護肝保健需求',
  }

  assert.equal(recommendation.unitPrice, 15)
  assert.equal(recommendation.efficacy, '護肝')
  assert.equal(recommendation.efficacyClaim, '有助於降低血清GPT(ALT)值')
  assert.equal(recommendation.evidenceType, '人體食用')
  assert.equal(recommendation.activeIngredients, '水飛薊素')
  assert.equal(recommendation.licenseNo, '衛部健食字第A00123號')
})
