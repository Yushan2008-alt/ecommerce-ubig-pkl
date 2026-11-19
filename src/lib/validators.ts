import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const verifyOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  code: z.string().length(6, 'Kode OTP harus 6 digit angka').regex(/^\d+$/, 'Kode OTP harus berupa angka'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password baru minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const VendorApplicationSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter').max(60, 'Nama toko maksimal 60 karakter'),
  slug: z
    .string()
    .min(2, 'Slug toko minimal 2 karakter')
    .max(60, 'Slug toko maksimal 60 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan strip (-)'),
  phone: z
    .string()
    .regex(
      /^(?:(?:08|\+?628)\d{8,13}|(?:\+?60|\+?65)\d{7,12})$/,
      'Nomor telepon harus diawali 08 dan minimal 10 digit angka (contoh: 081234567890)'
    ),
  pickup_address: z.string().min(5, 'Alamat pengambilan minimal 5 karakter'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  city: z.string().min(2, 'Kota wajib diisi'),
  district: z.string().min(1, 'Kecamatan wajib diisi'),
  village: z.string().min(1, 'Desa / Kelurahan wajib diisi'),
  postal_code: z.string().min(3, 'Kode pos minimal 3 digit'),
  couriers: z.array(z.string()).min(1, 'Pilih minimal 1 jasa kirim ekspedisi'),
  bank_name: z.string().min(2, 'Nama bank wajib dipilih'),
  bank_account_number: z.string().min(4, 'Nomor rekening minimal 4 digit').max(30),
  bank_account_holder: z.string().min(2, 'Nama pemilik rekening minimal 2 karakter'),
})

export const FirstProductSchema = z.object({
  title: z.string().min(3, 'Nama produk minimal 3 karakter').max(120),
  slug: z.string().min(3, 'Slug minimal 3 karakter').max(120),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  price: z.number().min(1000, 'Harga minimal Rp 1.000'),
  stock: z.number().int().min(1, 'Stok minimal 1 item'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  images: z.array(z.string()).min(1, 'Unggah minimal 1 foto produk'),
})

export const BecomeVendorSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter').max(60, 'Nama toko maksimal 60 karakter'),
  slug: z
    .string()
    .min(2, 'Slug toko minimal 2 karakter')
    .max(60, 'Slug toko maksimal 60 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan strip (-)'),
  category: z.string().optional().nullable(),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional().nullable(),
  logo_url: z.string().url('URL logo tidak valid').optional().nullable(),
  flat_shipping_cost: z.number().min(0, 'Ongkir tidak boleh negatif').default(0),
  whatsapp: z.string().max(20, 'Nomor WhatsApp terlalu panjang').optional().nullable(),
  phone: z.string().max(20, 'Nomor telepon terlalu panjang').optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable(),
  city: z.string().max(100, 'Nama kota terlalu panjang').optional().nullable(),
  province: z.string().max(100, 'Nama provinsi terlalu panjang').optional().nullable(),
})

export const ProductFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['physical', 'digital']),
  title: z.string().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  slug: z.string().min(3, 'Slug minimal 3 karakter').max(120),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  brandId: z.string().optional().nullable(),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  comparePrice: z.number().min(0).optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  sku: z.string().max(50).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  weight: z.number().min(0).default(0),
  flatShippingCost: z.number().min(0).default(0),
  productLocation: z.string().max(100).optional().nullable(),
  attributes: z.record(z.string(), z.string()).optional().default({}),
  digitalFile: z
    .object({
      path: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      format: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  images: z.array(z.string()).default([]),
})

export const PayoutSchema = z.object({
  amount: z.number().min(10000, 'Minimal penarikan dana adalah Rp 10.000'),
  bankName: z.string().min(2, 'Nama bank wajib dipilih'),
  accountNo: z.string().min(5, 'Nomor rekening minimal 5 digit'),
  accountHolder: z.string().min(3, 'Nama pemilik rekening minimal 3 karakter'),
})

export const ShopSettingsSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  flatShippingCost: z.number().min(0).default(0),
  whatsapp: z.string().max(20).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  bankAccountNumber: z.string().max(50).optional().nullable(),
  bankAccountHolder: z.string().max(100).optional().nullable(),
})

export const ReviewSchema = z.object({
  orderItemId: z.string().uuid(),
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional().nullable(),
})

export const CommentSchema = z.object({
  productId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  body: z.string().min(2, 'Pertanyaan minimal 2 karakter').max(1000, 'Maksimal 1000 karakter'),
})

export const ReportSchema = z.object({
  targetType: z.enum(['product', 'comment']),
  targetId: z.string().uuid(),
  reason: z.string().min(5, 'Alasan pelaporan minimal 5 karakter').max(500, 'Alasan maksimal 500 karakter'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VendorApplicationInput = z.infer<typeof VendorApplicationSchema>
export type FirstProductInput = z.infer<typeof FirstProductSchema>
export type BecomeVendorInput = z.infer<typeof BecomeVendorSchema>
export type ProductFormInput = z.infer<typeof ProductFormSchema>
export type PayoutInput = z.infer<typeof PayoutSchema>
export type ShopSettingsInput = z.infer<typeof ShopSettingsSchema>
export type ReviewInput = z.infer<typeof ReviewSchema>
export type CommentInput = z.infer<typeof CommentSchema>
export type ReportInput = z.infer<typeof ReportSchema>
