-- =============================================================================
-- P1 — PROPOSED INSERTION BLOCK. NOT APPLIED. FOR REVIEW ONLY.
--
-- Insert into public.create_customer_booking(...) with these properties:
--   * inside the function's main body, not inside an EXCEPTION-catching sub-block;
--   * immediately BEFORE the existing Storage photo-existence check (raises N2D07),
--     and therefore before pg_advisory_xact_lock(...), the slot re-check, and the insert.
-- No placeholder: the block uses only p_design_mode and p_reference_photo_path.
-- =============================================================================

  -- P1: "Design + inspiration" requires a reference photo path. Combo is valid only
  -- for Modelace, which the existing function already enforces. A NULL, empty, or
  -- whitespace-only path is rejected with N2D12 before any Storage lookup, lock, or insert.
  if p_design_mode = 'combo'
     and nullif(regexp_replace(coalesce(p_reference_photo_path, ''), '\s', '', 'g'), '') is null then
    raise exception 'Reference photo is required for Design + inspiration'
      using errcode = 'N2D12';
  end if;
