-- =============================================================================
-- READ-ONLY CHECKS to run in the Supabase SQL Editor BEFORE applying the P1
-- migration. None of these statements writes data or changes schema.
-- Paste the results back so the integration point can be finalised.
-- =============================================================================

-- 1. Live definition of create_customer_booking (needed to place the one-line
--    integration call correctly). Returns the full source text.
select p.oid::regprocedure as signature,
       p.prosecdef          as security_definer,
       pg_get_userbyid(p.proowner) as owner,
       pg_get_functiondef(p.oid)   as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'create_customer_booking';

-- 2. Every N2D error code already used by a function in public or storage.
--    N2D12 must NOT appear in this list before the migration is applied.
select distinct m[1] as error_code, p.proname as used_by
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace,
     lateral regexp_matches(pg_get_functiondef(p.oid), '(N2D[0-9]{2})', 'g') as m
where n.nspname in ('public', 'storage')
order by 1, 2;

-- 3. Name collision check for the new helper. Expect zero rows.
select p.oid::regprocedure as existing_signature
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'assert_reference_photo_for_combo';

-- 4. Who can execute create_customer_booking today (context for the revoke).
select grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public' and routine_name = 'create_customer_booking';

-- 5. Confirm the stored service category spelling the function compares against
--    ('modelace' is what the frontend expects). Adjust table name if needed.
select distinct category
from public.services;

-- 6. Confirm the reference-photo bucket and object naming the existing Storage
--    check uses. The frontend uploads to bucket 'reference-photos' with names
--    like 'pending/<uuid>/photo.jpg'. Expect the same bucket/name pattern.
select id, public from storage.buckets where id = 'reference-photos';
