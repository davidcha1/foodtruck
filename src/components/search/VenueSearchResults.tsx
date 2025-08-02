'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { MapPin, DollarSign, Star, Truck, Droplets, Zap, Wifi, Car, Shield, Eye, Clock, ArrowUpDown, Loader2, MapIcon } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row']
type Amenity = Database['public']['Tables']['amenities']['Row']

export interface VenueWithAmenities extends Listing {
  amenities: Amenity | null
  distance?: number
  owner_name?: string
  business_name?: string
}

interface VenueSearchResultsProps {
  venues: VenueWithAmenities[]
  isLoading: boolean
  sortBy: string
  onSortChange: (sort: string) => void
  resultCount: number
  selectedVenue?: string | null
  onVenueSelect?: (venueId: string | null) => void
}

const amenityIcons = {
  running_water: { icon: Droplets, label: 'Water', color: 'text-blue-500' },
  electricity_type: { icon: Zap, label: 'Power', color: 'text-yellow-500' },
  gas_supply: { icon: '🔥', label: 'Gas', color: 'text-orange-500' },
  shelter: { icon: '🏠', label: 'Shelter', color: 'text-gray-500' },
  toilet_facilities: { icon: '🚻', label: 'Toilets', color: 'text-blue-500' },
  wifi: { icon: Wifi, label: 'WiFi', color: 'text-electric-blue' },
  customer_seating: { icon: '💺', label: 'Seating', color: 'text-gray-500' },
  waste_disposal: { icon: '🗑️', label: 'Waste', color: 'text-gray-500' },
  overnight_parking: { icon: Car, label: 'Parking', color: 'text-gray-600' },
  security_cctv: { icon: Shield, label: 'Security', color: 'text-green-500' },
  loading_dock: { icon: '🚛', label: 'Loading', color: 'text-blue-500' },
  refrigeration_access: { icon: '❄️', label: 'Fridge', color: 'text-blue-400' }
}

function VenueCard({ venue }: { venue: VenueWithAmenities }) {
  const getPrice = () => {
    const { hourly_rate, daily_rate, weekly_rate } = venue
    const prices = []
    if (hourly_rate) prices.push(`£${hourly_rate}/hr`)
    if (daily_rate) prices.push(`£${daily_rate}/day`)
    if (weekly_rate) prices.push(`£${weekly_rate}/wk`)
    return prices.join(' • ')
  }

  const getPrimaryPrice = () => {
    if (venue.daily_rate) return { amount: venue.daily_rate, period: 'day' }
    if (venue.hourly_rate) return { amount: venue.hourly_rate, period: 'hr' }
    if (venue.weekly_rate) return { amount: venue.weekly_rate, period: 'wk' }
    return null
  }

  const getAmenityBadges = () => {
    if (!venue.amenities) return []
    
    const badges = []
    if (venue.amenities.running_water) badges.push({ label: 'Water', icon: Droplets, color: 'bg-blue-100 text-blue-700' })
    if (venue.amenities.electricity_type !== 'none') badges.push({ label: 'Power', icon: Zap, color: 'bg-yellow-100 text-yellow-700' })
    if (venue.amenities.gas_supply) badges.push({ label: 'Gas', icon: '🔥', color: 'bg-orange-100 text-orange-700' })
    if (venue.amenities.wifi) badges.push({ label: 'WiFi', icon: Wifi, color: 'bg-electric-blue/10 text-electric-blue' })
    if (venue.amenities.toilet_facilities) badges.push({ label: 'Toilets', icon: '🚻', color: 'bg-blue-100 text-blue-700' })
    if (venue.amenities.overnight_parking) badges.push({ label: 'Parking', icon: Car, color: 'bg-gray-100 text-gray-700' })
    if (venue.amenities.security_cctv) badges.push({ label: 'Security', icon: Shield, color: 'bg-green-100 text-green-700' })
    
    return badges.slice(0, 5) // Show max 5 badges
  }

  const amenityBadges = getAmenityBadges()
  const primaryPrice = getPrimaryPrice()

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-gray-200 bg-white group overflow-hidden">
      <div className="flex min-h-[180px]">
        {/* Image Carousel - Fixed Width */}
        <div className="relative w-80 flex-shrink-0">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative h-full min-h-[180px]"
          >
            <ImageCarousel
              images={venue.images || []}
              title={venue.title}
              height="h-full"
              showDots={false}
              showCounter={true}
              className="rounded-l-lg"
            />
            
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {venue.distance && (
                <Badge className="bg-white/90 text-gray-700 text-xs font-medium shadow-sm backdrop-blur-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {venue.distance.toFixed(1)} km
                </Badge>
              )}
              {venue.space_size_sqm && (
                <Badge className="bg-white/90 text-gray-700 text-xs font-medium shadow-sm backdrop-blur-sm">
                  {venue.space_size_sqm} sqm
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Area - Pitchup Style */}
        <div className="flex-1 flex">
          <Link href={`/listings/${venue.id}`} className="flex-1 block">
            <div className="p-5 h-full cursor-pointer flex flex-col">
              {/* Header Section */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {venue.title}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {venue.address}, {venue.city}, {venue.state}
                    </span>
                  </div>
                </div>
                
                {venue.max_trucks && venue.max_trucks > 1 && (
                  <Badge variant="outline" className="border-blue-200 text-blue-600 text-sm">
                    <Truck className="h-4 w-4 mr-1" />
                    {venue.max_trucks} trucks
                  </Badge>
                )}
              </div>

              {/* Description */}
              {venue.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {venue.description}
                </p>
              )}

              {/* Amenities */}
              {amenityBadges.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {amenityBadges.slice(0, 4).map((badge, index) => {
                      const Icon = badge.icon
                      return (
                        <Badge key={index} variant="secondary" className="text-xs font-normal px-2 py-1 bg-gray-100 text-gray-700 border-0">
                          {typeof Icon === 'string' ? (
                            <span className="mr-1">{Icon}</span>
                          ) : (
                            <Icon className="h-3 w-3 mr-1" />
                          )}
                          {badge.label}
                        </Badge>
                      )
                    })}
                    {amenityBadges.length > 4 && (
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                        +{amenityBadges.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Spacer to push pricing to bottom */}
              <div className="flex-1"></div>

              {/* Bottom Section - Always Visible Pricing */}
              <div className="mt-auto pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    {primaryPrice && (
                      <>
                        <span className="text-xl font-semibold text-gray-900">
                          £{primaryPrice.amount}
                        </span>
                        <span className="text-sm text-gray-500">
                          per {primaryPrice.period}
                        </span>
                      </>
                    )}
                    {!primaryPrice && (
                      <span className="text-lg font-semibold text-gray-900">
                        Price on request
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    View details →
                  </div>
                </div>
                {primaryPrice && getPrice() !== `£${primaryPrice.amount}/${primaryPrice.period}` && (
                  <div className="text-xs text-gray-500 mt-1">
                    {getPrice()}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="font-bebas text-2xl font-bold text-charcoal mb-2">
          No Venues Found
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Try adjusting your search criteria or expanding your search radius to find more venues in your area.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="space-y-1">
            <li>• Increase your search radius</li>
            <li>• Remove some amenity filters</li>
            <li>• Try a different location</li>
            <li>• Adjust your price range</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <div className="flex min-h-[180px]">
            <div className="w-80 bg-gray-200 rounded-l-lg min-h-[180px]"></div>
            <div className="flex-1 p-5 flex flex-col">
              <div className="space-y-3 flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-auto">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function VenueSearchResults({ venues, isLoading, sortBy, onSortChange, resultCount, selectedVenue, onVenueSelect }: VenueSearchResultsProps) {
  return (
    <div className="py-4">
      {/* Clean Sort Header */}
      {!isLoading && resultCount > 0 && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            {resultCount} {resultCount === 1 ? 'venue' : 'venues'} found
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-40 border border-gray-300 focus:border-blue-500 bg-white text-gray-900 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Best Match</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <LoadingState />
      ) : venues.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
          
          {/* Load more (placeholder for future pagination) */}
          {venues.length >= 20 && (
            <div className="text-center py-6">
              <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium">
                Load More Venues
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 