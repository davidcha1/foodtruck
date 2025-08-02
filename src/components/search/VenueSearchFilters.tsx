'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Search, MapPin, Zap, Droplets, Wifi, Car, Shield, X, ChevronDown, Filter, SlidersHorizontal, Building, Truck, Clock, Settings, MapIcon, Navigation } from 'lucide-react'
import { getCurrentLocation, popularUKCities } from '@/lib/geocoding'
import { toast } from 'sonner'

export interface SearchFilters {
  location: string
  radius: number
  coordinates?: { lat: number; lng: number }
  minPrice: number | undefined
  maxPrice: number | undefined
  priceType: 'hourly' | 'daily' | 'weekly'
  minSpaceSize: number | undefined
  maxTrucks: number | undefined
  businessTypes: string[]
  verificationStatus: 'all' | 'verified' | 'pending'
  amenities: {
    running_water: boolean
    electricity_240v: boolean
    electricity_110v: boolean
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
  availability: {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    flexibleDates: boolean
  }
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'distance' | 'newest' | 'rating'
}

interface VenueSearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
  isLoading?: boolean
}

export function VenueSearchFilters({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  isLoading = false 
}: VenueSearchFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  // Close location suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
    }

    if (showLocationSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLocationSuggestions])

  const handleLocationChange = (value: string) => {
    onFiltersChange({ ...filters, location: value })
    setShowLocationSuggestions(false)
  }

  const handleCurrentLocation = async () => {
    setGettingLocation(true)
    try {
      const coordinates = await getCurrentLocation()
      if (coordinates) {
        // Set coordinates and clear location text since we're using GPS
        onFiltersChange({ 
          ...filters, 
          location: 'Current Location',
          coordinates: coordinates 
        })
        toast.success('Using your current location')
        onSearch() // Trigger search immediately
      } else {
        toast.error('Unable to get your location. Please check permissions.')
      }
    } catch (error) {
      toast.error('Failed to get your location')
    } finally {
      setGettingLocation(false)
    }
  }

  const handleRadiusChange = (value: string) => {
    onFiltersChange({ ...filters, radius: parseInt(value) })
  }

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value)
    onFiltersChange({ ...filters, [field]: numValue })
  }

  const handleBusinessTypeToggle = (type: string) => {
    const newTypes = filters.businessTypes.includes(type)
      ? filters.businessTypes.filter(t => t !== type)
      : [...filters.businessTypes, type]
    onFiltersChange({ ...filters, businessTypes: newTypes })
  }

  const handleAmenityToggle = (amenity: keyof SearchFilters['amenities']) => {
    onFiltersChange({
      ...filters,
      amenities: {
        ...filters.amenities,
        [amenity]: !filters.amenities[amenity]
      }
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      radius: 25,
      coordinates: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      priceType: 'daily',
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
        refrigeration_access: false,
      },
      availability: {
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        flexibleDates: false,
      },
      sortBy: 'relevance'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.location) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.businessTypes.length > 0) count++
    if (filters.minSpaceSize) count++
    if (Object.values(filters.amenities).some(v => v)) count++
    if (filters.verificationStatus !== 'all') count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      {/* Compact Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Location Search */}
          <div className="flex-1 relative" ref={locationRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="City, suburb, or postcode"
                  value={filters.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => setShowLocationSuggestions(true)}
                  className="pl-11 h-12 border-gray-200 focus:border-blue-500"
                />
              </div>
              
              {/* Current Location Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCurrentLocation}
                disabled={gettingLocation}
                className="h-12 px-3 border-gray-200 hover:border-blue-500"
                title="Use current location"
              >
                {gettingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                ) : (
                  <Navigation className="h-4 w-4 text-blue-600" />
                )}
              </Button>
            </div>
            
            {/* Location Suggestions */}
            {showLocationSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Popular Cities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {popularUKCities.slice(0, 8).map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleLocationChange(city.name)}
                        className="text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => setShowLocationSuggestions(false)}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                  >
                    Close suggestions
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Radius */}
          <div className="w-full lg:w-40">
            <Select value={filters.radius.toString()} onValueChange={handleRadiusChange}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button 
            onClick={onSearch}
            disabled={isLoading}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Price Range Quick Filters */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-600">£</span>
          <Button
            variant={!filters.minPrice && !filters.maxPrice ? "outline" : "default"}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
            className="h-8"
          >
            Any Price
          </Button>
          <Button
            variant={filters.minPrice === 50 && filters.maxPrice === 150 ? "default" : "outline"}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, minPrice: 50, maxPrice: 150 })}
            className="h-8"
          >
            £50-150
          </Button>
          <Button
            variant={filters.minPrice === 150 && filters.maxPrice === 300 ? "default" : "outline"}
            size="sm"
            onClick={() => onFiltersChange({ ...filters, minPrice: 150, maxPrice: 300 })}
            className="h-8"
          >
            £150-300
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Venue Type Quick Filters */}
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-600" />
          {['pub', 'restaurant', 'cafe', 'event_space'].map((type) => (
            <Button
              key={type}
              variant={filters.businessTypes.includes(type) ? "default" : "outline"}
              size="sm"
              onClick={() => handleBusinessTypeToggle(type)}
              className="h-8 capitalize"
            >
              {type === 'event_space' ? 'Events' : type}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="h-8"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          More Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-blue-600 text-white text-xs">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </Button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-gray-600 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters Collapsible */}
      <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
        <CollapsibleContent className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-4 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-900">Advanced Filters</CardTitle>
              <CardDescription className="text-gray-600">
                Refine your search with detailed criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">£</span>
                  Price Range (Daily)
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600 mb-1 block">Minimum</Label>
                    <Input
                      type="number"
                      placeholder="Min £"
                      value={filters.minPrice || ''}
                      onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-1 block">Maximum</Label>
                    <Input
                      type="number"
                      placeholder="Max £"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-1 block">Period</Label>
                    <Select 
                      value={filters.priceType} 
                      onValueChange={(value: 'hourly' | 'daily' | 'weekly') => 
                        onFiltersChange({ ...filters, priceType: value })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Space Requirements */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-600" />
                  Space Requirements
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-1 block">Minimum Space (sqm)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
                      value={filters.minSpaceSize || ''}
                      onChange={(e) => onFiltersChange({ 
                        ...filters, 
                        minSpaceSize: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-1 block">Max Trucks</Label>
                    <Select 
                      value={filters.maxTrucks?.toString() || "any"}
                      onValueChange={(value) => onFiltersChange({ 
                        ...filters, 
                        maxTrucks: value === "any" ? undefined : parseInt(value)
                      })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Any number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any number</SelectItem>
                        <SelectItem value="1">1 truck</SelectItem>
                        <SelectItem value="2">2 trucks</SelectItem>
                        <SelectItem value="3">3 trucks</SelectItem>
                        <SelectItem value="5">5+ trucks</SelectItem>
                        <SelectItem value="10">10+ trucks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Amenities */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  Essential Amenities
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'running_water', label: 'Running Water', icon: Droplets },
                    { key: 'electricity_240v', label: '240V Power', icon: Zap },
                    { key: 'electricity_110v', label: '110V Power', icon: Zap },
                    { key: 'gas_supply', label: 'Gas Supply', icon: Zap },
                    { key: 'wifi', label: 'WiFi', icon: Wifi },
                    { key: 'toilet_facilities', label: 'Toilets', icon: Building },
                    { key: 'customer_seating', label: 'Seating Area', icon: Building },
                    { key: 'overnight_parking', label: 'Overnight Parking', icon: Car },
                    { key: 'security_cctv', label: 'Security/CCTV', icon: Shield },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={filters.amenities[key as keyof SearchFilters['amenities']]}
                        onCheckedChange={() => handleAmenityToggle(key as keyof SearchFilters['amenities'])}
                        className="border-2 border-gray-300 data-[state=checked]:bg-blue-600"
                      />
                      <Label htmlFor={key} className="text-sm text-gray-700 cursor-pointer flex items-center gap-1">
                        <Icon className="h-3 w-3 text-gray-500" />
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Verification Status */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Verification Status
                </Label>
                <Select 
                  value={filters.verificationStatus} 
                  onValueChange={(value: 'all' | 'verified' | 'pending') => 
                    onFiltersChange({ ...filters, verificationStatus: value })
                  }
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All venues</SelectItem>
                    <SelectItem value="verified">Verified only</SelectItem>
                    <SelectItem value="pending">Pending verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
} 