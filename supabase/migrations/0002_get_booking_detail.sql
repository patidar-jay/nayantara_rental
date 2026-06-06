-- ============================================================================
-- Migration: 0002_get_booking_detail.sql
--
-- Adds a SECURITY DEFINER function to fetch a full booking detail by ID.
-- This allows the anon user to retrieve their booking immediately after
-- the create_booking() RPC returns the new booking ID, bypassing RLS
-- restrictions on the bookings/customers/booking_items tables.
-- ============================================================================

create or replace function get_booking_detail(p_booking_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v_result json;
begin
    select json_build_object(
        'id',             b.id,
        'booking_ref',    b.booking_ref,
        'customer_id',    b.customer_id,
        'status',         b.status,
        'total_amount',   b.total_amount,
        'notes',          b.notes,
        'payment_status', b.payment_status,
        'payment_method', b.payment_method,
        'amount_paid',    b.amount_paid,
        'created_at',     b.created_at,
        'updated_at',     b.updated_at,
        'customer', json_build_object(
            'id',        c.id,
            'full_name', c.full_name,
            'phone',     c.phone,
            'email',     c.email,
            'address',   c.address
        ),
        'items', coalesce((
            select json_agg(json_build_object(
                'id',            bi.id,
                'booking_id',    bi.booking_id,
                'product_id',    bi.product_id,
                'start_date',    bi.start_date,
                'end_date',      bi.end_date,
                'quantity',      bi.quantity,
                'price_per_day', bi.price_per_day,
                'total_days',    bi.total_days,
                'subtotal',      bi.subtotal,
                'created_at',    bi.created_at,
                'product', json_build_object(
                    'id',                   p.id,
                    'name',                 p.name,
                    'slug',                 p.slug,
                    'rental_price_per_day', p.rental_price_per_day
                )
            ))
            from booking_items bi
            join products p on p.id = bi.product_id
            where bi.booking_id = b.id
        ), '[]'::json)
    )
    into v_result
    from bookings b
    join customers c on c.id = b.customer_id
    where b.id = p_booking_id;

    return v_result;
end;
$$;

-- Grant to anon so customers can fetch their booking after creation
grant execute on function get_booking_detail(uuid) to anon, authenticated;
