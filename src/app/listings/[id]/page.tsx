'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InlineBookingWidget } from '@/components/booking/InlineBookingWidget'
import { ArrowLeft, MapPin, Users, Square, Clock, Phone, Mail, Globe, Star, Wifi, Zap, Car, Shield, Utensils, WashingMachine, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const ListingLocationMap = dynamic(() => import('@/components/map/ListingLocationMap').then(mod => ({ default: mod.ListingLocationMap })), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  )
})

interface Listing {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  hourly_rate: number
  daily_rate: number
  weekly_rate: number | null
  min_booking_hours: number
  max_booking_hours: number | null
  space_size_sqm: number | null
  max_trucks: number
  images: string[]
  status: string
}

interface Amenities {
  running_water: boolean
  electricity_type: string
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
}

interface VenueOwner {
  first_name: string
  last_name: string
  email: string
  phone: string | null
  business_name: string
  business_type: string
  website: string | null
  contact_phone: string | null
  business_description: string | null
  verification_status: string
}

interface ListingWithDetails extends Listing {
  amenities: Amenities
  venue_owner: VenueOwner
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [listing, setListing] = useState<ListingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      setLoading(true)
      
      // Fetch listing with amenities and user details
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          amenities (*),
          users!owner_id (
            first_name,
            last_name,
            email,
            phone,
            role
          )
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error fetching listing:', error)
        setError('Listing not found')
        return
      }

      if (!data) {
        setError('Listing not found')
        return
      }

      // Safely transform the data to match our interface
      const transformedData: ListingWithDetails = {
        ...data,
        amenities: Array.isArray(data.amenities) ? data.amenities[0] : data.amenities,
        venue_owner: {
          first_name: data.users?.first_name || '',
          last_name: data.users?.last_name || '',
          email: data.users?.email || '',
          phone: data.users?.phone || '',
          business_name: data.title || 'Venue', // Use listing title as business name
          business_type: 'venue_owner', // Default business type
          website: '', // Not available in simplified schema
          contact_phone: data.users?.phone || '', // Use user phone as contact phone
          business_description: data.description || '', // Use listing description
          verification_status: 'verified' // Default to verified for simplicity
        }
      }

      setListing(transformedData)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, any> = {
      wifi: Wifi,
      electricity: Zap,
      parking: Car,
      security: Shield,
      seating: Utensils,
      waste: WashingMachine
    }
    return icons[amenity] || Utensils
  }

  const formatBusinessType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or is no longer available.</p>
          <Link href="/browse">
            <Button className="bg-warm-red hover:bg-warm-red/90 text-white">
              Back to Browse
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/browse" className="inline-flex items-center gap-2 text-charcoal hover:text-warm-red transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Browse</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          {/* Professional Image Gallery */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2 h-96">
              {listing.images && listing.images.length > 0 ? (
                <>
                  {/* Main large image */}
                  <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => {/* TODO: Open lightbox */}}
                    />
                  </div>
                  
                  {/* Smaller images grid */}
                  {listing.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${listing.title} ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => {/* TODO: Open lightbox */}}
                      />
                      {index === 3 && listing.images.length > 5 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold">+{listing.images.length - 5} more</span>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-span-4 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="h-4 w-4" />
                <span>{listing.address}, {listing.city}, {listing.postal_code}</span>
              </div>
              
              {/* Key features */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{listing.max_trucks === 1 ? '1 truck' : `Up to ${listing.max_trucks} trucks`}</span>
                </div>
                {listing.space_size_sqm && (
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4 text-gray-500" />
                    <span>{listing.space_size_sqm} sqm</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Min {listing.min_booking_hours}h booking</span>
                </div>
              </div>
            </div>
            
            {/* Clean pricing display */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  £{listing.daily_rate}<span className="text-lg font-normal text-gray-600">/day</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  £{listing.hourly_rate}/hour • {listing.weekly_rate ? `£${listing.weekly_rate}/week` : 'Weekly rates available'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-charcoal">About This Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Key Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-charcoal">Venue Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-mustard/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Square className="h-6 w-6 text-mustard" />
                    </div>
                    <div className="text-sm text-gray-600">Space Size</div>
                    <div className="font-semibold text-charcoal">
                      {listing.space_size_sqm ? `${listing.space_size_sqm} sqm` : 'Varies'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-electric-blue/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-electric-blue" />
                    </div>
                    <div className="text-sm text-gray-600">Max Trucks</div>
                    <div className="font-semibold text-charcoal">{listing.max_trucks}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities - Airbnb Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">What this place offers</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.amenities ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listing.amenities.running_water && (
                      <div className="flex items-center gap-3 py-3">
                        <Utensils className="h-5 w-5 text-gray-900" />
                        <span className="text-gray-900">Running water</span>
                      </div>
                    )}
                    {listing.amenities.electricity_type !== 'none' && (
                      <div className="flex items-center gap-3 py-3">
                        <Zap className="h-5 w-5 text-gray-900" />
                        <span className="text-gray-900">{listing.amenities.electricity_type.toUpperCase()} electricity</span>
                      </div>
                    )}
                    {listing.amenities.gas_supply && (
                      <div className="flex items-center gap-3 py-3">
                        <span className="w-5 h-5 text-xl flex items-center justify-center text-gray-900">🔥</span>
                        <span className="text-gray-900">Gas supply</span>
                      </div>
                    )}
                    {listing.amenities.shelter && (
                      <div className="flex items-center gap-3 py-3">
                        <Shield className="h-5 w-5 text-gray-900" />
                        <span className="text-gray-900">Covered area</span>
                      </div>
                    )}
                    {listing.amenities.toilet_facilities && (
                      <div className="flex items-center gap-3 py-3">
                        <span className="w-5 h-5 text-xl flex items-center justify-center text-gray-900">🚻</span>
                        <span className="text-gray-900">Toilet facilities</span>
                      </div>
                    )}
                    {listing.amenities.wifi && (
                      <div className="flex items-center gap-3 py-3">
                        <Wifi className="h-5 w-5 text-gray-900" />
                        <span className="text-gray-900">Wifi</span>
                      </div>
                    )}
                    {listing.amenities.customer_seating && (
                      <div className="flex items-center gap-3 py-3">
                        <span className="w-5 h-5 text-xl flex items-center justify-center text-gray-900">💺</span>
                        <span className="text-gray-900">Customer seating</span>
                      </div>
                    )}
                    {listing.amenities.waste_disposal && (
                      <div className="flex items-center gap-3 py-3">
                        <WashingMachine className="h-5 w-5 text-gray-900" />
                        <span className="text-gray-900">Waste disposal</span>
                      </div>
                    )}
                    {listing.amenities.overnight_parking && (
                      <div className="flex items-center gap-3 py-3">
                        <Car className="h-5 w-5 text-gray-900" />
                        <span className="text-gray-900">Free parking on premises</span>
                      </div>
                    )}
                    {listing.amenities.security_cctv && (
                      <div className="flex items-center gap-3 py-3">
                        <Shield className="h-5 w-5 text-gray-900" />
                        <span className="text-gray-900">CCTV security</span>
                      </div>
                    )}
                    {listing.amenities.loading_dock && (
                      <div className="flex items-center gap-3 py-3">
                        <span className="w-5 h-5 text-xl flex items-center justify-center text-gray-900">🚛</span>
                        <span className="text-gray-900">Loading dock</span>
                      </div>
                    )}
                    {listing.amenities.refrigeration_access && (
                      <div className="flex items-center gap-3 py-3">
                        <span className="w-5 h-5 text-xl flex items-center justify-center text-gray-900">❄️</span>
                        <span className="text-gray-900">Refrigeration access</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Amenity information is being updated.</p>
                  </div>
                )}
                
                {/* Show all amenities button like Airbnb */}
                <div className="mt-6">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Show all amenities
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing and Booking Info - Pitchup Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Pricing & Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Main pricing display */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Daily rate</div>
                        <div className="text-3xl font-bold text-gray-900">
                          £{listing.daily_rate}
                        </div>
                        <div className="text-sm text-gray-500">per day</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Hourly rate</div>
                        <div className="text-xl font-semibold text-gray-700">
                          £{listing.hourly_rate}
                        </div>
                        <div className="text-sm text-gray-500">per hour</div>
                      </div>
                    </div>
                    {listing.weekly_rate && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">Weekly rate: <span className="font-semibold text-gray-900">£{listing.weekly_rate}</span></div>
                      </div>
                    )}
                  </div>

                  {/* Booking details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Min. {listing.min_booking_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{listing.max_trucks === 1 ? '1 truck max' : `Max ${listing.max_trucks} trucks`}</span>
                    </div>
                  </div>

                  {/* Booking notes */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Best value for longer bookings</p>
                      <p>Daily rate applies automatically for bookings of 8+ hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inline Booking Widget */}
            <div className="lg:sticky lg:top-6 z-[1000]">
              <InlineBookingWidget listing={listing as any} />
            </div>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ListingLocationMap
                    latitude={(listing as any).latitude || 51.5074} // Default to London if no coordinates
                    longitude={(listing as any).longitude || -0.1278}
                    title={listing.title}
                    address={`${listing.address}, ${listing.city}`}
                    height="h-48"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{listing.title}</div>
                    <div className="text-gray-600">{listing.address}</div>
                    <div className="text-gray-600">{listing.city}, {listing.postal_code}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const address = `${listing.address}, ${listing.city}, ${listing.postal_code}`
                      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                      window.open(mapsUrl, '_blank')
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Venue Owner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-charcoal flex items-center gap-2">
                  Hosted by {listing.venue_owner.business_name}
                  {listing.venue_owner.verification_status === 'verified' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-charcoal">
                    {listing.venue_owner.first_name} {listing.venue_owner.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatBusinessType(listing.venue_owner.business_type)}
                  </p>
                </div>

                {listing.venue_owner.business_description && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {listing.venue_owner.business_description}
                  </p>
                )}

                <Separator />

                <div className="space-y-3">
                  {(listing.venue_owner.contact_phone || listing.venue_owner.phone) && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {listing.venue_owner.contact_phone || listing.venue_owner.phone}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{listing.venue_owner.email}</span>
                  </div>
                  
                  {listing.venue_owner.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a 
                        href={listing.venue_owner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-electric-blue hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full">
                  Contact Host
                </Button>
              </CardContent>
            </Card>

            {/* Reviews Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-charcoal flex items-center gap-2">
                  <Star className="h-5 w-5 text-mustard" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews yet</p>
                  <p className="text-sm">Be the first to review this venue!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 