'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  Printer,
  Sparkles,
  MapPin,
  Truck,
  Building2,
  CreditCard,
  QrCode,
  RefreshCw,
  Clock,
  Check,
  ShoppingBag,
  Download,
  FileCode,
  Package,
  FileText,
  Plus,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import { useCartWishlist } from '@/context/cart-wishlist-context'
import { getAddressesAction, AddressItem } from '@/actions/address'
import { getCartWithDetails, ShopCartGroup } from '@/actions/cart'
import {
  createMarketplaceOrderAction,
  requestBankVaPaymentAction,
  checkAndSyncPaymentStatusAction,
  confirmOrderPaymentAction,
  getOrderDetailsAction,
  getOrCreateSnapTokenAction,
  MarketplaceOrderItemPayload,
} from '@/actions/order'
import { consumeDownloadAction } from '@/actions/download'
import { AddressModal } from '@/components/account/address-modal'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    snap?: any
  }
}

const SHIPPING_OPTIONS = [
  {
    id: 'reguler',
    courier: 'J&T Express / Krafita Express',
    name: 'Pengiriman Reguler',
    cost: 15000,
    estimatedDays: '2 - 3 Hari',
  },
  {
    id: 'instant',
    courier: 'GoSend / GrabExpress',
    name: 'Pengiriman Kilat / Instant',
    cost: 25000,
    estimatedDays: '1 - 2 Hari',
  },
  {
    id: 'hemat',
    courier: 'JNE OKE / SiCepat HALU',
    name: 'Pengiriman Hemat',
    cost: 10000,
    estimatedDays: '3 - 5 Hari',
  },
]

const BANK_OPTIONS = [
  {
    id: 'bca',
    name: 'BCA Virtual Account',
    code: 'BCA',
    simulatorUrl: 'https://simulator.sandbox.midtrans.com/bca/va',
  },
  {
    id: 'mandiri',
    name: 'Mandiri Bill Payment',
    code: 'MANDIRI',
    simulatorUrl: 'https://simulator.sandbox.midtrans.com/mandiri/bill',
  },
  {
    id: 'bni',
    name: 'BNI Virtual Account',
    code: 'BNI',
    simulatorUrl: 'https://simulator.sandbox.midtrans.com/bni/va',
  },
  {
    id: 'bri',
    name: 'BRI Virtual Account (BRIVA)',
    code: 'BRI',
    simulatorUrl: 'https://simulator.sandbox.midtrans.com/bri/va',
  },
  {
    id: 'permata',
    name: 'Permata Virtual Account',
    code: 'PERMATA',
    simulatorUrl: 'https://simulator.sandbox.midtrans.com/permata/va',
  },
]

// Fallback items untuk demo marketplace jika keranjang kosong
const DEMO_ITEMS: MarketplaceOrderItemPayload[] = [
  {
    productId: 'demo-phys-1',
    title: 'Kemeja Katun Linen Premium Pria (Navy Blue, L)',
    price: 185000,
    qty: 1,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    shopId: 'shop-1',
    shopName: 'Krafita Official Apparel',
    type: 'physical',
    buyerNote: 'Tolong pastikan ukuran L tidak kekecilan ya kak.',
  },
  {
    productId: 'demo-digi-1',
    title: 'Template UI/UX E-Commerce Mobile App (Figma + Asset Kit)',
    price: 120000,
    qty: 1,
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&q=80',
    shopId: 'shop-2',
    shopName: 'DesignPro Digital Hub',
    type: 'digital',
    buyerNote: 'Kirimkan lisensi komersial ke email terdaftar.',
  },
]

function CheckoutWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 4 Steps: 1: Detail Order & Pengiriman -> 2: Konfirmasi -> 3: Pembayaran -> 4: Status Transaksi & Unduhan
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [pageLoading, setPageLoading] = useState(true)

  // Direct buy parameter support
  const isBuyNow = searchParams.get('buyNow') === 'true'
  const queryProductId = searchParams.get('productId')
  const queryTitle = searchParams.get('title')
  const queryPrice = searchParams.get('price') ? Number(searchParams.get('price')) : null
  const queryType = (searchParams.get('type') as 'physical' | 'digital') || 'physical'

  // Data Barang Checkout
  const [checkoutItems, setCheckoutItems] = useState<MarketplaceOrderItemPayload[]>([])
  const [buyerNotes, setBuyerNotes] = useState<Record<string, string>>({})

  // Data Alamat Pengiriman
  const [addresses, setAddresses] = useState<AddressItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [quickAddress, setQuickAddress] = useState({
    recipientName: 'Hakim',
    phone: '085675246745',
    addressLine: 'Jl. Kemang Raya No. 18, RT 02 / RW 05',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12730',
  })

  // Pilihan Ekspedisi
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0])

  // Order Tercipta
  const [orderId, setOrderId] = useState<string>('')
  const [orderCode, setOrderCode] = useState<string>('')
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  // Step 3 Payment States
  const [paymentTab, setPaymentTab] = useState<'snap' | 'qris' | 'va'>('snap')
  const [isSnapLoaded, setIsSnapLoaded] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string>('bca')
  const [vaData, setVaData] = useState<{
    vaNumber?: string
    billerCode?: string
    billKey?: string
    simulatorUrl?: string
  } | null>({
    vaNumber: '55040884893457780391174',
    simulatorUrl: 'https://simulator.sandbox.midtrans.com/bca/va',
  })
  const [isRequestingVa, setIsRequestingVa] = useState(false)
  const [isSyncingPayment, setIsSyncingPayment] = useState(false)
  const [paymentConfirmedAt, setPaymentConfirmedAt] = useState<string | null>(null)

  // Step 4 Digital Download State
  const [orderDetailData, setOrderDetailData] = useState<any>(null)
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null)

  // Polling ref untuk Auto-sync & Snap Embed Ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const snapContainerRef = useRef<HTMLDivElement>(null)
  const snapEmbeddedTokenRef = useRef<string | null>(null)

  // Deteksi apakah ada produk fisik
  const hasPhysicalItems = checkoutItems.some((item) => item.type === 'physical')
  const hasDigitalItems = checkoutItems.some((item) => item.type === 'digital')

  // Hitung Biaya Transaksi
  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0)
  const shippingCost = hasPhysicalItems ? selectedShipping.cost : 0
  const serviceFee = 1000 // Biaya Layanan Krafita Rp 1.000
  const grandTotal = subtotal + shippingCost + serviceFee

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // 1. Inisialisasi Data: Alamat & Produk Keranjang
  useEffect(() => {
    async function initCheckout() {
      setPageLoading(true)
      try {
        // Ambil alamat pengguna
        const addrRes = await getAddressesAction()
        if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
          setAddresses(addrRes.data)
          const def = addrRes.data.find((a) => a.isDefault) || addrRes.data[0]
          setSelectedAddress(def)
        }

        // Cek jika direct buy dari parameter URL
        if (isBuyNow && queryProductId && queryTitle && queryPrice) {
          setCheckoutItems([
            {
              productId: queryProductId,
              title: queryTitle,
              price: queryPrice,
              qty: 1,
              imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
              shopId: 'shop-direct',
              shopName: 'Official Merchant Krafita',
              type: queryType,
              buyerNote: '',
            },
          ])
        } else {
          // Ambil keranjang belanja
          const cartRes = await getCartWithDetails()
          if (cartRes.success && cartRes.data && cartRes.data.groups.length > 0) {
            const flattened: MarketplaceOrderItemPayload[] = []
            cartRes.data.groups.forEach((g) => {
              g.items.forEach((it) => {
                flattened.push({
                  productId: it.productId,
                  title: it.title,
                  price: it.price,
                  qty: it.qty,
                  imageUrl: it.imageUrl,
                  shopId: g.shopId,
                  shopName: g.shopName,
                  type: it.type,
                  buyerNote: it.buyerNote || '',
                })
              })
            })
            setCheckoutItems(flattened)
          } else {
            // Gunakan item demo jika keranjang kosong agar pengguna dapat langsung menguji
            setCheckoutItems(DEMO_ITEMS)
          }
        }
      } catch (err) {
        console.error('Checkout init error:', err)
        setCheckoutItems(DEMO_ITEMS)
      } finally {
        setPageLoading(false)
      }
    }

    initCheckout()
  }, [isBuyNow, queryProductId, queryTitle, queryPrice, queryType])

  // Polling Auto-Sync Status Pembayaran saat berada di Step 3
  useEffect(() => {
    if (step === 3 && orderCode) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await checkAndSyncPaymentStatusAction(orderCode)
          if (res.success && res.isPaid) {
            if (pollingRef.current) clearInterval(pollingRef.current)
            setPaymentConfirmedAt(res.paidAt || new Date().toISOString())
            toast.success('Pembayaran Terverifikasi! Membuka Nota & Akses Pesanan...')
            // Ambil rincian pesanan untuk Step 4
            if (orderId) {
              const det = await getOrderDetailsAction(orderId)
              if (det.success) setOrderDetailData(det.data)
            }
            setStep(4)
          }
        } catch (e) {
          console.warn('[Auto-Sync Poll Exception]', e)
        }
      }, 3000)
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [step, orderCode, orderId])

  // Effect untuk Embed Midtrans Snap langsung di halaman (tanpa popup modal)
  useEffect(() => {
    let isMounted = true
    if (step === 3) {
      const initSnapEmbed = async () => {
        let currentToken = snapToken
        // Jika snapToken belum ada tetapi orderCode ada, ambil/buat snapToken
        if (!currentToken && orderCode) {
          const res = await getOrCreateSnapTokenAction(orderCode)
          if (res.success && res.snapToken) {
            currentToken = res.snapToken
            if (isMounted) setSnapToken(res.snapToken)
          }
        }

        if (!currentToken) return

        // Jika sudah pernah di-embed untuk token yang sama, jangan embed ulang
        if (snapEmbeddedTokenRef.current === currentToken) {
          if (isMounted) setIsSnapLoaded(true)
          return
        }

        const tryEmbed = (attempt = 0) => {
          if (!isMounted) return
          if (typeof window !== 'undefined' && (window as any).snap && typeof (window as any).snap.embed === 'function') {
            const container = snapContainerRef.current || document.getElementById('snap-embed-container')
            if (container) {
              // Bersihkan hanya elemen anak asing tanpa menyentuh virtual DOM React
              while (container.firstChild) {
                container.removeChild(container.firstChild)
              }
              try {
                ;(window as any).snap.embed(currentToken, {
                  embedId: 'snap-embed-container',
                  onSuccess: function () {
                    toast.success('Pembayaran Berhasil Diverifikasi!')
                    handleManualCheckStatus()
                  },
                  onPending: function () {
                    toast.info('Transaksi dibuat, menunggu pembayaran Anda.')
                  },
                  onError: function () {
                    toast.error('Pembayaran gagal atau dibatalkan.')
                  },
                  onClose: function () {
                    // embed mode
                  },
                })
                snapEmbeddedTokenRef.current = currentToken
                if (isMounted) setIsSnapLoaded(true)
              } catch (err) {
                console.warn('[Snap Embed Error]', err)
              }
            }
          } else if (attempt < 20) {
            setTimeout(() => tryEmbed(attempt + 1), 300)
          }
        }

        tryEmbed()
      }

      initSnapEmbed()
    }

    return () => {
      isMounted = false
    }
  }, [step, snapToken, orderCode])

  // Handler Lanjut dari Step 1 ke Step 2
  const handleProceedToStep2 = () => {
    if (hasPhysicalItems) {
      if (!selectedAddress && (!quickAddress.recipientName || !quickAddress.addressLine || !quickAddress.city)) {
        toast.error('Harap lengkapi alamat pengiriman untuk produk fisik!')
        return
      }
    }

    if (checkoutItems.length === 0) {
      toast.error('Tidak ada produk dalam pesanan.')
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(2)
  }

  // Handler Lanjut dari Step 2 ke Step 3 (Bayar Sekarang)
  const handleProceedToPayment = async () => {
    setIsCreatingOrder(true)
    try {
      const activeAddress = selectedAddress
        ? {
            recipientName: selectedAddress.recipientName,
            phone: selectedAddress.phone,
            addressLine: selectedAddress.addressLine,
            city: selectedAddress.city,
            province: selectedAddress.province,
            postalCode: selectedAddress.postalCode,
          }
        : hasPhysicalItems
        ? quickAddress
        : null

      const itemsWithNotes = checkoutItems.map((item) => ({
        ...item,
        buyerNote: buyerNotes[item.productId] || item.buyerNote || undefined,
      }))

      const res = await createMarketplaceOrderAction({
        items: itemsWithNotes,
        shippingAddress: activeAddress,
        shippingOption: hasPhysicalItems ? selectedShipping : null,
        hasPhysicalItems,
      })

      if (res.success && res.orderCode) {
        setOrderId(res.orderId || '')
        setOrderCode(res.orderCode)
        if (res.snapToken) setSnapToken(res.snapToken)

        // Set tab default ke Midtrans Snap Embed
        setPaymentTab('snap')
        toast.success('Pesanan dibuat. Silakan selesaikan pembayaran.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setStep(3)
      } else {
        toast.error(res.error || 'Gagal membuat pesanan')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem saat membuat pesanan')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  // Handler Pilih Bank Virtual Account
  const handleSelectBank = async (bankId: string, currentCode = orderCode) => {
    setSelectedBank(bankId)
    setIsRequestingVa(true)
    try {
      const res = await requestBankVaPaymentAction(currentCode, bankId as any)
      if (res.success) {
        setVaData({
          vaNumber: res.vaNumber || res.billKey,
          billerCode: res.billerCode,
          billKey: res.billKey,
          simulatorUrl: res.simulatorUrl,
        })
      } else {
        const fallbackPrefix = bankId === 'bca' ? '55040' : bankId === 'bni' ? '988' : '888'
        setVaData({
          vaNumber: `${fallbackPrefix}${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          simulatorUrl: `https://simulator.sandbox.midtrans.com/${bankId}/va`,
        })
      }
    } catch {
      setVaData({
        vaNumber: `55040${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        simulatorUrl: `https://simulator.sandbox.midtrans.com/${bankId}/va`,
      })
    } finally {
      setIsRequestingVa(false)
    }
  }

  const handleCopy = (text: string, label = 'Nomor') => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} disalin ke papan klip!`)
  }

  // Handler Manual Cek Status Pembayaran
  const handleManualCheckStatus = async () => {
    setIsSyncingPayment(true)
    try {
      const res = await checkAndSyncPaymentStatusAction(orderCode)
      if (res.success && res.isPaid) {
        setPaymentConfirmedAt(res.paidAt || new Date().toISOString())
        toast.success('Pembayaran Terverifikasi! Membuka Nota...')
        if (orderId) {
          const det = await getOrderDetailsAction(orderId)
          if (det.success) setOrderDetailData(det.data)
        }
        setStep(4)
      } else {
        toast.info('Status pembayaran masih MENUNGGU di Midtrans Simulator. Silakan bayar terlebih dahulu di simulator!')
      }
    } catch {
      toast.error('Gagal mengecek status pembayaran')
    } finally {
      setIsSyncingPayment(false)
    }
  }

  // Handler Simulasi Berhasil Instan (Helper Developer & Tester)
  const handleInstantConfirmTest = async () => {
    if (!orderId) {
      toast.error('ID Pesanan belum terbuat')
      return
    }
    setIsSyncingPayment(true)
    try {
      const res = await confirmOrderPaymentAction(orderId)
      if (res.success) {
        setPaymentConfirmedAt(new Date().toISOString())
        toast.success('Simulasi Pembayaran Berhasil! Mengalihkan ke Nota...')
        const det = await getOrderDetailsAction(orderId)
        if (det.success) setOrderDetailData(det.data)
        setStep(4)
      } else {
        toast.error(res.error || 'Gagal memproses simulasi')
      }
    } catch {
      toast.error('Gagal memproses simulasi')
    } finally {
      setIsSyncingPayment(false)
    }
  }

  // Handler Buka Popup Snap
  const handleOpenSnapPopup = () => {
    if (snapToken && window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: function () {
          toast.success('Pembayaran Berhasil!')
          handleManualCheckStatus()
        },
        onPending: function () {
          toast.info('Transaksi dibuat, menunggu pembayaran Anda.')
        },
        onError: function () {
          toast.error('Pembayaran gagal atau dibatalkan.')
        },
        onClose: function () {
          toast.info('Jendela pembayaran Snap ditutup.')
        },
      })
    } else {
      toast.error('Snap token belum siap. Silakan gunakan Virtual Account atau QRIS di bawah.')
    }
  }

  // Handler Mengonsumsi Unduhan Produk Digital (Product Brief 13.7)
  const handleDownloadDigitalProduct = async (orderItemId: string) => {
    setDownloadingItemId(orderItemId)
    try {
      const res = await consumeDownloadAction(orderItemId)
      if (res.success && res.downloadUrl) {
        toast.success(`Mengunduh ${res.fileName} (Sisa kuota: ${res.remainingDownloads}x)`)
        window.open(res.downloadUrl, '_blank')
        // Segarkan data pesanan
        if (orderId) {
          const det = await getOrderDetailsAction(orderId)
          if (det.success) setOrderDetailData(det.data)
        }
      } else {
        toast.error(res.error || 'Gagal mengunduh file digital')
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memproses unduhan')
    } finally {
      setDownloadingItemId(null)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a699]" />
        <p className="text-xs text-slate-500">Menyiapkan halaman checkout aman Krafita...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-8 sm:py-12">
      {/* Midtrans Snap JS */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-9M8xXiTIxNTVCdUh'}
        strategy="afterInteractive"
      />

      {/* Modal Alamat Pengiriman */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={async () => {
          setIsAddressModalOpen(false)
          const addrRes = await getAddressesAction()
          if (addrRes.success && addrRes.data) {
            setAddresses(addrRes.data)
            const def = addrRes.data.find((a) => a.isDefault) || addrRes.data[0]
            setSelectedAddress(def)
          }
        }}
      />

      <div className="container mx-auto px-4 max-w-5xl">
        {/* ============================================================ */}
        {/* STEPPER HEADER (4 Langkah Visual)                            */}
        {/* ============================================================ */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#00a699] z-0 transition-all duration-500"
              style={{
                width: step === 1 ? '12%' : step === 2 ? '42%' : step === 3 ? '72%' : '100%',
              }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                  step === 1
                    ? 'bg-[#00a699] text-white ring-4 ring-[#00a699]/20'
                    : step > 1
                    ? 'bg-[#00a699] text-white cursor-pointer'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {step > 1 ? <Check className="w-5 h-5 stroke-[2.5]" /> : '1'}
              </button>
              <span
                className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight ${
                  step === 1 ? 'text-[#00a699] font-bold' : step > 1 ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                Detail Order
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                  step === 2
                    ? 'bg-[#00a699] text-white ring-4 ring-[#00a699]/20'
                    : step > 2
                    ? 'bg-[#00a699] text-white cursor-pointer'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {step > 2 ? <Check className="w-5 h-5 stroke-[2.5]" /> : '2'}
              </button>
              <span
                className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight ${
                  step === 2 ? 'text-[#00a699] font-bold' : step > 2 ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                Konfirmasi
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => step > 3 && setStep(3)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                  step === 3
                    ? 'bg-[#00a699] text-white ring-4 ring-[#00a699]/20'
                    : step > 3
                    ? 'bg-[#00a699] text-white cursor-pointer'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {step > 3 ? <Check className="w-5 h-5 stroke-[2.5]" /> : '3'}
              </button>
              <span
                className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight ${
                  step === 3 ? 'text-[#00a699] font-bold' : step > 3 ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                Pembayaran
              </span>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                  step === 4
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {step === 4 ? <Check className="w-5 h-5 stroke-[2.5]" /> : '4'}
              </div>
              <span
                className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight ${
                  step === 4 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                }`}
              >
                Status Transaksi
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 1: DETAIL ORDER & PENGIRIMAN (Marketplace Multi-Vendor) */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* KOLOM KIRI (Daftar Produk per Toko & Pengiriman) */}
            <div className="lg:col-span-8 space-y-6">
              {/* BLOK 1: ALAMAT PENGIRIMAN (Hanya Muncul Jika Ada Produk Fisik) */}
              {hasPhysicalItems ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">Alamat Pengiriman</h3>
                        <p className="text-[11px] text-slate-500">Wajib untuk pengiriman produk fisik kurir</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-semibold h-8 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Kelola Alamat
                    </Button>
                  </div>

                  {selectedAddress ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">{selectedAddress.recipientName}</strong>
                        <span className="text-slate-500 font-mono text-xs">{selectedAddress.phone}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{selectedAddress.addressLine}</p>
                      <p className="text-slate-500 text-xs">
                        {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Nama Penerima"
                          value={quickAddress.recipientName}
                          onChange={(e) => setQuickAddress({ ...quickAddress, recipientName: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#00a699]"
                        />
                        <input
                          type="tel"
                          placeholder="No. Telepon / WhatsApp"
                          value={quickAddress.phone}
                          onChange={(e) => setQuickAddress({ ...quickAddress, phone: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#00a699]"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Alamat Lengkap (Jalan, No Rumah, RT/RW)"
                        value={quickAddress.addressLine}
                        onChange={(e) => setQuickAddress({ ...quickAddress, addressLine: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#00a699]"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Kota / Kabupaten"
                          value={quickAddress.city}
                          onChange={(e) => setQuickAddress({ ...quickAddress, city: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#00a699]"
                        />
                        <input
                          type="text"
                          placeholder="Provinsi"
                          value={quickAddress.province}
                          onChange={(e) => setQuickAddress({ ...quickAddress, province: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#00a699]"
                        />
                        <input
                          type="text"
                          placeholder="Kode Pos"
                          value={quickAddress.postalCode}
                          onChange={(e) => setQuickAddress({ ...quickAddress, postalCode: e.target.value })}
                          className="h-10 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#00a699]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pilihan Ekspedisi Pengiriman */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Pilihan Ekspedisi Kurir:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {SHIPPING_OPTIONS.map((opt) => {
                        const isSelected = selectedShipping.id === opt.id
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedShipping(opt)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#00a699] bg-[#00a699]/5 ring-1 ring-[#00a699]'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="block font-bold text-xs text-slate-800">{opt.name}</span>
                            <span className="block text-[11px] text-slate-500 mt-0.5">{opt.estimatedDays}</span>
                            <span className="block font-extrabold text-xs text-[#00a699] mt-1">
                              {formatPrice(opt.cost)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* BANNER KHUSUS PRODUK DIGITAL */
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold text-emerald-900 text-sm">
                      Pesanan Produk Digital — Tanpa Ongkos Kirim
                    </h4>
                    <p className="text-emerald-800/80 leading-relaxed">
                      Pesanan Anda 100% berisi aset digital. Tidak memerlukan alamat pengiriman fisik. Setelah pembayaran
                      dikonfirmasi lunas, tautan unduhan berkecepatan tinggi dan lisensi produk akan langsung aktif di
                      halaman <strong>Status Transaksi</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* BLOK 2: DAFTAR PRODUK YANG DIPESAN PER TOKO */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <ShoppingBag className="w-4 h-4 text-[#00a699]" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Daftar Produk Pesanan ({checkoutItems.length} Item)
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {checkoutItems.map((item) => (
                    <div key={item.productId} className="py-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                            <Image
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.type === 'digital'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {item.type === 'digital' ? '⚡ Produk Digital' : '📦 Produk Fisik'}
                              </span>
                              <span className="text-xs text-slate-500">Toko: {item.shopName}</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                              {item.title}
                            </h4>
                            <div className="text-xs text-slate-500">
                              {item.qty} x <strong className="text-slate-800">{formatPrice(item.price)}</strong>
                            </div>
                          </div>
                        </div>

                        <span className="font-bold text-sm text-slate-900 shrink-0">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>

                      {/* Catatan Pembeli per Item */}
                      <div>
                        <input
                          type="text"
                          placeholder="Catatan untuk penjual (warna, ukuran, instruksi)..."
                          value={buyerNotes[item.productId] ?? (item.buyerNote || '')}
                          onChange={(e) =>
                            setBuyerNotes({ ...buyerNotes, [item.productId]: e.target.value })
                          }
                          className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50/50 focus:outline-none focus:bg-white focus:border-[#00a699]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN (Ringkasan Belanja) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Total Harga Barang ({checkoutItems.length})</span>
                    <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Ongkos Kirim</span>
                    <span className="font-semibold text-slate-900">
                      {hasPhysicalItems ? formatPrice(shippingCost) : 'Rp 0 (Digital)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Biaya Layanan Krafita</span>
                    <span className="font-semibold text-slate-900">{formatPrice(serviceFee)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-base text-slate-900">
                    <span>Total Tagihan</span>
                    <span className="text-[#00a699] text-lg font-extrabold">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="w-full h-12 bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-lg active:scale-[0.99]"
                >
                  Lanjut ke Konfirmasi <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Jaminan Keamanan Transaksi */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Jaminan Transaksi Aman</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Dana pembayaran Anda disimpan aman di rekening penampung Krafita. Dana baru diteruskan ke
                    penjual setelah pesanan selesai.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: KONFIRMASI PESANAN MARKETPLACE                       */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 space-y-7">
              <div className="text-center space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Konfirmasi & Pilih Pembayaran
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Harap periksa rincian order belanja Anda sebelum dialihkan ke halaman instruksi transfer/QRIS.
                </p>
              </div>

              {/* Rincian Order Review */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-6 space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-500">Tipe Pesanan</span>
                  <span className="text-xs font-bold text-[#00a699] bg-[#00a699]/10 px-2.5 py-1 rounded-md">
                    {hasPhysicalItems && hasDigitalItems
                      ? 'Campuran (Fisik & Digital)'
                      : hasPhysicalItems
                      ? 'Produk Fisik (Pengiriman Kurir)'
                      : 'Produk Digital (Instant Cloud Download)'}
                  </span>
                </div>

                {hasPhysicalItems && (
                  <div>
                    <span className="text-slate-500 text-xs block">Tujuan Pengiriman:</span>
                    <strong className="text-slate-900 font-bold block">
                      {selectedAddress?.recipientName || quickAddress.recipientName} (
                      {selectedAddress?.phone || quickAddress.phone})
                    </strong>
                    <span className="text-slate-600">
                      {selectedAddress
                        ? `${selectedAddress.addressLine}, ${selectedAddress.city}, ${selectedAddress.province} ${selectedAddress.postalCode}`
                        : `${quickAddress.addressLine}, ${quickAddress.city}, ${quickAddress.province} ${quickAddress.postalCode}`}
                    </span>
                    <span className="block text-slate-500 text-[11px] mt-1">
                      Kurir: <strong>{selectedShipping.courier}</strong> ({selectedShipping.name} —{' '}
                      {formatPrice(selectedShipping.cost)})
                    </span>
                  </div>
                )}

                {/* Daftar Ringkas Barang */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="text-slate-500 text-xs block">Barang yang Dipesan:</span>
                  {checkoutItems.map((it) => (
                    <div key={it.productId} className="flex justify-between items-center text-xs">
                      <span className="text-slate-800 font-medium line-clamp-1 max-w-[300px]">
                        {it.qty}x {it.title}
                      </span>
                      <strong className="text-slate-900">{formatPrice(it.price * it.qty)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Banner Proteksi Midtrans */}
              <div className="bg-blue-50/80 rounded-2xl border border-blue-200 p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-blue-900 uppercase tracking-wide text-[11px]">
                    Metode Pembayaran Aman (Midtrans)
                  </h4>
                  <p className="text-blue-800/80 leading-relaxed">
                    Pembayaran diproses otomatis dan aman melalui gateway <strong>Midtrans</strong>. Anda dapat
                    memilih metode <strong>QRIS (GoPay/ShopeePay)</strong>, <strong>Virtual Account (BCA/Mandiri/BNI/BRI/Permata)</strong>,
                    atau kartu kredit di halaman berikutnya.
                  </p>
                </div>
              </div>

              {/* Rincian Biaya */}
              <div className="space-y-2 text-xs sm:text-sm pt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium text-slate-900">{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Layanan Krafita</span>
                  <span className="font-medium text-slate-900">{formatPrice(serviceFee)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-base text-slate-900">
                  <span>Total Tagihan Pembayaran</span>
                  <span className="text-[#00a699] text-lg font-extrabold">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 rounded-xl text-slate-700 font-bold border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={isCreatingOrder}
                  className="h-12 bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan...
                    </>
                  ) : (
                    'Bayar Sekarang'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: PEMBAYARAN (Sesuai Gambar 3 & 4: Simulator & QRIS)   */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header Tagihan */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Tagihan Pembayaran
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#00a699] mt-0.5">
                  {formatPrice(grandTotal)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ID Transaksi: <strong className="font-mono text-slate-800">{orderCode}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Menunggu Pembayaran (Auto-Sync)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>Selesaikan dalam 23 jam 59 menit</span>
                </div>
              </div>
            </div>

            {/* Selector Metode Pembayaran */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
              <div className="flex border-b border-slate-200 pb-2 gap-2 sm:gap-4 overflow-x-auto justify-center">
                <button
                  type="button"
                  onClick={() => setPaymentTab('snap')}
                  className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                    paymentTab === 'snap'
                      ? 'border-[#00a699] text-[#00a699]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Midtrans Snap (Langsung di Halaman)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab('qris')}
                  className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                    paymentTab === 'qris'
                      ? 'border-[#00a699] text-[#00a699]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS E-Wallet (Sanlance)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentTab('va')
                    if (!vaData?.vaNumber) {
                      handleSelectBank('bca')
                    }
                  }}
                  className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                    paymentTab === 'va'
                      ? 'border-[#00a699] text-[#00a699]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Virtual Account Bank</span>
                </button>
              </div>

              {/* TAB 1: MIDTRANS SNAP (EMBED LANGSUNG DI HALAMAN) */}
              <div className={paymentTab === 'snap' ? 'block space-y-4 max-w-[500px] mx-auto' : 'hidden'}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Metode Lengkap
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        Midtrans Secure Checkout
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resmi & Terenkripsi</span>
                    </div>
                  </div>

                  {/* Wrapper Pembungkus dengan Loading Sibling */}
                  <div className="w-full min-h-[580px] bg-slate-50/60 rounded-xl overflow-hidden flex flex-col justify-start relative">
                    {!isSnapLoaded && (
                      <div className="absolute inset-0 z-10 bg-slate-50/90 flex flex-col items-center justify-center gap-3 text-slate-400 px-4 text-center pointer-events-none">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00a699]" />
                        <p className="text-xs font-bold text-slate-700">
                          Menyiapkan Antarmuka Midtrans Snap Langsung di Halaman...
                        </p>
                        <span className="text-[11px] text-slate-500">
                          Mendukung GoPay, ShopeePay, Virtual Account semua bank, & Kartu Kredit.
                        </span>
                      </div>
                    )}

                    {/* Snap Embed Container: Khusus Iframe Midtrans (TANPA Anak React) */}
                    <div
                      id="snap-embed-container"
                      ref={snapContainerRef}
                      className="w-full min-h-[580px]"
                    />
                  </div>
                </div>
              </div>

              {/* TAB 2: QRIS E-WALLET SANLANCE (IMAGE 3 - KLIK KANAN DIAKTIFKAN) */}
              <div className={paymentTab === 'qris' ? 'block space-y-6 max-w-[500px] mx-auto' : 'hidden'}>
                <div className="text-center space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-base">QRIS Standar Pembayaran Nasional</h4>
                  <p className="text-xs text-slate-500">
                    Scan QRIS resmi Sanlance menggunakan GoPay, ShopeePay, Dana, OVO, BCA Mobile, atau aplikasi e-wallet apa pun.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-slate-50/90 rounded-2xl border border-slate-200">
                  {/* Wadah Gambar QRIS Sanlance (Image 3) */}
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200/80 max-w-[320px] w-full">
                    <img
                      id="qris-sanlance-image"
                      src="/images/qris-merchant.png"
                      alt="QRIS Standar Pembayaran Nasional - Sanlance NMID ID1026526624386"
                      className="w-full h-auto object-contain rounded-xl select-auto cursor-pointer shadow-2xs pointer-events-auto block transition-transform hover:scale-[1.01]"
                    />
                  </div>

                  <div className="mt-4 text-center space-y-2.5 w-full">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Merchant: Sanlance</span>
                      <p className="text-[11px] text-slate-500 font-mono">NMID: ID1026526624386</p>
                      <div className="text-base font-extrabold text-[#00a699] pt-1">
                        Total Tagihan: {formatPrice(grandTotal)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url =
                            typeof window !== 'undefined'
                              ? `${window.location.origin}/images/qris-merchant.png`
                              : '/images/qris-merchant.png'
                          handleCopy(url, 'URL Gambar QRIS')
                        }}
                        className="h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer bg-white"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#00a699]" />
                        Salin URL Gambar QRIS
                      </Button>
                      <a
                        href="/images/qris-merchant.png"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer h-8"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Gambar
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      * Klik kanan gambar untuk memilih "Salin alamat gambar" (Copy image address) atau unduh gambar.
                    </p>
                  </div>
                </div>
              </div>

              {/* TAB 3: VIRTUAL ACCOUNT BANK (TANPA TABEL INSTRUKSI SIMULATOR) */}
              <div className={paymentTab === 'va' ? 'block space-y-6 max-w-[500px] mx-auto' : 'hidden'}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 text-center">
                    Pilih Bank Virtual Account:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {BANK_OPTIONS.map((bank) => {
                      const isSelected = selectedBank === bank.id
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => handleSelectBank(bank.id)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-[#00a699] bg-[#00a699]/5 ring-2 ring-[#00a699]/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-extrabold text-xs text-slate-900 tracking-wider">
                            {bank.code}
                          </span>
                          <span className="text-[10px] text-slate-500">VA</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Card Nomor Virtual Account */}
                <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">Bank Terpilih</span>
                      <h4 className="text-sm font-bold text-slate-900 uppercase">
                        {selectedBank.toUpperCase()} VIRTUAL ACCOUNT
                      </h4>
                    </div>
                    <span className="text-xs text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full font-semibold">
                      Otomatis
                    </span>
                  </div>

                  {isRequestingVa ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#00a699]" />
                      <span className="text-xs text-slate-500">Membuat nomor Virtual Account...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-600 block">
                        Nomor Virtual Account:
                      </span>
                      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="font-mono text-base sm:text-lg font-extrabold text-[#00a699] tracking-wider select-all break-all">
                          {vaData?.vaNumber || '55040884893457780391174'}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(vaData?.vaNumber || '', 'Nomor VA')}
                          className="h-9 px-3 gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Salin
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS & SYNC */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPayment ? 'animate-spin text-[#00a699]' : ''}`} />
                  <span>Auto-sync aktif setiap 3 detik</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleManualCheckStatus}
                    disabled={isSyncingPayment}
                    className="h-10 px-4 rounded-xl text-xs font-bold border-slate-300 hover:bg-slate-50 cursor-pointer flex-1 sm:flex-initial"
                  >
                    {isSyncingPayment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Mengecek...
                      </>
                    ) : (
                      'Cek Status Pembayaran'
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleInstantConfirmTest}
                    disabled={isSyncingPayment}
                    className="h-10 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs flex-1 sm:flex-initial flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Simulasi Bayar Berhasil
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: STATUS TRANSAKSI (Nota Lunas, Pelacakan & Unduhan)   */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Banner Sukses */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
                Pembayaran Berhasil Dikonfirmasi!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 max-w-lg mx-auto leading-relaxed">
                Pesanan Anda telah resmi terverifikasi lunas oleh sistem Midtrans. Nota transaksi resmi telah
                diterbitkan di bawah ini.
              </p>
            </div>

            {/* NOTA / FAKTUR RESMI PEMBAYARAN KRAFITA */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-10 space-y-6 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
              {/* Cap Stempel Lunas */}
              <div className="absolute right-6 top-6 sm:right-10 sm:top-10 rotate-12 select-none pointer-events-none opacity-85">
                <div className="border-4 border-emerald-600 rounded-2xl px-4 py-1.5 text-center">
                  <span className="font-mono text-base sm:text-xl font-extrabold text-emerald-700 uppercase tracking-widest">
                    LUNAS / PAID
                  </span>
                  <span className="block text-[9px] text-emerald-600 font-bold uppercase tracking-wider">
                    MIDTRANS VERIFIED
                  </span>
                </div>
              </div>

              {/* Header Nota */}
              <div className="border-b border-slate-200 pb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00a699] text-white font-black flex items-center justify-center text-xs">
                    K
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900">KRAFITA</span>
                  <span className="text-xs text-slate-400 font-medium">| Faktur Resmi Transaksi Marketplace</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-2">
                  <div>
                    No. Faktur: <strong className="font-mono text-slate-900">INV-{orderCode}</strong>
                  </div>
                  <div className="sm:text-right">
                    Waktu Bayar:{' '}
                    <strong className="text-slate-900">
                      {paymentConfirmedAt
                        ? new Date(paymentConfirmedAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : new Date().toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Data Penerima & Pengiriman (Hanya Jika Ada Produk Fisik) */}
              {hasPhysicalItems && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block mb-1">Tujuan Pengiriman:</span>
                    <strong className="text-slate-900 text-sm block font-bold">
                      {selectedAddress?.recipientName || quickAddress.recipientName}
                    </strong>
                    <span className="text-slate-600 block">
                      {selectedAddress?.phone || quickAddress.phone}
                    </span>
                    <span className="text-slate-600 block">
                      {selectedAddress
                        ? `${selectedAddress.addressLine}, ${selectedAddress.city}`
                        : `${quickAddress.addressLine}, ${quickAddress.city}`}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-slate-500 block mb-1">Ekspedisi Kurir:</span>
                    <strong className="text-slate-900 font-bold block">{selectedShipping.courier}</strong>
                    <span className="text-slate-600 block">Layanan: {selectedShipping.name}</span>
                    <span className="text-slate-600 block">Estimasi: {selectedShipping.estimatedDays}</span>
                  </div>
                </div>
              )}

              {/* Tabel Rincian Barang yang Dibeli */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rincian Barang / Produk:
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-3 font-bold text-slate-700 grid grid-cols-12 gap-2">
                    <span className="col-span-8">Nama Produk & Toko</span>
                    <span className="col-span-4 text-right">Subtotal</span>
                  </div>
                  {checkoutItems.map((it) => (
                    <div key={it.productId} className="p-3 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-8 space-y-0.5">
                        <strong className="text-slate-900 block font-bold">{it.title}</strong>
                        <span className="text-xs text-slate-500 block">
                          Toko: {it.shopName} | {it.qty} x {formatPrice(it.price)} |{' '}
                          <span className={it.type === 'digital' ? 'text-blue-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                            {it.type === 'digital' ? 'Digital' : 'Fisik'}
                          </span>
                        </span>
                      </div>
                      <div className="col-span-4 text-right font-medium text-slate-900">
                        {formatPrice(it.price * it.qty)}
                      </div>
                    </div>
                  ))}
                  {hasPhysicalItems && (
                    <div className="p-3 grid grid-cols-12 gap-2 text-slate-600">
                      <span className="col-span-8">Ongkos Kirim ({selectedShipping.courier})</span>
                      <span className="col-span-4 text-right font-medium text-slate-900">
                        {formatPrice(shippingCost)}
                      </span>
                    </div>
                  )}
                  <div className="p-3 grid grid-cols-12 gap-2 text-slate-600">
                    <span className="col-span-8">Biaya Layanan Krafita</span>
                    <span className="col-span-4 text-right font-medium text-slate-900">
                      {formatPrice(serviceFee)}
                    </span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/70 font-bold text-slate-900 grid grid-cols-12 gap-2 text-sm sm:text-base">
                    <span className="col-span-8 text-emerald-950">Total Pembayaran Lunas</span>
                    <span className="col-span-4 text-right text-emerald-700 font-extrabold">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Cetak Nota */}
              <div className="pt-2 flex justify-end print:hidden">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-10 px-4 rounded-xl text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-slate-600" /> Cetak / Unduh Nota PDF
                </Button>
              </div>
            </div>

            {/* BLOK KHUSUS UNDUHAN PRODUK DIGITAL (Jika Ada Item Digital) */}
            {hasDigitalItems && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Akses Unduhan Produk Digital</h3>
                    <p className="text-xs text-slate-500">
                      File produk digital Anda telah siap diunduh secara instan dari cloud storage terenkripsi Krafita.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {checkoutItems
                    .filter((it) => it.type === 'digital')
                    .map((it, idx) => {
                      const orderItemData = orderDetailData?.items?.find(
                        (odi: any) => odi.product_id === it.productId
                      )
                      const targetId = orderItemData?.id || `item-digi-${idx}`
                      const remainingCount = orderItemData?.remainingDownloads ?? 5

                      return (
                        <div
                          key={it.productId}
                          className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              Siap Diunduh
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{it.title}</h4>
                            <p className="text-xs text-slate-500">
                              Format file terkompresi ZIP/RAR | Lisensi resmi Krafita | Sisa kuota:{' '}
                              <strong className="text-slate-800">{remainingCount}x</strong> dari 5x unduhan
                            </p>
                            <span className="text-[11px] text-slate-400 block">
                              Masa aktif unduhan: 30 Hari sejak pembelian
                            </span>
                          </div>

                          <Button
                            type="button"
                            onClick={() => handleDownloadDigitalProduct(targetId)}
                            disabled={downloadingItemId === targetId || remainingCount <= 0}
                            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
                          >
                            {downloadingItemId === targetId ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" /> Unduh File Digital
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* BLOK PELACAKAN PENGIRIMAN KURIR (HANYA MUNCUL JIKA ADA PRODUK FISIK) */}
            {hasPhysicalItems && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 text-base">Pelacakan Pengiriman Paket Ekspedisi</h3>
                    <p className="text-xs text-slate-500">
                      Pantau pergerakan kurir dan status transit paket ke alamat Anda.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                    {orderDetailData?.trackingNumber || `KRFEXP-${orderCode.replace(/[^0-9]/g, '')}`}
                  </span>
                </div>

                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Pesanan Dibuat */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">Pesanan Dibuat</h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pesanan telah tercatat di sistem marketplace Krafita.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Pembayaran Dikonfirmasi */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">Pembayaran Terverifikasi (Lunas)</h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gateway Midtrans mengonfirmasi pembayaran lunas. Notifikasi diteruskan ke penjual.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Sedang Dikemas */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#00a699] text-white flex items-center justify-center shrink-0 z-10 shadow-xs ring-4 ring-[#00a699]/20">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-[#00a699]">Sedang Dikemas oleh Penjual</h5>
                        <span className="text-[10px] bg-[#00a699]/10 text-[#00a699] font-bold px-2 py-0.5 rounded">
                          Sedang Berjalan
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Toko sedang menyiapkan barang dan membungkus dengan bubble wrap aman untuk dijemput kurir.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Dalam Pengiriman */}
                  <div className="relative flex items-start gap-4 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 z-10">
                      <span className="text-xs font-bold">4</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-700">Dalam Pengiriman Kurir & Transit Hub</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Paket dibawa oleh kurir {selectedShipping.courier} menuju alamat tujuan.
                      </p>
                    </div>
                  </div>

                  {/* Step 5: Tiba */}
                  <div className="relative flex items-start gap-4 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 z-10">
                      <span className="text-xs font-bold">5</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-700">Pesanan Diterima Pembeli</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Paket telah sampai di tujuan dan pembeli dapat mengonfirmasi penerimaan barang.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Navigasi Bawah */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {orderId && (
                <Link
                  href={`/orders/${orderId}`}
                  className="flex-1 h-12 bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Lihat Riwayat Pesanan Saya <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/"
                className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali Belanja
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#00a699]" />
          <p className="text-xs text-slate-500">Memuat alur checkout marketplace Krafita...</p>
        </div>
      }
    >
      <CheckoutWizard />
    </Suspense>
  )
}
