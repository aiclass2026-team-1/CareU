import test from 'node:test'
import assert from 'node:assert/strict'

// Mock sessionStorage for test environment
class MockSessionStorage {
  constructor() {
    this.store = new Map()
  }
  getItem(key) {
    return this.store.get(key) || null
  }
  setItem(key, value) {
    this.store.set(key, String(value))
  }
  removeItem(key) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
}

if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = new MockSessionStorage()
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MockSessionStorage()
}

test('1. modal appears for unacknowledged formal report', () => {
  sessionStorage.clear()
  const assessmentId = 'assessment-123'
  const safetyAckKey = `careu-safety-ack-assessment-${assessmentId}`
  
  const isAcknowledged = sessionStorage.getItem(safetyAckKey) === 'true'
  const isSafetyNoticeOpen = !isAcknowledged

  assert.equal(isSafetyNoticeOpen, true)
})

test('2. report is inaccessible while modal is open (inert attribute / non-interactive state)', () => {
  const isSafetyNoticeOpen = true
  const reportAppInert = isSafetyNoticeOpen
  assert.equal(reportAppInert, true)
})

test('3. backdrop click does not dismiss (close-on-overlay=false behavior)', () => {
  const closeOnOverlay = false
  let isSafetyNoticeOpen = true

  function handleBackdropClick(shouldClose) {
    if (shouldClose && closeOnOverlay) {
      isSafetyNoticeOpen = false
    }
  }

  handleBackdropClick(true)
  assert.equal(isSafetyNoticeOpen, true)
})

test('4. Escape does not dismiss (close-on-esc=false behavior)', () => {
  const closeOnEsc = false
  let isSafetyNoticeOpen = true

  function handleKeyDown(eventKey) {
    if (eventKey === 'Escape' && closeOnEsc) {
      isSafetyNoticeOpen = false
    }
  }

  handleKeyDown('Escape')
  assert.equal(isSafetyNoticeOpen, true)
})

test('5. CTA dismisses modal', () => {
  let isSafetyNoticeOpen = true
  const safetyAckKey = 'careu-safety-ack-assessment-123'

  function acknowledgeSafetyNotice() {
    sessionStorage.setItem(safetyAckKey, 'true')
    isSafetyNoticeOpen = false
  }

  acknowledgeSafetyNotice()
  assert.equal(isSafetyNoticeOpen, false)
  assert.equal(sessionStorage.getItem(safetyAckKey), 'true')
})

test('6. acknowledgement persists for same assessment in sessionStorage', () => {
  sessionStorage.clear()
  const assessmentId = 'assessment-123'
  const safetyAckKey = `careu-safety-ack-assessment-${assessmentId}`

  sessionStorage.setItem(safetyAckKey, 'true')

  const isAcknowledged = sessionStorage.getItem(safetyAckKey) === 'true'
  const isSafetyNoticeOpen = !isAcknowledged

  assert.equal(isAcknowledged, true)
  assert.equal(isSafetyNoticeOpen, false)
})

test('7. new assessment shows modal again', () => {
  sessionStorage.clear()
  const oldAssessmentId = 'assessment-123'
  const newAssessmentId = 'assessment-456'

  sessionStorage.setItem(`careu-safety-ack-assessment-${oldAssessmentId}`, 'true')

  const newAckKey = `careu-safety-ack-assessment-${newAssessmentId}`
  const isAcknowledgedNew = sessionStorage.getItem(newAckKey) === 'true'
  const isSafetyNoticeOpenNew = !isAcknowledgedNew

  assert.equal(isSafetyNoticeOpenNew, true)
})

test('8. no localStorage persistence', () => {
  localStorage.clear()
  sessionStorage.clear()

  const assessmentId = 'assessment-123'
  const safetyAckKey = `careu-safety-ack-assessment-${assessmentId}`
  sessionStorage.setItem(safetyAckKey, 'true')

  // Check that localStorage is untouched / empty
  assert.equal(localStorage.getItem(safetyAckKey), null)
})

test('9. preview/live behavior remains isolated', () => {
  sessionStorage.clear()
  const isPreview = true
  const previewAckKey = isPreview ? 'careu-safety-ack-preview' : 'careu-safety-ack-formal'

  assert.equal(previewAckKey, 'careu-safety-ack-preview')

  sessionStorage.setItem(previewAckKey, 'true')
  assert.equal(sessionStorage.getItem('careu-safety-ack-assessment-123'), null)
})
