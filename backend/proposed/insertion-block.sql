-- =============================================================================
-- P1 — PROPOSED INSERTION BLOCK. NOT APPLIED. FOR REVIEW ONLY.
--
-- Insert this block into public.create_customer_booking(...) at the ONE location
-- described in backend/proposed/README.md:
--   * inside the function's main body (not inside an EXCEPTION-catching sub-block),
--   * AFTER the service category variable has been assigned,
--   * IMMEDIATELY BEFORE the existing Storage photo-existence check (raises N2D07),
--   * therefore also before pg_advisory_xact_lock(...), the slot re-check, and the insert.
--
-- The only placeholder is <service_category_variable>. Replace it with the variable
-- name the function already uses for the service category. Do not guess it.
-- =============================================================================

  -- P1: "Design + inspiration" (Modelace + combo) requires a reference photo path.
  -- Missing, empty, or whitespace-only paths are rejected with N2D12 before any
  -- Storage lookup, lock, or insert.
  if <service_category_variable> = 'modelace'
     and p_design_mode = 'combo'
     and nullif(regexp_replace(coalesce(p_reference_photo_path, ''), '\s', '', 'g'), '') is null then
    raise exception 'Reference photo is required for Design + inspiration'
      using errcode = 'N2D12';
  end if;
