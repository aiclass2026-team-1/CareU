/**
 * Care U - Report Data Baseline (Phase 4 MVP Demo Fixture)
 *
 * 【邊界聲明】
 * 1. 本模組內之所有指標分數、報告摘要、推薦配對、商品價格及 Profile 均為 Demo / Preview 示範資料；
 * 2. 嚴禁將本模組描述為正式醫療診斷、後端計分引擎或正式商品資料庫。
 */

import rawCatalogJson from './catalogData.json'

export interface Category {
  id: string
  name: string
}

export interface Claim {
  text: string
  type: string
}

export interface Product {
  id: string
  name: string
  ingredients: string
  license: string
  approvalDate: string
  applicant: string
  status: string
  category: string
  warnings: string | null
  precautions: string
  mechanismTag: string | null
  evidenceScore: number
  sourceFlags: {
    pregnant: boolean
    breastfeeding: boolean
    allergy: boolean
  }
  claims: Record<string, Claim>
  price: number
  unitPrice: number
  purchaseQuantity: number
  isDemoPrice: boolean
}

export interface CatalogData {
  categories: Category[]
  products: Record<string, Product>
  candidates: Record<string, string[]>
}

export interface MedicalAlert {
  level: 'urgent' | 'near'
  label: string
  message: string
  source?: string
  sourceVerified?: boolean
  demo?: boolean
}

export interface EvidenceItem {
  label?: string
  value: string
}

export interface ResultItem {
  categoryId: string
  score: number
  summary: string
  evidence: EvidenceItem[]
  reason: string
  alert?: MedicalAlert
}

export interface MissingCategory {
  categoryId: string
  reason: string
}

export interface ExclusionSummary {
  title: string
  text: string
  demo: boolean
}

export interface Profile {
  id: string
  name: string
  source: string
  summaryPublic: string
  summaryMember: string
  results: ResultItem[]
  missing: MissingCategory[]
  productDirections: string[]
  withheld: Record<string, string>
  candidateLimits?: Record<string, number>
  exclusionSummary?: ExclusionSummary
}

export const blueprint: Record<string, [string, string, string, string]> = {
  '1': [
    '將飲食內容與健檢記錄放在一起，了解血脂相關的保健方向。',
    '有提供血脂相關檢驗記錄',
    '外食頻率較高，想了解飲食調整',
    '這些資料可作為進一步討論的背景。檢驗記錄本身不代表需要補充特定商品。',
  ],
  '2': [
    '從飲食與排便習慣開始，了解日常胃腸保健。',
    '蔬菜與全穀攝取較少',
    '用餐時間不固定，關注排便規律',
    '將日常習慣整理為胃腸保健的討論方向；持續不適仍需由醫療專業人員評估。',
  ],
  '3': [
    '整理肝功能資料與生活習慣，保留需要進一步確認的資訊。',
    '已提供生活習慣資料',
    '檢驗變化及原因需由醫療人員判讀',
    '不以單次檢驗數值判定需要護肝商品，也不將商品當作處理異常數值的方式。',
  ],
  '4': [
    '回顧飲食與生活規律，了解免疫調節相關的資料。',
    '作息容易受工作安排影響',
    '希望了解日常保健資訊',
    '此方向為示範排序的一部分，問卷答案無法判定免疫功能強弱或補充必要性。',
  ],
  '5': [
    '從飲食與活動紀錄，了解骨質保健可以關注的資訊。',
    '較少記錄乳品或其他鈣來源食物',
    '每週活動量不固定',
    '生活紀錄可作為保健討論的起點，不能單憑飲食問卷推論骨質狀況或商品適用性。',
  ],
  '6': [
    '把飲食、活動與體態目標一起整理，了解相關保健方向。',
    '常因忙碌而外食',
    '想建立更規律的運動安排',
    '此分類沿用資料集名稱；關注排序不代表商品能保證減重或取代飲食與運動。',
  ],
  '7': [
    '留意忙碌生活中的休息節奏，從作息開始了解疲勞相關的保健方向。',
    '自評睡眠品質不好',
    '平日休息時間不固定',
    '將作息紀錄列為進一步了解的背景。疲勞可能有不同原因，這份示範排序不判定原因，也不表示一定需要保健食品。',
  ],
  '8': [
    '整理已知過敏與生活紀錄，了解需要特別留意的保健資訊。',
    '已填寫過敏相關資料',
    '過敏原與商品成分需逐項比對',
    '保健方向與商品過敏風險是兩件事。列入此方向不代表對任何候選品項都適用。',
  ],
  '9': [
    '整理血糖相關的健檢資料與飲食紀錄，作為後續討論依據。',
    '有提供血糖相關檢驗記錄',
    '想了解餐食與含糖飲品的選擇',
    '檢驗資料需配合檢查條件與個人狀況判讀，不直接轉換為商品補充建議。',
  ],
  '10': [
    '從長期生活習慣出發，了解延緩衰老分類下的保健資訊。',
    '希望持續維持規律作息',
    '想建立長期活動習慣',
    '此分類沿用正式清單，不代表能計算生理年齡或預測衰老速度。',
  ],
  '11': [
    '先確認相關檢驗與個人背景，再了解血鐵相關保健方向。',
    '需要足夠的檢驗與背景資訊',
    '補充必要性須由專業人員評估',
    '不以疲倦或其他單一感受推論缺鐵，也不自行設定補充劑量。',
  ],
  '12': [
    '整理血壓紀錄與量測背景，了解可進一步討論的方向。',
    '有提供日常血壓紀錄',
    '仍需確認量測方式、時間與連續變化',
    '不以單次數值判定疾病或補充需要，也不以商品取代既有治療。',
  ],
}

export function createCatalog(): CatalogData {
  const clone = JSON.parse(JSON.stringify(rawCatalogJson)) as CatalogData
  Object.values(clone.products).forEach(p => {
    p.unitPrice = Math.min(12, Math.max(3, Math.round(p.price / 120)))
    p.purchaseQuantity = 30
    p.price = p.unitPrice * p.purchaseQuantity
  })
  return clone
}

export function createProfiles(catalog: CatalogData): Record<string, Profile> {
  function makeProfile(
    id: string,
    name: string,
    source: string,
    ranking: [number, number][],
    dirs: number[],
    withheld: Record<string, string> = {}
  ): Profile {
    const results: ResultItem[] = ranking.map(([cidNum, score]) => {
      const cid = String(cidNum)
      const bp = blueprint[cid] || [
        '依目前提供的資料，了解相關保健方向。',
        '已提供相關資料',
        '日常習慣資料',
        '這些資料可作為進一步討論的背景。',
      ]
      return {
        categoryId: cid,
        score,
        summary: bp[0],
        evidence: [
          { value: bp[1] },
          { value: bp[2] },
        ],
        reason: bp[3],
      }
    })

    const missing: MissingCategory[] = catalog.categories
      .filter(c => !results.some(r => r.categoryId === c.id))
      .map(c => ({
        categoryId: c.id,
        reason: '目前資料不足，未列入本次排序。',
      }))

    return {
      id,
      name,
      source,
      summaryPublic: `${name}，我們已整理你提供的${
        source === '僅問卷' ? '問卷回答' : '身體資料與日常紀錄'
      }。從保健關注方向開始，慢慢了解每個結果背後的資訊，找到下一步想深入探索的重點。`,
      summaryMember: `${name}，你的完整分析已展開。這份報告整理了 ${results.length} 項有資料可供討論的保健方向；你可以查看分析依據，再比較候選品項，自由調整想了解的組合。`,
      results,
      missing,
      productDirections: dirs.map(String),
      withheld,
    }
  }

  const profiles: Record<string, Profile> = {
    a: makeProfile(
      'a',
      '小安',
      '健檢＋問卷',
      [
        [7, 88],
        [2, 81],
        [5, 74],
        [4, 67],
        [6, 60],
        [10, 52],
        [1, 46],
        [8, 39],
      ],
      [7, 2, 5],
      { '4': '已填寫過敏史，此方向成分與過敏原尚待核對，暫不列入。' }
    ),
    b: makeProfile(
      'b',
      '小晴',
      '健檢＋問卷',
      [
        [12, 85],
        [7, 78],
        [4, 70],
        [10, 61],
        [8, 53],
        [5, 45],
      ],
      [12]
    ),
    c: makeProfile(
      'c',
      '阿哲',
      '健檢＋問卷',
      [
        [7, 87],
        [2, 79],
        [5, 72],
        [4, 64],
        [10, 55],
        [8, 42],
      ],
      [7, 2, 5, 4]
    ),
    g: makeProfile(
      'g',
      '小柔',
      '僅問卷',
      [
        [5, 82],
        [7, 76],
        [2, 69],
        [4, 62],
        [10, 51],
      ],
      []
    ),
  }

  profiles.a.candidateLimits = { '7': 2 }
  profiles.a.exclusionSummary = {
    title: '部分方向暫不加入組合',
    text: '此為過敏資料尚待核對的示範：先略過尚未確認的方向，保留其他候選品項供比較。畫面中的品項均未完成真實過敏安全評估。',
    demo: true,
  }

  profiles.g.exclusionSummary = {
    title: '本次候選品項皆未符合使用條件',
    text: '此情境示範懷孕、成分過敏及用藥相關條件觸發預設排除結果，本次候選品項皆被排除，因此不建立保健組合。這僅表示本次候選清單沒有合適品項，不代表所有保健食品都不能使用。',
    demo: true,
  }

  profiles.g.withheld = {
    '5': '示範排除原因：符合孕期禁用條件，本次候選品項皆被排除。',
    '7': '示範排除原因：符合用藥相關禁用條件，本次候選品項皆被排除。',
    '2': '示範排除原因：候選成分涉及已填寫的過敏條件，本次候選品項皆被排除。',
    '4': '示範排除原因：符合孕期或成分過敏排除條件，本次候選品項皆被排除。',
    '10': '示範排除原因：符合已設定的禁用條件，本次候選品項皆被排除。',
  }

  if (profiles.a.results[2]) {
    profiles.a.results[2].alert = {
      level: 'near',
      label: '接近提醒門檻',
      message: '檢驗項目 A 已接近預設提醒門檻，請留意並向醫療專業人員確認。',
      source: '介面示範：未使用真實檢驗數值或醫療門檻',
      demo: true,
    }
  }

  if (profiles.c.results[0]) {
    profiles.c.results[0].alert = {
      level: 'urgent',
      label: '就醫警告',
      message: '檢驗項目 B 已達預設警示門檻，請儘速聯繫醫療專業人員確認。',
      source: '介面示範：未使用真實檢驗數值或醫療門檻',
      demo: true,
    }
  }

  if (profiles.c.results[2]) {
    profiles.c.results[2].alert = {
      level: 'near',
      label: '接近提醒門檻',
      message: '檢驗項目 C 已接近預設提醒門檻，請留意並向醫療專業人員確認。',
      source: '介面示範：未使用真實檢驗數值或醫療門檻',
      demo: true,
    }
  }

  return profiles
}
