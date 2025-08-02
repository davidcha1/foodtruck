'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookingForm } from '@/components/booking/BookingForm'
import { supabase } from '@/lib/supabase'
import { ListingWithAmenities } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function BookVenuePage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<ListingWithAmenities | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            amenities (*),
            users!owner_id (
              first_name,
              last_name,
              email,
              role
            )
          `)
          .eq('id', params.id as string)
          .eq('status', 'active')
          .single()

        if (error) {
          setError('Venue not found')
          return
        }

        setListing(data)
      } catch (err) {
        console.error('Error fetching listing:', err)
        setError('Failed to load venue details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchListing()
    }
  }, [params.id])

  const handleBookingCreated = (bookingId: string) => {
    // Redirect to booking confirmation or dashboard
    router.push(`/dashboard/bookings`)
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-red"></div>
            <span className="ml-3 text-lg">Loading venue details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Venue not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The venue you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => router.push('/browse')}>
              Browse Available Venues
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venue
          </Button>
          
          <div className="text-center">
            <h1 className="font-bebas text-4xl lg:text-5xl font-bold text-charcoal mb-2">
              Book Your Spot
            </h1>
            <p className="text-xl text-muted-text max-w-2xl mx-auto">
              Reserve your time slot at <span className="font-semibold">{listing.title}</span>
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <BookingForm 
          listing={listing}
          onBookingCreated={handleBookingCreated}
          onCancel={handleGoBack}
        />
      </div>
    </div>
  )
} 