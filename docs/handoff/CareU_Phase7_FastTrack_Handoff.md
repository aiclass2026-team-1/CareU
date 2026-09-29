# Care U｜Phase 7｜Fast-Track Handoff Document
# Date: 2026-09-29

## 1. Current Branch & Checkpoint
- **Branch**: `feat/questionnaire-live-integration`
- **Base HEAD**: `d17d9a6` (`feat: integrate live full questionnaire flow`)
- **Status**: DUAL_PATH_LIVE_E2E = PASS

## 2. Production Canary Endpoint Status
- `build-questionnaire-plan`: ACTIVE (`verify_jwt = true`)
- `submit-questionnaire`: ACTIVE (`verify_jwt = true`)
- `finalize-health-report`: ACTIVE (`verify_jwt = true`, Canary v2 deployed)
- **Auth**: Supabase Anonymous Auth (`ensureAuthSession`)

## 3. Progress Summary & E2E Status
- **Path A (Full Questionnaire → Assessment → Recommendation → Report)**: PASS.
- **Path B (Upload → OCR → Supplement Questionnaire → Assessment → Recommendation → Report)**: PASS.
- **Preview Isolation**: `#/preview/` routes remain strictly isolated using `mockQuestionnaireService` and fixture profiles (0 live network requests).

## 4. Session Flow State
- **During Loading-2 / Transition**: May contain `careu-upload-flow`, `careu-questionnaire`, `careu-report-id`, `careu-submission-id`, `careu-assessment-id`, `careu-live-report`.
- **After Report Transition**: Temporary upload/questionnaire state is cleaned, leaving result context: `careu-report-id`, `careu-submission-id`, `careu-assessment-id`, `careu-live-report` (Accepted for MVP).

## 5. Post-E2E UI Cleanup Backlog (`POST_E2E_UI_CLEANUP`)
1. **Questionnaire scoring descriptions**: Formal questionnaire must not display `scoringDesc` / internal scoring rules to users.
2. **question_bank copy cleanup**: Clean question_text values containing duplicated answer-method text or option lists at data-source level.
3. **Q27 blood pressure**: Convert from text control to structured SBP/DBP input metadata with `unknownOption`.
4. **Home copy parity**: Remove upload format guidance ("支持 PDF、JPG、PNG，可選擇多個檔案") from formal `#/home`, retaining inside upload UI only.
5. **Supplement plan loading progress**: Ensure plan-loading state uses neutral progress state, never showing 100% or `階段 x/0` before plan/groups exist.

## 6. Post-E2E Architecture Backlog (`POST_E2E_ARCHITECTURE`)
- Reconcile teammate "Function 連結 前端" design with the working canary architecture.
- Decide final `get-dynamic-questionnaire` vs `build-questionnaire-plan`.
- Decide final role of `submit-questionnaire`.
- Decide whether `finalize-health-report` remains, merges, or is renamed.
- Consolidate `calculate-efficacy-scores` / `recommend` boundaries and security harden legacy functions.
- Remove obsolete duplicate functions only after verification.

## 7. Exact Next Action
- **Begin Post-E2E Cleanup & Consolidation**.
