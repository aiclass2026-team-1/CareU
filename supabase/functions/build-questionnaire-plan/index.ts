import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { resolveAuthIdentity, validateReportOwnership } from '../_shared/auth.ts'
import { buildQuestionnairePlan, PlanBuilderError } from '../_shared/planBuilder.ts'
import type { BuildPlanRequest, TrustedReportContext, QuestionBankRow } from '../_shared/types.ts'

// Supabase client dynamic import / Deno compatibility
declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
  serve: (handler: (req: Request) => Promise<Response>) => void
}

export async function handleBuildPlan(req: Request, createClientOverride?: any): Promise<Response> {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Only POST is supported', 405)
  }

  let body: BuildPlanRequest
  try {
    body = await req.json()
  } catch {
    return errorResponse('INVALID_JSON', 'Invalid JSON payload', 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || serviceRoleKey

  if (!supabaseUrl || !serviceRoleKey) {
    // Fail closed if required Service Role configuration is unavailable
    return errorResponse('SERVER_CONFIG_ERROR', 'Supabase service role configuration required', 500)
  }

  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? ''
  
  // 1. Caller-authentication context client (passes user JWT for auth/identity verification)
  const authClient = createClientOverride
    ? createClientOverride(supabaseUrl, serviceRoleKey)
    : createClient(supabaseUrl, anonKey || serviceRoleKey, {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      })

  const authIdentity = await resolveAuthIdentity(req, authClient)

  // 2. Trusted backend database-read context client (Service Role, no caller Authorization override)
  const dbClient = createClientOverride
    ? createClientOverride(supabaseUrl, serviceRoleKey)
    : createClient(supabaseUrl, serviceRoleKey)

  let trustedContext: TrustedReportContext = {
    reportId: null,
    recognizedMetrics: [],
    missingMetrics: [],
  }

  if (body.mode === 'supplement') {
    if (!body.reportId) {
      return errorResponse('REPORT_REQUIRED', 'supplement mode requires a valid reportId', 400)
    }

    // Verify report existence, status and ownership in lab_reports using trusted dbClient
    const { data: report, error: reportErr } = await dbClient
      .from('lab_reports')
      .select('id, user_id, status, subject_gender, has_red_flags')
      .eq('id', body.reportId)
      .single()

    if (reportErr || !report) {
      return errorResponse('REPORT_NOT_FOUND', `Report '${body.reportId}' not found`, 404)
    }

    // Strict ownership: report.user_id must equal auth.uid()
    if (!report.user_id || report.user_id !== authIdentity.userId) {
      return errorResponse('REPORT_ACCESS_DENIED', 'Access denied to this report', 403)
    }

    // Require completed report status
    if (report.status !== 'completed') {
      return errorResponse('REPORT_NOT_COMPLETED', 'Report is not in completed status', 400)
    }

    // Trusted gender enforcement (Fail closed if not MALE or FEMALE)
    if (report.subject_gender !== 'MALE' && report.subject_gender !== 'FEMALE') {
      return errorResponse(
        'REPORT_GENDER_REQUIRED',
        `Report subject_gender '${report.subject_gender}' is missing or invalid`,
        422
      )
    }
    const trustedGender: 'MALE' | 'FEMALE' = report.subject_gender
    if (body.profile?.gender && body.profile.gender !== trustedGender) {
      return errorResponse(
        'PROFILE_REPORT_MISMATCH',
        `Profile gender '${body.profile.gender}' does not match report subject gender '${trustedGender}'`,
        400
      )
    }
    body.profile = { gender: trustedGender }

    // Query lab_report_metrics for recognized metrics using trusted dbClient
    const { data: metrics, error: metricsErr } = await dbClient
      .from('lab_report_metrics')
      .select('metric_code')
      .eq('report_id', body.reportId)

    if (metricsErr) {
      return errorResponse('DB_QUERY_FAILED', 'Failed to query report metrics', 500)
    }

    const recognizedCodes = (metrics || []).map((m: { metric_code: string }) => m.metric_code)

    // Query missing metrics from report_missing_core_metrics using trusted dbClient (bypassing caller-JWT RLS on core_metric_candidates)
    const { data: missingRows, error: missingErr } = await dbClient
      .from('report_missing_core_metrics')
      .select('missing_metric_code')
      .eq('report_id', body.reportId)

    if (missingErr) {
      return errorResponse('DB_QUERY_FAILED', 'Failed to query missing metrics', 500)
    }

    const missingCodes = (missingRows || [])
      .map((m: any) => m.missing_metric_code || m.metric_code || '')
      .filter(Boolean)

    trustedContext = {
      reportId: body.reportId,
      recognizedMetrics: recognizedCodes,
      missingMetrics: missingCodes,
    }


  }

  // Load active question_bank rows using trusted dbClient
  const { data: questionRows, error: qErr } = await dbClient
    .from('question_bank')
    .select('id, efficacy_id, efficacy_name, category, question_text, scoring_desc, applicable_gender, is_active, options_json, auto_map_field')
    .eq('is_active', true)

  if (qErr || !questionRows) {
    return errorResponse('DB_QUERY_FAILED', 'Failed to load question_bank rows', 500)
  }

  try {
    const plan = buildQuestionnairePlan(body, trustedContext, questionRows as QuestionBankRow[])
    return jsonResponse(plan, 200)
  } catch (err: any) {
    if (err instanceof PlanBuilderError) {
      return errorResponse(err.code, err.message, 400)
    }
    return errorResponse('PLAN_GENERATION_FAILED', err?.message || 'Plan generation failed', 500)
  }
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(async (req: Request) => {
    try {
      return await handleBuildPlan(req)
    } catch (err: any) {
      console.error('Unhandled build-plan exception:', err)
      return new Response(
        JSON.stringify({
          error: 'UNHANDLED_EXCEPTION',
          message: '系統發生未預期的錯誤，請稍後再試。',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  })
}
