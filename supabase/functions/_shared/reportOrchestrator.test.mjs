import assert from 'node:assert/strict'
import test from 'node:test'
import {
  deriveAssessmentInputs,
  mergeAssessmentItems,
  resolveEfficacyScore,
} from './reportOrchestrator.ts'

const mockQuestionBank = [
  {
    id: 1,
    efficacy_id: 1,
    efficacy_name: '調節血脂',
    category: 'RISK_FACTOR',
    question_text: '平均每週紅肉/油炸食物攝取頻率？',
    applicable_gender: 'ALL',
    is_active: true,
    options_json: [
      { label: '低', score: 0 },
      { label: '中', score: 1 },
      { label: '偏高', score: 2 },
      { label: '高', score: 3 },
    ],
  },
  {
    id: 13,
    efficacy_id: 6,
    efficacy_name: '不易形成體脂肪',
    category: 'OBJECTIVE_VALUE',
    question_text: '腰圍實測值',
    applicable_gender: 'ALL',
    is_active: true,
    options_json: [],
  },
  {
    id: 30,
    efficacy_id: 12,
    efficacy_name: '安全資訊',
    category: 'CONTRAINDICATION',
    question_text: '您目前是否懷孕？',
    applicable_gender: 'FEMALE',
    is_active: true,
    options_json: [
      { label: '否', score: 0 },
      { label: '是', score: 1 },
    ],
  },
  {
    id: 31,
    efficacy_id: 12,
    efficacy_name: '安全資訊',
    category: 'CONTRAINDICATION',
    question_text: '您目前是否正在哺乳？',
    applicable_gender: 'FEMALE',
    is_active: true,
    options_json: [
      { label: '否', score: 0 },
      { label: '是', score: 1 },
    ],
  },
  {
    id: 32,
    efficacy_id: 8,
    efficacy_name: '過敏檢測',
    category: 'CONTRAINDICATION',
    question_text: '您是否對下列任一項目有已知過敏反應？',
    applicable_gender: 'ALL',
    is_active: true,
    options_json: [
      { label: '無已知過敏', score: 0 },
      { label: '牛奶', score: 3 },
    ],
  },
]

test('A & B: resolveEfficacyScore: preserves 0 and returns null (never fabricated 85)', () => {
  const rowZero = { efficacy_name: '調節血脂', efficacy_rank: 1, efficacy_id: 1 }
  const topEfficaciesDetailZero = [{ rank: 1, id: 1, name: '調節血脂', score: 0 }]
  assert.equal(resolveEfficacyScore(rowZero, topEfficaciesDetailZero, {}), 0)

  const rowMissing = { efficacy_name: '胃腸功能改善', efficacy_rank: 5, efficacy_id: 5 }
  const scoreResult = resolveEfficacyScore(rowMissing, [], {})
  assert.equal(scoreResult, null)
  assert.notEqual(scoreResult, 85)
})

test('C: resolveEfficacyScore: resolves scores correctly via top_efficacies_detail and scores_json by efficacyId', () => {
  const row1 = { efficacy_name: '調節血脂', efficacy_rank: 1, efficacy_id: 1 }
  const topDetail = [{ rank: 1, id: 1, name: '調節血脂', score: 94.6 }]
  assert.equal(resolveEfficacyScore(row1, topDetail, {}), 95)

  const row2 = { efficacy_name: '不易形成體脂肪', efficacy_rank: 2, efficacy_id: 6 }
  const scoresJson = { '6': 66.7 }
  assert.equal(resolveEfficacyScore(row2, null, scoresJson), 67)
})

test('D: deriveAssessmentInputs: survey-only calculation items ignore null scores', () => {
  const answers = [
    { question_id: 1, value: 'high', score: 3, source: 'USER_INPUT' },
    { question_id: 13, value: 85, score: null, source: 'USER_INPUT' }, // Numeric score null ignored
    { question_id: 30, value: 'yes', score: 1, source: 'USER_INPUT' },
  ]

  const result = deriveAssessmentInputs(answers, mockQuestionBank)
  assert.equal(result.items.length, 2)

  const eff1 = result.items.find((i) => i.efficacyId === 1)
  assert.ok(eff1)
  assert.equal(eff1.surveyScore, 3)
  assert.equal(eff1.labScore, 0)
  assert.equal(eff1.labMax, 0)
})

test('E: mergeAssessmentItems: merges trusted report_efficacy_lab_scores into assessment items', () => {
  const surveyItems = [
    { efficacyId: 1, efficacyName: '調節血脂', labScore: 0, labMax: 0, surveyScore: 3, surveyMax: 3 },
  ]
  const labScores = [
    { efficacy_name: '調節血脂', lab_earned_score: 18, lab_max_score: 20 },
    { efficacy_name: '不易形成體脂肪', lab_earned_score: 10, lab_max_score: 15 },
  ]

  const merged = mergeAssessmentItems(surveyItems, labScores)
  assert.equal(merged.length, 2)

  const lipid = merged.find((m) => m.efficacyName === '調節血脂')
  assert.ok(lipid)
  assert.equal(lipid.surveyScore, 3)
  assert.equal(lipid.labScore, 18)
  assert.equal(lipid.labMax, 20)

  const bodyfat = merged.find((m) => m.efficacyName === '不易形成體脂肪')
  assert.ok(bodyfat)
  assert.equal(bodyfat.labScore, 10)
  assert.equal(bodyfat.labMax, 15)
  assert.equal(bodyfat.surveyScore, 0)
})

test('H: deriveAssessmentInputs: normalizes safety conditions into Chinese semantics with labels', () => {
  const answers = [
    { question_id: 30, value: 'yes', score: 1, source: 'USER_INPUT' },
    { question_id: 31, value: 'yes', score: 1, source: 'USER_INPUT' },
    { question_id: 32, value: ['dairy', 'other'], score: null, detail_text: '芒果', source: 'USER_INPUT' },
  ]

  const result = deriveAssessmentInputs(answers, mockQuestionBank)
  assert.ok(result.userConditions.includes('懷孕'))
  assert.ok(result.userConditions.includes('哺乳'))
  assert.ok(result.userConditions.includes('過敏:牛奶及乳製品'))
  assert.ok(result.userConditions.includes('過敏:芒果'))
  assert.ok(!result.userConditions.includes('dairy')) // Raw key replaced by normalized label
})

