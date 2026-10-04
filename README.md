# N2D — nail salon booking prototype

A mobile-first N2D Nails salon booking flow. The **customer-facing booking flow** is wired to a real, deployed Supabase backend (Phase 3A); the **staff dashboard** remains the original local-only prototype (unchanged this phase — see "Technical scope").

## Run locally

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://localhost:4173`. The customer flow will call the real Supabase project over the network (see "Customer flow backend (Phase 3A)" below) — an internet connection is required for it to load catalog/availability/booking data, even when run locally.

## Included workflows

- Client booking for either N2D location
- Duration-aware, continuous availability
- Daily capacity and blocked-time rules
- Immediate appearance of a client booking in the staff schedule
- Cancellation with immediate capacity release
- Rescheduling with availability revalidation
- Manual staff booking, including the same required Modelace nail-length step and optional Zdobení add-ons as the client flow
- Editable services and service durations
- Editable weekly hours and one-day overrides
- Day, week, and calendar staff views
- Locally persisted demo data and reset control
- Czech interface by default, with a persistent CS / EN switcher
- Reminder preference/status without pretending to send messages
- Optional single reference photo attached by the client (JPG/PNG/WebP), shown on review, confirmation, and in the staff appointment detail; not shown at all when no photo is attached

## Customer flow backend (Phase 3A)

The customer booking flow (salon → service → time → details → review → confirmation) no longer uses `localStorage` as its source of truth. It reads and writes a real Supabase project over the public REST/RPC API, using only the **anon/publishable key** (safe to ship in a browser bundle — access control is enforced by Postgres Row-Level Security on the project, not by keeping this key secret). No service_role key or database password is ever present in frontend code.

- **New file: `supabase-client.js`** — the entire surface area that talks to the backend (loaded before `app.js`, after the Supabase JS CDN script). It is deliberately kept separate from `app.js` so the wiring is easy to audit in one place.
  - Catalog (`salons`, `public_services`, `public_add_ons`, `modelace_lengths`) — public, price-free reads, cached in memory for 45s.
  - Availability — `get_available_slots(salon_id, date, duration_minutes, ignore_appointment_id)`, a read-only RPC that only affects what the calendar *displays*; it is never trusted for the actual booking decision.
  - Booking creation — `create_customer_booking(...)`, the same atomic, capacity-safe, server-authoritative RPC used since the Phase 1/2 backend work. Every business rule (contact validation, Modelace length/design-mode rule, duration/price snapshot, capacity) is re-checked server-side regardless of what the client sent.
  - Reference photo upload — `uploadReferencePhoto()` uploads into the existing private `reference-photos` Storage bucket before the booking RPC is called; the customer can never read a photo back (write-only drop box, by design).
- **`app.js` changes** — the customer-flow rendering/state logic was reworked to read exclusively from the remote catalog/availability helpers (`remoteServiceById`, `remoteSalonName`, `remoteLengthMinutesFor`, etc.) instead of the old hardcoded/local `state.*` catalog, and `confirmCustomerBooking()` now calls the real booking RPC instead of writing into local `state.appointments`. Loading/error states (catalog failed to load, availability failed to load, a slot was taken by someone else, the booking network request failed, a photo failed to upload) reuse the existing UI language/visual style — no redesign.
- **The staff dashboard was unaffected by this phase.** At the time Phase 3A shipped it still read/wrote `localStorage` exactly as before, including the demo "Reset data" control — resetting demo data never touched Supabase, and nothing in the customer flow ever touched the staff dashboard's `localStorage` key. Staff/manager auth and syncing the staff dashboard to the real backend were explicitly out of scope for Phase 3A — see "Staff dashboard backend + manager auth (Phase 3B)" below for how that was subsequently wired up.
- **One new, additive database migration** (`supabase/migrations/20260101000007_customer_availability.sql` in the backend project) adds the single `get_available_slots` read-only function described above. It changes no existing table, policy, or function — everything else on the backend is exactly the frozen Phase 2 deployment. Applied to the real project and verified end-to-end (real calendar counts/slots, a full booking click-through, a real two-client capacity race, and a Modelace + add-ons + photo booking with server-computed duration confirmed correct).

## Staff dashboard backend + manager auth (Phase 3B)

The staff/manager dashboard (Kalendář salonu) is now backed by the same real Supabase project as the customer flow, protected by real Supabase Auth manager sign-in, instead of `localStorage`. The customer flow above is completely unchanged by this phase.

- **Auth.** `supabase-client.js` now keeps `persistSession: true` (only the auth session token, in Supabase's own localStorage key — never booking/customer data) and adds `staffSignIn`/`staffSignOut`/`onStaffAuthChange`/`isStaffAuthenticated`/`isStaffAuthorized`/`currentStaffProfile`. "Authorized" means both a valid session **and** an active row in `staff_profiles` for that user (`is_active = true`) — a valid login alone is not enough.
- **UI gate.** `renderStaff()` in `app.js` now branches at the top: a checking-session state, a login form (email/password, reusing the existing input/button styles — no redesign), an access-denied screen with a sign-out button for an authenticated-but-not-staff account, and only then the existing, unchanged staff dashboard. The mobile nav bar's staff shortcuts (Add/Schedule/Setup) are hidden until authorized, matching the same gate. A "Sign out" button was added to the staff sidebar/mobile nav.
- **Data.** Real `salons`, `salon_hours`, `services`, `add_ons`, `appointments` (±45-day window around the date being viewed, re-centered as staff navigate further away), `blocks`, and `day_overrides` are fetched and reshaped into the *exact* same object shape the old local-demo `state` always had, then assigned to `state` right before every `renderStaff()` render pass. This means every existing calendar/week/month/setup/modal render function needed **zero changes** — only the data source changed. Reference photos are never embedded directly; a staff-only, 1‑hour signed URL is generated per appointment that has one (`reference-photos` bucket, `is_staff()`-gated).
- **Writes.** All 13 existing staff actions (manual booking, cancel, reschedule, edit contact details, block/unblock time, day capacity/hours override, add/edit service, edit weekly hours) now call the corresponding Supabase RPC or RLS-gated table write instead of mutating local state, then refetch and re-render. Appointment create/cancel/reschedule go through the existing `create_staff_booking` / `cancel_appointment` / `reschedule_appointment_staff` RPCs (atomic advisory-lock + capacity re-check, same as the customer flow) — nothing added a new write path around them.
- **No backend changes were required for this phase.** Inspection found the Phase 1 backend already fully covers every existing staff action (RPCs + RLS), so no new migration was written.
- **localStorage is no longer authoritative for staff/production data.** The local demo dataset (`createDemoState()`/`saveState()`/"Reset demo") is left in place unchanged, but is no longer reachable from the staff view at all once a manager is signed in — `renderStaff()` re-bridges `state` to the real Supabase data on every render, so clicking "Reset demo" while looking at the real calendar cannot leak fake data into it (verified) and never touches Supabase.
- **Known hard limit:** `staff_profiles` has no rows in the production project yet (per instructions, no manager account was invented). Until a real manager identity/email is provided and provisioned, the login screen is reachable and correctly rejects everyone, but the fully-authorized happy path cannot be exercised end-to-end with a real login. See the phase closeout notes for exactly how this was verified as thoroughly as possible without inventing an account.

## Confirmed N2D business data in this build

- **Brand:** N2D (replaces the earlier generic "Notebook" placeholder).
- **Locations:**
  - N2D Nails Orlí 17 — Orlí 469/17, Brno-střed.
  - N2D Nails Kubíčkova — Kubíčkova 1080/6, Brno-Bystrc.
- **Orlí 17 opening hours (confirmed):** Mon–Fri 08:00–19:00, Sat–Sun 08:00–18:00. Editable through staff setup like any other day/weekly hours.
- **Orlí 17 default capacity:** 2 simultaneous bookings (the confirmed normal staffing level). One team member's after-school availability is not modeled as a schedule — staff can still adjust/block capacity per day as needed.
- **Real service catalog (both locations), taken directly from N2D's official price lists:** Manikúra, Modelace umělých nehtů, Úprava nehtů, Prodlužování řas, Obočí & řasy, and Pedikúra, each with the exact CZK prices, "od" (starting-price) items, and Nová aplikace / Doplnění / Bez laku / Gellak / CND Shellac variants shown on the official price sheets. **Orlí 17 and Kubíčkova (Bystrc) have their own independent catalogs and prices** — picking a location only ever shows that location's real menu, never the other's. Prices themselves are staff/admin-only data now — see "Customer-facing prices removed" below.
  - **Zdobení (nail art)** is a Modelace umělých nehtů add-on, not a standalone bookable service and not available under Manikúra. After picking Doplnění or Nová aplikace, the customer first picks a **required nail length** (Short 50 min / Medium 55 min / Long 60 min / Extra long 70 min). Once a length is chosen, the customer then picks exactly one **design mode** — still an in-place panel, no extra wizard step:
    - **No design** — continues with the length's base duration only; no Zdobení picker, no reference photo.
    - **Design** — reveals the same 11-item Zdobení picker as before, unchanged (0 or more designs, additive durations).
    - **Design combo** — the same Zdobení picker, plus an optional reference photo for the desired design, reusing the existing single-photo reference-attachment feature (same JPG/PNG/WebP, local-only, max-1 limits) rather than a new upload system. The photo never changes the duration.
    Continue stays disabled until both a length and a design mode are chosen; choosing "No design" or "Design" clears any previously attached reference photo (photo is combo-only), and choosing "No design" also clears any previously chosen Zdobení designs.
  - **Final appointment duration for Modelace** = the selected length's minutes + the sum of every chosen Zdobení design's `durationDelta`. Each design's delta (identical at both locations): Francie · Ombré +10, Malování 1 nehet +2, Malování komplet · Jednoduché +20, Třpytky · 1 nehet +1, Třpytky · Komplet +5, Magnetické laky · 1 nehet +1, Magnetické laky · Komplet +5, Chromové · 1 nehet +1, Chromové · Komplet +5, Kamínky dle velikosti +10, Lakování 3 a více barev +5. Multiple selected designs sum their deltas. This final duration is used consistently for slot availability, the confirm-time validation, the saved appointment's duration/end time, and therefore what the staff calendar blocks off.
  - The old "Dlouhé nehty" Zdobení line item was removed — nail length is now its own required step instead of an add-on.
  - **Staff manual booking (Staff → Add booking) applies the exact same Modelace rule**, driven by the same shared `customerBookingDuration` helper as the client flow: choosing a Modelace service reveals the same required length step, then the same optional 11-item Zdobení panel once a length is picked, and the same summed final duration drives the manual time-slot list, conflict validation, saved duration/end time, and what the staff calendar blocks off. Non-Modelace manual bookings are unaffected and keep using the service's fixed catalog duration.
  - Most durations come directly from the salon's confirmed timing notes. A handful of real menu items had no confirmed duration anywhere and use a clearly-flagged, easily adjustable default so the online calendar keeps working — see "Explicit demo assumptions" below for exactly which ones and what to check.
  - The old placeholder demo services (Refill / New set / Lashes / Pedicure) have been fully replaced by this real catalog.
- **Customer contact fields:** Instagram username and phone number are both collected (Instagram + phone were confirmed as N2D's required contact channels); name remains required because it is used throughout the staff calendar as the appointment's display label.

### Customer-facing prices removed

Per the confirmed N2D staff requirement, the customer-facing booking flow (service cards, selected-service summaries, the Zdobení/length panel, the review step, and the confirmation screen) no longer displays any Kč prices. Selected service, nail length, and chosen Zdobení designs still show by name so the customer can confirm their choices — only the monetary amounts are hidden. All price data is preserved unchanged in the underlying catalog/appointment records and is still shown in the staff views (Setup → Services, the manual booking dropdown, and the staff appointment detail modal).

### Cross-tab booking safety (localStorage prototype note — staff dashboard only)

**This section describes the staff-side manual booking flow only.** The customer booking flow no longer has this limitation at all: capacity is enforced atomically in Postgres (a transaction-scoped advisory lock keyed on salon+date, held before the availability check), so two customers on two different devices/browsers genuinely cannot both win the same last slot — this has been tested against the real deployed backend with real concurrent requests. What follows is retained unchanged because it still applies to the local-only staff dashboard, which is out of scope for this phase.

The staff dashboard has no backend, so two browser tabs sharing the same `localStorage` can each read the calendar, both see the same slot as free, and both attempt to confirm it — the later `saveState()` call can otherwise silently overwrite the earlier one's booking. The smallest reliable mitigation for a local-only prototype is implemented for both the client confirm step and staff manual booking:

- The read → validate availability → append → save sequence is wrapped in a single named [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) (`navigator.locks.request`) critical section, so only one tab performs it at a time when the browser supports Web Locks (all evergreen desktop/mobile browsers do).
- Inside that critical section, the latest persisted state is re-read from `localStorage` immediately before checking capacity/conflicts, so a tab never validates against — or saves over — data another tab already committed while this tab was mid-flow.
- If Web Locks isn't available, the same reload-then-validate step still runs immediately before saving, closing the common "stale snapshot overwrites a newer save" case even though it can't be a true cross-process mutex without it.
- A `storage` event listener refreshes this tab's in-memory copy whenever another tab writes to the shared key (e.g. so a staff member's calendar tab picks up a client's booking from another tab), skipping the refresh only while the user is actively typing into a text field so it never clobbers in-progress keystrokes.

**Remaining limitation:** this only makes the localStorage prototype behave sanely for the demo — it is not a substitute for real atomic capacity enforcement. Web Locks only serializes tabs of the *same browser*, not multiple devices/browsers, and without Web Locks (rare) there is still a narrow window where two truly simultaneous saves in different browsers could each read `localStorage` before either writes. A production build needs a backend that enforces capacity atomically (e.g. a database transaction or serialized queue), which is out of scope for this static prototype.

## Explicit demo assumptions / TBD items

These are intentionally left unresolved and are not exposed to customers:

- Kubíčkova's opening hours are **not yet confirmed** and remain the original editable demo hours (`09:00–19:00` weekdays, weekends TBD) — do not treat them as final.
- The exact schedule of the team member who only works after school is not modeled; capacity can be adjusted per day/time by staff as that schedule is confirmed.
- Whether bookings require salon approval, or are instantly confirmed as in this preview, is not yet decided.
- Whether customers will eventually be able to cancel or reschedule their own bookings is not yet decided.
- **Durations assumed (not confirmed from any recording), currently defaulted in code and freely editable per item in Staff → Setup → Services & duration:**
  - Obočí & řasy — single treatments (Barvení řas, Barvení obočí, Úprava obočí): assumed 30 min.
  - Obočí & řasy — single lifting treatments (Lash lifting alone, Brow lifting alone): assumed 60 min.
  - Obočí & řasy — lifting + tint combinations (all 4 combo items): assumed 75 min.
  - Standalone lash removal (Odstranění řas / v případě nové aplikace, both locations): assumed 20 min.
  - Úprava nehtů · Změna barvy (both locations): assumed 20 min.
  - N2D Luxusní spa pedikúra, all 3 lacquer variants, both locations: assumed 90 min (no confirmed duration exists for this service at either location).
  - Orlí's "Manikúra s klasickým lakováním" (no Bystrc equivalent to inherit from): assumed 35 min.
  - Orlí's N2D Základní pedikúra and Footlogix Medicinální pedikúra durations were **not separately assumed** — they're the same named services as Bystrc's, just at different prices, so Bystrc's confirmed minutes were reused for them per the salon's own duration-inheritance guidance (not a guess).
- Two real recording-confirmed durations could not be placed on the current official price lists and were intentionally **left out of the catalog** rather than invented a price for: "Masáž nohou" (20 min) and pedicure "Samostatné lakování" (Gel-lak 30 / CND Shellac 45). Add them back with a confirmed price if they're still offered.
- The old demo-only "Pedikúra s modeláží" (75 min) has been removed — it predates the current official price list and is not the same service as the new "N2D Luxusní spa pedikúra".
- Whether brow services will be offered is not yet decided.
- Production Instagram integration (DM → automated booking link → this booking app → staff schedule) is out of scope for this preview; only the booking web app itself is implemented.
- Reminder timing/delivery implementation is not connected; reminder preference is recorded only.
- Existing appointments retain their saved duration if the service catalog changes.
- Reducing capacity or adding a block does not automatically cancel existing bookings; conflict policy is TBD.

## Technical scope

Plain HTML, CSS, and JavaScript, plus the Supabase JS client (loaded from a CDN) for the customer flow's backend calls — see "Customer flow backend (Phase 3A)" above. No payments, no other external libraries, and no production integrations beyond that one backend. Only the Supabase anon/publishable key is ever present in the browser; there are no other credentials in this repo.

The **staff dashboard** (and only the staff dashboard — see above) still stores its state in the browser's `localStorage` under the key `n2d-salon-prototype-v4`, tagged internally with a schema version number (bumped to `5` when the real catalog replaced the placeholder demo services, and to `6` for the Modelace nail-length step + non-zero Zdobení durationDelta values) — any saved data from an older schema version is discarded automatically and regenerated fresh. The interface language is stored separately under `n2d-salon-language`. The **customer booking flow** does not use `localStorage` as a source of truth for anything real — it is a thin client over the real backend (see above).

### Reference photo

A client can attach at most one reference photo (JPG/PNG/WebP) when booking. It is resized client-side (max ~900px on the long edge) and re-encoded as a JPEG data URL for in-page preview (the review step and the confirmation screen), exactly as before.

- **Customer flow:** the resized image is uploaded to the real, private `reference-photos` Storage bucket immediately before the booking is submitted (see "Customer flow backend (Phase 3A)" above); only its Storage path — never the image itself — is sent to `create_customer_booking`. The confirmation screen's photo preview is drawn from the browser's own in-memory copy, never read back from Storage (the bucket is a write-only drop box for anon; this was already the accepted backend design from Phase 1/2). Tested end-to-end against the real project, including a real upload landing at the expected path.
- **Staff dashboard (manual booking / edit):** unchanged from the original prototype — the photo is still stored inline as a data URL in the staff dashboard's own `localStorage` blob, with the same caveats as before (not durable/shared storage, no cross-device sync). This is out of scope for this phase.
