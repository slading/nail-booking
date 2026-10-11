// Regression tests for the two N2D salon client-feedback requests.
// Run with `npm test` in tests/ (this file is picked up alongside regression.test.mjs).
//
// ---------------------------------------------------------------------------
// TASK 1 — "cancel using the phone number, without the reservation number"
//
// The shipped security model for customer self-cancellation requires BOTH:
//   * the booking reference (the appointment id, handed to the customer on the
//     confirmation screen and prefilled by the "Cancel it" shortcut), and
//   * the phone number used at booking time,
// both re-checked server-side by cancel_appointment_customer (phone digits are
// normalized and the 2-hour cutoff is enforced in the salon's local time).
//
// These tests deliberately LOCK THAT MODEL IN. There is no client path that
// cancels anything from a phone number alone, and a cancellation request can
// only ever name the single booking whose reference was supplied — a second
// booking on the same phone number must never be reachable from the first
// booking's reference. Removing the reference requirement is an owner/security
// decision that also needs a new backend capability; see
// docs/task-1-cancellation-by-phone.md before changing any of this.
//
// ---------------------------------------------------------------------------
// TASK 2 — "individual staff working hours on specific dates"
//
// There is no per-staff schedule entity in this system: availability is a
// salon-level capacity pool (salon_hours weekly base + day_overrides per date +
// blocks.units per window). What the salon asked for is expressible today as
// "block one capacity unit until 14:00" — these tests lock in the behaviour that
// workaround relies on, plus the safety invariants around it:
//   * a partial block lowers concurrency only inside its own time window,
//   * a full block (units = capacity) closes that window entirely,
//   * day overrides apply to exactly one date,
//   * adding a block never modifies, moves or cancels an existing booking,
//   * the customer-facing availability contract stays salon-level (no per-staff
//     parameter is invented client-side) — see docs/task-2-individual-staff-hours.md.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadApp } from "./harness.mjs";

const SALON = "orli";
const DATE = "2026-11-03";      // a Tuesday; all weekdays are configured in the fixture
const NEXT_DATE = "2026-11-04";
const PHONE = "+420 601 100 221";

// ---------------------------------------------------------------- helpers ----
// Values produced inside the app's VM realm have that realm's prototypes, which
// node:assert/strict treats as different objects — round-trip them through JSON
// so structural comparisons in this file are realm-independent.
const plain = (value) => JSON.parse(JSON.stringify(value));
const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

function appt(id, date, start, end, extra = {}) {
  return {
    id, salonId: SALON, date, start, end, duration: minutes(end) - minutes(start),
    serviceId: "svc-60", serviceName: "Manikúra · Test", length: null, color: 1,
    price: 500, priceFrom: false, priceLabel: null, addOns: [], addOnsTotal: 0,
    totalPrice: 500, totalPriceFrom: false, name: "Klientka", phone: PHONE, instagram: "",
    notes: "", reminder: true, photo: null, source: "Online booking", status: "confirmed",
    createdAt: 1, ...extra,
  };
}
function block(id, date, start, end, units, extra = {}) {
  return { id, salonId: SALON, date, start, end, units, reason: "Unavailable", ...extra };
}

// Replaces the app's `state` with a controlled fixture (the same object shape
// the staff bridge assigns in production): one salon whose weekly hours are
// configured on every weekday, no leftover demo rows.
function installSchedule(app, { capacity = 3, start = "08:00", end = "19:00", appointments = [], blocks = [], overrides = {} } = {}) {
  const hours = {};
  for (let i = 0; i < 7; i++) hours[i] = { configured: true, start, end };
  app.eval(`state = ${JSON.stringify({
    version: 6,
    salons: [{ id: SALON, name: "N2D Nails Orlí 17", address: "", defaultCapacity: capacity, hours }],
    services: [{
      id: "svc-60", salonId: SALON, category: "manikura", group: "Manikúra", name: "Test 60",
      duration: 60, price: 500, priceFrom: false, priceLabel: null, color: 1, active: true,
    }],
    addOns: [],
    appointments,
    blocks,
    dayOverrides: overrides,
  })}; ui.salonId = ${JSON.stringify(SALON)}; ui.selectedDate = ${JSON.stringify(DATE)};`);
}

const slots = (app, date = DATE, duration = 60) =>
  app.eval(`availableSlots(${JSON.stringify(SALON)}, ${JSON.stringify(date)}, ${duration})`);

function openCancelScreen(app) {
  app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.view = "cancel"; render();`);
}
const cancelRpcs = (app) => app.supabase.calls.rpc.filter((c) => c.name === "cancel_appointment_customer");
async function submitCancel(app, { reference = "", phone = PHONE } = {}) {
  if (reference !== null) app.$("#cancelAppointmentId").value = reference;
  app.$("#cancelPhoneInput").value = phone;
  app.$('[data-action="submit-cancel-lookup"]').click();
  await app.flush(6);
}

// ============================================================ TASK 1 =========
test("T1: the cancel screen still requires the booking reference — a phone number alone submits nothing", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openCancelScreen(app);
    await app.flush();
    // The reference field and the shared mobile-first form classes are intact.
    assert.ok(app.$("#cancelAppointmentId"), "booking reference field must still be rendered");
    assert.ok(app.$("#cancelAppointmentId").classList.contains("input"));
    assert.ok(app.$('[data-action="submit-cancel-lookup"]').classList.contains("full"));

    await submitCancel(app, { reference: "" });          // phone only
    assert.equal(cancelRpcs(app).length, 0, "no cancellation RPC may be sent without a reference");
    assert.equal(app.toast(), app.eval('t("cancelLookupReferenceRequired")'), "the cancel form's own message, not the booking form's");
    assert.notEqual(app.toast(), app.eval('t("requiredContact")'));
    assert.equal(app.eval("ui.customer.cancelStatus"), "idle", "screen is not put into a success/error state");
  } finally { app.close(); }
});

test("T1: a reference with an invalid phone number never reaches the server", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "appt-ref-a", phone: "not a phone" });
    assert.equal(cancelRpcs(app).length, 0);
    assert.equal(app.toast(), app.eval('t("invalidPhone")'));
  } finally { app.close(); }
});

test("T1: the cancellation request carries exactly the reference + phone (one named booking, nothing else)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "appt-ref-a" });
    const [rpc] = cancelRpcs(app);
    assert.ok(rpc, "cancellation RPC sent");
    assert.deepEqual(plain(rpc.args), { p_appointment_id: "appt-ref-a", p_customer_phone: PHONE });
    assert.deepEqual(Object.keys(rpc.args).sort(), ["p_appointment_id", "p_customer_phone"]);
    assert.equal(app.eval("ui.customer.cancelStatus"), "success");
  } finally { app.close(); }
});

test("T1: two bookings on one phone number — cancelling one never names or touches the other", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    installSchedule(app, {
      appointments: [
        appt("book-a", DATE, "10:00", "11:00"),
        appt("book-b", DATE, "13:00", "14:00"), // same phone number, different booking
      ],
    });
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "book-a" });
    const rpcs = cancelRpcs(app);
    assert.equal(rpcs.length, 1);
    assert.equal(rpcs[0].args.p_appointment_id, "book-a");
    assert.doesNotMatch(JSON.stringify(rpcs), /book-b/, "the other booking's reference is never sent");
    assert.equal(app.eval("state.appointments.length"), 2, "cancellation is server-side only — nothing is deleted locally");
    assert.equal(app.supabase.calls.update.length + app.supabase.calls.delete.length, 0, "no table write is attempted");
  } finally { app.close(); }
});

test("T1: every server refusal maps to the right message and performs no write", async () => {
  const cases = [
    ["N2D09", "cancelLookupNotFound", "unknown reference or phone mismatch"],
    ["N2D11", "cancelLookupAlreadyCancelled", "already cancelled"],
    ["N2D10", "cancelLookupWindowClosed", "inside the 2-hour cutoff"],
    ["PGRST000", "bookingNetworkError", "transport/unknown failure"],
  ];
  for (const [code, key, label] of cases) {
    const app = await loadApp({ language: "cs" });
    try {
      app.supabase.handlers.rpc.cancel_appointment_customer = async () => ({
        data: null, error: Object.assign(new Error("refused"), { code }),
      });
      openCancelScreen(app);
      await app.flush();
      await submitCancel(app, { reference: "appt-ref-a" });
      assert.equal(app.eval("ui.customer.cancelStatus"), "error", `${label}: error state`);
      assert.equal(app.$(".empty-times")?.textContent.trim(), app.eval(`t("${key}")`), `${label}: message`);
      assert.equal(app.$(".confirm-mark"), null, `${label}: no success screen`);
      assert.equal(app.supabase.calls.update.length + app.supabase.calls.delete.length, 0, `${label}: no write`);
      assert.equal(app.eval("ui.customer.cancelResult"), null, `${label}: no cancellation result`);
    } finally { app.close(); }
  }
});

test("T1: the confirmation screen hands its own reference to the cancel screen, so only the phone is typed", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    const confirmed = {
      id: "appt-confirmed-1", salonId: SALON, serviceName: "Manikúra · Test", duration: 60,
      date: DATE, start: "10:00", end: "11:00", category: "manikura", length: null, addOns: [],
      name: "Anna", phone: PHONE, instagram: "", notes: "", photo: null,
    };
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer();
      Object.assign(ui.customer, { step: 5, salonId: ${JSON.stringify(SALON)}, serviceId: "orli-manikura-0",
        date: ${JSON.stringify(DATE)}, start: "10:00", confirmedAppointment: ${JSON.stringify(confirmed)} });
      render();`);
    await app.flush();

    const shortcut = app.$('[data-action="go-cancel-this-booking"]');
    assert.ok(shortcut, "the confirmation screen offers the cancel shortcut");
    assert.equal(shortcut.dataset.id, "appt-confirmed-1");
    shortcut.click();
    await app.flush();

    assert.equal(app.eval("ui.customer.cancelAppointmentId"), "appt-confirmed-1");
    assert.equal(app.$("#cancelAppointmentId").value, "appt-confirmed-1", "reference is prefilled from the confirmation");

    await submitCancel(app, { reference: null }); // only the phone is typed by the customer
    const [rpc] = cancelRpcs(app);
    assert.ok(rpc, "cancellation sent with the carried-over reference");
    assert.equal(rpc.args.p_appointment_id, "appt-confirmed-1");
    assert.equal(rpc.args.p_customer_phone, PHONE);
  } finally { app.close(); }
});

// ============================================================ TASK 1 =========
// Approved model (owner decision, option B): the customer's OWN booking
// references are remembered in their own browser, so a returning customer picks
// their booking and types only their phone number. The server-side ownership
// rule is unchanged (reference + matching phone + cutoff), so these tests check
// both halves: the convenience works, and it can never cancel anything without
// the phone number, and never touches a booking that was not selected.

const MY_BOOKINGS_KEY = "n2d-my-bookings-v1";
const bookmarkEntries = (app) => JSON.parse(app.w.localStorage.getItem(MY_BOOKINGS_KEY) || "[]");

async function bookOnce(app, { phone = PHONE } = {}) {
  app.eval(`ui.mode = "customer"; ui.customer = freshCustomer();
    Object.assign(ui.customer, { salonId: ${JSON.stringify(SALON)}, serviceId: "orli-manikura-0",
      date: ${JSON.stringify(DATE)}, start: "10:00", step: 4, name: "Anna", phone: ${JSON.stringify(phone)} });
    render();`);
  await app.flush();
  app.$('[data-action="confirm-booking"]').click();
  await app.flush(10);
}
const bookmark = (id, date = DATE, start = "10:00", extra = {}) =>
  ({ id, salonId: SALON, date, start, end: "11:00", serviceName: "Manikúra · Test", duration: 60, ...extra });

test("T1(device): a booking made here is remembered locally, and only as a cancellation shortcut", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    await bookOnce(app);
    const entries = bookmarkEntries(app);
    assert.equal(entries.length, 1, "the confirmed booking is remembered");
    assert.equal(entries[0].id, "booking-1");
    assert.equal(entries[0].date, DATE);
    assert.equal(entries[0].start, "10:00");
    // Minimum footprint: no contact details, notes or photos are ever stored here.
    assert.deepEqual(Object.keys(entries[0]).sort(),
      ["date", "duration", "end", "id", "salonId", "serviceName", "start"]);
    assert.doesNotMatch(app.w.localStorage.getItem(MY_BOOKINGS_KEY), /Anna|601|instagram|photo/i);
  } finally { app.close(); }
});

test("T1(device): the cancel screen offers the remembered booking and the customer types only the phone", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.w.localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify([bookmark("booking-1")]));
    openCancelScreen(app);
    await app.flush();

    const list = app.$(".my-booking-list");
    assert.ok(list, "my bookings are listed on this device");
    assert.equal(list.querySelector(".my-booking-row strong")?.textContent.includes("10:00"), true);

    app.$('[data-action="use-my-booking"]').click();
    await app.flush();
    assert.equal(app.eval("ui.customer.cancelAppointmentId"), "booking-1", "reference filled from the device memory");
    assert.equal(app.$("#cancelAppointmentId").value, "booking-1");

    await submitCancel(app, { reference: null });        // only the phone is typed
    const [rpc] = cancelRpcs(app);
    assert.ok(rpc, "cancellation sent");
    assert.deepEqual(plain(rpc.args), { p_appointment_id: "booking-1", p_customer_phone: PHONE });
    assert.equal(app.eval("ui.customer.cancelStatus"), "success");
  } finally { app.close(); }
});

test("T1(device): a remembered reference alone cancels nothing — the phone number is still required", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.w.localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify([bookmark("booking-1")]));
    openCancelScreen(app);
    await app.flush();
    app.$('[data-action="use-my-booking"]').click();
    await app.flush();
    assert.equal(app.$("#cancelAppointmentId").value, "booking-1");
    await submitCancel(app, { reference: null, phone: "" });   // reference prefilled, no phone
    assert.equal(cancelRpcs(app).length, 0, "a stored reference is not proof of ownership on its own");
    assert.equal(app.toast(), app.eval('t("cancelLookupPhoneRequired")'), "asks for the phone number");
    assert.notEqual(app.toast(), app.eval('t("requiredContact")'));
  } finally { app.close(); }
});

test("T1(device): with two remembered bookings, only the selected one is ever named", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.w.localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify([
      bookmark("book-a", DATE, "10:00"),
      bookmark("book-b", NEXT_DATE, "13:00"),
    ]));
    openCancelScreen(app);
    await app.flush();
    const buttons = [...app.doc.querySelectorAll('[data-action="use-my-booking"]')].map((b) => b.dataset.id);
    assert.deepEqual(buttons, ["book-a", "book-b"], "sorted chronologically, both offered");

    [...app.doc.querySelectorAll('[data-action="use-my-booking"]')].find((b) => b.dataset.id === "book-b").click();
    await app.flush();
    await submitCancel(app, { reference: null });
    const rpcs = cancelRpcs(app);
    assert.equal(rpcs.length, 1);
    assert.equal(rpcs[0].args.p_appointment_id, "book-b");
    assert.doesNotMatch(JSON.stringify(rpcs), /book-a/);
  } finally { app.close(); }
});

test("T1(device): a successful cancellation drops its shortcut, so it can never be offered again", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.w.localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify([bookmark("booking-1")]));
    openCancelScreen(app);
    await app.flush();
    app.$('[data-action="use-my-booking"]').click();
    await app.flush();
    await submitCancel(app, { reference: null });
    assert.equal(app.eval("ui.customer.cancelStatus"), "success");
    assert.deepEqual(bookmarkEntries(app), [], "the cancelled booking is forgotten on this device");

    app.$('[data-action="cancel-lookup-done"]').click();
    await app.flush();
    assert.equal(app.$(".my-booking-list"), null, "nothing left to list");
  } finally { app.close(); }
});

test("T1(device): the customer can forget a remembered booking, and past ones are never offered", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.w.localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify([bookmark("booking-1"), bookmark("gone", "2020-01-05")]));
    openCancelScreen(app);
    await app.flush();
    const listed = [...app.doc.querySelectorAll('[data-action="use-my-booking"]')].map((b) => b.dataset.id);
    assert.deepEqual(listed, ["booking-1"], "a past appointment is not offered (it can no longer be cancelled)");

    app.$('[data-action="use-my-booking"]').click();
    await app.flush();
    app.$('[data-action="forget-my-booking"]').click();
    await app.flush();
    assert.equal(app.eval("ui.customer.cancelAppointmentId"), "", "forgetting clears the filled-in reference");
    assert.equal(app.$(".my-booking-list"), null, "the list is gone once nothing is remembered");
    assert.deepEqual(bookmarkEntries(app).map((e) => e.id), ["gone"]);
  } finally { app.close(); }
});

// --------------------------------------------- cancel-screen validation copy --
// The cancel form must never borrow the booking form's "add your name and
// contact" toast (it does not ask for a name), and each message must name the
// field that is actually missing. These strings are customer-visible copy, so
// they are pinned exactly.
const CANCEL_COPY = {
  cs: {
    phoneRequired: "Zadejte prosím telefonní číslo, kterým jste se objednali.",
    referenceRequired: "Zadejte prosím číslo rezervace.",
    bookingFormRequired: "Doplňte jméno a kontakt", // the booking form's own message, unchanged
  },
  en: {
    phoneRequired: "Please enter the phone number you booked with.",
    referenceRequired: "Please enter your booking reference.",
  },
};

test("T1(copy): CS — with the reference filled in, a missing phone number asks for the phone number", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "appt-ref-a", phone: "" });
    assert.equal(app.toast(), CANCEL_COPY.cs.phoneRequired);
    assert.equal(app.toast(), app.eval('t("cancelLookupPhoneRequired")'));
    assert.notEqual(app.toast(), CANCEL_COPY.cs.bookingFormRequired, "must not reuse the booking form's name/contact message");
    assert.notEqual(app.toast(), app.eval('t("requiredContact")'));
    assert.equal(cancelRpcs(app).length, 0, "nothing sent");
    assert.equal(app.eval("ui.customer.cancelStatus"), "idle");
  } finally { app.close(); }
});

test("T1(copy): EN — the same message exists in English and asks for the phone number", async () => {
  const app = await loadApp({ language: "en" });
  try {
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "appt-ref-a", phone: "" });
    assert.equal(app.toast(), CANCEL_COPY.en.phoneRequired);
    assert.equal(app.toast(), app.eval('t("cancelLookupPhoneRequired")'));
    assert.equal(cancelRpcs(app).length, 0);
  } finally { app.close(); }
});

test("T1(copy): a missing reference says so instead of pointing at the phone number", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "", phone: PHONE });
    assert.equal(app.toast(), CANCEL_COPY.cs.referenceRequired);
    assert.notEqual(app.toast(), CANCEL_COPY.cs.phoneRequired, "the message must name the field that is actually missing");
    assert.notEqual(app.toast(), CANCEL_COPY.cs.bookingFormRequired);
    assert.equal(cancelRpcs(app).length, 0);
  } finally { app.close(); }
});

test("T1(copy): neither field filled in — the form still asks for the reference first and sends nothing", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "", phone: "" });
    assert.equal(app.toast(), CANCEL_COPY.cs.referenceRequired);
    assert.notEqual(app.toast(), CANCEL_COPY.cs.bookingFormRequired);
    assert.equal(cancelRpcs(app).length, 0);
  } finally { app.close(); }
});

test("T1(copy): an invalid phone number on the cancel screen still uses the shared phone message", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openCancelScreen(app);
    await app.flush();
    await submitCancel(app, { reference: "appt-ref-a", phone: "not a phone" });
    assert.equal(app.toast(), app.eval('t("invalidPhone")'));
    assert.notEqual(app.toast(), CANCEL_COPY.cs.bookingFormRequired);
    assert.equal(cancelRpcs(app).length, 0);
  } finally { app.close(); }
});

test("T1(copy): the booking form's own validation is unchanged by the cancel-screen fix", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = ${JSON.stringify(SALON)};
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = ${JSON.stringify(DATE)}; ui.customer.start = "10:00";
      ui.customer.step = 3; render();`);
    await app.flush();
    // Missing name/phone still uses the booking form's own message.
    app.$("#customerName").value = "";
    app.$("#customerPhone").value = "";
    app.$('[data-action="customer-details-next"]').click();
    await app.flush(4);
    assert.equal(app.toast(), app.eval('t("requiredContact")'));
    assert.notEqual(app.toast(), app.eval('t("cancelLookupPhoneRequired")'));
    assert.equal(app.eval("ui.customer.step"), 3, "the booking form still blocks the next step");
    // A malformed phone still uses the shared format message.
    app.$("#customerName").value = "Anna Nováková";
    app.$("#customerPhone").value = "abc";
    app.$('[data-action="customer-details-next"]').click();
    await app.flush(4);
    assert.equal(app.toast(), app.eval('t("invalidPhone")'));
    assert.equal(app.eval("ui.customer.step"), 3);
  } finally { app.close(); }
});

// ============================================================ TASK 2 =========
test("T2: 'staff A works from 14:00' is expressible today as one blocked capacity unit until 14:00", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    installSchedule(app, {
      capacity: 3,                                                     // A, B and C
      blocks: [block("b-a-late", DATE, "08:00", "14:00", 1)],          // A unavailable until 14:00
      appointments: [appt("morning-b", DATE, "09:00", "10:00"), appt("morning-c", DATE, "09:00", "10:00")],
    });
    const available = slots(app);
    assert.ok(!available.includes("09:00"), "morning is capped at the two staff members who work it");
    assert.ok(!available.includes("09:30"));
    assert.ok(available.includes("10:00"), "a third client still fits once those two are done");
    assert.ok(available.includes("14:00"), "from 14:00 the third staff member is available again");
    assert.ok(available.includes("14:30"));
  } finally { app.close(); }
});

test("T2: removing that block restores the third morning slot (the block is what limits it)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    const twoMorningBookings = [appt("morning-b", DATE, "09:00", "10:00"), appt("morning-c", DATE, "09:00", "10:00")];
    installSchedule(app, { capacity: 3, appointments: twoMorningBookings });
    assert.ok(slots(app).includes("09:00"), "without the block, capacity 3 accepts a third simultaneous booking at 09:00");
  } finally { app.close(); }
});

test("T2: a full block (units = capacity) closes its window and nothing outside it", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    installSchedule(app, { capacity: 2, blocks: [block("b-full", DATE, "08:00", "14:00", 2)] });
    const available = slots(app);
    assert.ok(!available.includes("08:00"));
    assert.ok(!available.includes("13:30"));
    assert.ok(available.includes("14:00"), "the window after the block is still bookable");
  } finally { app.close(); }
});

test("T2: a day override (hours + capacity) applies to exactly one date", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    installSchedule(app, {
      capacity: 3,
      overrides: { [`${SALON}|${DATE}`]: { configured: true, start: "08:00", end: "19:00", capacity: 1 } },
      appointments: [appt("single", DATE, "09:00", "10:00")],
    });
    assert.equal(app.eval(`getDayConfig(${JSON.stringify(SALON)}, ${JSON.stringify(DATE)}).capacity`), 1);
    assert.equal(app.eval(`getDayConfig(${JSON.stringify(SALON)}, ${JSON.stringify(NEXT_DATE)}).capacity`), 3);
    assert.ok(!slots(app).includes("09:00"), "capacity 1 with one booking already taken");
    assert.ok(slots(app, NEXT_DATE).includes("09:00"), "the next date keeps the salon's normal capacity");
  } finally { app.close(); }
});

test("T2: blocks are per date and per salon — they never leak into another date or the other location", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    installSchedule(app, {
      capacity: 3,
      blocks: [
        block("b-date", DATE, "08:00", "14:00", 1),                      // this date only
        block("b-other-salon", DATE, "08:00", "19:00", 3, { salonId: "kubickova" }), // other location
      ],
    });
    assert.ok(slots(app, NEXT_DATE).includes("08:00"), "next date is untouched");
    assert.ok(slots(app).includes("08:00"), "another salon's full block does not affect this salon");
  } finally { app.close(); }
});

test("T2: adding a block never modifies, moves or cancels an existing booking", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    installSchedule(app, {
      capacity: 3,
      appointments: [appt("keep-1", DATE, "09:00", "10:00"), appt("keep-2", DATE, "14:00", "15:00")],
    });
    app.eval(`ui.mode = "staff"; ui.modal = { type: "block", draft: {
      salonId: ${JSON.stringify(SALON)}, date: ${JSON.stringify(DATE)}, start: "08:00", end: "14:00",
      units: 1, reason: "Staff A from 14:00" } }; renderModal();`);
    app.$("#blockStart").value = "08:00";
    app.$("#blockEnd").value = "14:00";
    app.$("#blockUnits").value = "1";
    app.$("#blockReason").value = "Staff A from 14:00";
    app.$('[data-action="save-block"]').click();
    await app.flush(6);

    const inserts = app.supabase.calls.insert.filter((c) => c.table === "blocks");
    assert.equal(inserts.length, 1, "exactly one block row written");
    assert.deepEqual(plain(inserts[0].values), {
      salon_id: SALON, block_date: DATE, start_time: "08:00", end_time: "14:00",
      units: 1, reason: "Staff A from 14:00",
    });
    assert.equal(app.supabase.calls.update.length, 0, "no existing row is updated");
    assert.equal(app.supabase.calls.delete.length, 0, "nothing is deleted");
    assert.equal(app.eval("state.appointments.length"), 2, "both existing bookings are still there");
    assert.equal(app.toast(), app.eval('t("blockedSuccess")'));
  } finally { app.close(); }
});

test("T2: no double bookings — the staff time picker never offers a conflicting start", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    installSchedule(app, {
      capacity: 1,
      appointments: [appt("existing", DATE, "09:00", "10:00")],
    });
    app.eval(`ui.mode = "staff"; ui.modal = { type: "manual", draft: {
      salonId: ${JSON.stringify(SALON)}, serviceId: "svc-60", date: ${JSON.stringify(DATE)}, time: null,
      length: null, addOns: [], name: "", phone: "", instagram: "", notes: "", reminder: true } }; renderModal();`);
    const offered = [...app.doc.querySelectorAll("#manualTime option")].map((o) => o.value).filter(Boolean);
    assert.ok(offered.includes("10:00"), "a free start after the booking is offered");
    assert.ok(!offered.includes("09:00"), "the taken start is not offered");
    assert.ok(!offered.includes("09:30"), "an overlapping start is not offered");
    assert.ok(!offered.includes("08:30"), "a start whose 60 minutes would overlap is not offered");
  } finally { app.close(); }
});

test("T2(latent fix): the Adjust-day capacity picker always includes the current value", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    // Capacities 1–4 (the values in production): the option list is unchanged.
    for (const capacity of [1, 2, 3, 4]) {
      installSchedule(app, { capacity });
      app.eval(`ui.mode = "staff"; openDaySettings();`);
      assert.deepEqual(
        [...app.doc.querySelectorAll("#dayCapacity option")].map((o) => o.value),
        ["1", "2", "3", "4"],
      );
      assert.equal(app.$("#dayCapacity").value, String(capacity), `capacity ${capacity} stays selected`);
    }
    // Above 4: the current value is offered, so an untouched save cannot drop it to 1.
    installSchedule(app, { capacity: 6 });
    app.eval(`ui.mode = "staff"; openDaySettings();`);
    assert.equal(app.$("#dayCapacity").value, "6");
    assert.ok([...app.doc.querySelectorAll("#dayCapacity option")].some((o) => o.value === "6"));
  } finally { app.close(); }
});

test("T2: customer availability keeps its salon-level contract (per-staff data cannot be faked client-side)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = ${JSON.stringify(SALON)};
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = ${JSON.stringify(DATE)}; ui.customer.step = 2; render();`);
    await app.flush(10);
    const call = app.supabase.calls.rpc.filter((c) => c.name === "get_available_slots").at(-1);
    assert.ok(call, "availability is requested from the backend, which stays the authority");
    assert.deepEqual(Object.keys(call.args).sort(), ["p_date", "p_duration_minutes", "p_ignore_appointment_id", "p_salon_id"]);
  } finally { app.close(); }
});
