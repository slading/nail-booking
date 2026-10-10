# P1 backend guard — reference photo for "Design + inspiration"

**Status: PROPOSED. NOT APPLIED. NOT DEPLOYED.**
Nothing in this folder has been run against Supabase or production.

## Files

| File | Purpose |
|---|---|
| `20261010120000_p1_require_reference_photo_for_combo.sql` | The proposed migration. Adds one helper function and revokes client access to it. |
| `production-readonly-checks.sql` | Read-only queries to run in the Supabase SQL Editor before applying anything. |
| `test/reference-photo-guard.test.mjs` | Local tests on PostgreSQL 18 (PGlite, in memory). |
| `package.json` | Test script and the PGlite dev dependency. Isolated from the static frontend. |

## Why a helper, not a rewrite

The live `public.create_customer_booking(...)` definition is not in this repository. Rewriting it from memory would risk changing duration, locking, availability, or Instagram behaviour. The migration therefore:

- adds `public.assert_reference_photo_for_combo(service_category, design_mode, photo_path)`, and
- leaves `create_customer_booking` untouched until someone integrates one `perform` line into it after reviewing its live source.

## Behaviour of the helper

| Input | Result |
|---|---|
| category `modelace`, mode `combo`, path `NULL`, `''`, or whitespace-only | **raises `N2D12`** |
| category `modelace`, mode `combo`, non-empty path | returns (existence is checked by the existing Storage check) |
| any other mode, or any non-Modelace category | returns, no effect |

Whitespace is matched with `\s` rather than `btrim()`, which removes only spaces. The local test caught this: a path made only of tab and newline characters was accepted until the fix.

## Error code

- **`N2D12`**: "reference photo required". Meaning is fixed: the Modelace + Design + inspiration booking has no photo path.
- Not used by the frontend. The frontend uses `N2D05`, `N2D06`, `N2D08`, `N2D09`, `N2D10`, `N2D11`.
- Confirm it is unused in the live database (`production-readonly-checks.sql`, query 2) before applying.
- Do not reuse an existing code for this meaning.

## Integration (must be done by someone with the live function source)

Place the call inside `public.create_customer_booking(...)`:

- **after** the design mode and the service category have been read and validated,
- **before** the existing reference-photo Storage check,
- **before** `pg_advisory_xact_lock(...)`, the slot re-check, and the insert.

```sql
-- inside public.create_customer_booking(...), at the placement above
perform public.assert_reference_photo_for_combo(
  <the service-category variable the function already reads>,
  p_design_mode,
  p_reference_photo_path
);
```

Why this placement:

- Before the Storage check, so an empty path gets `N2D12` and not the storage error.
- Before the lock and the insert, so a rejected request inserts nothing and takes no lock.
- The helper reads no tables, so it changes neither lock ordering nor concurrency.

The one-line change is the whole of the change to the function. Do not replace the function body. If the live source differs from this description, stop and revise the placement.

## Pre-apply checklist

1. Run `production-readonly-checks.sql` queries 1–6 in the SQL Editor and paste the results.
2. Confirm `N2D12` is absent from query 2.
3. Confirm the category value is `modelace` (query 5).
4. Confirm the bucket and object naming match the frontend (query 6): bucket `reference-photos`, names like `pending/<uuid>/photo.jpg`.
5. Read the live function's photo check, and confirm the code it raises for a nonexistent photo (test 2c assumes a stand-in code).
6. Apply the migration **first**, then the integration line. The migration alone changes no behaviour, because nothing calls the helper yet.

## Staging test plan (not run; needs a non-production Supabase project or branch)

Run these only on staging. Do not run them against production. Each test is mapped to the requested case.

| # | Case | How to test on staging | Expected |
|---|---|---|---|
| 1 | Combo without photo | `create_customer_booking(... 'modelace', p_design_mode='combo', p_reference_photo_path=null ...)` | Error `N2D12`, no row in `appointments` |
| 2 | Combo with empty path | same, with `''` and `'   '` | Error `N2D12`, no row |
| 3 | Combo with nonexistent photo | path `pending/does-not-exist/photo.jpg` | Rejected by the existing Storage check; no row |
| 4 | Combo with valid photo | upload a real test image via the frontend or Storage API, then call with its path | Accepted, one row, `reference_photo_path` set |
| 5 | Other modes without photo | `none` and `design` with `null` path | Accepted exactly as before |
| 6 | Duration unchanged | for each length, compare `duration_minutes` of `combo` vs `design` with no add-ons | Combo is exactly +30; `none` and `design` unchanged |
| 7 | Concurrency unchanged | two simultaneous combo bookings for the same slot, plus the existing concurrency test | Exactly one succeeds, the other `N2D08`, same as before the change |

Clean up staging rows afterwards. Only staging data is written.

## Rollback

Order matters:

1. Remove the `perform` line from `create_customer_booking` (restore the previous definition from the saved source).
2. Then drop the helper:
   `drop function public.assert_reference_photo_for_combo(text, text, text);`

Do not drop the helper while the function still calls it: every combo booking would then fail.

## Frontend compatibility review (commit `69d5bd3`)

Reviewed against the local frontend patch.

| Area | Finding | Status |
|---|---|---|
| Normal combo flow | The frontend blocks a combo booking without a photo before any upload or RPC (`customerBookingInFlight` guard plus the photo check in confirm). `N2D12` should not occur in normal use. | Verified in source, and in the frontend test suite (A, A2, D) |
| Empty path | The frontend sends `null` when there is no photo. It never sends `''` (`uploadReferencePhoto` returns a path or throws). | Verified in source |
| Error mapping | `confirmCustomerBooking` maps every RPC error except `N2D08` to `bookingNetworkError`, "check your internet connection". A backend `N2D12` would show that misleading message. | **Gap. Frontend change proposed, not applied.** |
| Path format | Frontend uses bucket `reference-photos` and `pending/<uuid>/photo.jpg`. The existing Storage check must use the same bucket and naming. | Unverified until `production-readonly-checks.sql` query 6 and the live function source are read |
| Staff bookings | `staffCreateBooking` calls `create_staff_booking` and sends no design mode, so this guard does not affect it. | Verified in source |
| Orphan uploads | The photo is uploaded before the RPC. If the RPC rejects, the object remains in `pending/`. | Pre-existing. Rare for N2D12 because the frontend blocks the case first |
| Instagram `""` | Still sent as an empty string. This is unchanged by this migration. | Open risk R2 (below) |
| Duration and capacity | Not touched by the frontend patch or by this migration. | Unchanged |

**Proposed frontend follow-up (not applied; needs approval).** In the `catch` of `confirmCustomerBooking`, next to the existing `N2D08` branch:

```js
if (err?.code === "N2D12") { render(); showToast(t("photoRequiredMessage")); }
else if (err?.code === "N2D08") { /* existing branch */ }
```

## Remaining risks

- **R1 (critical until integrated): the rule is not enforced until the one-line integration is applied.** Until then, a direct RPC call can still create a combo booking without a photo. This is the gap being fixed.
- **R2: Instagram `""` acceptance is unverified.** If `customer_instagram` or `p_customer_instagram` is NOT NULL or has a CHECK, empty Instagram fails. This affects customer bookings and the staff paths introduced in the frontend patch.
- **R3: the existing Storage check's error code is unknown.** The nonexistent-photo case (test 3) is rejected, but the frontend cannot map that code until it is read from the live function.
- **R4: `N2D12` depends on the category spelling.** The helper compares with `'modelace'`. If the stored category differs, the rule silently does not apply. Check query 5.
- **R5: the test double is not production.** Section 2 of the tests proves the ordering contract only. Duration (test 6) and concurrency (test 7) are not testable locally and need the staging plan.
- **R6: Postgres version.** Tests ran on PostgreSQL 18 via PGlite. Supabase's version may differ. The SQL uses only long-standing features, but confirm on staging.

## Not verified here

- The live `create_customer_booking` source, its photo check, and its error codes.
- Storage bucket and policy configuration.
- Duration, locking, and concurrency behaviour on a real database.
- Supabase role grants (only simulated with PGlite roles `anon` and `authenticated`).
- Anything on production. The sandbox cannot reach the Supabase host.

## Running the local tests

```bash
cd backend/proposed
npm install
npm test
```

The tests create an in-memory database. They do not touch Supabase.
