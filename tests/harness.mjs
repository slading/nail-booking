// Test harness: loads the REAL index.html, supabase-client.js and app.js into a
// jsdom window (no build step, no bundling) and replaces only the network edge
// with an in-memory Supabase double that records every call. Nothing here talks
// to the real Supabase project; no production data is read or written.
import { JSDOM } from "jsdom";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(ROOT, file), "utf8");

// Minimal, price-free catalog mirroring the shapes supabase-client.js expects.
// Modelace lengths match the production values (50/55/60/70 minutes).
const CATALOG = {
  salons: [{ id: "orli", name: "Orli", address: "" }],
  public_services: [
    { id: "orli-modelace-0", salon_id: "orli", category: "modelace", group_name: "new-set", name: "new-design", duration_minutes: 50, active: true },
    { id: "orli-manikura-0", salon_id: "orli", category: "manikura", group_name: "refill", name: "refill-simple", duration_minutes: 45, active: true },
  ],
  public_add_ons: [{ id: "addon-francie", salon_id: "orli", name: "Francie", duration_delta_minutes: 10, active: true }],
  modelace_lengths: [
    { key: "short", minutes: 50, sort_order: 1 },
    { key: "medium", minutes: 55, sort_order: 2 },
    { key: "long", minutes: 60, sort_order: 3 },
    { key: "extraLong", minutes: 70, sort_order: 4 },
  ],
};

export function createFakeSupabase() {
  const calls = { rpc: [], upload: [], update: [] };
  const handlers = {
    // Each handler may be replaced per-test. Return { data, error } like supabase-js.
    rpc: {
      get_available_slots: async () => ({ data: [], error: null }),
      create_customer_booking: async (args) => ({
        data: [{
          id: "booking-1", salon_id: args.p_salon_id, service_name_snapshot: "Test", duration_minutes: 0,
          appointment_date: args.p_date, start_time: `${args.p_start_time}:00`, end_time: `${args.p_start_time}:00`,
          category_snapshot: "modelace", length_key: args.p_length_key, add_ons_snapshot: [],
          customer_name: args.p_customer_name, customer_phone: args.p_customer_phone,
          customer_instagram: args.p_customer_instagram, customer_notes: args.p_customer_notes,
        }],
        error: null,
      }),
      create_staff_booking: async () => ({ data: [{ id: "staff-booking-1" }], error: null }),
    },
    upload: async () => ({ error: null }),
  };

  const query = (table) => {
    const q = {
      _update: null,
      select() { return q; },
      eq(col, val) { if (q._update) q._update.filters[col] = val; return q; },
      order() { return q; },
      maybeSingle() { return q; },
      update(values) { q._update = { table, values, filters: {} }; calls.update.push(q._update); return q; },
      then(resolve, reject) {
        const data = q._update ? null : (CATALOG[table] ?? []);
        return Promise.resolve({ data, error: null }).then(resolve, reject);
      },
    };
    return q;
  };

  const client = {
    calls,
    handlers,
    from: (table) => query(table),
    rpc(name, args) {
      calls.rpc.push({ name, args });
      const h = handlers.rpc[name];
      return Promise.resolve(h ? h(args) : { data: null, error: new Error(`unexpected rpc ${name}`) });
    },
    storage: {
      from(bucket) {
        return {
          upload: async (filePath, blob, opts) => {
            calls.upload.push({ bucket, path: filePath, blob, opts });
            return handlers.upload(filePath, blob, opts);
          },
        };
      },
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error("not used in tests") }),
    },
  };
  return client;
}

async function waitUntil(predicate, timeoutMs = 3000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) throw new Error("waitUntil timed out");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

export class App {
  constructor(dom, supabase) {
    this.dom = dom;
    this.w = dom.window;
    this.doc = dom.window.document;
    this.supabase = supabase;
    this.ctx = dom.getInternalVMContext();
  }
  // Runs code as a classic global script, exactly like a browser <script>: top-level
  // let/const from supabase-client.js and app.js stay visible to later code.
  eval(code) { return vm.runInContext(code, this.ctx); }
  run(code, filename) { return new vm.Script(code, { filename }).runInContext(this.ctx); }
  $(selector) { return this.doc.querySelector(selector); }
  // Let pending promise chains (RPC/upload mocks, render callbacks) settle.
  async flush(times = 5) {
    for (let i = 0; i < times; i++) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  toast() { return this.$("#toast")?.textContent ?? ""; }
  // Adds a temporary element carrying a data-action and clicks it, exercising the
  // real delegated click handler. Used to prove guards hold even when the visible
  // button is disabled (a stale or direct activation).
  staleAction(action, extra = {}) {
    const el = this.doc.createElement("button");
    el.dataset.action = action;
    for (const [k, v] of Object.entries(extra)) el.dataset[k] = v;
    this.doc.body.appendChild(el);
    el.click();
    el.remove();
  }
  close() { this.w.close(); }
}

export async function loadApp({ language = "cs", supabase = createFakeSupabase() } = {}) {
  // Scripts are NOT executed by jsdom ("outside-only"); we evaluate the real
  // source files ourselves, in the same order index.html loads them.
  const dom = new JSDOM(read("index.html"), {
    url: "http://localhost/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  w.localStorage.setItem("n2d-salon-language", language);
  w.fetch = globalThis.fetch; // needed by uploadReferencePhoto() for data: URLs
  w.supabase = { createClient: () => supabase };
  const app = new App(dom, supabase);
  app.run(read("supabase-client.js"), "supabase-client.js");
  app.run(read("app.js"), "app.js");
  await waitUntil(() => app.eval("remoteCatalog.status") === "ready");
  await app.flush();
  return app;
}

export const TINY_JPEG = "data:image/jpeg;base64,/9j/AAAA";
