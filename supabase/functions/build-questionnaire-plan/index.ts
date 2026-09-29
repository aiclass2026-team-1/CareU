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
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseKey) {
    // If running in an environment without Supabase credentials, fail closed
    return errorResponse('SERVER_CONFIG_ERROR', 'Supabase environment variables not configured', 500)
  }

  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization') ?? ''
  const supabaseClient = createClientOverride
    ? createClientOverride(supabaseUrl, supabaseKey)
    : createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      })

  const authIdentity = await resolveAuthIdentity(req, supabaseClient)

  let trustedContext: TrustedReportContext = {
    reportId: null,
    recognizedMetrics: [],
    missingMetrics: [],
  }

  if (body.mode === 'supplement') {
    if (!body.reportId) {
      return errorResponse('REPORT_REQUIRED', 'supplement mode requires a valid reportId', 400)
    }

    // Verify report existence and ownership in lab_reports
    const { data: report, error: reportErr } = await supabaseClient
      .from('lab_reports')
      .select('id, user_id, session_id, status')
      .eq('id', body.reportId)
      .single()

    if (reportErr || !report) {
      return errorResponse('REPORT_NOT_FOUND', `Report '${body.reportId}' not found`, 404)
    }

    const ownership = validateReportOwnership(report, authIdentity)
    if (!ownership.allowed) {
      return errorResponse(ownership.code || 'REPORT_ACCESS_DENIED', ownership.message || 'Access denied', 403)
    }

    // Query lab_report_metrics for recognized metrics
    const { data: metrics, error: metricsErr } = await supabaseClient
      .from('lab_report_metrics')
      .select('metric_code')
      .eq('report_id', body.reportId)

    if (metricsErr) {
      return errorResponse('DB_QUERY_FAILED', 'Failed to query report metrics', 500)
    }

    const recognizedCodes = (metrics || []).map((m: { metric_code: string }) => m.metric_code)
    // Note: Missing metrics are defined by the required domain metric set not present in recognizedCodes
    trustedContext = {
      reportId: body.reportId,
      recognizedMetrics: recognizedCodes,
      missingMetrics: [], // Populated by domain missing resolver where applicable
    }
  }

  // Load active question_bank rows
  const { data: questionRows, error: qErr } = await supabaseClient
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
      return new Response(
        JSON.stringify({
          error: 'UNHANDLED_EXCEPTION',
          message: err?.message || String(err),
          stack: err?.stack,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  })
}
