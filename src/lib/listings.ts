import { supabase } from './supabase'
import { Listing, ListingInsert, ListingUpdate, ListingWithAmenities, Amenities, AmenitiesInsert, AmenitiesUpdate } from '@/types'

// Create a new listing with amenities
export const createListing = async (
  listingData: Omit<ListingInsert, 'id' | 'created_at' | 'updated_at'>,
  amenitiesData: Omit<AmenitiesInsert, 'id' | 'listing_id' | 'created_at' | 'updated_at'>
): Promise<ListingWithAmenities> => {
  // Insert listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single()

  if (listingError) throw listingError

  // Insert amenities
  const { data: amenities, error: amenitiesError } = await supabase
    .from('amenities')
    .insert({
      listing_id: listing.id,
      ...amenitiesData
    })
    .select()
    .single()

  if (amenitiesError) throw amenitiesError

  return {
    ...listing,
    amenities
  }
}

// Get listing by ID with amenities and owner info
export const getListingById = async (id: string): Promise<ListingWithAmenities | null> => {
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      amenities (*),
      owner:users (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return listing as ListingWithAmenities
}

// Get listings with filters
export const getListings = async (filters: {
  ownerId?: string
  status?: 'active' | 'inactive' | 'suspended'
  limit?: number
  offset?: number
} = {}): Promise<ListingWithAmenities[]> => {
  let query = supabase
    .from('listings')
    .select(`
      *,
      amenities (*),
      owner:users (*)
    `)

  if (filters.ownerId) {
    query = query.eq('owner_id', filters.ownerId)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  query = query.order('created_at', { ascending: false })

  const { data: listings, error } = await query

  if (error) throw error

  return (listings || []) as ListingWithAmenities[]
}

// Search listings with location and amenity filters
export const searchListings = async (filters: {
  latitude?: number
  longitude?: number
  radius?: number // in kilometers
  minPrice?: number
  maxPrice?: number
  amenities?: string[]
  date?: string
  limit?: number
  offset?: number
}) => {
  let query = supabase
    .from('listings')
    .select(`
      *,
      amenities (*),
      owner:users (*)
    `)
    .eq('status', 'active')

  // Price filtering
  if (filters.minPrice !== undefined) {
    query = query.gte('daily_rate', filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('daily_rate', filters.maxPrice)
  }

  // Location filtering (simplified - in production you'd use PostGIS)
  if (filters.latitude && filters.longitude && filters.radius) {
    const radiusDegrees = filters.radius / 111 // Rough conversion km to degrees
    query = query
      .gte('latitude', filters.latitude - radiusDegrees)
      .lte('latitude', filters.latitude + radiusDegrees)
      .gte('longitude', filters.longitude - radiusDegrees)
      .lte('longitude', filters.longitude + radiusDegrees)
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  query = query.order('created_at', { ascending: false })

  const { data: listings, error } = await query

  if (error) throw error

  // Filter by amenities if specified (this would be more efficient with a proper database query)
  let filteredListings = listings || []
  
  if (filters.amenities && filters.amenities.length > 0) {
    filteredListings = filteredListings.filter(listing => {
      if (!listing.amenities) return false
      
      return filters.amenities!.every(amenity => {
        switch (amenity) {
          case 'running_water':
            return listing.amenities?.running_water || false
          case 'electricity':
            return listing.amenities?.electricity_type !== 'none'
          case 'gas':
            return listing.amenities?.gas_supply || false
          case 'shelter':
            return listing.amenities?.shelter || false
          case 'toilet':
            return listing.amenities?.toilet_facilities || false
          case 'wifi':
            return listing.amenities?.wifi || false
          case 'seating':
            return listing.amenities?.customer_seating || false
          case 'waste_disposal':
            return listing.amenities?.waste_disposal || false
          case 'overnight_parking':
            return listing.amenities?.overnight_parking || false
          case 'security':
            return listing.amenities?.security_cctv || false
          default:
            return false
        }
      })
    })
  }

  return filteredListings
}

// Update listing
export const updateListing = async (
  id: string,
  listingData: ListingUpdate,
  amenitiesData?: AmenitiesUpdate
): Promise<ListingWithAmenities> => {
  // Update listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .update(listingData)
    .eq('id', id)
    .select()
    .single()

  if (listingError) throw listingError

  // Update amenities if provided
  if (amenitiesData) {
    const { error: amenitiesError } = await supabase
      .from('amenities')
      .update(amenitiesData)
      .eq('listing_id', id)

    if (amenitiesError) throw amenitiesError
  }

  // Get updated listing with amenities
  const updatedListing = await getListingById(id)
  if (!updatedListing) throw new Error('Failed to retrieve updated listing')

  return updatedListing
}

// Delete listing
export const deleteListing = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Upload listing images
export const uploadListingImages = async (
  listingId: string,
  files: File[]
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${listingId}/${Date.now()}-${index}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName)

    return publicUrl
  })

  return Promise.all(uploadPromises)
}

// Delete listing images
export const deleteListingImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls.map(async (url) => {
    // Extract file path from URL
    const urlParts = url.split('/')
    const filePath = urlParts.slice(-2).join('/') // Get last two parts (listingId/filename)

    const { error } = await supabase.storage
      .from('listing-images')
      .remove([filePath])

    if (error) throw error
  })

  await Promise.all(deletePromises)
} 