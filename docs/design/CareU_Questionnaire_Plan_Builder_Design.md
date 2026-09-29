# Care U｜Questionnaire Plan Builder Design / Local Spike

- **日期**：2026-09-29
- **狀態**：`SPIKE-ONLY`；尚非 production API 或已核准臨床選題規則
- **Branch**：`spike/questionnaire-backend-plan`
- **Production effect**：無；本 spike 不連線 Supabase、不寫資料、不部署、不接 Frontend
- **Contract effect**：無；只讀並輸出既有 `TargetQuestionnairePlan`

## 1. 結論

可用 Backend-owned versioned presentation config 將 `question_bank` domain rows 與 trusted report/profile context 組成目前 TARGET DTO。Node 22 local spike 已驗證 full / supplement 輸出、gender applicability、依 trusted recognized metrics 遮除已涵蓋測量題、semantic option key、exclusive/detail metadata 與數值配置。

這只證明資料轉換形狀可行，不證明題目選擇的醫療規則、metric mappings、分數來源或 production authorization 已核准。不得把 SPIKE config 當成 CURRENT Production truth。

## 2. CURRENT Production Reality

- Live `question_bank` 有 domain 欄位：`id`, `efficacy_id`, `efficacy_name`, `category`, `question_text`, `scoring_desc`, `applicable_gender`, `is_active`, `options_json`, `auto_map_field`。沒有 TARGET UI metadata 欄位 `controlType`, `groupKey`, `required`, `exclusive`, `detailInput`, `numericConfig`。
- `options_json` 是 label/score 陣列，沒有穩定 semantic key；現有 objective value 題仍帶有分段計分 options。不能直接把這些 options 當成數值 UI config。
- `applicable_gender` 已有 `ALL` / `MALE` / `FEMALE`，問卷來源含女性限定的月經量、懷孕與哺乳題，以及複選過敏題。
- `metric_code_mapping` 目前回報 8 rows `MAPPED`、21 rows `NEEDS_DISCUSSION`；其中 `WAIST` 及血壓補題的正式觸發規則仍需 domain review。這些 mapping rows 不是已核准的 questionnaire-selection contract。
- `questionnaire_submissions.answers` 為 JSONB。OCR_AUTO 產生、權威計分、submission persistence 均不在此 spike。
- Basic profile 的 age、biological sex、body weight 維持 profile/flow context；不建立虛構 question ID。Plan request 只示範傳入已驗證的 `profile.gender` 作 applicability context。
- Live source 與 repo 的 CURRENT 說明有 drift：目前 deployed `calculate-efficacy-scores` v3 會寫 `assessment_results`，但部分 repo contract 將其描述為 stateless/no DB write。這不是本 Plan Builder spike 的修改範圍，需另行對齊。

## 3. TARGET Design

### Inputs and trust boundaries

```text
Client request: reportId + mode + validated profile context
                     │
                     ├─ Backend loads report/metrics from trusted storage
                     ├─ Backend loads active question_bank rows
                     └─ Backend loads versioned presentation config
                                      ↓
                         Plan Builder / resolver
                                      ↓
                          TargetQuestionnairePlan
```

- Request body 不接受 caller 自帶 recognized/missing metrics 或 OCR output。對 supplement，Backend 必須先驗證 caller 有權讀取 `reportId`，再載入 trusted report context；目前 Production auth boundary 尚未關閉。
- `profile.gender` 必須來自經驗證的 profile/flow context，不應信任任意 caller 身分或自行推導 profile 欄位。
- Plan builder 只負責挑題及建 DTO；不建立 answer rows、不計正式 score、不執行 Formula 2、不寫 assessment tables。
- `TargetQuestionnairePlan.recognizedMetrics` / `missingMetrics` 只從 trusted resolver context 複製。前端不得用 `autoMapField` 或 metric code 自行略題。

### Selection and metadata

1. 依 versioned config 的穩定順序載入 active question IDs；缺題庫 row 或缺 presentation config 時 fail closed，不自行猜 UI type。
2. 僅輸出 `applicable_gender` 為 `ALL` 或等於已驗證 gender 的題目。
3. Full mode 依 spike config 輸出設定題目。Supplement mode 僅輸出有明確 `supplementMetrics` mapping 且其指標由 trusted context 判定 missing 的題目；recognized metric 覆蓋該題全部 mapping 時不放入 plan。
4. `options_json` 只提供 domain labels/scores。config 另給 stable semantic keys；兩者長度不一致時拒絕建 plan。multi-choice `exclusive` 和 `detailInput` 也由 Backend config 提供。
5. `numericConfig` 來自 Backend config。age、biological sex、weight 不偽裝成 `question_bank` items。

## 4. SPIKE-ONLY Implementation

實作位於 `docs/design/spikes/questionnaire-plan-builder/`：

- `build-questionnaire-plan.mjs`：純函式、無 Supabase/client/runtime dependency。
- `presentation-config.v1.json`：demo selection/order + TARGET presentation metadata；不是 production medical mapping。
- `fixtures/`：題庫 rows、request、trusted context 與 golden responses。
- `build-questionnaire-plan.test.mjs`：Node 內建 test runner 驗證 golden response、gender、OCR suppression、mode validation 與 trust context consistency。

執行：

```powershell
node --test docs/design/spikes/questionnaire-plan-builder/build-questionnaire-plan.test.mjs
```

本地 config 為演示機制而不是全部 32 題的完整 presentation inventory。它展示 7 個代表 row：一般單選、女性題、腰圍數值、複合血壓文字輸入、懷孕/哺乳、互斥「無過敏」與「其他」必填補充。

## 5. Request / Response Semantics

- Full fixture 的 `reportId` 為 null、mode 為 `full`，report metrics 為空；profile gender 在測試 harness 表示已驗證 context。
- Supplement fixture 提供 report UUID；trusted context 獨立由 Backend resolver fixture 提供，recognized=`WAIST`、missing=`SBP, DBP`。因此腰圍題不再出現，血壓題留在 plan。
- Fixture 的血壓題暫以 `text` 收集「收縮壓/舒張壓」pair。這只是 transport spike：目前 TARGET DTO 沒有 paired-numeric config / validation schema，`autoMapField=SBP` 也不足以表達 DBP。需由 domain/product owner 決定後正式化，不能用此 demo 規則推斷其他 production mappings。
- Response golden files 僅供 local regression test；不表示 API endpoint 已建立。

## 6. Security / Data Integrity Notes

- A1 live audit 發現目前兩支 Production Edge Functions 均 `verify_jwt=false`，且 service-role 路徑接收 caller-controlled identity/data。此 spike 不複用或修改它們。
- Production Plan Builder 必須在選題前驗證 JWT、report ownership、profile provenance 及 report status；Service role 不得因 client 提供任意 `reportId` 而讀取其他使用者資料。
- OCR_AUTO 應由 trusted backend/upstream 寫入或派生；不要把它做成 browser 可提交的 answer source。
- TARGET submission 只傳 questionId/semantic value/detailText；Backend 必須依當期 plan/config 驗證答案並重新衍生可信 score/source。browser score 不可信。
- SQL grants/RLS 未更動；沒有降低 security 或寫入 `questionnaire_submissions`。

## 7. Gaps Before Formalization

1. 完成 metric code dictionary / `metric_code_mapping` review，決定 recognized/missing metric 的 canonical namespace、來源可信度與 report completeness 規則。
2. 由醫療/產品 owner 核准每題 trigger、supplement domain coverage、gender applicability、requiredness、題目順序及 OCR suppression 規則。
3. 補齊全部 active question 的 versioned presentation metadata；確認 numeric controls、paired blood pressure、unknown values、exclusive/detail semantics 與答案 validation。
4. 決定 config version pinning 策略，使已發 plan 的答案仍能依相同 semantic keys/validation rules 解讀。
5. 定義 authenticated request、report ownership、profile source 與錯誤回應 API contract；另行做正式 Backend source-location/hosting 決策。
6. 獨立處理 CURRENT `calculate-efficacy-scores` deployed behavior 與 repo contract drift；本 spike 不把計分納入 Plan Builder。

## 8. A2 Result

**SPIKE PASS（DTO construction only）**：在不改 TARGET contract、不依賴 Frontend、不連 Production 的條件下，可建構完整 `TargetQuestionnairePlan` 形狀。**Production readiness：NOT READY**，待第 7 節 domain/security gaps 關閉後，另行核准正式化。