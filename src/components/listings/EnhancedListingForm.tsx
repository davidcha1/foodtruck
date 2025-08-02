'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { MapPin, DollarSign, Home, Truck, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database'
import { geocodeLocation } from '@/lib/geocoding'

type ListingInsert = Database['public']['Tables']['listings']['Insert']
type AmenityInsert = Database['public']['Tables']['amenities']['Insert']

const electricityTypes = [
  { value: 'none', label: 'None' },
  { value: '240v', label: '240V' },
  { value: '110v', label: '110V' },
  { value: 'other', label: 'Other' }
] as const

export function EnhancedListingForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Start with empty images array - users will add their own
  const [images, setImages] = useState<string[]>([''])

  // Basic listing data
  const [listingData, setListingData] = useState<Partial<ListingInsert>>({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United Kingdom',
    latitude: 0,
    longitude: 0,
    hourly_rate: 0,
    daily_rate: 0,
    weekly_rate: undefined,
    min_booking_hours: 4,
    max_booking_hours: undefined,
    space_size_sqm: undefined,
    max_trucks: 1
  })

  // Amenities data
  const [amenitiesData, setAmenitiesData] = useState({
    running_water: false,
    electricity_type: 'none' as 'none' | '240v' | '110v' | 'other',
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('You must be logged in to create a listing')
      return
    }

    if (user.role !== 'venue_owner') {
      toast.error('Only venue owners can create listings')
      return
    }

    setLoading(true)

    // Declare coordinates outside try block for error logging
    let latitude: number = 52.3555 // Default UK center
    let longitude: number = -1.1743

    try {
      // Check if user is authenticated
      if (!user || !user.id) {
        toast.error('You must be signed in to create a listing')
        router.push('/auth/signin')
        return
      }

      // Validate required fields
      if (!listingData.title || !listingData.description || !listingData.address) {
        toast.error('Please fill in all required fields')
        return
      }

      console.log('Creating listing with user ID:', user.id)
      console.log('Form data:', listingData)

      // Use proper geocoding for UK addresses
      try {
        const fullAddress = `${listingData.address}, ${listingData.city}, ${listingData.postal_code}, UK`
        console.log('Geocoding address:', fullAddress)
        
        const geocodingResult = await geocodeLocation(fullAddress)
        if (geocodingResult) {
          latitude = geocodingResult.coordinates.lat
          longitude = geocodingResult.coordinates.lng
          console.log('Geocoded to:', { latitude, longitude })
        } else {
          // Fallback to city-based coordinates
          if (listingData.city?.toLowerCase().includes('london')) {
            latitude = 51.5074
            longitude = -0.1278
          } else if (listingData.city?.toLowerCase().includes('manchester')) {
            latitude = 53.4808
            longitude = -2.2426
          } else if (listingData.city?.toLowerCase().includes('birmingham')) {
            latitude = 52.4862
            longitude = -1.8904
          } else {
            // Default to London if geocoding fails
            latitude = 51.5074
            longitude = -0.1278
          }
          console.log('Using fallback coordinates:', { latitude, longitude })
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        // Default to London if all else fails
        latitude = 51.5074
        longitude = -0.1278
      }

      // Create the listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          ...listingData,
          owner_id: user.id,
          latitude,
          longitude,
          images: images.filter(img => img.trim() !== ''),
          country: listingData.country || 'United Kingdom'
        } as ListingInsert)
        .select()
        .single()

      if (listingError) throw listingError

      // Create the amenities
      const { error: amenitiesError } = await supabase
        .from('amenities')
        .insert({
          listing_id: listing.id,
          ...amenitiesData
        } as AmenityInsert)

      if (amenitiesError) throw amenitiesError

      toast.success('Listing created successfully!')
      router.push('/dashboard/owner')
    } catch (error: any) {
      console.error('Error creating listing:', error)
      
      // More detailed error reporting
      let errorMessage = 'Failed to create listing'
      if (error.message) {
        errorMessage = error.message
      } else if (error.error_description) {
        errorMessage = error.error_description
      } else if (error.details) {
        errorMessage = error.details
      }
      
      console.log('Listing data that failed:', { 
        ...listingData, 
        latitude, 
        longitude,
        images: images.filter(img => img.trim() !== ''),
        amenities: amenitiesData 
      })
      
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const addImageField = () => {
    setImages([...images, ''])
  }

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, value: string) => {
    const updated = [...images]
    updated[index] = value
    setImages(updated)
  }

  const fillSampleData = () => {
    setListingData({
      title: 'Downtown Food Court Plaza',
      description: 'Modern outdoor plaza in the heart of the business district. Perfect for lunch service with high foot traffic from office workers. Features dedicated food truck parking spots with electrical hookups and water access.',
      address: '123 Business Square',
      city: 'London',
      state: 'Greater London',
      postal_code: 'EC1A 1BB',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.0278,
      hourly_rate: 35,
      daily_rate: 250,
      weekly_rate: 1500,
      min_booking_hours: 4,
      max_booking_hours: 12,
      space_size_sqm: 200,
      max_trucks: 3
    })
    
    setAmenitiesData({
      running_water: true,
      electricity_type: '240v' as const,
      gas_supply: false,
      shelter: true,
      toilet_facilities: true,
      wifi: true,
      customer_seating: true,
      waste_disposal: true,
      overnight_parking: false,
      security_cctv: true,
      loading_dock: false,
      refrigeration_access: false
    })
    
    setImages([
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80'
    ])
  }

  // Show sign-in prompt if user is not authenticated
  if (!user || !user.id) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900">Sign In Required</CardTitle>
            <CardDescription>
              You must be signed in to create a venue listing
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/auth/signin')} className="w-full">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Create New Venue Listing</CardTitle>
                <CardDescription>
                  List your outdoor space for food truck vendors
                </CardDescription>
              </div>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={fillSampleData}
              className="text-sm"
            >
              Fill Sample Data
            </Button>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  value={listingData.title || ''}
                  onChange={(e) => setListingData({ ...listingData, title: e.target.value })}
                  placeholder="e.g., Prime CBD Location - Perfect for Food Trucks"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={listingData.description || ''}
                  onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
                  placeholder="Describe your venue, location benefits, nearby attractions..."
                  rows={4}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={listingData.address || ''}
                  onChange={(e) => setListingData({ ...listingData, address: e.target.value })}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={listingData.city || ''}
                  onChange={(e) => setListingData({ ...listingData, city: e.target.value })}
                  placeholder="Sydney"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={listingData.state || ''}
                  onChange={(e) => setListingData({ ...listingData, state: e.target.value })}
                  placeholder="NSW"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  value={listingData.postal_code || ''}
                  onChange={(e) => setListingData({ ...listingData, postal_code: e.target.value })}
                  placeholder="2000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={listingData.country || 'United Kingdom'}
                  onChange={(e) => setListingData({ ...listingData, country: e.target.value })}
                  placeholder="United Kingdom"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Space Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Space Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="space_size_sqm">Space Size (sqm)</Label>
                <Input
                  id="space_size_sqm"
                  type="number"
                  min="1"
                  value={listingData.space_size_sqm || ''}
                  onChange={(e) => setListingData({ ...listingData, space_size_sqm: parseInt(e.target.value) || undefined })}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_trucks">Maximum Trucks</Label>
                <Input
                  id="max_trucks"
                  type="number"
                  min="1"
                  value={listingData.max_trucks || 1}
                  onChange={(e) => setListingData({ ...listingData, max_trucks: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_booking_hours">Minimum Booking Hours</Label>
                <Input
                  id="min_booking_hours"
                  type="number"
                  min="1"
                  value={listingData.min_booking_hours || 4}
                  onChange={(e) => setListingData({ ...listingData, min_booking_hours: parseInt(e.target.value) || 4 })}
                  placeholder="4"
                />
                <p className="text-xs text-gray-500">
                  Recommended: 4+ hours for food truck service periods
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_booking_hours">Maximum Booking Hours (optional)</Label>
                <Input
                  id="max_booking_hours"
                  type="number"
                  min="1"
                  value={listingData.max_booking_hours || ''}
                  onChange={(e) => setListingData({ ...listingData, max_booking_hours: parseInt(e.target.value) || undefined })}
                  placeholder="12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={listingData.hourly_rate || ''}
                  onChange={(e) => setListingData({ ...listingData, hourly_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="25.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_rate">Daily Rate ($) *</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={listingData.daily_rate || ''}
                  onChange={(e) => setListingData({ ...listingData, daily_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="150.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly_rate">Weekly Rate ($) - Optional</Label>
                <Input
                  id="weekly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={listingData.weekly_rate || ''}
                  onChange={(e) => setListingData({ ...listingData, weekly_rate: parseFloat(e.target.value) || undefined })}
                  placeholder="900.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Facilities</CardTitle>
            <CardDescription>Select all amenities available at your venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Amenities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="running_water"
                  checked={amenitiesData.running_water}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, running_water: !!checked })}
                />
                <Label htmlFor="running_water">Running Water</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gas_supply"
                  checked={amenitiesData.gas_supply}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, gas_supply: !!checked })}
                />
                <Label htmlFor="gas_supply">Gas Supply</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shelter"
                  checked={amenitiesData.shelter}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, shelter: !!checked })}
                />
                <Label htmlFor="shelter">Shelter/Cover</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="toilet_facilities"
                  checked={amenitiesData.toilet_facilities}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, toilet_facilities: !!checked })}
                />
                <Label htmlFor="toilet_facilities">Toilet Facilities</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wifi"
                  checked={amenitiesData.wifi}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, wifi: !!checked })}
                />
                <Label htmlFor="wifi">WiFi Access</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customer_seating"
                  checked={amenitiesData.customer_seating}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, customer_seating: !!checked })}
                />
                <Label htmlFor="customer_seating">Customer Seating</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="waste_disposal"
                  checked={amenitiesData.waste_disposal}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, waste_disposal: !!checked })}
                />
                <Label htmlFor="waste_disposal">Waste Disposal</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overnight_parking"
                  checked={amenitiesData.overnight_parking}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, overnight_parking: !!checked })}
                />
                <Label htmlFor="overnight_parking">Overnight Parking</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="security_cctv"
                  checked={amenitiesData.security_cctv}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, security_cctv: !!checked })}
                />
                <Label htmlFor="security_cctv">Security/CCTV</Label>
              </div>

              {/* New Enhanced Amenities */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="loading_dock"
                  checked={amenitiesData.loading_dock}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, loading_dock: !!checked })}
                />
                <Label htmlFor="loading_dock">Loading Dock</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="refrigeration_access"
                  checked={amenitiesData.refrigeration_access}
                  onCheckedChange={(checked) => setAmenitiesData({ ...amenitiesData, refrigeration_access: !!checked })}
                />
                <Label htmlFor="refrigeration_access">Refrigeration Access</Label>
              </div>
            </div>

            {/* Electricity Type */}
            <div className="space-y-2">
              <Label htmlFor="electricity_type">Electricity Type</Label>
              <Select
                value={amenitiesData.electricity_type}
                onValueChange={(value) => setAmenitiesData({ ...amenitiesData, electricity_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select electricity type" />
                </SelectTrigger>
                <SelectContent>
                  {electricityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Add photos of your venue to attract vendors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Image URLs</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setImages([
                    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80'
                  ])}
                >
                  Use Sample Images
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
            </div>
            {images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                {images.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">Image Preview:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {images.filter(img => img.trim()).slice(0, 4).map((image, index) => (
                  <div key={index} className="relative aspect-video rounded overflow-hidden">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Invalid+URL'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Add multiple images to showcase your venue. The first image will be the main photo.
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  )
} 