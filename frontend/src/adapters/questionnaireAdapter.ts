/**
 * Care U - Questionnaire Contract Adapter (Phase 7 Batch 2)
 *
 * 【職責與邊界】
 * 1. 本 Adapter 負責將後端頒發之 canonical `QuestionnairePlan` 轉換為前端 UI 可渲染之 ViewModel (`QuestionnairePlanViewModel`)。
 * 2. 負責將前端 UI 作答狀態轉換為合規之 `QuestionnaireSubmissionPayload` 與 `QuestionnaireAnswer[]`。
 * 3. 嚴格遵守：Frontend 不得自行過濾題目、不得自行覆寫 `OCR_AUTO` 來源、不呼叫 Supabase、不進行網路請求。
 */

import type {
  QuestionnairePlan,
  QuestionnaireItem,
  QuestionnaireOption,
  QuestionnaireAnswer,
  QuestionnaireSubmissionPayload,
  QuestionnaireAnswerValue,
} from '@/types'

export interface QuestionnaireViewOption {
  label: string
  score: number
  controlValue: string | number
}

export interface QuestionnaireViewItem {
  id: number
  efficacyId: number
  efficacyName?: string
  category: string
  questionText: string
  scoringDesc?: string
  options: QuestionnaireViewOption[]
  applicableGender: 'ALL' | 'MALE' | 'FEMALE'
  autoMapField?: string
  isActive: boolean
}

export interface QuestionnairePlanViewModel {
  reportId: string | null
  mode: 'supplement' | 'full'
  recognizedMetrics: string[]
  missingMetrics: string[]
  questions: QuestionnaireViewItem[]
}

/**
 * 將 Backend 頒發之 QuestionnairePlan 轉換為 UI View Model
 */
export function adaptQuestionnairePlan(plan: QuestionnairePlan): QuestionnairePlanViewModel {
  return {
    reportId: plan.reportId,
    mode: plan.mode,
    recognizedMetrics: [...plan.recognizedMetrics],
    missingMetrics: [...plan.missingMetrics],
    questions: plan.questions.map((item: QuestionnaireItem): QuestionnaireViewItem => ({
      id: item.id,
      efficacyId: item.efficacyId,
      efficacyName: item.efficacyName,
      category: item.category,
      questionText: item.questionText,
      scoringDesc: item.scoringDesc,
      options: item.options.map((opt: QuestionnaireOption, idx: number): QuestionnaireViewOption => ({
        label: opt.label,
        score: opt.score,
        controlValue: opt.value ?? idx,
      })),
      applicableGender: item.applicableGender,
      autoMapField: item.autoMapField,
      isActive: item.isActive,
    })),
  }
}

/**
 * 將 UI 收集之作答記錄轉換為合規之 QuestionnaireSubmissionPayload
 * 注意：Frontend 手動填答強制產生 source = 'USER_INPUT'；不允許 fallback 缺失分數為 0（必須提供有效 numeric score）。
 */
export function adaptAnswersToSubmission(
  reportId: string | null,
  mode: 'supplement' | 'full',
  rawAnswers: Record<number | string, { score: number; value?: QuestionnaireAnswerValue }>
): QuestionnaireSubmissionPayload {
  const answers: QuestionnaireAnswer[] = Object.entries(rawAnswers).map(([questionIdStr, data]) => {
    if (typeof data.score !== 'number' || isNaN(data.score)) {
      throw new Error(`Questionnaire answer for question ${questionIdStr} requires a valid numeric score.`)
    }
    return {
      questionId: Number(questionIdStr),
      score: data.score,
      source: 'USER_INPUT',
      value: data.value,
    }
  })

  return {
    reportId,
    mode,
    answers,
    submittedAt: new Date().toISOString(),
  }
}

/**
 * 用於驗證 Adapter 之最小 Development Fixture
 */
export function createMockQuestionnairePlanFixture(reportId: string | null = null, mode: 'supplement' | 'full' = 'full'): QuestionnairePlan {
  return {
    reportId,
    mode,
    recognizedMetrics: ['total_cholesterol', 'waist'],
    missingMetrics: ['fasting_glucose'],
    questions: [
      {
        id: 101,
        efficacyId: 1,
        efficacyName: '調節血脂',
        category: 'RISK_FACTOR',
        questionText: '平均每週紅肉或油炸食物攝取頻率？',
        scoringDesc: '0=低 1=中 2=偏高 3=高',
        options: [
          { label: '低 (0-1次/週)', score: 0, value: 'low' },
          { label: '中 (2-3次/週)', score: 1, value: 'medium' },
          { label: '偏高 (4-5次/週)', score: 2, value: 'high' },
          { label: '高 (6次以上/週)', score: 3, value: 'very_high' },
        ],
        applicableGender: 'ALL',
        autoMapField: 'diet_red_meat',
        isActive: true,
      },
    ],
  }
}
