// Focused regression tests for P1 product requirements (run: `npm test` in tests/).
// These drive the REAL index.html + supabase-client.js + app.js through jsdom and
// use an in-memory Supabase double. They never contact the real Supabase project.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadApp, createFakeSupabase, TINY_JPEG } from "./harness.mjs";

const DATE = "2026-10-20";
const START = "10:00";

// Exact strings required by the owner (Vy). Changing them is a product decision.
const COPY = {
  cs: {
    referencePhotoRequiredLabel: "Referenční fotka (povinné)",
    referencePhotoOptionalLabel: "Referenční fotka (nepovinné)",
    referencePhotoRequiredMessage: "Pro pokračování nahrajte referenční fotku.",
    photoUploadErrorRequired: "Fotku se nepodařilo nahrát. Zkuste to prosím znovu.",
    photoUploadErrorOptional: "Fotku se nepodařilo nahrát. Zkuste to prosím znovu, nebo pokračujte bez fotky.",
    instagramLabel: "Uživatelské jméno na Instagramu (nepovinné)",
  },
  en: {
    referencePhotoRequiredLabel: "Reference photo (required)",
    referencePhotoRequiredMessage: "Please upload a reference photo to continue.",
    photoUploadErrorRequired: "Could not upload the photo. Please try again.",
    instagramLabel: "Instagram username (optional)",
  },
};

// ---------------------------------------------------------------- helpers ----
async function openModelace(app, { length = null, designMode = null, photo = null } = {}) {
  app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = "orli";
    ui.customer.pendingManiId = "orli-modelace-0"; ui.customer.step = 1;`);
  setCustomer(app, { length, designMode, photo });
  await app.flush();
}
function setCustomer(app, patch) {
  app.eval(`Object.assign(ui.customer, ${JSON.stringify(patch)}); render();`);
}
function clickAction(app, action) {
  const el = app.$(`[data-action="${action}"]`);
  assert.ok(el, `expected a [data-action="${action}"] element`);
  el.click();
}
async function fillDetails(app, { name = "Anna Nováková", phone = "+420 601 100 221", instagram = "" } = {}) {
  setCustomer(app, { step: 3 });
  app.$("#customerName").value = name;
  app.$("#customerPhone").value = phone;
  app.$("#customerInstagram").value = instagram;
}
function bookingRpcs(app) {
  return app.supabase.calls.rpc.filter((c) => c.name === "create_customer_booking");
}

// ------------------------------------------- REQUIREMENT 1: reference photo ---
test("A: Design + inspiration without a photo is blocked with the CS message and a required label", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    await openModelace(app, { length: "short", designMode: "combo" });
    const label = app.$(".addon-panel .field label")?.textContent?.trim();
    assert.equal(label, COPY.cs.referencePhotoRequiredLabel);
    assert.equal(app.$('[data-action="continue-manicure"]').disabled, true, "Continue must be disabled");
    assert.equal(app.$(".field-error")?.textContent?.trim(), COPY.cs.referencePhotoRequiredMessage);

    // A stale/direct activation of Continue must still be refused by the handler.
    app.staleAction("continue-manicure");
    await app.flush();
    assert.equal(app.eval("ui.customer.step"), 1, "wizard must not advance");
    assert.equal(app.toast(), COPY.cs.referencePhotoRequiredMessage);
  } finally { app.close(); }
});

test("A2: confirmation without a photo in combo mode is refused before any RPC call (defensive check)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    await openModelace(app, { length: "short", designMode: "combo" });
    setCustomer(app, { serviceId: "orli-modelace-0", date: DATE, start: START, step: 4, name: "Anna", phone: "+420 601 100 221" });
    app.staleAction("confirm-booking");
    await app.flush();
    assert.equal(bookingRpcs(app).length, 0, "create_customer_booking must not be called");
    assert.equal(app.supabase.calls.upload.length, 0, "no upload either");
    assert.equal(app.toast(), COPY.cs.referencePhotoRequiredMessage);
  } finally { app.close(); }
});

test("B: Design + inspiration with a valid photo is allowed; the photo is uploaded and its path sent to the RPC", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    await openModelace(app, { length: "short", designMode: "combo", photo: TINY_JPEG });
    assert.equal(app.$(".field-error"), null, "no validation message when a photo is attached");
    assert.equal(app.$('[data-action="continue-manicure"]').disabled, false);
    clickAction(app, "continue-manicure");
    await app.flush();
    assert.equal(app.eval("ui.customer.step"), 2, "advances to date/time");

    setCustomer(app, { date: DATE, start: START, step: 4, name: "Anna", phone: "+420 601 100 221" });
    clickAction(app, "confirm-booking");
    await app.flush(10);
    assert.equal(app.supabase.calls.upload.length, 1, "photo uploaded once");
    const [rpc] = bookingRpcs(app);
    assert.ok(rpc, "booking RPC called");
    assert.match(rpc.args.p_reference_photo_path, /^pending\/[^/]+\/photo\.jpg$/);
    assert.equal(rpc.args.p_design_mode, "combo");
    assert.equal(rpc.args.p_length_key, "short");
  } finally { app.close(); }
});

test("C: other design modes without a photo keep the existing behaviour (no requirement, optional label)", async () => {
  for (const designMode of ["none", "design"]) {
    const app = await loadApp({ language: "cs" });
    try {
      await openModelace(app, { length: "short", designMode });
      assert.equal(app.$(".field-error"), null, `${designMode}: no required-photo message`);
      assert.equal(app.$("#customerPhotoInput"), null, `${designMode}: no photo control rendered`);
      assert.equal(app.$('[data-action="continue-manicure"]').disabled, false, `${designMode}: Continue enabled`);
      clickAction(app, "continue-manicure");
      await app.flush();
      assert.equal(app.eval("ui.customer.step"), 2, `${designMode}: advances`);

      setCustomer(app, { date: DATE, start: START, step: 4, name: "Anna", phone: "+420 601 100 221" });
      clickAction(app, "confirm-booking");
      await app.flush(10);
      const [rpc] = bookingRpcs(app);
      assert.ok(rpc, `${designMode}: booking submitted without a photo`);
      assert.equal(rpc.args.p_reference_photo_path, null);
      assert.equal(app.supabase.calls.upload.length, 0);
    } finally { app.close(); }
  }
});

test("C2: a non-Modelace service keeps its optional photo field at the details step", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = "orli";
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = "${DATE}"; ui.customer.start = "${START}"; ui.customer.step = 3; render();`);
    await app.flush();
    const photoLabel = [...app.doc.querySelectorAll(".field label")].map((l) => l.textContent.trim());
    assert.ok(photoLabel.includes(COPY.cs.referencePhotoOptionalLabel), "optional label kept for non-Modelace");
    await fillDetails(app);
    clickAction(app, "customer-details-next");
    await app.flush();
    assert.equal(app.eval("ui.customer.step"), 4, "details can proceed without a photo");
  } finally { app.close(); }
});

test("D: required-photo upload failure does not call the booking RPC and shows the required-mode message", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.supabase.handlers.upload = async () => ({ error: new Error("storage down") });
    await openModelace(app, { length: "short", designMode: "combo", photo: TINY_JPEG });
    clickAction(app, "continue-manicure");
    await app.flush();
    setCustomer(app, { date: DATE, start: START, step: 4, name: "Anna", phone: "+420 601 100 221" });
    clickAction(app, "confirm-booking");
    await app.flush(10);
    assert.equal(app.supabase.calls.upload.length, 1, "upload was attempted");
    assert.equal(bookingRpcs(app).length, 0, "booking RPC must NOT be called");
    assert.equal(app.toast(), COPY.cs.photoUploadErrorRequired);
    assert.equal(app.eval("customerBookingInFlight"), false, "submit flag reset so the user can retry");
    assert.ok(app.eval("ui.customer.photo"), "photo kept so the user can retry");
  } finally { app.close(); }
});

test("D2: non-Modelace photo upload failure keeps the original message that allows continuing without a photo", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.supabase.handlers.upload = async () => ({ error: new Error("storage down") });
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = "orli";
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = "${DATE}"; ui.customer.start = "${START}";
      ui.customer.name = "Anna"; ui.customer.phone = "+420 601 100 221"; ui.customer.photo = "${TINY_JPEG}"; ui.customer.step = 4; render();`);
    clickAction(app, "confirm-booking");
    await app.flush(10);
    assert.equal(bookingRpcs(app).length, 0);
    assert.equal(app.toast(), COPY.cs.photoUploadErrorOptional, "optional-photo wording unchanged");
  } finally { app.close(); }
});

test("E: Design + inspiration copy is correct in English", async () => {
  const app = await loadApp({ language: "en" });
  try {
    await openModelace(app, { length: "short", designMode: "combo" });
    assert.equal(app.$(".addon-panel .field label")?.textContent?.trim(), COPY.en.referencePhotoRequiredLabel);
    assert.equal(app.$(".field-error")?.textContent?.trim(), COPY.en.referencePhotoRequiredMessage);
    app.staleAction("continue-manicure");
    await app.flush();
    assert.equal(app.toast(), COPY.en.referencePhotoRequiredMessage);
  } finally { app.close(); }
});

test("E2: English required-mode upload failure omits the 'continue without a photo' wording", async () => {
  const app = await loadApp({ language: "en" });
  try {
    app.supabase.handlers.upload = async () => ({ error: new Error("storage down") });
    await openModelace(app, { length: "short", designMode: "combo", photo: TINY_JPEG });
    clickAction(app, "continue-manicure");
    await app.flush();
    setCustomer(app, { date: DATE, start: START, step: 4, name: "Anna", phone: "+420 601 100 221" });
    clickAction(app, "confirm-booking");
    await app.flush(10);
    assert.equal(app.toast(), COPY.en.photoUploadErrorRequired);
    assert.doesNotMatch(app.toast(), /continue without/i);
  } finally { app.close(); }
});

test("E3: existing photo validation (type and size) is unchanged", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.eval(`handlePhotoFile({ type: "image/gif", size: 10 }, () => { throw new Error("must not accept"); })`);
    await app.flush();
    assert.equal(app.toast(), app.eval('t("photoInvalidType")'));
    app.eval(`handlePhotoFile({ type: "image/png", size: MAX_PHOTO_SOURCE_BYTES + 1 }, () => { throw new Error("must not accept"); })`);
    await app.flush();
    assert.equal(app.toast(), app.eval('t("photoTooLarge")'));
  } finally { app.close(); }
});

// ----------------------------------------------- REQUIREMENT 2: Instagram ----
test("F: customer booking without Instagram proceeds, and the RPC receives an empty string (no fake value)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = "orli";
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = "${DATE}"; ui.customer.start = "${START}"; ui.customer.step = 3; render();`);
    await app.flush();
    assert.equal(app.$("#customerInstagram").closest(".field").querySelector("label").textContent.trim(), COPY.cs.instagramLabel);
    await fillDetails(app, { instagram: "" });
    clickAction(app, "customer-details-next");
    await app.flush();
    assert.equal(app.eval("ui.customer.step"), 4, "empty Instagram must not block");
    clickAction(app, "confirm-booking");
    await app.flush(10);
    const [rpc] = bookingRpcs(app);
    assert.ok(rpc, "booking submitted");
    assert.equal(rpc.args.p_customer_instagram, "", "empty stays empty (no 'N/A', '@unknown', or 'null')");
    assert.equal(rpc.args.p_customer_phone, "+420 601 100 221", "phone still sent");
  } finally { app.close(); }
});

test("F2: customer phone remains required", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = "orli";
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = "${DATE}"; ui.customer.start = "${START}"; ui.customer.step = 3; render();`);
    await app.flush();
    await fillDetails(app, { phone: "", instagram: "" });
    clickAction(app, "customer-details-next");
    await app.flush();
    assert.equal(app.eval("ui.customer.step"), 3);
    assert.equal(app.toast(), app.eval('t("requiredContact")'));
  } finally { app.close(); }
});

test("G: staff manual booking without Instagram is accepted", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openManualModal(app, { instagram: "" });
    await app.flush();
    app.$("#manualName").value = "Walk-in";
    app.$("#manualPhone").value = "+420 601 100 221";
    app.$("#manualInstagram").value = "";
    clickAction(app, "save-manual");
    await app.flush(10);
    const rpc = app.supabase.calls.rpc.find((c) => c.name === "create_staff_booking");
    assert.ok(rpc, "create_staff_booking called");
    assert.equal(rpc.args.p_customer_instagram, "");
    assert.notEqual(app.toast(), app.eval('t("manualRequired")'));
  } finally { app.close(); }
});

test("G2: staff manual booking still requires a phone number", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openManualModal(app, { instagram: "" });
    await app.flush();
    app.$("#manualName").value = "Walk-in";
    app.$("#manualPhone").value = "";
    app.$("#manualInstagram").value = "";
    clickAction(app, "save-manual");
    await app.flush();
    assert.equal(app.supabase.calls.rpc.filter((c) => c.name === "create_staff_booking").length, 0);
    assert.equal(app.toast(), app.eval('t("manualRequired")'));
  } finally { app.close(); }
});

test("G3: staff manual Instagram label is optional in Czech", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openManualModal(app, { instagram: "" });
    await app.flush();
    const label = app.$("#manualInstagram").closest(".field").querySelector("label").textContent.trim();
    assert.equal(label, COPY.cs.instagramLabel);
  } finally { app.close(); }
});

test("H: staff editing without Instagram can save; an empty stored value is shown as empty, not 'null'", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openEditModal(app, { instagram: null });
    await app.flush();
    assert.equal(app.$("#editInstagram").value, "", "NULL stored value must not prefill the text 'null'");
    app.$("#editName").value = "Anna Edited";
    clickAction(app, "save-edit-appointment");
    await app.flush(10);
    const update = app.supabase.calls.update.find((u) => u.table === "appointments");
    assert.ok(update, "appointment update sent");
    assert.equal(update.values.customer_name, "Anna Edited");
    assert.equal("customer_instagram" in update.values, false, "unset Instagram is left untouched (no fake value written)");
    assert.notEqual(app.toast(), app.eval('t("nameContactRequired")'));
  } finally { app.close(); }
});

test("H2: staff editing can clear an existing Instagram explicitly (empty string, same as the customer flow)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openEditModal(app, { instagram: "@anna.demo" });
    await app.flush();
    app.$("#editInstagram").value = "";
    clickAction(app, "save-edit-appointment");
    await app.flush(10);
    const update = app.supabase.calls.update.find((u) => u.table === "appointments");
    assert.equal(update.values.customer_instagram, "");
  } finally { app.close(); }
});

test("I: valid Instagram is accepted in the customer flow and in staff manual booking", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = "orli";
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = "${DATE}"; ui.customer.start = "${START}"; ui.customer.step = 3; render();`);
    await app.flush();
    await fillDetails(app, { instagram: "@anna.nails_1" });
    clickAction(app, "customer-details-next");
    await app.flush();
    assert.equal(app.eval("ui.customer.step"), 4);
    assert.equal(app.eval("ui.customer.instagram"), "@anna.nails_1");

    openManualModal(app, { instagram: "" });
    await app.flush();
    app.$("#manualName").value = "Walk-in";
    app.$("#manualPhone").value = "+420 601 100 221";
    app.$("#manualInstagram").value = "@walkin.2";
    clickAction(app, "save-manual");
    await app.flush(10);
    const rpc = app.supabase.calls.rpc.find((c) => c.name === "create_staff_booking");
    assert.equal(rpc?.args.p_customer_instagram, "@walkin.2");
  } finally { app.close(); }
});

test("J: invalid non-empty Instagram is rejected in the customer flow, staff manual booking, and staff edit", async () => {
  const invalidIg = app0 => app0.eval('t("invalidInstagram")');
  // customer
  let app = await loadApp({ language: "cs" });
  try {
    app.eval(`ui.mode = "customer"; ui.customer = freshCustomer(); ui.customer.salonId = "orli";
      ui.customer.serviceId = "orli-manikura-0"; ui.customer.date = "${DATE}"; ui.customer.start = "${START}"; ui.customer.step = 3; render();`);
    await app.flush();
    await fillDetails(app, { instagram: "bad name!" });
    clickAction(app, "customer-details-next");
    await app.flush();
    assert.equal(app.eval("ui.customer.step"), 3, "customer blocked");
    assert.equal(app.toast(), invalidIg(app));
  } finally { app.close(); }

  // staff manual
  app = await loadApp({ language: "cs" });
  try {
    openManualModal(app, { instagram: "" });
    await app.flush();
    app.$("#manualName").value = "Walk-in";
    app.$("#manualPhone").value = "+420 601 100 221";
    app.$("#manualInstagram").value = "bad name!";
    clickAction(app, "save-manual");
    await app.flush(10);
    assert.equal(app.supabase.calls.rpc.filter((c) => c.name === "create_staff_booking").length, 0);
    assert.equal(app.toast(), invalidIg(app));
  } finally { app.close(); }

  // staff edit (changed value)
  app = await loadApp({ language: "cs" });
  try {
    openEditModal(app, { instagram: "@anna.demo" });
    await app.flush();
    app.$("#editInstagram").value = "bad name!";
    clickAction(app, "save-edit-appointment");
    await app.flush(10);
    assert.equal(app.supabase.calls.update.length, 0);
    assert.equal(app.toast(), invalidIg(app));
  } finally { app.close(); }
});

test("K: an existing Instagram is preserved when unrelated appointment fields change (even if stored in an older format)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    openEditModal(app, { instagram: "@anna.demo" });
    await app.flush();
    app.$("#editPhone").value = "+420 777 000 111";
    clickAction(app, "save-edit-appointment");
    await app.flush(10);
    const update = app.supabase.calls.update.find((u) => u.table === "appointments");
    assert.equal(update.values.customer_instagram, "@anna.demo");
  } finally { app.close(); }

  const legacy = await loadApp({ language: "cs" });
  try {
    openEditModal(legacy, { instagram: "legacy handle!" });
    await legacy.flush();
    legacy.$("#editName").value = "Anna Renamed";
    clickAction(legacy, "save-edit-appointment");
    await legacy.flush(10);
    const update = legacy.supabase.calls.update.find((u) => u.table === "appointments");
    assert.ok(update, "unrelated edit is not blocked by an unchanged legacy value");
    assert.equal(update.values.customer_instagram, "legacy handle!");
  } finally { legacy.close(); }
});

// ------------------------------------------------------------ REGRESSION -----
test("L: Design + inspiration adds exactly 30 minutes to every nail length; other modes unchanged", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    const dur = (length, designMode, addOns = []) => app.eval(
      `remoteCustomerBookingDuration({ serviceId: "orli-modelace-0", length: ${JSON.stringify(length)}, designMode: ${JSON.stringify(designMode)}, addOns: ${JSON.stringify(addOns)} }, remoteServiceById("orli-modelace-0"))`);
    assert.equal(dur("short", "combo"), 80);
    assert.equal(dur("medium", "combo"), 85);
    assert.equal(dur("long", "combo"), 90);
    assert.equal(dur("extraLong", "combo"), 100);
    // Add-ons are never part of a combo submission, so combo is still exactly +30.
    assert.equal(dur("short", "combo", ["addon-francie"]), 80);
    // Unchanged modes.
    assert.equal(dur("short", "none"), 50);
    assert.equal(dur("short", "design", ["addon-francie"]), 60);
    assert.equal(dur("short", "design"), 50);
  } finally { app.close(); }
});

test("L2: the duration shown on the combo panel and used for availability is the +30 value", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    await openModelace(app, { length: "short", designMode: "combo", photo: TINY_JPEG });
    assert.match(app.$(".addon-panel .selection-summary").textContent, /80 min/);
    setCustomer(app, { serviceId: "orli-modelace-0", step: 2, date: DATE });
    await app.flush(10);
    const avail = app.supabase.calls.rpc.filter((c) => c.name === "get_available_slots").at(-1);
    assert.ok(avail, "availability requested");
    assert.equal(avail.args.p_duration_minutes, 80);
  } finally { app.close(); }
});

test("M: availability and booking calls keep the same parameter contract (no new or renamed fields)", async () => {
  const app = await loadApp({ language: "cs" });
  try {
    await openModelace(app, { length: "short", designMode: "combo", photo: TINY_JPEG });
    clickAction(app, "continue-manicure");
    await app.flush();
    setCustomer(app, { date: DATE, start: START, step: 4, name: "Anna", phone: "+420 601 100 221" });
    clickAction(app, "confirm-booking");
    await app.flush(10);
    const [rpc] = bookingRpcs(app);
    assert.deepEqual(Object.keys(rpc.args).sort(), [
      "p_add_on_ids", "p_customer_instagram", "p_customer_name", "p_customer_notes", "p_customer_phone",
      "p_date", "p_design_mode", "p_length_key", "p_reference_photo_path", "p_reminder_requested",
      "p_salon_id", "p_service_id", "p_start_time",
    ]);
  } finally { app.close(); }
});

// -------------------------------------------------------- staff fixtures -----
function openManualModal(app, { instagram }) {
  app.eval(`ui.mode = "staff"; ui.salonId = "orli"; ui.selectedDate = "${DATE}";
    ui.modal = { type: "manual", draft: { salonId: "orli", serviceId: "orli-manikura-0", date: "${DATE}", time: "${START}", length: null, addOns: [], name: "", phone: "", instagram: ${JSON.stringify(instagram)}, notes: "", reminder: true } };
    renderModal();`);
}
function openEditModal(app, { instagram }) {
  app.eval(`ui.mode = "staff"; ui.salonId = "orli"; ui.selectedDate = "${DATE}";
    state.appointments.push({ id: "appt-1", salonId: "orli", date: "${DATE}", start: "${START}", end: "11:00", serviceId: "orli-manikura-0", serviceName: "Refill", duration: 60, name: "Anna", phone: "+420 601 100 221", instagram: ${JSON.stringify(instagram)}, notes: "", reminder: true, addOns: [], photo: null, source: "Online booking", status: "confirmed", createdAt: 1 });
    ui.modal = { type: "edit-appointment", id: "appt-1" };
    renderModal();`);
}
