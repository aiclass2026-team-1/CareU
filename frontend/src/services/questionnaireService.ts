import type { TargetQuestionnairePlan, TargetQuestionnaireSubmissionPayload } from '@/types'

export type QuestionnaireRequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface GetPlanInput {
  reportId?: string | null
  mode: 'full' | 'supplement'
}

export interface QuestionnaireService {
  getPlan(input: GetPlanInput): Promise<TargetQuestionnairePlan>
  submitAnswers(payload: TargetQuestionnaireSubmissionPayload): Promise<void>
}
