import type { TargetQuestionnairePlan, TargetQuestionnaireSubmissionPayload } from '@/types'
import { createMockTargetQuestionnairePlanFixture } from '@/adapters/questionnaireAdapter'
import type { QuestionnaireService, GetPlanInput } from './questionnaireService'

export class MockQuestionnaireService implements QuestionnaireService {
  async getPlan(input: GetPlanInput): Promise<TargetQuestionnairePlan> {
    // Simulate minimal async delay for loading state proof
    await new Promise(resolve => setTimeout(resolve, 200))
    const fixture = createMockTargetQuestionnairePlanFixture(input.reportId ?? null, input.mode)
    return fixture
  }

  async submitAnswers(_payload: TargetQuestionnaireSubmissionPayload): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Non-production mock acknowledgment resolved without speculative submissionId/persistence semantics
  }
}

export const mockQuestionnaireService = new MockQuestionnaireService()

