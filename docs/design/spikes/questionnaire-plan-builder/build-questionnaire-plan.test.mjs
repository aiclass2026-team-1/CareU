import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { buildQuestionnairePlan } from './build-questionnaire-plan.mjs'

function fixture(name) {
  return JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'))
}

const questionBank = fixture('question-bank')

test('full female request matches the TARGET golden response', () => {
  const actual = buildQuestionnairePlan(
    fixture('full-request'),
    { reportId: null, recognizedMetrics: [], missingMetrics: [] },
    questionBank
  )
  assert.deepEqual(actual, fixture('full-response'))
})

test('supplement request suppresses recognized waist and asks for missing blood pressure', () => {
  const actual = buildQuestionnairePlan(
    fixture('supplement-request'),
    fixture('supplement-trusted-context'),
    questionBank
  )
  assert.deepEqual(actual, fixture('supplement-response'))
  assert.equal(actual.questions.some((question) => question.id === 13), false)
})

test('male profile omits female-applicable questions', () => {
  const request = { ...fixture('full-request'), profile: { gender: 'MALE' } }
  const actual = buildQuestionnairePlan(
    request,
    { reportId: null, recognizedMetrics: [], missingMetrics: [] },
    questionBank
  )
  assert.equal(actual.questions.some((question) => [26, 30, 31].includes(question.id)), false)
})

test('rejects caller/report context mismatch and ambiguous metric state', () => {
  const request = fixture('supplement-request')
  assert.throws(
    () => buildQuestionnairePlan(request, { reportId: 'different', recognizedMetrics: [], missingMetrics: [] }, questionBank),
    /does not match request reportId/
  )
  assert.throws(
    () => buildQuestionnairePlan(request, { ...fixture('supplement-trusted-context'), missingMetrics: ['WAIST'] }, questionBank),
    /unique and disjoint/
  )
})

test('rejects missing required profile and presentation inputs', () => {
  const request = { ...fixture('full-request'), profile: { gender: 'ALL' } }
  assert.throws(
    () => buildQuestionnairePlan(request, { reportId: null, recognizedMetrics: [], missingMetrics: [] }, questionBank),
    /profile.gender must be MALE or FEMALE/
  )
  assert.throws(
    () => buildQuestionnairePlan(fixture('full-request'), { reportId: null, recognizedMetrics: [], missingMetrics: [] }, questionBank.slice(1)),
    /missing question_bank row or presentation config/
  )
})