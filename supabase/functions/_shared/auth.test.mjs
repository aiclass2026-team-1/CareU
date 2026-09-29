import assert from 'node:assert/strict'
import test from 'node:test'
import { validateReportOwnership, extractBearerToken, extractSessionId } from './auth.ts'

test('auth: extracts Bearer token and session ID correctly', () => {
  const reqWithBearer = new Request('http://localhost', {
    headers: {
      Authorization: 'Bearer test-jwt-token-123',
      'x-session-id': 'guest-session-abc',
    },
  })
  assert.equal(extractBearerToken(reqWithBearer), 'test-jwt-token-123')
  assert.equal(extractSessionId(reqWithBearer), 'guest-session-abc')

  const reqWithoutAuth = new Request('http://localhost')
  assert.equal(extractBearerToken(reqWithoutAuth), null)
  assert.equal(extractSessionId(reqWithoutAuth), null)
})

test('auth: allows authenticated user with matching report.user_id', () => {
  const identity = {
    userId: 'user-uuid-111',
    isGuest: false,
    sessionId: null,
    token: 'valid-token',
  }
  const report = {
    user_id: 'user-uuid-111',
    session_id: null,
  }
  const result = validateReportOwnership(report, identity)
  assert.equal(result.allowed, true)
})

test('auth: rejects authenticated user with mismatched report.user_id', () => {
  const identity = {
    userId: 'user-uuid-111',
    isGuest: false,
    sessionId: null,
    token: 'valid-token',
  }
  const report = {
    user_id: 'user-uuid-999',
    session_id: null,
  }
  const result = validateReportOwnership(report, identity)
  assert.equal(result.allowed, false)
  assert.equal(result.code, 'REPORT_ACCESS_DENIED')
})

test('auth: rejects guest accessing authenticated user report', () => {
  const identity = {
    userId: null,
    isGuest: true,
    sessionId: 'guest-session-123',
    token: null,
  }
  const report = {
    user_id: 'user-uuid-111',
    session_id: null,
  }
  const result = validateReportOwnership(report, identity)
  assert.equal(result.allowed, false)
  assert.equal(result.code, 'REPORT_ACCESS_DENIED')
})

test('auth: rejects guest report access when session is missing or unverified (GUEST_SESSION_AUTH_UNRESOLVED)', () => {
  const identity = {
    userId: null,
    isGuest: true,
    sessionId: null,
    token: null,
  }
  const report = {
    user_id: null,
    session_id: 'report-session-456',
  }
  const result = validateReportOwnership(report, identity)
  assert.equal(result.allowed, false)
  assert.equal(result.code, 'GUEST_SESSION_AUTH_UNRESOLVED')
})

test('auth: does NOT allow report.user_id === null to mean open to any guest without session match', () => {
  const identity = {
    userId: null,
    isGuest: true,
    sessionId: 'wrong-session-789',
    token: null,
  }
  const report = {
    user_id: null,
    session_id: 'report-session-456',
  }
  const result = validateReportOwnership(report, identity)
  assert.equal(result.allowed, false)
  assert.equal(result.code, 'GUEST_SESSION_AUTH_UNRESOLVED')
})

test('auth: allows guest report access when trusted session matches report session', () => {
  const identity = {
    userId: null,
    isGuest: true,
    sessionId: 'matching-session-456',
    token: null,
  }
  const report = {
    user_id: null,
    session_id: 'matching-session-456',
  }
  const result = validateReportOwnership(report, identity)
  assert.equal(result.allowed, true)
})
