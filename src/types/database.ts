export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'member' | 'vendor'
export type ProductType = 'physical' | 'digital'
export type ProductStatus = 'draft' | 'published' | 'archived'
export type OrderStatus = 'pending_payment' | 'paid' | 'expired' | 'cancelled'
export type FulfilmentStatus = 'waiting' | 'processing' | 'shipped' | 'completed' | 'cancelled'
export type PayoutStatus = 'pending' | 'paid' | 'rejected'
export type ReportStatus = 'open' | 'resolved' | 'dismissed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          display_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          display_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          display_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          id: string
          profile_id: string
          recipient_name: string
          phone: string
          address_line: string
          city: string
          province: string
          postal_code: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          recipient_name: string
          phone: string
          address_line: string
          city: string
          province: string
          postal_code: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          recipient_name?: string
          phone?: string
          address_line?: string
          city?: string
          province?: string
          postal_code?: string
          is_default?: boolean
          created_at?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          id: string
          profile_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          flat_shipping_cost: number
          whatsapp: string | null
          phone: string | null
          email: string | null
          city: string | null
          province: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          flat_shipping_cost?: number
          whatsapp?: string | null
          phone?: string | null
          email?: string | null
          city?: string | null
          province?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          flat_shipping_cost?: number
          whatsapp?: string | null
          phone?: string | null
          email?: string | null
          city?: string | null
          province?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          slug: string
          icon_url: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name: string
          slug: string
          icon_url?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name?: string
          slug?: string
          icon_url?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          shop_id: string
          category_id: string
          brand_id: string | null
          title: string
          slug: string
          description: string
          type: ProductType
          price: number
          compare_price: number | null
          stock: number | null
          sku: string | null
          weight: number | null
          attributes: Json
          status: ProductStatus
          rating_avg: number
          rating_count: number
          search_tsv: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          category_id: string
          brand_id?: string | null
          title: string
          slug: string
          description: string
          type?: ProductType
          price: number
          compare_price?: number | null
          stock?: number | null
          sku?: string | null
          weight?: number | null
          attributes?: Json
          status?: ProductStatus
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          category_id?: string
          brand_id?: string | null
          title?: string
          slug?: string
          description?: string
          type?: ProductType
          price?: number
          compare_price?: number | null
          stock?: number | null
          sku?: string | null
          weight?: number | null
          attributes?: Json
          status?: ProductStatus
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          path: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          path: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          path?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      digital_files: {
        Row: {
          id: string
          product_id: string
          path: string
          file_name: string
          size: number
          format: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          path: string
          file_name: string
          size: number
          format: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          path?: string
          file_name?: string
          size?: number
          format?: string
          created_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          profile_id: string
          product_id: string
          qty: number
          buyer_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          product_id: string
          qty?: number
          buyer_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          product_id?: string
          qty?: number
          buyer_note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          id: string
          profile_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          profile_id: string
          code: string
          status: OrderStatus
          total: number
          snap_token: string | null
          expires_at: string | null
          paid_at: string | null
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          code: string
          status?: OrderStatus
          total: number
          snap_token?: string | null
          expires_at?: string | null
          paid_at?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          code?: string
          status?: OrderStatus
          total?: number
          snap_token?: string | null
          expires_at?: string | null
          paid_at?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          shop_id: string
          product_id: string
          title: string
          price: number
          compare_price: number | null
          qty: number
          shipping_cost: number
          commission_amount: number
          net_amount: number
          buyer_note: string | null
          fulfilment_status: FulfilmentStatus
          tracking_number: string | null
          downloads_count: number
          download_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          shop_id: string
          product_id: string
          title: string
          price: number
          compare_price?: number | null
          qty: number
          shipping_cost?: number
          commission_amount?: number
          net_amount?: number
          buyer_note?: string | null
          fulfilment_status?: FulfilmentStatus
          tracking_number?: string | null
          downloads_count?: number
          download_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          shop_id?: string
          product_id?: string
          title?: string
          price?: number
          compare_price?: number | null
          qty?: number
          shipping_cost?: number
          commission_amount?: number
          net_amount?: number
          buyer_note?: string | null
          fulfilment_status?: FulfilmentStatus
          tracking_number?: string | null
          downloads_count?: number
          download_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          payment_type: string | null
          midtrans_status: string | null
          gross_amount: number
          raw: Json
          signature_valid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          payment_type?: string | null
          midtrans_status?: string | null
          gross_amount: number
          raw?: Json
          signature_valid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          payment_type?: string | null
          midtrans_status?: string | null
          gross_amount?: number
          raw?: Json
          signature_valid?: boolean
          created_at?: string
        }
        Relationships: []
      }
      download_logs: {
        Row: {
          id: string
          order_item_id: string
          profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          order_item_id: string
          profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          order_item_id?: string
          profile_id?: string
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          profile_id: string
          order_item_id: string
          rating: number
          body: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          profile_id: string
          order_item_id: string
          rating: number
          body?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          profile_id?: string
          order_item_id?: string
          rating?: number
          body?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          product_id: string
          profile_id: string
          parent_id: string | null
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          profile_id: string
          parent_id?: string | null
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          profile_id?: string
          parent_id?: string | null
          body?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          target_type: 'product' | 'comment'
          target_id: string
          reporter_id: string
          reason: string
          status: ReportStatus
          created_at: string
        }
        Insert: {
          id?: string
          target_type: 'product' | 'comment'
          target_id: string
          reporter_id: string
          reason: string
          status?: ReportStatus
          created_at?: string
        }
        Update: {
          id?: string
          target_type?: 'product' | 'comment'
          target_id?: string
          reporter_id?: string
          reason?: string
          status?: ReportStatus
          created_at?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          id: string
          shop_id: string
          amount: number
          bank_name: string
          account_no: string
          account_holder: string
          status: PayoutStatus
          notes: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          shop_id: string
          amount: number
          bank_name: string
          account_no: string
          account_holder: string
          status?: PayoutStatus
          notes?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          shop_id?: string
          amount?: number
          bank_name?: string
          account_no?: string
          account_holder?: string
          status?: PayoutStatus
          notes?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          id: string
          email: string
          code: string
          type: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          code: string
          type?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          code?: string
          type?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
        }
        Relationships: []
      }
      v_admin_pending_payouts: {
        Row: {
          request_id: string
          shop_name: string
          shop_email: string | null
          shop_phone: string | null
          amount: number
          bank_name: string
          account_no: string
          account_holder: string
          status: PayoutStatus
          created_at: string
        }
        Relationships: []
      }
      v_admin_open_reports: {
        Row: {
          report_id: string
          target_type: 'product' | 'comment'
          target_id: string
          reporter_name: string | null
          reason: string
          status: ReportStatus
          created_at: string
        }
        Relationships: []
      }
    }
    Functions: {
      become_vendor: {
        Args: {
          p_name: string
          p_slug: string
          p_description?: string | null
          p_logo_url?: string | null
          p_flat_shipping_cost?: number
          p_whatsapp?: string | null
          p_phone?: string | null
          p_email?: string | null
          p_city?: string | null
          p_province?: string | null
        }
        Returns: Database['public']['Tables']['shops']['Row']
      }
      create_order: {
        Args: {
          p_address_id?: string | null
          p_platform_commission_percent?: number
        }
        Returns: {
          order_id: string
          order_code: string
          total_amount: number
          order_status: OrderStatus
          is_free: boolean
        }[]
      }
      apply_payment_status: {
        Args: {
          p_code: string
          p_status: string
          p_gross: number
          p_type?: string | null
          p_raw?: Json
        }
        Returns: boolean
      }
      consume_download: {
        Args: {
          p_item_id: string
        }
        Returns: {
          storage_path: string
          file_name: string
          remaining_downloads: number
        }[]
      }
      vendor_update_fulfilment: {
        Args: {
          p_item_id: string
          p_status: FulfilmentStatus
          p_tracking?: string | null
        }
        Returns: boolean
      }
      confirm_received: {
        Args: {
          p_item_id: string
        }
        Returns: boolean
      }
      request_payout: {
        Args: {
          p_amount: number
          p_bank_name: string
          p_account_no: string
          p_account_holder: string
        }
        Returns: Database['public']['Tables']['payout_requests']['Row']
      }
      expire_pending_orders: {
        Args: Record<string, never>
        Returns: number
      }
      auto_complete_orders: {
        Args: Record<string, never>
        Returns: number
      }
    }
  }
}
