-- ============================================================================
-- Nayantara Rental Platform — Initial Schema
-- Migration: 0001_initial_schema.sql
--
-- Contains:
--   * Enums (product status, media type, booking status, payment status/method, admin role)
--   * Tables: admins, categories, products, product_media, customers,
--             bookings, booking_items (with payment-ready fields)
--   * Foreign keys, indexes and constraints
--   * updated_at trigger
--   * get_available_quantity()  -> authoritative server-side availability
--   * create_booking()          -> atomic, overbooking-safe booking creation
--   * track_booking()           -> customer booking lookup (ref + phone)
--   * Row Level Security policies
-- ============================================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

create type product_status as enum ('active', 'inactive');

create type media_type as enum ('image');

create type booking_status as enum (
    'pending',
    'approved',
    'rejected',
    'delivered',
    'returned',
    'cancelled'
);

create type payment_status as enum (
    'pending',
    'completed',
    'failed',
    'refunded'
);

create type payment_method as enum (
    'razorpay',
    'cashfree',
    'stripe',
    'cash',
    'bank_transfer'
);

create type admin_role as enum ('super_admin', 'admin');

-- ============================================================================
-- 2. SHARED updated_at TRIGGER
-- ============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- --- admins -----------------------------------------------------------------
-- Linked 1:1 with Supabase auth.users via the shared id.
create table admins (
    id            uuid primary key default gen_random_uuid(),
    email         text        not null unique,
    full_name     text        not null,
    role          admin_role  not null default 'admin',
    is_active     boolean     not null default true,
    last_login_at timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

-- --- categories -------------------------------------------------------------
create table categories (
    id          uuid primary key default gen_random_uuid(),
    name        text        not null,
    slug        text        not null unique,
    description text,
    image_url   text,
    is_active   boolean     not null default true,
    sort_order  integer     not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- --- products ---------------------------------------------------------------
create table products (
    id                   uuid primary key default gen_random_uuid(),
    category_id          uuid           not null references categories (id) on delete restrict,
    name                 text           not null,
    slug                 text           not null unique,
    description          text,
    -- Flexible key/value specifications (e.g. {"Resolution": "4K", "Weight": "1.2kg"})
    specifications       jsonb,
    rental_price_per_day numeric(10, 2) not null check (rental_price_per_day >= 0),
    total_quantity       integer        not null default 0 check (total_quantity >= 0),
    status               product_status not null default 'active',
    -- External video URL only (no direct upload, per spec)
    video_url            text,
    is_featured          boolean        not null default false,
    sort_order           integer        not null default 0,
    created_at           timestamptz    not null default now(),
    updated_at           timestamptz    not null default now()
);

-- --- product_media ----------------------------------------------------------
create table product_media (
    id         uuid primary key default gen_random_uuid(),
    product_id uuid        not null references products (id) on delete cascade,
    media_url  text        not null,
    media_type media_type  not null default 'image',
    sort_order integer     not null default 0,
    alt_text   text,
    created_at timestamptz not null default now()
);

-- --- customers --------------------------------------------------------------
-- No customer login in Phase 1; identified by phone for tracking/repeat orders.
create table customers (
    id         uuid primary key default gen_random_uuid(),
    full_name  text        not null,
    phone      text        not null,
    email      text,
    address    text        not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- --- bookings ---------------------------------------------------------------
create table bookings (
    id             uuid primary key default gen_random_uuid(),
    booking_ref    text           not null unique,
    customer_id    uuid           not null references customers (id) on delete restrict,
    status         booking_status not null default 'pending',
    total_amount   numeric(12, 2) not null default 0 check (total_amount >= 0),
    notes          text,

    -- Payment-ready fields (Phase 1: not wired to a gateway, but schema-ready)
    payment_status payment_status not null default 'pending',
    payment_method payment_method,
    amount_paid    numeric(12, 2) not null default 0 check (amount_paid >= 0),

    created_at     timestamptz    not null default now(),
    updated_at     timestamptz    not null default now()
);

-- --- booking_items ----------------------------------------------------------
create table booking_items (
    id            uuid primary key default gen_random_uuid(),
    booking_id    uuid           not null references bookings (id) on delete cascade,
    product_id    uuid           not null references products (id) on delete restrict,
    start_date    date           not null,
    end_date      date           not null,
    quantity      integer        not null check (quantity > 0),
    price_per_day numeric(10, 2) not null check (price_per_day >= 0),
    total_days    integer        not null check (total_days > 0),
    subtotal      numeric(12, 2) not null check (subtotal >= 0),
    created_at    timestamptz    not null default now(),

    -- Reject invalid ranges at the database boundary
    constraint booking_items_valid_range check (end_date >= start_date)
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

create index idx_products_category       on products (category_id);
create index idx_products_status         on products (status);
create index idx_products_is_featured    on products (is_featured) where is_featured = true;

create index idx_product_media_product   on product_media (product_id);

create index idx_customers_phone         on customers (phone);

create index idx_bookings_customer       on bookings (customer_id);
create index idx_bookings_status         on bookings (status);
create index idx_bookings_created_at     on bookings (created_at desc);

create index idx_booking_items_booking   on booking_items (booking_id);
create index idx_booking_items_product   on booking_items (product_id);
-- Composite index powering the availability/overlap query
create index idx_booking_items_avail     on booking_items (product_id, start_date, end_date);

-- ============================================================================
-- 5. updated_at TRIGGERS
-- ============================================================================

create trigger trg_admins_updated_at
    before update on admins
    for each row execute function set_updated_at();

create trigger trg_categories_updated_at
    before update on categories
    for each row execute function set_updated_at();

create trigger trg_products_updated_at
    before update on products
    for each row execute function set_updated_at();

create trigger trg_customers_updated_at
    before update on customers
    for each row execute function set_updated_at();

create trigger trg_bookings_updated_at
    before update on bookings
    for each row execute function set_updated_at();

-- ============================================================================
-- 6. get_available_quantity()
--
-- Authoritative, server-side availability calculation. Computes the PEAK
-- reserved quantity on any single day within the requested range, then returns
-- the remaining quantity (total - peak), clamped at 0.
--
-- Only bookings in inventory-reserving states (pending / approved / delivered)
-- count against availability. Cancelled / rejected / returned do NOT reserve.
--
-- Worked example (spec):
--   Product total = 10
--   Booking A: 1 Jul – 5 Jul, qty 4
--   Booking B: 2 Jul – 4 Jul, qty 3
--   Peak overlap day (2–4 Jul) = 4 + 3 = 7  ->  available = 10 - 7 = 3
--
-- SECURITY DEFINER: must read ALL booking_items regardless of caller RLS so the
-- number is correct and can never be influenced by the client.
-- ============================================================================

create or replace function get_available_quantity(
    p_product_id uuid,
    p_start_date date,
    p_end_date   date
)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v_total_quantity integer;
    v_max_booked     integer;
begin
    if p_start_date is null or p_end_date is null then
        raise exception 'INVALID_DATE_RANGE: start and end dates are required';
    end if;
    if p_end_date < p_start_date then
        raise exception 'INVALID_DATE_RANGE: end date must be on or after start date';
    end if;

    select total_quantity
      into v_total_quantity
      from products
     where id = p_product_id;

    -- Unknown product -> nothing available
    if v_total_quantity is null then
        return 0;
    end if;

    -- Reserving booking_items that overlap the requested window.
    with reserving_items as (
        select bi.start_date, bi.end_date, bi.quantity
          from booking_items bi
          join bookings b on b.id = bi.booking_id
         where bi.product_id = p_product_id
           and b.status in ('pending', 'approved', 'delivered')
           and bi.start_date <= p_end_date
           and bi.end_date   >= p_start_date
    ),
    -- Candidate days where the reserved load can change within the window:
    -- the requested start plus every overlapping item's start that falls inside it.
    candidate_days as (
        select p_start_date as day
        union
        select ri.start_date
          from reserving_items ri
         where ri.start_date between p_start_date and p_end_date
    ),
    -- Total reserved quantity active on each candidate day.
    daily_load as (
        select cd.day,
               coalesce(sum(ri.quantity), 0) as booked
          from candidate_days cd
          left join reserving_items ri
                 on cd.day between ri.start_date and ri.end_date
         group by cd.day
    )
    select coalesce(max(booked), 0)
      into v_max_booked
      from daily_load;

    return greatest(v_total_quantity - v_max_booked, 0);
end;
$$;

-- ============================================================================
-- 7. create_booking()
--
-- Atomic, overbooking-safe creation of customer + booking + booking_item.
-- Locks the product row (FOR UPDATE) so concurrent requests for the same
-- product are serialized, then RE-CHECKS availability inside the transaction
-- before inserting. New bookings always start in status 'pending'.
--
-- Returns the new booking id.
-- ============================================================================

create or replace function create_booking(
    p_full_name  text,
    p_phone      text,
    p_email      text,
    p_address    text,
    p_booking_ref text,
    p_product_id uuid,
    p_start_date date,
    p_end_date   date,
    p_quantity   integer,
    p_notes      text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_customer_id uuid;
    v_booking_id  uuid;
    v_price       numeric(10, 2);
    v_status      product_status;
    v_total_days  integer;
    v_subtotal    numeric(12, 2);
    v_available   integer;
begin
    if p_quantity is null or p_quantity <= 0 then
        raise exception 'INVALID_QUANTITY: quantity must be greater than zero';
    end if;
    if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
        raise exception 'INVALID_DATE_RANGE: end date must be on or after start date';
    end if;

    -- Serialize concurrent bookings for the same product.
    select rental_price_per_day, status
      into v_price, v_status
      from products
     where id = p_product_id
       for update;

    if not found then
        raise exception 'PRODUCT_NOT_FOUND: product does not exist';
    end if;
    if v_status <> 'active' then
        raise exception 'PRODUCT_INACTIVE: product is not available for booking';
    end if;

    -- Authoritative re-check inside the locked transaction (prevents overbooking).
    v_available := get_available_quantity(p_product_id, p_start_date, p_end_date);
    if v_available < p_quantity then
        raise exception
            'INSUFFICIENT_AVAILABILITY: only % unit(s) available for the selected dates',
            v_available;
    end if;

    -- Inclusive day count (1 Jul -> 1 Jul = 1 day).
    v_total_days := (p_end_date - p_start_date) + 1;
    v_subtotal   := v_price * p_quantity * v_total_days;

    insert into customers (full_name, phone, email, address)
    values (p_full_name, p_phone, nullif(p_email, ''), p_address)
    returning id into v_customer_id;

    insert into bookings (
        booking_ref, customer_id, status, total_amount, notes,
        payment_status, amount_paid
    )
    values (
        p_booking_ref, v_customer_id, 'pending', v_subtotal, p_notes,
        'pending', 0
    )
    returning id into v_booking_id;

    insert into booking_items (
        booking_id, product_id, start_date, end_date, quantity,
        price_per_day, total_days, subtotal
    )
    values (
        v_booking_id, p_product_id, p_start_date, p_end_date, p_quantity,
        v_price, v_total_days, v_subtotal
    );

    return v_booking_id;
end;
$$;

-- ============================================================================
-- 8. track_booking()
--
-- Customer-facing lookup by booking reference + phone (no login required).
-- SECURITY DEFINER so an anonymous customer can read ONLY their own booking
-- without broad read access to the bookings/customers tables.
-- ============================================================================

create or replace function track_booking(
    p_booking_ref text,
    p_phone       text
)
returns table (
    booking_id   uuid,
    booking_ref  text,
    status       booking_status,
    total_amount numeric,
    created_at   timestamptz,
    product_name text,
    quantity     integer,
    start_date   date,
    end_date     date
)
language sql
stable
security definer
set search_path = public
as $$
    select b.id,
           b.booking_ref,
           b.status,
           b.total_amount,
           b.created_at,
           p.name,
           bi.quantity,
           bi.start_date,
           bi.end_date
      from bookings b
      join customers c     on c.id = b.customer_id
      join booking_items bi on bi.booking_id = b.id
      join products p      on p.id = bi.product_id
     where b.booking_ref = p_booking_ref
       and c.phone = p_phone;
$$;

-- ============================================================================
-- 9. ROW LEVEL SECURITY
--
-- Anonymous (customer site): read active catalog only; all writes go through
-- SECURITY DEFINER functions above. Authenticated (admin): full access.
-- ============================================================================

alter table admins        enable row level security;
alter table categories    enable row level security;
alter table products      enable row level security;
alter table product_media enable row level security;
alter table customers     enable row level security;
alter table bookings      enable row level security;
alter table booking_items enable row level security;

-- Public catalog reads -------------------------------------------------------
create policy "categories_public_read"
    on categories for select
    to anon
    using (is_active = true);

create policy "products_public_read"
    on products for select
    to anon
    using (status = 'active');

create policy "product_media_public_read"
    on product_media for select
    to anon
    using (
        exists (
            select 1 from products p
             where p.id = product_media.product_id
               and p.status = 'active'
        )
    );

-- Admin (authenticated) full access -----------------------------------------
create policy "categories_admin_all"    on categories    for all to authenticated using (true) with check (true);
create policy "products_admin_all"       on products       for all to authenticated using (true) with check (true);
create policy "product_media_admin_all"  on product_media  for all to authenticated using (true) with check (true);
create policy "customers_admin_all"      on customers      for all to authenticated using (true) with check (true);
create policy "bookings_admin_all"       on bookings       for all to authenticated using (true) with check (true);
create policy "booking_items_admin_all"  on booking_items  for all to authenticated using (true) with check (true);
create policy "admins_self_read"         on admins         for select to authenticated using (true);

-- ============================================================================
-- 10. FUNCTION GRANTS
-- ============================================================================

grant execute on function get_available_quantity(uuid, date, date) to anon, authenticated;
grant execute on function create_booking(text, text, text, text, text, uuid, date, date, integer, text) to anon, authenticated;
grant execute on function track_booking(text, text) to anon, authenticated;
