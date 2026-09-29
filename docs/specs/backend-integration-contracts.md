# Care U｜後端整合與資料合約架構規格（Backend Integration & Data Contracts）

- **文件版本**：v1.2 (Phase 7 Schema Verified Baseline)
- **撰寫日期**：2026-09-29
- **基準 Commit**：`ecd379e`
- **文件狀態**：`[CONFIRMED]` 正式架構與合約決策基準

---

## 1. 範圍與目標 (Scope & Objectives)
本文件確立 Care U 系統在 Phase 7 階段之「後端整合架構決策（Architecture Decisions）」、「前端與後端資料合約（Backend/Frontend Data Contracts）」以及「現行 v1 與未來目標（CURRENT vs TARGET）之明確邊界」。

---

## 2. 核心架構決策 (Core Architecture Decisions)

### 2.1 Assessment Orchestration (評估執行與編排所有權)
- **決策**：由後端（Backend）全面擁有 Assessment Orchestration。
- **邊界**：Frontend 不得自行計算正式總分、不自行決定排序、不自行組合 `assessment_results` 或 `assessment_efficacy_ranks`。
- **目標流程 (`TARGET`)**：
  `Questionnaire completed` → `Backend Assessment Orchestrator` → 取得 trusted Lab data & Survey data → `Formula 2` 評分 → 12 項功效排序 → 寫入 `assessment_results` 與 `assessment_efficacy_ranks` → 回傳 `assessmentId` → Frontend 渲染報告。
- **狀態**：`TARGET`（目前尚未建立正式 orchestrator Edge Function；Phase 7 僅定 Contract）。

### 2.2 Dynamic Questionnaire Ownership (動態問卷題組所有權)
- **決策**：由後端／領域資料（Backend / Domain Data）擁有題組選擇邏輯。
- **邊界**：Frontend 僅負責接收 `QuestionnairePlan`、渲染題目、蒐集答案並送出。Frontend 不得在前端 hardcode 或自行維護 `metric code → missing rule → question IDs` 邏輯。
- **狀態**：`TARGET`（目前前端暫以靜態 6~7 步驟 Demo 運作，待後端 API 接入）。

### 2.3 Formula 2 (雙軌加權法正式計分)
- **決策**：採正式公式二：健檢 60%、問卷 40%。若無可用健檢資料，問卷權重為 100%。
- **權威來源**：`BACKEND`。Frontend 不得成為生產環境計分來源。
- **狀態**：`CURRENT / TARGET`（已實作於 `calculate-efficacy-scores` Edge Function，惟需由後端統一編排）。

### 2.4 Partial Lab Coverage (部分健檢指標涵蓋率處理)
- **決策**：在 MVP v1 中，若 `expectedMetricCount > availableMetricCount > 0`，維持 Lab 60%、Survey 40%。`dataCoveragePercent` 僅作資料完整度指標記錄，不於 MVP v1 動態調整權重。
- **狀態**：`DEFER / FUTURE REFINEMENT`（Coverage-aware weighting 留待後續版本）。

---

## 3. 欄位與指標集合區分 (Metric Set Distinctions)

### 3.1 `parse-health-report` v1 Core 11
- **用途**：專用於 OCR 完整性檢查與缺漏判定（Completeness / Missing Check）。
- **清單**：
  `height`, `weight`, `waist`, `sbp`, `dbp`, `fasting_glucose`, `alt`, `total_cholesterol`, `tg`, `hb`, `wbc`.

### 3.2 Efficacy / Questionnaire Domain Metric Set
- **用途**：用於 12 項保健功效計分與領域問卷映射之完整生化/生理指標集合。
- **清單範例**：
  `CHOL_TOTAL`, `TG`, `LDL_C`, `HDL_C`, `GOT_AST`, `GPT_ALT`, `GGT`, `WBC`, `CRP`, `CA`, `ALP`, `BMI`, `BODYFAT`, `WAIST`, `HB`, `RBC`, `GLU_AC`, `HBA1C`, `FE`, `FERRITIN`, `SBP`, `DBP`.

---

## 4. Edge Functions 現行 v1 與目標合約 (Edge Function Contracts)

### 4.1 `parse-health-report` v1 (`CURRENT`)
- **Pipeline**：
  File → Supabase Storage upload → storage `filePath` → `parse-health-report` POST → Gemini parse → raw structured report → completeness/missing check → red flag check → `lab_reports` write (raw JSON/metadata) → JSON response (`CurrentParseHealthReportResponseV1`).
- **備註**：`userId` 於現行 v1 屬 `CURRENT legacy/untrusted caller-provided identity field`。

### 4.2 `calculate-efficacy-scores` v1 (`CURRENT`)
- **性質**：純運算無狀態函式（Stateless, No DB read/write, No external API）。
- **輸入 (`CurrentCalculateEfficacyScoresRequestV1`)**：
  `items[]` (`efficacyId`, `efficacyName`, `labScore`, `labMax`, `surveyScore`, `surveyMax`), plus legacy `labWeight?`, `surveyWeight?`.
- **輸出 (`CurrentCalculateEfficacyScoresResponseV1`)**：
  `method`, `weights`, `topPriorities`, `allResults`.

---

## 5. 問卷與評估實體合約 (Questionnaire & Assessment Contracts)

### 5.1 Questionnaire Domain Contract (`CURRENT / TARGET`)
- `question_bank` 已知欄位語意：`id`, `efficacyId`, `efficacyName`, `category`, `questionText`, `scoringDesc`, `options`, `autoMapField`, `applicableGender`, `isActive`.
- Category 領域分類：`VERIFIED_SCALE`, `RISK_FACTOR`, `OBJECTIVE_VALUE`, `CONTRAINDICATION`.
- Gender 對應：`ALL`, `MALE`, `FEMALE`.
- Answer source：`OCR_AUTO`, `USER_INPUT` 屬於作答記錄屬性 (`QuestionnaireAnswer`)。

### 5.2 Assessment CURRENT Entity vs TARGET Aggregate (`CURRENT` vs `TARGET`)
- **`CurrentAssessmentResultEntity` (`CURRENT` Supabase Table Row)**:
  `id`, `submissionId` (nullable), `userId` (nullable), `scoresJson`, `topEfficacyIds`, `recommendedProductIds`, `hasRedFlags`, `userConditions`, `topEfficaciesDetail`, `createdAt`.
- **`CurrentAssessmentEfficacyRank` (`CURRENT` Supabase Table Row)**:
  `id`, `assessmentId`, `efficacyName`, `efficacyRank`, `userCondition` (nullable), `createdAt`.
- **`TargetSubmitAssessmentRequest` / `TargetSubmitAssessmentResponse` (`TARGET`)**:
  由前端傳遞 `reportId` / `submissionId` / `answers` 至後端 Orchestrator，由後端執行評分、排序並回傳 `assessmentId`。

---

## 6. 產品資料庫狀態：`health_food_products` (`CURRENT / EXISTS / SCHEMA_VERIFIED`)
- **生產現況**：`public.health_food_products` 在 production Supabase 中已存在且包含完整 18 欄位資料。
- **主鍵與約束**：Primary Key = `id` (bigint, NOT NULL)。`license_no` 不是驗證過的主鍵，且目前未發現唯一性約束或關聯外鍵（FK）。
- **安全性事實**：RLS 目前在 Production Table Editor 中觀察為 `disabled`。
- **已驗證 18 欄位清單 (`CurrentHealthFoodProductEntity`)**：
  1. `id` (`bigint`, PK)
  2. `license_no` (`text`, nullable)
  3. `category` (`text`, nullable)
  4. `product_name` (`text`, nullable)
  5. `approval_date` (`date`, nullable)
  6. `applicant` (`text`, nullable)
  7. `status` (`text`, nullable)
  8. `active_ingredients` (`text`, nullable)
  9. `efficacy` (`text`, nullable)
  10. `efficacy_claim` (`text`, nullable)
  11. `evidence_type` (`text`, nullable)
  12. `warnings` (`text`, nullable)
  13. `precautions` (`text`, nullable)
  14. `mechanism_tag` (`text`, nullable)
  15. `evidence_score` (`bigint`, nullable)
  16. `contraindicated_pregnant` (`boolean`, nullable)
  17. `contraindicated_breastfeeding` (`boolean`, nullable)
  18. `contraindicated_allergy` (`boolean`, nullable)
- **備註**：Product 資料表雖已存在 (`CURRENT`)，但不代表推薦引擎後端 API 或推薦邏輯已實作完畢（推薦後端仍屬獨立規劃範疇）。

---

## 7. 授權與資安邊界 (Auth Boundary)
- **狀態**：`AUTH_BOUNDARY_OPEN`
- **規範**：
  - 身分驗證未來必須由後端透過 JWT 進行驗證（不得信任前端傳遞之任意 `userId`）。
  - 現階段禁止初始化 Supabase Auth、禁止修改 JWT、禁止變更 RLS 政策。

---

## 8. 已知差距與推遲項目 (Known Mismatches & Deferred Items)
1. **Dynamic Questionnaire UI Integration**：`DEFER`（前端現行展示用 6~7 步驟保持不變，待後端 `QuestionnairePlan` 服務成熟後再行對接）。
2. **Assessment DB Persistence**：`DEFER`（`calculate-efficacy-scores` 尚需透過後端 Orchestrator 進行資料庫寫入）。


- **文件版本**：v1.0 (Phase 7 Baseline)
- **撰寫日期**：2026-09-29
- **基準 Commit**：`ecd379e`
- **文件狀態**：`[CONFIRMED]` 正式架構與合約決策基準

---

## 1. 範圍與目標 (Scope & Objectives)
本文件確立 Care U 系統在 Phase 7 階段之「後端整合架構決策（Architecture Decisions）」、「前端與後端資料合約（Backend/Frontend Data Contracts）」以及「現行 v1 與未來目標（CURRENT vs TARGET）之明確邊界」。

---

## 2. 核心架構決策 (Core Architecture Decisions)

### 2.1 Assessment Orchestration (評估執行與編排所有權)
- **決策**：由後端（Backend）全面擁有 Assessment Orchestration。
- **邊界**：Frontend 不得自行計算正式總分、不自行決定排序、不自行組合 `assessment_results` 或 `assessment_efficacy_ranks`。
- **目標流程**：
  `Questionnaire completed` → `Backend Assessment Orchestrator` → 取得 trusted Lab data & Survey data → `Formula 2` 評分 → 12 項功效排序 → 寫入 `assessment_results` 與 `assessment_efficacy_ranks` → 回傳 `assessmentId` → Frontend 渲染報告。
- **狀態**：`TARGET`（目前尚未建立正式 orchestrator Edge Function；Phase 7 僅定 Contract）。

### 2.2 Dynamic Questionnaire Ownership (動態問卷題組所有權)
- **決策**：由後端／領域資料（Backend / Domain Data）擁有題組選擇邏輯。
- **邊界**：Frontend 僅負責接收 `QuestionnairePlan`、渲染題目、蒐集答案並送出。Frontend 不得在前端 hardcode 或自行維護 `metric code → missing rule → question IDs` 邏輯（不得直接套用舊版 `getActiveQuestionIds()`）。
- **目標流程**：
  `reportId` → Backend/Domain Resolver → `QuestionnairePlan` → Frontend 渲染。
- **狀態**：`TARGET`（目前前端暫以靜態 6~7 步驟 Demo 運作，待後端 API 接入）。

### 2.3 Formula 2 (雙軌加權法正式計分)
- **決策**：採正式公式二：健檢 60%、問卷 40%。若無可用健檢資料，問卷權重為 100%。
- **權威來源**：`BACKEND`。Frontend 不得成為生產環境計分來源。
- **狀態**：`CURRENT / TARGET`（已實作於 `calculate-efficacy-scores` Edge Function，惟需由後端統一編排）。

### 2.4 Partial Lab Coverage (部分健檢指標涵蓋率處理)
- **決策**：在 MVP v1 中，若 `expectedMetricCount > availableMetricCount > 0`，維持 Lab 60%、Survey 40%。`dataCoveragePercent` 僅作資料完整度指標記錄，不於 MVP v1 動態調整權重。
- **狀態**：`DEFER / FUTURE REFINEMENT`（Coverage-aware weighting 留待後續版本）。

---

## 3. 欄位與指標集合區分 (Metric Set Distinctions)

### 3.1 `parse-health-report` v1 Core 11
- **用途**：專用於 OCR 完整性檢查與缺漏判定（Completeness / Missing Check）。
- **清單**：
  `height`, `weight`, `waist`, `sbp`, `dbp`, `fasting_glucose`, `alt`, `total_cholesterol`, `tg`, `hb`, `wbc`.

### 3.2 Efficacy / Questionnaire Domain Metric Set
- **用途**：用於 12 項保健功效計分與領域問卷映射之完整生化/生理指標集合。
- **清單範例**：
  `CHOL_TOTAL`, `TG`, `LDL_C`, `HDL_C`, `GOT_AST`, `GPT_ALT`, `GGT`, `WBC`, `CRP`, `CA`, `ALP`, `BMI`, `BODYFAT`, `WAIST`, `HB`, `RBC`, `GLU_AC`, `HBA1C`, `FE`, `FERRITIN`, `SBP`, `DBP`.
- **原則**：不得將此兩者混為一談或建立單一混淆的「Core 11」列舉。

---

## 4. Edge Functions 現行 v1 與目標合約 (Edge Function Contracts)

### 4.1 `parse-health-report` v1 (`CURRENT`)
- **Pipeline**：
  File → Supabase Storage upload → storage `filePath` → `parse-health-report` POST → Gemini parse → raw structured report → completeness/missing check → red flag check → `lab_reports` write (raw JSON/metadata) → JSON response.
- **備註**：`lab_report_metrics` 及後續 mapped / normalized 檢視表屬 `SUPABASE_PIPELINE / LIVE_UNVERIFIED`，不由本 Function 直接寫入。

### 4.2 `calculate-efficacy-scores` v1 (`CURRENT`)
- **性質**：純運算無狀態函式（Stateless, No DB read/write, No external API）。
- **輸入 (Request V1)**：
  `efficacyId`, `efficacyName`, `labScore`, `labMax`, `surveyScore`, `surveyMax`, (`labWeight`, `surveyWeight` 僅保留相容）。
- **輸出 (Response V1)**：
  `method`, `weights`, `topPriorities`, `allResults`.
- **備註**：現行 v1 不產生 `assessmentId`，正式產品合規權重由後端強制固定為 60/40。

---

## 5. 授權與資安邊界 (Auth Boundary)
- **狀態**：`AUTH_BOUNDARY_OPEN`
- **規範**：
  - 身分驗證未來必須由後端透過 JWT 進行驗證（不得信任前端傳遞之任意 `userId`）。
  - 現階段禁止初始化 Supabase Auth、禁止修改 JWT、禁止變更 RLS 政策。

---

## 6. 已知差距與推遲項目 (Known Mismatches & Deferred Items)
1. **`health_food_products`**：`PLANNED / NOT CREATED`（現行前端 `catalogData.json` 僅為 Demo 示範，非正式生產 DB）。
2. **Dynamic Questionnaire UI Integration**：`DEFER`（前端現行展示用 6~7 步驟保持不變，待後端 `QuestionnairePlan` 服務成熟後再行對接）。
3. **Assessment DB Persistence**：`DEFER`（`calculate-efficacy-scores` 尚需透過後端 Orchestrator 進行資料庫寫入）。
