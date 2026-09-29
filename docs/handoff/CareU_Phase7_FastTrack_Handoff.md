# Care U｜Phase 7｜Fast-Track Handoff Document
# Date: 2026-09-29

## 1. Current Branch & Checkpoint
- **Branch**: `feat/questionnaire-live-integration`
- **Base HEAD**: `4e6b313` (`fix: secure questionnaire submission ownership`)
- **Status**: Batch 6A Human Acceptance PASS (`BATCH_6A_HUMAN_ACCEPTANCE = PASS`)

## 2. Production Canary Endpoint Status
- `build-questionnaire-plan`: ACTIVE (`verify_jwt = true`)
- `submit-questionnaire`: ACTIVE (`verify_jwt = true`)
- **Auth**: Supabase Anonymous Auth (`ensureAuthSession`)

## 3. Progress Summary
- **Batch 5**: Completed backend security audit and tightened `questionnaire_submissions` security migration.
- **Batch 6A**: Frontend live integration complete for `/questionnaire?mode=full`. Full flow successfully fetches plan, authenticates via anonymous auth, renders dynamic runtime questions, collects answers, submits payload to canary endpoint, stores real `submissionId` in `careu-submission-id` (`sessionStorage`), and transitions to Loading-2 and Report.
- **Preview Isolation**: `#/preview/questionnaire?source=contract-fixture` remains strictly isolated using `mockQuestionnaireService` (0 live network requests).
- **Supplement Mode**: Supplement mode (`mode=supplement`) remains on existing current behavior (`SUPPLEMENT_LIVE_INTEGRATION_DEFERRED`).

## 4. Dual-Path Fast-Track Goal (Tonight)
- **Path A**: Full Questionnaire → Assessment → Recommendation → Report
- **Path B**: Upload (OCR) → Supplement Questionnaire → Assessment → Recommendation → Report

## 5. Architectural & Domain Notes
- **Deferred Function Consolidation**: Edge function consolidation and shared module refactoring deferred.
- **Scoring Unresolved Notes**: Multi-select score aggregation rule unresolved (`MULTI_SELECT_SCORE_RULE_UNRESOLVED`, score = null). Server derives trusted scores.
- **Questionnaire UI Cleanup (`POST_E2E_QUESTIONNAIRE_UI_CLEANUP`)**:
  - A. Formal questionnaire must not display `scoringDesc` / internal scoring rules (e.g., `0=否 1=是`, `男≥90/女≥80 記3分`, `SBP≥130 / DBP≥85 記3分`) to users.
  - B. Production `question_bank.question_text` values containing answer-method text or option lists (e.g., `(cm，直接輸入)`, `（是／否）`, Q32 option list) should be decoupled into metadata controls. Production `question_bank` not modified in Batch 6A.
- **Model / Cost Strategy**: Maintained lightweight standard client integration without extra tokens or external API overhead.

## 6. Exact Next Action
- **Dual-Path Fast Track** (Batch 7 Assessment & Recommendation Integration).
