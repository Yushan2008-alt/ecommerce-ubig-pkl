# **Product Brief: Marketplace Multi-Vendor (Produk Fisik & Digital)**

> Referensi: [modesy.codingest.net](https://modesy.codingest.net/) (Modesy — Marketplace & Classified Ads Script). Tanda **\[Observasi\]** \= diamati langsung dari tampilan guest Modesy. Tanda **\[Usulan\]** \= saran produk, belum dikonfirmasi. Hak akses role Super Admin/Moderator/Vendor/Member pada demo Modesy **belum diverifikasi login langsung**; matriks di bawah mengikuti keputusan role versi proyek ini (3 role).

## **1\. Product Vision**

Marketplace multi-vendor tempat vendor membuka toko dan menjual **produk fisik maupun produk digital (download)**, sementara pembeli dapat menjelajah katalog, checkout, dan membayar online lewat Midtrans. Semua dalam satu platform web responsif.

Positioning: **marketplace publik** dengan pengalaman browsing ala Shopee — siapa pun boleh melihat-lihat katalog tanpa akun, tetapi aksi transaksi (keranjang, wishlist, checkout, jualan) mewajibkan login.

## **2\. Core Principles**

**Browse bebas, transaksi butuh akun.** Guest bisa melihat semua katalog, toko, dan detail produk. Begitu menekan Add to Cart, Wishlist, atau Checkout, sistem mengarahkan ke Login/Register lalu mengembalikan user ke halaman semula.

**Satu platform, dua tipe produk.** Produk fisik (stok, pengiriman, status kirim) dan produk digital (tanpa stok/ongkir, file unduh terbuka setelah pembayaran lunas) hidup di satu katalog dan satu alur checkout.

**Vendor mengelola tokonya sendiri, tidak melihat toko lain.** Vendor hanya mengakses produk, pesanan, dan pengaturan tokonya sendiri. Dipaksa di level database (Row Level Security), bukan hanya disembunyikan di UI.

**Keamanan transaksi di server.** Harga, total, dan status pembayaran selalu dihitung dan divalidasi di server. Status "lunas" hanya berasal dari notifikasi Midtrans yang tervalidasi, bukan dari klaim browser.

## **3\. Core Concept: Struktur Role & Modul**

### **Role**

* **Guest** — pengunjung tanpa login (POV Shopee tanpa akun). **View only**: katalog, pencarian, detail produk, halaman toko, review.  
* **Member** — user terdaftar (Register/Login). Semua kemampuan Guest ditambah: keranjang, wishlist, checkout, bayar via Midtrans, riwayat pesanan, unduh produk digital, tulis review/komentar, laporkan produk. Member bisa **mengajukan diri menjadi Vendor**.  
* **Vendor** — Member yang sudah punya toko. Kemampuan Member ditambah: kelola produk (fisik & digital), kelola pesanan masuk, input resi, lihat rekap penjualan, atur profil toko.

*(Super Admin/Moderator ada di Modesy asli, tetapi tidak termasuk 3 role V1. Lihat bagian 11 dan 13.)*

### **Modul Utama**

1. Katalog & Pencarian (publik)  
2. Autentikasi & Akun  
3. Keranjang & Wishlist  
4. Checkout & Pembayaran (Midtrans Sandbox)  
5. Pesanan & Produk Digital (unduhan)  
6. Toko & Dashboard Vendor  
7. Review, Komentar & Laporan

Alur antar modul: katalog → keranjang → checkout → pembayaran → pesanan → (fisik: pengiriman / digital: unduhan) → review.

## **4\. Target User**

* **Pembeli (Member)** — ingin menemukan produk fisik/digital, bayar dengan mudah, dan melacak pesanan dari HP.  
* **Penjual (Vendor)** — kreator/pelaku usaha kecil yang butuh etalase online \+ pengelolaan pesanan tanpa membangun toko sendiri.  
* **Pengunjung (Guest)** — calon pembeli yang hanya melihat-lihat.

Bukan untuk (V1):

* Pengelola platform lewat panel admin khusus (belum ada, lihat Out of Scope)  
* Multi-bahasa & multi-mata uang (V1 Indonesia: Bahasa Indonesia \+ IDR)

## **5\. Feature Breakdown**

### **5.1 Pengalaman Guest (Publik)**

**Beranda \[Observasi\]**

* Header: logo, pencarian, tombol Login / Register, ikon Cart & Wishlist, tombol **Sell Now**  
* Mega menu kategori 3 tingkat (kategori → sub-kategori → sub-sub), contoh: *Clothing → Women's Clothing → Dresses*  
* Banner promosi, **Shop By Category**, **Special Offers** (badge diskon, mis. \-25%), **Featured Products**, **New Arrivals**, blok produk per kategori, **Shop By Brand**  
* Footer: link kategori, Shops, Help Center, Terms, Privacy, About Us, newsletter, cookie consent

**Katalog & Pencarian \[Observasi\]**

* Halaman listing per kategori/sub-kategori dan halaman semua produk  
* Filter: kategori, brand, rentang harga, lokasi (negara/provinsi/kota), tipe produk (fisik/digital) **\[Usulan\]**  
* Sorting: terbaru, harga, populer **\[Usulan\]**  
* Kartu produk: gambar, nama, nama toko, harga coret \+ persen diskon, jumlah review, label "Free" untuk produk gratis

**Detail Produk \[Observasi\]**

* Breadcrumb kategori, galeri gambar (thumbnail \+ zoom), nama, penjual (link ke toko), rating & jumlah review  
* Harga, harga sebelum diskon, persen diskon, status stok (In Stock), SKU, input kuantitas  
* Tombol **Add to Cart**, **Add to Wishlist**, **Ask Question** (via WhatsApp penjual), share sosmed  
* Info estimasi pengiriman ("Ready to ship in 1 Business Day"), pilih lokasi tujuan  
* Tab: **Description**, **Additional Information** (brand, bahan, dll), **Shipping & Location**, **Reviews**, **Comments**  
* Aksi: Report Product, Report Comment, Contact Seller (tampilkan telepon/email), "More from \[Toko\]", "You may also like"  
* Guest yang menekan Add to Cart/Wishlist/Review/Comment diarahkan ke Login, lalu kembali ke halaman produk

**Halaman Toko \[Observasi\]**

* Profil toko (foto, nama, kontak), daftar produk toko, daftar toko di halaman **Shops**

**Halaman Statis & Konten**

* Help Center, About Us, Terms & Conditions, Privacy Policy, Cookie Policy, Contact, "Sell on \[Nama Produk\]" (halaman ajakan jadi vendor)  
* Blog \[Observasi di Modesy\] → **tidak masuk V1**

### **5.2 Autentikasi & Akun**

* Register & Login email/password (Supabase Auth), verifikasi email  
* **Login dengan Google** \[Observasi\] — opsional V1 **\[Usulan\]**  
* Forgot Password / Reset Password \[Observasi\]  
* Profil Member: nama, foto, nomor HP, **buku alamat** (banyak alamat, alamat utama)  
* Setelah login, redirect kembali ke halaman asal (return URL)

### **5.3 Keranjang & Wishlist**

* Keranjang tersimpan di database per Member (lintas perangkat); isi keranjang dikelompokkan **per toko**  
* Ubah kuantitas, hapus item, validasi stok & harga terbaru saat membuka keranjang  
* Produk digital: kuantitas selalu 1, tidak ada ongkir  
* Wishlist: simpan/hapus produk, halaman Wishlist

### **5.4 Checkout & Pembayaran (Midtrans Sandbox)**

* Pilih alamat pengiriman (hanya wajib jika ada produk fisik di keranjang)  
* Ringkasan pesanan per toko: subtotal, ongkir, total  
* **Ongkir V1 \[Usulan\]**: tarif flat yang ditetapkan vendor per produk/toko, tanpa integrasi kurir otomatis  
* Pembayaran lewat **Midtrans Snap (Sandbox)**: popup/redirect dengan beragam metode (VA bank, e-wallet, QRIS, kartu) sesuai yang tersedia di Sandbox  
* Server membuat transaksi Midtrans dengan **harga yang dihitung ulang di server**  
* Status pembayaran diperbarui lewat **webhook notifikasi Midtrans**, divalidasi dengan `signature_key` (SHA512 dari `order_id + status_code + gross_amount + server_key`)  
* Batas waktu pembayaran (mis. 24 jam); jika kedaluwarsa → pesanan `expired`, stok dikembalikan  
* Halaman hasil: sukses / menunggu pembayaran / gagal  
* Satu checkout dengan banyak toko \= **satu pembayaran, banyak sub-pesanan** (satu per toko) **\[Usulan\]**

### **5.5 Pesanan & Produk Digital**

**Member**

* Riwayat pesanan \+ detail (item, alamat, status, nomor resi)  
* Status pesanan: `pending_payment` → `paid` → `processing` → `shipped` → `completed`; cabang `cancelled`, `expired`  
* Konfirmasi "Pesanan Diterima" (atau auto-complete setelah N hari **\[Usulan\]**)  
* Halaman **My Downloads**: daftar produk digital yang sudah dibeli \+ tombol unduh

**Produk digital**

* File disimpan di **Supabase Storage bucket privat**, tidak pernah URL publik  
* Setelah pembayaran `paid`, Member mendapat **signed URL berumur pendek** setiap kali menekan Unduh; akses divalidasi di server (order lunas \+ milik Member tersebut)  
* Pesanan yang hanya berisi produk digital langsung `completed` setelah lunas (tanpa tahap pengiriman)  
* Produk **gratis** (harga 0\) bisa diunduh Member tanpa melalui pembayaran **\[Observasi: label "Free" di Modesy\]**  
* Batas jumlah unduhan per pembelian **\[Usulan\]**

### **5.6 Toko & Dashboard Vendor**

**Onboarding Vendor (\[Observasi\]: tombol "Sell Now")**

* Member membuka "Sell Now" → mengisi form toko (nama toko, slug, deskripsi, logo, kontak, lokasi) → menjadi Vendor  
* **Persetujuan**: V1 **otomatis aktif** (tidak ada admin) **\[Usulan — perlu dikonfirmasi\]**

**Dashboard Vendor**

* Ringkasan: total penjualan, pesanan baru, produk terlaris, grafik penjualan per periode (Recharts)  
* **Produk**: tambah/edit/hapus/arsipkan, pilih tipe **Fisik** atau **Digital**  
  * Field umum: judul, deskripsi, kategori (3 tingkat), brand, harga, harga coret/diskon, galeri gambar, status (draft/published)  
  * Fisik: SKU, stok, berat, ongkir flat, lokasi produk, info tambahan (key–value, mis. Brand/Fabric)  
  * Digital: upload file produk (privat), keterangan lisensi/format  
  * Varian (ukuran/warna) **\[Usulan: ditunda, lihat Open Questions\]**  
* **Pesanan masuk**: daftar sub-pesanan toko, ubah status ke `processing`/`shipped`, **input nomor resi**  
* **Pengaturan Toko**: profil, kontak, jam operasional **\[Usulan\]**  
* **Rekap pendapatan** (read-only): total penjualan, komisi platform **\[Usulan\]**, saldo; **pencairan dana ke vendor di luar V1** (manual)

### **5.7 Review, Komentar & Laporan**

* **Review** (rating 1–5 \+ teks): hanya Member yang pernah membeli dan pesanannya `completed` **\[Usulan\]** (Modesy membolehkan rating oleh user login; pembatasan ini menekan review palsu)  
* **Komentar/tanya jawab** produk oleh Member; Vendor bisa membalas  
* **Report Product / Report Comment** \[Observasi\]: Member mengirim laporan \+ alasan; laporan tersimpan untuk ditinjau (belum ada panel admin di V1)  
* **Contact Seller**: tampilkan kontak toko; tombol WhatsApp \[Observasi\]

## **6\. Supporting Features (Usulan Tambahan)**

*Bagian ini saran dari sisi produk, belum dikonfirmasi — pilih yang relevan:*

* **Notifikasi email** (Resend/Supabase): konfirmasi pesanan, pembayaran berhasil, pesanan dikirim, vendor mendapat pesanan baru  
* **Notifikasi in-app** (Supabase Realtime) untuk Vendor: pesanan baru masuk  
* **Kupon/voucher** per toko atau platform  
* **Request a Quote** \[Observasi di Modesy: produk tanpa harga\]: tidak dipakai karena keputusan produk fisik \+ digital biasa  
* **Export** rekap penjualan Vendor ke CSV  
* **Pencarian full-text** Postgres (`tsvector`) \+ saran pencarian  
* **SEO**: metadata dinamis, sitemap, Open Graph per produk (Next.js Metadata API)

## **7\. Role & Permission Matrix**

| Fitur / Aksi | Guest | Member | Vendor |
| ----- | ----- | ----- | ----- |
| Lihat beranda, katalog, kategori, pencarian | ✅ | ✅ | ✅ |
| Lihat detail produk, review, komentar, halaman toko | ✅ | ✅ | ✅ |
| Register / Login | ✅ | — | — |
| Add to Cart / Wishlist | ❌ (diarahkan login) | ✅ | ✅ |
| Checkout & bayar (Midtrans) | ❌ | ✅ | ✅ (tidak boleh beli produk tokonya sendiri) |
| Lihat pesanan sendiri & unduh produk digital yang dibeli | ❌ | ✅ | ✅ |
| Tulis review (setelah beli) / komentar / laporan | ❌ | ✅ | ✅ |
| Kelola profil & alamat sendiri | ❌ | ✅ | ✅ |
| Ajukan diri jadi Vendor ("Sell Now") | ❌ | ✅ | — |
| CRUD produk (fisik & digital) **milik sendiri** | ❌ | ❌ | ✅ |
| Lihat & proses pesanan masuk **tokonya sendiri** | ❌ | ❌ | ✅ |
| Dashboard & rekap penjualan **tokonya sendiri** | ❌ | ❌ | ✅ |
| Balas komentar di produk tokonya | ❌ | ❌ | ✅ |
| Lihat/ubah data toko atau pesanan **vendor lain** | ❌ | ❌ | ❌ |

*Satu akun Vendor \= satu toko \= satu akun Member yang sama (role bertingkat, bukan akun terpisah).*

## **8\. Flow Project**

### **Flow Guest → Member**

1. Guest membuka beranda dan menjelajah katalog/detail produk  
2. Menekan Add to Cart/Wishlist/Checkout → muncul modal/halaman Login  
3. Register (verifikasi email) atau Login  
4. Kembali ke halaman semula; aksi dilanjutkan

### **Flow Checkout & Pembayaran**

1. Member membuka keranjang → sistem validasi stok & harga terbaru  
2. Pilih alamat (jika ada produk fisik) → tinjau ringkasan per toko  
3. Klik Bayar → server membuat order (`pending_payment`) \+ transaksi Midtrans Snap (Sandbox), mengembalikan Snap token  
4. Member menyelesaikan pembayaran di popup Snap  
5. Midtrans mengirim notifikasi ke webhook → server validasi `signature_key` → order `paid`  
6. Fisik: sub-pesanan masuk ke Vendor (`processing`). Digital: produk muncul di My Downloads  
7. Jika tidak dibayar sampai batas waktu → `expired`, stok dikembalikan

### **Flow Vendor: Onboarding & Jualan**

1. Member klik **Sell Now** → isi form toko → role menjadi Vendor  
2. Tambah produk (pilih Fisik/Digital), publish  
3. Pesanan masuk → proses → input resi → status `shipped`  
4. Member konfirmasi diterima → `completed` → Member bisa memberi review  
5. Pantau rekap penjualan di dashboard

### **Flow Produk Digital**

1. Vendor mengunggah file ke bucket privat saat membuat produk  
2. Member membeli dan membayar → order `paid` → otomatis `completed`  
3. Member membuka My Downloads → klik Unduh → server cek kepemilikan \+ status lunas → buat signed URL singkat → file terunduh

## **9\. Data Model (Konseptual)**

**profiles**

* id (= auth.users.id), nama, no\_hp, avatar, role: `member` | `vendor`

**addresses**

* profile\_id, penerima, no\_hp, alamat lengkap, kota/provinsi, kode pos, is\_default

**shops**

* profile\_id (unik), nama, slug, deskripsi, logo, kontak (telp/email/WhatsApp), lokasi, status

**categories** (tiga tingkat)

* parent\_id, nama, slug, ikon/gambar, urutan

**brands**

* nama, slug

**products**

* shop\_id, category\_id, brand\_id (opsional), judul, slug, deskripsi, tipe: `physical` | `digital`  
* harga, harga\_coret, stok (fisik), sku, berat, ongkir\_flat, lokasi\_produk, atribut tambahan (jsonb)  
* status: `draft` | `published` | `archived`, rating\_avg, rating\_count

**product\_images**

* product\_id, path\_storage, urutan

**digital\_files**

* product\_id, path\_storage (bucket privat), nama\_file, ukuran, format

**cart\_items**

* profile\_id, product\_id, qty

**wishlists**

* profile\_id, product\_id

**orders** (induk pembayaran)

* profile\_id, kode\_order, total, status\_pembayaran, midtrans\_order\_id, snap\_token, expired\_at

**order\_items / sub\_orders**

* order\_id, shop\_id, product\_id, snapshot judul & harga, qty, ongkir, status\_fulfilment, nomor\_resi

**payments**

* order\_id, metode, status\_midtrans, gross\_amount, raw\_notification (jsonb), signature\_valid

**download\_logs**

* profile\_id, digital\_file\_id, order\_item\_id, waktu

**reviews**

* product\_id, profile\_id, order\_item\_id, rating, teks

**comments**

* product\_id, profile\_id, parent\_id (balasan), teks

**reports**

* tipe (`product` | `comment`), target\_id, pelapor\_id, alasan, status

## **10\. Platform & Technical Scope**

**Tech Stack (dikonfirmasi):**

* [Next.js](http://next.js/) (App Router) \+ shadcn/ui \+ Supabase  
* Web app responsif, mobile-first  
* Deploy: Vercel

**Pemetaan Supabase:**

* **Supabase Auth** — register/login, verifikasi email, Google OAuth (opsional)  
* **Supabase Postgres** — database utama; **Row Level Security di semua tabel** (Guest hanya `select` data published; Member hanya data miliknya; Vendor hanya data tokonya)  
* **Supabase Storage** — bucket `product-images` (publik), `shop-assets` (publik), `digital-files` (**privat**, akses lewat signed URL dari server)  
* **Supabase Realtime** — notifikasi pesanan baru (opsional)

**Pembayaran:**

* **Midtrans Sandbox** — Snap (client key di browser, **server key hanya di server/env Vercel**)  
* Endpoint webhook: Route Handler Next.js (mis. `/api/midtrans/notification`), URL didaftarkan di dashboard Midtrans Sandbox  
* Pengujian lokal webhook membutuhkan URL publik (preview Vercel atau tunnel)  
* Idempotensi: notifikasi yang sama bisa datang berulang; status hanya boleh maju sesuai urutan yang valid

**Aturan keamanan (wajib):**

* `SUPABASE_SERVICE_ROLE_KEY` dan Midtrans server key **tidak boleh** masuk bundle client  
* Harga/total dihitung ulang di server; abaikan angka dari client  
* Validasi file upload (tipe & ukuran maksimum), nama file di-*sanitize*

**Pustaka pendukung:**

* Recharts (grafik dashboard Vendor, via komponen chart shadcn)  
* Zod \+ React Hook Form (validasi form)  
* Email: Resend/Supabase SMTP *(perlu dikonfirmasi)*

**MVP:**

* Web responsif, mobile-first, browser modern (Chrome, Safari, Firefox, mobile browser)  
* 3 role: Guest, Member, Vendor  
* 7 modul inti aktif  
* Satu mata uang (IDR), satu bahasa (Indonesia)  
* Pembayaran Midtrans **Sandbox** (belum Production)

## **11\. Out of Scope (V1)**

* Panel **Super Admin / Moderator** (moderasi produk, verifikasi vendor, kelola kategori/brand, tangani laporan). V1: dikelola langsung lewat Supabase dashboard/SQL  
* Multi-bahasa & multi-mata uang (Modesy punya EN/AR dan 9 mata uang)  
* Request a Quote  
* Blog, newsletter, RSS  
* Integrasi kurir otomatis & hitung ongkir real-time (mis. RajaOngkir/Biteship)  
* **Pencairan dana otomatis ke Vendor** (payout/split payment); V1 hanya rekap  
* Midtrans **Production** & refund otomatis  
* Aplikasi native iOS/Android  
* Chat/messaging internal Member–Vendor (cukup tombol WhatsApp)  
* Varian produk kompleks (ukuran/warna dengan stok per varian)  
* Sistem dispute/retur

## **12\. Outcome / Success Criteria — Draft**

*Angka-angka di bawah ini draft awal, perlu disepakati agar realistis:*

**Fungsional:**

* Alur lengkap Guest → Register → Checkout → Bayar (Sandbox) → Pesanan `paid` berjalan end-to-end tanpa intervensi manual  
* 100% perubahan status pembayaran berasal dari webhook tervalidasi

**Keamanan & Otorisasi:**

* Tidak ada Vendor yang dapat membaca/mengubah produk atau pesanan toko lain (diuji dengan 2 akun Vendor berbeda)  
* Tidak ada file digital yang dapat diunduh tanpa pesanan lunas milik user tersebut

**Performa & UX:**

* Halaman katalog & detail produk memuat cepat di jaringan mobile (target LCP \< 2,5 dtk)  
* Seluruh alur utama dapat diselesaikan dari HP

**Adopsi (setelah rilis):**

* Jumlah Vendor aktif dengan ≥ 1 produk published  
* Rasio checkout yang berhasil dibayar dibanding yang dibuat

## **13\. Open Questions (Sudah Konfirmasi)**

1. **Role admin**: Auto-Approve Vendor \+ Admin Minimalist via Supabase Studio (Tanpa UI Panel Khusus di V1).  
2. **Komisi & payout**: Komisi Flat Platform (0% atau 5%) \+ Pencairan Manual (Read-Only Balance & Request Payout).   
3. **Varian produk** **Keputusan:** TUNDA ke V1.1 (Gunakan Single-SKU \+ Input Catatan Pembeli).  
   **Alasan Teknis & Bisnis:**  
   Matriks varian (kombinasi warna $\times$ ukuran $\times$ stok individu $\times$ SKU anak) mengubah skema keranjang dan validasi checkout secara drastis. Struktur relasi products \-\> product\_variants \-\> cart\_items rentan terhadap *race condition* stok pada tahap awal.  
4. **Ongkir**: Flat Ongkir per Toko (Bukan per Produk).  
   **Alasan Teknis & Bisnis:** Integrasi API kurir dinamis mewajibkan standardisasi master data wilayah (Kecamatan/Kelurahan ID), data berat/volume akurat di setiap produk, serta handling rumit jika ada kegagalan koneksi API pihak ketiga saat checkout. Sebaliknya, flat ongkir per produk membuat pembeli kabur karena membeli 3 barang dari toko yang sama akan memicu ongkir 3x lipat.  
5. **Login Google**: WAJIB Masuk V1.   
6. **Nama produk/brand** **dan arah visual (logo, warna):** Gunakan Neutral Design System Tokens (CSS Variables).  
7. **Batas unduhan** **produk digital:** Maksimal 5x Unduh ATAU Kadaluwarsa 30 Hari (Mana yang Tercapai Lebih Dulu).  
   **Alasan Teknis & Bisnis:** Memberikan akses *unlimited* tanpa batas berisiko tinggi terhadap:  
* Pembengkakan biaya *egress bandwidth* Supabase Storage.  
* Praktik berbagi akun (*account sharing*) di mana satu link atau akun dipakai ramai-ramai untuk mengunduh aset tanpa henti.

