-- Customers may submit/delete their own review, but only admins may change moderation status.
drop policy if exists "Users can edit own product reviews" on public.product_reviews;
