import type { TargetQuestionnairePlan, TargetQuestionnaireSubmissionPayload } from '../types/index.ts'
import { createMockTargetQuestionnairePlanFixture } from '../adapters/questionnaireAdapter.ts'
import type { QuestionnaireService, GetPlanInput, SubmitAnswersResult } from './questionnaireService.ts'



export class MockQuestionnaireService implements QuestionnaireService {
  async getPlan(input: GetPlanInput): Promise<TargetQuestionnairePlan> {
    // Simulate minimal async delay for loading state proof
    await new Promise(resolve => setTimeout(resolve, 200))
    const fixture = createMockTargetQuestionnairePlanFixture(input.reportId ?? null, input.mode)
    return fixture
  }

  async submitAnswers(_payload: TargetQuestionnaireSubmissionPayload): Promise<SubmitAnswersResult> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Truthful non-production mock acknowledgment returning submissionId: null
    return {
      submissionId: null,
    }
  }
}

export const mockQuestionnaireService = new MockQuestionnaireService()

