import type { PresentationConfig } from './types.ts'

export const presentationConfigV1: PresentationConfig = {
  version: 1,
  questionOrder: [1, 13, 26, 27, 30, 31, 32],
  items: {
    '1': {
      controlType: 'single_choice',
      required: true,
      groupKey: 'lifestyle',
      optionKeys: ['low', 'moderate', 'elevated', 'high'],
    },
    '13': {
      controlType: 'number',
      required: true,
      groupKey: 'measurements',
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
      optionKeys: ['normal', 'heavy'],
    },
    '27': {
      controlType: 'text',
      required: true,
      groupKey: 'measurements',
      supplementMetrics: ['SBP', 'DBP'],
    },
    '30': {
      controlType: 'single_choice',
      required: true,
      groupKey: 'safety',
      optionKeys: ['no', 'yes'],
    },
    '31': {
      controlType: 'single_choice',
      required: true,
      groupKey: 'safety',
      optionKeys: ['no', 'yes'],
    },
    '32': {
      controlType: 'multi_choice',
      required: true,
      groupKey: 'safety',
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
    },
  },
}
