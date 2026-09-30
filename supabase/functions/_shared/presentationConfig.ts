import type { PresentationConfig, QuestionBankRow } from './types.ts'

export function deriveQuestionOptionKeys(
  question: QuestionBankRow,
  presentation: PresentationConfig['items'][string]
): string[] {
  const bankOptions = question.options_json ?? []
  const hasMatchedKeys = Array.isArray(presentation.optionKeys) && presentation.optionKeys.length === bankOptions.length

  return bankOptions.map((option, index) => {
    return hasMatchedKeys ? presentation.optionKeys![index] : (option.key ?? `opt_${index}`)
  })
}

// 【第一部分：原本 7 題的精細配置，100% 原汁原味完整保留】
const canonicalItems: PresentationConfig['items'] = {
  '1': {
    controlType: 'single_choice',
    required: true,
    groupKey: 'lifestyle',
    pageKey: 'lifestyle',
    layoutHint: 'single',
    optionKeys: ['low', 'moderate', 'elevated', 'high'],
    alwaysIncludeInSupplement: true,
    supplementMetrics: ['CHOL_TOTAL', 'TG', 'LDL_C', 'HDL_C'],
  },
  '13': {
    controlType: 'number',
    required: true,
    groupKey: 'measurements',
    pageKey: 'measurements',
    layoutHint: 'pair_measurement',
    supplementMetrics: ['WAIST'],
    numericConfig: {
      unit: 'cm',
      min: 30,
      max: 250,
      step: 0.1,
      unknownOption: {
        key: 'unknown',
        label: '目前不知道',
      },
    },
  },
  '26': {
    controlType: 'single_choice',
    required: true,
    groupKey: 'measurements',
    pageKey: 'female_health',
    layoutHint: 'single',
    optionKeys: ['normal', 'heavy'],
    supplementMetrics: ['HB'],
  },
  '27': {
    controlType: 'composite_bp',
    required: true,
    groupKey: 'measurements',
    pageKey: 'measurements',
    layoutHint: 'pair_measurement',
    supplementMetrics: ['SBP', 'DBP'],
    bpConfig: {
      unit: 'mmHg',
      systolicLabel: '收縮壓',
      diastolicLabel: '舒張壓',
      unknownOption: {
        key: 'unknown',
        label: '目前不知道',
      },
    },
  },
  '30': {
    controlType: 'single_choice',
    required: true,
    groupKey: 'safety',
    pageKey: 'safety',
    layoutHint: 'pair_binary',
    optionKeys: ['no', 'yes'],
    alwaysIncludeInSupplement: true,
  },
  '31': {
    controlType: 'single_choice',
    required: true,
    groupKey: 'safety',
    pageKey: 'safety',
    layoutHint: 'pair_binary',
    optionKeys: ['no', 'yes'],
    alwaysIncludeInSupplement: true,
  },
  '32': {
    controlType: 'multi_choice',
    required: true,
    groupKey: 'safety',
    pageKey: 'allergies',
    layoutHint: 'standalone',
    optionKeys: [
      'none_known',
      'dairy',
      'soy',
      'sesame',
      'black_beans',
      'fish',
      'gluten',
      'lactose_intolerance',
      'fungi',
      'peanuts_tree_nuts',
      'other',
    ],
    exclusiveKeys: ['none_known'],
    detailInputs: {
      other: {
        required: true,
        placeholder: '請輸入過敏原名稱',
      },
    },
    alwaysIncludeInSupplement: true,
  },
}

// 【第二部分：新擴充的 25 題配置】
const expandedDefinitions = [
  // 缺血脂 -> Q2
  { id: 2, group: 'lipid', supplementMetrics: ['CHOL_TOTAL', 'TG', 'LDL_C', 'HDL_C'] },

  // 固定必問題 -> Q3, Q4 (胃腸功能)
  { id: 3, group: 'gut', alwaysInclude: true },
  { id: 4, group: 'gut', alwaysInclude: true },

  // 缺肝功能 -> Q5, Q6, Q7
  { id: 5, group: 'liver', supplementMetrics: ['GOT_AST', 'GPT_ALT', 'GGT'] },
  { id: 6, group: 'liver', supplementMetrics: ['GOT_AST', 'GPT_ALT', 'GGT'] },
  { id: 7, group: 'liver', supplementMetrics: ['GOT_AST', 'GPT_ALT', 'GGT'] },

  // 缺免疫 (WBC) -> Q8, Q9
  { id: 8, group: 'immunity', supplementMetrics: ['WBC'] },
  { id: 9, group: 'immunity', supplementMetrics: ['WBC'] },

  // 固定必問題 -> Q10, Q11, Q12 (骨質保健)
  { id: 10, group: 'bone', alwaysInclude: true },
  { id: 11, group: 'bone', alwaysInclude: true },
  { id: 12, group: 'bone', alwaysInclude: true },

  // 缺體脂 (BMI/WAIST) -> Q14
  { id: 14, group: 'body_fat', supplementMetrics: ['BMI', 'WAIST'] },

  // 缺血鐵/疲勞 (HB) -> Q15, Q16, Q17
  { id: 15, group: 'fatigue', supplementMetrics: ['HB'] },
  { id: 16, group: 'fatigue', supplementMetrics: ['HB'] },
  { id: 17, group: 'fatigue', supplementMetrics: ['HB'] },

  // 固定必問題 -> Q18, Q19 (過敏體質)
  { id: 18, group: 'allergy', alwaysInclude: true },
  { id: 19, group: 'allergy', alwaysInclude: true },

  // 內部衍生題 -> Q20 (永遠隱藏)
  { id: 20, group: 'body_fat', controlType: 'hidden' as const },

  // 缺血糖 -> Q21, Q22
  { id: 21, group: 'glycemia', supplementMetrics: ['GLU_AC', 'HBA1C'] },
  { id: 22, group: 'glycemia', supplementMetrics: ['GLU_AC', 'HBA1C'] },

  // 固定必問題 -> Q23, Q24 (延緩衰老)
  { id: 23, group: 'anti_aging', alwaysInclude: true },
  { id: 24, group: 'anti_aging', alwaysInclude: true },

  // 缺血鐵 -> Q25
  { id: 25, group: 'iron', supplementMetrics: ['HB'] },

  // 缺血壓 -> Q28, Q29
  { id: 28, group: 'blood_pressure', supplementMetrics: ['SBP', 'DBP'] },
  { id: 29, group: 'blood_pressure', supplementMetrics: ['SBP', 'DBP'] },
]

// 組裝新擴充題目的 items
const expandedItems: PresentationConfig['items'] = {}
for (const q of expandedDefinitions) {
  expandedItems[String(q.id)] = {
    controlType: q.controlType ?? 'single_choice',
    required: q.id !== 20,
    groupKey: q.group,
    pageKey: q.group,
    layoutHint: 'single',
    ...(q.alwaysInclude ? { alwaysIncludeInSupplement: true } : {}),
    ...(q.supplementMetrics ? { supplementMetrics: q.supplementMetrics } : {}),
  }
}

// 【第三部分：完整合併導出】
export const presentationConfigV1: PresentationConfig = {
  version: 1,
  questionOrder: Array.from({ length: 32 }, (_, index) => index + 1),
  items: {
    ...expandedItems,
    ...canonicalItems, // 確保原始 7 題的高優先級設定完全不被覆蓋
  },
}