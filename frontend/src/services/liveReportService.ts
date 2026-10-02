import { getSupabaseClient, ensureAuthSession } from '../utils/supabaseClient.ts'

export interface NormalizedRecommendationItem {
  productId: number | string
  productName: string
  reason: string
  efficacy?: string
  efficacyClaim?: string
  evidenceType?: string
  activeIngredients?: string | null
  warnings?: string | null
  precautions?: string | null
  licenseNo?: string | null
  approvalDate?: string | null
  applicant?: string | null
  mechanismTag?: string | null
  evidenceScore?: number
  unitPrice?: number
}

export interface PriorityAlert {
  level: 'near' | 'urgent'
  label: string
  message: string
  sourceMetricCodes?: string[]
  sourceRuleKeys?: string[]
  sourceVerified?: boolean
}

export interface NormalizedPriorityItem {
  rank: number
  efficacyId?: number
  efficacyName: string
  score: number
  status?: string
  labScore?: number
  labMax?: number
  surveyScore?: number
  surveyMax?: number
  description?: string
  userCondition?: string | null
  evidenceItems?: string[]
  rec1Reason?: string | null
  rec2Reason?: string | null
  recommendations: NormalizedRecommendationItem[]
  exclusionNote?: string | null
  alert?: PriorityAlert | null
}

export interface NormalizedReportPayload {
  success: boolean
  submissionId: string
  assessmentId: string
  hasRedFlags: boolean
  priorities: NormalizedPriorityItem[]
}

export class LiveReportServiceError extends Error {
  code: string
  status?: number

  constructor(code: string, message: string, status?: number) {
    super(message)
    this.name = 'LiveReportServiceError'
    this.code = code
    this.status = status
  }
}

/**
 * CANONICAL_CANARY_ENDPOINTS
 * MERGE_PENDING_AFTER_LIVE_INTEGRATION
 */
export const REPORT_CANARY_ENDPOINTS = {
  FINALIZE_REPORT: 'finalize-health-report',
} as const

export class LiveReportService {
  async finalizeHealthReport(submissionId: string): Promise<NormalizedReportPayload> {
    if (!submissionId) {
      throw new LiveReportServiceError('INVALID_SUBMISSION_ID', '缺少有效的問卷提交代碼。')
    }

    try {
      await ensureAuthSession()
    } catch (authErr: any) {
      throw new LiveReportServiceError(
        'AUTH_SESSION_FAILED',
        '無法驗證會員或匿名認證階段，請重新整理頁面。'
      )
    }

    const client = getSupabaseClient()
    const { data, error } = await client.functions.invoke(REPORT_CANARY_ENDPOINTS.FINALIZE_REPORT, {
      body: { submissionId },
    })

    if (error) {
      const status = error?.status || error?.context?.status
      if (status === 401) {
        throw new LiveReportServiceError('UNAUTHORIZED', '認證無效或已過期，請重新整理。', 401)
      }
      if (status === 403) {
        throw new LiveReportServiceError('SUBMISSION_ACCESS_DENIED', '無權限存取此份問卷分析。', 403)
      }
      if (status === 404) {
        throw new LiveReportServiceError('SUBMISSION_NOT_FOUND', '找不到該筆問卷作答記錄。', 404)
      }
      throw new LiveReportServiceError(
        'REPORT_FINALIZATION_FAILED',
        error?.message || '分析整合失敗，請稍後重試。',
        status
      )
    }

    if (!data?.success || !data?.assessmentId || !Array.isArray(data?.priorities)) {
      throw new LiveReportServiceError(
        'REPORT_FINALIZATION_FAILED',
        '後端未回傳合規的報告資料。'
      )
    }

    return data as NormalizedReportPayload
  }
}

export const liveReportService = new LiveReportService()
