'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { VenueSearchFilters, type SearchFilters } from '@/components/search/VenueSearchFilters'
import { VenueSearchResults, type VenueWithAmenities } from '@/components/search/VenueSearchResults'
import { geocodeLocation, filterVenuesByDistance, getPopularCityCoordinates, type Coordinates } from '@/lib/geocoding'
import dynamic from 'next/dynamic'

const VenueMap = dynamic(() => import('@/components/map/VenueMap').then(mod => ({ default: mod.VenueMap })), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  )
})
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MapPin, Search, Map, List } from 'lucide-react'

const initialFilters: SearchFilters = {
  location: '',
  radius: 25,
  coordinates: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  priceType: 'hourly',
  minSpaceSize: undefined,
  maxTrucks: undefined,
  businessTypes: [],
  verificationStatus: 'all',
  amenities: {
    running_water: false,
    electricity_240v: false,
    electricity_110v: false,
    gas_supply: false,
    shelter: false,
    toilet_facilities: false,
    wifi: false,
    customer_seating: false,
    waste_disposal: false,
    overnight_parking: false,
    security_cctv: false,
    loading_dock: false,
    refrigeration_access: false
  },
  availability: {
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    flexibleDates: false
  },
  sortBy: 'relevance'
}

export default function BrowsePage() {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [venues, setVenues] = useState<VenueWithAmenities[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [resultCount, setResultCount] = useState(0)
  const [showMap, setShowMap] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)

  // Search function
  const searchVenues = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('Searching venues with filters:', filters)

      // Handle location geocoding first
      let searchCoordinates: Coordinates | null = null
      
      if (filters.location.trim()) {
        // First try to get coordinates from popular cities (instant)
        searchCoordinates = getPopularCityCoordinates(filters.location)
        
        // If not a popular city, try geocoding API
        if (!searchCoordinates) {
          toast.info('Finding location...', { duration: 2000 })
          const geocodingResult = await geocodeLocation(filters.location)
          if (geocodingResult) {
            searchCoordinates = geocodingResult.coordinates
            console.log(`Geocoded "${filters.location}" to:`, searchCoordinates)
          } else {
            toast.error(`Could not find location: ${filters.location}`)
          }
        }
      }

      // Start with the base query including amenities and user details
      let query = supabase
        .from('listings')
        .select(`
          *,
          amenities (*),
          users!owner_id (
            first_name,
            last_name,
            role
          )
        `)
        .eq('status', 'active')

      // Apply price filters
      if (filters.minPrice || filters.maxPrice) {
        const priceColumn = filters.priceType === 'hourly' ? 'hourly_rate' : 
                           filters.priceType === 'daily' ? 'daily_rate' : 'weekly_rate'
        
        if (filters.minPrice) {
          query = query.gte(priceColumn, filters.minPrice)
        }
        if (filters.maxPrice) {
          query = query.lte(priceColumn, filters.maxPrice)
        }
      }

      // Apply space filters
      if (filters.minSpaceSize) {
        query = query.gte('space_size_sqm', filters.minSpaceSize)
      }

      if (filters.maxTrucks) {
        query = query.gte('max_trucks', filters.maxTrucks)
      }

      // Business type and verification filters are disabled for now (no venue_owner_profiles table)
      // if (filters.businessTypes.length > 0) {
      //   query = query.in('users.venue_owner_profiles.business_type', filters.businessTypes as any)
      // }

      // if (filters.verificationStatus !== 'all') {
      //   query = query.eq('users.venue_owner_profiles.verification_status', filters.verificationStatus)
      // }

      // For location searches with coordinates, we'll filter all venues and then filter by distance
      // For text-only searches without coordinates, fall back to database text search
      if (filters.location.trim() && !searchCoordinates) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,address.ilike.%${filters.location}%`)
      }

      // Apply sorting (but if we have location coordinates, we'll sort by distance later)
      if (!searchCoordinates) {
        switch (sortBy) {
          case 'price_low':
            const lowPriceColumn = filters.priceType === 'hourly' ? 'hourly_rate' : 
                                  filters.priceType === 'daily' ? 'daily_rate' : 'weekly_rate'
            query = query.order(lowPriceColumn, { ascending: true })
            break
          case 'price_high':
            const highPriceColumn = filters.priceType === 'hourly' ? 'hourly_rate' : 
                                   filters.priceType === 'daily' ? 'daily_rate' : 'weekly_rate'
            query = query.order(highPriceColumn, { ascending: false })
            break
          case 'newest':
            query = query.order('created_at', { ascending: false })
            break
          default:
            query = query.order('created_at', { ascending: false })
        }
      } else {
        // For location-based searches, get more results to filter by distance
        query = query.order('created_at', { ascending: false })
      }

      // Limit results (more if we need to filter by distance)
      query = query.limit(searchCoordinates ? 100 : 20)

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Raw venue data:', data) // Debug log

      // Transform the data to match our interface
      let transformedVenues: VenueWithAmenities[] = (data || []).map((item: any) => {
        const venue: VenueWithAmenities = {
          ...item,
          amenities: Array.isArray(item.amenities) ? item.amenities[0] : item.amenities,
          business_name: item.title || 'Venue', // Use listing title as business name for now
          owner_name: item.users ? `${item.users.first_name || ''} ${item.users.last_name || ''}`.trim() || 'Owner' : 'Owner'
        }
        return venue
      })

      // Apply distance filtering if we have search coordinates
      if (searchCoordinates) {
        console.log(`Filtering venues within ${filters.radius}km of`, searchCoordinates)
        transformedVenues = filterVenuesByDistance(transformedVenues, searchCoordinates, filters.radius)
        console.log(`Found ${transformedVenues.length} venues within radius`)
        
        // Sort by distance for location-based searches
        if (sortBy === 'distance' || (sortBy === 'relevance' && searchCoordinates)) {
          transformedVenues.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        }
      }

      // Apply amenity filters on client side
      let filteredVenues = transformedVenues
      const hasAmenityFilters = Object.values(filters.amenities).some(Boolean)
      
      if (hasAmenityFilters) {
        filteredVenues = transformedVenues.filter(venue => {
          if (!venue.amenities) return false
          
          return Object.entries(filters.amenities).every(([amenity, required]) => {
            if (!required) return true
            
            if (amenity === 'electricity_240v') {
              return venue.amenities?.electricity_type === '240v'
            } else if (amenity === 'electricity_110v') {
              return venue.amenities?.electricity_type === '110v'
            } else {
              return venue.amenities?.[amenity as keyof typeof venue.amenities] === true
            }
          })
        })
      }

      // Apply final sorting (for non-distance sorts)
      if (searchCoordinates && sortBy !== 'distance' && sortBy !== 'relevance') {
        switch (sortBy) {
          case 'price_low':
            const lowPriceColumn = filters.priceType === 'hourly' ? 'hourly_rate' : 
                                  filters.priceType === 'daily' ? 'daily_rate' : 'weekly_rate'
            filteredVenues.sort((a, b) => (a[lowPriceColumn] || 0) - (b[lowPriceColumn] || 0))
            break
          case 'price_high':
            const highPriceColumn = filters.priceType === 'hourly' ? 'hourly_rate' : 
                                   filters.priceType === 'daily' ? 'daily_rate' : 'weekly_rate'
            filteredVenues.sort((a, b) => (b[highPriceColumn] || 0) - (a[highPriceColumn] || 0))
            break
          case 'newest':
            filteredVenues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            break
        }
      }

      // Limit final results
      filteredVenues = filteredVenues.slice(0, 20)

      console.log(`Found ${transformedVenues.length} total venues, ${filteredVenues.length} after filtering`)
      setVenues(filteredVenues)
      setResultCount(filteredVenues.length)

      // Update search coordinates in filters for map centering
      if (searchCoordinates && searchCoordinates !== filters.coordinates) {
        setFilters(prev => ({ ...prev, coordinates: searchCoordinates }))
      }

      if (searchCoordinates && filteredVenues.length > 0) {
        toast.success(`Found ${filteredVenues.length} venues near ${filters.location}`)
      }

    } catch (error: any) {
      console.error('Error searching venues:', error)
      toast.error('Failed to search venues. Please try again.')
      setVenues([])
      setResultCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [filters, sortBy])

  // Initial load and re-search when sort changes
  useEffect(() => {
    searchVenues()
  }, [searchVenues])

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleSearch = () => {
    searchVenues()
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    // Search will be triggered automatically by the useEffect dependency on searchVenues
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Filters - Full Width */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <VenueSearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Full Width Split Layout - Pitchup Style */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Results Panel - Left Side */}
        <div className={`${showMap ? 'w-[60%]' : 'w-full'} transition-all duration-300 overflow-hidden border-r border-gray-200`}>
          <div className="h-full overflow-y-auto bg-white">
            {/* Header with toggle */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-gray-900">
                      Food Truck Venues
                    </h1>
                    <span className="text-sm text-gray-600">{resultCount} venues found</span>
                  </div>
                </div>
                
                {/* Map Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={!showMap ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowMap(false)}
                    className="rounded-r-none h-8"
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                  <Button
                    variant={showMap ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowMap(true)}
                    className="rounded-l-none h-8"
                  >
                    <Map className="h-4 w-4 mr-1" />
                    Map
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Content */}
            <div className="px-6">
              <VenueSearchResults
                venues={venues}
                isLoading={isLoading}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                resultCount={resultCount}
                selectedVenue={selectedVenue}
                onVenueSelect={setSelectedVenue}
              />
            </div>
          </div>
        </div>

        {/* Map Panel - Right Side */}
        {showMap && (
          <div className="w-[40%] transition-all duration-300">
            <VenueMap
              venues={venues}
              selectedVenue={selectedVenue}
              onVenueSelect={setSelectedVenue}
              height="h-full"
              className=""
            />
          </div>
        )}
      </div>
    </div>
  )
} 