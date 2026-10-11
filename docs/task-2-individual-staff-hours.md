# Task 2 — Individual staff working hours (findings + proposal)

**Status: OWNER DECISION — "workaround + documentation" (no schema or code change
for the staff-hours capability).** The salon configures the requested scenario
today with the existing Block-time / Adjust-day tools (§2). The one unrelated
latent defect reported in §3 was approved and fixed (the day-settings capacity
picker now always includes the current value). Options 1 and 2 in §4 remain
unbuilt, pending a future decision.

Salon's example, verbatim: *"On the same day: staff member A works from 14:00,
staff members B and C work from the morning."*

> Backend facts below come from the frontend call contract in
> `supabase-client.js` and the notes in `README.md`. The live Supabase project's
> migration history is **not** in this repository, so confirm column/function
> names against the backend project before changing them. No production
> database was touched while producing this document.

---

## 1. Findings — does the capability exist?

**Short answer: no per-staff schedule exists.** There is no "staff member" entity
in the booking model at all. What exists is a **salon-level capacity pool**:

| Concept | Where it lives | Scope |
|---|---|---|
| Weekly opening hours | `salon_hours (salon_id, weekday, configured, start_time, end_time)` | per salon + weekday |
| One-day override (hours and/or capacity) | `day_overrides (salon_id, override_date, configured, start_time, end_time, capacity)` | per salon + **date** |
| Unavailability / reduced capacity for a window | `blocks (salon_id, block_date, start_time, end_time, units, reason)` | per salon + date + **time window** |
| Normal concurrency | `salons.default_capacity` | per salon |
| Bookings | `appointments` — has **no staff/employee column** (id, salon, date, start/end, service snapshot, customer fields, status…) | — |
| `staff_profiles` | auth-only (`id`, `display_name`, `salon_scope`, `is_active`) — used to decide *who may open the dashboard*, never for availability | — |

Availability is therefore computed as a pool, not per person:

- customer-facing: `get_available_slots(p_salon_id, p_date, p_duration_minutes, p_ignore_appointment_id)`
  (server-authoritative; `supabase-client.js` only renders what it returns),
- staff-side pickers: `availableSlots(salonId, date, duration, ignoreId)` in
  `app.js`, which counts overlapping appointments + `blocks.units` against
  `getDayConfig(...).capacity` in 30-minute steps. Both are used for the UI only;
  the RPC re-checks capacity under an advisory lock before writing.

So: **A–C cannot be modelled as individual people.** What *can* be modelled is
"A is not available until 14:00", i.e. the same operational effect on booking.

---

## 2. The salon's example works today with the existing tools

Capacity 3 (A + B + C), A unavailable until 14:00:

1. Staff → **Blokovat čas** (Block time).
2. Salon: the one where it applies.
3. Date: the specific date.
4. From `08:00` → Until `14:00` (or your opening time → 14:00).
5. **Blokovaná kapacita (capacity to block): 1** — one person, not the whole salon.
6. Reason: e.g. "A od 14:00".
7. Save.

Result (and what the customers see):

- 08:00–14:00: at most **2** simultaneous bookings — B and C. A third request
  for the morning is not offered and would be rejected server-side.
- From 14:00: **3** simultaneous bookings — A is back in the pool.

*(The pool arithmetic above is verified locally by the new regression tests. The
customer-facing numbers come from the server's `get_available_slots`, which this
sandbox cannot query — it is expected to follow the same block/capacity rules
the local pickers mirror, but do a one-off check in the salon's staging project
on a test date before relying on it for a busy day.)*

Equivalent shortcuts:

- Whole day with one person fewer → **Upravit den** (Adjust day) → capacity 2.
- Whole day closed for one location → block all units for the full opening hours.

If A's 14:00 start repeats, the block has to be created **per date** (blocks are
date-scoped rows; there is no "every weekday from 14:00" rule). Until the
product changes, this is 1 short action per date.

### What this approximation deliberately cannot do

- Assign a booking to a named person ("this 15:00 client is A's").
- Show a per-person column/calendar, or count "bookings per staff member".
- Model skills (e.g. only B does lashes) — every service is bookable by the pool.
- Express "A works 14:00–19:00 *instead of* a morning shift" as a schedule; it is
  expressed as reduced capacity before 14:00, which achieves the same booking
  result as long as total capacity after 14:00 is correct.
- Keep two people's lunch breaks distinct: a 1-unit block at 12:00 reduces the
  pool by one for everyone, not "B is at lunch".

---

## 3. Defect check (only confirmed defects should be fixed)

Inspected: `getDayConfig`, `availableSlots`, `renderDaySchedule`, `renderTimeline`,
`assignLanes`, block modal + save path, day-settings modal + save path, weekly
hours modal + save path, and the customer availability path.

- No confirmed defect found in the capacity/block/override behaviour itself:
  blocks are scoped by salon + date + window, overrides by salon + date,
  existing bookings are never modified by a block (now covered by a regression
  test), and the staff pickers refuse overlapping starts (also covered).
- **One latent issue — reported, approved, fixed:** the day-settings capacity
  picker offered only `1..4` (`daySettingsModal`, `[1,2,3,4]`). If a salon's
  capacity were ever configured above 4, opening that dialog would show "1" and
  saving would silently set capacity to 1. Current production capacity is 2 for
  both locations, so this was not a live defect. Fix applied (same pattern as the
  earlier service-duration fix): the option list is built from
  `[1,2,3,4] ∪ {current value}`, so for capacities 1–4 the dialog is byte-for-byte
  the same as before, and a higher capacity can no longer be silently reset.
  Covered by the `T2(latent fix)` regression test.

---

## 4. Smallest implementations consistent with the architecture

If you want more than the workaround in §2, there are two honest steps. Both keep
existing bookings valid and require no changes to production data.

### Option 1 — no schema change (staff-side convenience only)

Keep the capacity pool. Add **one** staff-side improvement: when creating a
block, allow it to be applied over a **date range** (creating one block row per
date, same table, same semantics) instead of clicking through each date. This
covers "A starts at 14:00 every weekday" in one action and adds no new tables,
no new availability logic, and nothing to keep in sync.

- Risk: low. Purely additive UI; the same RPC/table write is used per date.
- Does not deliver named staff, per-person calendars or per-person assignment.

### Option 2 — true per-staff schedules (schema change; needs approval)

Only if the salon genuinely needs per-person schedules/assignment. Proposed
minimal shape, in the architecture's existing style (additive tables + one
availability function, no rewrite of booking paths):

1. **`staff_members`** — `id`, `salon_id`, `display_name`, `active`, `sort_order`
   (or reuse `staff_profiles` + a `salon_id` link if the same people log in).
2. **`staff_working_hours`** — `staff_id`, `weekday`, `configured`, `start_time`,
   `end_time` (same shape as `salon_hours`).
3. **`staff_day_overrides`** — `staff_id`, `override_date`, `configured`,
   `start_time`, `end_time` (same shape as `day_overrides`).
4. **`appointments.staff_id`** — nullable. `NULL` = "salon pool" (every existing
   row, so **no existing booking is invalidated and none needs a migration
   value**).
5. **Availability** — a new/changed server function computes the union of that
   date's *effective* per-staff windows (weekly hours + date override), clipped
   to the salon's own open hours, and enforces concurrency **per staff member**
   (1 booking per person at a time) instead of a flat `capacity`. The salon's
   existing `default_capacity`/`day_overrides.capacity`/`blocks.units` remain the
   fallback whenever a day has **no** staff schedule configured — this keeps both
   salons working unchanged until they opt in.
6. **Staff UI** — a schedule editor per staff member (weekly + per-date), and
   `appointments.staff_id` shown/assignable in the dashboard.
7. **Customer UI** — the smallest change is *none*: customers keep booking the
   pool, and the pool's availability now derives from staff windows. Optional
   later: "any / with A / with B" choice. That is a product decision, not a
   technical one, so it stays out until you ask for it.

Blocked on your approval: the schema objects above, any change to the availability
RPCs, and any back-fill of data (none is required by design, since `staff_id`
defaults to `NULL`).

---

## 5. Verification status for this task

| Verification item | Status |
|---|---|
| Existing bookings remain valid | ✅ Covered by a new test: adding a block writes only a `blocks` row and leaves the bookings untouched. No schema/data change was made, so nothing existing can be invalidated. |
| No double bookings | ✅ Covered: the staff time picker refuses overlapping starts (capacity 1 case), and the full-block case closes the window. Booking writes stay server-authoritative under the advisory lock. |
| Correct availability per staff member | ⛔ Not applicable yet — no per-staff model exists. Availability is per salon pool; the pool behaviour is covered by the new tests. |
| Cancellation cannot affect unrelated bookings | ✅ Covered in `docs/task-1-cancellation-by-phone.md` + `tests/client-feedback.test.mjs` (T1). |
| Mobile UI works | ✅ No existing screen changed layout. The new device-booking list (Task 1) reuses the mobile-first `.field`/`.quiet-btn`/card pattern and wraps on narrow screens; the staff capacity fix only changes a `<select>`'s option list. A local preview server is available for a phone check. |
| Existing tests pass | ✅ 48/48 (`npm test` in `tests/`): 27 pre-existing + 21 new. |
| Regression tests for both scenarios | ✅ `tests/client-feedback.test.mjs` — 12 cancellation tests (`T1`, `T1(device)`) and 9 availability/capacity tests (`T2`), including the capacity-picker fix. |

---

## 6. Decisions taken (owner)

- [x] **Workaround + documentation** — the salon uses the existing tools
      described in §2; no schema/code change for the staff-hours capability.
      §2 is written so it can be handed to the salon team as instructions.
- [x] **Day-settings capacity-picker fix** — applied (see §3).
- [ ] **Option 1** — date-range block creation (staff UI only, no schema change).
      Not built; available if the per-date clicking becomes a burden.
- [ ] **Option 2** — per-staff schedules (schema change). Not built. Would start
      with a written design + an unapplied SQL migration, and nothing would touch
      the live project without a second explicit go-ahead.

Product questions that must be answered before Option 2 is built: may customers
choose a specific staff member (or always "any")? Is a staff member's capacity
exactly one client at a time? What should happen on days where no staff schedule
is configured (keep the current salon capacity, or "closed")?
