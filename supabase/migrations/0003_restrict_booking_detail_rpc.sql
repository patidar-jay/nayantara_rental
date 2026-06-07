-- ============================================================================
-- Migration: Restrict get_booking_detail() to authenticated users only
-- 
-- ⚠️  IMPORTANT: Apply this migration ONLY after the admin authentication
-- system is deployed and working. The customer booking flow currently uses
-- get_booking_detail() after create_booking() to show the confirmation page.
--
-- After applying this migration, update SupabaseBookingRepository.createBooking()
-- to construct a minimal BookingDetail from the create_booking() input params
-- instead of calling get_booking_detail() for the confirmation page.
--
-- Security Impact:
-- - Before: Any user with a UUID can read any booking's full details + PII
-- - After: Only authenticated (admin) users can fetch booking details by ID
-- - Customers use track_booking() with phone verification for tracking
-- ============================================================================

-- Revoke from anon
REVOKE EXECUTE ON FUNCTION get_booking_detail(uuid) FROM anon;

-- Ensure authenticated can still use it
GRANT EXECUTE ON FUNCTION get_booking_detail(uuid) TO authenticated;
