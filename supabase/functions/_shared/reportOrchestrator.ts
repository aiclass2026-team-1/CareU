import type { ValidatedAnswerRecord, QuestionBankRow } from './types.ts'

export interface EfficacyScoreInputItem {
  efficacyId: number
  efficacyName: string
  labScore: number
  labMax: number
  surveyScore: number
  surveyMax: number
}

export interface DerivedAssessmentInputs {
  items: EfficacyScoreInputItem[]
  userConditions: string[]
}

export interface NormalizedRecommendationItem {
  productId: number | string
  productName: string
  reason: string
  efficacyClaim?: string
  warnings?: string | null
  precautions?: string | null
  mechanismTag?: string | null
  evidenceScore?: number
}

export interface NormalizedPriorityItem {
  rank: number
  efficacyId?: number
  efficacyName: string
  score: number | null
  status?: string
  labScore?: number
  labMax?: number
  surveyScore?: number
  surveyMax?: number
  description?: string
  userCondition?: string | null
  recommendations: NormalizedRecommendationItem[]
  exclusionNote?: string | null
}

export interface NormalizedReportPayload {
  success: boolean
  submissionId: string
  assessmentId: string
  hasRedFlags: boolean
  priorities: NormalizedPriorityItem[]
}

export const ALLERGY_LABEL_MAP: Record<string, string> = {
  dairy: '牛奶及乳製品',
  soy: '大豆及其製品',
  sesame: '芝麻',
  black_beans: '黑豆',
  fish: '魚類及其製品',
  gluten: '含麩質穀物',
  lactose_intolerance: '乳糖不耐',
  fungi: '真菌類（如菇蕈類）',
  peanuts_tree_nuts: '花生／堅果',
  milk: '牛奶及乳製品',
  other: '其他',
}

/**
 * Derives trusted survey scores and normalized safety conditions from validated questionnaire answers.
 *
 * Rules:
 * 1. Only answers with a valid numeric score are accumulated for surveyScore.
 * 2. Unresolved scores (numeric, multi-choice) remain null and are NOT coerced to 0.
 * 3. Efficacies without trusted data are NOT fabricated.
 * 4. Safety conditions (pregnancy, breastfeeding, allergies) are normalized into meaningful Chinese semantics.
 */
export function deriveAssessmentInputs(
  answers: ValidatedAnswerRecord[],
  questionBankRows: QuestionBankRow[]
): DerivedAssessmentInputs {
  const rowsById = new Map(questionBankRows.map((r) => [r.id, r]))
  const efficacyMap = new Map<number, { name: string; surveyScore: number; surveyMax: number }>()
  const userConditionsSet = new Set<string>()

  for (const ans of answers) {
    const question = rowsById.get(ans.question_id)
    if (!question) continue

    // 1. Safety context extraction with trusted display semantics
    if (question.id === 30 || question.question_text.includes('懷孕')) {
      if (ans.value === 'yes' || ans.value === '是' || ans.score === 1) {
        userConditionsSet.add('懷孕')
      }
    } else if (question.id === 31 || question.question_text.includes('哺乳')) {
      if (ans.value === 'yes' || ans.value === '是' || ans.score === 1) {
        userConditionsSet.add('哺乳')
      }
    } else if (question.id === 32 || question.category === 'CONTRAINDICATION') {
      const allergyArr = Array.isArray(ans.value)
        ? ans.value
        : typeof ans.value === 'string'
        ? [ans.value]
        : []
      for (const item of allergyArr) {
        const key = String(item).trim()
        if (key === 'none_known' || key === '無已知過敏' || key === 'none') continue
        const label = ALLERGY_LABEL_MAP[key] || key
        if (label === '其他') {
          if (ans.detail_text?.trim()) {
            userConditionsSet.add(`過敏:${ans.detail_text.trim()}`)
          }
        } else {
          userConditionsSet.add(`過敏:${label}`)
        }
      }
    }

    // 2. Scored survey accumulation
    if (typeof ans.score === 'number' && !isNaN(ans.score)) {
      const effId = question.efficacy_id
      const effName = question.efficacy_name || `功效項目 ${effId}`

      let maxScore = 0
      if (Array.isArray(question.options_json) && question.options_json.length > 0) {
        maxScore = Math.max(...question.options_json.map((o) => (typeof o.score === 'number' ? o.score : 0)))
      }
      if (maxScore <= 0) {
        maxScore = ans.score > 0 ? ans.score : 3
      }

      const existing = efficacyMap.get(effId) || { name: effName, surveyScore: 0, surveyMax: 0 }
      existing.surveyScore += ans.score
      existing.surveyMax += maxScore
      efficacyMap.set(effId, existing)
    }
  }

  const items: EfficacyScoreInputItem[] = Array.from(efficacyMap.entries()).map(([effId, data]) => ({
    efficacyId: effId,
    efficacyName: data.name,
    labScore: 0,
    labMax: 0,
    surveyScore: data.surveyScore,
    surveyMax: data.surveyMax > 0 ? data.surveyMax : 3,
  }))

  return {
    items,
    userConditions: Array.from(userConditionsSet),
  }
}

/**
 * Merges trusted lab scores into assessment items by efficacy identity/name.
 */
export function mergeAssessmentItems(
  surveyItems: EfficacyScoreInputItem[],
  labScores: Array<{ efficacy_name: string; lab_earned_score: number; lab_max_score: number }>
): EfficacyScoreInputItem[] {
  const mergedMap = new Map<string, EfficacyScoreInputItem>()

  // 1. Add all survey items
  for (const item of surveyItems) {
    mergedMap.set(item.efficacyName, { ...item })
  }

  // 2. Merge lab scores
  let nextGeneratedId = 100
  for (const lab of labScores) {
    const existing = mergedMap.get(lab.efficacy_name)
    if (existing) {
      existing.labScore = lab.lab_earned_score
      existing.labMax = lab.lab_max_score
    } else {
      mergedMap.set(lab.efficacy_name, {
        efficacyId: nextGeneratedId++,
        efficacyName: lab.efficacy_name,
        labScore: lab.lab_earned_score,
        labMax: lab.lab_max_score,
        surveyScore: 0,
        surveyMax: 0,
      })
    }
  }

  return Array.from(mergedMap.values())
}

/**
 * Resolves truthful priority score from authoritative top_efficacies_detail and scores_json.
 * Returns exact number (0 remains 0) or null if unavailable. Never returns fabricated 85.
 */
export function resolveEfficacyScore(
  rankRow: { efficacy_name: string; efficacy_rank: number; efficacy_id?: number },
  topEfficaciesDetail: any[] | null | undefined,
  scoresJson: any
): number | null {
  // 1. Check top_efficacies_detail array
  if (Array.isArray(topEfficaciesDetail)) {
    const found = topEfficaciesDetail.find(
      (item) =>
        item &&
        (item.rank === rankRow.efficacy_rank ||
          item.name === rankRow.efficacy_name ||
          (rankRow.efficacy_id !== undefined && item.id === rankRow.efficacy_id))
    )
    if (found && typeof found.score === 'number' && !isNaN(found.score)) {
      return Math.round(found.score)
    }
  }

  // 2. Check scores_json keyed by efficacyId or efficacyName
  if (scoresJson && typeof scoresJson === 'object') {
    if (rankRow.efficacy_id !== undefined && rankRow.efficacy_id !== null) {
      const byId = scoresJson[String(rankRow.efficacy_id)]
      if (typeof byId === 'number' && !isNaN(byId)) {
        return Math.round(byId)
      }
      if (byId && typeof byId.score === 'number' && !isNaN(byId.score)) {
        return Math.round(byId.score)
      }
    }

    const byName = scoresJson[rankRow.efficacy_name]
    if (typeof byName === 'number' && !isNaN(byName)) {
      return Math.round(byName)
    }
    if (byName && typeof byName.score === 'number' && !isNaN(byName.score)) {
      return Math.round(byName.score)
    }
  }

  return null
}


