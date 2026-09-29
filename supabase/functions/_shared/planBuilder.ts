import type {
  BuildPlanRequest,
  TrustedReportContext,
  QuestionBankRow,
  PresentationConfig,
  TargetQuestionnairePlan,
  TargetQuestionnaireItemRuntime,
  TargetQuestionnairePlanOption,
} from './types.ts'
import { presentationConfigV1 } from './presentationConfig.ts'

export class PlanBuilderError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.name = 'PlanBuilderError'
    this.code = code
  }
}

export function validatePlanRequest(request: BuildPlanRequest, trustedContext: TrustedReportContext): void {
  if (!request || !['full', 'supplement'].includes(request.mode)) {
    throw new PlanBuilderError('INVALID_MODE', 'mode must be full or supplement')
  }

  if (request.profile?.gender !== 'MALE' && request.profile?.gender !== 'FEMALE') {
    throw new PlanBuilderError('INVALID_PROFILE', 'profile.gender must be MALE or FEMALE')
  }

  if (request.mode === 'full' && request.reportId !== null) {
    throw new PlanBuilderError('INVALID_REQUEST', 'full mode requires reportId=null')
  }

  if (request.mode === 'supplement' && (typeof request.reportId !== 'string' || !request.reportId.trim())) {
    throw new PlanBuilderError('REPORT_REQUIRED', 'supplement mode requires a valid reportId')
  }

  if (!trustedContext || trustedContext.reportId !== request.reportId) {
    throw new PlanBuilderError('REPORT_CONTEXT_MISMATCH', 'trusted report context does not match request reportId')
  }

  const recognized = trustedContext.recognizedMetrics ?? []
  const missing = trustedContext.missingMetrics ?? []
  if (!Array.isArray(recognized) || !Array.isArray(missing)) {
    throw new PlanBuilderError('INVALID_METRIC_CONTEXT', 'trusted metric context must use arrays')
  }

  const combined = [...recognized, ...missing]
  if (new Set(combined).size !== combined.length) {
    throw new PlanBuilderError('INVALID_METRIC_CONTEXT', 'recognizedMetrics and missingMetrics must be unique and disjoint')
  }
}

function buildOptions(
  question: QuestionBankRow,
  presentation: PresentationConfig['items'][string]
): TargetQuestionnairePlanOption[] {
  if (presentation.controlType === 'number' || presentation.controlType === 'text') {
    return []
  }

  const bankOptions = question.options_json ?? []
  if (!Array.isArray(presentation.optionKeys) || presentation.optionKeys.length !== bankOptions.length) {
    throw new PlanBuilderError(
      'PLAN_GENERATION_FAILED',
      `question ${question.id} optionKeys must match options_json length`
    )
  }

  return bankOptions.map((option, index) => {
    const key = presentation.optionKeys![index]
    const opt: TargetQuestionnairePlanOption = {
      key,
      label: option.label,
      score: option.score,
    }
    if (presentation.exclusiveKeys?.includes(key)) {
      opt.exclusive = true
    }
    if (presentation.detailInputs?.[String(key)]) {
      opt.detailInput = presentation.detailInputs[String(key)]
    }
    return opt
  })
}

export function buildQuestionnairePlan(
  request: BuildPlanRequest,
  trustedContext: TrustedReportContext,
  questionBankRows: QuestionBankRow[],
  config: PresentationConfig = presentationConfigV1
): TargetQuestionnairePlan {
  validatePlanRequest(request, trustedContext)

  const rowsById = new Map(questionBankRows.map((row) => [row.id, row]))
  const recognized = trustedContext.recognizedMetrics ?? []
  const missing = trustedContext.missingMetrics ?? []

  const questions: TargetQuestionnaireItemRuntime[] = []

  for (const questionId of config.questionOrder) {
    const presentation = config.items[String(questionId)]
    const question = rowsById.get(questionId)

    if (!presentation || !question) {
      throw new PlanBuilderError(
        'PLAN_GENERATION_FAILED',
        `missing question_bank row or presentation config for question ${questionId}`
      )
    }

    if (!question.is_active) continue
    if (question.applicable_gender !== 'ALL' && question.applicable_gender !== request.profile.gender) continue

    if (request.mode === 'supplement') {
      const metricCodes = presentation.supplementMetrics ?? []
      if (metricCodes.length === 0 || !metricCodes.some((code) => missing.includes(code))) {
        continue
      }
    }

    const item: TargetQuestionnaireItemRuntime = {
      id: question.id,
      efficacyId: question.efficacy_id,
      ...(question.efficacy_name ? { efficacyName: question.efficacy_name } : {}),
      category: question.category,
      questionText: question.question_text,
      ...(question.scoring_desc ? { scoringDesc: question.scoring_desc } : {}),
      controlType: presentation.controlType,
      options: buildOptions(question, presentation),
      ...(presentation.numericConfig ? { numericConfig: presentation.numericConfig } : {}),
      required: presentation.required,
      groupKey: presentation.groupKey,
      applicableGender: question.applicable_gender,
      ...(question.auto_map_field ? { autoMapField: question.auto_map_field } : {}),
      isActive: question.is_active,
    }

    questions.push(item)
  }

  return {
    reportId: request.reportId,
    mode: request.mode,
    recognizedMetrics: [...recognized],
    missingMetrics: [...missing],
    questions,
  }
}
