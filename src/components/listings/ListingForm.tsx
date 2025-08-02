'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createListing, uploadListingImages } from '@/lib/listings'
import { ListingWithAmenities } from '@/types'
import { useRouter } from 'next/navigation'
import { ImagePlus, X } from 'lucide-react'

interface ListingFormProps {
  initialData?: ListingWithAmenities
  isEditing?: boolean
}

export const ListingForm: React.FC<ListingFormProps> = ({ 
  initialData, 
  isEditing = false 
}) => {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    title: initialData?.title || '',
    description: initialData?.description || '',
    
    // Location
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postal_code || '',
    country: initialData?.country || 'United Kingdom',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    
    // Pricing
    hourlyRate: initialData?.hourly_rate || 0,
    dailyRate: initialData?.daily_rate || 0,
    weeklyRate: initialData?.weekly_rate || 0,
    minBookingHours: initialData?.min_booking_hours || 1,
    maxBookingHours: initialData?.max_booking_hours || 24,
    
    // Amenities
    amenities: {
      runningWater: initialData?.amenities?.running_water || false,
      electricityType: initialData?.amenities?.electricity_type || 'none' as 'none' | '240v' | '110v' | 'other',
      gasSupply: initialData?.amenities?.gas_supply || false,
      shelter: initialData?.amenities?.shelter || false,
      toiletFacilities: initialData?.amenities?.toilet_facilities || false,
      wifi: initialData?.amenities?.wifi || false,
      customerSeating: initialData?.amenities?.customer_seating || false,
      wasteDisposal: initialData?.amenities?.waste_disposal || false,
      overnightParking: initialData?.amenities?.overnight_parking || false,
      securityCctv: initialData?.amenities?.security_cctv || false,
    }
  })
  
  const [images, setImages] = useState<File[]>([])
  const [existingImages] = useState<string[]>(initialData?.images || [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAmenityChange = (amenity: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: value
      }
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to create a listing')
      return
    }

    setLoading(true)

    try {
      // Create listing data
      const listingData = {
        owner_id: user.id,
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        hourly_rate: formData.hourlyRate,
        daily_rate: formData.dailyRate,
        weekly_rate: formData.weeklyRate || null,
        min_booking_hours: formData.minBookingHours,
        max_booking_hours: formData.maxBookingHours,
        images: existingImages // Start with existing images
      }

      const amenitiesData = {
        running_water: formData.amenities.runningWater,
        electricity_type: formData.amenities.electricityType,
        gas_supply: formData.amenities.gasSupply,
        shelter: formData.amenities.shelter,
        toilet_facilities: formData.amenities.toiletFacilities,
        wifi: formData.amenities.wifi,
        customer_seating: formData.amenities.customerSeating,
        waste_disposal: formData.amenities.wasteDisposal,
        overnight_parking: formData.amenities.overnightParking,
        security_cctv: formData.amenities.securityCctv,
      }

      const listing = await createListing(listingData, amenitiesData)

      // Upload new images if any
      if (images.length > 0) {
        const imageUrls = await uploadListingImages(listing.id, images)
        // Note: In a real app, you'd update the listing with the new image URLs
      }

      toast.success('Listing created successfully!')
      router.push('/dashboard/owner')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </CardTitle>
          <CardDescription>
            Provide detailed information about your outdoor space to attract food truck vendors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Listing Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Prime Car Park Space - City Center"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your space, including size, accessibility, and any special features..."
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Sydney"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(value) => handleInputChange('state', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                                      <SelectContent>
                    <SelectItem value="ENG">England</SelectItem>
                    <SelectItem value="SCT">Scotland</SelectItem>
                    <SelectItem value="WLS">Wales</SelectItem>
                    <SelectItem value="NIR">Northern Ireland</SelectItem>
                    <SelectItem value="LDN">Greater London</SelectItem>
                    <SelectItem value="MAN">Greater Manchester</SelectItem>
                    <SelectItem value="WMD">West Midlands</SelectItem>
                    <SelectItem value="WYK">West Yorkshire</SelectItem>
                    <SelectItem value="SYK">South Yorkshire</SelectItem>
                    <SelectItem value="MSY">Merseyside</SelectItem>
                    <SelectItem value="TYW">Tyne and Wear</SelectItem>
                  </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="2000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                    placeholder="-33.8688"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                    placeholder="151.2093"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value))}
                    placeholder="25.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    step="0.01"
                    value={formData.dailyRate}
                    onChange={(e) => handleInputChange('dailyRate', parseFloat(e.target.value))}
                    placeholder="200.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weeklyRate">Weekly Rate ($)</Label>
                  <Input
                    id="weeklyRate"
                    type="number"
                    step="0.01"
                    value={formData.weeklyRate}
                    onChange={(e) => handleInputChange('weeklyRate', parseFloat(e.target.value))}
                    placeholder="1200.00"
                  />
                </div>
                <div>
                  <Label htmlFor="minBookingHours">Minimum Booking (hours)</Label>
                  <Input
                    id="minBookingHours"
                    type="number"
                    value={formData.minBookingHours}
                    onChange={(e) => handleInputChange('minBookingHours', parseInt(e.target.value))}
                    placeholder="4"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 4+ hours for typical food truck operations
                  </p>
                </div>
                <div>
                  <Label htmlFor="maxBookingHours">Maximum Booking (hours)</Label>
                  <Input
                    id="maxBookingHours"
                    type="number"
                    value={formData.maxBookingHours}
                    onChange={(e) => handleInputChange('maxBookingHours', parseInt(e.target.value))}
                    placeholder="24"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amenities & Utilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="runningWater">Running Water</Label>
                    <Switch
                      id="runningWater"
                      checked={formData.amenities.runningWater}
                      onCheckedChange={(checked) => handleAmenityChange('runningWater', checked)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="electricityType">Electricity Access</Label>
                    <Select
                      value={formData.amenities.electricityType}
                      onValueChange={(value) => handleAmenityChange('electricityType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Electricity</SelectItem>
                        <SelectItem value="240v">240V</SelectItem>
                        <SelectItem value="110v">110V</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gasSupply">Gas Supply</Label>
                    <Switch
                      id="gasSupply"
                      checked={formData.amenities.gasSupply}
                      onCheckedChange={(checked) => handleAmenityChange('gasSupply', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="shelter">Covered/Sheltered Area</Label>
                    <Switch
                      id="shelter"
                      checked={formData.amenities.shelter}
                      onCheckedChange={(checked) => handleAmenityChange('shelter', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="toiletFacilities">Toilet Facilities</Label>
                    <Switch
                      id="toiletFacilities"
                      checked={formData.amenities.toiletFacilities}
                      onCheckedChange={(checked) => handleAmenityChange('toiletFacilities', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wifi">Wi-Fi Available</Label>
                    <Switch
                      id="wifi"
                      checked={formData.amenities.wifi}
                      onCheckedChange={(checked) => handleAmenityChange('wifi', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="customerSeating">Customer Seating Area</Label>
                    <Switch
                      id="customerSeating"
                      checked={formData.amenities.customerSeating}
                      onCheckedChange={(checked) => handleAmenityChange('customerSeating', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="wasteDisposal">Waste Disposal</Label>
                    <Switch
                      id="wasteDisposal"
                      checked={formData.amenities.wasteDisposal}
                      onCheckedChange={(checked) => handleAmenityChange('wasteDisposal', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="overnightParking">Overnight Parking</Label>
                    <Switch
                      id="overnightParking"
                      checked={formData.amenities.overnightParking}
                      onCheckedChange={(checked) => handleAmenityChange('overnightParking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="securityCctv">Security/CCTV</Label>
                    <Switch
                      id="securityCctv"
                      checked={formData.amenities.securityCctv}
                      onCheckedChange={(checked) => handleAmenityChange('securityCctv', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Photos</h3>
              <div>
                <Label htmlFor="images">Upload Photos</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload high-quality photos of your space. Multiple images recommended.
                </p>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Listing' : 'Create Listing')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 