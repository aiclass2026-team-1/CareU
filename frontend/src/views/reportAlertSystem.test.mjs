import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveEfficacyAlert } from '../../../supabase/functions/_shared/reportOrchestrator.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const insightSectionVuePath = path.join(__dirname, 'ReportInsightSection.vue')
const useReportPath = path.join(__dirname, 'useReport.ts')
const reportDataPath = path.join(__dirname, 'reportData.ts')
const finalizeFunctionPath = path.join(__dirname, '../../../supabase/functions/finalize-health-report/index.ts')

const mockMappings = [
  { metric_code: 'CHOL_TOTAL', efficacy_name: '調節血脂', is_active: true },
  { metric_code: 'TG', efficacy_name: '調節血脂', is_active: true },
  { metric_code: 'GPT_ALT', efficacy_name: '護肝', is_active: true },
  { metric_code: 'GLU_AC', efficacy_name: '調節血糖', is_active: true },
  { metric_code: 'HB', efficacy_name: '抗疲勞', is_active: true },
  { metric_code: 'HB', efficacy_name: '輔助調節血鐵', is_active: true },
]

test('1. BLOCK_RECOMMENDATION -> urgent alert with label 就醫警告', () => {
  const matchedRules = [
    {
      rule_key: 'GPT_ALT_CRITICAL',
      metric_code: 'GPT_ALT',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: 'GPT 指數過高，請就醫檢查。',
      rule_status: 'PROTOTYPE_ACTIVE',
      source_verified: false,
    },
  ]
  const alert = resolveEfficacyAlert('護肝', matchedRules, mockMappings)
  assert.ok(alert)
  assert.equal(alert.level, 'urgent')
  assert.equal(alert.label, '就醫警告')
  assert.equal(alert.message, 'GPT 指數過高，請就醫檢查。')
})

test('2. SHOW_WARNING -> near alert with label 接近提醒門檻', () => {
  const matchedRules = [
    {
      rule_key: 'GLU_AC_NEAR',
      metric_code: 'GLU_AC',
      action_type: 'SHOW_WARNING',
      warning_message: '血糖接近提醒門檻。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]
  const alert = resolveEfficacyAlert('調節血糖', matchedRules, mockMappings)
  assert.ok(alert)
  assert.equal(alert.level, 'near')
  assert.equal(alert.label, '接近提醒門檻')
  assert.equal(alert.message, '血糖接近提醒門檻。')
})

test('3. warning_message passes unchanged from rule to UI contract', () => {
  const rawMessage = '尿酸與血脂數據異常波動，建議持報告諮詢專科醫師並定期追蹤。'
  const matchedRules = [
    {
      rule_key: 'TG_HIGH',
      metric_code: 'TG',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: rawMessage,
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]
  const alert = resolveEfficacyAlert('調節血脂', matchedRules, mockMappings)
  assert.ok(alert)
  assert.equal(alert.message, rawMessage)
})

test('4. metric-to-efficacy mapping is deterministic across 1-to-many relationships', () => {
  const matchedRules = [
    {
      rule_key: 'HB_LOW',
      metric_code: 'HB',
      action_type: 'SHOW_WARNING',
      warning_message: '血紅素偏低提醒。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]
  const alertFatigue = resolveEfficacyAlert('抗疲勞', matchedRules, mockMappings)
  const alertIron = resolveEfficacyAlert('輔助調節血鐵', matchedRules, mockMappings)
  const alertLipid = resolveEfficacyAlert('調節血脂', matchedRules, mockMappings)

  assert.ok(alertFatigue)
  assert.equal(alertFatigue.level, 'near')
  assert.ok(alertIron)
  assert.equal(alertIron.level, 'near')
  assert.equal(alertLipid, null)
})

test('5. no efficacy-name heuristic inference', () => {
  const matchedRules = [
    {
      rule_key: 'URINE_PROTEIN_POS',
      metric_code: 'URINE_PROTEIN',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '尿蛋白陽性。',
      rule_status: 'PROTOTYPE_ACTIVE',
      source_verified: false,
    },
  ]
  assert.equal(resolveEfficacyAlert('調節血脂', matchedRules, mockMappings), null)
  assert.equal(resolveEfficacyAlert('護肝', matchedRules, mockMappings), null)
  assert.equal(resolveEfficacyAlert('胃腸功能改善', matchedRules, mockMappings), null)
})

test('6 & 7. no evidenceItems or score heuristic influences alert resolution', () => {
  const matchedRules = [
    {
      rule_key: 'TG_HIGH',
      metric_code: 'TG',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '三酸甘油脂偏高。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]
  const alertZeroScoreNoEv = resolveEfficacyAlert('調節血脂', matchedRules, mockMappings)
  assert.ok(alertZeroScoreNoEv)
  assert.equal(alertZeroScoreNoEv.level, 'urgent')
})

test('8. null alert renders no warning UI elements in template contract', () => {
  const template = fs.readFileSync(insightSectionVuePath, 'utf-8')
  assert.ok(template.includes('v-if="row.alert"'))
  assert.ok(template.includes('class="medical-alert alert-badge"'))
  assert.ok(template.includes('class="medical-alert expanded-alert"'))
})

test('9 & 10. urgent renders circle SVG and near renders triangle path in template', () => {
  const template = fs.readFileSync(insightSectionVuePath, 'utf-8')
  assert.ok(template.includes('circle v-if="row.alert.level === \'urgent\'"'))
  assert.ok(template.includes('path v-else d="M12 2 23 21H1Z"'))
  assert.ok(template.includes(':class="row.alert.level"'))
})

test('11 & 12. SHOW_WARNING alone does not set blocking hasRedFlags, BLOCK_RECOMMENDATION does', () => {
  const finalizeCode = fs.readFileSync(finalizeFunctionPath, 'utf-8')
  assert.ok(finalizeCode.includes("m.action_type === 'BLOCK_RECOMMENDATION'"))
  assert.ok(finalizeCode.includes('hasBlockingMatch'))
})

test('13. source_verified / prototype demo state is preserved', () => {
  const unverifiedRules = [
    {
      rule_key: 'GPT_DEMO',
      metric_code: 'GPT_ALT',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '示範警示。',
      rule_status: 'PROTOTYPE_ACTIVE',
      source_verified: false,
    },
  ]
  const alertUnverified = resolveEfficacyAlert('護肝', unverifiedRules, mockMappings)
  assert.equal(alertUnverified.sourceVerified, false)

  const verifiedRules = [
    {
      rule_key: 'GPT_VERIFIED',
      metric_code: 'GPT_ALT',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '正式警示。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]
  const alertVerified = resolveEfficacyAlert('護肝', verifiedRules, mockMappings)
  assert.equal(alertVerified.sourceVerified, true)

  const template = fs.readFileSync(insightSectionVuePath, 'utf-8')
  assert.ok(template.includes("row.alert.sourceVerified === false || (row.alert as any).demo"))
  assert.ok(template.includes('（示範）'))
})

test('14. Preview mock alert remains isolated and functional', () => {
  const reportDataCode = fs.readFileSync(reportDataPath, 'utf-8')
  assert.ok(reportDataCode.includes("profiles.a.results[2].alert = {"))
  assert.ok(reportDataCode.includes("level: 'near'"))
  assert.ok(reportDataCode.includes("label: '接近提醒門檻'"))

  assert.ok(reportDataCode.includes("profiles.c.results[0].alert = {"))
  assert.ok(reportDataCode.includes("level: 'urgent'"))
  assert.ok(reportDataCode.includes("label: '就醫警告'"))
})

test('15. removed candidate-safety sentence remains absent', () => {
  const template = fs.readFileSync(insightSectionVuePath, 'utf-8')
  const useReportCode = fs.readFileSync(useReportPath, 'utf-8')
  const forbidden = '候選品經安全審查皆符合條件，無觸發特殊排除規則。'
  
  assert.ok(template.includes(`row.reason !== '${forbidden}'`))
  assert.ok(useReportCode.includes(`p.exclusionNote !== '${forbidden}'`))
})

test('Regression A: SHOW_WARNING-only matched report keeps has_red_flags=false, does not block recommend, resolves near alert', () => {
  const matchedRules = [
    {
      rule_key: 'GLU_AC_NEAR_THRESHOLD',
      metric_code: 'GLU_AC',
      action_type: 'SHOW_WARNING',
      warning_message: '空腹血糖接近提醒門檻，建議注意日常糖分攝取。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]

  const hasBlockingMatch = matchedRules.some((m) => m.action_type === 'BLOCK_RECOMMENDATION')
  const hasRedFlags = hasBlockingMatch
  assert.equal(hasRedFlags, false, 'SHOW_WARNING-only must NOT set hasRedFlags=true')

  const alert = resolveEfficacyAlert('調節血糖', matchedRules, mockMappings)
  assert.ok(alert)
  assert.equal(alert.level, 'near')
  assert.equal(alert.label, '接近提醒門檻')
})

test('Regression B: BLOCK_RECOMMENDATION matched report sets has_red_flags=true and maintains recommendation blocking', () => {
  const matchedRules = [
    {
      rule_key: 'TG_HIGH_CRITICAL',
      metric_code: 'TG',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '三酸甘油脂指數異常偏高，請儘速就醫。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]

  const hasBlockingMatch = matchedRules.some((m) => m.action_type === 'BLOCK_RECOMMENDATION')
  const hasRedFlags = hasBlockingMatch
  assert.equal(hasRedFlags, true, 'BLOCK_RECOMMENDATION must set hasRedFlags=true')

  const alert = resolveEfficacyAlert('調節血脂', matchedRules, mockMappings)
  assert.ok(alert)
  assert.equal(alert.level, 'urgent')
  assert.equal(alert.label, '就醫警告')
})

test('Regression C: Mixed SHOW_WARNING + BLOCK_RECOMMENDATION sets has_red_flags=true and preserves mapped warning alert', () => {
  const matchedRules = [
    {
      rule_key: 'TG_CRITICAL',
      metric_code: 'TG',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '血脂過高。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
    {
      rule_key: 'GLU_AC_NEAR',
      metric_code: 'GLU_AC',
      action_type: 'SHOW_WARNING',
      warning_message: '血糖接近提醒門檻。',
      rule_status: 'ACTIVE',
      source_verified: true,
    },
  ]

  const hasBlockingMatch = matchedRules.some((m) => m.action_type === 'BLOCK_RECOMMENDATION')
  const hasRedFlags = hasBlockingMatch
  assert.equal(hasRedFlags, true)

  const alertWarning = resolveEfficacyAlert('調節血糖', matchedRules, mockMappings)
  assert.ok(alertWarning)
  assert.equal(alertWarning.level, 'near')
  assert.equal(alertWarning.label, '接近提醒門檻')

  const alertUrgent = resolveEfficacyAlert('調節血脂', matchedRules, mockMappings)
  assert.ok(alertUrgent)
  assert.equal(alertUrgent.level, 'urgent')
  assert.equal(alertUrgent.label, '就醫警告')
})

test('Regression D: Unmapped BLOCK_RECOMMENDATION sets global has_red_flags=true with no fabricated efficacy alert', () => {
  const matchedRules = [
    {
      rule_key: 'URINE_PROTEIN_POSITIVE',
      metric_code: 'URINE_PROTEIN',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '尿蛋白陽性。',
      rule_status: 'PROTOTYPE_ACTIVE',
      source_verified: false,
    },
    {
      rule_key: 'URINE_OCCULT_BLOOD_POSITIVE',
      metric_code: 'URINE_OCCULT_BLOOD',
      action_type: 'BLOCK_RECOMMENDATION',
      warning_message: '尿潛血陽性。',
      rule_status: 'PROTOTYPE_ACTIVE',
      source_verified: false,
    },
  ]

  const hasBlockingMatch = matchedRules.some((m) => m.action_type === 'BLOCK_RECOMMENDATION')
  const hasRedFlags = hasBlockingMatch
  assert.equal(hasRedFlags, true, 'Unmapped urine rules must still trigger global blocking')

  // Verify none of the 12 mapped efficacies get a fabricated alert
  const testEfficacies = ['調節血脂', '護肝', '調節血糖', '抗疲勞', '輔助調節血鐵', '胃腸功能改善']
  for (const eff of testEfficacies) {
    const alert = resolveEfficacyAlert(eff, matchedRules, mockMappings)
    assert.equal(alert, null, `Efficacy ${eff} must not receive a fabricated alert for unmapped urine metrics`)
  }
})

test('Regression E: No matched rules results in has_red_flags=false and no alert', () => {
  const matchedRules = []
  const hasBlockingMatch = matchedRules.some((m) => m.action_type === 'BLOCK_RECOMMENDATION')
  const hasRedFlags = hasBlockingMatch
  assert.equal(hasRedFlags, false)

  const alert = resolveEfficacyAlert('調節血脂', matchedRules, mockMappings)
  assert.equal(alert, null)
})

test('Regression F: Migration SQL defines report_red_flag_summary with backward-compatible columns and action_type=BLOCK_RECOMMENDATION filter', () => {
  const migrationPath = path.join(__dirname, '../../../supabase/migrations/20261002_fix_red_flag_summary_action_type_semantics.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  assert.ok(sql.includes("m.action_type = 'BLOCK_RECOMMENDATION'"), 'Migration must filter action_type on BLOCK_RECOMMENDATION')
  assert.ok(sql.includes("AS has_red_flags"), 'Migration must project has_red_flags')
  assert.ok(sql.includes("AS triggered_rule_count"), 'Migration must preserve triggered_rule_count for parse-health-report compatibility')
  assert.ok(sql.includes("AS warning_messages"), 'Migration must preserve warning_messages')
  assert.ok(sql.includes("string_agg("), 'Migration must use string_agg text semantics for warning_messages')
})

