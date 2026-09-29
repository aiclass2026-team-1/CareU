import { getSupabaseClient, ensureAuthSession } from '../utils/supabaseClient.ts'

export interface LiveHealthReportParseResult {
  success: boolean
  reportId: string
  metricsCount: number
  missingMetrics: string[]
  requiresQuestionnaire?: boolean
  hasRedFlags: boolean
  subjectGender?: string
  triggeredRuleCount?: number
  warningMessages?: string[]
  parsedData?: any
}

export class LiveHealthReportServiceError extends Error {
  code: string
  status?: number

  constructor(code: string, message: string, status?: number) {
    super(message)
    this.name = 'LiveHealthReportServiceError'
    this.code = code
    this.status = status
  }
}

export const HEALTH_REPORT_ENDPOINTS = {
  PARSE_HEALTH_REPORT: 'parse-health-report',
  STORAGE_BUCKET: 'health-reports',
} as const

export class LiveHealthReportService {
  async uploadAndParseReport(file: File): Promise<LiveHealthReportParseResult> {
    if (!file) {
      throw new LiveHealthReportServiceError('INVALID_FILE', '未選擇有效的健檢檔案。')
    }

    // 1. Ensure/reuse Supabase Anonymous Auth session
    let authSession: { token: string; userId: string }
    try {
      authSession = await ensureAuthSession()
    } catch (authErr: any) {
      throw new LiveHealthReportServiceError(
        'AUTH_SESSION_FAILED',
        '無法建立認證階段，請重新整理頁面。'
      )
    }

    const client = getSupabaseClient()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${authSession.userId}/${Date.now()}_${sanitizedName}`

    // 2. Upload file into health-reports bucket
    const { error: uploadErr } = await client.storage
      .from(HEALTH_REPORT_ENDPOINTS.STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      })

    if (uploadErr) {
      throw new LiveHealthReportServiceError(
        'UPLOAD_FAILED',
        `健檢檔案上傳失敗：${uploadErr.message || '請確認檔案格式後重試。'}`
      )
    }

    // 3. Invoke parse-health-report
    const { data, error: fnErr } = await client.functions.invoke(
      HEALTH_REPORT_ENDPOINTS.PARSE_HEALTH_REPORT,
      {
        body: { filePath },
      }
    )

    if (fnErr) {
      const status = fnErr?.status || fnErr?.context?.status
      throw new LiveHealthReportServiceError(
        'OCR_PARSE_FAILED',
        fnErr?.message || '健康檢查報告解析失敗，請重新上傳或直接填寫問卷。',
        status
      )
    }

    if (!data?.success || !data?.reportId) {
      throw new LiveHealthReportServiceError(
        'OCR_PARSE_FAILED',
        data?.error || '健康檢查報告無法辨識出有效數據，請直接填寫問卷。'
      )
    }

    return data as LiveHealthReportParseResult
  }
}

export const liveHealthReportService = new LiveHealthReportService()
