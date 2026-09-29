import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { resolveAuthIdentity, validateReportOwnership } from '../_shared/auth.ts'
import { validateAndDeriveSubmission } from '../_shared/submissionValidator.ts'
import type { TargetQuestionnaireSubmissionPayload, QuestionBankRow } from '../_shared/types.ts'

declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
  serve: (handler: (req: Request) => Promise<Response>) => void
}

export async function handleSubmitQuestionnaire(req: Request, createClientOverride?: any): Promise<Response> {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Only POST is supported', 405)
  }

  let payload: TargetQuestionnaireSubmissionPayload
  try {
    payload = await req.json()
  } catch {
    return errorResponse('INVALID_JSON', 'Invalid JSON payload', 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseKey) {
    return errorResponse('SERVER_CONFIG_ERROR', 'Supabase environment variables not configured', 500)
  }

  const supabaseClient = createClientOverride
    ? createClientOverride(supabaseUrl, supabaseKey)
    : createClient(supabaseUrl, supabaseKey)

  const authIdentity = await resolveAuthIdentity(req, supabaseClient)

  // Validate reportId ownership if provided
  if (payload.reportId) {
    const { data: report, error: reportErr } = await supabaseClient
      .from('lab_reports')
      .select('id, user_id, session_id')
      .eq('id', payload.reportId)
      .single()

    if (reportErr || !report) {
      return errorResponse('REPORT_NOT_FOUND', `Report '${payload.reportId}' not found`, 404)
    }

    const ownership = validateReportOwnership(report, authIdentity)
    if (!ownership.allowed) {
      return errorResponse(ownership.code || 'REPORT_ACCESS_DENIED', ownership.message || 'Access denied', 403)
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

  // Validate answers and derive trusted scores/sources
  const validationResult = validateAndDeriveSubmission(payload, questionRows as QuestionBankRow[])
  if (!validationResult.valid || !validationResult.validatedAnswers) {
    return errorResponse(
      validationResult.error?.code || 'INVALID_SUBMISSION',
      validationResult.error?.message || 'Submission validation failed',
      400,
      validationResult.error?.questionId ? { questionId: validationResult.error.questionId } : undefined
    )
  }

  // Ensure minimal user_profiles row exists for any verified auth user (including Anonymous Auth)
  let submissionUserId: string | null = null
  if (authIdentity.userId) {
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .eq('id', authIdentity.userId)
      .maybeSingle()

    if (!profile) {
      await supabaseClient
        .from('user_profiles')
        .upsert(
          {
            id: authIdentity.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
    }
    submissionUserId = authIdentity.userId
  }

  // Insert into questionnaire_submissions
  // Note: CURRENT_MVP_DUPLICATES_POSSIBLE (idempotency token is not yet supported in current DB schema)
  const insertPayload = {
    user_id: submissionUserId,
    report_id: payload.reportId ?? null,
    session_id: authIdentity.sessionId ?? null,
    answers: validationResult.validatedAnswers,
    is_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data: inserted, error: insertErr } = await supabaseClient
    .from('questionnaire_submissions')
    .insert(insertPayload)
    .select('id')
    .single()

  if (insertErr || !inserted) {
    return errorResponse('PERSISTENCE_FAILED', insertErr?.message || 'Failed to persist submission', 500)
  }

  return jsonResponse(
    {
      success: true,
      submissionId: inserted.id,
    },
    201
  )
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(async (req: Request) => {
    try {
      return await handleSubmitQuestionnaire(req)
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
