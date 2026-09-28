# Honey Badger Outfits — production Next.js storefront

This ZIP is the original Honey Badger Outfits frontend. The visual direction and App Router structure are preserved; the commerce layer is now wired to the prepared Supabase backend instead of the old JSON/in-memory stand-ins.

## Live architecture

- **Frontend:** Next.js 14 App Router + React 18 + Tailwind.
- **Database:** Supabase Postgres.
- **Auth:** Supabase Auth using secure server cookies and a refresh middleware.
- **Catalogue:** products, categories, images and colour × size stock are read live from Supabase.
- **Cart:** local browser cart only; product prices and stock are never trusted from the browser.
- **Checkout:** server-side Supabase RPC recalculates price, offers, shipping and stock. COD creates a real order atomically and decrements variant stock.
- **Online payment:** Razorpay integration is production-ready and remains disabled until the three Razorpay environment secrets are supplied.
- **Orders:** Supabase orders, order items and status history.
- **Tracking:** public order lookup requires both order number and checkout phone number.
- **Returns:** authenticated damaged-product request flow with private evidence storage.
- **Admin:** Supabase profile role protects dashboard, orders, product CRUD, image uploads, inventory and store settings.

## Required environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://aesqjkzzebjbrcudfbtk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_dfC_JwdJ_PacokBMOFNKgQ_QQF9_Dy-
SUPABASE_SECRET_KEY=sb_secret_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Never put a Supabase secret/service-role key or Razorpay secret in a `NEXT_PUBLIC_*` variable.

## Supabase project

The prepared project is `wamggzkanpcuqnmyyvud`.

The database contains the Honey Badger commerce schema, seeded categories/products/variants, storage buckets, RLS and the commerce RPCs used by this frontend.

### Admin account

Create a Supabase Auth account using the store support email configured in `admin_settings`:

`honeybadgeroutfits@gmail.com`

The database trigger assigns that profile the `admin` role. Other registrations are customers.

If the Auth project requires email confirmation, confirm the email before logging in.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Customer test checklist

1. Open `/shop` and confirm products come from Supabase.
2. Open a product and select colour + size.
3. Add to cart.
4. Open checkout and confirm server pricing.
5. Place a COD order.
6. Confirm the order success page shows the real order number.
7. Open `/track`, enter order number + checkout phone.
8. Log in and confirm `/account` shows authenticated orders.
9. Submit a damaged-product request from `/returns` after a delivered account order.

## Admin test checklist

1. Log in with the configured admin email.
2. Open `/admin`.
3. Open `/admin/products?new=1`.
4. Create a product, colour rows and stock matrix.
5. Upload product images to the `product-images` Supabase bucket.
6. Publish the product and confirm it appears in `/shop`.
7. Edit price, status and stock.
8. Open `/admin/orders` and advance a real order.
9. Save courier + tracking number.
10. Open the customer tracking page and confirm the shipment data appears.
11. Open `/admin/settings` and verify storefront settings.

## Razorpay

When these are supplied in Vercel (the Supabase secret key is also required because the paid-order finalization RPC is intentionally not callable by public clients):

```env
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

The checkout route creates a Razorpay order server-side. The browser opens Razorpay Checkout, and `/api/razorpay/verify` verifies the HMAC signature before the Supabase paid-order RPC creates the order and decrements stock.

Configure the Razorpay webhook to:

`https://YOUR-DOMAIN/api/razorpay/webhook`

Do not mark a payment as successful from the browser alone.

## Production deployment

Deploy this folder to Vercel and add the same environment variables to the Production environment. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.

Before launch, perform the customer/admin checklist above with a real test order and a Razorpay test-mode transaction if online payments are enabled.

## Legacy files

`prisma/schema.prisma` and `data/orders.json` are retained only as historical references from the original ZIP. The application does not use them for catalogue or order persistence anymore.
