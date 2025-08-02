'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

export default function UpdateImagesPage() {
  const [loading, setLoading] = useState(false)
  const [listings, setListings] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Create admin client that bypasses RLS
  const getAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  // Sample image sets for different types of venues
  const imageSets = [
    {
      name: 'Corporate Plaza',
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&q=80'
      ]
    },
    {
      name: 'Street Market',
      images: [
        'https://images.unsplash.com/photo-1567129937968-cdad8f1c8566?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80'
      ]
    },
    {
      name: 'University Campus',
      images: [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1567226475328-9d6baaf565cf?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80'
      ]
    },
    {
      name: 'Business Park',
      images: [
        'https://images.unsplash.com/photo-1572040543086-ca1b6ccd1b3b?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&q=80'
      ]
    },
    {
      name: 'Marina/Waterfront',
      images: [
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&q=80'
      ]
    },
    {
      name: 'Tech Hub',
      images: [
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&q=80'
      ]
    }
  ]

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const clearDebugInfo = () => {
    setDebugInfo([])
  }

  const createSampleListings = async () => {
    addDebugInfo('Creating sample listings...')
    setLoading(true)
    
    try {
      // Get admin client to bypass RLS
      const adminClient = getAdminClient()
      addDebugInfo('Using admin client to bypass RLS...')
      
      // Create a dummy user ID (admin operations can insert with any owner_id)
      const tempUserId = '11111111-1111-1111-1111-111111111111'
      
      // First create the user record that the listing will reference
      addDebugInfo('Creating user record...')
      const { error: userError } = await adminClient
        .from('users')
        .upsert({
          id: tempUserId,
          email: 'admin@example.com',
          role: 'venue_owner',
          first_name: 'Admin',
          last_name: 'User'
        })
      
      if (userError) {
        addDebugInfo(`User creation error: ${userError.message}`)
        // Continue anyway, user might already exist
      } else {
        addDebugInfo('✓ User record created/updated successfully')
      }
      
      // Sample listings data
      const sampleListings = [
        {
          title: 'Camden Pub Courtyard',
          description: 'Historic pub courtyard in the heart of Camden with outdoor seating area perfect for food trucks. High foot traffic from locals and tourists.',
          address: '23 Camden High Street',
          city: 'London',
          state: 'Greater London', 
          postal_code: 'NW1 7JN',
          country: 'United Kingdom',
          latitude: 51.5421,
          longitude: -0.1436,
          hourly_rate: 45.00,
          daily_rate: 320.00,
          weekly_rate: 1800.00,
          min_booking_hours: 4,
          max_booking_hours: 12,
          images: [] // Will be populated later
        },
        {
          title: 'Bath Restaurant Terrace',
          description: 'Elegant restaurant terrace space available during off-hours. Beautiful historic setting with existing outdoor dining infrastructure.',
          address: '15 Pulteney Bridge',
          city: 'Bath',
          state: 'Somerset',
          postal_code: 'BA2 4AT',
          country: 'United Kingdom', 
          latitude: 51.3813,
          longitude: -2.3590,
          hourly_rate: 40.00,
          daily_rate: 280.00,
          weekly_rate: 1600.00,
          min_booking_hours: 4,
          max_booking_hours: 10,
          images: []
        },
        {
          title: 'Brighton Coffee Shop Spot',
          description: 'Trendy coffee shop with outdoor space near the pier. Perfect for breakfast and lunch service with beach-going crowd.',
          address: '42 Western Road',
          city: 'Brighton',
          state: 'East Sussex',
          postal_code: 'BN3 1JD',
          country: 'United Kingdom',
          latitude: 50.8225,
          longitude: -0.1372,
          hourly_rate: 35.00,
          daily_rate: 250.00,
          weekly_rate: 1400.00,
          min_booking_hours: 4,
          max_booking_hours: 8,
          images: []
        },
        {
          title: 'Manchester Event Venue',
          description: 'Large event venue with dedicated food service areas. Ideal for private events, corporate catering, and festival-style food truck arrangements.',
          address: '88 Deansgate',
          city: 'Manchester', 
          state: 'Greater Manchester',
          postal_code: 'M3 2ER',
          country: 'United Kingdom',
          latitude: 53.4794,
          longitude: -2.2453,
          hourly_rate: 50.00,
          daily_rate: 400.00,
          weekly_rate: 2200.00,
          min_booking_hours: 6,
          max_booking_hours: 14,
          images: []
        }
      ]

      addDebugInfo('Inserting sample listings...')
      const { data, error } = await adminClient
        .from('listings')
        .insert(sampleListings.map(listing => ({
          ...listing,
          owner_id: tempUserId
        })))
        .select()

      if (error) {
        addDebugInfo(`Error creating listings: ${error.message}`)
        addDebugInfo(`Error details: ${JSON.stringify(error)}`)
        throw error
      }

      addDebugInfo(`✓ Successfully created ${data.length} sample listings`)
      
      // Create amenities for each listing
      addDebugInfo('Creating amenities for listings...')
      const amenitiesData = data.map(listing => ({
        listing_id: listing.id,
        running_water: true,
        electricity_type: '240v' as const,
        gas_supply: false,
        shelter: true,
        toilet_facilities: true,
        wifi: true,
        customer_seating: true,
        waste_disposal: true,
        overnight_parking: false,
        security_cctv: true
      }))
      
      const { error: amenitiesError } = await adminClient
        .from('amenities')
        .insert(amenitiesData)
      
      if (amenitiesError) {
        addDebugInfo(`Warning: Failed to create amenities: ${amenitiesError.message}`)
      } else {
        addDebugInfo(`✓ Successfully created amenities for ${data.length} listings`)
      }
      
      toast.success(`Created ${data.length} sample listings with amenities!`)
      
      // Reload the listings
      await loadListings()
      
    } catch (error: any) {
      console.error('Error creating sample listings:', error)
      addDebugInfo(`❌ Failed to create listings: ${error.message || 'Unknown error'}`)
      toast.error(`Failed to create sample listings: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    addDebugInfo('Testing Supabase connection...')
    
    // Check if environment variables are available (they should be at runtime in the browser)
    addDebugInfo('Checking environment variables...')
    
    try {
      // Test basic connection with better error handling
      addDebugInfo('Attempting to connect to Supabase...')
      const { data, error, count } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
      
      if (error) {
        addDebugInfo(`❌ Database error: ${error.message}`)
        addDebugInfo(`Error code: ${error.code}`)
        addDebugInfo(`Error hint: ${error.hint || 'No hint provided'}`)
        addDebugInfo(`Error details: ${error.details || 'No details provided'}`)
        
        if (error.message.includes('Invalid API key')) {
          addDebugInfo('🔑 This looks like an API key issue. Check your .env.local file.')
        } else if (error.message.includes('not found')) {
          addDebugInfo('📋 The listings table might not exist in your database.')
        }
        
        return false
      }
      
      addDebugInfo(`✅ Connection successful! Found ${count || 0} listings in database.`)
      return true
    } catch (error: any) {
      addDebugInfo(`❌ Connection failed: ${error.message}`)
      
      if (error.message.includes('fetch')) {
        addDebugInfo('🌐 This looks like a network/URL issue. Check your Supabase URL.')
      }
      
      return false
    }
  }

  const loadListings = async () => {
    setLoadingListings(true)
    addDebugInfo('Loading listings from database...')
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, images')
        .order('created_at', { ascending: false })

      if (error) {
        addDebugInfo(`Error loading listings: ${error.message}`)
        throw error
      }
      
      addDebugInfo(`Successfully loaded ${data?.length || 0} listings`)
      setListings(data || [])
      
      if (data && data.length > 0) {
        data.forEach((listing, index) => {
          addDebugInfo(`Listing ${index + 1}: "${listing.title}" - ${listing.images?.length || 0} images`)
        })
      }
    } catch (error) {
      console.error('Error loading listings:', error)
      toast.error('Failed to load listings')
    } finally {
      setLoadingListings(false)
    }
  }

  const createMissingAmenities = async () => {
    setLoading(true)
    addDebugInfo('Checking for listings without amenities...')
    
    try {
      const adminClient = getAdminClient()
      
      // Find listings without amenities
      const { data: allListings, error: listingsError } = await adminClient
        .from('listings')
        .select('id, title')
      
      if (listingsError) {
        addDebugInfo(`Error fetching listings: ${listingsError.message}`)
        throw listingsError
      }
      
      const { data: existingAmenities, error: amenitiesCheckError } = await adminClient
        .from('amenities')
        .select('listing_id')
      
      if (amenitiesCheckError) {
        addDebugInfo(`Error fetching amenities: ${amenitiesCheckError.message}`)
        throw amenitiesCheckError
      }
      
      const existingListingIds = new Set(existingAmenities?.map(a => a.listing_id) || [])
      const listingsWithoutAmenities = allListings?.filter(listing => !existingListingIds.has(listing.id)) || []
      
      if (!listingsWithoutAmenities || listingsWithoutAmenities.length === 0) {
        addDebugInfo('All listings already have amenities')
        toast.success('All listings already have amenities!')
        return
      }
      
      addDebugInfo(`Found ${listingsWithoutAmenities.length} listings without amenities`)
      
      // Create amenities for these listings
      const amenitiesData = listingsWithoutAmenities.map(listing => ({
        listing_id: listing.id,
        running_water: true,
        electricity_type: '240v' as const,
        gas_supply: false,
        shelter: true,
        toilet_facilities: true,
        wifi: true,
        customer_seating: true,
        waste_disposal: true,
        overnight_parking: false,
        security_cctv: true
      }))
      
      const { error: amenitiesInsertError } = await adminClient
        .from('amenities')
        .insert(amenitiesData)
      
      if (amenitiesInsertError) {
        addDebugInfo(`Error creating amenities: ${amenitiesInsertError.message}`)
        addDebugInfo(`Error details: ${JSON.stringify(amenitiesInsertError)}`)
        throw amenitiesInsertError
      }
      
      addDebugInfo(`✓ Successfully created amenities for ${listingsWithoutAmenities.length} listings`)
      toast.success(`Added amenities to ${listingsWithoutAmenities.length} listings!`)
      
    } catch (error: any) {
      console.error('Error creating amenities:', error)
      addDebugInfo(`❌ Failed to create amenities: ${error.message || 'Unknown error'}`)
      toast.error(`Failed to create amenities: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const updateAllListingsWithImages = async () => {
    setLoading(true)
    clearDebugInfo()
    addDebugInfo('Starting image update process...')
    
    // First test connection
    const connectionOk = await testConnection()
    if (!connectionOk) {
      toast.error('Database connection failed. Check console for details.')
      setLoading(false)
      return
    }
    
    try {
      // Use admin client for updates too
      const adminClient = getAdminClient()
      
      addDebugInfo('Fetching all listings...')
      const { data: allListings, error: fetchError } = await adminClient
        .from('listings')
        .select('id, title, images')
        .order('created_at', { ascending: false })

      if (fetchError) {
        addDebugInfo(`Fetch error: ${fetchError.message}`)
        throw fetchError
      }

      if (!allListings || allListings.length === 0) {
        addDebugInfo('No listings found in database')
        toast.error('No listings found to update')
        return
      }

      addDebugInfo(`Found ${allListings.length} listings to update`)

      // Update each listing with a different image set
      const updatePromises = allListings.map(async (listing, index) => {
        const imageSet = imageSets[index % imageSets.length]
        addDebugInfo(`Updating "${listing.title}" with ${imageSet.name} images...`)
        
        const { data, error } = await adminClient
          .from('listings')
          .update({ images: imageSet.images })
          .eq('id', listing.id)
          .select('id, title, images')

        if (error) {
          addDebugInfo(`Error updating ${listing.title}: ${error.message}`)
          throw error
        }
        
        addDebugInfo(`✓ Successfully updated "${listing.title}" with ${imageSet.images.length} images`)
        return { listing, imageSet, updatedData: data }
      })

      const results = await Promise.all(updatePromises)
      
      addDebugInfo(`✓ Successfully updated ${results.length} listings with images!`)
      toast.success(`Successfully updated ${results.length} listings with images!`)
      
      // Reload listings to show the changes
      await loadListings()
      
    } catch (error: any) {
      console.error('Error updating listings:', error)
      addDebugInfo(`❌ Update failed: ${error.message}`)
      toast.error(`Failed to update listings: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Update Existing Listings with Sample Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Finds all existing listings in your database</li>
              <li>• Adds professional venue photos to each listing</li>
              <li>• Uses 6 different image sets (Corporate, Market, Campus, etc.)</li>
              <li>• Each listing gets 4-5 high-quality images</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Setup Required:</h3>
            <div className="text-yellow-700 text-sm space-y-2">
              <p>If the connection test fails, you need to set up your database:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in your project root</li>
                <li>Add your Supabase credentials:
                  <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
                  </pre>
                </li>
                <li>Set up your database schema by running the SQL files in the <code className="bg-yellow-100 px-1 rounded">supabase/</code> folder</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={testConnection}>Test Database Connection</Button>
            <Button onClick={loadListings} disabled={loadingListings}>
              {loadingListings ? 'Loading...' : 'Load Current Listings'}
            </Button>
            <Button 
              onClick={createSampleListings} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Sample Listings'}
            </Button>
            <Button 
              onClick={createMissingAmenities} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Creating...' : 'Add Missing Amenities'}
            </Button>
            <Button 
              onClick={updateAllListingsWithImages} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Updating...' : 'Add Images to All Listings'}
            </Button>
            <Button onClick={clearDebugInfo} variant="outline">Clear Debug Log</Button>
          </div>

          {/* Debug Information */}
          {debugInfo.length > 0 && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">Debug Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {debugInfo.join('\n')}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {listings.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Current Listings ({listings.length}):</h3>
              <div className="space-y-3">
                {listings.map((listing, index) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{listing.title}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {listing.images && listing.images.length > 0 
                          ? `(${listing.images.length} images)` 
                          : '(no images)'
                        }
                      </span>
                    </div>
                    {listing.images && listing.images.length > 0 && (
                      <div className="flex gap-1">
                        {listing.images.slice(0, 3).map((image: string, imgIndex: number) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt=""
                            className="w-12 h-8 object-cover rounded"
                          />
                        ))}
                        {listing.images.length > 3 && (
                          <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                            +{listing.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Sample Image Sets Preview:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageSets.map((set, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium text-sm">{set.name}</h4>
                  <div className="flex gap-1">
                    {set.images.slice(0, 4).map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={image}
                        alt=""
                        className="w-16 h-12 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 