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
  { metric_code: 'LDL_C', efficacy_name: '調節血脂', is_active: true },
  { metric_code: 'HDL_C', efficacy_name: '調節血脂', is_active: true },
  { metric_code: 'GPT_ALT', efficacy_name: '護肝', is_active: true },
  { metric_code: 'GLU_AC', efficacy_name: '調節血糖', is_active: true },
  { metric_code: 'HBA1C', efficacy_name: '調節血糖', is_active: true },
  { metric_code: 'HB', efficacy_name: '抗疲勞', is_active: true },
  { metric_code: 'HB', efficacy_name: '輔助調節血鐵', is_active: true },
]

test('1. Correct questionnaire_submissions select contract (id, user_id, report_id, answers)', () => {
  const finalizeCode = fs.readFileSync(finalizeFunctionPath, 'utf-8')
  assert.ok(finalizeCode.includes(".from('questionnaire_submissions')"))
  assert.ok(finalizeCode.includes(".select('id, user_id, report_id, answers')"))
  // Must NOT select metric fields from questionnaire_submissions
  assert.ok(!finalizeCode.includes(".from('questionnaire_submissions')\n    .select('metric_code"))
  assert.ok(!finalizeCode.includes(".from('questionnaire_submissions')\n    .select(\"metric_code"))
})

test('2. is_abnormal=true + HIGH + valid mapping -> urgent alert for correct efficacy', () => {
  const labMetrics = [
    {
      metric_code: 'CHOL_TOTAL',
      metric_name: '總膽固醇',
      normalized_value: 260,
      raw_value: '260',
      source_flag: 'HIGH',
      is_abnormal: true,
    },
  ]
  const alert = resolveEfficacyAlert('調節血脂', labMetrics, mockMappings)
  assert.ok(alert)
  assert.equal(alert.level, 'urgent')
  assert.equal(alert.label, '檢驗數值偏高')
  assert.equal(alert.message, '總膽固醇（260）偏高。')
  assert.equal(alert.source, '健檢報告檢驗數值')
  assert.deepEqual(alert.sourceMetricCodes, ['CHOL_TOTAL'])
})

test('3. is_abnormal=true + LOW + valid mapping -> urgent alert with 偏低 semantics, not 偏高', () => {
  const labMetrics = [
    {
      metric_code: 'HB',
      metric_name: '血紅素',
      normalized_value: 10.5,
      raw_value: '10.5',
      source_flag: 'LOW',
      is_abnormal: true,
    },
  ]
  const alert = resolveEfficacyAlert('抗疲勞', labMetrics, mockMappings)
  assert.ok(alert)
  assert.equal(alert.level, 'urgent')
  assert.equal(alert.label, '檢驗數值偏低')
  assert.equal(alert.message, '血紅素（10.5）偏低。')
  assert.ok(!alert.label.includes('偏高'), 'Alert label must not contain 偏高 when source_flag is LOW')
  assert.ok(!alert.message.includes('偏高'), 'Alert message must not contain 偏高 when source_flag is LOW')
})

test('4. is_abnormal=false -> no alert', () => {
  const labMetrics = [
    {
      metric_code: 'CHOL_TOTAL',
      metric_name: '總膽固醇',
      normalized_value: 180,
      raw_value: '180',
      source_flag: 'NORMAL',
      is_abnormal: false,
    },
    {
      metric_code: 'URINE_PROTEIN',
      metric_name: '尿蛋白',
      normalized_value: null,
      raw_value: 'NEGATIVE',
      source_flag: 'NORMAL',
      is_abnormal: false,
    },
  ]
  const alertLipid = resolveEfficacyAlert('調節血脂', labMetrics, mockMappings)
  assert.equal(alertLipid, null, 'Normal metric with is_abnormal=false must yield null alert')

  const alertLiver = resolveEfficacyAlert('護肝', labMetrics, mockMappings)
  assert.equal(alertLiver, null)
})

test('5. abnormal metric with no efficacy mapping -> no fabricated direction alert', () => {
  const labMetrics = [
    {
      metric_code: 'URINE_OCCULT_BLOOD',
      metric_name: '尿潛血',
      normalized_value: null,
      raw_value: 'POSITIVE',
      source_flag: 'HIGH',
      is_abnormal: true,
    },
  ]
  const testEfficacies = ['調節血脂', '護肝', '調節血糖', '抗疲勞', '輔助調節血鐵', '胃腸功能改善']
  for (const eff of testEfficacies) {
    const alert = resolveEfficacyAlert(eff, labMetrics, mockMappings)
    assert.equal(alert, null, `Efficacy ${eff} must not receive fabricated alert for unmapped metric`)
  }
})

test('6. HB maps according to authoritative DB mapping, not a single hardcoded efficacy', () => {
  const labMetrics = [
    {
      metric_code: 'HB',
      metric_name: '血紅素',
      normalized_value: 10.5,
      raw_value: '10.5',
      source_flag: 'LOW',
      is_abnormal: true,
    },
  ]
  const alertFatigue = resolveEfficacyAlert('抗疲勞', labMetrics, mockMappings)
  const alertIron = resolveEfficacyAlert('輔助調節血鐵', labMetrics, mockMappings)
  const alertLipid = resolveEfficacyAlert('調節血脂', labMetrics, mockMappings)

  assert.ok(alertFatigue, 'HB must map to 抗疲勞')
  assert.equal(alertFatigue.level, 'urgent')
  assert.ok(alertIron, 'HB must map to 輔助調節血鐵')
  assert.equal(alertIron.level, 'urgent')
  assert.equal(alertLipid, null, 'HB must not map to unmapped 調節血脂')

  const customMapping = [{ metric_code: 'HB', efficacy_name: '抗疲勞', is_active: true }]
  assert.ok(resolveEfficacyAlert('抗疲勞', labMetrics, customMapping))
  assert.equal(resolveEfficacyAlert('輔助調節血鐵', labMetrics, customMapping), null)
})

test('7. no fabricated "總膽固醇 205" fallback exists in codebase', () => {
  const finalizeCode = fs.readFileSync(finalizeFunctionPath, 'utf-8')
  assert.ok(!finalizeCode.includes('205'), 'No hardcoded 205 cholesterol value allowed')
  assert.ok(!finalizeCode.includes('METRIC_EFFICACY_MAP'), 'No hardcoded METRIC_EFFICACY_MAP dictionary allowed')

  assert.equal(resolveEfficacyAlert('調節血脂', [], mockMappings), null)
})

test('8. BLOCK_RECOMMENDATION / hasRedFlags behavior unchanged and separated from is_abnormal', () => {
  const finalizeCode = fs.readFileSync(finalizeFunctionPath, 'utf-8')
  assert.ok(finalizeCode.includes("m.action_type === 'BLOCK_RECOMMENDATION'"))
  assert.ok(finalizeCode.includes('hasBlockingMatch'))
  assert.ok(finalizeCode.includes('if (!hasRedFlags)'))

  const blockingMatches = [{ action_type: 'BLOCK_RECOMMENDATION' }]
  const hasBlockingMatch = blockingMatches.some((m) => m.action_type === 'BLOCK_RECOMMENDATION')
  assert.equal(hasBlockingMatch, true, 'BLOCK_RECOMMENDATION triggers hasRedFlags')

  const nonBlockingMatches = [{ action_type: 'SHOW_WARNING' }]
  const hasNoBlocking = nonBlockingMatches.some((m) => m.action_type === 'BLOCK_RECOMMENDATION')
  assert.equal(hasNoBlocking, false, 'Non-blocking matches do not set hasRedFlags')
})

test('9. null alert renders no warning UI elements in template contract', () => {
  const template = fs.readFileSync(insightSectionVuePath, 'utf-8')
  assert.ok(template.includes('v-if="row.alert"'))
  assert.ok(template.includes('class="medical-alert alert-badge"'))
  assert.ok(template.includes('class="medical-alert expanded-alert"'))
})

test('10. urgent renders circle SVG in template contract', () => {
  const template = fs.readFileSync(insightSectionVuePath, 'utf-8')
  assert.ok(template.includes('circle v-if="row.alert.level === \'urgent\'"'))
  assert.ok(template.includes(':class="row.alert.level"'))
})

test('11. Preview mock alert remains isolated and functional', () => {
  const reportDataCode = fs.readFileSync(reportDataPath, 'utf-8')
  assert.ok(reportDataCode.includes("profiles.a.results[2].alert = {"))
  assert.ok(reportDataCode.includes("level: 'near'"))
  assert.ok(reportDataCode.includes("label: '接近提醒門檻'"))

  assert.ok(reportDataCode.includes("profiles.c.results[0].alert = {"))
  assert.ok(reportDataCode.includes("level: 'urgent'"))
  assert.ok(reportDataCode.includes("label: '就醫警告'"))
})

test('12. removed candidate-safety sentence remains absent', () => {
  const template = fs.readFileSync(insightSectionVuePath, 'utf-8')
  const useReportCode = fs.readFileSync(useReportPath, 'utf-8')
  const forbidden = '候選品經安全審查皆符合條件，無觸發特殊排除規則。'

  assert.ok(template.includes(`row.reason !== '${forbidden}'`))
  assert.ok(useReportCode.includes(`p.exclusionNote !== '${forbidden}'`))
})

test('Regression A: Multiple abnormal metrics mapped to one efficacy summarize deterministically (sorted by metric_code)', () => {
  const labMetrics = [
    { metric_code: 'TG', metric_name: '三酸甘油脂', normalized_value: 230, source_flag: 'HIGH', is_abnormal: true },
    { metric_code: 'CHOL_TOTAL', metric_name: '總膽固醇', normalized_value: 260, source_flag: 'HIGH', is_abnormal: true },
    { metric_code: 'LDL_C', metric_name: '低密度脂蛋白膽固醇', normalized_value: 175, source_flag: 'HIGH', is_abnormal: true },
  ]
  const alert = resolveEfficacyAlert('調節血脂', labMetrics, mockMappings)
  assert.ok(alert)
  assert.equal(alert.level, 'urgent')
  assert.equal(alert.label, '檢驗數值偏高')
  assert.equal(alert.message, '總膽固醇（260）偏高、低密度脂蛋白膽固醇（175）偏高、三酸甘油脂（230）偏高。')
  assert.deepEqual(alert.sourceMetricCodes, ['CHOL_TOTAL', 'LDL_C', 'TG'])
})

test('Regression B: Migration SQL defines report_red_flag_summary with backward-compatible columns and action_type=BLOCK_RECOMMENDATION filter', () => {
  const migrationPath = path.join(__dirname, '../../../supabase/migrations/20261002_fix_red_flag_summary_action_type_semantics.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  assert.ok(sql.includes("m.action_type = 'BLOCK_RECOMMENDATION'"), 'Migration must filter action_type on BLOCK_RECOMMENDATION')
  assert.ok(sql.includes("AS has_red_flags"), 'Migration must project has_red_flags')
  assert.ok(sql.includes("AS triggered_rule_count"), 'Migration must preserve triggered_rule_count for parse-health-report compatibility')
  assert.ok(sql.includes("AS warning_messages"), 'Migration must preserve warning_messages')
  assert.ok(sql.includes("string_agg("), 'Migration must use string_agg text semantics for warning_messages')
})

