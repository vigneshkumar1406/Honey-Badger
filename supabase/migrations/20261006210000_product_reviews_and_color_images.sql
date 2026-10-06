-- Product reviews/ratings and per-colour product photography.
create table if not exists public.product_reviews (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  reviewer_name text,
  status text not null default 'published' check (status in ('published','pending','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, user_id)
);

alter table public.products add column if not exists color_images jsonb not null default '{}'::jsonb;
create index if not exists product_reviews_product_idx on public.product_reviews(product_id, created_at desc);
alter table public.product_reviews enable row level security;

drop policy if exists "Public can read published product reviews" on public.product_reviews;
create policy "Public can read published product reviews" on public.product_reviews for select using (status = 'published' or auth.uid() = user_id);

drop policy if exists "Users can create own product reviews" on public.product_reviews;
create policy "Users can create own product reviews" on public.product_reviews for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can edit own product reviews" on public.product_reviews;
create policy "Users can edit own product reviews" on public.product_reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own product reviews" on public.product_reviews;
create policy "Users can delete own product reviews" on public.product_reviews for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Admins can manage product reviews" on public.product_reviews;
create policy "Admins can manage product reviews" on public.product_reviews for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create or replace function public.refresh_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid text;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p
  set rating = coalesce((select round(avg(r.rating)::numeric,2) from public.product_reviews r where r.product_id=pid and r.status='published'),0),
      review_count = (select count(*) from public.product_reviews r where r.product_id=pid and r.status='published'),
      updated_at = now()
  where p.id=pid;
  return coalesce(new,old);
end; $$;

drop trigger if exists product_reviews_refresh_rating on public.product_reviews;
create trigger product_reviews_refresh_rating after insert or update or delete on public.product_reviews for each row execute function public.refresh_product_rating();
