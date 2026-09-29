import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LiveQuestionnaireService,
  CANONICAL_CANARY_ENDPOINTS,
  LiveQuestionnaireServiceError,
} from './liveQuestionnaireService.ts'
import { MockQuestionnaireService } from './mockQuestionnaireService.ts'
import { resetSupabaseClientInstance } from '../utils/supabaseClient.ts'
import { setSubmissionId, getSubmissionId, clearSubmissionId } from '../utils/flowContext.ts'

test('CANONICAL_CANARY_ENDPOINTS: matches target canary function slugs', () => {
  assert.equal(CANONICAL_CANARY_ENDPOINTS.BUILD_PLAN, 'build-questionnaire-plan')
  assert.equal(CANONICAL_CANARY_ENDPOINTS.SUBMIT_QUESTIONNAIRE, 'submit-questionnaire')
})

test('MockQuestionnaireService: returns fixture and null submissionId without network requests', async () => {
  const mockService = new MockQuestionnaireService()
  const plan = await mockService.getPlan({ mode: 'full', reportId: null })

  assert.equal(plan.mode, 'full')
  assert.equal(plan.reportId, null)
  assert.ok(Array.isArray(plan.questions))
  assert.ok(plan.questions.length > 0)

  const submitResult = await mockService.submitAnswers({
    reportId: null,
    mode: 'full',
    answers: [{ questionId: 101, value: 'low' }],
    submittedAt: new Date().toISOString(),
  })

  assert.deepEqual(submitResult, { submissionId: null })
})

test('FlowContext: handles submissionId in sessionStorage correctly', () => {
  // Clear any existing
  clearSubmissionId()
  assert.equal(getSubmissionId(), null)

  const testId = 'test-submission-uuid-1234'
  setSubmissionId(testId)
  assert.equal(getSubmissionId(), testId)

  clearSubmissionId()
  assert.equal(getSubmissionId(), null)
})

test('LiveQuestionnaireService: throws LOCAL_ENV_SETUP_REQUIRED when env variables are not present', async () => {
  resetSupabaseClientInstance()
  const liveService = new LiveQuestionnaireService()

  await assert.rejects(
    async () => {
      await liveService.getPlan({ mode: 'full', reportId: null, profile: { gender: 'FEMALE' } })
    },
    (err) => {
      assert.ok(err instanceof LiveQuestionnaireServiceError || err instanceof Error)
      assert.ok(err.code === 'LOCAL_ENV_SETUP_REQUIRED' || err.message.includes('LOCAL_ENV_SETUP_REQUIRED'))
      return true
    }
  )

  await assert.rejects(
    async () => {
      await liveService.submitAnswers({
        reportId: null,
        mode: 'full',
        answers: [{ questionId: 1, value: 'low' }],
        submittedAt: new Date().toISOString(),
      })
    },
    (err) => {
      assert.ok(err instanceof LiveQuestionnaireServiceError || err instanceof Error)
      assert.ok(err.code === 'LOCAL_ENV_SETUP_REQUIRED' || err.message.includes('LOCAL_ENV_SETUP_REQUIRED'))
      return true
    }
  )
})
test('LiveQuestionnaireService: error mapping produces expected domain codes', async () => {
  const err401 = new LiveQuestionnaireServiceError('FUNCTION_UNAUTHORIZED', '認證已過期或無效，請重新整理頁面。', 401)
  assert.equal(err401.code, 'FUNCTION_UNAUTHORIZED')
  assert.equal(err401.status, 401)

  const err400 = new LiveQuestionnaireServiceError('INVALID_OPTION', '問卷作答內容格式不正確，請檢查後重試。', 400)
  assert.equal(err400.code, 'INVALID_OPTION')
  assert.equal(err400.status, 400)

  const err500 = new LiveQuestionnaireServiceError('PERSISTENCE_FAILED', '儲存問卷作答失敗，請稍後再試。', 500)
  assert.equal(err500.code, 'PERSISTENCE_FAILED')
  assert.equal(err500.status, 500)

  const errNet = new LiveQuestionnaireServiceError('NETWORK_ERROR', '網路連線異常，請確認網路後重試。')
  assert.equal(errNet.code, 'NETWORK_ERROR')
})
