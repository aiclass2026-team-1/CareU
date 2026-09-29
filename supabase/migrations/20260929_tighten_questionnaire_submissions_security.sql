-- =============================================================================
-- Care U - Phase 7 Batch 5 Deployment Migration
-- File: supabase/migrations/20260929_tighten_questionnaire_submissions_security.sql
-- Status: PROPOSED_NOT_EXECUTED
-- Target: public.questionnaire_submissions
--
-- 【Security Rationale】
-- 1. Closes DEPLOYMENT_BLOCKED_BY_SECURITY_POLICY_REVIEW.
-- 2. Removes the public open INSERT policy ("Allow public insert submissions")
--    which previously allowed unrestricted client-side database inserts.
-- 3. Revokes direct INSERT, UPDATE, DELETE privileges from `anon` and `authenticated` roles.
-- 4. Ensures all submissions must route through the `submit-questionnaire` Edge Function,
--    which executes server-side validation, score derivation, and service-role persistence.
-- 5. Restricts direct database table access to read-only SELECT for authenticated owners.
-- =============================================================================

-- =============================================================================
-- SECTION A: Pre-Migration Read-Only Snapshot (READ_ONLY_VERIFICATION)
-- =============================================================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'questionnaire_submissions';
--
-- SELECT grantee, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public' AND table_name = 'questionnaire_submissions';
--
-- SELECT relname, relrowsecurity, relforcerowsecurity
-- FROM pg_class
-- WHERE relname = 'questionnaire_submissions';

-- =============================================================================
-- SECTION B: Migration Steps (PROPOSED_NOT_EXECUTED)
-- =============================================================================

-- 1. Drop public open insert policy
DROP POLICY IF EXISTS "Allow public insert submissions" ON public.questionnaire_submissions;

-- 2. Replace broad manage policy with strict read-only policy for authenticated owners
DROP POLICY IF EXISTS "Users can manage own submissions" ON public.questionnaire_submissions;
CREATE POLICY "Users can read own submissions"
  ON public.questionnaire_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Revoke direct write privileges from standard client roles
REVOKE INSERT, UPDATE, DELETE ON public.questionnaire_submissions FROM anon, authenticated;
GRANT SELECT ON public.questionnaire_submissions TO authenticated;

-- =============================================================================
-- SECTION C: Post-Migration Read-Only Verification (READ_ONLY_VERIFICATION)
-- =============================================================================
-- SELECT policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'questionnaire_submissions';
--
-- SELECT grantee, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public' AND table_name = 'questionnaire_submissions';

-- =============================================================================
-- SECTION D: Emergency Rollback (EMERGENCY_ROLLBACK_ONLY / RESTORES_KNOWN_INSECURE_BASELINE)
--
-- 【WARNING】
-- Executing this rollback re-opens public table insertion without server validation!
-- Preferred incident order:
--   1. Rollback or disable Edge Functions.
--   2. Investigate application issue.
--   3. Maintain tightened database security.
--   4. Execute this SQL only as last-resort explicitly approved emergency action.
-- =============================================================================
-- CREATE POLICY "Allow public insert submissions"
--   ON public.questionnaire_submissions
--   FOR INSERT
--   TO public
--   WITH CHECK (true);
--
-- DROP POLICY IF EXISTS "Users can read own submissions" ON public.questionnaire_submissions;
-- CREATE POLICY "Users can manage own submissions"
--   ON public.questionnaire_submissions
--   FOR ALL
--   TO public
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
--
-- GRANT DELETE, INSERT, SELECT, UPDATE ON public.questionnaire_submissions TO authenticated;
-- =============================================================================

