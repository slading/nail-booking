// Local tests for the P1 reference-photo guard, run on PostgreSQL 18 via PGlite.
// Nothing here connects to Supabase or to production. The migration is applied
// to an in-memory database only.
//
// IMPORTANT: section 2 uses a TEST DOUBLE (schema "test_double") to prove the
// ORDERING contract at the integration point. It is not the production
// create_customer_booking() and must not be treated as a copy of it.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = readFileSync(path.join(HERE, "..", "20261010120000_p1_require_reference_photo_for_combo.sql"), "utf8");
const READONLY = readFileSync(path.join(HERE, "..", "production-readonly-checks.sql"), "utf8");

let db;
before(async () => {
  db = await PGlite.create();
  // Supabase always provides these roles; plain PostgreSQL does not. Create them so
  // the migration's REVOKE runs exactly as it would on the real project.
  await db.exec("create role anon nologin; create role authenticated nologin;");
});
after(async () => { await db.close(); });

async function expectRejection(promise, { code, message }) {
  await assert.rejects(promise, (err) => {
    assert.equal(err.code, code, `expected SQLSTATE/errcode ${code}, got ${err.code}: ${err.message}`);
    if (message) assert.match(err.message, message);
    return true;
  });
}

// --------------------------------------------------------------- 0. apply ---
test("0: migration applies cleanly and is idempotent (re-runnable)", async () => {
  await db.exec(MIGRATION);
  await db.exec(MIGRATION); // create or replace + revoke must be safe to repeat
  const { rows } = await db.query(
    "select proname from pg_proc where proname = 'assert_reference_photo_for_combo'");
  assert.equal(rows.length, 1);
});

// ------------------------------------------- 1. helper rule (unit level) -----
const reject = (cat, mode, path) => expectRejection(
  db.query("select public.assert_reference_photo_for_combo($1, $2, $3)", [cat, mode, path]),
  { code: "N2D12", message: /Reference photo is required/ });
const accept = (cat, mode, path) => db.query(
  "select public.assert_reference_photo_for_combo($1, $2, $3)", [cat, mode, path]);

test("1: Modelace + combo + NULL photo path -> rejected with N2D12 (case 1)", async () => {
  await reject("modelace", "combo", null);
});

test("2: Modelace + combo + empty or whitespace photo path -> rejected with N2D12 (case 2)", async () => {
  await reject("modelace", "combo", "");
  await reject("modelace", "combo", "   ");
  await reject("modelace", "combo", "\t\n");
});

test("3: Modelace + combo + non-empty path passes the guard (existence is checked by the existing Storage check; case 3 is covered in section 2)", async () => {
  await accept("modelace", "combo", "pending/3f2b8c1e-0000-4000-8000-000000000000/photo.jpg");
});

test("4: Modelace + combo + valid-looking path passes the guard (case 4, guard level)", async () => {
  await accept("modelace", "combo", "pending/3f2b8c1e-0000-4000-8000-000000000000/photo.png");
});

test("5: other combinations are unchanged: none/design/NULL/invalid modes, and non-Modelace (case 5)", async () => {
  for (const mode of ["none", "design", null, "hack", ""]) {
    await accept("modelace", mode, null);
  }
  await accept("manikura", null, null);
  await accept("manikura", "combo", null); // combo outside Modelace is not this rule's concern
  await accept(null, "combo", null);
});

test("5b: the helper is not executable by client roles (anon/authenticated)", async () => {
  // PGlite supports SET ROLE, so this asserts the revoke for real (no skip path).
  for (const role of ["authenticated", "anon"]) {
    await db.exec(`set role ${role}`);
    try {
      await expectRejection(
        db.query("select public.assert_reference_photo_for_combo('modelace','combo',null)"),
        { code: "42501" });
    } finally {
      await db.exec("reset role");
    }
  }
});

// -------------------------- 2. integration ordering (TEST DOUBLE, not prod) ---
// Models only the ORDER of checks inside create_customer_booking:
// design/category validation -> P1 guard -> existing Storage check -> insert.
test("2-setup: create test double of the integration point (NOT production code)", async () => {
  await db.exec(`
    create schema test_double;
    create table test_double.storage_objects (bucket_id text, name text);
    create table test_double.appointments (
      id serial primary key, service_category text, design_mode text, reference_photo_path text);
    -- stand-in for the EXISTING storage check (its real code is unknown here):
    create or replace function test_double.create_booking(
      p_service_category text, p_design_mode text, p_reference_photo_path text)
    returns int language plpgsql as $$
    declare v_id int;
    begin
      -- (validation, duration and slot checks of the real function would run here)
      perform public.assert_reference_photo_for_combo(p_service_category, p_design_mode, p_reference_photo_path);
      if p_reference_photo_path is not null and not exists (
           select 1 from test_double.storage_objects
           where bucket_id = 'reference-photos' and name = p_reference_photo_path) then
        raise exception 'photo not found' using errcode = 'P0002';
      end if;
      -- (advisory lock and slot re-check of the real function would run here)
      insert into test_double.appointments (service_category, design_mode, reference_photo_path)
      values (p_service_category, p_design_mode, p_reference_photo_path)
      returning id into v_id;
      return v_id;
    end $$;
    insert into test_double.storage_objects values
      ('reference-photos', 'pending/aaaa/photo.jpg');
  `);
});

const rowCount = async () => Number((await db.query("select count(*)::int as n from test_double.appointments")).rows[0].n);

test("2a: combo + NULL photo -> N2D12, no appointment inserted (case 1, ordering)", async () => {
  const before = await rowCount();
  await expectRejection(
    db.query("select test_double.create_booking('modelace','combo',null)"), { code: "N2D12" });
  assert.equal(await rowCount(), before);
});

test("2b: combo + empty path -> N2D12 (not the storage error), no insert (case 2, ordering)", async () => {
  const before = await rowCount();
  await expectRejection(
    db.query("select test_double.create_booking('modelace','combo','')"), { code: "N2D12" });
  assert.equal(await rowCount(), before);
});

test("2c: combo + nonexistent photo -> rejected by the existing storage check, no insert (case 3)", async () => {
  const before = await rowCount();
  await expectRejection(
    db.query("select test_double.create_booking('modelace','combo','pending/missing/photo.jpg')"),
    { code: "P0002" });
  assert.equal(await rowCount(), before);
});

test("2d: combo + valid existing photo -> accepted and inserted (case 4)", async () => {
  const before = await rowCount();
  const { rows } = await db.query(
    "select test_double.create_booking('modelace','combo','pending/aaaa/photo.jpg') as id");
  assert.ok(rows[0].id);
  assert.equal(await rowCount(), before + 1);
});

test("2e: other modes without a photo -> accepted, unchanged (case 5)", async () => {
  const before = await rowCount();
  await db.query("select test_double.create_booking('modelace','none',null)");
  await db.query("select test_double.create_booking('modelace','design',null)");
  assert.equal(await rowCount(), before + 2);
});

// ------------------------------------------------ 3. read-only query syntax ---
test("3: production-readonly-checks.sql query 2 (error-code usage) is valid SQL and reports N2D12 only after the helper exists", async () => {
  // Extract query 2 from the checks file, so the test exercises the file itself.
  const m = READONLY.match(/-- 2\. [\s\S]*?(select distinct[\s\S]*?order by 1, 2;)/);
  assert.ok(m, "query 2 not found in production-readonly-checks.sql");
  await db.exec(`create or replace function test_double.legacy_probe() returns void language plpgsql as $$
    begin raise exception 'x' using errcode = 'N2D08'; end $$;`);
  // Re-create with a body that mentions N2D08 in source text (pg_get_functiondef
  // returns the body text, so the regex sees it).
  const { rows } = await db.query(m[1].replace("n.nspname in ('public', 'storage')", "n.nspname in ('public', 'storage', 'test_double')"));
  const codes = rows.map((r) => r.error_code);
  assert.ok(codes.includes("N2D08"), `expected N2D08 in ${JSON.stringify(codes)}`);
  assert.ok(codes.includes("N2D12"), "helper should now report N2D12 (run query 2 BEFORE applying the migration in production)");
});

// ------------------------------------------- 4. read-only checks file runs -----
test("4: all six statements in production-readonly-checks.sql parse and run (against a minimal stub schema)", async () => {
  // Stub objects so the Supabase-only references resolve. This checks SYNTAX and
  // result shape only; it says nothing about the real production contents.
  await db.exec(`
    create schema if not exists storage;
    create table if not exists storage.buckets (id text primary key, public boolean);
    insert into storage.buckets values ('reference-photos', false) on conflict do nothing;
    create table if not exists public.services (id text primary key, category text);
    insert into public.services values ('orli-modelace-0', 'modelace') on conflict do nothing;
    create or replace function public.create_customer_booking(p_salon_id text) returns void
      language plpgsql security definer as $$ begin raise exception 'N2D08'; end $$;
  `);
  const results = await db.exec(READONLY);
  assert.equal(results.length, 6, `expected 6 result sets, got ${results.length}`);
});
