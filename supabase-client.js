// =============================================================================
// N2D booking — Phase 3A: Supabase wiring for the CUSTOMER booking flow only.
//
// This file is the entire surface area that talks to the real backend. It is
// deliberately kept separate from app.js so the wiring is easy to audit in
// one place. Nothing in here touches localStorage, the staff dashboard, or
// any state used by staff-side rendering — see app.js for how the two stay
// separate (customer-only remote* functions vs. the pre-existing state.*
// used everywhere else, unchanged).
//
// Only the public/publishable anon key is used here (safe to ship in a
// browser bundle — access control is enforced entirely by Postgres RLS on
// the project, not by keeping this key secret). No service_role key or DB
// password ever appears in frontend code.
// =============================================================================

const SUPABASE_URL = "https://tmpjbztepsweytapnirh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WNE6dI1jTMiPZ47NTE2xMQ_8FJ_Heah";

// Phase 3B note: `persistSession` is now `true`. The customer flow still
// never authenticates (anon calls create no auth session, so there is
// nothing of the customer's to persist), but real manager login (added
// below) needs its session to survive a page reload, so Supabase Auth is
// allowed to keep its own token under its own localStorage key (namespaced
// by Supabase, e.g. "sb-<project-ref>-auth-token"). This is the auth
// session token only — never any booking/customer data — and is completely
// separate from the app's own n2d-salon-prototype-v4 key, which continues to
// hold only the local demo dataset (see app.js), never real staff data.
const supabaseClient = (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function")
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// How long a fetched catalog / availability result is trusted before a fresh
// render triggers a refetch. Short enough that a slot someone else just took
// disappears from the calendar within under a minute; the actual booking
// write is never trusted to this cache — create_customer_booking always
// re-validates server-side regardless of what the calendar last showed.
const REMOTE_CACHE_TTL_MS = 45000;

// ---------------------------------------------------------------------------
// Catalog (salons / services / add-ons / modelace lengths) — public, safe,
// price-free data. Fetched once per TTL window, shared by every salon.
// ---------------------------------------------------------------------------
const remoteCatalog = {
  status: "idle", // idle | loading | ready | error
  fetchedAt: 0,
  salons: [],
  services: [],
  addOns: [],
  modelaceLengths: [],
  error: null,
};

function remoteCatalogIsStale() {
  // "error" is deliberately NOT automatically stale here (only "idle" or past
  // the TTL are) — an error entry already carries a fresh fetchedAt (stamped
  // in the .catch below), so this is what throttles automatic retries to
  // once per REMOTE_CACHE_TTL_MS rather than re-firing on every render() the
  // failed fetch's own onSettled callback triggers (a tight, immediate retry
  // loop while the network/API is down). forceReloadRemoteCatalog() (the
  // explicit "Try again" button) bypasses this intentionally.
  return remoteCatalog.status === "idle" ||
    (Date.now() - remoteCatalog.fetchedAt) > REMOTE_CACHE_TTL_MS;
}

// Kicks off (or reuses an in-flight/fresh) catalog fetch. Always safe to call
// on every render — it no-ops unless the cache is empty, stale, or errored.
// `onSettled` is called (successfully fetched or failed) so the caller can
// re-render once new data is available; it is never called synchronously
// from within this function, matching the rest of the app's render-after-
// state-change pattern.
function ensureRemoteCatalog(onSettled) {
  if (!supabaseClient) {
    remoteCatalog.status = "error";
    remoteCatalog.error = "no-client";
    return;
  }
  if (remoteCatalog.status === "loading" || !remoteCatalogIsStale()) return;
  remoteCatalog.status = "loading";
  Promise.all([
    supabaseClient.from("salons").select("id,name,address"),
    supabaseClient.from("public_services").select("id,salon_id,category,group_name,name,duration_minutes,active").eq("active", true),
    supabaseClient.from("public_add_ons").select("id,salon_id,name,duration_delta_minutes,active").eq("active", true),
    supabaseClient.from("modelace_lengths").select("key,minutes,sort_order").order("sort_order"),
  ]).then(([salonsRes, servicesRes, addOnsRes, lengthsRes]) => {
    const firstError = salonsRes.error || servicesRes.error || addOnsRes.error || lengthsRes.error;
    if (firstError) throw firstError;
    remoteCatalog.salons = salonsRes.data.map(s => ({ id: s.id, name: s.name, address: s.address }));
    remoteCatalog.services = servicesRes.data.map(s => ({
      id: s.id, salonId: s.salon_id, category: s.category, group: s.group_name,
      name: s.name, duration: s.duration_minutes, active: s.active,
    }));
    remoteCatalog.addOns = addOnsRes.data.map(a => ({
      id: a.id, salonId: a.salon_id, name: a.name, durationDelta: a.duration_delta_minutes,
    }));
    remoteCatalog.modelaceLengths = lengthsRes.data.map(l => ({ key: l.key, minutes: l.minutes }));
    remoteCatalog.status = "ready";
    remoteCatalog.error = null;
    remoteCatalog.fetchedAt = Date.now();
  }).catch((err) => {
    console.warn("Could not load catalog from Supabase", err);
    remoteCatalog.status = "error";
    remoteCatalog.error = err;
    // Still stamp fetchedAt on failure so the TTL check above throttles
    // automatic retries (every render() call) to once per TTL window rather
    // than hammering the API in a tight loop while the network is down.
    // forceReloadRemoteCatalog() (the explicit "Try again" button) bypasses
    // this by resetting fetchedAt directly.
    remoteCatalog.fetchedAt = Date.now();
  }).finally(() => { if (onSettled) onSettled(); });
}

// Used by the customer flow's explicit "Try again" button so a deliberate
// retry isn't throttled by the same TTL that protects against a runaway
// automatic retry loop.
function forceReloadRemoteCatalog(onSettled) {
  remoteCatalog.status = "idle";
  remoteCatalog.fetchedAt = 0;
  ensureRemoteCatalog(onSettled);
}

// ---------------------------------------------------------------------------
// Availability — one cache entry per (salon, date, duration). Backed by the
// get_available_slots RPC (Phase 3A addition; see
// supabase/migrations/20260101000007_customer_availability.sql), itself a
// read-only composition of the existing, frozen get_day_config/
// is_slot_bookable functions. Never used to decide whether a booking
// succeeds — only to decide what the calendar SHOWS; create_customer_booking
// is always the real, final authority.
// ---------------------------------------------------------------------------
const availabilityCache = new Map(); // key -> { status, fetchedAt, configured, times, error }

function availabilityCacheKey(salonId, date, durationMinutes) {
  return `${salonId}|${date}|${durationMinutes}`;
}

// Synchronous read of whatever is currently known (possibly stale/loading/
// absent) and, as a side effect, kicks off a background fetch if the entry is
// missing, errored, or past its TTL. Calls `onSettled` once new data lands.
function getRemoteAvailability(salonId, date, durationMinutes, onSettled) {
  const key = availabilityCacheKey(salonId, date, durationMinutes);
  let entry = availabilityCache.get(key);
  // NOTE: unlike a first read, an "error" entry must NOT be treated as
  // unconditionally stale here — it already carries a fresh fetchedAt (set
  // in the .catch below), so this TTL check is what throttles automatic
  // retries to once per REMOTE_CACHE_TTL_MS instead of re-firing on every
  // single render() the failed fetch's own onSettled callback triggers
  // (which would otherwise be a tight, immediate retry loop while the
  // network/API is down). A deliberate manual retry uses
  // forceReloadRemoteAvailability() to bypass this intentionally.
  const stale = !entry || (Date.now() - entry.fetchedAt) > REMOTE_CACHE_TTL_MS;

  if (!supabaseClient) {
    return { status: "error", configured: false, times: [] };
  }

  if (stale && (!entry || entry.status !== "loading")) {
    entry = { status: "loading", fetchedAt: entry ? entry.fetchedAt : 0, configured: entry ? entry.configured : false, times: entry ? entry.times : [], error: null };
    availabilityCache.set(key, entry);
    supabaseClient.rpc("get_available_slots", {
      p_salon_id: salonId,
      p_date: date,
      p_duration_minutes: durationMinutes,
      p_ignore_appointment_id: null,
    }).then(({ data, error }) => {
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      availabilityCache.set(key, {
        status: "ready",
        fetchedAt: Date.now(),
        configured: !!row?.configured,
        times: (row?.available_start_times || []).map(t => String(t).slice(0, 5)),
        error: null,
      });
    }).catch((err) => {
      console.warn("Could not load availability from Supabase", err);
      const prev = availabilityCache.get(key);
      availabilityCache.set(key, { status: "error", fetchedAt: Date.now(), configured: prev?.configured || false, times: prev?.times || [], error: err });
    }).finally(() => { if (onSettled) onSettled(); });
  }

  return availability_cacheReadCurrent(key);
}
function availability_cacheReadCurrent(key) {
  const entry = availabilityCache.get(key);
  return entry || { status: "loading", configured: false, times: [] };
}

// Used by the customer flow's explicit "Try again" button on the time-grid
// error state — bypasses the TTL so a deliberate retry is immediate.
function forceReloadRemoteAvailability(salonId, date, durationMinutes, onSettled) {
  availabilityCache.delete(availabilityCacheKey(salonId, date, durationMinutes));
  getRemoteAvailability(salonId, date, durationMinutes, onSettled);
}

// Drops cached availability for one salon+date across all durations — called
// right after a booking is confirmed or rejected as slot_unavailable, so the
// next render reflects reality instead of a up-to-45s-old snapshot.
function invalidateRemoteAvailability(salonId, date) {
  const prefix = `${salonId}|${date}|`;
  for (const key of Array.from(availabilityCache.keys())) {
    if (key.startsWith(prefix)) availabilityCache.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Reference photo upload — uploads into the existing private "reference-photos"
// bucket under the pending/<token>/ prefix anon is allowed to write to (see
// supabase/migrations/20260101000005_storage.sql). Returns the storage path
// to pass as create_customer_booking's p_reference_photo_path. The customer
// can never read it back — this is a write-only drop box, exactly as the
// backend was designed and already tested in Phase 2.
// ---------------------------------------------------------------------------
async function uploadReferencePhoto(dataUrl) {
  if (!supabaseClient) throw new Error("no-client");
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const token = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `pending/${token}/photo.${ext}`;
  const { error } = await supabaseClient.storage.from("reference-photos").upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

// ---------------------------------------------------------------------------
// Booking creation — the ONLY write path for a customer booking. Every
// business rule (contact validation, Modelace length/design-mode rule,
// duration/price snapshot, capacity) is re-checked and computed server-side
// by create_customer_booking; nothing here trusts client-side state for
// anything security- or correctness-relevant.
// ---------------------------------------------------------------------------
async function createRemoteCustomerBooking(payload) {
  if (!supabaseClient) throw new Error("no-client");
  const { data, error } = await supabaseClient.rpc("create_customer_booking", {
    p_salon_id: payload.salonId,
    p_service_id: payload.serviceId,
    p_date: payload.date,
    p_start_time: payload.start,
    p_length_key: payload.lengthKey,
    p_design_mode: payload.designMode,
    p_add_on_ids: payload.addOnIds,
    p_customer_name: payload.name,
    p_customer_phone: payload.phone,
    p_customer_instagram: payload.instagram,
    p_customer_notes: payload.notes,
    p_reminder_requested: payload.reminder,
    p_reference_photo_path: payload.referencePhotoPath,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

// ---------------------------------------------------------------------------
// Phase 3C: customer self-cancellation. Calls the existing, already-deployed
// cancel_appointment_customer RPC (see supabase/migrations/
// 20260101000006_customer_self_cancellation.sql) — no new backend capability.
// Ownership is proven by the caller supplying BOTH the appointment id (the
// capability handed to the customer on the confirmation screen) AND the
// phone number used at booking time; the RPC itself normalizes phone digits
// and enforces the 2-hour-before-appointment cutoff server-side, in the
// salon's real local time. Nothing here re-implements or pre-checks that
// cutoff — nothing client-side is ever trusted for it. Errors are thrown
// as-is (err.code carries the Postgres errcode: N2D09/N2D10/N2D11 — see the
// migration for exact meanings) for the caller to branch on, matching the
// existing createRemoteCustomerBooking/err.code pattern used elsewhere.
// ---------------------------------------------------------------------------
async function cancelRemoteCustomerBooking(appointmentId, phone) {
  if (!supabaseClient) throw new Error("no-client");
  const { data, error } = await supabaseClient.rpc("cancel_appointment_customer", {
    p_appointment_id: appointmentId,
    p_customer_phone: phone,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}

// =============================================================================
// N2D booking — Phase 3B: Supabase wiring for the STAFF (manager) dashboard.
//
// Everything below is additive to this file and does not change anything
// above (the customer flow). It adds:
//   1. Real Supabase Auth session handling for manager login/logout.
//   2. A fetch layer that reshapes real backend data into the EXACT same
//      shape app.js's local-demo `state` object already used, so every
//      existing staff render function keeps working completely unchanged —
//      only the SOURCE of `state` changes (see app.js renderStaff()).
//   3. Write functions, one per existing staff action, each calling the
//      matching RPC or RLS-gated table write instead of a local mutation.
//
// Security model (enforced by Postgres RLS + SECURITY DEFINER RPCs, not by
// anything in this file): every read/write below runs as whatever
// Supabase Auth session is currently active in the browser, using the same
// publishable anon key as the customer flow. If that session is missing, not
// staff, or not scoped to a given salon, the server itself refuses the
// request (RLS policies / is_staff() / staff_can_access_salon() — see
// nail-booking-backend/supabase/migrations/20260101000004_rls_policies.sql
// and 20260101000002_helper_functions.sql). This file never trusts a client-
// side "am I staff" flag for security — `isStaffAuthorized()` below only
// controls what the *UI* shows; hiding UI is not itself a security boundary.
// =============================================================================

// ---------------------------------------------------------------------------
// Staff Auth
// ---------------------------------------------------------------------------
let staffSession = null;   // Supabase Auth session, or null
let staffProfile = null;   // { id, display_name, salon_scope, is_active }, or null if not an active staff member
let staffAuthReady = false; // true once the initial session/profile check has resolved
let staffAuthError = null;  // last sign-in error message, shown on the login form

const staffAuthListeners = new Set();
function onStaffAuthChange(cb) { staffAuthListeners.add(cb); }
function notifyStaffAuthChange() { staffAuthListeners.forEach(cb => { try { cb(); } catch (e) { console.warn(e); } }); }

// Looks up the caller's own row in staff_profiles (RLS: staff_profiles_staff_read,
// gated by is_staff(), so this SELECT only ever returns a row for the caller
// themself — never anyone else's). No row, or is_active = false, means "not
// an authorized manager" even though they do have a valid login.
async function refreshStaffProfile() {
  if (!supabaseClient || !staffSession) { staffProfile = null; return null; }
  const { data, error } = await supabaseClient
    .from("staff_profiles")
    .select("id,display_name,salon_scope,is_active")
    .eq("id", staffSession.user.id)
    .maybeSingle();
  if (error) { console.warn("Could not load staff profile", error); staffProfile = null; return null; }
  staffProfile = (data && data.is_active) ? data : null;
  return staffProfile;
}

async function initStaffAuth() {
  if (!supabaseClient) { staffAuthReady = true; notifyStaffAuthChange(); return; }
  const { data } = await supabaseClient.auth.getSession();
  staffSession = data?.session || null;
  await refreshStaffProfile();
  staffAuthReady = true;
  notifyStaffAuthChange();
  // Keeps staffSession/staffProfile correct across token refresh, sign-out in
  // another tab, or a session that simply expires while the page is open.
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    staffSession = session;
    refreshStaffProfile().then(() => notifyStaffAuthChange());
  });
}
if (supabaseClient) initStaffAuth(); else staffAuthReady = true;

async function staffSignIn(email, password) {
  staffAuthError = null;
  if (!supabaseClient) { staffAuthError = "no-client"; throw new Error("no-client"); }
  const { error } = await supabaseClient.auth.signInWithPassword({ email: email.trim(), password });
  if (error) { staffAuthError = error.message || "sign_in_failed"; throw error; }
  const { data } = await supabaseClient.auth.getSession();
  staffSession = data?.session || null;
  await refreshStaffProfile();
  notifyStaffAuthChange();
  return staffProfile;
}

async function staffSignOut() {
  if (supabaseClient) await supabaseClient.auth.signOut();
  staffSession = null;
  staffProfile = null;
  // Drop any cached staff data too, so a subsequent sign-in (same browser,
  // different manager) never briefly shows the previous manager's last-loaded
  // dashboard before the next fetch completes.
  remoteStaffState.status = "idle";
  remoteStaffState.data = null;
  remoteStaffState.rangeStart = null;
  remoteStaffState.rangeEnd = null;
  notifyStaffAuthChange();
}

function staffAuthIsReady() { return staffAuthReady; }
function isStaffAuthenticated() { return !!staffSession; }
function isStaffAuthorized() { return !!staffProfile; }
function currentStaffProfile() { return staffProfile; }
function lastStaffAuthError() { return staffAuthError; }

// ---------------------------------------------------------------------------
// Staff data — fetched into the EXACT shape of app.js's local-demo `state`
// object (see createDemoState() in app.js): { salons, services, addOns,
// appointments, blocks, dayOverrides }. This lets every existing staff
// render/modal function in app.js keep working unchanged; app.js just
// assigns `state = remoteStaffState.data` once it is ready (see
// renderStaff()).
//
// Bounded date window, not "everything forever": appointments/blocks/day
// overrides are fetched for a padded window around whatever date the staff
// member is currently looking at, re-centering (full refetch) whenever
// navigation approaches the edge of what is cached. This keeps a single
// query bounded regardless of how much history/future the salons
// accumulate, while comfortably covering day/week/month calendar views.
// ---------------------------------------------------------------------------
const STAFF_RANGE_PAD_DAYS = 45;
const STAFF_CACHE_TTL_MS = 20000; // separate, shorter TTL than the customer catalog cache — this is an operational tool, changes made on another device should show up promptly on next interaction.

const remoteStaffState = {
  status: "idle", // idle | loading | ready | error
  error: null,
  fetchedAt: 0,
  rangeStart: null, // ISO date, inclusive
  rangeEnd: null,   // ISO date, inclusive
  data: null,       // { salons, services, addOns, appointments, blocks, dayOverrides }
};

function addDaysISO(iso, n) {
  const d = new Date(`${iso}T12:00:00`); // noon avoids DST edge cases shifting the date
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function staffRangeCovers(dateISO) {
  return !!remoteStaffState.rangeStart && dateISO >= remoteStaffState.rangeStart && dateISO <= remoteStaffState.rangeEnd;
}

async function fetchRemoteStaffState(centerDateISO) {
  if (!supabaseClient || !isStaffAuthorized()) return;
  remoteStaffState.status = "loading";
  const start = addDaysISO(centerDateISO, -STAFF_RANGE_PAD_DAYS);
  const end = addDaysISO(centerDateISO, STAFF_RANGE_PAD_DAYS);
  try {
    const [salonsRes, hoursRes, servicesRes, addOnsRes, apptsRes, blocksRes, overridesRes] = await Promise.all([
      supabaseClient.from("salons").select("id,name,address,default_capacity"),
      supabaseClient.from("salon_hours").select("salon_id,weekday,configured,start_time,end_time"),
      supabaseClient.from("services").select("*"),
      supabaseClient.from("add_ons").select("*").eq("active", true),
      supabaseClient.from("appointments").select("*").gte("appointment_date", start).lte("appointment_date", end),
      supabaseClient.from("blocks").select("*").gte("block_date", start).lte("block_date", end),
      supabaseClient.from("day_overrides").select("*").gte("override_date", start).lte("override_date", end),
    ]);
    const firstError = [salonsRes, hoursRes, servicesRes, addOnsRes, apptsRes, blocksRes, overridesRes].find(r => r.error)?.error;
    if (firstError) throw firstError;

    // Reference photos: private bucket, staff-only signed URLs (see
    // 20260101000005_storage.sql — reference_photos_staff_read, gated by
    // is_staff()). Only generated for the minority of appointments that
    // actually have one, so app.js's existing photo rendering code (which
    // just does <img src="${a.photo}">) keeps working unchanged — it never
    // needs to know these are signed URLs instead of data: URLs.
    const withPhoto = apptsRes.data.filter(a => a.reference_photo_path);
    const signedUrlById = {};
    if (withPhoto.length) {
      const signed = await Promise.all(withPhoto.map(a =>
        supabaseClient.storage.from("reference-photos").createSignedUrl(a.reference_photo_path, 3600)
      ));
      withPhoto.forEach((a, i) => { if (!signed[i].error) signedUrlById[a.id] = signed[i].data.signedUrl; });
    }

    const salonsById = {};
    salonsRes.data.forEach(s => {
      salonsById[s.id] = { id: s.id, name: s.name, address: s.address, defaultCapacity: s.default_capacity, hours: [null, null, null, null, null, null, null] };
    });
    hoursRes.data.forEach(h => {
      if (salonsById[h.salon_id]) salonsById[h.salon_id].hours[h.weekday] = { configured: h.configured, start: String(h.start_time).slice(0, 5), end: String(h.end_time).slice(0, 5) };
    });

    const services = servicesRes.data.map(s => ({
      id: s.id, salonId: s.salon_id, category: s.category, group: s.group_name, name: s.name,
      duration: s.duration_minutes, price: Number(s.price_czk), priceFrom: s.price_from, priceLabel: s.price_label,
      color: s.color, active: s.active,
    }));
    const addOns = addOnsRes.data.map(a => ({
      id: a.id, salonId: a.salon_id, name: a.name, price: Number(a.price_czk), priceFrom: a.price_from,
      durationDelta: a.duration_delta_minutes,
    }));

    const appointments = apptsRes.data.map(a => ({
      id: a.id, salonId: a.salon_id, date: a.appointment_date,
      start: String(a.start_time).slice(0, 5), end: String(a.end_time).slice(0, 5),
      serviceId: a.service_id, serviceName: a.service_name_snapshot, duration: a.duration_minutes,
      length: a.length_key, color: a.color,
      price: Number(a.price_czk), priceFrom: a.price_from, priceLabel: a.price_label,
      addOns: (a.add_ons_snapshot || []).map(x => ({ id: x.id, name: x.name, price: Number(x.price), priceFrom: x.priceFrom, durationDelta: x.durationDelta || 0 })),
      addOnsTotal: Number(a.add_ons_total_czk), totalPrice: Number(a.total_price_czk), totalPriceFrom: a.total_price_from,
      name: a.customer_name, phone: a.customer_phone, instagram: a.customer_instagram, notes: a.customer_notes || "",
      photo: a.reference_photo_path ? (signedUrlById[a.id] || null) : null,
      reminder: a.reminder_requested,
      source: a.source === "staff_manual" ? "Added by staff" : (a.source === "client_booking" ? "Online booking" : a.source || ""),
      status: a.status, createdAt: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
      cancelledAt: a.cancelled_at ? new Date(a.cancelled_at).getTime() : null,
    }));

    const blocks = blocksRes.data.map(b => ({
      id: b.id, salonId: b.salon_id, date: b.block_date,
      start: String(b.start_time).slice(0, 5), end: String(b.end_time).slice(0, 5),
      units: b.units, reason: b.reason,
    }));

    const dayOverrides = {};
    overridesRes.data.forEach(o => {
      dayOverrides[`${o.salon_id}|${o.override_date}`] = {
        configured: o.configured, start: String(o.start_time).slice(0, 5), end: String(o.end_time).slice(0, 5), capacity: o.capacity,
      };
    });

    remoteStaffState.data = { salons: Object.values(salonsById), services, addOns, appointments, blocks, dayOverrides };
    remoteStaffState.rangeStart = start;
    remoteStaffState.rangeEnd = end;
    remoteStaffState.status = "ready";
    remoteStaffState.error = null;
    remoteStaffState.fetchedAt = Date.now();
  } catch (err) {
    console.warn("Could not load staff data from Supabase", err);
    remoteStaffState.status = "error";
    remoteStaffState.error = err;
    remoteStaffState.fetchedAt = Date.now();
  }
}

// Safe to call on every staff render — no-ops unless the cache is empty,
// stale (TTL), errored, or the requested date has drifted outside the
// currently-cached window (e.g. staff paged the month view far away).
function ensureStaffData(centerDateISO, onSettled) {
  if (!supabaseClient || !isStaffAuthorized()) return;
  if (remoteStaffState.status === "loading") return;
  const needsFetch = remoteStaffState.status === "idle"
    || remoteStaffState.status === "error"
    || !staffRangeCovers(centerDateISO)
    || (Date.now() - remoteStaffState.fetchedAt) > STAFF_CACHE_TTL_MS;
  if (needsFetch) fetchRemoteStaffState(centerDateISO).then(() => { if (onSettled) onSettled(); });
}

// Called after every successful staff write so the change (and anything a
// concurrent session may have made) is visible immediately, without waiting
// out the TTL.
function forceReloadStaffData(centerDateISO, onSettled) {
  remoteStaffState.fetchedAt = 0;
  remoteStaffState.rangeStart = null;
  remoteStaffState.rangeEnd = null;
  ensureStaffData(centerDateISO, onSettled);
}

// ---------------------------------------------------------------------------
// Staff writes — one function per existing staff action in app.js, each
// calling the matching RPC (appointment create/cancel/reschedule, which need
// the atomic capacity re-check) or the matching RLS-gated table write
// (everything else). None of these trust anything about "am I allowed to do
// this" client-side; every one of them still fails server-side if RLS/the
// RPC's own is_staff()/staff_can_access_salon() check rejects it.
// ---------------------------------------------------------------------------
async function staffCreateBooking(payload) {
  if (!supabaseClient) throw new Error("no-client");
  const { data, error } = await supabaseClient.rpc("create_staff_booking", {
    p_salon_id: payload.salonId,
    p_service_id: payload.serviceId,
    p_date: payload.date,
    p_start_time: payload.start,
    p_length_key: payload.lengthKey,
    p_add_on_ids: payload.addOnIds,
    p_customer_name: payload.name,
    p_customer_phone: payload.phone,
    p_customer_instagram: payload.instagram,
    p_customer_notes: payload.notes,
    p_reminder_requested: payload.reminder,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

async function staffCancelAppointment(appointmentId) {
  if (!supabaseClient) throw new Error("no-client");
  const { data, error } = await supabaseClient.rpc("cancel_appointment", { p_appointment_id: appointmentId });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

async function staffRescheduleAppointment(appointmentId, newDate, newStartTime) {
  if (!supabaseClient) throw new Error("no-client");
  const { data, error } = await supabaseClient.rpc("reschedule_appointment_staff", {
    p_appointment_id: appointmentId, p_new_date: newDate, p_new_start_time: newStartTime,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

// Contact/notes/reminder-only edit — matches appointments_staff_edit_contact
// (RLS) / the appointments_prevent_schedule_tamper trigger, which allow this
// exact set of columns via a direct UPDATE and reject any attempt to touch
// date/time/price/snapshot fields outside the RPCs above.
async function staffUpdateAppointmentContact(appointmentId, fields) {
  if (!supabaseClient) throw new Error("no-client");
  const update = {
    customer_name: fields.name,
    customer_phone: fields.phone,
    customer_notes: fields.notes || null,
    reminder_requested: !!fields.reminder,
  };
  // Instagram is optional (P1). Write the column only when the caller supplied a
  // value; undefined means "leave the stored value untouched". An empty string is
  // an explicit clear and is stored as NULL: this direct UPDATE bypasses
  // create_customer_booking's normalization, and the appointments CHECK constraint
  // rejects ''.
  if (fields.instagram !== undefined) update.customer_instagram = fields.instagram || null;
  const { error } = await supabaseClient.from("appointments").update(update).eq("id", appointmentId);
  if (error) throw error;
}

async function staffCreateBlock(payload) {
  if (!supabaseClient) throw new Error("no-client");
  const { error } = await supabaseClient.from("blocks").insert({
    salon_id: payload.salonId, block_date: payload.date, start_time: payload.start, end_time: payload.end,
    units: payload.units, reason: payload.reason,
  });
  if (error) throw error;
}

async function staffDeleteBlock(blockId) {
  if (!supabaseClient) throw new Error("no-client");
  const { error } = await supabaseClient.from("blocks").delete().eq("id", blockId);
  if (error) throw error;
}

async function staffUpsertDayOverride(payload) {
  if (!supabaseClient) throw new Error("no-client");
  const { error } = await supabaseClient.from("day_overrides").upsert({
    salon_id: payload.salonId, override_date: payload.date,
    configured: payload.configured, start_time: payload.start, end_time: payload.end, capacity: payload.capacity,
  }, { onConflict: "salon_id,override_date" });
  if (error) throw error;
}

// Existing catalog services never had a category-picker in the staff Setup
// UI (the local-demo model didn't need one — `category` was just an
// optional in-memory field only ever set by the seeded demo catalog). The
// real `services.category` column is NOT NULL and also drives the Modelace
// length/add-on flow elsewhere, so a brand-new staff-created service still
// needs *some* category value. Smallest faithful behaviour: reuse the
// category of an existing service in the same salon whose group name
// matches (so retyping an existing group like "Modelace umělých nehtů"
// keeps its Modelace behaviour), otherwise fall back to a slug of the group
// name — never invents a new business rule, just satisfies the column.
function inferServiceCategory(existingServices, salonId, groupName) {
  const norm = (s) => (s || "").trim().toLowerCase();
  const match = existingServices.find(s => s.salonId === salonId && norm(s.group) === norm(groupName));
  if (match) return match.category;
  return norm(groupName).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "other";
}

async function staffUpsertService(existingServices, draft, isNew) {
  if (!supabaseClient) throw new Error("no-client");
  if (isNew) {
    const category = inferServiceCategory(existingServices, draft.salonId, draft.group);
    const id = `${draft.salonId}-custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const { error } = await supabaseClient.from("services").insert({
      id, salon_id: draft.salonId, category, group_name: draft.group, name: draft.name,
      duration_minutes: draft.duration, price_czk: draft.price, price_from: !!draft.priceFrom,
      price_label: draft.priceLabel || null, color: draft.color, active: !!draft.active,
    });
    if (error) throw error;
  } else {
    const { error } = await supabaseClient.from("services").update({
      group_name: draft.group, name: draft.name, duration_minutes: draft.duration,
      price_czk: draft.price, price_from: !!draft.priceFrom, price_label: draft.priceLabel || null,
      active: !!draft.active,
    }).eq("id", draft.id);
    if (error) throw error;
  }
}

async function staffUpsertSalonHours(salonId, weekday, fields) {
  if (!supabaseClient) throw new Error("no-client");
  const { error } = await supabaseClient.from("salon_hours").update({
    configured: fields.configured, start_time: fields.start, end_time: fields.end,
  }).eq("salon_id", salonId).eq("weekday", weekday);
  if (error) throw error;
}
