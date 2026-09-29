/**
 * Care U - Phase 7 Backend & Frontend Data Contract Types
 *
 * 【邊界聲明】
 * 1. 本檔案定義正式後端 API 契約、Edge Function 請求/回應與領域模型型別。
 * 2. 嚴禁在此加入前端 UI 展示專屬欄位（如 summaryPublic, summaryMember, doseTone 等）。
 * 3. 嚴格區分 CURRENT (現行 v1 生產基線) 與 TARGET (未來目標合約)。
 */

// ==========================================
// 1. Metric Code Classifications
// ==========================================

/** parse-health-report v1 專用 Core 11 指標（用於 OCR 完整性與缺漏判定） */
export type ParseCoreMetricKey =
  | 'height'
  | 'weight'
  | 'waist'
  | 'sbp'
  | 'dbp'
  | 'fasting_glucose'
  | 'alt'
  | 'total_cholesterol'
  | 'tg'
  | 'hb'
  | 'wbc'

/** 12 項保健功效與問卷領域對應之完整指標代碼 */
export type EfficacyMetricCode =
  | 'CHOL_TOTAL'
  | 'TG'
  | 'LDL_C'
  | 'HDL_C'
  | 'GOT_AST'
  | 'GPT_ALT'
  | 'GGT'
  | 'WBC'
  | 'CRP'
  | 'CA'
  | 'ALP'
  | 'BMI'
  | 'BODYFAT'
  | 'WAIST'
  | 'HB'
  | 'RBC'
  | 'GLU_AC'
  | 'HBA1C'
  | 'FE'
  | 'FERRITIN'
  | 'SBP'
  | 'DBP'

// ==========================================
// 2. Edge Function: parse-health-report Contracts (CURRENT V1)
// ==========================================

export interface CurrentParseHealthReportRequestV1 {
  filePath: string
  userId?: string // CURRENT: legacy / untrusted caller-provided identity field
}

export interface CurrentParseHealthReportResponseV1 {
  success: boolean
  reportId: string
  metricsCount: number
  isBelowThreshold: boolean
  missingMetrics: ParseCoreMetricKey[]
  hasRedFlags: boolean
  parsedData: unknown
}

// ==========================================
// 3. Edge Function: calculate-efficacy-scores Contracts (CURRENT V1)
// ==========================================

export interface EfficacyScoreInputItem {
  efficacyId: string
  efficacyName: string
  labScore: number
  labMax: number
  surveyScore: number
  surveyMax: number
}

/** CURRENT: Legacy V1 Request allowing caller-controllable weights */
export interface CurrentCalculateEfficacyScoresRequestV1 {
  items: EfficacyScoreInputItem[]
  labWeight?: number
  surveyWeight?: number
}

export interface CurrentEfficacyScoreResultItemV1 {
  efficacyId: string
  efficacyName: string
  score: number
  labScore: number
  surveyScore: number
}

export interface CurrentCalculateEfficacyScoresResponseV1 {
  method: string
  weights: {
    lab: number
    survey: number
  }
  topPriorities: string[]
  allResults: CurrentEfficacyScoreResultItemV1[]
}

// ==========================================
// 4. Questionnaire Domain Contracts (CURRENT / TARGET)
// ==========================================

export type QuestionnaireCategory =
  | 'VERIFIED_SCALE'
  | 'RISK_FACTOR'
  | 'OBJECTIVE_VALUE'
  | 'CONTRAINDICATION'

export type QuestionnaireGender = 'ALL' | 'MALE' | 'FEMALE'

export type QuestionnaireAnswerSource = 'OCR_AUTO' | 'USER_INPUT'

export interface QuestionnaireOption {
  label: string
  score: number
  value?: string | number
}

export interface QuestionnaireItem {
  id: number // question_bank id (integer)
  efficacyId: number // question_bank efficacy_id (integer, non-null)
  efficacyName?: string
  category: QuestionnaireCategory
  questionText: string
  scoringDesc?: string
  options: QuestionnaireOption[]
  applicableGender: QuestionnaireGender
  autoMapField?: string
  isActive: boolean
}

export interface QuestionnairePlan {
  reportId: string | null // Nullable for direct full questionnaire flow without health report
  mode: 'supplement' | 'full'
  recognizedMetrics: string[]
  missingMetrics: string[]
  questions: QuestionnaireItem[]
}

export type QuestionnaireAnswerValue = string | number | string[]

export interface QuestionnaireAnswer {
  questionId: number // questionnaire_submissions.answers question_id (integer)
  score: number // Required score; missing scores are invalid
  source: QuestionnaireAnswerSource
  value?: QuestionnaireAnswerValue
}

export interface QuestionnaireSubmissionPayload {
  reportId: string | null
  mode: 'supplement' | 'full'
  answers: QuestionnaireAnswer[]
  submittedAt: string
}

// ==========================================
// 5. Assessment Entities (CURRENT DB Schema vs TARGET Orchestration)
// ==========================================

/** CURRENT: Supabase actual table row entity: assessment_results */
export interface CurrentAssessmentResultEntity {
  id: string
  submissionId: string | null
  userId: string | null
  scoresJson: unknown
  topEfficacyIds: string[]
  recommendedProductIds: string[]
  hasRedFlags: boolean
  userConditions: unknown
  topEfficaciesDetail: unknown
  createdAt: string
}

/** CURRENT: Supabase actual table row entity: assessment_efficacy_ranks */
export interface CurrentAssessmentEfficacyRank {
  id: string
  assessmentId: string
  efficacyName: string
  efficacyRank: number
  userCondition: string | null
  createdAt: string
}

/** TARGET: Assessment Orchestrator Request */
export interface TargetSubmitAssessmentRequest {
  reportId?: string | null
  submissionId?: string
  answers?: QuestionnaireAnswer[]
}

/** TARGET: Assessment Orchestrator Response */
export interface TargetSubmitAssessmentResponse {
  success: boolean
  assessmentId: string
}

// ==========================================
// 6. Product Contracts (CURRENT Partially Verified vs TARGET)
// ==========================================

/** CURRENT / EXISTS / SCHEMA_PARTIALLY_VERIFIED: public.health_food_products verified columns */
export interface CurrentHealthFoodProductEntity {
  licenseNo: string // license_no
  category: string // category
  productName: string // product_name
  approvalDate: string // approval_date
  applicant: string // applicant
  status: string // status
}

/** TARGET: Full extended product attributes (SCHEMA_UNVERIFIED / TARGET) */
export interface TargetHealthFoodProductModel extends CurrentHealthFoodProductEntity {
  efficacy?: string
  efficacyClaim?: string
  mechanismTag?: string | null
  evidenceScore?: number
  contraindicatedPregnant?: boolean
  contraindicatedBreastfeeding?: boolean
  contraindicatedAllergy?: boolean
}
