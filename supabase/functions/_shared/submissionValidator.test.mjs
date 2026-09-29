import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { validateAndDeriveSubmission } from './submissionValidator.ts'

function fixture(name) {
  return JSON.parse(
    readFileSync(new URL(`../../../docs/design/spikes/questionnaire-plan-builder/fixtures/${name}.json`, import.meta.url), 'utf8')
  )
}

const questionBank = fixture('question-bank')

test('submissionValidator: validates valid single choice answer and derives trusted score', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 1, value: 'moderate' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, true)
  assert.equal(result.validatedAnswers?.length, 1)
  assert.deepEqual(result.validatedAnswers?.[0], {
    question_id: 1,
    value: 'moderate',
    score: 1,
    source: 'USER_INPUT',
  })
})

test('submissionValidator: rejects invalid option key on single choice', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 1, value: 'non_existent_key' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, false)
  assert.equal(result.error?.code, 'INVALID_OPTION')
  assert.equal(result.error?.questionId, 1)
})

test('submissionValidator: validates multi-choice answer and preserves score as null (MULTI_SELECT_SCORE_RULE_UNRESOLVED)', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 32, value: ['dairy', 'soy'] },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, true)
  assert.equal(result.validatedAnswers?.[0].score, null) // No invented aggregation; score is null
  assert.deepEqual(result.validatedAnswers?.[0].value, ['dairy', 'soy'])
  assert.equal(result.validatedAnswers?.[0].source, 'USER_INPUT')
})

test('submissionValidator: rejects multi-choice exclusive conflict', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 32, value: ['none_known', 'dairy'] },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, false)
  assert.equal(result.error?.code, 'EXCLUSIVE_CONFLICT')
})

test('submissionValidator: rejects multi-choice when required detailText is missing', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 32, value: ['other'] },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, false)
  assert.equal(result.error?.code, 'REQUIRED_DETAIL_MISSING')
})

test('submissionValidator: accepts multi-choice when required detailText is provided', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 32, value: ['other'], detailText: '芒果過敏' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, true)
  assert.equal(result.validatedAnswers?.[0].detail_text, '芒果過敏')
})

test('submissionValidator: validates number question with valid numeric value', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 13, value: 85.5 },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, true)
  assert.equal(result.validatedAnswers?.[0].value, 85.5)
  assert.equal(result.validatedAnswers?.[0].score, null)
  assert.equal(result.validatedAnswers?.[0].source, 'USER_INPUT')
})

test('submissionValidator: validates number question with unknown semantic key', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 13, value: 'unknown' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, true)
  assert.equal(result.validatedAnswers?.[0].value, 'unknown')
  assert.equal(result.validatedAnswers?.[0].score, null)
})

test('submissionValidator: rejects number question with out of range value', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 13, value: 300 },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, false)
  assert.equal(result.error?.code, 'VALUE_OUT_OF_RANGE')
})

test('submissionValidator: validates text question', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 27, value: '120/80' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, true)
  assert.equal(result.validatedAnswers?.[0].value, '120/80')
})

test('submissionValidator: rejects required text question when empty', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 27, value: '   ' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, false)
  assert.equal(result.error?.code, 'REQUIRED_FIELD_MISSING')
})

test('submissionValidator: rejects duplicate questionId in single submission', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 1, value: 'low' },
      { questionId: 1, value: 'high' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, false)
  assert.equal(result.error?.code, 'DUPLICATE_ANSWER')
})

test('submissionValidator: rejects non-existent questionId', () => {
  const payload = {
    reportId: null,
    mode: 'full',
    submittedAt: '2026-09-29T10:00:00.000Z',
    answers: [
      { questionId: 9999, value: 'low' },
    ],
  }
  const result = validateAndDeriveSubmission(payload, questionBank)
  assert.equal(result.valid, false)
  assert.equal(result.error?.code, 'INVALID_QUESTION')
})

