import { Database } from './database'

// Database table types
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type VenueOwnerProfile = Database['public']['Tables']['venue_owner_profiles']['Row']
export type VenueOwnerProfileInsert = Database['public']['Tables']['venue_owner_profiles']['Insert']
export type VenueOwnerProfileUpdate = Database['public']['Tables']['venue_owner_profiles']['Update']

export type VendorProfile = Database['public']['Tables']['vendor_profiles']['Row']
export type VendorProfileInsert = Database['public']['Tables']['vendor_profiles']['Insert']
export type VendorProfileUpdate = Database['public']['Tables']['vendor_profiles']['Update']

export type Listing = Database['public']['Tables']['listings']['Row']
export type ListingInsert = Database['public']['Tables']['listings']['Insert']
export type ListingUpdate = Database['public']['Tables']['listings']['Update']

export type Amenities = Database['public']['Tables']['amenities']['Row']
export type AmenitiesInsert = Database['public']['Tables']['amenities']['Insert']
export type AmenitiesUpdate = Database['public']['Tables']['amenities']['Update']

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// Enhanced types with relationships
export interface UserWithProfile extends User {
  venue_owner_profile?: VenueOwnerProfile | null
  vendor_profile?: VendorProfile | null
}

export interface ListingWithAmenities extends Listing {
  amenities?: Amenities | null
  owner?: UserWithProfile
}

export interface BookingWithDetails extends Booking {
  listing?: ListingWithAmenities
  vendor?: UserWithProfile
  payment?: Payment
}

// User roles
export type UserRole = 'venue_owner' | 'vendor'

// Business and cuisine types
export type BusinessType = 'pub' | 'restaurant' | 'cafe' | 'event_space' | 'retail' | 'office' | 'other'
export type CuisineType = 'asian' | 'mexican' | 'italian' | 'american' | 'indian' | 'mediterranean' | 'vegan' | 'dessert' | 'beverages' | 'fusion' | 'other'

// Search and filter types
export interface SearchFilters {
  location?: string
  radius?: number
  minPrice?: number
  maxPrice?: number
  date?: string
  startTime?: string
  endTime?: string
  cuisineType?: CuisineType[]
  businessType?: BusinessType[]
  amenities?: {
    runningWater?: boolean
    electricity?: boolean
    gas?: boolean
    shelter?: boolean
    toilet?: boolean
    wifi?: boolean
    seating?: boolean
    wasteDisposal?: boolean
    overnightParking?: boolean
    security?: boolean
    loadingDock?: boolean
    refrigeration?: boolean
  }
}

// Location types
export interface Location {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Booking types
export interface BookingRequest {
  listingId: string
  date: string
  startTime: string
  endTime: string
  totalHours: number
  totalCost: number
  specialRequests?: string
}

// Dashboard types
export interface VenueOwnerStats {
  totalListings: number
  activeBookings: number
  totalEarnings: number
  pendingBookings: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface VendorStats {
  totalBookings: number
  upcomingBookings: number
  totalSpent: number
  completedBookings: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

// Form types
export interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface VenueOwnerProfileFormData {
  businessName: string
  businessType?: BusinessType
  businessRegistration?: string
  businessAddress?: string
  website?: string
  socialLinks?: string[]
  businessHours?: string
  contactPerson?: string
  contactPhone?: string
  businessDescription?: string
  profilePhoto?: File
}

export interface VendorProfileFormData {
  foodTruckName: string
  cuisineType?: CuisineType
  foodLicenseNumber?: string
  truckDescription?: string
  menuHighlights?: string[]
  website?: string
  instagramHandle?: string
  facebookPage?: string
  socialLinks?: string[]
  profilePhoto?: File
  truckSize?: string
  setupTimeMinutes?: number
  operatingRadiusKm?: number
  minBookingValue?: number
  specialRequirements?: string
}

export interface ListingFormData {
  title: string
  description: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude: number
  longitude: number
  hourlyRate: number
  dailyRate: number
  weeklyRate?: number
  minBookingHours: number
  maxBookingHours?: number
  spaceSizeSqm?: number
  maxTrucks?: number
  images: File[]
  amenities: {
    runningWater: boolean
    electricityType: 'none' | '240v' | '110v' | 'other'
    gasSupply: boolean
    shelter: boolean
    toiletFacilities: boolean
    wifi: boolean
    customerSeating: boolean
    wasteDisposal: boolean
    overnightParking: boolean
    securityCctv: boolean
    loadingDock: boolean
    refrigerationAccess: boolean
  }
}

// Verification status type
export type VerificationStatus = 'pending' | 'verified' | 'rejected'

// Helper types for the enhanced views
export interface VenueOwnerWithProfile {
  id: string
  email: string
  role: 'venue_owner'
  first_name: string | null
  last_name: string | null
  phone: string | null
  business_name: string | null
  business_type: BusinessType | null
  business_registration: string | null
  business_address: string | null
  website: string | null
  social_links: string[] | null
  business_hours: string | null
  contact_person: string | null
  contact_phone: string | null
  business_description: string | null
  profile_photo_url: string | null
  verification_status: VerificationStatus
}

export interface VendorWithProfile {
  id: string
  email: string
  role: 'vendor'
  first_name: string | null
  last_name: string | null
  phone: string | null
  food_truck_name: string
  cuisine_type: CuisineType | null
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
  verification_status: VerificationStatus
} 