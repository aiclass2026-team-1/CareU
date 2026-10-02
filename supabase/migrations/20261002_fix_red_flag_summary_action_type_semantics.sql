-- =============================================================================
-- Care U - Fix Red Flag Summary Action Type Semantics & Backward Compatibility
-- File: supabase/migrations/20261002_fix_red_flag_summary_action_type_semantics.sql
-- Status: PROPOSED_NOT_EXECUTED
-- Target: public.report_red_flag_summary
--
-- 【Rationale】
-- 1. Invariant: Only 'BLOCK_RECOMMENDATION' rules must set global has_red_flags = true.
-- 2. 'SHOW_WARNING' rules represent advisory warnings only and must NOT contribute
--    to global has_red_flags or block product recommendation.
-- 3. Backward Compatibility: Preserves exact expected external contract for production
--    parse-health-report v6 queries:
--    - report_id
--    - has_red_flags (based on BLOCK_RECOMMENDATION)
--    - triggered_rule_count (count of all matched rules)
--    - warning_messages (string_agg text semantics)
-- =============================================================================

-- =============================================================================
-- SECTION A: Pre-Migration Read-Only Snapshot (READ_ONLY_VERIFICATION)
-- =============================================================================
-- SELECT table_name, view_definition
-- FROM information_schema.views
-- WHERE table_schema = 'public' AND table_name = 'report_red_flag_summary';
--
-- SELECT report_id, rule_key, metric_code, action_type, warning_message
-- FROM public.report_red_flag_matches
-- LIMIT 20;

-- =============================================================================
-- SECTION B: Migration Steps (PROPOSED_NOT_EXECUTED)
-- =============================================================================

CREATE OR REPLACE VIEW public.report_red_flag_summary AS
SELECT
  r.id AS report_id,

  EXISTS (
    SELECT 1
    FROM public.report_red_flag_matches m
    WHERE m.report_id = r.id
      AND m.action_type = 'BLOCK_RECOMMENDATION'
  ) AS has_red_flags,

  (
    SELECT COUNT(*)
    FROM public.report_red_flag_matches m
    WHERE m.report_id = r.id
  ) AS triggered_rule_count,

  (
    SELECT string_agg(
      m.warning_message,
      '；'
      ORDER BY m.rule_key
    )
    FROM public.report_red_flag_matches m
    WHERE m.report_id = r.id
  ) AS warning_messages

FROM public.lab_reports r;

-- =============================================================================
-- SECTION C: Post-Migration Read-Only Verification (READ_ONLY_VERIFICATION)
-- =============================================================================
-- SELECT
--   s.report_id,
--   s.has_red_flags,
--   s.triggered_rule_count,
--   s.warning_messages
-- FROM public.report_red_flag_summary s
-- LIMIT 10;

-- =============================================================================
-- SECTION D: Emergency Rollback (EMERGENCY_ROLLBACK_ONLY)
-- =============================================================================
-- CREATE OR REPLACE VIEW public.report_red_flag_summary AS
-- SELECT
--   r.id AS report_id,
--   COALESCE(bool_or(m.rule_key IS NOT NULL), false) AS has_red_flags,
--   COUNT(m.rule_key) AS triggered_rule_count,
--   string_agg(m.warning_message, '；' ORDER BY m.rule_key) AS warning_messages
-- FROM public.lab_reports r
-- LEFT JOIN public.report_red_flag_matches m ON r.id = m.report_id
-- GROUP BY r.id;
-- =============================================================================
