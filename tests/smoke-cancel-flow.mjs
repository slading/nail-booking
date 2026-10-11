// Smoke test for the updated cancellation flow + the capacity-picker fix,
// driven against the RUNNING PREVIEW over HTTP (default http://127.0.0.1:4173).
//
//   node smoke-cancel-flow.mjs            # or: PREVIEW_URL=http://host:port
//
// What is real here:
//   * index.html / supabase-client.js / app.js / styles.css are FETCHED FROM THE
//     PREVIEW SERVER (their hash is compared against the files on disk first, so
//     a stale server can never produce a false pass).
//   * Every interaction is a real DOM event dispatched by the app's own delegated
//     listeners (clicks on rendered buttons, real form inputs, real localStorage).
//
// What is stubbed, and why:
//   * The Supabase JS client (normally loaded from the jsDelivr CDN) is replaced
//     with an in-page stub, and the resource loader refuses every origin other
//     than the preview itself. The stub performs NO network I/O whatsoever, so
//     this script cannot read or write the production Supabase project: the
//     salon's real bookings are never touched and every appointment used here is
//     synthetic (ids prefixed SMOKE-TEST).
//
// Known limitation (stated in the report, not hidden): jsdom is a DOM
// implementation, not a browser engine — no layout, paint, touch stack or real
// Supabase/CDN connectivity. The four behaviours under test (device memory,
// selection, phone requirement, cleanup) and the capacity-picker value logic are
// all DOM/state behaviours, so they are fully exercised; visual/mobile rendering
// is not, and still needs a check in a real browser on the preview URL.
import jsdom from "jsdom";
const { JSDOM, requestInterceptor } = jsdom;
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW_URL = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
const CDN_PREFIX = "https://cdn.jsdelivr.net/";
const TEST_PHONE = "+420 601 999 111";
const WRONG_PHONE = "+420 601 999 222";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, label, timeoutMs = 8000) {
  const start = Date.now();
  for (;;) {
    try { if (fn()) return true; } catch { /* keep waiting */ }
    if (Date.now() - start > timeoutMs) throw new Error(`timed out waiting for ${label}`);
    await sleep(25);
  }
}

// ---------------------------------------------------------------- assets -----
const diskHashes = {};
for (const file of ["app.js", "supabase-client.js", "index.html"]) {
  diskHashes[file] = createHash("sha256").update(readFileSync(path.join(ROOT, file))).digest("hex");
}
async function assertPreviewServesCurrentBuild() {
  for (const file of Object.keys(diskHashes)) {
    const res = await fetch(`${PREVIEW_URL}/${file}`);
    const body = Buffer.from(await res.arrayBuffer());
    const hash = createHash("sha256").update(body).digest("hex");
    check(`preview serves the current ${file}`, res.ok && hash === diskHashes[file],
      res.ok ? (hash === diskHashes[file] ? "sha256 matches the working tree" : "STALE: server is serving a different build") : `HTTP ${res.status}`);
  }
}

// ------------------------------------------------------------ stub backend ---
// Served in place of the jsDelivr Supabase bundle. Everything lives in page
// memory; there is no fetch() anywhere in this stub.
const STUB_SOURCE = String.raw`
(() => {
  const digits = (v) => String(v || "").replace(/\D/g, "");
  const todayISO = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-"); };
  const minutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

  const hours = {};
  for (let i = 0; i < 7; i++) hours[i] = { configured: true, start_time: "08:00:00", end_time: "19:00:00" };
  const service = (salonId, id, capacityUnused) => ({
    id, salon_id: salonId, category: "manikura", group_name: "Manikúra", name: "Klasická",
    duration_minutes: 45, price_czk: 500, price_from: false, price_label: null, color: 1, active: true,
  });

  const db = {
    salons: [
      { id: "orli", name: "SMOKE Nails Orlí (test)", address: "test", default_capacity: 1 },
      { id: "kubickova", name: "SMOKE Nails Kubíčkova (test)", address: "test", default_capacity: 3 },
    ],
    salonsHydrated: false,
    salon_hours: Object.entries(hours).flatMap(([wd, h]) => [
      { salon_id: "orli", weekday: Number(wd), configured: true, start_time: h.start_time, end_time: h.end_time },
      { salon_id: "kubickova", weekday: Number(wd), configured: true, start_time: h.start_time, end_time: h.end_time },
    ]),
    services: [service("orli", "smoke-manikura-orli"), service("kubickova", "smoke-manikura-kubickova")],
    public_services: [service("orli", "smoke-manikura-orli"), service("kubickova", "smoke-manikura-kubickova")],
    add_ons: [],
    public_add_ons: [],
    modelace_lengths: [
      { key: "short", minutes: 50, sort_order: 1 }, { key: "medium", minutes: 55, sort_order: 2 },
      { key: "long", minutes: 60, sort_order: 3 }, { key: "extraLong", minutes: 70, sort_order: 4 },
    ],
    // A pre-existing customer reservation that this smoke test must not modify.
    appointments: [{
      id: "EXISTING-CUSTOMER-BOOKING", salon_id: "orli", appointment_date: todayISO(),
      start_time: "09:00:00", end_time: "09:45:00", duration_minutes: 45,
      service_id: "smoke-manikura-orli", service_name_snapshot: "Manikúra · Klasická",
      category_snapshot: "manikura", length_key: null, add_ons_snapshot: [], color: 1,
      price_czk: 500, price_from: false, price_label: null, add_ons_total_czk: 0, total_price_czk: 500, total_price_from: false,
      customer_name: "Stávající klientka", customer_phone: "+420 111 222 333", customer_instagram: "@existing",
      customer_notes: null, reference_photo_path: null, reminder_requested: true,
      source: "client_booking", status: "confirmed", created_at: new Date().toISOString(), cancelled_at: null,
    }],
    blocks: [],
    day_overrides: [],
    staff_profiles: [{ id: "smoke-user", display_name: "Smoke Tester", salon_scope: "all", is_active: true }],
  };

  const calls = { rpc: [], writes: [], forbiddenNetworkAttempts: [] };
  let bookingCounter = 0;
  window.__SMOKE__ = { calls, db };
  Object.defineProperty(window, "__SMOKE_BUILD__", { value: "stub-1", enumerable: true });

  function applyFilters(rows, filters, ranges) {
    let out = rows.filter((r) => Object.entries(filters).every(([k, v]) => String(r[k]) === String(v)));
    for (const [col, op, val] of ranges) out = out.filter((r) => (op === "gte" ? String(r[col]) >= String(val) : String(r[col]) <= String(val)));
    return out;
  }

  function query(table) {
    const state = { table, filters: {}, ranges: [], single: false, mode: "select", values: null };
    const api = {
      select() { return api; },
      order() { return api; },
      eq(col, val) { state.filters[col] = val; return api; },
      gte(col, val) { state.ranges.push([col, "gte", val]); return api; },
      lte(col, val) { state.ranges.push([col, "lte", val]); return api; },
      maybeSingle() { state.single = true; return api; },
      update(values) { state.mode = "update"; state.values = values; calls.writes.push({ table, mode: "update", values, filters: state.filters }); return api; },
      insert(values) { state.mode = "insert"; state.values = values; calls.writes.push({ table, mode: "insert", values }); return api; },
      upsert(values, opts) { state.mode = "upsert"; state.values = values; calls.writes.push({ table, mode: "upsert", values, opts }); return api; },
      delete() { state.mode = "delete"; calls.writes.push({ table, mode: "delete", filters: state.filters }); return api; },
      then(resolve, reject) { return Promise.resolve(exec(state)).then(resolve, reject); },
    };
    return api;
  }

  function exec(state) {
    const rows = db[state.table] || [];
    if (state.mode === "select") {
      const found = applyFilters(rows, state.filters, state.ranges);
      return { data: state.single ? (found[0] || null) : found, error: null };
    }
    if (state.mode === "upsert" && state.table === "day_overrides") {
      const row = { salon_id: state.values.salon_id, override_date: state.values.override_date, configured: state.values.configured, start_time: state.values.start_time, end_time: state.values.end_time, capacity: state.values.capacity };
      db.day_overrides = db.day_overrides.filter((o) => !(o.salon_id === row.salon_id && o.override_date === row.override_date));
      db.day_overrides.push(row);
    }
    if (state.mode === "insert" && state.table === "blocks") db.blocks.push({ id: "block-smoke", ...state.values });
    return { data: null, error: null };
  }

  function rpc(name, args) {
    calls.rpc.push({ name, args });
    if (name === "get_available_slots") {
      const salon = db.salons.find((s) => s.id === args.p_salon_id);
      const override = db.day_overrides.find((o) => o.salon_id === args.p_salon_id && o.override_date === args.p_date);
      const capacity = Number(override?.capacity || salon?.default_capacity || 1);
      const weekday = new Date(args.p_date + "T12:00:00").getDay();
      const base = db.salon_hours.find((h) => h.salon_id === args.p_salon_id && h.weekday === weekday);
      const start = override?.start_time ? minutes(String(override.start_time).slice(0, 5)) : minutes(String(base.start_time).slice(0, 5));
      const end = override?.end_time ? minutes(String(override.end_time).slice(0, 5)) : minutes(String(base.end_time).slice(0, 5));
      const times = [];
      for (let t = start; t + args.p_duration_minutes <= end; t += 30) {
        let ok = true;
        for (let q = t; q < t + args.p_duration_minutes; q += 30) {
          const occupied = db.appointments.filter((a) => a.status === "confirmed" && a.salon_id === args.p_salon_id && a.appointment_date === args.p_date &&
            minutes(String(a.start_time).slice(0, 5)) < Math.min(q + 30, t + args.p_duration_minutes) && minutes(String(a.end_time).slice(0, 5)) > q).length;
          if (occupied + 1 > capacity) { ok = false; break; }
        }
        if (ok) times.push(hhmm(t));
      }
      return { data: [{ configured: true, available_start_times: times }], error: null };
    }
    if (name === "create_customer_booking") {
      bookingCounter += 1;
      const salonId = args.p_salon_id;
      const svc = db.services.find((s) => s.id === args.p_service_id);
      const startMin = minutes(args.p_start_time);
      const row = {
        id: "SMOKE-TEST-BOOKING-" + bookingCounter, salon_id: salonId, appointment_date: args.p_date,
        start_time: args.p_start_time + ":00", end_time: hhmm(startMin + svc.duration_minutes) + ":00",
        duration_minutes: svc.duration_minutes, service_id: svc.id, service_name_snapshot: svc.group_name + " · " + svc.name,
        category_snapshot: svc.category, length_key: args.p_length_key, add_ons_snapshot: [], color: 1,
        price_czk: svc.price_czk, price_from: false, price_label: null, add_ons_total_czk: 0, total_price_czk: svc.price_czk, total_price_from: false,
        customer_name: args.p_customer_name, customer_phone: args.p_customer_phone, customer_instagram: args.p_customer_instagram,
        customer_notes: args.p_customer_notes, reference_photo_path: args.p_reference_photo_path, reminder_requested: !!args.p_reminder_requested,
        source: "client_booking", status: "confirmed", created_at: new Date().toISOString(), cancelled_at: null,
      };
      db.appointments.push(row);
      return { data: [row], error: null };
    }
    if (name === "cancel_appointment_customer") {
      const appt = db.appointments.find((a) => a.id === args.p_appointment_id);
      if (!appt || digits(appt.customer_phone) !== digits(args.p_customer_phone) || !digits(args.p_customer_phone)) {
        return { data: null, error: Object.assign(new Error("not found"), { code: "N2D09" }) };
      }
      if (appt.status === "cancelled") return { data: null, error: Object.assign(new Error("already cancelled"), { code: "N2D11" }) };
      appt.status = "cancelled";
      appt.cancelled_at = new Date().toISOString();
      return { data: [appt], error: null };
    }
    return { data: null, error: Object.assign(new Error("stub: unexpected rpc " + name), { code: "STUB" }) };
  }

  window.supabase = {
    createClient: () => ({
      from: (table) => query(table),
      rpc: (name, args) => { const out = rpc(name, args); return Promise.resolve(out); },
      storage: { from: () => ({ upload: async () => ({ error: null }), createSignedUrl: async () => ({ data: { signedUrl: "about:blank" }, error: null }) }) },
      auth: {
        getSession: async () => ({ data: { session: { user: { id: "smoke-user" }, access_token: "smoke" } }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        signInWithPassword: async () => ({ data: null, error: new Error("stub") }),
        signOut: async () => ({ error: null }),
      },
    }),
  };
})();
`;

// Requests to any host other than the preview itself are refused (empty body)
// and recorded, so the run can prove it never reached the live backend.
const refusedRequests = [];
const previewInterceptor = requestInterceptor((request) => {
  if (request.url.startsWith(CDN_PREFIX)) {
    return new Response(STUB_SOURCE, { headers: { "Content-Type": "application/javascript" } });
  }
  if (request.url.startsWith(PREVIEW_URL)) return undefined; // serve normally from the running preview
  refusedRequests.push(request.url);
  return new Response("", { status: 403 });
});

// ------------------------------------------------------------------- run -----
async function main() {
  await assertPreviewServesCurrentBuild();

  const dom = await JSDOM.fromURL(PREVIEW_URL, {
    runScripts: "dangerously",
    resources: { interceptors: [previewInterceptor] },
    pretendToBeVisual: true,
    beforeParse(window) {
      // Mobile viewport (iPhone-ish) — the flow is mobile-first.
      Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
      Object.defineProperty(window, "innerHeight", { value: 844, configurable: true });
      window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    },
  });
  const w = dom.window;
  const doc = w.document;
  const $ = (sel) => doc.querySelector(sel);
  const click = (el, label) => { if (!el) throw new Error(`missing element: ${label || ""}`); el.click(); };
  const rpcs = (name) => w.__SMOKE__.calls.rpc.filter((c) => c.name === name);
  const memory = () => JSON.parse(w.localStorage.getItem("n2d-my-bookings-v1") || "[]");

  await waitFor(() => w.eval("typeof remoteCatalog !== 'undefined' && remoteCatalog.status === 'ready'"), "catalog load");
  check("app boots from the preview and loads its catalog", true, `${rpcs("get_available_slots").length} availability calls so far`);

  // ---- 1. create a TEST booking through the real booking UI -----------------
  await waitFor(() => doc.querySelectorAll("[data-customer-salon]").length > 0, "salon cards");
  click(doc.querySelector('[data-customer-salon="orli"]'), "salon card");
  await waitFor(() => doc.querySelector('[data-customer-service="smoke-manikura-orli"]'), "service card");
  click(doc.querySelector('[data-customer-service="smoke-manikura-orli"]'), "service card");
  await waitFor(() => doc.querySelector("[data-customer-time]"), "time slots");
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const tomorrowISO = [tomorrow.getFullYear(), String(tomorrow.getMonth() + 1).padStart(2, "0"), String(tomorrow.getDate()).padStart(2, "0")].join("-");
  const offeredToday = [...doc.querySelectorAll("[data-customer-time]")].map((b) => b.dataset.customerTime);
  check("the pre-existing customer booking on today still blocks its own slot (capacity 1)", !offeredToday.includes("09:00") && offeredToday.includes("10:00"),
    `today offered from: ${offeredToday.slice(0, 3).join(", ")}`);
  click(doc.querySelector(`[data-customer-date="${tomorrowISO}"]`), "tomorrow date chip");
  await waitFor(() => doc.querySelector(`[data-customer-time]`), "tomorrow time slots");
  await sleep(100);
  click(doc.querySelector('[data-customer-time="10:00"]'), "time button");
  await waitFor(() => $("#customerName"), "details step");
  $("#customerName").value = "Smoke Test";
  $("#customerPhone").value = TEST_PHONE;
  click(doc.querySelector('[data-action="customer-details-next"]'), "details next");
  await waitFor(() => doc.querySelector('[data-action="confirm-booking"]'), "review step");
  click(doc.querySelector('[data-action="confirm-booking"]'), "confirm");
  await waitFor(() => w.eval('ui.customer.step') === 5, "confirmation");
  const created = rpcs("create_customer_booking")[0]?.args;
  const newId = w.eval("ui.customer.confirmedAppointment.id");
  check("a TEST booking was created through the real booking UI (stub backend only)", !!created && /^SMOKE-TEST-BOOKING-\d+$/.test(newId), `id ${newId}`);
  check("the test booking used the test phone number", created?.p_customer_phone === TEST_PHONE);

  // ---- 2. device memory ----------------------------------------------------
  const afterBooking = memory();
  check("the new booking is remembered in device memory", afterBooking.some((e) => e.id === newId), `n2d-my-bookings-v1: ${afterBooking.map((e) => e.id).join(", ")}`);
  check("device memory stores only the minimum fields",
    Object.keys(afterBooking[0] || {}).sort().join(",") === "date,duration,end,id,salonId,serviceName,start",
    Object.keys(afterBooking[0] || {}).sort().join(","));
  check("device memory holds no name / phone / instagram / notes",
    !/Smoke Test|601999111|instagram|notes/i.test(w.localStorage.getItem("n2d-my-bookings-v1") || ""));

  // ---- 3. select it from the cancel screen ---------------------------------
  click(doc.querySelector('[data-action="go-cancel-this-booking"]'), "cancel shortcut");
  await waitFor(() => doc.querySelector(".my-booking-list"), "device booking list");
  const listIds = [...doc.querySelectorAll('[data-action="use-my-booking"]')].map((b) => b.dataset.id);
  check("the booking is listed on the cancel screen", listIds.includes(newId), `listed: ${listIds.join(", ")}`);
  click(doc.querySelector(`[data-action="use-my-booking"][data-id="${newId}"]`), "use reference");
  await waitFor(() => $("#cancelAppointmentId")?.value === newId, "reference prefilled");
  check("selecting it fills the reference without the customer typing it", $("#cancelAppointmentId").value === newId);

  // ---- 4. the phone number is still required and must match ----------------
  const before = rpcs("cancel_appointment_customer").length;
  $("#cancelPhoneInput").value = "";
  click(doc.querySelector('[data-action="submit-cancel-lookup"]'), "submit (no phone)");
  await sleep(150);
  const phoneToast = $("#toast")?.textContent || "";
  check("a remembered reference alone cancels nothing (no phone typed)", rpcs("cancel_appointment_customer").length === before && memory().some((e) => e.id === newId),
    `toast: ${phoneToast}`);
  check("the message asks for the phone number (dedicated cancel-screen copy)",
    phoneToast === "Zadejte prosím telefonní číslo, kterým jste se objednali.",
    `toast: ${phoneToast}`);
  check("the booking form's name/contact message is never used on the cancel screen",
    !/jméno a kontakt/i.test(phoneToast));

  $("#cancelPhoneInput").value = WRONG_PHONE;
  click(doc.querySelector('[data-action="submit-cancel-lookup"]'), "submit (wrong phone)");
  await sleep(250);
  const stillThere = w.__SMOKE__.db.appointments.find((a) => a.id === newId)?.status;
  check("a mismatched phone number is rejected and cancels nothing",
    rpcs("cancel_appointment_customer").length === before + 1 && stillThere === "confirmed" && memory().some((e) => e.id === newId),
    `status ${stillThere}; screen: ${$(".empty-times")?.textContent?.trim()}`);

  // ---- 5. correct phone cancels, and the entry disappears ------------------
  $("#cancelPhoneInput").value = TEST_PHONE;
  click(doc.querySelector('[data-action="submit-cancel-lookup"]'), "submit (correct phone)");
  await waitFor(() => w.eval('ui.customer.cancelStatus') === "success", "cancellation success");
  const cancelCall = rpcs("cancel_appointment_customer").at(-1);
  check("the cancellation named exactly the selected booking + typed phone",
    cancelCall.args.p_appointment_id === newId && cancelCall.args.p_customer_phone === TEST_PHONE,
    JSON.stringify(cancelCall.args));
  check("the booking is cancelled in the backend (stub) and nothing else changed",
    w.__SMOKE__.db.appointments.find((a) => a.id === newId)?.status === "cancelled" &&
    w.__SMOKE__.db.appointments.find((a) => a.id === "EXISTING-CUSTOMER-BOOKING")?.status === "confirmed" &&
    w.__SMOKE__.calls.writes.filter((x) => x.table === "appointments").length === 0);
  check("the cancelled booking disappears from device memory", !memory().some((e) => e.id === newId), `n2d-my-bookings-v1: ${JSON.stringify(memory())}`);
  click(doc.querySelector('[data-action="cancel-lookup-done"]'), "done");
  await waitFor(() => doc.querySelector('[data-action="open-cancel-lookup"]'), "cancel entry button");
  click(doc.querySelector('[data-action="open-cancel-lookup"]'), "back to cancel screen");
  await sleep(150);
  // Clearing the reference (remembered booking already forgotten) must ask for
  // the reference, not for the phone number.
  const referenceField = $("#cancelAppointmentId");
  const referenceToastCheck = (() => {
    if (!referenceField) return null;
    referenceField.value = "";
    $("#cancelPhoneInput").value = TEST_PHONE;
    click(doc.querySelector('[data-action="submit-cancel-lookup"]'), "submit (no reference)");
    return $("#toast")?.textContent || "";
  })();
  check("an empty reference asks for the reference, not the phone number",
    referenceToastCheck === "Zadejte prosím číslo rezervace.", `toast: ${referenceToastCheck}`);

  const listAfter = doc.querySelector(".my-booking-list");
  check("the cancel screen no longer offers it", !listAfter || ![...listAfter.querySelectorAll("[data-action=use-my-booking]")].some((b) => b.dataset.id === newId),
    listAfter ? `still listed: ${[...listAfter.querySelectorAll("[data-action=use-my-booking]")].map((b) => b.dataset.id).join(", ")}` : "list hidden");

  // ---- 6. capacity picker preserves values above 4 -------------------------
  // The salon is configured with 6 concurrent bookings (above the 1–4 the picker
  // used to offer), then the staff data is refetched exactly as the app does.
  await w.eval('__SMOKE__.db.salons.find(s => s.id === "orli").default_capacity = 6; ui.mode = "staff"; ui.salonId = "orli"; forceReloadStaffData(ui.selectedDate, render); "ok"');
  await waitFor(() => w.eval('remoteStaffState.status === "ready"'), "staff data refetch");
  click(doc.querySelector('.mode-switch [data-mode="staff"]'), "staff mode");
  await waitFor(() => doc.querySelector('[data-action="open-day-settings"]'), "staff dashboard");
  click(doc.querySelector('[data-action="open-day-settings"]'), "adjust day");
  await waitFor(() => $("#dayCapacity"), "day settings modal");
  const optionsOrli = [...doc.querySelectorAll("#dayCapacity option")].map((o) => o.value);
  check("capacity 6: the dialog keeps 6 selected (was 1 before the fix)", $("#dayCapacity").value === "6" && optionsOrli.includes("6"),
    `selected ${$("#dayCapacity").value}, options ${optionsOrli.join("/")}`);
  click(doc.querySelector('[data-action="save-day-settings"]'), "save day");
  await sleep(300);
  const savedOrli = w.__SMOKE__.calls.writes.filter((x) => x.table === "day_overrides").at(-1);
  check("capacity 6: an untouched save writes 6, not 1", Number(savedOrli?.values?.capacity) === 6, JSON.stringify(savedOrli?.values));

  click(doc.querySelector('[data-staff-salon="kubickova"]'), "salon tab");
  await waitFor(() => doc.querySelector('[data-action="open-day-settings"]'), "staff dashboard (2)");
  click(doc.querySelector('[data-action="open-day-settings"]'), "adjust day (2)");
  await waitFor(() => $("#dayCapacity"), "day settings modal (2)");
  const optionsKub = [...doc.querySelectorAll("#dayCapacity option")].map((o) => o.value);
  check("capacity 3 keeps the original 1–4 option list with 3 selected",
    optionsKub.join("/") === "1/2/3/4" && $("#dayCapacity").value === "3", `selected ${$("#dayCapacity").value}, options ${optionsKub.join("/")}`);

  // ---- 7. nothing ever tried to reach the real backend ---------------------
  check("no request was made to any host other than the preview", refusedRequests.length === 0,
    refusedRequests.length ? `refused: ${refusedRequests.join(", ")}` : `${rpcs("create_customer_booking").length} booking rpc(s), ${rpcs("cancel_appointment_customer").length} cancel rpc(s) — all served by the in-page stub`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) { console.log(`FAILED:\n${failed.map((f) => `  - ${f.name}${f.detail ? ` (${f.detail})` : ""}`).join("\n")}`); }
  w.close();
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => { console.error("SMOKE TEST ERROR:", err); process.exit(2); });
