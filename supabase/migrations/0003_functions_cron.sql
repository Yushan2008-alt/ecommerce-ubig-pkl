-- ==============================================================================
-- 0003_functions_cron.sql
-- Logika Transaksional Kritis (Postgres RPC) & Automasi pg_cron
-- ==============================================================================

-- 1. BECOME VENDOR (Onboarding Toko Baru - Auto-approved)
create or replace function public.become_vendor(
  p_name text,
  p_slug text,
  p_description text default null,
  p_logo_url text default null,
  p_flat_shipping_cost numeric default 0,
  p_whatsapp text default null,
  p_phone text default null,
  p_email text default null,
  p_city text default null,
  p_province text default null
)
returns public.shops as $$
declare
  v_uid uuid := auth.uid();
  v_shop public.shops;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  -- Buat baris toko baru
  insert into public.shops (
    profile_id, name, slug, description, logo_url,
    flat_shipping_cost, whatsapp, phone, email, city, province, status
  )
  values (
    v_uid, p_name, p_slug, p_description, p_logo_url,
    coalesce(p_flat_shipping_cost, 0), p_whatsapp, p_phone, p_email, p_city, p_province, 'active'
  )
  returning * into v_shop;

  -- Update role profil menjadi vendor
  update public.profiles
  set role = 'vendor'
  where id = v_uid;

  return v_shop;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.become_vendor from public, anon;
grant execute on function public.become_vendor to authenticated;

-- 2. CREATE ORDER (Transaksi Atomik Checkout)
create or replace function public.create_order(
  p_address_id uuid default null,
  p_platform_commission_percent numeric default 5
)
returns table (
  order_id uuid,
  order_code text,
  total_amount numeric,
  order_status public.order_status,
  is_free boolean
) as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_new_order_id uuid;
  v_shipping_addr jsonb := null;
  v_has_physical boolean := false;
  v_subtotal numeric := 0;
  v_total_shipping numeric := 0;
  v_grand_total numeric := 0;
  v_cart_count int;
  r_cart record;
  r_shop record;
  v_item_subtotal numeric;
  v_comm numeric;
  v_net numeric;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  -- Cek isi keranjang
  select count(*) into v_cart_count from public.cart_items where profile_id = v_uid;
  if v_cart_count = 0 then
    raise exception 'Keranjang belanja kosong';
  end if;

  -- Kunci baris produk dengan SELECT ... FOR UPDATE untuk mencegah race condition stok
  perform p.id
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.profile_id = v_uid
  for update of p;

  -- Validasi produk di keranjang (status published, kepemilikan toko, dan stok fisik)
  for r_cart in (
    select
      ci.product_id,
      ci.qty,
      ci.buyer_note,
      p.title,
      p.price,
      p.compare_price,
      p.type,
      p.stock,
      p.status,
      p.shop_id,
      s.profile_id as vendor_profile_id,
      s.flat_shipping_cost
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    join public.shops s on s.id = p.shop_id
    where ci.profile_id = v_uid
  ) loop
    if r_cart.status != 'published' then
      raise exception 'Produk "%" saat ini tidak tersedia', r_cart.title;
    end if;

    if r_cart.vendor_profile_id = v_uid then
      raise exception 'Anda tidak dapat membeli produk dari toko Anda sendiri';
    end if;

    if r_cart.type = 'physical' then
      v_has_physical := true;
      if r_cart.stock is null or r_cart.stock < r_cart.qty then
        raise exception 'Stok untuk produk "%" tidak mencukupi (sisa: %)', r_cart.title, coalesce(r_cart.stock, 0);
      end if;
    end if;

    v_subtotal := v_subtotal + (r_cart.price * r_cart.qty);
  end loop;

  -- Jika ada produk fisik, alamat wajib diisi
  if v_has_physical then
    if p_address_id is null then
      raise exception 'Alamat pengiriman wajib dipilih untuk pesanan produk fisik';
    end if;

    select to_jsonb(a.*) into v_shipping_addr
    from public.addresses a
    where a.id = p_address_id and a.profile_id = v_uid;

    if v_shipping_addr is null then
      raise exception 'Alamat pengiriman tidak valid';
    end if;
  end if;

  -- Hitung ongkir flat per toko (hanya jika toko tersebut memiliki minimal 1 produk fisik)
  for r_shop in (
    select
      p.shop_id,
      s.flat_shipping_cost,
      bool_or(p.type = 'physical') as has_physical_in_shop
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    join public.shops s on s.id = p.shop_id
    where ci.profile_id = v_uid
    group by p.shop_id, s.flat_shipping_cost
  ) loop
    if r_shop.has_physical_in_shop then
      v_total_shipping := v_total_shipping + coalesce(r_shop.flat_shipping_cost, 0);
    end if;
  end loop;

  v_grand_total := v_subtotal + v_total_shipping;

  -- Generate order code unik (ORD-<timestamp>-<random_hex>)
  v_code := 'ORD-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substr(md5(random()::text), 1, 4));

  -- Insert baris order induk
  insert into public.orders (
    profile_id, code, status, total, shipping_address,
    expires_at, paid_at
  )
  values (
    v_uid,
    v_code,
    case when v_grand_total = 0 then 'paid'::public.order_status else 'pending_payment'::public.order_status end,
    v_grand_total,
    v_shipping_addr,
    case when v_grand_total = 0 then null else now() + interval '24 hours' end,
    case when v_grand_total = 0 then now() else null end
  )
  returning id into v_new_order_id;

  -- Insert order_items snapshot dan kurangi stok fisik
  for r_cart in (
    select
      ci.product_id,
      ci.qty,
      ci.buyer_note,
      p.title,
      p.price,
      p.compare_price,
      p.type,
      p.shop_id,
      s.flat_shipping_cost
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    join public.shops s on s.id = p.shop_id
    where ci.profile_id = v_uid
  ) loop
    v_item_subtotal := r_cart.price * r_cart.qty;
    v_comm := round(v_item_subtotal * (coalesce(p_platform_commission_percent, 5) / 100.0), 0);
    v_net := v_item_subtotal - v_comm;

    insert into public.order_items (
      order_id, shop_id, product_id, title, price, compare_price,
      qty, shipping_cost, commission_amount, net_amount, buyer_note,
      fulfilment_status,
      download_expires_at
    )
    values (
      v_new_order_id,
      r_cart.shop_id,
      r_cart.product_id,
      r_cart.title,
      r_cart.price,
      r_cart.compare_price,
      r_cart.qty,
      0, -- ongkir dialokasikan di level pesanan
      v_comm,
      v_net,
      r_cart.buyer_note,
      case
        when v_grand_total = 0 and r_cart.type = 'digital' then 'completed'::public.fulfilment_status
        else 'waiting'::public.fulfilment_status
      end,
      case
        when v_grand_total = 0 and r_cart.type = 'digital' then now() + interval '30 days'
        else null
      end
    );

    -- Kurangi stok untuk produk fisik
    if r_cart.type = 'physical' then
      update public.products
      set stock = stock - r_cart.qty
      where id = r_cart.product_id;
    end if;
  end loop;

  -- Kosongkan keranjang belanja
  delete from public.cart_items where profile_id = v_uid;

  return query
  select
    v_new_order_id,
    v_code,
    v_grand_total,
    case when v_grand_total = 0 then 'paid'::public.order_status else 'pending_payment'::public.order_status end,
    (v_grand_total = 0);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.create_order from public, anon;
grant execute on function public.create_order to authenticated;

-- 3. APPLY PAYMENT STATUS (Webhook Handler Midtrans Idempotent)
create or replace function public.apply_payment_status(
  p_code text,
  p_status text,
  p_gross numeric,
  p_type text default null,
  p_raw jsonb default '{}'::jsonb
)
returns boolean as $$
declare
  v_order public.orders;
  v_target_status public.order_status;
begin
  -- Kunci baris order
  select * into v_order
  from public.orders
  where code = p_code
  for update;

  if v_order.id is null then
    raise exception 'Order dengan kode % tidak ditemukan', p_code;
  end if;

  -- Catat log pembayaran
  insert into public.payments (
    order_id, payment_type, midtrans_status, gross_amount, raw, signature_valid
  )
  values (
    v_order.id, p_type, p_status, p_gross, p_raw, true
  );

  -- Validasi jumlah pembayaran
  if round(v_order.total) != round(p_gross) then
    raise exception 'Gross amount mismatch: order %, notification %', v_order.total, p_gross;
  end if;

  -- Pemetaan status Midtrans
  if p_status = 'paid' then
    v_target_status := 'paid';
  elsif p_status = 'expired' then
    v_target_status := 'expired';
  elsif p_status = 'cancelled' then
    v_target_status := 'cancelled';
  else
    return true; -- Status pending/lainnya tidak merubah state
  end if;

  -- Idempotency check: Jangan ubah order yang sudah lunas/selesai
  if v_order.status = 'paid' and v_target_status != 'paid' then
    return true;
  end if;

  if v_order.status in ('expired', 'cancelled') then
    return true;
  end if;

  -- Eksekusi perubahan status
  if v_target_status = 'paid' then
    update public.orders
    set
      status = 'paid',
      paid_at = coalesce(paid_at, now())
    where id = v_order.id;

    -- Update item digital langsung completed dan aktifkan masa unduh 30 hari
    update public.order_items oi
    set
      fulfilment_status = 'completed',
      download_expires_at = now() + interval '30 days'
    from public.products p
    where oi.order_id = v_order.id
      and oi.product_id = p.id
      and p.type = 'digital';

  elsif v_target_status in ('expired', 'cancelled') then
    update public.orders
    set status = v_target_status
    where id = v_order.id;

    -- Kembalikan stok produk fisik
    update public.products p
    set stock = coalesce(p.stock, 0) + oi.qty
    from public.order_items oi
    where oi.order_id = v_order.id
      and oi.product_id = p.id
      and p.type = 'physical';
  end if;

  return true;
end;
$$ language plpgsql security definer set search_path = public;

-- Khusus dipanggil oleh webhook (service_role)
revoke execute on function public.apply_payment_status from public, anon, authenticated;

-- 4. EXPIRE PENDING ORDERS (Dipanggil oleh pg_cron)
create or replace function public.expire_pending_orders()
returns int as $$
declare
  r_order record;
  v_count int := 0;
begin
  for r_order in (
    select id from public.orders
    where status = 'pending_payment'
      and expires_at is not null
      and expires_at < now()
  ) loop
    -- Kembalikan stok produk fisik
    update public.products p
    set stock = coalesce(p.stock, 0) + oi.qty
    from public.order_items oi
    where oi.order_id = r_order.id
      and oi.product_id = p.id
      and p.type = 'physical';

    -- Tandai expired
    update public.orders
    set status = 'expired'
    where id = r_order.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$ language plpgsql security definer set search_path = public;

-- 5. AUTO COMPLETE ORDERS (Dipanggil oleh pg_cron)
create or replace function public.auto_complete_orders()
returns int as $$
declare
  v_updated int;
begin
  update public.order_items
  set
    fulfilment_status = 'completed',
    updated_at = now()
  where fulfilment_status = 'shipped'
    and updated_at < now() - interval '7 days';

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$ language plpgsql security definer set search_path = public;

-- 6. CONSUME DOWNLOAD (Klaim Unduhan Digital Atomik)
create or replace function public.consume_download(p_item_id uuid)
returns table (
  storage_path text,
  file_name text,
  remaining_downloads int
) as $$
declare
  v_uid uuid := auth.uid();
  v_item public.order_items;
  v_order public.orders;
  v_file public.digital_files;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  -- Kunci item pesanan
  select oi.* into v_item
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = p_item_id and o.profile_id = v_uid
  for update;

  if v_item.id is null then
    raise exception 'Item pesanan tidak ditemukan atau bukan milik Anda';
  end if;

  select * into v_order from public.orders where id = v_item.order_id;
  if v_order.status != 'paid' then
    raise exception 'Pesanan belum lunas';
  end if;

  -- Validasi batas unduhan (maks 5x)
  if v_item.downloads_count >= 5 then
    raise exception 'Batas maksimum unduhan (5 kali) telah tercapai';
  end if;

  -- Validasi kedaluwarsa waktu (30 hari)
  if v_item.download_expires_at is not null and now() > v_item.download_expires_at then
    raise exception 'Masa aktif unduhan (30 hari) telah berakhir';
  end if;

  -- Ambil data file digital
  select * into v_file from public.digital_files where product_id = v_item.product_id limit 1;
  if v_file.id is null then
    raise exception 'Aset berkas digital belum diunggah oleh vendor';
  end if;

  -- Naikkan counter unduhan secara atomik
  update public.order_items
  set downloads_count = downloads_count + 1
  where id = v_item.id;

  -- Catat audit log unduhan
  insert into public.download_logs (order_item_id, profile_id)
  values (v_item.id, v_uid);

  return query
  select
    v_file.path,
    v_file.file_name,
    (5 - (v_item.downloads_count + 1));
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.consume_download from public, anon;
grant execute on function public.consume_download to authenticated;

-- 7. VENDOR UPDATE FULFILMENT (Proses & Resi Pengiriman Fisik)
create or replace function public.vendor_update_fulfilment(
  p_item_id uuid,
  p_status public.fulfilment_status,
  p_tracking text default null
)
returns boolean as $$
declare
  v_uid uuid := auth.uid();
  v_item public.order_items;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  -- Pastikan vendor adalah pemilik toko yang bersangkutan
  select oi.* into v_item
  from public.order_items oi
  join public.shops s on s.id = oi.shop_id
  where oi.id = p_item_id and s.profile_id = v_uid
  for update;

  if v_item.id is null then
    raise exception 'Item tidak ditemukan atau Anda tidak memiliki akses ke toko ini';
  end if;

  update public.order_items
  set
    fulfilment_status = p_status,
    tracking_number = coalesce(p_tracking, tracking_number),
    updated_at = now()
  where id = p_item_id;

  return true;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.vendor_update_fulfilment from public, anon;
grant execute on function public.vendor_update_fulfilment to authenticated;

-- 8. CONFIRM RECEIVED (Konfirmasi Pesanan Diterima oleh Pembeli)
create or replace function public.confirm_received(p_item_id uuid)
returns boolean as $$
declare
  v_uid uuid := auth.uid();
  v_item public.order_items;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  select oi.* into v_item
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.id = p_item_id and o.profile_id = v_uid
  for update;

  if v_item.id is null then
    raise exception 'Item tidak ditemukan atau bukan milik Anda';
  end if;

  if v_item.fulfilment_status != 'shipped' then
    raise exception 'Hanya pesanan yang sedang dikirim yang dapat dikonfirmasi';
  end if;

  update public.order_items
  set
    fulfilment_status = 'completed',
    updated_at = now()
  where id = p_item_id;

  return true;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.confirm_received from public, anon;
grant execute on function public.confirm_received to authenticated;

-- 9. REQUEST PAYOUT (Pengajuan Penarikan Saldo Bersih Toko)
create or replace function public.request_payout(
  p_amount numeric,
  p_bank_name text,
  p_account_no text,
  p_account_holder text
)
returns public.payout_requests as $$
declare
  v_uid uuid := auth.uid();
  v_shop_id uuid;
  v_completed_net numeric := 0;
  v_pending_paid_payouts numeric := 0;
  v_available_balance numeric := 0;
  v_req public.payout_requests;
begin
  if v_uid is null then
    raise exception 'Unauthorized';
  end if;

  if p_amount <= 0 then
    raise exception 'Nominal penarikan harus lebih dari 0';
  end if;

  -- Ambil toko vendor
  select id into v_shop_id from public.shops where profile_id = v_uid;
  if v_shop_id is null then
    raise exception 'Anda belum memiliki toko terdaftar';
  end if;

  -- Hitung total pendapatan bersih dari item yang statusnya completed
  select coalesce(sum(net_amount), 0) into v_completed_net
  from public.order_items
  where shop_id = v_shop_id and fulfilment_status = 'completed';

  -- Hitung total penarikan yang sedang pending atau sudah paid
  select coalesce(sum(amount), 0) into v_pending_paid_payouts
  from public.payout_requests
  where shop_id = v_shop_id and status in ('pending', 'paid');

  v_available_balance := v_completed_net - v_pending_paid_payouts;

  if p_amount > v_available_balance then
    raise exception 'Saldo tidak mencukupi. Saldo tersedia: Rp %, Pengajuan: Rp %', v_available_balance, p_amount;
  end if;

  insert into public.payout_requests (
    shop_id, amount, bank_name, account_no, account_holder, status
  )
  values (
    v_shop_id, p_amount, p_bank_name, p_account_no, p_account_holder, 'pending'
  )
  returning * into v_req;

  return v_req;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.request_payout from public, anon;
grant execute on function public.request_payout to authenticated;

-- ==============================================================================
-- 10. PG_CRON SCHEDULING (Dijalankan jika pg_cron aktif)
-- ==============================================================================
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Hapus job lama jika ada agar idempotent
    perform cron.unschedule('expire-orders') where exists (select 1 from cron.job where jobname = 'expire-orders');
    perform cron.unschedule('auto-complete') where exists (select 1 from cron.job where jobname = 'auto-complete');

    -- Schedule pembersihan pesanan kedaluwarsa tiap 10 menit
    perform cron.schedule('expire-orders', '*/10 * * * *', 'select public.expire_pending_orders()');

    -- Schedule auto-complete pesanan fisik > 7 hari tiap jam
    perform cron.schedule('auto-complete', '0 * * * *', 'select public.auto_complete_orders()');
  end if;
exception
  when others then
    raise notice 'pg_cron belum aktif atau tidak dapat dijadwalkan langsung: %', sqlerrm;
end;
$$;
