import type { TargetQuestionnairePlan, TargetQuestionnaireSubmissionPayload } from '../types/index.ts'
import { getSupabaseClient, ensureAuthSession } from '../utils/supabaseClient.ts'
import type { QuestionnaireService, GetPlanInput, SubmitAnswersResult } from './questionnaireService.ts'



/**
 * CANONICAL_CANARY_ENDPOINTS
 * MERGE_PENDING_AFTER_LIVE_INTEGRATION
 */
export const CANONICAL_CANARY_ENDPOINTS = {
  BUILD_PLAN: 'build-questionnaire-plan',
  SUBMIT_QUESTIONNAIRE: 'submit-questionnaire',
} as const

export class LiveQuestionnaireServiceError extends Error {
  code: string
  status?: number

  constructor(code: string, message: string, status?: number) {
    super(message)
    this.name = 'LiveQuestionnaireServiceError'
    this.code = code
    this.status = status
  }
}

function mapFunctionError(error: any, defaultCode: string): LiveQuestionnaireServiceError {
  const status = error?.status || error?.context?.status
  const errorMsg = error?.message || ''

  if (status === 401) {
    return new LiveQuestionnaireServiceError(
      'FUNCTION_UNAUTHORIZED',
      '認證已過期或無效，請重新整理頁面。',
      401
    )
  }

  if (status === 400 || errorMsg.includes('INVALID_OPTION') || errorMsg.includes('INVALID_SUBMISSION')) {
    return new LiveQuestionnaireServiceError(
      'INVALID_OPTION',
      '問卷作答內容格式不正確，請檢查後重試。',
      400
    )
  }

  if (status === 500 && defaultCode === 'PERSISTENCE_FAILED') {
    return new LiveQuestionnaireServiceError(
      'PERSISTENCE_FAILED',
      '儲存問卷作答失敗，請稍後再試。',
      500
    )
  }

  if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || error?.name === 'FunctionsFetchError') {
    return new LiveQuestionnaireServiceError(
      'NETWORK_ERROR',
      '網路連線異常，請確認網路後重試。',
      status
    )
  }

  if (defaultCode === 'PLAN_FETCH_FAILED') {
    return new LiveQuestionnaireServiceError(
      'PLAN_FETCH_FAILED',
      '無法取得問卷題目，請稍後再試。',
      status
    )
  }

  return new LiveQuestionnaireServiceError(
    defaultCode,
    '操作未完成，請稍後重試。',
    status
  )
}

export class LiveQuestionnaireService implements QuestionnaireService {
  async getPlan(input: GetPlanInput): Promise<TargetQuestionnairePlan> {
    try {
      await ensureAuthSession()
    } catch (authErr: any) {
      if (authErr?.message?.includes('LOCAL_ENV_SETUP_REQUIRED')) {
        throw new LiveQuestionnaireServiceError(
          'LOCAL_ENV_SETUP_REQUIRED',
          '環境設定尚未完成，請設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY。'
        )
      }
      throw new LiveQuestionnaireServiceError(
        'AUTH_SESSION_FAILED',
        '無法建立匿名認證階段，請重新整理頁面。'
      )
    }

    const client = getSupabaseClient()
    const { data, error } = await client.functions.invoke(CANONICAL_CANARY_ENDPOINTS.BUILD_PLAN, {
      body: {
        reportId: input.reportId ?? null,
        mode: input.mode,
        profile: input.profile ? { gender: input.profile.gender } : undefined,
      },
    })

    if (error) {
      throw mapFunctionError(error, 'PLAN_FETCH_FAILED')
    }

    if (!data || !Array.isArray(data.questions)) {
      throw new LiveQuestionnaireServiceError('PLAN_FETCH_FAILED', '無法取得問卷題目，請稍後再試。')
    }

    return data as TargetQuestionnairePlan
  }

  async submitAnswers(payload: TargetQuestionnaireSubmissionPayload): Promise<SubmitAnswersResult> {
    try {
      await ensureAuthSession()
    } catch (authErr: any) {
      if (authErr?.message?.includes('LOCAL_ENV_SETUP_REQUIRED')) {
        throw new LiveQuestionnaireServiceError(
          'LOCAL_ENV_SETUP_REQUIRED',
          '環境設定尚未完成，請設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY。'
        )
      }
      throw new LiveQuestionnaireServiceError(
        'AUTH_SESSION_FAILED',
        '無法建立匿名認證階段，請重新整理頁面。'
      )
    }

    const client = getSupabaseClient()
    const { data, error } = await client.functions.invoke(CANONICAL_CANARY_ENDPOINTS.SUBMIT_QUESTIONNAIRE, {
      body: {
        reportId: payload.reportId ?? null,
        mode: payload.mode,
        answers: payload.answers,
        submittedAt: payload.submittedAt || new Date().toISOString(),
      },
    })

    if (error) {
      throw mapFunctionError(error, 'PERSISTENCE_FAILED')
    }

    if (!data?.success || !data?.submissionId) {
      throw new LiveQuestionnaireServiceError('PERSISTENCE_FAILED', '儲存問卷作答失敗，請稍後再試。')
    }

    return {
      submissionId: data.submissionId,
    }
  }
}

export const liveQuestionnaireService = new LiveQuestionnaireService()
