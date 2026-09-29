import type {
  TargetQuestionnaireSubmissionPayload,
  QuestionBankRow,
  PresentationConfig,
  SubmissionValidationResult,
  ValidatedAnswerRecord,
} from './types.ts'
import { presentationConfigV1 } from './presentationConfig.ts'

export class SubmissionValidationError extends Error {
  code: string
  questionId?: number
  constructor(code: string, message: string, questionId?: number) {
    super(message)
    this.name = 'SubmissionValidationError'
    this.code = code
    this.questionId = questionId
  }
}

export function validateAndDeriveSubmission(
  payload: TargetQuestionnaireSubmissionPayload,
  questionBankRows: QuestionBankRow[],
  config: PresentationConfig = presentationConfigV1
): SubmissionValidationResult {
  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      error: { code: 'INVALID_REQUEST', message: 'Payload must be an object' },
    }
  }

  if (!['full', 'supplement'].includes(payload.mode)) {
    return {
      valid: false,
      error: { code: 'INVALID_MODE', message: 'mode must be full or supplement' },
    }
  }

  if (payload.mode === 'supplement' && (typeof payload.reportId !== 'string' || !payload.reportId.trim())) {
    return {
      valid: false,
      error: { code: 'REPORT_REQUIRED', message: 'supplement mode requires a valid reportId' },
    }
  }

  if (payload.mode === 'full' && payload.reportId !== null && payload.reportId !== undefined) {
    return {
      valid: false,
      error: { code: 'INVALID_REQUEST', message: 'full mode requires reportId=null' },
    }
  }

  if (!Array.isArray(payload.answers)) {
    return {
      valid: false,
      error: { code: 'INVALID_REQUEST', message: 'answers must be an array' },
    }
  }

  const rowsById = new Map(questionBankRows.map((r) => [r.id, r]))
  const validatedAnswers: ValidatedAnswerRecord[] = []
  const answeredQuestionIds = new Set<number>()

  for (const ans of payload.answers) {
    if (!ans || typeof ans.questionId !== 'number') {
      return {
        valid: false,
        error: { code: 'INVALID_QUESTION', message: 'answer must contain a valid numeric questionId' },
      }
    }

    if (answeredQuestionIds.has(ans.questionId)) {
      return {
        valid: false,
        error: {
          code: 'DUPLICATE_ANSWER',
          message: `question ${ans.questionId} answered multiple times in single submission`,
          questionId: ans.questionId,
        },
      }
    }
    answeredQuestionIds.add(ans.questionId)

    const question = rowsById.get(ans.questionId)
    const presentation = config.items[String(ans.questionId)]

    if (!question || !presentation) {
      return {
        valid: false,
        error: {
          code: 'INVALID_QUESTION',
          message: `question ${ans.questionId} does not exist or has no presentation config`,
          questionId: ans.questionId,
        },
      }
    }

    if (!question.is_active) {
      return {
        valid: false,
        error: {
          code: 'INACTIVE_QUESTION',
          message: `question ${ans.questionId} is inactive`,
          questionId: ans.questionId,
        },
      }
    }

    let derivedScore: number | null = null
    const bankOptions = question.options_json ?? []

    if (presentation.controlType === 'single_choice') {
      if (typeof ans.value !== 'string' && typeof ans.value !== 'number') {
        return {
          valid: false,
          error: {
            code: 'INVALID_VALUE',
            message: `single_choice question ${ans.questionId} requires string or number value`,
            questionId: ans.questionId,
          },
        }
      }

      const optIdx = presentation.optionKeys?.findIndex((k) => k === ans.value) ?? -1
      if (optIdx === -1) {
        return {
          valid: false,
          error: {
            code: 'INVALID_OPTION',
            message: `value '${ans.value}' is not a valid option key for question ${ans.questionId}`,
            questionId: ans.questionId,
          },
        }
      }

      derivedScore = bankOptions[optIdx]?.score ?? 0
    } else if (presentation.controlType === 'multi_choice') {
      if (!Array.isArray(ans.value)) {
        return {
          valid: false,
          error: {
            code: 'INVALID_VALUE',
            message: `multi_choice question ${ans.questionId} requires an array value`,
            questionId: ans.questionId,
          },
        }
      }

      if (presentation.required && ans.value.length === 0) {
        return {
          valid: false,
          error: {
            code: 'REQUIRED_FIELD_MISSING',
            message: `required multi_choice question ${ans.questionId} cannot be empty`,
            questionId: ans.questionId,
          },
        }
      }

      const exclusiveKeys = presentation.exclusiveKeys ?? []
      const selectedExclusive = ans.value.filter((k) => exclusiveKeys.includes(k))

      if (selectedExclusive.length > 0 && ans.value.length > 1) {
        return {
          valid: false,
          error: {
            code: 'EXCLUSIVE_CONFLICT',
            message: `exclusive option selected with other options on question ${ans.questionId}`,
            questionId: ans.questionId,
          },
        }
      }

      for (const valKey of ans.value) {
        const optIdx = presentation.optionKeys?.findIndex((k) => k === valKey) ?? -1
        if (optIdx === -1) {
          return {
            valid: false,
            error: {
              code: 'INVALID_OPTION',
              message: `value '${valKey}' is not a valid option key for question ${ans.questionId}`,
              questionId: ans.questionId,
            },
          }
        }

        const detailRule = presentation.detailInputs?.[String(valKey)]
        if (detailRule?.required && (!ans.detailText || !ans.detailText.trim())) {
          return {
            valid: false,
            error: {
              code: 'REQUIRED_DETAIL_MISSING',
              message: `option '${valKey}' on question ${ans.questionId} requires detailText`,
              questionId: ans.questionId,
            },
          }
        }
      }
      // Note: MULTI_SELECT_SCORE_RULE_UNRESOLVED - no authoritative aggregation rule (sum/avg/max) exists yet.
      // Preserving validated multiple semantic values and setting score = null.
      derivedScore = null
    } else if (presentation.controlType === 'number') {
      const isUnknown = presentation.numericConfig?.unknownOption?.key === ans.value

      if (isUnknown) {
        derivedScore = null
      } else {
        const numVal = typeof ans.value === 'number' ? ans.value : Number(ans.value)
        if (isNaN(numVal) || ans.value === '' || ans.value === null) {
          return {
            valid: false,
            error: {
              code: 'INVALID_VALUE',
              message: `number question ${ans.questionId} requires a valid numeric value or unknown option`,
              questionId: ans.questionId,
            },
          }
        }

        const numCfg = presentation.numericConfig
        if (numCfg?.min !== undefined && numVal < numCfg.min) {
          return {
            valid: false,
            error: {
              code: 'VALUE_OUT_OF_RANGE',
              message: `value ${numVal} is below min ${numCfg.min} for question ${ans.questionId}`,
              questionId: ans.questionId,
            },
          }
        }
        if (numCfg?.max !== undefined && numVal > numCfg.max) {
          return {
            valid: false,
            error: {
              code: 'VALUE_OUT_OF_RANGE',
              message: `value ${numVal} is above max ${numCfg.max} for question ${ans.questionId}`,
              questionId: ans.questionId,
            },
          }
        }

        derivedScore = null
      }
    } else if (presentation.controlType === 'composite_bp') {
      const isUnknown =
        presentation.bpConfig?.unknownOption?.key === ans.value || ans.value === 'unknown'

      if (isUnknown) {
        derivedScore = null
      } else {
        if (typeof ans.value !== 'string') {
          return {
            valid: false,
            error: {
              code: 'INVALID_VALUE',
              message: `composite_bp question ${ans.questionId} requires a string formatted value or unknown`,
              questionId: ans.questionId,
            },
          }
        }

        const trimmed = ans.value.trim()
        if (presentation.required && !trimmed) {
          return {
            valid: false,
            error: {
              code: 'REQUIRED_FIELD_MISSING',
              message: `required composite_bp question ${ans.questionId} cannot be empty`,
              questionId: ans.questionId,
            },
          }
        }

        const bpPattern = /^\s*(\d{1,3})\s*\/\s*(\d{1,3})\s*$/
        if (!bpPattern.test(trimmed)) {
          return {
            valid: false,
            error: {
              code: 'INVALID_VALUE',
              message: `composite_bp question ${ans.questionId} must contain a valid numeric SBP/DBP pair (e.g. 120/80) or unknown`,
              questionId: ans.questionId,
            },
          }
        }

        derivedScore = null
      }
    } else if (presentation.controlType === 'text') {

      if (typeof ans.value !== 'string') {
        return {
          valid: false,
          error: {
            code: 'INVALID_VALUE',
            message: `text question ${ans.questionId} requires a string value`,
            questionId: ans.questionId,
          },
        }
      }
      if (presentation.required && !ans.value.trim()) {
        return {
          valid: false,
          error: {
            code: 'REQUIRED_FIELD_MISSING',
            message: `required text question ${ans.questionId} cannot be empty`,
            questionId: ans.questionId,
          },
        }
      }
      derivedScore = null
    }

    validatedAnswers.push({
      question_id: ans.questionId,
      value: ans.value,
      score: derivedScore,
      ...(ans.detailText ? { detail_text: ans.detailText } : {}),
      source: 'USER_INPUT',
    })
  }

  return {
    valid: true,
    validatedAnswers,
  }
}

