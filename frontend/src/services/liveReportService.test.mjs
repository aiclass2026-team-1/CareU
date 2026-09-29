import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LiveReportService,
  REPORT_CANARY_ENDPOINTS,
  LiveReportServiceError,
} from './liveReportService.ts'
import {
  setAssessmentId,
  getAssessmentId,
  clearAssessmentId,
  setLiveReportData,
  getLiveReportData,
  clearLiveReportData,
} from '../utils/flowContext.ts'

test('REPORT_CANARY_ENDPOINTS: uses canonical finalize-health-report slug', () => {
  assert.equal(REPORT_CANARY_ENDPOINTS.FINALIZE_REPORT, 'finalize-health-report')
})

test('FlowContext: handles assessmentId and liveReportData correctly', () => {
  clearAssessmentId()
  clearLiveReportData()

  assert.equal(getAssessmentId(), null)
  assert.equal(getLiveReportData(), null)

  const testAssessmentId = 'assessment-uuid-5678'
  setAssessmentId(testAssessmentId)
  assert.equal(getAssessmentId(), testAssessmentId)

  const testReportPayload = {
    success: true,
    submissionId: 'sub-123',
    assessmentId: testAssessmentId,
    hasRedFlags: false,
    priorities: [
      {
        rank: 1,
        efficacyName: '調節血脂',
        score: 95,
        recommendations: [
          { productId: 6, productName: '測試魚油膠囊', reason: '人體食用研究' },
        ],
      },
    ],
  }
  setLiveReportData(testReportPayload)
  assert.deepEqual(getLiveReportData(), testReportPayload)

  clearAssessmentId()
  clearLiveReportData()
  assert.equal(getAssessmentId(), null)
  assert.equal(getLiveReportData(), null)
})

test('LiveReportService: rejects invalid submissionId input', async () => {
  const service = new LiveReportService()
  await assert.rejects(
    async () => {
      await service.finalizeHealthReport('')
    },
    (err) => {
      assert.ok(err instanceof LiveReportServiceError)
      assert.equal(err.code, 'INVALID_SUBMISSION_ID')
      return true
    }
  )
})
