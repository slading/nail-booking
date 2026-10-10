-- =============================================================================
-- P1 — PROPOSED MIGRATION. NOT APPLIED. FOR REVIEW ONLY.
--
-- Purpose: enforce the mandatory reference photo for "Design + inspiration"
-- (Modelace + design_mode = 'combo') on the server, not just in the browser.
--
-- What this file does:
--   * ADDS one helper function, public.assert_reference_photo_for_combo().
--   * Revokes its EXECUTE from client roles (only the booking function calls it).
--
-- What this file does NOT do:
--   * It does not replace or recreate public.create_customer_booking(). That
--     function's production body is not in this repository. The helper must be
--     called from inside it. The exact one-line integration is documented in
--     backend/proposed/README.md ("Integration"). Do not apply that change
--     without reviewing the live definition (see production-readonly-checks.sql).
--   * It does not add a table CHECK constraint.
--   * It does not touch duration, Instagram, capacity, advisory locks,
--     availability, RLS, authentication, staff booking, or existing rows.
--
-- Error code: N2D12 — "reference photo required". It is a new code and is not
-- used by any existing N2D code in the frontend (N2D05, N2D06, N2D08, N2D09,
-- N2D10, N2D11). Confirm it is unused in the live database with
-- production-readonly-checks.sql, query 2, before applying.
-- =============================================================================

create or replace function public.assert_reference_photo_for_combo(
  p_service_category   text,
  p_design_mode        text,
  p_reference_photo_path text
)
returns void
language plpgsql
immutable
parallel safe
set search_path = ''
as $$
begin
  -- Only the Modelace + combo combination requires a photo. Every other
  -- combination returns without effect, so existing behaviour is unchanged.
  if p_service_category = 'modelace'
     and p_design_mode = 'combo'
     and nullif(regexp_replace(coalesce(p_reference_photo_path, ''), '\s', '', 'g'), '') is null then
    raise exception 'Reference photo is required for Design + inspiration'
      using errcode = 'N2D12';
  end if;
end;
$$;

comment on function public.assert_reference_photo_for_combo(text, text, text) is
  'P1: raises N2D12 when a Modelace combo booking has no reference photo path. Called from create_customer_booking before the storage existence check and before the advisory lock.';

-- Only the booking function (running as its owner) should call this helper.
revoke all on function public.assert_reference_photo_for_combo(text, text, text)
  from public, anon, authenticated;
