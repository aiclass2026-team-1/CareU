# Care U｜Phase 7｜Fast-Track Handoff Document
# Date: 2026-09-29

## 1. Current Branch & Checkpoint
- **Branch**: `feat/questionnaire-live-integration`
- **Base HEAD**: `d17d9a6` (`feat: integrate live full questionnaire flow`)
- **Status**: Dual Path Fast Track Stage 1 (Shared Assessment → Recommendation → Live Report) COMPLETE

## 2. Production Canary Endpoint Status
- `build-questionnaire-plan`: ACTIVE (`verify_jwt = true`)
- `submit-questionnaire`: ACTIVE (`verify_jwt = true`)
- `finalize-health-report`: ACTIVE (`verify_jwt = true`, Canary v1 deployed)
- **Auth**: Supabase Anonymous Auth (`ensureAuthSession`)

## 3. Progress Summary
- **Batch 5**: Completed backend security audit and tightened `questionnaire_submissions` security migration.
- **Batch 6A**: Frontend live integration complete for `/questionnaire?mode=full`. Full flow successfully fetches plan, authenticates via anonymous auth, renders dynamic runtime questions, collects answers, submits payload to canary endpoint, stores real `submissionId` in `careu-submission-id` (`sessionStorage`), and transitions to Loading-2.
- **Stage 1 (This Stage)**: Connected real `submissionId` → `finalize-health-report` orchestrator → Assessment (Formula 2 with 60/40 fixed weights) → Recommendation (`recommend` with `health_food_products`) → normalized report payload → Loading-2 integration → live ReportView binding.
- **Preview Isolation**: `#/preview/questionnaire?source=contract-fixture` and `#/preview/report` remain strictly isolated using `mockQuestionnaireService` and fixture profiles (0 live network requests).
- **Supplement Mode**: Supplement mode (`mode=supplement`) remains on current behavior (`SUPPLEMENT_LIVE_INTEGRATION_DEFERRED`).

## 4. Dual-Path Fast-Track Goal (Tonight)
- **Path A**: Full Questionnaire → Assessment → Recommendation → Report (Stage 1 Complete)
- **Path B**: Upload (OCR) → Supplement Questionnaire → Assessment → Recommendation → Report (Stage 2 Next)

## 5. Architectural & Domain Notes
- **Deferred Function Consolidation**: Edge function consolidation and shared module refactoring deferred.
- **Scoring Unresolved Notes**: Multi-select score aggregation rule unresolved (`MULTI_SELECT_SCORE_RULE_UNRESOLVED`, score = null). Server derives trusted scores.
- **Questionnaire UI Cleanup (`POST_E2E_QUESTIONNAIRE_UI_CLEANUP`)**:
  1. Formal questionnaire must not display `scoringDesc` / internal scoring rules (e.g., `0=否 1=是`, `男≥90/女≥80 記3分`, `SBP≥130 / DBP≥85 記3分`) to users.
  2. Production `question_bank.question_text` values containing answer-method text or option lists (e.g., `(cm，直接輸入)`, `（是／否）`, Q32 option list) should be decoupled into metadata controls. Production `question_bank` not modified in Stage 1.
  3. Q27 blood pressure: currently presentation `controlType = text`, missing "目前不知道", should later become structured BP input metadata with `unknownOption` (no hardcoded frontend-only workaround).
- **Model / Cost Strategy**: Maintained lightweight standard client integration without extra tokens or external API overhead.

## 6. Exact Next Action
- **Dual-Path Fast Track Stage 2** (Upload OCR → Supplement Mode Live Integration).
