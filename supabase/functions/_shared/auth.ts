export interface AuthIdentity {
  userId: string | null
  isGuest: boolean
  sessionId: string | null
  token: string | null
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization')
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

export function extractSessionId(req: Request): string | null {
  const sessionHeader = req.headers.get('x-session-id') ?? req.headers.get('X-Session-ID')
  if (sessionHeader && sessionHeader.trim()) {
    return sessionHeader.trim()
  }
  return null
}

export async function resolveAuthIdentity(
  req: Request,
  supabaseClient?: { auth: { getUser: (token: string) => Promise<{ data: { user: { id: string } | null }; error: unknown }> } }
): Promise<AuthIdentity> {
  const token = extractBearerToken(req)
  const sessionId = extractSessionId(req)

  if (!token) {
    return {
      userId: null,
      isGuest: true,
      sessionId,
      token: null,
    }
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.getUser(token)
      if (error || !data.user) {
        return {
          userId: null,
          isGuest: true,
          sessionId,
          token,
        }
      }
      return {
        userId: data.user.id,
        isGuest: false,
        sessionId,
        token,
      }
    } catch {
      return {
        userId: null,
        isGuest: true,
        sessionId,
        token,
      }
    }
  }

  return {
    userId: null,
    isGuest: true,
    sessionId,
    token,
  }
}

export interface ReportOwnershipResult {
  allowed: boolean
  code?: 'REPORT_ACCESS_DENIED' | 'GUEST_SESSION_AUTH_UNRESOLVED'
  message?: string
}

/**
 * Validates report ownership across authenticated and guest flows.
 * 
 * Rules:
 * 1. Authenticated user: report.user_id must match identity.userId.
 * 2. Authenticated user accessing unowned/unlinked report: rejected.
 * 3. Guest: cannot access authenticated user's report (report.user_id !== null).
 * 4. Guest accessing guest report (report.user_id === null):
 *    - If report has session_id, identity.sessionId must match report.session_id.
 *    - If no trusted signed session token mechanism exists or session_id does not match,
 *      fail closed with GUEST_SESSION_AUTH_UNRESOLVED / REPORT_ACCESS_DENIED.
 *    - Do NOT allow report.user_id IS NULL to mean "open to any guest".
 */
export function validateReportOwnership(
  report: { user_id: string | null; session_id?: string | null },
  identity: AuthIdentity
): ReportOwnershipResult {
  // Case A: Authenticated user
  if (!identity.isGuest && identity.userId) {
    if (report.user_id === identity.userId) {
      return { allowed: true }
    }
    return {
      allowed: false,
      code: 'REPORT_ACCESS_DENIED',
      message: 'You do not have permission to access this report',
    }
  }

  // Case B: Guest caller attempting to access an authenticated report
  if (report.user_id !== null) {
    return {
      allowed: false,
      code: 'REPORT_ACCESS_DENIED',
      message: 'This report belongs to an authenticated user and cannot be accessed as guest',
    }
  }

  // Case C: Guest caller accessing a guest report (report.user_id === null)
  // Must verify trusted session_id match.
  if (report.session_id && identity.sessionId && report.session_id === identity.sessionId) {
    return { allowed: true }
  }

  // If session matching fails or is not established:
  return {
    allowed: false,
    code: 'GUEST_SESSION_AUTH_UNRESOLVED',
    message: 'Guest session identity unresolved or does not match report session',
  }
}

