import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync(new URL('./presentation-config.v1.json', import.meta.url), 'utf8'))

function requireGender(gender) {
  if (gender !== 'MALE' && gender !== 'FEMALE') {
    throw new TypeError('profile.gender must be MALE or FEMALE')
  }
}

function validateInput(request, trustedContext) {
  if (!request || !['full', 'supplement'].includes(request.mode)) {
    throw new TypeError('mode must be full or supplement')
  }
  requireGender(request.profile?.gender)

  if (request.mode === 'full' && request.reportId !== null) {
    throw new TypeError('full mode requires reportId=null')
  }
  if (request.mode === 'supplement' && typeof request.reportId !== 'string') {
    throw new TypeError('supplement mode requires a reportId')
  }
  if (!trustedContext || trustedContext.reportId !== request.reportId) {
    throw new TypeError('trusted report context does not match request reportId')
  }

  const recognized = trustedContext.recognizedMetrics ?? []
  const missing = trustedContext.missingMetrics ?? []
  if (!Array.isArray(recognized) || !Array.isArray(missing)) {
    throw new TypeError('trusted metric context must use arrays')
  }
  if (new Set([...recognized, ...missing]).size !== recognized.length + missing.length) {
    throw new TypeError('recognizedMetrics and missingMetrics must be unique and disjoint')
  }
}

function buildOptions(question, presentation) {
  if (presentation.controlType === 'number' || presentation.controlType === 'text') {
    return []
  }

  const bankOptions = question.options_json ?? []
  if (!Array.isArray(presentation.optionKeys) || presentation.optionKeys.length !== bankOptions.length) {
    throw new TypeError(`question ${question.id} optionKeys must match options_json length`)
  }

  return bankOptions.map((option, index) => ({
    key: presentation.optionKeys[index],
    label: option.label,
    score: option.score,
    ...(presentation.exclusiveKeys?.includes(presentation.optionKeys[index]) ? { exclusive: true } : {}),
    ...(presentation.detailInputs?.[presentation.optionKeys[index]]
      ? { detailInput: presentation.detailInputs[presentation.optionKeys[index]] }
      : {}),
  }))
}

export function buildQuestionnairePlan(request, trustedContext, questionBankRows) {
  validateInput(request, trustedContext)
  const rowsById = new Map(questionBankRows.map((row) => [row.id, row]))
  const recognized = trustedContext.recognizedMetrics ?? []
  const missing = trustedContext.missingMetrics ?? []

  const questions = config.questionOrder.flatMap((questionId) => {
    const presentation = config.items[String(questionId)]
    const question = rowsById.get(questionId)
    if (!presentation || !question) {
      throw new Error(`missing question_bank row or presentation config for question ${questionId}`)
    }
    if (!question.is_active) return []
    if (question.applicable_gender !== 'ALL' && question.applicable_gender !== request.profile.gender) return []

    if (request.mode === 'supplement') {
      const metricCodes = presentation.supplementMetrics ?? []
      if (metricCodes.length === 0 || !metricCodes.some((code) => missing.includes(code))) return []
    }

    const item = {
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
    return [item]
  })

  return {
    reportId: request.reportId,
    mode: request.mode,
    recognizedMetrics: [...recognized],
    missingMetrics: [...missing],
    questions,
  }
}