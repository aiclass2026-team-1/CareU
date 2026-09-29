# Care U｜Questionnaire Backend Implementation Specification (Phase 7 Batch 5)

- **Date**: 2026-09-29
- **Status**: `LOCAL_IMPLEMENTATION_VALIDATED` (Local source and tests validated; pending production deployment review)
- **Branch**: `feat/questionnaire-backend`
- **Scope**: Formal backend Edge Function implementation for questionnaire plan building and submission validation/persistence.

---

## 1. Source Locations & Function Names

The formal backend implementation is organized under `supabase/functions/`:

```text
supabase/
  functions/
    _shared/
      auth.ts                  # Auth & session identity helpers
      cors.ts                  # CORS handling & standardized response formatters
      presentationConfig.ts    # Versioned presentation metadata config (v1)
      planBuilder.ts           # Pure plan builder domain logic
      submissionValidator.ts   # Pure submission validation & score derivation
      types.ts                 # Backend DTOs & domain types
      planBuilder.test.mjs     # Plan builder unit tests (7 tests passing)
      submissionValidator.test.mjs # Submission validator unit tests (13 tests passing)
    build-questionnaire-plan/
      index.ts                 # Edge Function endpoint: build-questionnaire-plan
    submit-questionnaire/
      index.ts                 # Edge Function endpoint: submit-questionnaire
    deno.json                  # Deno runtime configuration
```

---

## 2. API Contracts

### 2.1 Plan API (`build-questionnaire-plan`)

- **Endpoint**: `/functions/v1/build-questionnaire-plan`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "reportId": "uuid | null",
    "mode": "full | supplement",
    "profile": {
      "gender": "MALE | FEMALE"
    }
  }
  ```
- **Response Body** (HTTP 200, strictly compatible with `TargetQuestionnairePlan`):
  ```json
  {
    "reportId": "uuid | null",
    "mode": "full | supplement",
    "recognizedMetrics": ["WAIST"],
    "missingMetrics": ["SBP", "DBP"],
    "questions": [
      {
        "id": 1,
        "efficacyId": 1,
        "efficacyName": "調節血脂",
        "category": "RISK_FACTOR",
        "questionText": "平均每週紅肉/油炸食物攝取頻率？",
        "scoringDesc": "0=低 1=中 2=偏高 3=高",
        "controlType": "single_choice",
        "options": [
          { "key": "low", "label": "低 (0次)", "score": 0 },
          { "key": "moderate", "label": "中 (1-2次)", "score": 1 }
        ],
        "required": true,
        "groupKey": "lifestyle",
        "applicableGender": "ALL",
        "isActive": true
      }
    ]
  }
  ```

### 2.2 Submission API (`submit-questionnaire`)

- **Endpoint**: `/functions/v1/submit-questionnaire`
- **Method**: `POST`
- **Request Body** (Strictly compatible with `TargetQuestionnaireSubmissionPayload`):
  ```json
  {
    "reportId": "uuid | null",
    "mode": "full | supplement",
    "answers": [
      { "questionId": 1, "value": "moderate" },
      { "questionId": 32, "value": ["other"], "detailText": "芒果過敏" },
      { "questionId": 13, "value": 85.5 }
    ],
    "submittedAt": "2026-09-29T10:00:00.000Z"
  }
  ```
- **Response Body** (HTTP 201):
  ```json
  {
    "success": true,
    "submissionId": "persisted-uuid"
  }
  ```

---

## 3. Database Interactions

### 3.1 Reads
- `question_bank`: Read active question rows (`is_active = true`) with domain definitions (`efficacy_id`, `category`, `question_text`, `options_json`, `applicable_gender`).
- `lab_reports`: Read report metadata (`user_id`, `status`) to verify existence and check caller ownership in supplement mode.
- `lab_report_metrics`: Read extracted metrics for `reportId` to build trusted `recognizedMetrics` / `missingMetrics` context.

### 3.2 Writes
- `questionnaire_submissions`: Insert validated submission record with JSONB answers:
  ```json
  {
    "user_id": "auth.uid() | null",
    "report_id": "uuid | null",
    "answers": [
      {
        "question_id": 1,
        "value": "moderate",
        "score": 1,
        "source": "USER_INPUT"
      }
---

## 4. Validation & Score Derivation Rules

1. **Question Existence & Active Status**: Verified against `question_bank` and `presentationConfig`.
2. **Duplicate Answers**: Reject duplicate `questionId` within a single submission (`DUPLICATE_ANSWER`).
3. **Single Choice**: Value must match one of `presentation.optionKeys`. Score is derived directly from corresponding index in `question_bank.options_json`.
4. **Multi Choice**: Value must be an array of valid option keys.
   - **Score Rule Status**: `MULTI_SELECT_SCORE_RULE_UNRESOLVED`. No authoritative aggregation rule (sum, average, max, min) is invented. Validated multiple semantic values are preserved, and `score: null` is assigned.
   - **Exclusive Options**: If an option marked `exclusive` (e.g. `none_known`) is selected alongside other options, rejected with `EXCLUSIVE_CONFLICT`.
   - **Required Detail Input**: If an option requires text explanation (e.g. `other`), `detailText` must be non-empty, otherwise rejected with `REQUIRED_DETAIL_MISSING`.
5. **Numeric Questions**: Validates numeric bounds (`min`, `max`, `step`) or accepted `unknownOption` key (`unknown`). Raw validated value is preserved; numeric scoring rule is marked as `NUMERIC_SCORE_RULE_UNRESOLVED` (`score: null` is preserved, not coerced to 0).
6. **Text Questions**: Validates string type and non-empty requirement. `score: null` is preserved.
7. **Source Assignment**: All user-submitted answers are stamped with trusted `source: 'USER_INPUT'`. Client cannot fabricate `OCR_AUTO` or authoritative scores.

---

## 5. Security & Auth Boundaries

1. **Bearer Token Authentication**: Identity is extracted via `Authorization: Bearer <token>` and verified through Supabase Auth (`getUser`).
2. **Guest Flow & Report Ownership**:
   - Authenticated User: `report.user_id` must match `auth.uid()`; mismatched access is rejected with `REPORT_ACCESS_DENIED`.
   - Guest Access to Authenticated Report: Guest callers cannot access reports with `user_id !== null` (`REPORT_ACCESS_DENIED`).
   - Guest Access to Guest Report: `report.user_id === null` does **not** grant open access. Access requires a matching `session_id`. Where a signed/trusted guest session token mechanism is not yet deployed, marked as `GUEST_SESSION_AUTH_UNRESOLVED` and blocked from unauthorized access.
3. **Server-Side Timestamp Authority**: Client-provided `submittedAt` is strictly metadata and does not determine database `created_at` or `updated_at`. Server timestamps (`new Date().toISOString()`) are authoritative.
4. **Service Role Key Usage**: Environment variables are referenced dynamically without hardcoding keys or secrets in source code.

---

## 6. Duplicate & Idempotency MVP Behavior

- Current status: `CURRENT_MVP_DUPLICATES_POSSIBLE`.
- Repeated submissions currently create distinct rows in `questionnaire_submissions` with new UUIDs. Full idempotency mechanisms will be addressed in future phases.

---

## 7. Error Contract

Standardized JSON error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "questionId": 1
  }
}
```

Key error codes:
- `INVALID_REQUEST`, `INVALID_MODE`, `INVALID_PROFILE`
- `REPORT_REQUIRED`, `REPORT_NOT_FOUND`, `REPORT_ACCESS_DENIED`, `REPORT_CONTEXT_MISMATCH`, `GUEST_SESSION_AUTH_UNRESOLVED`
- `INVALID_QUESTION`, `INACTIVE_QUESTION`, `INVALID_OPTION`, `INVALID_VALUE`, `VALUE_OUT_OF_RANGE`
- `DUPLICATE_ANSWER`, `EXCLUSIVE_CONFLICT`, `REQUIRED_DETAIL_MISSING`, `REQUIRED_FIELD_MISSING`
- `PLAN_GENERATION_FAILED`, `PERSISTENCE_FAILED`, `SERVER_CONFIG_ERROR`

---

## 8. Deployment Blockers & Unresolved Items

1. **`DEPLOYMENT_BLOCKED_BY_SECURITY_POLICY_REVIEW`**: Production database currently has a public INSERT policy on `questionnaire_submissions`. Production deployment must ensure direct client table inserts are disabled and traffic is routed exclusively through the Edge Function.
2. **`GUEST_SESSION_AUTH_UNRESOLVED`**: Production pre-login guest supplement flow requires a signed/trusted session token mechanism before guest report access can be exposed in live deployment.
3. **`MULTI_SELECT_SCORE_RULE_UNRESOLVED`**: Multi-choice answers preserve validated semantic keys with `score: null` until clinical/domain aggregation rules are finalized.
4. **`NUMERIC_SCORE_RULE_UNRESOLVED`**: Numeric questions preserve validated values and record `score: null` until medical scoring thresholds (e.g., waist cm cutoffs) are formalized by the domain team.
5. **Assessment Orchestration**: Formula 2 scoring and assessment persistence remain deferred to Batch 7 (`assessment_results`).


---

## 9. Authenticated-Only Production Deployment Plan (PROPOSED_NOT_EXECUTED)

### 9.1 Rollout Strategy: Phase 1 (Authenticated-Only Technical Pilot)
- **Pilot Purpose**: Prove the end-to-end production round-trip under strict security controls before opening guest access:
  `Authenticated User -> build-questionnaire-plan -> TargetQuestionnairePlan -> submit-questionnaire -> questionnaire_submissions -> Persisted UUID`.
- **Supported Scope in Pilot**:
  - `mode: 'full'`, `reportId: null`
  - Authenticated JWT required (`verify_jwt = true`)
- **Unsupported in Pilot**:
  - Public Guest Full flow (`PUBLIC_GUEST_FULL_NOT_ENABLED_IN_PILOT`)
  - Guest Supplement flow (`GUEST_SESSION_AUTH_UNRESOLVED`)
  - Authenticated Supplement flow (backend-capable, but excluded from Phase 1 pilot acceptance)

### 9.2 Gateway JWT Decision & Security Label
- **Gateway Setting**: Deploy both `build-questionnaire-plan` and `submit-questionnaire` with `verify_jwt = true`.
- **Security Label**: `PUBLIC_GUEST_FULL_NOT_ENABLED_IN_PILOT`.
- **Function-Side Enforcement**: Function-side `supabase.auth.getUser(token)` and `validateReportOwnership` remain active as defense-in-depth.

### 9.3 Direct Database Write PASS Criteria
- **Anon Direct INSERT**: Direct table mutation using the anon key MUST fail (via SQL permission denied or RLS check violation), resulting in **0 rows created**.
- **Authenticated Direct INSERT**: Direct table mutation using an authenticated user session MUST fail (via SQL permission denied or RLS check violation), resulting in **0 rows created**.
- **Service-Role Edge Function Write**: Persistence succeeds exclusively through the backend `submit-questionnaire` function.

### 9.4 Pre/Post-Migration SQL & Snapshot (READ_ONLY_VERIFICATION)
- **Migration File**: `supabase/migrations/20260929_tighten_questionnaire_submissions_security.sql`
- **Pre-Migration Snapshot Queries** (`READ_ONLY_VERIFICATION`):
  ```sql
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies WHERE schemaname = 'public' AND tablename = 'questionnaire_submissions';

  SELECT grantee, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'questionnaire_submissions';

  SELECT relname, relrowsecurity, relforcerowsecurity
  FROM pg_class WHERE relname = 'questionnaire_submissions';
  ```
- **Proposed Migration SQL** (`PROPOSED_NOT_EXECUTED`):
  ```sql
  DROP POLICY IF EXISTS "Allow public insert submissions" ON public.questionnaire_submissions;
  DROP POLICY IF EXISTS "Users can manage own submissions" ON public.questionnaire_submissions;
  CREATE POLICY "Users can read own submissions"
    ON public.questionnaire_submissions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  REVOKE INSERT, UPDATE, DELETE ON public.questionnaire_submissions FROM anon, authenticated;
  GRANT SELECT ON public.questionnaire_submissions TO authenticated;
  ```
- **Post-Migration Verification Queries** (`READ_ONLY_VERIFICATION`):
  ```sql
  SELECT policyname, cmd, roles, qual, with_check
  FROM pg_policies WHERE schemaname = 'public' AND tablename = 'questionnaire_submissions';

  SELECT grantee, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'questionnaire_submissions';
  ```

### 9.5 Emergency Rollback & Safety Warning
- **Rollback SQL** (`PROPOSED_NOT_EXECUTED`):
  ```sql
  -- EMERGENCY_ROLLBACK_ONLY / RESTORES_KNOWN_INSECURE_BASELINE
  CREATE POLICY "Allow public insert submissions"
    ON public.questionnaire_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);
  DROP POLICY IF EXISTS "Users can read own submissions" ON public.questionnaire_submissions;
  CREATE POLICY "Users can manage own submissions"
    ON public.questionnaire_submissions
    FOR ALL
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  GRANT DELETE, INSERT, SELECT, UPDATE ON public.questionnaire_submissions TO authenticated;
  ```
- **Incident Rollback Procedure**:
  1. Rollback or disable newly deployed Edge Functions.
  2. Investigate application / payload issue.
  3. Maintain tightened database security.
  4. Restore insecure public INSERT only as an explicitly approved last-resort emergency action.

### 9.6 Deployment Order
1. Record pre-migration snapshot of policies and grants.
2. Execute security migration SQL (`20260929_tighten_questionnaire_submissions_security.sql`).
3. Execute post-migration verification queries and direct DB write failure tests (anon & authenticated).
4. Deploy `build-questionnaire-plan` Edge Function with `verify_jwt = true`.
5. Deploy `submit-questionnaire` Edge Function with `verify_jwt = true`.
6. Run full authenticated pilot smoke test suite (Tests A through J).
7. Authorize Batch 6 Frontend Live Integration upon successful pilot verification.

### 9.7 Authenticated Pilot Smoke Test Sequence
- **Test A (JWT Required)**: Request without Authorization header -> Expect gateway HTTP 401 Unauthorized.
- **Test B (Authenticated Full Plan)**: POST `/build-questionnaire-plan` with valid JWT, `{ "reportId": null, "mode": "full", "profile": { "gender": "FEMALE" } }` -> Expect HTTP 200 & valid `TargetQuestionnairePlan`.
- **Test C (Authenticated Submission)**: POST `/submit-questionnaire` with valid JWT and `TargetQuestionnaireSubmissionPayload` -> Expect HTTP 201 & `{ "success": true, "submissionId": "<uuid>" }`.
- **Test D (DB Persistence)**: Query `questionnaire_submissions` -> Verify exactly 1 row created, `user_id = auth.uid()`, `report_id = null`, `source = 'USER_INPUT'`, server timestamps.
- **Test E (Anon Direct Table INSERT)**: Attempt direct table INSERT using anon key -> Must fail, **0 rows created**.
- **Test F (Authenticated Direct Table INSERT)**: Attempt direct table INSERT using authenticated session -> Must fail, **0 rows created**.
- **Test G (Invalid Option Rejected)**: Submit invalid option key with valid JWT -> Expect HTTP 400 `INVALID_OPTION`.
- **Test H (Browser Score Ignored)**: Submit client-provided score -> Verify database stores server-derived score or null, ignoring client score.
- **Test I (Unauthenticated Supplement Blocked)**: Submit supplement request without JWT -> Blocked by gateway (HTTP 401).
- **Test J (Authenticated Supplement Excluded)**: Excluded from Phase 1 pilot acceptance.

### 9.8 Future Guest Identity Architecture
- **Desired Goal**: Guest users can complete health check upload and questionnaire flows without requiring upfront login.
- **Preferred Architecture Candidate**: **Supabase Anonymous Auth** (`anonymous user session -> JWT with anon auth.uid() -> verify_jwt = true -> guest-owned lab_reports & questionnaire_submissions`).
- **Current Status**: `GUEST_SESSION_AUTH_UNRESOLVED` (Deferred to Phase 2 guest identity milestone; current upload flow remains untouched).


### 9.9 Pre-Migration Snapshot & Rollback Reconcile Policy
- **Live State Preservation**: Before executing migration, operator must capture and preserve actual live state for `pg_policies`, `role_table_grants`, and RLS enabled/forced state across `PUBLIC`, `anon`, and `authenticated` roles.
- **Grant vs Policy Distinction**: RLS policy role `public` is NOT equivalent to a PostgreSQL table GRANT. The static rollback snippet must be reconciled against the actual pre-migration snapshot before execution.
- **Emergency Classification**: Rollback is classified as `EMERGENCY_ROLLBACK_ONLY` / `RESTORES_KNOWN_INSECURE_BASELINE`. Preferred incident response is disabling/rolling back Edge Functions while keeping tightened database security. Reopening public INSERT is a last-resort emergency action only.

### 9.10 Authenticated Pilot Execution & Vercel Note
- **Pilot Client Requirement**: Initial backend smoke testing requires a real Supabase Auth test user and valid JWT, executed via trusted test clients (e.g. `curl`, Postman). Frontend Vercel authentication is not required for this backend test.
- **Function JWT Config**: Operator must verify that Supabase CLI/config deploys both `build-questionnaire-plan` and `submit-questionnaire` with `verify_jwt = true`.
- **Vercel Production Host**: `https://care-u-sigma.vercel.app`. Before Batch 6 Vercel live integration, verify that CORS permits the Vercel origin, frontend uses only safe client environment variables, and no service-role secret is exposed to the client bundle.

