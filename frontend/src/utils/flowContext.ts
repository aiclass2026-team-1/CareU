const UPLOAD_FLOW_KEY = 'careu-upload-flow'

export function setUploadFlowActive() {
  try {
    sessionStorage.setItem(
      UPLOAD_FLOW_KEY,
      JSON.stringify({ active: true })
    )
  } catch (_) {}
}

export function hasUploadFlowActive(): boolean {
  try {
    const raw = sessionStorage.getItem(UPLOAD_FLOW_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    if (data && data.active) {
      return true
    }
  } catch (_) {}
  return false
}

export function clearUploadFlow() {
  try {
    sessionStorage.removeItem(UPLOAD_FLOW_KEY)
  } catch (_) {}
}

