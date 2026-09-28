-- Honey Badger app layer for the already-prepared Supabase commerce schema.
-- This migration documents the RPCs and RLS additions used by the original Next.js frontend.
-- It assumes the core Honey Badger commerce tables already exist.

-- Public pricing / guest checkout / phone-protected tracking are intentionally SECURITY DEFINER.
-- They validate all price/stock values server-side before returning or mutating data.
-- Paid-order finalization is intentionally service_role-only; the Next.js server verifies Razorpay first.

-- See the deployed project's SQL history for the exact iterative schema setup.
