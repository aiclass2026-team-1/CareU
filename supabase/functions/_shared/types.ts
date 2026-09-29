export interface TargetQuestionnairePlanOption {
  key: string | number
  label: string
  score: number
  exclusive?: boolean
  detailInput?: {
    required?: boolean
    placeholder?: string
  }
}

export interface TargetNumericConfig {
  unit?: string
  min?: number
  max?: number
  step?: number
  unknownOption?: {
    key: string | number
    label: string
  }
}

export interface TargetBpConfig {
  unit?: string
  systolicLabel?: string
  diastolicLabel?: string
  unknownOption?: {
    key: string | number
    label: string
  }
}

export type QuestionnaireControlType = 'single_choice' | 'multi_choice' | 'number' | 'text' | 'composite_bp'

export interface TargetQuestionnaireItemRuntime {
  id: number
  efficacyId: number
  efficacyName?: string
  category: string
  questionText: string
  scoringDesc?: string
  controlType: QuestionnaireControlType
  options: TargetQuestionnairePlanOption[]
  numericConfig?: TargetNumericConfig
  bpConfig?: TargetBpConfig
  required: boolean
  groupKey: string
  pageKey?: string
  layoutHint?: 'single' | 'pair_measurement' | 'pair_binary' | 'standalone'
  applicableGender: 'ALL' | 'MALE' | 'FEMALE'
  autoMapField?: string
  isActive: boolean
}


export interface TargetQuestionnairePlan {
  reportId: string | null
  mode: 'supplement' | 'full'
  recognizedMetrics: string[]
  missingMetrics: string[]
  questions: TargetQuestionnaireItemRuntime[]
}

export type QuestionnaireAnswerValue = string | number | (string | number)[]

export interface TargetQuestionnaireAnswerInput {
  questionId: number
  value: QuestionnaireAnswerValue
  detailText?: string
}

export interface TargetQuestionnaireSubmissionPayload {
  reportId: string | null
  mode: 'supplement' | 'full'
  answers: TargetQuestionnaireAnswerInput[]
  submittedAt: string
}

export interface BuildPlanRequest {
  reportId: string | null
  mode: 'full' | 'supplement'
  profile: {
    gender: 'MALE' | 'FEMALE'
  }
}

export interface TrustedReportContext {
  reportId: string | null
  recognizedMetrics: string[]
  missingMetrics: string[]
}

export interface QuestionBankRow {
  id: number
  efficacy_id: number
  efficacy_name?: string
  category: string
  question_text: string
  scoring_desc?: string
  applicable_gender: 'ALL' | 'MALE' | 'FEMALE'
  is_active: boolean
  options_json?: Array<{ label: string; score: number }>
  auto_map_field?: string | null
}

export interface PresentationItemConfig {
  controlType: QuestionnaireControlType
  required: boolean
  groupKey: string
  pageKey?: string
  layoutHint?: 'single' | 'pair_measurement' | 'pair_binary' | 'standalone'
  optionKeys?: (string | number)[]
  supplementMetrics?: string[]
  alwaysIncludeInSupplement?: boolean
  numericConfig?: TargetNumericConfig
  bpConfig?: TargetBpConfig
  exclusiveKeys?: (string | number)[]
  detailInputs?: Record<string, { required?: boolean; placeholder?: string }>
}



export interface PresentationConfig {
  version: number
  questionOrder: number[]
  items: Record<string, PresentationItemConfig>
}

export interface ValidatedAnswerRecord {
  question_id: number
  value: QuestionnaireAnswerValue
  score: number | null
  detail_text?: string
  source: 'USER_INPUT'
}

export interface SubmissionValidationResult {
  valid: boolean
  error?: {
    code: string
    message: string
    questionId?: number
  }
  validatedAnswers?: ValidatedAnswerRecord[]
}
