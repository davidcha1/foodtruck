'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { createBooking } from '@/lib/bookings'
import { ListingWithAmenities } from '@/types'
import { 
  CalendarIcon, 
  CreditCard, 
  Truck, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { sendBookingCreatedNotification, sendVenueOwnerNotification } from '@/lib/notifications'

interface BookingFormProps {
  listing: ListingWithAmenities
  bookingSelection?: BookingSelection
  onBookingCreated?: (bookingId: string) => void
  onCancel?: () => void
}

interface BookingSelection {
  date: string
  startTime: string
  endTime: string
  totalHours: number
  totalCost: number
}

export const BookingForm: React.FC<BookingFormProps> = ({
  listing,
  bookingSelection,
  onBookingCreated,
  onCancel
}) => {
  const { user } = useAuth()
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'selection' | 'details' | 'confirmation'>(
    bookingSelection ? 'details' : 'selection'
  )
  const [createdBooking, setCreatedBooking] = useState<any>(null)

  // Proceed to details step
  const handleProceedToDetails = () => {
    if (bookingSelection) {
      setStep('details')
    }
  }

  // Go back to selection
  const handleBackToSelection = () => {
    setStep('selection')
  }

  // Submit booking (without payment for now)
  const handleSubmitBooking = async () => {
    if (!user || !bookingSelection) {
      toast.error('Please sign in to make a booking')
      return
    }

    if (user.role !== 'vendor') {
      toast.error('Only vendors can make bookings')
      return
    }

    setLoading(true)
    try {
      console.log('Creating booking with data:', {
        listing_id: listing.id,
        vendor_id: user.id,
        booking_date: bookingSelection.date,
        start_time: bookingSelection.startTime,
        end_time: bookingSelection.endTime,
        total_hours: bookingSelection.totalHours,
        total_cost: bookingSelection.totalCost,
        special_requests: specialRequests || undefined
      })

      const booking = await createBooking({
        listing_id: listing.id,
        vendor_id: user.id,
        booking_date: bookingSelection.date,
        start_time: bookingSelection.startTime,
        end_time: bookingSelection.endTime,
        total_hours: bookingSelection.totalHours,
        total_cost: bookingSelection.totalCost,
        special_requests: specialRequests || undefined
      })

      console.log('Booking created successfully:', booking)
      setCreatedBooking(booking)
      
      // Show success message
      toast.success('Booking request submitted successfully!')
      
      // Send notifications
      try {
        // Send notification to vendor
        await sendBookingCreatedNotification(
          user.email!,
          `${user.first_name || 'Vendor'} ${user.last_name || ''}`.trim() || 'Vendor',
          listing.title,
          booking
        )

        // Send notification to venue owner
        if (listing.owner?.email) {
          await sendVenueOwnerNotification(
            listing.owner.email,
            `${listing.owner.first_name || 'Venue Owner'} ${listing.owner.last_name || ''}`.trim() || 'Venue Owner',
            `${user.first_name || 'Vendor'} ${user.last_name || ''}`.trim() || 'Vendor',
            listing.title,
            booking
          )
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError)
        // Don't fail the booking if notifications fail
      }

      // Go directly to confirmation instead of payment
      setStep('confirmation')
      onBookingCreated?.(booking.id)
    } catch (error) {
      console.error('Error creating booking:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        user: user ? { id: user.id, role: user.role, email: user.email } : 'No user',
        bookingSelection,
        listing: { id: listing.id, title: listing.title }
      })
      toast.error(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  // Calculate platform fee (10%)
  const platformFee = bookingSelection ? bookingSelection.totalCost * 0.1 : 0
  const vendorPayout = bookingSelection ? bookingSelection.totalCost - platformFee : 0

  if (step === 'confirmation') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Request Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your booking request has been sent to the venue owner. You'll receive an email confirmation 
              once they review and approve your request. Payment will be processed only after approval.
            </AlertDescription>
          </Alert>

          {bookingSelection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{listing.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span>{bookingSelection.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{bookingSelection.startTime} - {bookingSelection.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Total: ${bookingSelection.totalCost}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Next Steps</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>1. The venue owner will review your request</p>
                  <p>2. You'll receive an email notification with their decision</p>
                  <p>3. If approved, you'll be prompted to complete payment</p>
                  <p>4. Once paid, your booking will be confirmed</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard/bookings'}
              className="flex-1"
            >
              View My Bookings
            </Button>
            <Button 
              onClick={() => window.location.href = '/browse'}
              className="flex-1"
            >
              Browse More Venues
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to make a booking. 
              <Button variant="link" className="ml-2 p-0 h-auto" onClick={() => window.location.href = '/auth/signin'}>
                Sign in here
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (user.role !== 'vendor') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only vendors can make bookings. If you're a vendor, please update your profile.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step === 'selection' ? 'text-warm-red' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 'selection' ? 'border-warm-red bg-warm-red text-white' : 'border-gray-300'
          }`}>
            1
          </div>
          <span className="hidden sm:block">Select Time</span>
        </div>
        
        <div className="w-8 h-px bg-gray-300"></div>
        
        <div className={`flex items-center space-x-2 ${step === 'details' ? 'text-warm-red' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step === 'details' ? 'border-warm-red bg-warm-red text-white' : 'border-gray-300'
          }`}>
            2
          </div>
          <span className="hidden sm:block">Booking Details</span>
        </div>
      </div>

      {step === 'selection' && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Time Selection Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please select your preferred time slot in the booking widget above.
            </p>
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Go Back
            </Button>
          </div>
        </div>
      )}

      {step === 'details' && bookingSelection && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Details Form */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Additional Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="special-requests" className="text-sm font-medium">
                  Special Requests (Optional)
                </Label>
                <Textarea
                  id="special-requests"
                  placeholder="Any special requirements, setup instructions, or requests for the venue owner..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Let the venue owner know about any specific needs for your food truck setup.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button variant="outline" onClick={handleBackToSelection} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitBooking} 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Booking Confirmation */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Confirm Your Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Booking Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium">{listing.title}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{bookingSelection.date}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{bookingSelection.startTime} - {bookingSelection.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{bookingSelection.totalHours} hours</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Cost Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Venue fee:</span>
                    <span className="font-medium">${bookingSelection.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Platform fee (10%):</span>
                    <span className="font-medium">${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-semibold text-lg text-warm-red">${(bookingSelection.totalCost + platformFee).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Your booking request will be sent to the venue owner for approval. 
                  Payment will be processed only after approval.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 