import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { buildQuestionnairePlan, PlanBuilderError } from './planBuilder.ts'

function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../../../docs/design/spikes/questionnaire-plan-builder/fixtures/${name}.json`, import.meta.url), 'utf8')
  )
}

const questionBank = fixture('question-bank')

test('planBuilder: full female request matches TARGET golden response', () => {
  const actual = buildQuestionnairePlan(
    fixture('full-request'),
    { reportId: null, recognizedMetrics: [], missingMetrics: [] },
    questionBank
  )
  assert.deepEqual(actual, fixture('full-response'))
})

test('planBuilder: supplement request suppresses recognized waist and asks for missing blood pressure and canonical safety/lifestyle', () => {
  const actual = buildQuestionnairePlan(
    fixture('supplement-request'),
    fixture('supplement-trusted-context'),
    questionBank
  )
  assert.equal(actual.questions.some((q) => q.id === 13), false) // WAIST recognized -> suppressed
  assert.equal(actual.questions.some((q) => q.id === 27), true) // BP missing -> included
  assert.equal(actual.questions.some((q) => q.id === 1), true) // Lifestyle -> always included
  assert.equal(actual.questions.some((q) => q.id === 30), true) // Safety pregnancy -> included
  assert.equal(actual.questions.some((q) => q.id === 31), true) // Safety breastfeeding -> included
  assert.equal(actual.questions.some((q) => q.id === 32), true) // Safety allergies -> included
})


test('planBuilder: male profile omits female-applicable questions', () => {
  const request = { ...fixture('full-request'), profile: { gender: 'MALE' } }
  const actual = buildQuestionnairePlan(
    request,
    { reportId: null, recognizedMetrics: [], missingMetrics: [] },
    questionBank
  )
  assert.equal(actual.questions.some((q) => [26, 30, 31].includes(q.id)), false)
})

test('planBuilder: rejects caller/report context mismatch', () => {
  const request = fixture('supplement-request')
  assert.throws(
    () => buildQuestionnairePlan(request, { reportId: 'different-id', recognizedMetrics: [], missingMetrics: [] }, questionBank),
    (err) => err instanceof PlanBuilderError && err.code === 'REPORT_CONTEXT_MISMATCH'
  )
})

test('planBuilder: rejects invalid mode', () => {
  const request = { ...fixture('full-request'), mode: 'invalid_mode' }
  assert.throws(
    () => buildQuestionnairePlan(request, { reportId: null, recognizedMetrics: [], missingMetrics: [] }, questionBank),
    (err) => err instanceof PlanBuilderError && err.code === 'INVALID_MODE'
  )
})

test('planBuilder: rejects invalid gender profile', () => {
  const request = { ...fixture('full-request'), profile: { gender: 'ALL' } }
  assert.throws(
    () => buildQuestionnairePlan(request, { reportId: null, recognizedMetrics: [], missingMetrics: [] }, questionBank),
    (err) => err instanceof PlanBuilderError && err.code === 'INVALID_PROFILE'
  )
})

test('planBuilder: rejects missing question_bank row', () => {
  assert.throws(
    () => buildQuestionnairePlan(fixture('full-request'), { reportId: null, recognizedMetrics: [], missingMetrics: [] }, questionBank.slice(1)),
    (err) => err instanceof PlanBuilderError && err.code === 'PLAN_GENERATION_FAILED'
  )
})
