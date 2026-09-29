import type { TargetQuestionnairePlan, TargetQuestionnaireSubmissionPayload } from '@/types'

export type QuestionnaireRequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface GetPlanInput {
  reportId?: string | null
  mode: 'full' | 'supplement'
  profile?: {
    gender: 'MALE' | 'FEMALE'
  }
}

export interface SubmitAnswersResult {
  submissionId: string | null
}

export interface QuestionnaireService {
  getPlan(input: GetPlanInput): Promise<TargetQuestionnairePlan>
  submitAnswers(payload: TargetQuestionnaireSubmissionPayload): Promise<SubmitAnswersResult>
}
