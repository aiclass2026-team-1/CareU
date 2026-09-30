import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { resolveAuthIdentity } from '../_shared/auth.ts'
import { deriveAssessmentInputs, mergeAssessmentItems, resolveEfficacyScore } from '../_shared/reportOrchestrator.ts'
import type { QuestionBankRow, ValidatedAnswerRecord } from '../_shared/types.ts'

declare const Deno: {
  env: {
    get: (key: string) => string | undefined
  }
  serve: (handler: (req: Request) => Promise<Response>) => void
}

interface FinalizeReportRequest {
  submissionId: string
}

export async function handleFinalizeHealthReport(req: Request, createClientOverride?: any): Promise<Response> {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Only POST is supported', 405)
  }

  let body: FinalizeReportRequest
  try {
    body = await req.json()
  } catch {
    return errorResponse('INVALID_JSON', 'Invalid JSON payload', 400)
  }

  if (!body.submissionId || typeof body.submissionId !== 'string') {
    return errorResponse('INVALID_REQUEST', 'submissionId is required', 400)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseKey) {
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

  if (!authIdentity.userId) {
    return errorResponse('UNAUTHORIZED', 'Valid user authentication required', 401)
  }

  // 1. Load submission and verify ownership (fail-closed)
  const { data: submission, error: subErr } = await supabaseClient
    .from('questionnaire_submissions')
    .select('id, user_id, report_id, answers, is_completed, created_at')
    .eq('id', body.submissionId)
    .single()

  if (subErr || !submission) {
    return errorResponse('SUBMISSION_NOT_FOUND', `Submission '${body.submissionId}' not found`, 404)
  }

  // Strict fail-closed rule: submission.user_id must exist and match caller auth.uid
  if (!submission.user_id || submission.user_id !== authIdentity.userId) {
    return errorResponse('SUBMISSION_ACCESS_DENIED', 'Access denied to this submission', 403)
  }

  let assessmentId: string | null = null
  let hasRedFlags = false

  // 2. Check for existing completed assessment owned by the caller (idempotency / duplicate protection)
  const { data: existingAssessment } = await supabaseClient
    .from('assessment_results')
    .select('id, submission_id, user_id, scores_json, top_efficacy_ids, has_red_flags, user_conditions, top_efficacies_detail')
    .eq('submission_id', submission.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingAssessment?.id && existingAssessment.user_id === authIdentity.userId) {
    assessmentId = existingAssessment.id
    hasRedFlags = Boolean(existingAssessment.has_red_flags)
  } else {
    // 3. Load active question_bank rows
    const { data: questionRows, error: qErr } = await supabaseClient
      .from('question_bank')
      .select('id, efficacy_id, efficacy_name, category, question_text, scoring_desc, applicable_gender, is_active, options_json, auto_map_field')
      .eq('is_active', true)

    if (qErr || !questionRows) {
      return errorResponse('DB_QUERY_FAILED', 'Failed to load question_bank rows', 500)
    }

    // 4. Derive trusted survey assessment inputs and safety context
    const answersList: ValidatedAnswerRecord[] = Array.isArray(submission.answers) ? submission.answers : []
    const derived = deriveAssessmentInputs(answersList, questionRows as QuestionBankRow[])

    let calculationItems = derived.items.filter(item => item.efficacyId > 0 && item.efficacyId <= 12)

    // 5. If submission is linked to a lab report, load and verify trusted lab data
    if (submission.report_id) {
      const { data: report, error: repErr } = await supabaseClient
        .from('lab_reports')
        .select('id, user_id, status, has_red_flags')
        .eq('id', submission.report_id)
        .single()

      if (repErr || !report) {
        return errorResponse('REPORT_NOT_FOUND', `Report '${submission.report_id}' not found`, 404)
      }

      if (!report.user_id || report.user_id !== authIdentity.userId) {
        return errorResponse('REPORT_ACCESS_DENIED', 'Access denied to this report', 403)
      }

      hasRedFlags = Boolean(report.has_red_flags)

      // Load trusted efficacy lab scores
      const { data: labScores } = await supabaseClient
        .from('report_efficacy_lab_scores')
        .select('efficacy_name, lab_earned_score, lab_max_score')
        .eq('report_id', submission.report_id)

      if (Array.isArray(labScores) && labScores.length > 0) {
        calculationItems = mergeAssessmentItems(calculationItems, labScores, questionRows as QuestionBankRow[]).filter(item => item.efficacyId > 0 && item.efficacyId <= 12)
      }
    }


    // 6. Invoke calculate-efficacy-scores forwarding verified caller JWT
    try {
      const calcResp = await fetch(`${supabaseUrl}/functions/v1/calculate-efficacy-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          items: calculationItems,
          userConditions: derived.userConditions,
          labWeight: 0.6,
          surveyWeight: 0.4,
          submissionId: submission.id,
          userId: authIdentity.userId,
          hasRedFlags,
        }),
      })

      if (!calcResp.ok) {
        const calcErrText = await calcResp.text()
        return errorResponse('ASSESSMENT_CALCULATION_FAILED', `Assessment calculation failed: ${calcErrText}`, 500)
      }

      const calcData = await calcResp.json()
      if (!calcData.success || !calcData.assessmentId) {
        return errorResponse('ASSESSMENT_CALCULATION_FAILED', 'Assessment calculation returned unsuccessful', 500)
      }
      assessmentId = calcData.assessmentId
    } catch (calcErr: any) {
      return errorResponse('ASSESSMENT_CALCULATION_FAILED', calcErr?.message || 'Assessment calculation error', 500)
    }

    // 7. Invoke recommend only when no red flags are present
    if (!hasRedFlags) {
      try {
        const recResp = await fetch(`${supabaseUrl}/functions/v1/recommend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
          body: JSON.stringify({
            assessment_id: assessmentId,
          }),
        })

        if (!recResp.ok) {
          console.warn(`Recommend warning status: ${recResp.status}`)
        }
      } catch (recErr: any) {
        console.warn('Recommend invoke error:', recErr)
      }
    }
  }

  // 8. Load final trusted data from assessment_results, assessment_efficacy_ranks, and health_food_products
  const { data: assessmentData } = await supabaseClient
    .from('assessment_results')
    .select('id, scores_json, top_efficacy_ids, has_red_flags, user_conditions, top_efficacies_detail')
    .eq('id', assessmentId)
    .single()

  const { data: rankRows, error: rankErr } = await supabaseClient
    .from('assessment_efficacy_ranks')
    .select('id, efficacy_name, efficacy_rank, description, user_condition, rec1_product_id, rec1_reason, rec2_product_id, rec2_reason, exclusion_note')
    .eq('assessment_id', assessmentId)
    .order('efficacy_rank', { ascending: true })

  if (rankErr || !rankRows) {
    return errorResponse('DB_QUERY_FAILED', 'Failed to load assessment ranks', 500)
  }

  // Gather referenced product IDs
  const productIds = new Set<number>()
  for (const r of rankRows) {
    if (r.rec1_product_id) productIds.add(Number(r.rec1_product_id))
    if (r.rec2_product_id) productIds.add(Number(r.rec2_product_id))
  }

  let productsMap = new Map<number, any>()
  if (productIds.size > 0) {
    const { data: products } = await supabaseClient
      .from('health_food_products')
      .select('id, product_name, license_no, category, active_ingredients, efficacy, efficacy_claim, warnings, precautions, mechanism_tag, evidence_score')
      .in('id', Array.from(productIds))

    if (products) {
      for (const p of products) {
        productsMap.set(Number(p.id), p)
      }
    }
  }

  const topEfficaciesDetail = assessmentData?.top_efficacies_detail || []
  const scoresJson = assessmentData?.scores_json || {}

  // 9. Build normalized report response (exact authoritative scores, no 85 fallback)
  const priorities: any[] = []
  for (const row of rankRows) {
    const matchedDetail = topEfficaciesDetail.find(
      (item: any) =>
        item &&
        item.rank === row.efficacy_rank &&
        item.name === row.efficacy_name
    )

    if (!matchedDetail || typeof matchedDetail.id !== 'number' || matchedDetail.id <= 0 || matchedDetail.id > 12) {
      console.warn(`[RPT-01 Fail-Closed] Efficacy ID exact matching failed for rank ${row.efficacy_rank} (${row.efficacy_name}). Excluding invalid priority from report payload.`)
      continue
    }

    const efficacyId = matchedDetail.id

    const recs: any[] = []
    if (row.rec1_product_id && productsMap.has(Number(row.rec1_product_id))) {
      const p = productsMap.get(Number(row.rec1_product_id))
      recs.push({
        productId: p.id,
        productName: p.product_name,
        reason: row.rec1_reason || p.efficacy_claim || '',
        efficacyClaim: p.efficacy_claim,
        warnings: p.warnings,
        precautions: p.precautions,
        mechanismTag: p.mechanism_tag,
        evidenceScore: p.evidence_score,
      })
    }
    if (row.rec2_product_id && productsMap.has(Number(row.rec2_product_id))) {
      const p = productsMap.get(Number(row.rec2_product_id))
      recs.push({
        productId: p.id,
        productName: p.product_name,
        reason: row.rec2_reason || p.efficacy_claim || '',
        efficacyClaim: p.efficacy_claim,
        warnings: p.warnings,
        precautions: p.precautions,
        mechanismTag: p.mechanism_tag,
        evidenceScore: p.evidence_score,
      })
    }

    const resolvedScore = typeof matchedDetail.score === 'number' && !isNaN(matchedDetail.score)
      ? Math.round(matchedDetail.score)
      : resolveEfficacyScore(row, topEfficaciesDetail, scoresJson)

    priorities.push({
      rank: row.efficacy_rank,
      efficacyId,
      efficacyName: row.efficacy_name,
      score: resolvedScore,
      description: row.description || '',
      userCondition: row.user_condition || null,
      recommendations: recs,
      exclusionNote: row.exclusion_note || null,
    })
  }

  return jsonResponse(
    {
      success: true,
      submissionId: submission.id,
      assessmentId,
      hasRedFlags: Boolean(assessmentData?.has_red_flags),
      priorities,
    },
    200
  )
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(async (req: Request) => {
    try {
      return await handleFinalizeHealthReport(req)
    } catch (err: any) {
      console.error('Unhandled finalize exception:', err)
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

