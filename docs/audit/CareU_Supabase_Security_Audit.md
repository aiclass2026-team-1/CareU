# Care U｜Supabase / Security Read-only Audit

- **執行日期**：2026-09-29
- **Branch / HEAD**：`audit/supabase-security` / `6239cf5ab42f842cad2274c98f04735ee9ece004`
- **盤點方式**：Supabase live schema inventory、read-only catalog query、security/performance advisors、deployed Edge Function inventory/source
- **Production 變更**：無；未修改 schema、RLS、policies、grants、secrets 或 Edge Functions
- **敏感資料**：本報告不包含 API key、service-role key、JWT 或 secret value

## 1. 執行摘要

1. 目標七表均存在。六張表啟用 RLS；`health_food_products` 未啟用 RLS，且 anon/authenticated grants 顯示具備所有常見 table privileges。這是優先確認的公開面風險。
2. `assessment_efficacy_ranks` 有一條對 `public` 無條件允許 SELECT 的 policy；`question_bank` 也允許 public SELECT。`questionnaire_submissions` 有 public INSERT policy。請將 grants 與 RLS policies 合併評估，不能只看其中一項。
3. Production inventory 有兩支 ACTIVE Edge Functions，兩支均為 `verify_jwt=false`。兩支均建立 service-role client，且接受 caller-provided identity 或可影響持久化結果的輸入；在信任 caller 前沒有可見的 JWT ownership 驗證。
4. `health-reports` bucket 為 private。Storage object policies 只對 authenticated 使用者開放，並以 `auth.uid()` 比對 object path 第一段；未見 anon policy。
5. `public` schema inventory 共 145 張表，其中可見大量與 CareU 無關的 workflow/automation platform 命名物件。**Production project identity / 是否為共用 project 尚待 owner 確認**；在確認前，不應把整個 inventory 當作 CareU 專屬 schema。

## 2. Scope 與來源

Supabase live inventory 回傳 `public` schema 145 張表；本次逐欄檢視任務指定的 `lab_reports`、`lab_report_metrics`、`question_bank`、`questionnaire_submissions`、`assessment_results`、`assessment_efficacy_ranks`、`health_food_products`。欄位、nullability、keys、policies 與 grants 詳見 [`CareU_Supabase_Table_Matrix.csv`](CareU_Supabase_Table_Matrix.csv)。

Advisories 快照時間為 2026-09-29 UTC。完整全 project lint 數量：security `rls_disabled_in_public` 129、`rls_enabled_no_policy` 6、`security_definer_view` 2、`function_search_path_mutable` 2；performance `unindexed_foreign_keys` 61。這些是整個 project 的 advisor findings，不代表每一項都屬於 CareU domain table。此次目標七表中，`health_food_products` 命中 RLS disabled finding；`assessment_results` 與 `assessment_efficacy_ranks` 命中 foreign-key-index performance findings。

| Advisory lint | 全 project findings | Official remediation |
|---|---:|---|
| `rls_disabled_in_public` | 129 | [RLS Disabled in Public](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public) |
| `rls_enabled_no_policy` | 6 | [RLS Enabled No Policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) |
| `security_definer_view` | 2 | [Security Definer View](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view) |
| `function_search_path_mutable` | 2 | [Function Search Path Mutable](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) |
| `unindexed_foreign_keys` | 61 | [Unindexed Foreign Keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys) |

## 3. Target Table Findings

| Table | RLS | Policies / grants observation |
|---|---|---|
| `lab_reports` | Enabled, not forced | `Users can manage own reports` 是 `ALL`、role `public`，以 `auth.uid() = user_id` 限制 USING / WITH CHECK；anon 無 table grant，authenticated 有 DELETE/INSERT/SELECT/UPDATE。 |
| `lab_report_metrics` | Enabled, not forced | 僅 authenticated SELECT policy，透過 parent `lab_reports.user_id = auth.uid()` 限制；authenticated 有 SELECT grant。 |
| `question_bank` | Enabled, not forced | `Allow public read question_bank` 對 public 允許 SELECT；anon/authenticated 的 catalog grants 列有全部常見 table privileges，但未見寫入 policies。 |
| `questionnaire_submissions` | Enabled, not forced | public INSERT policy 的 WITH CHECK 為 `true`；另有 `Users can manage own submissions`，以 `auth.uid() = user_id` 限制 ALL。authenticated 有 DELETE/INSERT/SELECT/UPDATE grant；anon 無 table grant。 |
| `assessment_results` | Enabled, not forced | authenticated SELECT policy 透過 submission owner (`questionnaire_submissions.user_id = auth.uid()`) 限制；authenticated 只有 SELECT grant。 |
| `assessment_efficacy_ranks` | Enabled, not forced | `Allow read assessment_efficacy_ranks` 是 public SELECT、`USING true`，可讀所有符合該 policy 的列；anon/authenticated 的 catalog grants 列有全部常見 table privileges。 |
| `health_food_products` | **Disabled** | 沒有 RLS policies；anon/authenticated grants 列有 DELETE/INSERT/SELECT/UPDATE 及其他常見 table privileges。屬最高優先的 RLS/grant review 項目。 |

**Grant 解讀**：catalog grants 表示角色具備 SQL table privilege；對 RLS-enabled table，實際列存取仍受 RLS policy 約束。RLS disabled 的 `health_food_products` 沒有這層 row filter。`public` policy 的角色範圍也包含 anon/authenticated 的 public role inheritance。未觀察到目標七表的 UNIQUE constraint；各表 PK/FK/CHECK 已列在 CSV。

## 4. Storage

- Bucket `health-reports` 存在且 `public=false`；允許 MIME types 為 PDF、JPEG、PNG、WebP，未設定 bucket file size limit。
- `storage.objects` policies：authenticated 可在 `health-reports` bucket 上 SELECT、INSERT、UPDATE、DELETE；每條 policy 都要求 `storage.foldername(name)[1] = auth.uid()::text`。未見 anon policy。
- `storage.objects` 的 anon/authenticated catalog grants 顯示有常見 CRUD privileges；object-level 存取需與 RLS policy 一併解讀。
- `parse-health-report` 使用 service-role client 下載檔案，會繞過一般 Storage RLS。該函式未驗證 `filePath` 是否屬於呼叫者。

## 5. Deployed Edge Functions

Inventory 實際列出以下兩支；狀態與 verify_jwt 以 live inventory 為準。Function source 是 deployed source，不代表已驗證其安全或可用性。

| Function | Status / version | verify_jwt | Request → response | Environment variable names | Storage / tables | service role / caller identity |
|---|---|---:|---|---|---|---|
| `parse-health-report` | ACTIVE / v1 | false | Request `{ filePath, userId? }`；成功回 `{ success, reportId, metricsCount, isBelowThreshold, missingMetrics, hasRedFlags, parsedData }`，錯誤回 `{ error }`。 | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` | 以 `health-reports` 下載檔案；寫入 `lab_reports`。沒有讀取其他 DB table。 | 使用 service role。接受 caller-provided `userId`，且以 caller-provided `filePath` 下載，未見 token/ownership 驗證；`userId` 可為 null。CORS allow-origin 為 `*`。 |
| `calculate-efficacy-scores` | ACTIVE / v3 | false | Request 讀取 `items`, `labWeight?`, `surveyWeight?`, `submissionId?`, `userId?`, `userConditions?`, `hasRedFlags?`；回 `{ success, assessmentId, topPriorities, allResults }`。 | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`（service-role key 缺省時 fallback 到 anon key） | 寫入 `assessment_results`；未見其他 table/storage read。 | 使用 service role 或 fallback anon key。分數/排名以 request 的 `items` 計算，並接受 caller-provided user/submission IDs 及 red-flag/condition values；未見 JWT/ownership 驗證。DB insert error 被 catch 後仍回 success。CORS allow-origin 為 `*`。 |

### Security observations（只記錄，不修正）

- `verify_jwt=false` + service-role database/storage access 使 function 內部授權檢查成為關鍵控制；目前 source 未驗證 caller identity 與資源 ownership。
- `parse-health-report` 可用傳入路徑要求 service role 讀 private bucket，且可把傳入 `userId` 寫入報告。需評估未授權讀取、跨使用者存取與歸屬偽造風險。
- `calculate-efficacy-scores` 接受 caller 提供的計分輸入與持久化 identity；即使前端不可信，函式仍將計算結果寫入 `assessment_results`。此外，資料庫 insert 失敗時仍可能回 `success: true`。
- 兩支函式均開放 CORS `*`。CORS 不是授權機制，但擴大瀏覽器可呼叫來源。
- 未在此 audit 執行任何 remediation，也未測試對外 endpoint 或讀取使用者資料/log payload。

## 6. Unresolved Items / Handoff

1. 由專案 owner 確認目前連線的 Supabase project 是否為 CareU 預期 Production，是否與 workflow/automation platform 共用。報告刻意未記錄 project URL 或 key。
2. 由 Backend/Security owner 檢視 `health_food_products` 的預期公開性、RLS/grants；檢視 `assessment_efficacy_ranks` 是否應匿名讀取；確認 `questionnaire_submissions` public INSERT 是否為既定設計。
3. 對兩支 Edge Functions 建立正式 authn/authz、資源 ownership、input validation、可信計分來源與錯誤語意設計，再另行授權修改。此次只提出觀察，不更動 Production。
4. `questionnaire_submissions` 目前以 JSONB `answers` 儲存；`question_bank` 欄位不包含完整 TARGET presentation metadata。這是 A2 Plan Builder 要處理的 Backend-owned mapping gap，不應以修改 Frontend contract 解決。

**A1 結果**：唯讀盤點完成；Production 未修改。