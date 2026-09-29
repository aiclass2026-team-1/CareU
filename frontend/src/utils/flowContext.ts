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
