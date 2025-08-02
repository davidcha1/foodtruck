export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'venue_owner' | 'vendor'
          stripe_connect_id: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'venue_owner' | 'vendor'
          stripe_connect_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'venue_owner' | 'vendor'
          stripe_connect_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      venue_owner_profiles: {
        Row: {
          user_id: string
          business_name: string | null
          business_type: 'pub' | 'restaurant' | 'cafe' | 'event_space' | 'retail' | 'office' | 'other' | null
          business_registration: string | null
          business_address: string | null
          website: string | null
          social_links: string[] | null
          business_hours: string | null
          contact_person: string | null
          contact_phone: string | null
          business_description: string | null
          profile_photo_url: string | null
          verification_status: 'pending' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          business_name?: string | null
          business_type?: 'pub' | 'restaurant' | 'cafe' | 'event_space' | 'retail' | 'office' | 'other' | null
          business_registration?: string | null
          business_address?: string | null
          website?: string | null
          social_links?: string[] | null
          business_hours?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          business_description?: string | null
          profile_photo_url?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          business_name?: string | null
          business_type?: 'pub' | 'restaurant' | 'cafe' | 'event_space' | 'retail' | 'office' | 'other' | null
          business_registration?: string | null
          business_address?: string | null
          website?: string | null
          social_links?: string[] | null
          business_hours?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          business_description?: string | null
          profile_photo_url?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_owner_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      vendor_profiles: {
        Row: {
          user_id: string
          food_truck_name: string
          cuisine_type: 'asian' | 'mexican' | 'italian' | 'american' | 'indian' | 'mediterranean' | 'vegan' | 'dessert' | 'beverages' | 'fusion' | 'other' | null
          food_license_number: string | null
          truck_description: string | null
          menu_highlights: string[] | null
          website: string | null
          instagram_handle: string | null
          facebook_page: string | null
          social_links: string[] | null
          profile_photo_url: string | null
          truck_size: string | null
          setup_time_minutes: number
          operating_radius_km: number
          min_booking_value: number | null
          special_requirements: string | null
          verification_status: 'pending' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          food_truck_name: string
          cuisine_type?: 'asian' | 'mexican' | 'italian' | 'american' | 'indian' | 'mediterranean' | 'vegan' | 'dessert' | 'beverages' | 'fusion' | 'other' | null
          food_license_number?: string | null
          truck_description?: string | null
          menu_highlights?: string[] | null
          website?: string | null
          instagram_handle?: string | null
          facebook_page?: string | null
          social_links?: string[] | null
          profile_photo_url?: string | null
          truck_size?: string | null
          setup_time_minutes?: number
          operating_radius_km?: number
          min_booking_value?: number | null
          special_requirements?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          food_truck_name?: string
          cuisine_type?: 'asian' | 'mexican' | 'italian' | 'american' | 'indian' | 'mediterranean' | 'vegan' | 'dessert' | 'beverages' | 'fusion' | 'other' | null
          food_license_number?: string | null
          truck_description?: string | null
          menu_highlights?: string[] | null
          website?: string | null
          instagram_handle?: string | null
          facebook_page?: string | null
          social_links?: string[] | null
          profile_photo_url?: string | null
          truck_size?: string | null
          setup_time_minutes?: number
          operating_radius_km?: number
          min_booking_value?: number | null
          special_requirements?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          address: string
          city: string
          state: string
          postal_code: string
          country: string
          latitude: number
          longitude: number
          location: unknown | null
          hourly_rate: number
          daily_rate: number
          weekly_rate: number | null
          min_booking_hours: number
          max_booking_hours: number | null
          space_size_sqm: number | null
          max_trucks: number
          images: string[]
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          address: string
          city: string
          state: string
          postal_code: string
          country: string
          latitude: number
          longitude: number
          location?: unknown | null
          hourly_rate: number
          daily_rate: number
          weekly_rate?: number | null
          min_booking_hours?: number
          max_booking_hours?: number | null
          space_size_sqm?: number | null
          max_trucks?: number
          images?: string[]
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          latitude?: number
          longitude?: number
          location?: unknown | null
          hourly_rate?: number
          daily_rate?: number
          weekly_rate?: number | null
          min_booking_hours?: number
          max_booking_hours?: number | null
          space_size_sqm?: number | null
          max_trucks?: number
          images?: string[]
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      amenities: {
        Row: {
          id: string
          listing_id: string
          running_water: boolean
          electricity_type: 'none' | '240v' | '110v' | 'other'
          gas_supply: boolean
          shelter: boolean
          toilet_facilities: boolean
          wifi: boolean
          customer_seating: boolean
          waste_disposal: boolean
          overnight_parking: boolean
          security_cctv: boolean
          loading_dock: boolean
          refrigeration_access: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          running_water?: boolean
          electricity_type?: 'none' | '240v' | '110v' | 'other'
          gas_supply?: boolean
          shelter?: boolean
          toilet_facilities?: boolean
          wifi?: boolean
          customer_seating?: boolean
          waste_disposal?: boolean
          overnight_parking?: boolean
          security_cctv?: boolean
          loading_dock?: boolean
          refrigeration_access?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          running_water?: boolean
          electricity_type?: 'none' | '240v' | '110v' | 'other'
          gas_supply?: boolean
          shelter?: boolean
          toilet_facilities?: boolean
          wifi?: boolean
          customer_seating?: boolean
          waste_disposal?: boolean
          overnight_parking?: boolean
          security_cctv?: boolean
          loading_dock?: boolean
          refrigeration_access?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          listing_id: string
          vendor_id: string
          booking_date: string
          start_time: string
          end_time: string
          total_hours: number
          total_cost: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          stripe_payment_intent_id: string | null
          cancellation_reason: string | null
          special_requests: string | null
          venue_owner_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          vendor_id: string
          booking_date: string
          start_time: string
          end_time: string
          total_hours: number
          total_cost: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          cancellation_reason?: string | null
          special_requests?: string | null
          venue_owner_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          vendor_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          total_hours?: number
          total_cost?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          cancellation_reason?: string | null
          special_requests?: string | null
          venue_owner_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          stripe_payment_intent_id: string
          amount: number
          platform_fee: number
          vendor_payout: number
          payment_status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          payout_status: 'pending' | 'paid' | 'failed'
          stripe_transfer_id: string | null
          stripe_refund_id: string | null
          stripe_payout_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          stripe_payment_intent_id: string
          amount: number
          platform_fee: number
          vendor_payout: number
          payment_status?: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          payout_status?: 'pending' | 'paid' | 'failed'
          stripe_transfer_id?: string | null
          stripe_refund_id?: string | null
          stripe_payout_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          platform_fee?: number
          vendor_payout?: number
          payment_status?: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          payout_status?: 'pending' | 'paid' | 'failed'
          stripe_transfer_id?: string | null
          stripe_refund_id?: string | null
          stripe_payout_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 