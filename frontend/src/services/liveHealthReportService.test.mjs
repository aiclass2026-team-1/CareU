import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LiveHealthReportService,
  HEALTH_REPORT_ENDPOINTS,
  LiveHealthReportServiceError,
} from './liveHealthReportService.ts'
import {
  setReportId,
  getReportId,
  clearReportId,
  setPendingUploadFile,
  getPendingUploadFile,
  clearPendingUploadFile,
} from '../utils/flowContext.ts'

test('HEALTH_REPORT_ENDPOINTS: uses canonical endpoint and bucket names', () => {
  assert.equal(HEALTH_REPORT_ENDPOINTS.PARSE_HEALTH_REPORT, 'parse-health-report')
  assert.equal(HEALTH_REPORT_ENDPOINTS.STORAGE_BUCKET, 'health-reports')
})

test('FlowContext: handles reportId and pendingUploadFile correctly', () => {
  clearReportId()
  clearPendingUploadFile()

  assert.equal(getReportId(), null)
  assert.equal(getPendingUploadFile(), null)

  const testReportId = 'report-uuid-9999'
  setReportId(testReportId)
  assert.equal(getReportId(), testReportId)

  clearReportId()
  assert.equal(getReportId(), null)
})

test('LiveHealthReportService: rejects null/undefined file input', async () => {
  const service = new LiveHealthReportService()
  await assert.rejects(
    async () => {
      await service.uploadAndParseReport(null)
    },
    (err) => {
      assert.ok(err instanceof LiveHealthReportServiceError)
      assert.equal(err.code, 'INVALID_FILE')
      return true
    }
  )
})
