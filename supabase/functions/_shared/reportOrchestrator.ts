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

export const EFFICACY_NAME_TO_ID: Record<string, number> = {
  '調節血脂': 1,
  '胃腸功能改善': 2,
  '護肝': 3,
  '免疫調節': 4,
  '骨質保健': 5,
  '不易形成體脂肪': 6,
  '抗疲勞': 7,
  '輔助調整過敏體質': 8,
  '調節血糖': 9,
  '延緩衰老': 10,
  '輔助調節血鐵': 11,
  '輔助調節血壓': 12,
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
      if (question.efficacy_id <= 0 || question.category === 'CONTRAINDICATION') {
        continue
      }
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
 * Merges trusted lab scores into assessment items by efficacy identity/name derived from trusted questionBankRows.
 */
export function mergeAssessmentItems(
  surveyItems: EfficacyScoreInputItem[],
  labScores: Array<{ efficacy_name: string; lab_earned_score: number; lab_max_score: number }>,
  questionBankRows: QuestionBankRow[]
): EfficacyScoreInputItem[] {
  const nameToIdMap = new Map<string, number>()
  for (const q of questionBankRows) {
    if (q.efficacy_name && q.efficacy_id > 0 && q.efficacy_id <= 12) {
      nameToIdMap.set(q.efficacy_name.trim(), q.efficacy_id)
    }
  }

  const mergedMap = new Map<string, EfficacyScoreInputItem>()

  // 1. Add all survey items
  for (const item of surveyItems) {
    if (item.efficacyId > 0 && item.efficacyId <= 12) {
      mergedMap.set(item.efficacyName.trim(), { ...item })
    }
  }

  // 2. Merge lab scores
  for (const lab of labScores) {
    const effName = (lab.efficacy_name || '').trim()
    const canonicalId = nameToIdMap.get(effName)
    if (canonicalId === undefined || canonicalId <= 0 || canonicalId > 12) {
      console.warn(`[ReportOrchestrator] Unknown or invalid lab efficacy name '${lab.efficacy_name}'. Failing closed / skipping lab-only item.`)
      continue
    }

    const existing = mergedMap.get(effName)
    if (existing) {
      existing.labScore = lab.lab_earned_score
      existing.labMax = lab.lab_max_score
      if (existing.efficacyId <= 0) {
        existing.efficacyId = canonicalId
      }
    } else {
      mergedMap.set(effName, {
        efficacyId: canonicalId,
        efficacyName: effName,
        labScore: lab.lab_earned_score,
        labMax: lab.lab_max_score,
        surveyScore: 0,
        surveyMax: 0,
      })
    }
  }

  return Array.from(mergedMap.values()).filter(item => item.efficacyId > 0 && item.efficacyId <= 12)
}

/**
 * Resolves truthful priority score from authoritative top_efficacies_detail and scores_json using strict exact match.
 * Returns exact number (0 remains 0) or null if unavailable. Never returns fabricated 85.
 */
export function resolveEfficacyScore(
  rankRow: { efficacy_name: string; efficacy_rank: number; efficacy_id?: number },
  topEfficaciesDetail: any[] | null | undefined,
  scoresJson: any,
  questionBankRows?: QuestionBankRow[]
): number | null {
  // 1. Check top_efficacies_detail array with strict exact match (rank AND name)
  if (Array.isArray(topEfficaciesDetail)) {
    const found = topEfficaciesDetail.find(
      (item) =>
        item &&
        item.rank === rankRow.efficacy_rank &&
        item.name === rankRow.efficacy_name
    )
    if (found && typeof found.score === 'number' && !isNaN(found.score)) {
      return Math.round(found.score)
    }
  }

  // 2. Check scores_json keyed by efficacyId or efficacyName
  if (scoresJson && typeof scoresJson === 'object') {
    let canonicalId = rankRow.efficacy_id
    if ((!canonicalId || canonicalId <= 0) && Array.isArray(questionBankRows)) {
      const qMatch = questionBankRows.find(q => q.efficacy_name === rankRow.efficacy_name)
      if (qMatch) canonicalId = qMatch.efficacy_id
    }

    if (canonicalId !== undefined && canonicalId !== null && canonicalId > 0) {
      const byId = scoresJson[String(canonicalId)]
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


