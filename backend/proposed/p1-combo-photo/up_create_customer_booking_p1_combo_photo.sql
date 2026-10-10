-- Source: production definition of public.create_customer_booking as supplied from
-- Supabase SQL Editor (pg_get_functiondef). Statement terminator ';' added.
-- NOT APPLIED. Review before any execution.
CREATE OR REPLACE FUNCTION public.create_customer_booking(p_salon_id text, p_service_id text, p_date date, p_start_time time without time zone, p_length_key text, p_design_mode text, p_add_on_ids text[], p_customer_name text, p_customer_phone text, p_customer_instagram text, p_customer_notes text, p_reminder_requested boolean, p_reference_photo_path text)
 RETURNS appointments
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_service       public.services%rowtype;
  v_length_minutes integer;
  v_addon_minutes integer := 0;
  v_duration      integer;
  v_end_time      time;
  v_add_ons       jsonb := '[]'::jsonb;
  v_add_ons_total numeric(10,2) := 0;
  v_total_price   numeric(10,2);
  v_total_price_from boolean;
  v_result        public.appointments%rowtype;
begin
  -- Exact ports of isValidName / isValidPhone / isValidInstagram (app.js).
  -- app.js checks /\p{L}/u (any Unicode letter); Postgres's ARE regex engine
  -- has no \p{...} Unicode-property escape, so the locale-aware POSIX class
  -- [[:alpha:]] is used instead — verified equivalent for accented/Czech
  -- names (e.g. "Žofie", "Ánička") under the server's UTF8 locale.
  if p_customer_name is null or p_customer_name !~ '[[:alpha:]]' then
    raise exception 'invalid_name' using errcode = 'N2D01';
  end if;
  if p_customer_phone is null
     or p_customer_phone !~ '^[+0-9 ()-]+$'
     or length(regexp_replace(p_customer_phone, '[^0-9]', '', 'g')) not between 7 and 15 then
    raise exception 'invalid_phone' using errcode = 'N2D02';
  end if;
  -- Fix (20260101000011): Instagram is optional — a null or empty value is
  -- now valid and skips this check entirely. If a value IS provided, the
  -- format rule is completely unchanged from before this migration.
  if p_customer_instagram is not null and p_customer_instagram <> ''
     and regexp_replace(p_customer_instagram, '^@', '') !~ '^[A-Za-z0-9._]{1,30}$' then
    raise exception 'invalid_instagram' using errcode = 'N2D03';
  end if;

  select * into v_service from public.services
    where id = p_service_id and salon_id = p_salon_id and active;
  if not found then
    raise exception 'service_not_found' using errcode = 'N2D04';
  end if;

  if v_service.category = 'modelace' then
    select minutes into v_length_minutes from public.modelace_lengths where key = p_length_key;
    if v_length_minutes is null then
      raise exception 'length_required' using errcode = 'N2D05';
    end if;
    if p_design_mode not in ('none', 'design', 'combo') then
      raise exception 'design_mode_required' using errcode = 'N2D06';
    end if;

    if p_design_mode in ('design', 'combo') and p_add_on_ids is not null and array_length(p_add_on_ids, 1) > 0 then
      select
          coalesce(jsonb_agg(jsonb_build_object(
            'id', a.id, 'name', a.name, 'price', a.price_czk,
            'priceFrom', a.price_from, 'durationDelta', a.duration_delta_minutes
          )), '[]'::jsonb),
          coalesce(sum(a.duration_delta_minutes), 0),
          coalesce(sum(a.price_czk), 0)
        into v_add_ons, v_addon_minutes, v_add_ons_total
        from public.add_ons a
        where a.id = any(p_add_on_ids) and a.salon_id = p_salon_id and a.active;
    else
      v_add_ons := '[]'::jsonb;
      v_addon_minutes := 0;
      v_add_ons_total := 0;
    end if;

    -- design_mode='combo' ("Design + inspo") always contributes a flat +30
    -- minutes (20260101000010), independent of and in addition to any real
    -- add-on minutes above. Price is untouched.
    v_duration := v_length_minutes + v_addon_minutes
                  + case when p_design_mode = 'combo' then 30 else 0 end;
  else
    p_length_key := null;
    p_design_mode := null;
    v_add_ons := '[]'::jsonb;
    v_add_ons_total := 0;
    v_duration := v_service.duration_minutes;
  end if;

  v_end_time := (p_start_time + make_interval(mins => v_duration))::time;
  v_total_price := v_service.price_czk + v_add_ons_total;
  v_total_price_from := v_service.price_from or (jsonb_array_length(v_add_ons) > 0);

  -- P1: Design + inspiration requires a reference photo.
  if p_design_mode = 'combo'
     and nullif(
       regexp_replace(coalesce(p_reference_photo_path, ''), '\s', '', 'g'),
       ''
     ) is null then
    raise exception 'Reference photo is required for Design + inspiration'
      using errcode = 'N2D12';
  end if;

  if p_reference_photo_path is not null and not exists (
    select 1 from storage.objects where bucket_id = 'reference-photos' and name = p_reference_photo_path
  ) then
    raise exception 'reference_photo_not_found' using errcode = 'N2D07';
  end if;

  -- Serialize every booking attempt for this (salon, date) across ALL
  -- sessions/devices/browsers — this is the actual cross-device fix that a
  -- client-only Web Locks mutex could never provide. pg_advisory_xact_lock
  -- auto-releases at transaction end (commit or rollback), including on any
  -- error raised above or below.
  perform pg_advisory_xact_lock(hashtext(p_salon_id || '|' || p_date::text));

  if not public.is_slot_bookable(p_salon_id, p_date, p_start_time, v_duration, null) then
    raise exception 'slot_unavailable' using errcode = 'N2D08';
  end if;

  insert into public.appointments (
    salon_id, appointment_date, start_time, end_time, service_id,
    category_snapshot, service_name_snapshot, duration_minutes, length_key, design_mode,
    color, price_czk, price_from, price_label, add_ons_snapshot, add_ons_total_czk,
    total_price_czk, total_price_from, customer_name, customer_phone, customer_instagram,
    customer_notes, reference_photo_path, reminder_requested, source, status, created_by_staff
  ) values (
    p_salon_id, p_date, p_start_time, v_end_time, v_service.id,
    v_service.category, v_service.group_name || ' · ' || v_service.name, v_duration, p_length_key, p_design_mode,
    v_service.color, v_service.price_czk, v_service.price_from, v_service.price_label, v_add_ons, v_add_ons_total,
    v_total_price, v_total_price_from, p_customer_name, p_customer_phone, nullif(p_customer_instagram, ''),
    nullif(p_customer_notes, ''), p_reference_photo_path, coalesce(p_reminder_requested, false), 'client_booking', 'confirmed', null
  )
  returning * into v_result;

  return v_result;
end;
$function$
;
