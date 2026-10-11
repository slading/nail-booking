# Task 1 — Cancellation by phone number (findings, options, decision)

**Status: OPTION B IMPLEMENTED (owner decision).** The security model is
unchanged: the server still requires the booking reference **and** the matching
phone number, and still applies the 2-hour cutoff. What was added is a
device-local memory of the customer's **own** booking references, so a returning
customer on the same browser can pick their booking and type only their phone
number. See §5 for exactly what changed.

> Original analysis below is kept as recorded at review time. Option A
> (discoverability copy) shipped alongside B; options C/D/E remain open and were
> not implemented.

This document records what the cancellation flow does today, what the salon's
request would require, and the options — including why "phone number alone"
cannot be implemented as-is without weakening the protection against cancelling
somebody else's booking.

> Backend facts below come from the frontend call contract in
> `supabase-client.js` and the notes in `README.md`. The live Supabase project's
> migration history is **not** in this repository, so any statement about an
> existing database function must be confirmed against the backend project
> before it is changed. No production database was touched while producing this
> document.

---

## 1. What exists today

**Where the customer enters the flow**

- Confirmation screen (step 5): the booking reference is displayed
  (`renderCustomerStep()` → `reviewRow(t("bookingReference"), …)`) and a
  "Máte rezervaci? Zrušit ji" button
  (`data-action="go-cancel-this-booking"`) opens the cancel screen **with the
  reference already prefilled** (`app.js`, click handler → `c.cancelAppointmentId
  = target.dataset.id`).
- The cancel screen itself is a separate view (`ui.customer.view === "cancel"` →
  `renderCancelLookup()`), reachable again at any time by reloading/returning.

**What it asks for**

| Field | Required | Source |
|---|---|---|
| Booking reference (`#cancelAppointmentId`) | yes | the appointment id, shown on the confirmation screen |
| Phone number (`#cancelPhoneInput`) | yes | the phone used at booking |

`submitCancelLookup()` (app.js) only:

1. requires both fields non-empty (`requiredContact` toast otherwise),
2. sanity-checks the phone format (`isValidPhone`, UX-only),
3. calls `cancelRemoteCustomerBooking(appointmentId, phone)`.

**What actually decides**

```js
// supabase-client.js
supabaseClient.rpc("cancel_appointment_customer", {
  p_appointment_id: appointmentId,
  p_customer_phone: phone,
})
```

The RPC is the only writer. Per the migration notes in `README.md` /
`backend/proposed/README.md`, it normalizes the phone digits, matches them
against the stored booking, enforces the **2-hour-before-appointment cutoff** in
the salon's local time, and returns (or raises):

| Code | Meaning | UI message |
|---|---|---|
| `N2D09` | no booking matches that reference + phone | "Nenašli jsme rezervaci…" |
| `N2D11` | already cancelled | "Tato rezervace už byla zrušena." |
| `N2D10` | inside the 2-hour cutoff | "Rezervaci lze zrušit jen do 2 hodin před termínem…" |
| other | transport/unknown | generic connection message |

**Ownership model in one line:** the printed reference *is* a capability (the
appointment's opaque id — not derivable from a phone number or a date), and the
phone number is the second, weaker factor. Both are required per request.

**Multiple bookings on one phone number**

Nothing in the data model prevents it, and the current flow handles it fine:
each booking has its own reference, only that reference is ever sent, and the
server resolves exactly one row. The customer cancels the booking whose
reference they hold.

**Where the "reservation number is missing" complaint really bites**

Only in this case: the customer no longer has the confirmation screen open and
did not keep the reference. Everything on-device already works — the shortcut on
the confirmation screen prefills the reference, so today's happy path already
needs only the phone number typed.

---

## 2. What the request would require

"Cancel with my phone number, no reservation number" = *given a phone number,
find that person's bookings (and then cancel one)*. Two things follow:

1. **A new backend capability.** Nothing in the current API can list or resolve
   bookings from a phone number: the only customer-facing read is
   `get_available_slots` (what the calendar shows), and the only cancel is
   id + phone. A phone lookup needs a new database function, i.e. a schema
   change — which is explicitly gated on your approval.
2. **A different security model**, because a phone number is not a secret.

### Why "knowing the phone number alone" is not acceptable (as requested)

- Phone numbers are **enumerable**: an attacker (or an ex-partner, a
  competitor, a stranger who saw the number on Instagram) can guess or harvest
  numbers in the +420 mobile range and try them.
- A lookup endpoint that accepts a phone number and returns bookings leaks
  **who is booked, when, for what, at which salon, and often their name** — for
  any number the caller guesses. That is a privacy breach even without any
  cancellation.
- If the same endpoint can also cancel, then **any person who knows a phone
  number can destroy that person's booking** — the exact outcome your brief
  forbids. A brute-force with candidate numbers in the morning is enough.
- Rate limiting alone does not fix this: it slows guessing, it does not make
  possession of a phone number proof of identity.

Conclusion: additional verification **is** necessary. There is no backend
change I can safely make here on my own, and no client-side change that could
honestly deliver "phone number only".

---

## 3. Options

| # | Model | Customer experience | What it requires | Security |
|---|---|---|---|---|
| **A** | **Keep reference + phone; improve discoverability** (status quo + copy/UI polish) | Types the reference + phone; shortcut from the confirmation screen = phone only | Nothing | Unchanged (strongest of the options) |
| **B** | **Device memory**: the customer's own booking references are remembered in their browser, so "my bookings" can be listed on their own phone and cancelled with just the phone number | On the same device/browser: pick my booking → type my phone → cancel. New device: reference still needed | Frontend only (one small localStorage store). No backend, no schema change | **Unchanged** — the reference is still required by the server, it just comes from the customer's own device instead of being typed |
| **C** | **One-time code (SMS OTP)**: type phone → receive a code → list/cancel | True "phone only, any device" | New SMS provider + credentials, a new verification table, new functions, rate limiting, cost per message, GDPR/contract review. The product has **no** SMS/reminder infrastructure yet (reminders are deliberately not connected) | Strong, industry standard |
| **D** | **Salon-mediated request**: phone-only form files a *cancellation request*; staff confirm it in the dashboard | Customer asks; the salon acts (before the 2-hour cutoff) | New table/endpoint + new staff UI + notification of the salon; schema change | Safe (no self-service cancellation without identity), but slower and manual for the salon |
| **E** | **Phone + weak second factor with a phone-only API** (e.g. phone + surname, or phone + booking date) | Type phone + surname → see/cancel | New lookup function + rate limiting; schema change | **Weak** — surnames and dates are guessable/known; still lets a motivated attacker cancel a booking. Not recommended as a self-service cancellation |

**Recommendation**

1. If the goal is "the customer must not have to *find* the number": **B**. It
   removes the pain for the realistic case (customer books and later cancels
   from the same phone), and the server-side security model — reference + phone
   must both match — is provably unchanged. It is the only option that is both
   *safe to ship now* and *a real improvement*.
2. If the goal is "phone number only, from any device, safely": **C**. It is a
   real project (provider contract, cost, backend + schema work) and needs your
   approval and a vendor decision; I would write the design first and apply
   nothing.
3. With either choice, keep **A**'s copy/UI improvements.

Options **D** and **E** are only worth it if you specifically want no
self-service path (D) or accept a materially weaker check (E).

---

## 4. Decision taken (owner)

- [x] **B** *(approved)* — remember each customer's own booking references on
      their device ("Moje rezervace na tomto zařízení"), so returning customers
      cancel without hunting for the number.
- [x] **A** *(shipped alongside B)* — the cancel screen's hint now says where the
      reference can be found.
- [ ] **C** — SMS one-time code (true phone-only, any device). Not implemented;
      needs a provider contract + backend/schema changes.
- [ ] **D** — phone-only *request* completed by the salon. Not implemented.
- [ ] **E** — phone + weak second factor via a new lookup API. Not implemented,
      not recommended.

Still open for a later decision (only relevant if C or D is ever picked): who may
cancel, and whether the 2-hour cutoff and "no self-service after the cutoff" rule
stay as they are.

---

## 5. What was implemented (option B + A)

All changes are frontend-only. No backend call, RPC, table, policy or production
row was added, changed or deleted.

| Change | Where |
|---|---|
| New device-local store for the customer's **own** booking references (id, salon, date, start, end, service name, duration), max 10 entries, newest first | `app.js` — `MY_BOOKINGS_KEY` / `readMyBookings` / `writeMyBookings` / `upcomingMyBookings` / `rememberMyBooking` / `forgetMyBooking` |
| A confirmed booking is remembered on the device that booked it | `confirmCustomerBooking()` (success path) |
| The cancel screen lists upcoming remembered bookings, with "Použít číslo rezervace" (fills the reference) and "Zapomenout" (removes it) | `renderCancelLookup()` + two click actions |
| A successfully cancelled booking is dropped from the device memory | `submitCancelLookup()` (success path) |
| Copy: hint now points to the confirmation screen; new device-list strings (CS + EN) | `STRINGS.cs` / `STRINGS.en` |
| Dedicated cancel-screen validation copy: a missing phone number now says *"Zadejte prosím telefonní číslo, kterým jste se objednali."* / *"Please enter the phone number you booked with."* instead of the booking form's *"Doplňte jméno a kontakt"* (which asks for a name this screen never collects); a missing reference says *"Zadejte prosím číslo rezervace."* / *"Please enter your booking reference."* The booking form's own validation strings are untouched | `app.js` — `submitCancelLookup()` + `cancelLookupPhoneRequired` / `cancelLookupReferenceRequired` |
| Mobile-first styling for the list, reusing the existing card/quiet-button look | `styles.css` (`my-booking-*`) |

**Security properties preserved (and now covered by tests):**

- The stored reference is **not** proof of ownership: submitting still requires
  the phone number, which is matched server-side (`T1(device)` tests 1–3).
- The device memory never contains contact data, notes or photos — only what is
  needed to recognise one's own booking on one's own device.
- Past appointments are pruned on read (they can no longer be cancelled), the
  list is capped, and the customer can delete any entry.
- Only the selected reference is ever sent; a second booking on the same phone
  number is never named or touched by the first booking's cancellation.
- The server remains the only authority (reference + phone + 2h cutoff).

**Not delivered by option B** (deliberate): cancelling from a *different*
device/browser still needs the reference — that requires option C or D.

---

## 6. Tests

`tests/client-feedback.test.mjs` — 18 tests for this task:

- `T1` (6): the reference is still required, invalid phones never reach the
  server, the request carries exactly reference + phone, a second booking on the
  same phone is never touched, every server refusal maps to the right message and
  performs no write, and the confirmation screen still prefills the reference.
- `T1(copy)` (6): the cancel screen's own validation copy in CS and EN — a
  missing phone number asks for the phone number, a missing reference asks for
  the reference, neither ever shows the booking form's "name and contact" toast,
  nothing is sent while either field is missing, and the booking form's own
  validation is asserted unchanged.
Additionally, `tests/smoke-cancel-flow.mjs` (`npm run smoke`, needs the app served
locally — see the file header) drives the **running preview over HTTP** through a
real DOM: it books a synthetic test appointment, checks device memory, selection,
the phone requirement, the post-cancellation cleanup, and the capacity-picker
values above 4. Its Supabase edge is an in-page stub with no network access, and
every request to any host other than the preview is refused and recorded — the
production project cannot be reached from it. Limitation: jsdom is a DOM
implementation, not a browser engine, so this does not cover layout, the touch
stack or real mobile rendering.

- `T1(device)` (6): a booking made here is remembered with no sensitive fields,
  the list fills the reference and the customer types only the phone, a remembered
  reference alone cancels nothing, only the selected booking is named, a cancelled
  booking is forgotten, and past entries are never offered while "forget" works.
