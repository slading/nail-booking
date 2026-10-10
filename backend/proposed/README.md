# P1 backend change: reference photo for "Design + inspiration"

**Status: PROPOSED. NOT APPLIED. NOT DEPLOYED. No SQL has been executed for this version.**

## Deployable artifacts (supersede the block-only file)

Directory `backend/proposed/p1-combo-photo/`:

- `up_create_customer_booking_p1_combo_photo.sql`: complete `CREATE OR REPLACE FUNCTION`, built from the supplied production definition with the validation block inserted.
- `rollback_create_customer_booking_original.sql`: the exact supplied production definition, for rollback.
- `p1_combo_photo.diff`: unified diff between the two. It contains only the 9 inserted lines plus one blank line.

Both SQL files end with `;`, the statement terminator that `pg_get_functiondef` omits. It is identical in both files. Nothing has been executed.

Verified from the supplied definition (`VERIFIED IN PRODUCTION SOURCE`, not run):
- The Modelace branch validates `p_design_mode` (N2D05, N2D06) before the new block.
- For non-Modelace services the `else` branch sets `p_design_mode := null` before the block, so the block never fires for them.
- The block sits after the duration/price calculation and before the N2D07 check, so it runs before the advisory lock, `is_slot_bookable`, and the INSERT.

The earlier helper-function proposal has been removed. It is replaced by a single inline validation block inside the existing `public.create_customer_booking`.

## What changes

One block of SQL, `insertion-block.sql`, is inserted into the existing function. Nothing else in the function changes. The function is not recreated or rewritten here.

The block rejects `p_design_mode = 'combo'` when `p_reference_photo_path` is NULL, empty, or whitespace-only. It raises `N2D12`. It uses only the two parameters and needs no variable from the existing function. Combo is valid only for Modelace, which the existing function already enforces.

## Insertion location

Insert the block:

- **Inside** the function's main body. Do not place it in a nested `BEGIN ... EXCEPTION` sub-block.
- Both parameters are function arguments, so they are available at the start of the body.
- **Immediately before** the existing Storage photo-existence check, which raises `N2D07`.

This location is also before `pg_advisory_xact_lock(...)`, the slot re-check, and the insert, because the photo check runs before the lock in the existing order. A rejected request therefore inserts nothing and takes no lock.

No placeholder remains. Nothing needs to be substituted.

## Error codes

| Code | Meaning | Source |
|---|---|---|
| `N2D12` | Reference photo required for Design + inspiration (Modelace + combo, path missing or blank) | **New, this change** |
| `N2D07` | Existing photo-existence check (path supplied but not found in Storage) | Existing, unchanged |

One check remains before applying: a case-sensitive search for `N2D12` in the definition you already have. The frontend does not use it. This confirms there is no clash inside this function. Other database objects are not covered by this check.

## Review checklist

1. Confirm the insertion point is at the function's top level, immediately before the existing `N2D07` check.
2. Confirm `N2D12` does not appear elsewhere in the definition.
3. Confirm the parameter names `p_design_mode` and `p_reference_photo_path` match the definition (the frontend sends these names).
4. Confirm the existing combo/Modelace rule (`N2D05`/`N2D06`) runs before the insertion point. Verified in the supplied definition (see above).

## Staging verification (not run)

Run only on a non-production Supabase project or branch.

| Case | Expected |
|---|---|
| Combo, NULL path | `N2D12`, no appointment row |
| Combo, `''` path | `N2D12`, no row |
| Combo, whitespace-only path (for example `'   '`) | `N2D12`, no row |
| Combo, path that does not exist | `N2D07`, no row (existing behaviour) |
| Combo, valid uploaded path | Booking created, reference path stored |
| `none` or `design`, NULL path | Unchanged: booking created |
| Combo duration | Exactly +30 minutes over the selected length |
| Two simultaneous combo bookings for one slot | One succeeds; the other fails as before |

## Rollback

Remove the inserted block, restoring the previous function definition. The change adds no separate database objects, so there is nothing else to drop.

## Frontend mapping for `N2D12`

Before this patch, `confirmCustomerBooking` in `app.js` had one special case for `N2D08`. Every other error fell through to `bookingNetworkError`, which tells the customer to check their connection. An `N2D12` would have shown that misleading message. **This patch now adds the `N2D12` branch** (`app.js`, in the `confirmCustomerBooking` catch).

The minimal change is one extra branch in the same `catch`:

```js
      if (err?.code === "N2D08") {
        c.step = 2; c.start = null; render(); showToast(t("slotUnavailable"));
      } else if (err?.code === "N2D12") {
        render(); showToast(t("photoRequiredMessage"));
      } else {
        render();
        showToast(t("bookingNetworkError"));
      }
```

`photoRequiredMessage` already exists in both CS and EN from commit `69d5bd3`. No new strings are needed.

Optional, not required for P1: `N2D07` could map to `photoUploadErrorRequired`, since a missing object means the photo upload did not succeed. It currently falls through to the connection message.

Regression tests N1 (N2D12 shows the required-photo message), N2 (generic errors still show the connection message) and N3 (N2D08 unchanged) cover this in `tests/regression.test.mjs`.

## Frontend compatibility

- The frontend blocks a Modelace combo booking without a photo before any upload or RPC call. Under normal use, `N2D12` should not occur.
- The frontend sends `null` when no photo is attached and never sends an empty string for the path. The block handles both.
- Instagram: the reviewed definition accepts NULL and empty strings and normalizes empty to NULL. This resolves the earlier open question for the customer flow.
- Staff edit writes `customer_instagram` directly to `appointments`, not through `create_customer_booking`. **This patch normalizes an empty value to `null`** (`supabase-client.js`, `staffUpdateAppointmentContact`), so the direct write never sends `""`. The reason given is that the `appointments` CHECK constraint rejects `''`. That constraint is not in this repository and was not verified in this sandbox; the normalization is safe regardless.
- Staff booking uses `create_staff_booking`, which this change does not touch.

## Remaining risks

- **Not enforced until applied.** Until the block is inserted and the function is redeployed, a direct RPC call can still create a combo booking without a photo.
- **Combo/Modelace ordering.** Resolved from the supplied definition: the block runs after the Modelace validation and after non-Modelace services have `p_design_mode` nulled, so it cannot change their behaviour.
- **Staging not run.** The duration (+30) and concurrency results come from the definition review. They have not been re-verified by running them against a database.
- **Frontend mapping applied in this patch.** It is only reached by clients that bypass the frontend check; the server rule itself is still not applied (see the first risk).
