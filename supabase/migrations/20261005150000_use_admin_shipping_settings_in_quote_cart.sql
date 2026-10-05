-- Keep checkout pricing synchronized with Admin > Store settings.
-- Shipping, COD and free-shipping threshold are read from the singleton admin_settings row.

create or replace function public.quote_cart(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  item jsonb;
  v record;
  qty int;
  subtotal numeric := 0;
  discount numeric := 0;
  shipping numeric := 0;
  shipping_rate numeric := 79;
  cod numeric := 30;
  free_shipping_threshold numeric := 799;
  track_qty int := 0;
  after_discount numeric;
  track_prices numeric[] := array[]::numeric[];
  unit_price numeric;
  bundle3 int := 0;
  bundle5 int := 0;
  best3 int := 0;
  best5 int := 0;
  best_discount numeric := 0;
  candidate_discount numeric;
  bundled_units int;
  bundled_regular numeric;
  i int;
  offer_label text := null;
begin
  select
    coalesce(s.shipping_fee, 79),
    coalesce(s.cod_fee, 30),
    coalesce(s.free_shipping_threshold, 799)
  into shipping_rate, cod, free_shipping_threshold
  from public.admin_settings s
  where s.id = 'singleton';

  for item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    qty := greatest(1, coalesce((item->>'quantity')::int, 1));
    select pv.*, pr.name, pr.slug, pr.price as product_price
      into v
      from public.product_variants pv
      join public.products pr on pr.id = pv.product_id
     where pv.is_active = true
       and (pv.id = (item->>'variantId') or
            (pv.product_id = (item->>'productId') and pv.color = (item->>'color') and pv.size = (item->>'size')))
     limit 1;
    if not found then raise exception 'Variant not found'; end if;
    if v.stock < qty then raise exception 'Insufficient stock for %', v.name; end if;
    unit_price := coalesce(v.price_override, v.product_price);
    subtotal := subtotal + qty * unit_price;
    if v.slug ilike '%track-pants%' then
      track_qty := track_qty + qty;
      for i in 1..qty loop track_prices := array_append(track_prices, unit_price); end loop;
    end if;
  end loop;

  if track_qty >= 3 then
    select array_agg(x order by x desc) into track_prices from unnest(track_prices) as u(x);
    for bundle5 in 0..floor(track_qty / 5)::int loop
      for bundle3 in 0..floor((track_qty - bundle5 * 5) / 3)::int loop
        bundled_units := bundle5 * 5 + bundle3 * 3;
        bundled_regular := 0;
        if bundled_units > 0 then
          for i in 1..bundled_units loop bundled_regular := bundled_regular + track_prices[i]; end loop;
        end if;
        candidate_discount := greatest(0, bundled_regular - (bundle5 * 1499) - (bundle3 * 999));
        if candidate_discount > best_discount then
          best_discount := candidate_discount; best5 := bundle5; best3 := bundle3;
        end if;
      end loop;
    end loop;
    discount := best_discount;
    if best5 > 0 and best3 > 0 then
      offer_label := format('%s × ₹1499 + %s × ₹999', best5, best3);
    elsif best5 > 0 then
      offer_label := format('%s × ₹1499 combo', best5);
    elsif best3 > 0 then
      offer_label := format('%s × ₹999 combo', best3);
    end if;
  end if;

  after_discount := greatest(0, subtotal - discount);
  if after_discount < free_shipping_threshold then shipping := shipping_rate; else shipping := 0; end if;

  return jsonb_build_object(
    'subtotal', subtotal, 'discount', discount, 'afterDiscount', after_discount,
    'shippingFee', shipping, 'codFee', cod,
    'totalOnline', after_discount + shipping, 'totalCod', after_discount + shipping + cod,
    'offer', offer_label, 'appliedOffer', offer_label
  );
end
$function$;