# **Implementation Guide: Marketplace Multi-Vendor**

**Stack:** Next.js (App Router) + shadcn/ui + Supabase → deploy Vercel
**Basis:** Product Brief final (seluruh Open Questions sudah dikonfirmasi)
**Pembayaran:** Midtrans Sandbox (Snap)

> Panduan ini berurutan: kerjakan Fase 0 → 12. Tiap fase punya **Selesai jika** sebagai Definition of Done. Jangan lompat ke fase berikutnya sebelum DoD terpenuhi.

---

## **0\. Keputusan Teknis & Asumsi**

| Topik | Keputusan | Alasan |
| :---- | :---- | :---- |
| Bahasa | TypeScript | Tipe DB di-generate dari Supabase |
| Package manager | **npm** | Bawaan Node.js, tanpa instalasi tambahan |
| Supabase lokal (Docker) | **Tidak dipakai** | Stack Supabase lokal memakan banyak RAM; pakai project Supabase hosted |
| Region Supabase | **Singapore (ap-southeast-1)** | Dekat dengan user Indonesia. **Tidak bisa diubah setelah project dibuat** |
| Migrasi DB | Supabase CLI → `db push` ke project hosted | Versi SQL tersimpan di repo |
| Integrasi Midtrans | `fetch` langsung ke Snap API (tanpa SDK) | Lebih sedikit dependensi, tanpa masalah bundling |
| Expiry pesanan | **pg\_cron** di Postgres | Cron Vercel Hobby hanya bisa harian |
| Upload gambar/file | Langsung dari browser ke Supabase Storage | Request body function Vercel terbatas (~4,5 MB) |
| Mutasi kritis (checkout, status bayar, unduh, payout) | **Fungsi Postgres (RPC) atomik** | Mencegah race condition stok & double-download |
| Cek login di server | `supabase.auth.getClaims()` | Jangan percaya `getSession()` di kode server |
| Nama key Supabase | **Publishable** (`sb_publishable_…`) & **Secret** (`sb_secret_…`) | Menggantikan anon/service\_role lama |
| Komisi platform | Env `PLATFORM_COMMISSION_PERCENT` (0 atau 5), **di-snapshot per item** saat order dibuat | Perubahan komisi tidak mengubah order lama |

---

## **1\. Milestone & Estimasi (1 developer, jam kerja efektif)**

| Fase | Isi | Estimasi |
| :---- | :---- | :---- |
| 0–2 | Prasyarat, init proyek, setup third-party | 1–2 hari |
| 3 | Database, RLS, fungsi, storage | 2–3 hari |
| 4 | Fondasi app: client Supabase, proxy, auth (email + Google) | 2 hari |
| 5 | Katalog publik (Guest) | 3 hari |
| 6 | Member: cart, wishlist, akun | 2 hari |
| 7 | Checkout & Midtrans | 3 hari |
| 8 | Pesanan & unduhan digital | 2 hari |
| 9 | Vendor: onboarding, produk, pesanan, saldo | 4 hari |
| 10 | Review, komentar, laporan | 2 hari |
| 11 | Hardening & QA | 2–3 hari |
| 12 | Deploy Vercel + smoke test | 1 hari |
| **Total** | | **± 25–30 hari kerja** |

*Estimasi kasar; geser sesuai pengalaman dan ukuran tim.*

---

## **2\. Struktur Folder (Ringkas & Terstruktur)**

Target: **± 45 file kode buatan sendiri** (di luar komponen shadcn), tanpa folder per-komponen dan tanpa barrel `index.ts`.

```
marketplace/
├─ supabase/
│  ├─ migrations/
│  │  ├─ 0001_schema.sql            # enum, tabel, index, trigger
│  │  ├─ 0002_rls_storage.sql       # RLS policy + bucket storage
│  │  └─ 0003_functions_cron.sql    # RPC, view admin, pg_cron
│  └─ seed.sql                      # kategori 3 tingkat + brand
├─ src/
│  ├─ proxy.ts                      # refresh sesi + gerbang login (Next.js 16)
│  ├─ app/
│  │  ├─ layout.tsx · globals.css · not-found.tsx · error.tsx
│  │  ├─ (public)/                  # GUEST — layout: header + footer
│  │  │  ├─ page.tsx                # beranda
│  │  │  ├─ products/page.tsx       # semua produk + filter via searchParams
│  │  │  ├─ products/[slug]/page.tsx
│  │  │  ├─ category/[...slug]/page.tsx   # kategori 3 tingkat
│  │  │  ├─ shops/page.tsx
│  │  │  ├─ shops/[slug]/page.tsx
│  │  │  └─ info/[slug]/page.tsx    # help, about, terms, privacy, contact (1 template)
│  │  ├─ (auth)/                    # layout minimal
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  ├─ forgot-password/page.tsx
│  │  │  └─ reset-password/page.tsx
│  │  ├─ (member)/                  # wajib login
│  │  │  ├─ cart/page.tsx
│  │  │  ├─ checkout/page.tsx
│  │  │  ├─ orders/page.tsx
│  │  │  ├─ orders/[code]/page.tsx
│  │  │  ├─ downloads/page.tsx
│  │  │  ├─ wishlist/page.tsx
│  │  │  ├─ account/page.tsx        # profil + alamat (tabs)
│  │  │  └─ sell/page.tsx           # "Sell Now" → jadi Vendor
│  │  ├─ vendor/                    # wajib role vendor
│  │  │  ├─ layout.tsx              # guard + sidebar
│  │  │  ├─ page.tsx                # dashboard
│  │  │  ├─ products/page.tsx
│  │  │  ├─ products/new/page.tsx
│  │  │  ├─ products/[id]/page.tsx  # form yang sama dengan "new"
│  │  │  ├─ orders/page.tsx
│  │  │  ├─ balance/page.tsx        # saldo + request payout
│  │  │  └─ shop/page.tsx
│  │  ├─ auth/callback/route.ts     # tukar code OAuth/email → sesi
│  │  └─ api/midtrans/notification/route.ts   # webhook
│  ├─ components/
│  │  ├─ ui/                        # shadcn (hanya yang dipakai)
│  │  ├─ layout/    site-header.tsx · site-footer.tsx · mega-menu.tsx
│  │  ├─ product/   product-card.tsx · product-gallery.tsx · product-form.tsx
│  │  │             catalog-filters.tsx · reviews-comments.tsx
│  │  ├─ cart/      cart-view.tsx · snap-pay-button.tsx
│  │  └─ vendor/    sales-chart.tsx · image-uploader.tsx
│  ├─ actions/                      # Server Actions, 1 file per domain
│  │  ├─ auth.ts · account.ts · cart.ts · checkout.ts · orders.ts
│  │  └─ downloads.ts · vendor.ts · social.ts   # social = wishlist/review/komentar/laporan
│  ├─ queries/                      # fungsi baca data (server)
│  │  └─ catalog.ts · member.ts · vendor.ts
│  ├─ lib/
│  │  ├─ supabase/  client.ts · server.ts · admin.ts
│  │  └─ auth.ts · midtrans.ts · validators.ts · utils.ts · content.ts
│  └─ types/database.ts             # hasil generate, jangan diedit manual
├─ .env.example · .env.local · components.json · next.config.ts · package.json
```

**Aturan agar proyek tetap ringan:**

1. Semua komponen **Server Component** secara default; `'use client'` hanya untuk yang interaktif (gallery, filter, uploader, tombol Snap, form).
2. Filter, sort, dan paginasi katalog lewat **URL searchParams**, bukan state global (tanpa Redux/Zustand).
3. Satu halaman statis dinamis `info/[slug]` dengan isi di `lib/content.ts`, bukan 5 halaman terpisah.
4. Form tambah & edit produk memakai **satu** `product-form.tsx`.
5. Jalankan `shadcn add` hanya untuk komponen yang benar-benar dipakai.
6. Pecah file bila \> 300 baris; jangan buat folder baru sebelum ada ≥ 3 file yang sejenis.
7. Tidak ada `index.ts` barrel, tidak ada folder per-komponen.

---

## **Fase 0 — Prasyarat (± 1 jam)**

**Install:** Node.js LTS (min. 20.9; disarankan 22 LTS), Git, VS Code (ekstensi: ESLint, Tailwind CSS IntelliSense, Prettier).

```bash
node -v
npm -v
```

**Akun yang perlu disiapkan:** GitHub, Supabase, Vercel, Midtrans (Sandbox), Google Cloud Console.

**Tips device ringan** — `.vscode/settings.json`:

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true
  },
  "search.exclude": { "**/.next": true, "**/node_modules": true, "package-lock.json": true }
}
```

Jangan menjalankan Docker bersamaan dengan `npm run dev`; satu dev server saja.

**Selesai jika:** `node -v` ≥ 20.9 dan `npm -v` berjalan.

---

## **Fase 1 — Inisialisasi Proyek & Dependensi**

### **1.1 Buat proyek**

```bash
npx create-next-app@latest marketplace --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd marketplace
```

*Jika wizard menanyakan opsi lain (mis. React Compiler), pilih default.*

### **1.2 Dependensi runtime**

```bash
npm install @supabase/supabase-js @supabase/ssr server-only
npm install zod react-hook-form @hookform/resolvers
npm install sonner lucide-react date-fns
npm install browser-image-compression      # kompres gambar sebelum upload (hemat storage)
```

### **1.3 Dependensi dev**

```bash
npm install -D supabase                    # Supabase CLI sebagai devDependency
npm install -D prettier prettier-plugin-tailwindcss
```

### **1.4 shadcn/ui**

```bash
npx shadcn@latest init
# Pilih: Base color = Neutral, CSS variables = Yes   (sesuai keputusan Neutral Design Tokens)

npx shadcn@latest add button input label textarea select checkbox badge card \
  dialog sheet dropdown-menu tabs table skeleton avatar breadcrumb pagination \
  sonner chart form
```

*Jika CLI menandai `form` usang, gunakan `field`. `chart` otomatis menambahkan Recharts.*

### **1.5 Script & env**

Tambahkan di `package.json` → `scripts`:

```json
"db:push": "supabase db push",
"db:types": "supabase gen types typescript --linked > src/types/database.ts",
"typecheck": "tsc --noEmit"
```

Buat `.env.example` (commit) dan `.env.local` (jangan di-commit):

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=                     # server only
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=                     # server only
PLATFORM_COMMISSION_PERCENT=5            # 0 atau 5
```

`next.config.ts` — izinkan gambar dari Supabase Storage:

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
}
export default config
```

**Selesai jika:** `npm run dev` menampilkan halaman default dan `npm run build` lolos.

---

## **Fase 2 — Setup Third-Party**

### **2.1 Supabase**

1. Dashboard → **New project**. Isi nama, **database password kuat (simpan!)**, region **Southeast Asia (Singapore)**.
2. **Project Settings → API Keys:** salin **Project URL** dan **Publishable key** → `.env.local`. Buat **Secret key** → `SUPABASE_SECRET_KEY`.
3. **Authentication → Providers → Email:** aktif. Untuk masa development, **matikan "Confirm email"** sementara.
   > Email bawaan Supabase sangat dibatasi (rate limit rendah dan hanya cocok untuk testing). **Sebelum go-live wajib pasang SMTP sendiri** (mis. Resend) lalu aktifkan kembali konfirmasi email.
4. **Authentication → URL Configuration:**
   * Site URL: `http://localhost:3000`
   * Redirect URLs: `http://localhost:3000/**` (domain produksi & preview ditambahkan di Fase 12)
5. **Database → Extensions:** aktifkan **pg\_cron**.
6. Catat **Project Ref** (bagian awal URL project) untuk Fase 3.

### **2.2 Google OAuth (Login Google wajib V1)**

1. Google Cloud Console → buat project → **APIs & Services → OAuth consent screen** (External). Isi nama app, email support. Status awal **Testing** → tambahkan email penguji di *Test users*.
2. **Credentials → Create Credentials → OAuth client ID → Web application:**
   * *Authorized JavaScript origins:* `http://localhost:3000`
   * *Authorized redirect URIs:* `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Salin **Client ID** & **Client Secret**.
4. Supabase → **Authentication → Providers → Google:** aktifkan, tempel Client ID & Secret.

> Redirect URI yang didaftarkan di Google adalah **callback Supabase**, bukan URL Next.js. Callback Next.js ada di `/auth/callback`.

### **2.3 Midtrans Sandbox**

1. Daftar di dashboard Midtrans, pilih lingkungan **Sandbox**.
2. **Settings → Access Keys:** salin **Client Key** (`SB-Mid-client-…`) dan **Server Key** (`SB-Mid-server-…`) → `.env.local`.
3. **Settings → Payment:** aktifkan channel yang ingin diuji (VA bank, QRIS, e-wallet, kartu).
4. **Settings → Configuration:** isi *Payment Notification URL*, *Finish*, *Unfinish*, *Error redirect URL* **nanti di Fase 12** (butuh domain publik).
5. Untuk uji pembayaran: gunakan **Midtrans Sandbox Payment Simulator**. Kartu uji: `4811 1111 1111 1114`, CVV `123`, expiry bebas di masa depan, OTP 3DS `112233`.

### **2.4 Vercel**

Belum perlu aktif sekarang (dipakai di Fase 12). Pastikan akun sudah terhubung ke GitHub.

**Selesai jika:** semua key tersalin ke `.env.local`, Google & Midtrans Sandbox siap, pg\_cron aktif.

---

## **Fase 3 — Database (Supabase CLI)**

```bash
npx supabase login
npx supabase init
npx supabase link --project-ref <PROJECT_REF>
# tulis SQL di supabase/migrations/ lalu:
npm run db:push
npm run db:types
```

*Semua perintah memakai project hosted; Docker tidak diperlukan.*

### **3.1 `0001_schema.sql` — struktur**

**Enum:** `user_role (member, vendor)` · `product_type (physical, digital)` · `product_status (draft, published, archived)` · `order_status (pending_payment, paid, expired, cancelled)` · `fulfilment_status (waiting, processing, shipped, completed, cancelled)` · `payout_status (pending, paid, rejected)` · `report_status (open, resolved, dismissed)`.

**Tabel (sesuai Data Model brief + penyesuaian keputusan):**

| Tabel | Catatan penting |
| :---- | :---- |
| `profiles` | `id = auth.users.id`, `role`, `display_name`, `phone`, `avatar_url` |
| `addresses` | alamat banyak per profil, `is_default` |
| `shops` | unik per profil, `slug`, `flat_shipping_cost` (**ongkir flat per toko**), `whatsapp`, kontak |
| `categories` | `parent_id` (3 tingkat), `slug`, `sort_order` |
| `brands` | `name`, `slug` |
| `products` | `type`, `price`, `compare_price`, `stock` (null untuk digital), `attributes jsonb`, `rating_avg`, `rating_count`, `search_tsv` (kolom generated) + index GIN |
| `product_images` | `path`, `sort_order` |
| `digital_files` | `path` (bucket privat), `file_name`, `size`, `format` |
| `cart_items` | unik (`profile_id`, `product_id`), `qty`, **`buyer_note`** |
| `wishlists` | unik (`profile_id`, `product_id`) |
| `orders` | `code` (unik, = order\_id Midtrans), `status`, `total`, `snap_token`, `expires_at`, `paid_at` |
| `order_items` | `shop_id`, `product_id`, **snapshot** judul & harga, `qty`, `shipping_cost`, `commission_amount`, `net_amount`, `buyer_note`, `fulfilment_status`, `tracking_number`, `downloads_count`, `download_expires_at` |
| `payments` | `order_id`, `payment_type`, `midtrans_status`, `gross_amount`, `raw jsonb` |
| `download_logs` | `order_item_id`, `profile_id`, `created_at` |
| `reviews` | **unik per `order_item_id`**, `rating 1–5`, `body` |
| `comments` | `parent_id` untuk balasan |
| `reports` | `target_type`, `target_id`, `reason`, `status` |
| `payout_requests` | `shop_id`, `amount`, `bank_name`, `account_no`, `account_holder`, `status` |

**Aturan integritas:** `CHECK (price >= 0)`, `CHECK (stock IS NULL OR stock >= 0)`, digital ⇒ `stock IS NULL`; index pada semua kolom FK yang dipakai policy; trigger `updated_at`; trigger penghitung `rating_avg/rating_count` dari `reviews`.

**Trigger `handle_new_user`:** saat baris baru masuk `auth.users` → buat `profiles` (nama dari `raw_user_meta_data.full_name`/`name`, avatar dari metadata Google).

### **3.2 `0002_rls_storage.sql` — keamanan**

Aktifkan RLS di **semua** tabel. Pola policy:

```sql
-- Publik: hanya produk published
create policy "products_public_read" on products for select
  using (status = 'published' or shop_id in (select id from shops where profile_id = (select auth.uid())));

-- Vendor hanya mengelola produk tokonya
create policy "products_owner_write" on products for all
  using (shop_id in (select id from shops where profile_id = (select auth.uid())))
  with check (shop_id in (select id from shops where profile_id = (select auth.uid())));

-- Member hanya melihat order miliknya; vendor melihat item tokonya
create policy "order_items_read" on order_items for select using (
  order_id in (select id from orders where profile_id = (select auth.uid()))
  or shop_id in (select id from shops where profile_id = (select auth.uid()))
);
```

**Wajib:**

* Bungkus `auth.uid()` dengan `(select auth.uid())` agar dievaluasi sekali per query (performa).
* **Cegah eskalasi role:** user tidak boleh mengubah kolom `role`.
  ```sql
  revoke update on profiles from authenticated;
  grant update (display_name, phone, avatar_url) on profiles to authenticated;
  ```
* `orders`, `order_items`, `payments`, `download_logs`: **tidak ada policy insert/update dari client**; semua tulis lewat RPC/secret key.
* `reviews`: insert hanya jika `order_item` milik user dan `fulfilment_status = 'completed'`.
* `profiles` hanya dibaca pemiliknya. Untuk nama reviewer di halaman publik, buat view `public_profiles (id, display_name, avatar_url)`.

**Storage (bucket & policy):**

| Bucket | Akses | Path |
| :---- | :---- | :---- |
| `product-images` | publik baca; tulis hanya ke folder uid sendiri | `{uid}/{productId}/{uuid}.webp` |
| `shop-assets` | publik baca; tulis ke folder uid sendiri | `{uid}/logo.webp` |
| `digital-files` | **privat**, tanpa policy baca; vendor tulis ke folder uid sendiri | `{uid}/{productId}/{file}` |

```sql
create policy "vendor upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
```

Batas ukuran file per bucket diatur saat membuat bucket (gambar ≤ 2 MB, digital sesuai batas plan; plan Free memiliki batas ukuran file global sekitar 50 MB).

### **3.3 `0003_functions_cron.sql` — logika kritis (RPC)**

Semua fungsi `SECURITY DEFINER`, `set search_path = public`, dan **cabut execute dari `anon`** (`revoke execute ... from anon, public`).

| Fungsi | Dipanggil oleh | Logika |
| :---- | :---- | :---- |
| `become_vendor(...)` | Member (Sell Now) | Buat `shops`, ubah `profiles.role = 'vendor'` (auto-approve) |
| `create_order(p_address_id)` | Server Action checkout | Dalam satu transaksi: ambil `cart_items` user → `SELECT ... FOR UPDATE` pada produk → validasi `published` & stok → **hitung harga dari DB** → tolak beli produk toko sendiri → ongkir flat **sekali per toko** (0 jika toko itu hanya berisi produk digital) → hitung `commission_amount` & `net_amount` (dari `PLATFORM_COMMISSION_PERCENT`) → insert `orders` + `order_items` → **kurangi stok** → kosongkan keranjang → set `expires_at = now() + 24 jam`. Jika `total = 0` (produk gratis) langsung `paid`/`completed` tanpa Midtrans |
| `apply_payment_status(code, status, gross, type, raw)` | **Webhook saja** (secret key) | Cocokkan `gross` dengan `orders.total`; **idempotent**; status hanya boleh maju; `paid` → set `paid_at`, item digital langsung `completed` + `download_expires_at = paid_at + 30 hari`; `expired/cancelled` → kembalikan stok |
| `expire_pending_orders()` | pg\_cron | `pending_payment` yang lewat `expires_at` → `expired` + kembalikan stok |
| `auto_complete_orders()` | pg\_cron | Item `shipped` \> 7 hari → `completed` |
| `consume_download(p_item_id)` | Server Action unduh | Cek milik user, order `paid`, `downloads_count < 5`, `now() < download_expires_at`; **naikkan counter + insert log atomik**; kembalikan `path` file |
| `vendor_update_fulfilment(p_item_id, p_status, p_tracking)` | Vendor | Validasi kepemilikan toko & urutan status (`processing → shipped`) |
| `confirm_received(p_item_id)` | Member | `shipped → completed` |
| `request_payout(p_amount, bank...)` | Vendor | Saldo tersedia = Σ `net_amount` item `completed` − Σ payout `pending/paid`; tolak jika kurang |

```sql
select cron.schedule('expire-orders',   '*/10 * * * *', $$select public.expire_pending_orders()$$);
select cron.schedule('auto-complete',   '0 * * * *',    $$select public.auto_complete_orders()$$);
```

**View admin minimalis (dibuka lewat Supabase Studio, tanpa UI):** `v_admin_pending_payouts` dan `v_admin_open_reports`. Admin memproses payout dengan mengubah `status` di Table Editor setelah transfer manual.

### **3.4 `seed.sql`**

Isi kategori 3 tingkat (mis. Fashion → Pakaian Wanita → Dress) dan beberapa brand. Akun vendor/member dibuat lewat UI register agar `handle_new_user` berjalan.

**Selesai jika:** `db:push` & `db:types` sukses, Supabase **Advisors** (Security & Performance) tidak menampilkan tabel tanpa RLS.

---

## **Fase 4 — Fondasi Aplikasi**

### **4.1 Client Supabase**

`src/lib/supabase/client.ts`

```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
```

`src/lib/supabase/server.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const store = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)) } catch {}
        },
      },
    },
  )
}
```

`src/lib/supabase/admin.ts` — **hanya server** (secret key, melewati RLS):

```ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const createAdminClient = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  })
```

### **4.2 `src/proxy.ts` (Next.js 16 — pengganti `middleware.ts`)**

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/cart', '/checkout', '/orders', '/downloads', '/wishlist', '/account', '/sell', '/vendor']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data } = await supabase.auth.getClaims()
  const path = request.nextUrl.pathname

  if (!data?.claims && PROTECTED.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/midtrans|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

> Proxy hanya **lapisan UX**. Otorisasi sebenarnya ada di **RLS + pengecekan di setiap Server Action** (`requireUser()` / `requireVendor()` di `lib/auth.ts`). Webhook Midtrans dikecualikan dari matcher.

### **4.3 Auth**

* `lib/auth.ts`: `getUser()`, `requireUser()` (redirect ke `/login?next=…`), `requireVendor()` — bungkus dengan `cache()` React.
* `actions/auth.ts`: `signUp`, `signIn`, `signOut`, `forgotPassword`, `resetPassword` (validasi Zod).
* **Login Google:** komponen client memanggil

  ```ts
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/auth/callback?next=${next}` },
  })
  ```
* `app/auth/callback/route.ts`: `exchangeCodeForSession(code)` lalu redirect ke `next`. **Validasi `next` hanya path relatif** (diawali `/`, bukan `//`) untuk mencegah open redirect.
* Layout: `site-header` (pencarian, ikon cart + badge, wishlist, menu user, tombol **Sell Now**), `site-footer`, `mega-menu` 3 tingkat, navigasi mobile (Sheet).
* `globals.css`: pakai token CSS variable shadcn (Neutral); jangan hard-code warna di komponen.

**Selesai jika:** register/login email dan Google berhasil, `/cart` tanpa login diarahkan ke `/login?next=/cart` lalu kembali setelah login, profil otomatis terbuat.

---

## **Fase 5 — Katalog Publik (Guest)**

1. **Queries** (`queries/catalog.ts`): produk published, kategori (tree), brand, detail produk + gambar + toko + review, daftar toko.
2. **Beranda:** hero/banner, Shop by Category, Special Offers (produk `compare_price > price`, badge persen diskon dihitung di UI), Featured, New Arrivals, Shop by Brand.
3. **Listing** (`/products`, `/category/[...slug]`): filter kategori, brand, rentang harga, tipe (fisik/digital), lokasi; sort terbaru/harga/populer; paginasi 24 item/halaman; semua dari `searchParams`.
4. **Pencarian:** `search_tsv` dengan konfigurasi `'simple'` + fallback `ilike`.
5. **Detail produk:** galeri, harga & diskon, stok, penjual, tab Description / Additional Info (`attributes`) / Shipping (ongkir flat toko) / Reviews / Comments, tombol WhatsApp penjual (`https://wa.me/<nomor>`), Report, produk terkait. Tambahkan `generateMetadata` untuk SEO.
6. **Add to Cart / Wishlist** berupa `<form action>` → Server Action memanggil `requireUser()`; Guest otomatis diarahkan ke login lalu kembali.
7. **Halaman toko** & **info** (konten statis di `lib/content.ts`).
8. Optimasi opsional: gunakan client Supabase **tanpa cookies** untuk query publik + `export const revalidate = 60` agar halaman bisa di-cache.

**Selesai jika:** Guest dapat menjelajah seluruh katalog tanpa login; hanya produk `published` yang muncul (uji dengan produk `draft`).

---

## **Fase 6 — Member: Cart, Wishlist, Akun**

* **Cart** (`actions/cart.ts`): tambah/ubah qty/hapus; digital qty selalu 1; qty ≤ stok; tolak produk toko sendiri; **catatan pembeli** per item (`buyer_note`). Tampilan dikelompokkan per toko dengan ongkir flat per toko.
* **Wishlist:** toggle + halaman daftar.
* **Account:** edit profil (nama, HP, avatar), CRUD alamat, alamat utama.

**Selesai jika:** keranjang tersimpan lintas perangkat, subtotal & ongkir per toko benar.

---

## **Fase 7 — Checkout & Midtrans Sandbox**

### **7.1 Alur**

1. Halaman `/checkout`: pilih alamat (wajib hanya jika ada produk fisik) → ringkasan per toko.
2. Server Action `placeOrder`: panggil RPC `create_order` → bangun payload Snap → simpan `snap_token` → kembalikan token.
3. Client memuat `snap.js` dan memanggil `window.snap.pay(token, …)`.
4. **Callback `onSuccess` hanyalah UX.** Status `paid` **hanya** dari webhook.
5. Redirect ke `/orders/[code]`; halaman me-refresh status sampai `paid`.
6. Gagal membuat transaksi Midtrans → batalkan order (stok dikembalikan).
7. Retry pembayaran: **pakai ulang `snap_token`** selama order masih `pending_payment` (membuat transaksi baru dengan `order_id` sama akan ditolak Midtrans).

### **7.2 `lib/midtrans.ts`**

```ts
import 'server-only'
import { createHash, timingSafeEqual } from 'crypto'

const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const SNAP = isProd ? 'https://app.midtrans.com/snap/v1' : 'https://app.sandbox.midtrans.com/snap/v1'
const basic = () => 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY! + ':').toString('base64')

export async function createSnapTransaction(payload: Record<string, unknown>) {
  const res = await fetch(`${SNAP}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: basic() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Midtrans ${res.status}: ${await res.text()}`)
  return (await res.json()) as { token: string; redirect_url: string }
}

export function verifySignature(n: { order_id: string; status_code: string; gross_amount: string; signature_key: string }) {
  const expected = createHash('sha512')
    .update(n.order_id + n.status_code + n.gross_amount + process.env.MIDTRANS_SERVER_KEY!)
    .digest('hex')
  const a = Buffer.from(expected), b = Buffer.from(n.signature_key ?? '')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function mapStatus(t: string, fraud?: string) {
  if (t === 'settlement' || (t === 'capture' && fraud !== 'challenge')) return 'paid'
  if (t === 'expire') return 'expired'
  if (['cancel', 'deny', 'failure'].includes(t)) return 'cancelled'
  return 'pending'
}
```

**Aturan payload Snap (sering jadi sumber error):**

* `transaction_details.order_id` = `orders.code`, unik, ≤ 50 karakter (huruf/angka, `-`, `_`).
* `gross_amount` **bilangan bulat IDR** dan **harus sama** dengan jumlah `price × quantity` semua `item_details` (ongkir dimasukkan sebagai item sendiri per toko).
* `item_details.name` **maksimal 50 karakter** (potong judul produk).
* `expiry: { unit: 'hours', duration: 24 }` dan `customer_details` (nama, email, HP).
* `gross_amount = 0` tidak diterima Midtrans → produk gratis **tidak** lewat Midtrans.

### **7.3 Webhook `app/api/midtrans/notification/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapStatus, verifySignature } from '@/lib/midtrans'

export async function POST(req: Request) {
  const n = await req.json()
  if (!verifySignature(n)) return NextResponse.json({ message: 'invalid signature' }, { status: 403 })

  const { error } = await createAdminClient().rpc('apply_payment_status', {
    p_code: n.order_id,
    p_status: mapStatus(n.transaction_status, n.fraud_status),
    p_gross: Math.round(Number(n.gross_amount)),
    p_type: n.payment_type ?? null,
    p_raw: n,
  })
  if (error) return NextResponse.json({ message: error.message }, { status: 500 }) // Midtrans akan retry
  return NextResponse.json({ ok: true })
}
```

### **7.4 Uji lokal webhook**

Midtrans butuh URL publik. Gunakan tunnel (mis. cloudflared/ngrok) → isi *Payment Notification URL* sementara dengan `https://<tunnel>/api/midtrans/notification`. Uji dengan Simulator, lalu **kembalikan ke domain produksi** di Fase 12.

**Selesai jika:** bayar via simulator → order berubah `paid` otomatis; kirim notifikasi yang sama 2× tidak mengubah apa pun; `gross_amount` palsu ditolak.

---

## **Fase 8 — Pesanan & Produk Digital**

* **`/orders`** & **`/orders/[code]`:** status per item, resi, tombol "Pesanan Diterima" (`confirm_received`), tombol "Bayar" bila `pending_payment` (pakai `snap_token`).
* **`/downloads`:** daftar produk digital yang sudah `paid`, sisa unduhan (maks 5×) dan tanggal kedaluwarsa (30 hari).
* **`actions/downloads.ts`:**
  1. `requireUser()`
  2. RPC `consume_download(item_id)` → mendapat `path`
  3. `createAdminClient().storage.from('digital-files').createSignedUrl(path, 60, { download: file_name })`
  4. Kembalikan URL (umur 60 detik).
* **Produk gratis:** klaim → `create_order` dengan total 0 → langsung masuk `/downloads` (limit & kedaluwarsa tetap berlaku).

**Selesai jika:** unduhan ke-6 ditolak, unduhan setelah 30 hari ditolak, user lain tidak bisa mengunduh file yang bukan miliknya.

---

## **Fase 9 — Vendor**

1. **Onboarding `/sell`:** form toko (nama, slug, deskripsi, logo, kontak, WhatsApp, lokasi, ongkir flat) → RPC `become_vendor` → redirect `/vendor`.
2. **`vendor/layout.tsx`:** `requireVendor()` + sidebar (Dashboard, Produk, Pesanan, Saldo, Toko).
3. **Dashboard:** total penjualan, pesanan baru, produk terlaris, grafik penjualan harian (`sales-chart.tsx`, Recharts via shadcn `chart`). Sumber data: view/RPC agregasi harian per toko.
4. **Produk (`product-form.tsx`, satu form):** pilih tipe Fisik/Digital; field umum; fisik: SKU, stok, berat, `attributes`; digital: upload file privat + format. Status draft/published/archived. **Single-SKU** (tanpa varian). Produk yang pernah dipesan **tidak boleh dihapus**, hanya diarsipkan.
5. **Upload (`image-uploader.tsx`):** kompres ke WebP ≤ 1600 px (`browser-image-compression`) → upload langsung ke Storage dari browser → simpan path ke DB.
6. **Pesanan masuk:** daftar `order_items` tokonya, tampil `buyer_note`, ubah ke `processing`/`shipped` + input resi (`vendor_update_fulfilment`).
7. **Saldo (`/vendor/balance`):** saldo tersedia (read-only), riwayat payout, form **Request Payout** (`request_payout`). Pencairan dilakukan admin manual via Supabase Studio.
8. **Pengaturan toko:** profil, logo, kontak, ongkir flat.

**Selesai jika:** vendor dapat membuat produk fisik & digital, menerima pesanan, mengisi resi, melihat saldo, dan mengajukan payout.

---

## **Fase 10 — Review, Komentar, Laporan**

* **Review:** form muncul hanya bila item `completed` milik user dan belum direview; rating otomatis dihitung ulang oleh trigger.
* **Komentar:** Member menulis, **Vendor pemilik produk dapat membalas** (policy berdasarkan `shop_id` produk).
* **Report Product / Report Comment:** insert ke `reports`; ditinjau admin lewat `v_admin_open_reports`.
* Semua di `actions/social.ts` + `reviews-comments.tsx`.

**Selesai jika:** review palsu (tanpa pembelian) ditolak oleh database, bukan hanya UI.

---

## **Fase 11 — Hardening & QA**

### **11.1 Checklist keamanan**

* [ ] RLS aktif di semua tabel; Supabase Security Advisor bersih
* [ ] `SUPABASE_SECRET_KEY` & `MIDTRANS_SERVER_KEY` tidak muncul di bundle client (cek `npm run build` + cari di `.next/static`)
* [ ] Role tidak dapat diubah dari client (`profiles.role`)
* [ ] Harga/total tidak pernah diterima dari client
* [ ] Webhook memverifikasi signature dan mencocokkan `gross_amount`
* [ ] File digital hanya lewat signed URL berumur pendek
* [ ] `next` pada callback login divalidasi (anti open redirect)
* [ ] Validasi Zod di semua Server Action; tipe & ukuran file upload dibatasi

### **11.2 Matriks uji (siapkan 1 Member, 2 Vendor: X dan Y)**

| Skenario | Hasil yang diharapkan |
| :---- | :---- |
| Guest membuka produk `draft` | Tidak ditemukan |
| Guest klik Add to Cart | Diarahkan login lalu kembali ke produk |
| Vendor X membaca/mengubah produk/pesanan Vendor Y (via client Supabase) | Ditolak RLS |
| Member mengubah `role` lewat API | Ditolak |
| Vendor membeli produk tokonya sendiri | Ditolak |
| Checkout dua tab bersamaan dengan stok 1 | Satu berhasil, satu gagal |
| Webhook dikirim ulang / urutan terbalik | Status tetap konsisten (idempotent) |
| Webhook dengan `gross_amount` berbeda | Ditolak |
| Order tidak dibayar \> 24 jam | `expired`, stok kembali |
| Produk digital: unduh ke-6 / hari ke-31 | Ditolak |
| User lain meminta unduhan item orang lain | Ditolak |
| Request payout melebihi saldo | Ditolak |
| Review tanpa pembelian selesai | Ditolak |

### **11.3 Performa & kualitas**

* `npm run typecheck`, `npm run lint`, `npm run build` bersih
* Tambahkan `loading.tsx` (skeleton) hanya di rute berat: beranda, listing, detail produk, dashboard vendor
* Pakai `next/image` untuk semua gambar produk; target LCP \< 2,5 dtk di mobile
* Cek Supabase **Performance Advisor** (index FK yang hilang)
* Uji seluruh alur utama di layar HP

---

## **Fase 12 — Deployment Vercel**

> **Git dikerjakan sendiri oleh Anda.** Pastikan `.env*` ada di `.gitignore` (kecuali `.env.example`).

1. **Push ke GitHub** (repo privat), commit per fase agar riwayat rapi.
2. **Vercel → Add New → Project →** import repo. Framework terdeteksi Next.js, biarkan default build.
3. **Environment Variables** (Production + Preview), isi sesuai `.env.example`:
   * `NEXT_PUBLIC_SITE_URL` = domain Vercel/produksi
   * Key Supabase, key Midtrans **Sandbox**, `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false`, `PLATFORM_COMMISSION_PERCENT`
   * Tandai key rahasia sebagai **Sensitive**
4. **Settings → Functions → Function Region:** pilih **Singapore (sin1)** agar dekat dengan database Supabase.
5. **Deploy**, lalu catat URL produksi.
6. **Update layanan eksternal dengan URL produksi:**
   * Supabase → URL Configuration: **Site URL** = URL produksi; **Redirect URLs** tambah `https://<domain>/**` dan pola preview `https://*-<nama-tim>.vercel.app/**`
   * Google Cloud → OAuth client → *Authorized JavaScript origins* tambah URL produksi
   * Midtrans Sandbox → Settings → Configuration:
     * Payment Notification URL: `https://<domain>/api/midtrans/notification`
     * Finish/Unfinish/Error redirect: `https://<domain>/orders`
7. **Redeploy** agar env terbaru terbaca.
8. **Catatan penting:**
   * **Vercel Authentication** pada URL *preview* dapat memblokir webhook dan OAuth. Lakukan uji pembayaran di **URL produksi**.
   * *Payment Notification URL* di Midtrans hanya satu; jangan tertukar antara tunnel lokal dan produksi.

### **Smoke test produksi (urut)**

1. Buka beranda sebagai Guest → buka detail produk
2. Register + login Google
3. Daftar Vendor → buat 1 produk fisik + 1 produk digital (published)
4. Login Member lain → add to cart → checkout → bayar via Simulator
5. Pastikan order `paid` otomatis, vendor menerima pesanan, resi terisi → Member konfirmasi diterima
6. Unduh produk digital → tulis review
7. Vendor request payout → cek di Supabase Studio (`v_admin_pending_payouts`)

**Selesai jika:** seluruh smoke test lolos di URL produksi.

---

## **Fase 13 — Checklist Menuju Live (Setelah V1 Sandbox)**

* **Vercel:** plan **Hobby hanya untuk penggunaan non-komersial**; marketplace yang menerima pembayaran sungguhan memerlukan **Pro**
* **Supabase:** plan Free auto-pause setelah 1 minggu tidak aktif dan kuota storage/egress kecil → pertimbangkan **Pro** (juga backup); idealnya buat **project terpisah untuk produksi**
* **Midtrans:** ajukan akun **Production** (verifikasi bisnis), ganti key, set `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true`, daftarkan ulang Notification URL di dashboard Production
* **Email:** SMTP sendiri (Resend) + aktifkan kembali **Confirm email**
* **Google OAuth:** ubah status consent screen ke **In production**
* **Domain & legal:** domain kustom, halaman Terms/Privacy final
* **Monitoring:** Vercel Logs/Analytics + Supabase Logs; pantau egress Storage

---

## **Lampiran A — Konvensi Kerja**

* **Branch:** `main` (stabil) + `feat/<fase>-<topik>`; commit kecil per fitur, pesan gaya Conventional Commits (`feat:`, `fix:`, `chore:`)
* **Urutan kerja tiap fitur:** SQL/RLS → `npm run db:push && npm run db:types` → query/action → UI → uji manual dengan 2 akun berbeda
* **Penamaan:** file `kebab-case`, komponen `PascalCase`, tabel/kolom `snake_case`
* **Definition of Done fitur:** lolos typecheck + lint, RLS teruji, tidak ada key rahasia di client, tampil benar di layar HP

## **Lampiran B — Risiko & Mitigasi**

| Risiko | Mitigasi |
| :---- | :---- |
| Race condition stok | `FOR UPDATE` di dalam RPC `create_order` |
| Webhook ganda / terlambat | `apply_payment_status` idempotent, status hanya maju |
| Pembengkakan egress Storage | Kompres gambar, batas unduhan 5× / 30 hari, signed URL 60 detik |
| Supabase Free pause | Buka rutin saat dev; Pro sebelum live |
| Webhook terblokir di preview | Uji pembayaran di URL produksi |
| Kebocoran secret key | `server-only`, env Sensitive, cek bundle sebelum deploy |
