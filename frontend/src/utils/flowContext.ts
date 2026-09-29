const UPLOAD_FLOW_KEY = 'careu-upload-flow'
const SUBMISSION_ID_KEY = 'careu-submission-id'

let memoryStore: Record<string, string> = {}

export function setUploadFlowActive() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        UPLOAD_FLOW_KEY,
        JSON.stringify({ active: true })
      )
      return
    }
  } catch (_) {}
  memoryStore[UPLOAD_FLOW_KEY] = JSON.stringify({ active: true })
}

export function hasUploadFlowActive(): boolean {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(UPLOAD_FLOW_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      return Boolean(data && data.active)
    }
  } catch (_) {}
  const raw = memoryStore[UPLOAD_FLOW_KEY]
  if (!raw) return false
  try {
    const data = JSON.parse(raw)
    return Boolean(data && data.active)
  } catch (_) {
    return false
  }
}

export function clearUploadFlow() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(UPLOAD_FLOW_KEY)
    }
  } catch (_) {}
  delete memoryStore[UPLOAD_FLOW_KEY]
}

/**
 * Retains real submissionId in flow context for future Batch 7 Assessment integration.
 */
export function setSubmissionId(submissionId: string) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SUBMISSION_ID_KEY, submissionId)
      return
    }
  } catch (_) {}
  memoryStore[SUBMISSION_ID_KEY] = submissionId
}

export function getSubmissionId(): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(SUBMISSION_ID_KEY)
    }
  } catch (_) {}
  return memoryStore[SUBMISSION_ID_KEY] ?? null
}

export function clearSubmissionId() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SUBMISSION_ID_KEY)
    }
  } catch (_) {}
  delete memoryStore[SUBMISSION_ID_KEY]
}

const REPORT_ID_KEY = 'careu-report-id'

let pendingUploadFile: File | null = null

export function setPendingUploadFile(file: File | null) {
  pendingUploadFile = file
}

export function getPendingUploadFile(): File | null {
  return pendingUploadFile
}

export function clearPendingUploadFile() {
  pendingUploadFile = null
}

export function setReportId(reportId: string) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(REPORT_ID_KEY, reportId)
      return
    }
  } catch (_) {}
  memoryStore[REPORT_ID_KEY] = reportId
}

export function getReportId(): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(REPORT_ID_KEY)
    }
  } catch (_) {}
  return memoryStore[REPORT_ID_KEY] ?? null
}

export function clearReportId() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(REPORT_ID_KEY)
    }
  } catch (_) {}
  delete memoryStore[REPORT_ID_KEY]
}

const ASSESSMENT_ID_KEY = 'careu-assessment-id'
const LIVE_REPORT_KEY = 'careu-live-report'


export function setAssessmentId(assessmentId: string) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(ASSESSMENT_ID_KEY, assessmentId)
      return
    }
  } catch (_) {}
  memoryStore[ASSESSMENT_ID_KEY] = assessmentId
}

export function getAssessmentId(): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(ASSESSMENT_ID_KEY)
    }
  } catch (_) {}
  return memoryStore[ASSESSMENT_ID_KEY] ?? null
}

export function clearAssessmentId() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(ASSESSMENT_ID_KEY)
    }
  } catch (_) {}
  delete memoryStore[ASSESSMENT_ID_KEY]
}

export function setLiveReportData(report: any) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(LIVE_REPORT_KEY, JSON.stringify(report))
      return
    }
  } catch (_) {}
  memoryStore[LIVE_REPORT_KEY] = JSON.stringify(report)
}

export function getLiveReportData(): any | null {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(LIVE_REPORT_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    }
  } catch (_) {}
  const raw = memoryStore[LIVE_REPORT_KEY]
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (_) {
    return null
  }
}

export function clearLiveReportData() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(LIVE_REPORT_KEY)
    }
  } catch (_) {}
  delete memoryStore[LIVE_REPORT_KEY]
}
