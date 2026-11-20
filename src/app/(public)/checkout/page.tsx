'use client'

import React, { useState, useEffect, Suspense, useRef, useMemo } from 'react'
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
  Copy,
  ExternalLink,
  Printer,
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
  Plus,
  X,
  Radio,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import { getAddressesAction } from '@/actions/address'
import type { AddressItem } from '@/types/address'
import { getCartWithDetails } from '@/actions/cart'
import type { MarketplaceOrderItemPayload } from '@/types/order'
import {
  createMarketplaceOrderAction,
  requestBankVaPaymentAction,
  checkAndSyncPaymentStatusAction,
  confirmOrderPaymentAction,
  getOrderDetailsAction,
  getOrCreateSnapTokenAction,
} from '@/actions/order'
import { consumeDownloadAction } from '@/actions/download'
import { AddressModal } from '@/components/account/address-modal'
import { Button } from '@/components/ui/button'
import { CATALOG_PRODUCTS } from '@/lib/catalog-data'

declare global {
  interface Window {
    snap?: any
  }
}

interface ShippingOption {
  id: string
  courier: string
  name: string
  cost: number
  estimatedDays: string
}

const DEFAULT_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'reguler',
    courier: 'J&T Express',
    name: 'Pengiriman Reguler',
    cost: 2000,
    estimatedDays: '1 - 2 Hari',
  },
  {
    id: 'instant',
    courier: 'GrabExpress',
    name: 'Pengiriman Instant',
    cost: 3500,
    estimatedDays: '3 - 6 Jam',
  },
  {
    id: 'hemat',
    courier: 'JNE OKE',
    name: 'Hemat Kargo',
    cost: 1000,
    estimatedDays: '1 - 2 Hari',
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
    productId: 'e1000000-0000-4000-a000-000000000005',
    title: 'Kemeja Oxford Pria Slim Fit Breathable',
    price: 349000,
    qty: 1,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    shopId: '06f642de-654a-4c48-87c0-aaee352d8ad4',
    shopName: 'Krafita Official Store',
    shopCity: 'Jakarta Selatan',
    type: 'physical',
    buyerNote: '',
  },
]

function CheckoutWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLanguage()

  // 3 Steps Visual: 1: Checkout Lengkap (Alamat, Produk, Pengiriman, Pembayaran) -> 2: Pembayaran -> 3: Status & Unduhan
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [pageLoading, setPageLoading] = useState(true)

  // Direct buy parameter support
  const isBuyNow = searchParams.get('buyNow') === 'true'
  const queryProductId = searchParams.get('productId')
  const queryTitle = searchParams.get('title')
  const queryPrice = searchParams.get('price') ? Number(searchParams.get('price')) : null
  const queryType = (searchParams.get('type') as 'physical' | 'digital') || 'physical'
  const queryImageUrl = searchParams.get('imageUrl') || searchParams.get('image') || ''
  const queryShopId = searchParams.get('shopId') || ''
  const queryShopName = searchParams.get('shopName') || ''
  const queryShopCity = searchParams.get('shopCity') || ''
  const queryQty = searchParams.get('qty') ? Math.max(1, Number(searchParams.get('qty'))) : 1

  // Data Barang Checkout
  const [checkoutItems, setCheckoutItems] = useState<MarketplaceOrderItemPayload[]>([])
  const [buyerNotes, setBuyerNotes] = useState<Record<string, string>>({})

  // Data Alamat Pengiriman
  const [addresses, setAddresses] = useState<AddressItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isAddressListModalOpen, setIsAddressListModalOpen] = useState(false)

  const [quickAddress, setQuickAddress] = useState({
    recipientName: 'Hakim',
    phone: '085675246745',
    addressLine: 'Jl. Kemang Raya No. 18, RT 02 / RW 05',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12730',
  })

  // Pilihan Ekspedisi (Tarif Dinamis Sesuai Jarak Rp 1.000 - Rp 5.000)
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(DEFAULT_SHIPPING_OPTIONS[0])
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false)

  // Hitung Jarak & Opsi Ongkos Kirim Dinamis (Rp 1.000 - Rp 5.000) Berdasarkan Lokasi Toko & Pembeli
  const shippingOptions: ShippingOption[] = useMemo(() => {
    const buyerCity = (selectedAddress?.city || quickAddress.city || '').toLowerCase().trim()
    const buyerProvince = (selectedAddress?.province || quickAddress.province || '').toLowerCase().trim()

    // Ambil lokasi kota toko dari item toko
    const shopCity = (checkoutItems[0]?.shopCity || 'Jakarta Selatan').toLowerCase().trim()

    const cleanCity = (c: string) => c.replace(/^(kota|kabupaten|kab\.)\s+/i, '').trim()
    const cleanBuyerCity = cleanCity(buyerCity)
    const cleanShopCity = cleanCity(shopCity)

    // 1. Jarak Dekat (Satu Kota / Kabupaten yang sama) -> Ongkir Rp 1.000 - Rp 3.500
    const isSameCity =
      cleanBuyerCity &&
      cleanShopCity &&
      (cleanBuyerCity === cleanShopCity ||
        cleanBuyerCity.includes(cleanShopCity) ||
        cleanShopCity.includes(cleanBuyerCity))

    // 2. Jarak Sedang (Satu Provinsi / Wilayah Terdekat) -> Ongkir Rp 2.000 - Rp 4.500
    const isNearProvince =
      buyerProvince &&
      (buyerProvince.includes('dki') ||
        buyerProvince.includes('jakarta') ||
        buyerProvince.includes('jawa barat') ||
        buyerProvince.includes('banten') ||
        buyerProvince.includes('jawa timur') ||
        buyerProvince.includes('jawa tengah') ||
        buyerProvince.includes('yogyakarta'))

    let tier: 'dekat' | 'sedang' | 'jauh' = 'sedang'

    if (isSameCity) {
      tier = 'dekat'
    } else if (isNearProvince) {
      tier = 'sedang'
    } else if (!buyerCity) {
      tier = 'dekat'
    } else {
      tier = 'jauh'
    }

    if (tier === 'dekat') {
      return [
        {
          id: 'hemat',
          courier: 'JNE OKE',
          name: 'Hemat Kargo',
          cost: 1000,
          estimatedDays: '1 - 2 Hari',
        },
        {
          id: 'reguler',
          courier: 'J&T Express',
          name: 'Reguler',
          cost: 2000,
          estimatedDays: '1 Hari',
        },
        {
          id: 'instant',
          courier: 'GoSend',
          name: 'Instant',
          cost: 3500,
          estimatedDays: '3 - 6 Jam',
        },
      ]
    } else if (tier === 'sedang') {
      return [
        {
          id: 'hemat',
          courier: 'JNE OKE',
          name: 'Hemat Kargo',
          cost: 2000,
          estimatedDays: '2 - 3 Hari',
        },
        {
          id: 'reguler',
          courier: 'J&T Express',
          name: 'Reguler',
          cost: 3000,
          estimatedDays: '1 - 2 Hari',
        },
        {
          id: 'instant',
          courier: 'GrabExpress',
          name: 'Instant',
          cost: 4500,
          estimatedDays: '1 Hari',
        },
      ]
    } else {
      return [
        {
          id: 'hemat',
          courier: 'JNE OKE',
          name: 'Hemat Kargo',
          cost: 3000,
          estimatedDays: '3 - 5 Hari',
        },
        {
          id: 'reguler',
          courier: 'J&T Express',
          name: 'Reguler',
          cost: 4000,
          estimatedDays: '2 - 3 Hari',
        },
        {
          id: 'instant',
          courier: 'GrabExpress',
          name: 'Instant',
          cost: 5000,
          estimatedDays: '1 - 2 Hari',
        },
      ]
    }
  }, [selectedAddress, quickAddress, checkoutItems])

  // Sinkronisasi otomatis biaya opsi pengiriman terpilih saat alamat atau jarak berubah
  useEffect(() => {
    setSelectedShipping((prev) => {
      const match = shippingOptions.find((opt) => opt.id === prev.id)
      return match || shippingOptions[0]
    })
  }, [shippingOptions])

  // Proteksi Produk & Asuransi
  const [hasProtection, setHasProtection] = useState(true)
  const protectionCost = hasProtection ? 500 : 0

  // Metode Pembayaran di Form Checkout
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('snap')
  const [isPaymentSelectorOpen, setIsPaymentSelectorOpen] = useState(false)

  // Order Tercipta
  const [orderId, setOrderId] = useState<string>('')
  const [orderCode, setOrderCode] = useState<string>('')
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  // Step 2 (Pembayaran) Payment States
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

  // Step 3 (Unduhan & Pelacakan) State
  const [orderDetailData, setOrderDetailData] = useState<any>(null)
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null)

  // Polling ref untuk Auto-sync & Snap Embed Ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const snapContainerRef = useRef<HTMLDivElement>(null)
  const snapEmbeddedTokenRef = useRef<string | null>(null)

  // Deteksi Tipe Barang
  const hasPhysicalItems = checkoutItems.some((item) => item.type === 'physical')
  const hasDigitalItems = checkoutItems.some((item) => item.type === 'digital')

  // Hitung Biaya Transaksi
  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0)
  const shippingCost = hasPhysicalItems ? selectedShipping.cost : 0
  const serviceFee = 1000 // Biaya Layanan Krafita Rp 1.000
  const grandTotal = Math.max(0, subtotal + shippingCost + protectionCost + serviceFee)

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // Kelompokkan Item Berdasarkan Toko (Multi-Vendor Shop Grouping)
  const itemsByShop = useMemo(() => {
    const map = new Map<
      string,
      { shopId: string; shopName: string; items: MarketplaceOrderItemPayload[] }
    >()
    for (const item of checkoutItems) {
      const key = item.shopId || 'default'
      if (!map.has(key)) {
        map.set(key, {
          shopId: item.shopId || '',
          shopName: item.shopName || 'Krafita Official Store',
          items: [],
        })
      }
      map.get(key)!.items.push(item)
    }
    return Array.from(map.values())
  }, [checkoutItems])

  // Inisialisasi Data: Alamat & Produk Keranjang
  const refreshAddresses = async () => {
    const addrRes = await getAddressesAction()
    if (addrRes.success && addrRes.data && addrRes.data.length > 0) {
      setAddresses(addrRes.data)
      const def = addrRes.data.find((a) => a.isDefault) || addrRes.data[0]
      setSelectedAddress(def)
    }
  }

  useEffect(() => {
    async function initCheckout() {
      setPageLoading(true)
      try {
        await refreshAddresses()

        if (isBuyNow && queryProductId && queryTitle && queryPrice) {
          let resolvedImageUrl = queryImageUrl
          let resolvedShopName = queryShopName || 'Krafita Official Store'
          let resolvedShopId = queryShopId || '06f642de-654a-4c48-87c0-aaee352d8ad4'
          let resolvedShopCity = queryShopCity || 'Jakarta Selatan'

          // Cari di katalog produk jika imageUrl atau detail vendor belum lengkap
          const catalogMatch = CATALOG_PRODUCTS.find(
            (p) =>
              p.id === queryProductId ||
              p.slug === queryProductId ||
              (p.title_id && p.title_id.toLowerCase() === queryTitle.toLowerCase()) ||
              (p.title_en && p.title_en.toLowerCase() === queryTitle.toLowerCase())
          )

          if (catalogMatch) {
            if (!resolvedImageUrl) {
              resolvedImageUrl = catalogMatch.imageUrl
            }
            if (!queryShopName && catalogMatch.vendor) {
              resolvedShopName = catalogMatch.vendor
            }
          }

          // Fallback cerdas berdasarkan nama produk jika imageUrl tetap kosong
          if (!resolvedImageUrl) {
            const lowerTitle = queryTitle.toLowerCase()
            if (lowerTitle.includes('sepatu') || lowerTitle.includes('boot') || lowerTitle.includes('sneaker') || lowerTitle.includes('pantofel')) {
              resolvedImageUrl = 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80'
            } else if (lowerTitle.includes('kemeja') || lowerTitle.includes('baju') || lowerTitle.includes('kaos') || lowerTitle.includes('jaket')) {
              resolvedImageUrl = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'
            } else if (lowerTitle.includes('kursi') || lowerTitle.includes('meja') || lowerTitle.includes('sofa') || lowerTitle.includes('lemari')) {
              resolvedImageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
            } else if (lowerTitle.includes('tas') || lowerTitle.includes('dompet')) {
              resolvedImageUrl = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
            } else {
              resolvedImageUrl = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'
            }
          }

          setCheckoutItems([
            {
              productId: queryProductId,
              title: queryTitle,
              price: queryPrice,
              qty: queryQty,
              imageUrl: resolvedImageUrl,
              shopId: resolvedShopId,
              shopName: resolvedShopName,
              shopCity: resolvedShopCity,
              type: queryType,
              buyerNote: '',
            },
          ])
        } else {
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
                  shopCity: g.shopCity || undefined,
                  type: it.type,
                  buyerNote: it.buyerNote || '',
                })
              })
            })
            setCheckoutItems(flattened)
          } else {
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
  }, [
    isBuyNow,
    queryProductId,
    queryTitle,
    queryPrice,
    queryType,
    queryImageUrl,
    queryShopId,
    queryShopName,
    queryShopCity,
    queryQty,
  ])

  // Polling Auto-Sync Status Pembayaran saat berada di Step 2 (Pembayaran)
  useEffect(() => {
    if (step === 2 && orderCode) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await checkAndSyncPaymentStatusAction(orderCode)
          if (res.success && res.isPaid) {
            if (pollingRef.current) clearInterval(pollingRef.current)
            setPaymentConfirmedAt(res.paidAt || new Date().toISOString())
            toast.success('Pembayaran Terverifikasi! Membuka Nota & Akses Pesanan...')
            if (orderId) {
              const det = await getOrderDetailsAction(orderId)
              if (det.success) setOrderDetailData(det.data)
            }
            setStep(3)
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

  // Effect untuk Embed Midtrans Snap saat di Step 2 (Pembayaran)
  useEffect(() => {
    let isMounted = true
    if (step === 2) {
      const initSnapEmbed = async () => {
        let currentToken = snapToken
        if (!currentToken && orderCode) {
          const res = await getOrCreateSnapTokenAction(orderCode)
          if (res.success && res.snapToken) {
            currentToken = res.snapToken
            if (isMounted) setSnapToken(res.snapToken)
          }
        }

        if (!currentToken) return

        if (snapEmbeddedTokenRef.current === currentToken) {
          if (isMounted) setIsSnapLoaded(true)
          return
        }

        const tryEmbed = (attempt = 0) => {
          if (!isMounted) return
          if (typeof window !== 'undefined' && (window as any).snap && typeof (window as any).snap.embed === 'function') {
            const container = snapContainerRef.current || document.getElementById('snap-embed-container')
            if (container) {
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
                  onClose: function () {},
                })
                snapEmbeddedTokenRef.current = currentToken
                if (isMounted) setIsSnapLoaded(true)
              } catch (err) {
                console.warn('[Snap Embed Error]', err)
              }
            }
          } else if (attempt < 15) {
            setTimeout(() => tryEmbed(attempt + 1), 500)
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
        setStep(3)
      } else {
        toast.info('Status pembayaran masih MENUNGGU di Midtrans. Silakan selesaikan pembayaran.')
      }
    } catch {
      toast.error('Gagal mengecek status pembayaran')
    } finally {
      setIsSyncingPayment(false)
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

  // Handler Eksekusi Buat Pesanan (Single Unified Step -> langsung proses ke Pembayaran)
  const handleCreateOrder = async () => {
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

        // Konfigurasi tab pembayaran sesuai pilihan pengguna
        if (selectedPaymentMethod.startsWith('va-')) {
          const bankId = selectedPaymentMethod.replace('va-', '')
          setPaymentTab('va')
          handleSelectBank(bankId, res.orderCode)
        } else if (selectedPaymentMethod === 'qris') {
          setPaymentTab('qris')
        } else {
          setPaymentTab('snap')
        }

        toast.success('Pesanan dibuat. Silakan selesaikan pembayaran.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setStep(2) // Ke tahap Pembayaran
      } else {
        toast.error(res.error || 'Gagal membuat pesanan')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem saat membuat pesanan')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleCopy = (text: string, label = 'Nomor') => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} disalin ke papan klip!`)
  }

  // Handler Simulasi Berhasil Instan (Developer & Testing Helper)
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
        setStep(3)
      } else {
        toast.error(res.error || 'Gagal memproses simulasi')
      }
    } catch {
      toast.error('Gagal memproses simulasi')
    } finally {
      setIsSyncingPayment(false)
    }
  }

  // Handler Mengonsumsi Unduhan Produk Digital
  const handleDownloadDigitalProduct = async (orderItemId: string) => {
    setDownloadingItemId(orderItemId)
    try {
      const res = await consumeDownloadAction(orderItemId)
      if (res.success && res.downloadUrl) {
        toast.success(`Mengunduh ${res.fileName} (Sisa kuota: ${res.remainingDownloads}x)`)
        window.open(res.downloadUrl, '_blank')
        if (orderId) {
          const det = await getOrderDetailsAction(orderId)
          if (det.success) setOrderDetailData(det.data)
        }
      } else {
        toast.error(res.error || 'Gagal mengambil tautan unduhan')
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses unduhan')
    } finally {
      setDownloadingItemId(null)
    }
  }

  // Label Metode Pembayaran Terpilih
  const selectedPaymentLabel = useMemo(() => {
    if (selectedPaymentMethod === 'snap') return 'Midtrans Snap'
    if (selectedPaymentMethod === 'qris') return 'QRIS'
    if (selectedPaymentMethod === 'va-bca') return 'BCA'
    if (selectedPaymentMethod === 'va-mandiri') return 'Mandiri'
    if (selectedPaymentMethod === 'va-bni') return 'BNI'
    if (selectedPaymentMethod === 'va-bri') return 'BRI'
    if (selectedPaymentMethod === 'va-permata') return 'Permata'
    return 'Midtrans Secure Checkout'
  }, [selectedPaymentMethod])

  if (pageLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a699]" />
        <p className="text-xs text-muted-foreground font-medium">Memuat data pesanan...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground py-6 sm:py-10 pb-28 sm:pb-12">
      {/* Midtrans Snap JS */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-9M8xXiTIxNTVCdUh'}
        strategy="afterInteractive"
      />

      {/* Modal Form Tambah / Edit Alamat */}
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

      {/* Modal Pemilihan Alamat Akun (Bisa Melihat Semua Alamat & Mengganti Alamat) */}
      {isAddressListModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00a699]" />
                <h4 className="font-bold text-sm sm:text-base text-foreground">Pilih Alamat Pengiriman</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressListModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {addresses.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-muted-foreground">Belum ada alamat yang tersimpan pada akun ini.</p>
                </div>
              ) : (
                addresses.map((addr) => {
                  const isCurrent = selectedAddress?.id === addr.id
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr)
                        setIsAddressListModalOpen(false)
                        toast.success(`Alamat pengiriman diubah ke ${addr.recipientName}`)
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                        isCurrent
                          ? 'border-[#00a699] bg-[#00a699]/5 ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isCurrent ? 'border-[#00a699] bg-[#00a699]' : 'border-border'
                            }`}
                          >
                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <strong className="text-xs sm:text-sm font-bold text-foreground">
                            {addr.recipientName} ({addr.phone})
                          </strong>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[10px] font-semibold text-[#00a699] border border-[#00a699]/40 bg-[#00a699]/10 rounded px-1.5 py-0.2">
                            Utama
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground pl-5.5 leading-relaxed">
                        {addr.addressLine}, {addr.city}, {addr.province}, ID {addr.postalCode}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddressListModalOpen(false)
                  setIsAddressModalOpen(true)
                }}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold border-border hover:bg-muted/40 cursor-pointer flex items-center gap-1.5 w-full"
              >
                <Plus className="w-3.5 h-3.5 text-[#00a699]" />
                <span>Tambah Alamat Baru</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-5xl">
        {/* ============================================================ */}
        {/* STEPPER HEADER (Minimalis & Ringkas: 3 Langkah Saja)          */}
        {/* ============================================================ */}
        <div className="mb-6 sm:mb-8 max-w-lg mx-auto">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border/80 z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#00a699] z-0 transition-all duration-300"
              style={{
                width: step === 1 ? '16%' : step === 2 ? '50%' : '100%',
              }}
            />

            {/* Step 1: Checkout */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                  step === 1
                    ? 'bg-[#00a699] text-white ring-4 ring-[#00a699]/15 shadow-xs'
                    : step > 1
                    ? 'bg-[#00a699] text-white cursor-pointer'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
              </button>
              <span
                className={`text-[11px] sm:text-xs mt-1.5 font-semibold tracking-tight ${
                  step === 1 ? 'text-[#00a699]' : 'text-muted-foreground'
                }`}
              >
                Checkout
              </span>
            </div>

            {/* Step 2: Pembayaran */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                  step === 2
                    ? 'bg-[#00a699] text-white ring-4 ring-[#00a699]/15 shadow-xs'
                    : step > 2
                    ? 'bg-[#00a699] text-white cursor-pointer'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '2'}
              </button>
              <span
                className={`text-[11px] sm:text-xs mt-1.5 font-semibold tracking-tight ${
                  step === 2 ? 'text-[#00a699]' : 'text-muted-foreground'
                }`}
              >
                Pembayaran
              </span>
            </div>

            {/* Step 3: Selesai */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                  step === 3
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/15 shadow-xs'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {step === 3 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '3'}
              </div>
              <span
                className={`text-[11px] sm:text-xs mt-1.5 font-semibold tracking-tight ${
                  step === 3 ? 'text-emerald-600' : 'text-muted-foreground'
                }`}
              >
                Selesai
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 1: SATU HALAMAN CHECKOUT LENGKAP                        */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-4 sm:space-y-5">
            {/* 1. KARTU ALAMAT PENGIRIMAN (DENGAN MOTIF GARIS TEAL TEMA PROJEK) */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
              {/* Garis Aksen Sesuai Tema Projek Krafita (Teal & Slate) */}
              <div
                className="h-1 sm:h-1.5 w-full"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #00a699, #00a699 14px, #ffffff 14px, #ffffff 22px, #008f84 22px, #008f84 36px, #ffffff 36px, #ffffff 44px)',
                }}
              />

              <div className="p-4 sm:p-5 space-y-3">
                {/* Header Alamat */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#00a699]">
                    <MapPin className="w-4 h-4 text-[#00a699]" />
                    <span>Alamat Pengiriman</span>
                  </div>

                  {hasPhysicalItems && (
                    <button
                      type="button"
                      onClick={() => setIsAddressListModalOpen(true)}
                      className="text-xs font-semibold text-[#00a699] hover:underline cursor-pointer transition-colors"
                    >
                      Ubah
                    </button>
                  )}
                </div>

                {hasPhysicalItems ? (
                  selectedAddress ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-xs sm:text-sm font-bold text-foreground">
                          {selectedAddress.recipientName} ({selectedAddress.phone})
                        </strong>
                        {selectedAddress.isDefault && (
                          <span className="text-[10px] font-semibold text-[#00a699] border border-[#00a699]/40 bg-[#00a699]/10 rounded px-1.5 py-0.2">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selectedAddress.addressLine}, {selectedAddress.city}, {selectedAddress.province}, ID{' '}
                        {selectedAddress.postalCode}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nama Penerima"
                          value={quickAddress.recipientName}
                          onChange={(e) => setQuickAddress({ ...quickAddress, recipientName: e.target.value })}
                          className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-[#00a699]"
                        />
                        <input
                          type="tel"
                          placeholder="No. Telepon / WhatsApp"
                          value={quickAddress.phone}
                          onChange={(e) => setQuickAddress({ ...quickAddress, phone: e.target.value })}
                          className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-[#00a699]"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Alamat Lengkap (Jalan, RT/RW, Kelurahan, Kecamatan)"
                        value={quickAddress.addressLine}
                        onChange={(e) => setQuickAddress({ ...quickAddress, addressLine: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-[#00a699]"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Kota / Kab"
                          value={quickAddress.city}
                          onChange={(e) => setQuickAddress({ ...quickAddress, city: e.target.value })}
                          className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-[#00a699]"
                        />
                        <input
                          type="text"
                          placeholder="Provinsi"
                          value={quickAddress.province}
                          onChange={(e) => setQuickAddress({ ...quickAddress, province: e.target.value })}
                          className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-[#00a699]"
                        />
                        <input
                          type="text"
                          placeholder="Kode Pos"
                          value={quickAddress.postalCode}
                          onChange={(e) => setQuickAddress({ ...quickAddress, postalCode: e.target.value })}
                          className="h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:border-[#00a699]"
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="py-1 text-xs text-muted-foreground flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#00a699] border border-[#00a699]/40 bg-[#00a699]/10 rounded px-1.5 py-0.5">
                      Digital
                    </span>
                    <span>Pesanan Produk Digital — File dapat langsung diunduh secara instan setelah pembayaran.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. KARTU PRODUK DIPESAN (PER TOKO DENGAN TABEL BERSIH TANPA VOUCHER & CHAT SEKARANG) */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden divide-y divide-border/60">
              {/* Desktop Header Tabel */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3.5 bg-muted/20 text-xs font-semibold text-muted-foreground border-b border-border/60">
                <span className="col-span-6 font-bold text-foreground">Produk Dipesan</span>
                <span className="col-span-2 text-center">Harga Satuan</span>
                <span className="col-span-2 text-center">Jumlah</span>
                <span className="col-span-2 text-right">Subtotal Produk</span>
              </div>

              {itemsByShop.map((shopGroup) => {
                const shopTotal = shopGroup.items.reduce(
                  (acc, item) => acc + item.price * (item.qty || 1),
                  0
                )

                return (
                  <div key={shopGroup.shopId} className="p-4 sm:p-5 space-y-4">
                    {/* Baris Informasi Toko (Official Store Badge Tema Teal) */}
                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                      <span className="text-[10px] font-bold text-white bg-[#00a699] rounded px-1.5 py-0.5">
                        Official Store
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        {shopGroup.shopName}
                      </span>
                    </div>

                    {/* Baris Item Produk */}
                    <div className="divide-y divide-border/40">
                      {shopGroup.items.map((item) => (
                        <div key={item.productId} className="py-3 sm:py-3.5">
                          {/* Desktop Grid Layout */}
                          <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                            <div className="col-span-6 flex items-start gap-3">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted/40 shrink-0 border border-border/60">
                                <Image
                                  src={
                                    item.imageUrl ||
                                    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80'
                                  }
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2">
                                  {item.title}
                                </h4>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                  <span>
                                    {item.type === 'digital' ? 'Tipe: Digital' : 'Tipe: Produk Fisik'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="col-span-2 text-center text-xs font-medium text-foreground">
                              {formatPrice(item.price)}
                            </div>

                            <div className="col-span-2 text-center text-xs font-medium text-foreground">
                              {item.qty}
                            </div>

                            <div className="col-span-2 text-right text-xs font-bold text-foreground">
                              {formatPrice(item.price * (item.qty || 1))}
                            </div>
                          </div>

                          {/* Mobile Stack Layout */}
                          <div className="md:hidden flex items-start gap-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted/40 shrink-0 border border-border/60">
                              <Image
                                src={
                                  item.imageUrl ||
                                  'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80'
                                }
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="text-xs font-semibold text-foreground line-clamp-2">
                                {item.title}
                              </h4>
                              <div className="text-[11px] text-muted-foreground">
                                {item.type === 'digital' ? 'Digital' : 'Fisik'}
                              </div>
                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-muted-foreground">
                                  {item.qty} x {formatPrice(item.price)}
                                </span>
                                <span className="font-bold text-foreground">
                                  {formatPrice(item.price * (item.qty || 1))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Proteksi Kerusakan Produk (Tema Warna Teal Krafita) */}
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasProtection}
                          onChange={(e) => setHasProtection(e.target.checked)}
                          className="rounded border-border text-[#00a699] focus:ring-[#00a699] cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">Proteksi Kerusakan</span>
                            <span className="text-[9px] font-bold text-white bg-[#00a699] rounded px-1.5 py-0.2">
                              Baru
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block">
                            Dapatkan kompensasi 100% jika barang rusak atau cacat selama pengiriman.
                          </span>
                        </div>
                      </label>
                      <span className="font-semibold text-foreground shrink-0">{formatPrice(500)}</span>
                    </div>

                    {/* Bagian Bawah: Pesan ke Penjual & Opsi Pengiriman */}
                    <div className="pt-3 border-t border-border/40 grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Pesan Opsional */}
                      <div className="md:col-span-5 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">Pesan:</span>
                        <input
                          type="text"
                          placeholder="(Opsional) Tinggalkan catatan..."
                          value={buyerNotes[shopGroup.items[0]?.productId || ''] || ''}
                          onChange={(e) =>
                            setBuyerNotes({
                              ...buyerNotes,
                              [shopGroup.items[0]?.productId || '']: e.target.value,
                            })
                          }
                          className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#00a699]"
                        />
                      </div>

                      {/* Opsi Pengiriman */}
                      {hasPhysicalItems ? (
                        <div className="md:col-span-7 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/60">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-foreground">Opsi Pengiriman:</span>
                              <span className="text-muted-foreground">{selectedShipping.name}</span>
                              <span className="text-[11px] text-[#00a699] font-medium">
                                ({selectedShipping.estimatedDays})
                              </span>
                            </div>
                         
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-foreground">
                              {formatPrice(selectedShipping.cost)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsShippingModalOpen(true)}
                              className="text-xs font-semibold text-[#00a699] hover:underline cursor-pointer"
                            >
                              Ubah
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="md:col-span-7 p-2.5 rounded-xl bg-muted/20 border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                          <span>Pengiriman Otomatis Instant Cloud</span>
                          <span className="font-bold text-[#00a699]">Gratis (Rp 0)</span>
                        </div>
                      )}
                    </div>

                    {/* Subtotal Per Toko */}
                    <div className="pt-2 text-right">
                      <span className="text-xs text-muted-foreground mr-2">
                        Total Pesanan ({shopGroup.items.length} Produk):
                      </span>
                      <strong className="text-sm sm:text-base font-bold text-[#00a699]">
                        {formatPrice(
                          shopTotal +
                            (hasPhysicalItems ? selectedShipping.cost : 0) +
                            protectionCost
                        )}
                      </strong>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 3. KARTU METODE PEMBAYARAN & RINCIAN BIAYA (BEBAS DARI SUBTITLE) */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-xs p-4 sm:p-6 space-y-5">
              {/* Header Metode Pembayaran */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">Metode Pembayaran</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{selectedPaymentLabel}</span>
                  <button
                    type="button"
                    onClick={() => setIsPaymentSelectorOpen(!isPaymentSelectorOpen)}
                    className="text-xs font-bold text-[#00a699] uppercase tracking-wide hover:underline cursor-pointer"
                  >
                    {isPaymentSelectorOpen ? 'Tutup' : 'UBAH'}
                  </button>
                </div>
              </div>

              {/* Selector Opsi Metode Pembayaran (SUBTITLE DIHAPUS, TEMA TEAL BERSIH) */}
              {isPaymentSelectorOpen && (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2.5 animate-in fade-in duration-200">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    PILIH METODE PEMBAYARAN:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('snap')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        selectedPaymentMethod === 'snap'
                          ? 'border-[#00a699] bg-[#00a699]/5 text-[#00a699] font-bold ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#00a699] shrink-0" />
                      <span className="text-xs font-semibold">Midtrans Snap</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('va-bca')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        selectedPaymentMethod === 'va-bca'
                          ? 'border-[#00a699] bg-[#00a699]/5 text-[#00a699] font-bold ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#00a699] shrink-0" />
                      <span className="text-xs font-semibold">BCA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('va-mandiri')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        selectedPaymentMethod === 'va-mandiri'
                          ? 'border-[#00a699] bg-[#00a699]/5 text-[#00a699] font-bold ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#00a699] shrink-0" />
                      <span className="text-xs font-semibold">Mandiri</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('va-bni')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        selectedPaymentMethod === 'va-bni'
                          ? 'border-[#00a699] bg-[#00a699]/5 text-[#00a699] font-bold ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#00a699] shrink-0" />
                      <span className="text-xs font-semibold">BNI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('va-bri')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        selectedPaymentMethod === 'va-bri'
                          ? 'border-[#00a699] bg-[#00a699]/5 text-[#00a699] font-bold ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#00a699] shrink-0" />
                      <span className="text-xs font-semibold">BRI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('qris')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        selectedPaymentMethod === 'qris'
                          ? 'border-[#00a699] bg-[#00a699]/5 text-[#00a699] font-bold ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-[#00a699] shrink-0" />
                      <span className="text-xs font-semibold">QRIS</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tabel Rincian Biaya (Bersih Tanpa Potongan Voucher) */}
              <div className="pt-2 flex flex-col items-end">
                <div className="w-full sm:max-w-md space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal Pesanan</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>

                  {protectionCost > 0 && (
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Total Proteksi Produk</span>
                      <span className="font-medium text-foreground">{formatPrice(protectionCost)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal Pengiriman</span>
                    <span className="font-medium text-foreground">
                      {hasPhysicalItems ? formatPrice(shippingCost) : 'Rp 0'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Biaya Layanan Krafita</span>
                    <span className="font-medium text-foreground">{formatPrice(serviceFee)}</span>
                  </div>

                  {/* Garis Total Pembayaran */}
                  <div className="pt-3 border-t border-border/80 flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">Total Pembayaran</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#00a699] tracking-tight">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Baris Disclaimer & Tombol Buat Pesanan */}
              <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed text-center sm:text-left">
                  Dengan mengeklik &quot;Buat Pesanan&quot;, saya telah menyetujui{' '}
                  <span className="text-[#00a699] cursor-pointer hover:underline font-medium">
                    Syarat & Ketentuan
                  </span>{' '}
                  serta kebijakan keamanan belanja di Krafita.
                </p>

                <Button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={isCreatingOrder}
                  className="w-full sm:w-auto min-w-[200px] h-11 sm:h-12 bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    'Buat Pesanan'
                  )}
                </Button>
              </div>
            </div>

            {/* STICKY BOTTOM BAR KHUSUS MOBILE UNTUK KENYAMANAN PENGGUNA */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-3 sm:hidden shadow-lg flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground block">Total Pembayaran</span>
                <span className="text-base font-extrabold text-[#00a699] truncate block">
                  {formatPrice(grandTotal)}
                </span>
              </div>

              <Button
                type="button"
                onClick={handleCreateOrder}
                disabled={isCreatingOrder}
                className="h-10 px-6 bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer shrink-0"
              >
                {isCreatingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat Pesanan'}
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: HALAMAN INSTRUKSI PEMBAYARAN (SNAP / QRIS / VA)      */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header Tagihan Transaksi */}
            <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Tagihan Pembayaran
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#00a699] mt-0.5">
                  {formatPrice(grandTotal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ID Transaksi: <strong className="font-mono text-foreground">{orderCode}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Menunggu Pembayaran
                </span>
                <div className="flex items-center gap-1 text-muted-foreground/80 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Selesaikan dalam 23 jam 59 menit</span>
                </div>
              </div>
            </div>

            {/* Card Kontainer Pembayaran di Step 2 */}
            <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-7 space-y-6">

              {/* TAB 1: MIDTRANS SNAP (EMBED LANGSUNG) */}
              <div className={paymentTab === 'snap' ? 'block space-y-4 max-w-[500px] mx-auto' : 'hidden'}>
                <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                    <div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Metode Lengkap
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        Midtrans Secure Checkout
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00a699]/10 text-[#00a699] text-[11px] font-semibold border border-[#00a699]/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00a699]" />
                      <span>Resmi & Terenkripsi</span>
                    </div>
                  </div>

                  <div className="w-full min-h-[560px] bg-muted/20 rounded-xl overflow-hidden flex flex-col justify-start relative">
                    {!isSnapLoaded && (
                      <div className="absolute inset-0 z-10 bg-card/90 flex flex-col items-center justify-center gap-2.5 text-muted-foreground px-4 text-center pointer-events-none">
                        <Loader2 className="w-7 h-7 animate-spin text-[#00a699]" />
                        <p className="text-xs font-semibold text-foreground">
                          Menyiapkan antarmuka pembayaran Midtrans Snap...
                        </p>
                      </div>
                    )}
                    <div id="snap-embed-container" ref={snapContainerRef} className="w-full min-h-[560px]" />
                  </div>
                </div>
              </div>

              {/* TAB 2: QRIS E-WALLET SANLANCE */}
              <div className={paymentTab === 'qris' ? 'block space-y-5 max-w-[480px] mx-auto' : 'hidden'}>
                <div className="text-center space-y-1">
                  <h4 className="font-bold text-foreground text-sm sm:text-base">QRIS Standar Nasional</h4>
                  <p className="text-xs text-muted-foreground">
                    Scan menggunakan GoPay, ShopeePay, Dana, OVO, atau mobile banking apa pun.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-2xl border border-border/60">
                  <div className="bg-card p-2.5 rounded-xl shadow-xs border border-border/80 max-w-[300px] w-full">
                    <img
                      id="qris-sanlance-image"
                      src="/images/qris-merchant.png"
                      alt="QRIS Standar Pembayaran Nasional - Sanlance NMID ID1026526624386"
                      className="w-full h-auto object-contain rounded-lg select-auto cursor-pointer block"
                    />
                  </div>

                  <div className="mt-3 text-center space-y-2 w-full">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Merchant: Sanlance</span>
                      <p className="text-[11px] text-muted-foreground font-mono">NMID: ID1026526624386</p>
                      <div className="text-sm sm:text-base font-extrabold text-[#00a699] pt-1">
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
                        className="h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer bg-card"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#00a699]" />
                        Salin URL QRIS
                      </Button>
                      <a
                        href="/images/qris-merchant.png"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/40 text-foreground text-xs font-semibold shadow-2xs transition-all cursor-pointer h-8"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Gambar
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 3: VIRTUAL ACCOUNT BANK */}
              <div className={paymentTab === 'va' ? 'block space-y-5 max-w-[480px] mx-auto' : 'hidden'}>
                <div className="bg-muted/20 rounded-xl border border-border/60 p-4 space-y-3">
                  <div className="pb-2 border-b border-border/40">
                    <span className="text-[10px] font-semibold text-muted-foreground block">Metode Pembayaran</span>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {selectedPaymentLabel}
                    </h4>
                  </div>

                  {isRequestingVa ? (
                    <div className="py-5 flex flex-col items-center justify-center gap-1.5">
                      <Loader2 className="w-5 h-5 animate-spin text-[#00a699]" />
                      <span className="text-xs text-muted-foreground">Membuat nomor VA...</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground block">
                        Nomor Virtual Account:
                      </span>
                      <div className="flex items-center justify-between gap-2 bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
                        <span className="font-mono text-base sm:text-lg font-extrabold text-[#00a699] tracking-wider select-all break-all">
                          {vaData?.vaNumber || '55040884893457780391174'}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(vaData?.vaNumber || '', 'Nomor VA')}
                          className="h-8 px-2.5 gap-1 text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Salin
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManualCheckStatus}
                  disabled={isSyncingPayment}
                  className="h-9 px-4 rounded-xl text-xs font-semibold border-border hover:bg-muted/40 cursor-pointer w-full sm:w-auto"
                >
                  {isSyncingPayment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Mengecek...
                    </>
                  ) : (
                    'Cek Status Pembayaran'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: STATUS TRANSAKSI (NOTA LUNAS, UNDUHAN & PELACAKAN)   */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Banner Sukses Pembayaran */}
            <div className="bg-card border border-emerald-500/30 rounded-2xl p-5 sm:p-7 text-center space-y-2.5 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                Pembayaran Berhasil Dikonfirmasi!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Pesanan Anda telah diverifikasi lunas. Rincian nota transaksi resmi telah diterbitkan di bawah ini.
              </p>
            </div>

            {/* NOTA RESMI TRANSAKSI */}
            <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-8 space-y-5 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
              {/* Cap Stempel Lunas Minimalis */}
              <div className="absolute right-6 top-6 sm:right-8 sm:top-8 rotate-12 select-none pointer-events-none opacity-80">
                <div className="border-2 border-emerald-600 rounded-xl px-3 py-1 text-center">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest">
                    LUNAS / PAID
                  </span>
                </div>
              </div>

              {/* Header Nota */}
              <div className="border-b border-border/60 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#00a699] text-white font-black flex items-center justify-center text-xs">
                    K
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-foreground">KRAFITA</span>
                  <span className="text-xs text-muted-foreground">| Faktur Transaksi Marketplace</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground pt-1.5">
                  <div>
                    No. Faktur: <strong className="font-mono text-foreground">INV-{orderCode}</strong>
                  </div>
                  <div className="sm:text-right">
                    Waktu:{' '}
                    <strong className="text-foreground">
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

              {/* Rincian Barang yang Dibeli */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Rincian Barang / Produk:
                </span>
                <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/60 text-xs">
                  <div className="bg-muted/20 p-2.5 font-bold text-muted-foreground grid grid-cols-12 gap-2">
                    <span className="col-span-8">Nama Produk & Toko</span>
                    <span className="col-span-4 text-right">Subtotal</span>
                  </div>
                  {checkoutItems.map((it) => (
                    <div key={it.productId} className="p-2.5 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-8 space-y-0.5">
                        <strong className="text-foreground block font-semibold">{it.title}</strong>
                        <span className="text-[11px] text-muted-foreground block">
                          Toko: {it.shopName} | {it.qty} x {formatPrice(it.price)}
                        </span>
                      </div>
                      <div className="col-span-4 text-right font-medium text-foreground">
                        {formatPrice(it.price * it.qty)}
                      </div>
                    </div>
                  ))}
                  {hasPhysicalItems && (
                    <div className="p-2.5 grid grid-cols-12 gap-2 text-muted-foreground">
                      <span className="col-span-8">Ongkos Kirim ({selectedShipping.courier})</span>
                      <span className="col-span-4 text-right font-medium text-foreground">
                        {formatPrice(shippingCost)}
                      </span>
                    </div>
                  )}
                  {protectionCost > 0 && (
                    <div className="p-2.5 grid grid-cols-12 gap-2 text-muted-foreground">
                      <span className="col-span-8">Proteksi Kerusakan Produk</span>
                      <span className="col-span-4 text-right font-medium text-foreground">
                        {formatPrice(protectionCost)}
                      </span>
                    </div>
                  )}
                  <div className="p-2.5 grid grid-cols-12 gap-2 text-muted-foreground">
                    <span className="col-span-8">Biaya Layanan Krafita</span>
                    <span className="col-span-4 text-right font-medium text-foreground">
                      {formatPrice(serviceFee)}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/20 font-bold text-foreground grid grid-cols-12 gap-2 text-xs sm:text-sm">
                    <span className="col-span-8">Total Pembayaran Lunas</span>
                    <span className="col-span-4 text-right text-[#00a699] font-extrabold">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Cetak Nota */}
              <div className="pt-1 flex justify-end print:hidden">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-8 px-3 rounded-lg text-xs font-semibold text-foreground border-border hover:bg-muted/40 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Unduh Nota PDF
                </Button>
              </div>
            </div>

            {/* UNDUHAN PRODUK DIGITAL (Jika Ada) */}
            {hasDigitalItems && (
              <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/60">
                  <div className="w-8 h-8 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Unduhan Produk Digital</h3>
                    <p className="text-[11px] text-muted-foreground">
                      File produk digital Anda siap diunduh secara instan dari cloud storage Krafita.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
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
                          className="p-3.5 rounded-xl bg-muted/20 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-bold text-[#00a699] bg-[#00a699]/10 px-1.5 py-0.5 rounded">
                              Siap Diunduh
                            </span>
                            <h4 className="font-semibold text-foreground text-xs sm:text-sm">{it.title}</h4>
                            <p className="text-[11px] text-muted-foreground">
                              Sisa kuota: <strong className="text-foreground">{remainingCount}x</strong> dari 5x
                              unduhan
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={() => handleDownloadDigitalProduct(targetId)}
                            disabled={downloadingItemId === targetId || remainingCount <= 0}
                            className="h-9 px-4 bg-[#00a699] hover:bg-[#008f84] text-white rounded-lg font-semibold text-xs shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                          >
                            {downloadingItemId === targetId ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyiapkan...
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" /> Unduh File
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* PELACAKAN PENGIRIMAN KURIR (Jika Ada Produk Fisik) */}
            {hasPhysicalItems && (
              <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-foreground text-sm">Pelacakan Pengiriman</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Kurir: <strong>{selectedShipping.courier}</strong> ({selectedShipping.name})
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg">
                    {orderDetailData?.trackingNumber || `KRFEXP-${orderCode.replace(/[^0-9]/g, '')}`}
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  <div className="relative flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs sm:text-sm text-foreground">Pesanan Dibuat</h5>
                      <p className="text-[11px] text-muted-foreground">
                        Pesanan telah tercatat di sistem Krafita.
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs sm:text-sm text-foreground">Pembayaran Terverifikasi (Lunas)</h5>
                      <p className="text-[11px] text-muted-foreground">
                        Pembayaran lunas.
                      </p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#00a699] text-white flex items-center justify-center shrink-0 z-10 shadow-xs ring-4 ring-[#00a699]/15">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-semibold text-xs sm:text-sm text-[#00a699]">
                          Menunggu Pesanan Diterima
                        </h5>
                        <span className="text-[9px] bg-[#00a699]/10 text-[#00a699] font-bold px-1.5 py-0.2 rounded">
                          Berjalan
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Menunggu penjual menerima dan mengonfirmasi pesanan Anda.
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
                  className="flex-1 h-11 bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  Lihat Riwayat Pesanan Saya <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/"
                className="flex-1 h-11 bg-muted/40 hover:bg-muted/70 text-foreground rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-border"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali Belanja
              </Link>
            </div>
          </div>
        )}

        {/* MODAL PILIH OPSI PENGIRIMAN */}
        {isShippingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h4 className="font-bold text-sm text-foreground">Pilih Opsi Pengiriman</h4>
                <button
                  type="button"
                  onClick={() => setIsShippingModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {shippingOptions.map((opt) => {
                  const isSelected = selectedShipping.id === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedShipping(opt)
                        setIsShippingModalOpen(false)
                        toast.success(`Ekspedisi diubah ke ${opt.name} (${formatPrice(opt.cost)})`)
                      }}
                      className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#00a699] bg-[#00a699]/5 text-[#00a699] ring-1 ring-[#00a699]/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block font-bold text-xs">{opt.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {opt.courier} • Estimasi {opt.estimatedDays}
                        </span>
                      </div>
                      <span className="font-bold text-xs text-[#00a699] shrink-0">
                        {formatPrice(opt.cost)}
                      </span>
                    </button>
                  )
                })}
              </div>
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
          <p className="text-xs text-muted-foreground font-medium">Memuat checkout Krafita...</p>
        </div>
      }
    >
      <CheckoutWizard />
    </Suspense>
  )
}
