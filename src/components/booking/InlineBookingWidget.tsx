'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TimeSlotPicker } from './TimeSlotPicker'
import { BookingForm } from './BookingForm'
import { useAuth } from '@/contexts/AuthContext'
import { ListingWithAmenities } from '@/types'
import { 
  Clock, 
  Users,
  CreditCard,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'

interface BookingSelection {
  date: string
  startTime: string
  endTime: string
  totalHours: number
  totalCost: number
}

interface InlineBookingWidgetProps {
  listing: ListingWithAmenities
}

export const InlineBookingWidget: React.FC<InlineBookingWidgetProps> = ({ listing }) => {
  const { user } = useAuth()
  const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  // Handle selection from time slot picker
  const handleSelectionChange = useCallback((selection: BookingSelection | null) => {
    setBookingSelection(selection)
  }, [])

  // Calculate platform fee and total
  const platformFee = bookingSelection ? bookingSelection.totalCost * 0.1 : 0
  const totalWithFees = bookingSelection ? bookingSelection.totalCost + platformFee : 0

  // Handle booking submission
  const handleBookNow = () => {
    if (!user) {
      // Redirect to sign in
      window.location.href = '/auth/signin'
      return
    }
    
    if (user.role !== 'vendor') {
      alert('Only vendors can make bookings')
      return
    }

    setShowBookingForm(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-2xl font-bold text-gray-900">
                £{listing.daily_rate}/day
              </span>
              <div className="text-sm text-gray-600">
                £{listing.hourly_rate}/hour for shorter bookings
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                Best Value: 8+ hours = daily rate
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Min. {listing.min_booking_hours}h</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{(listing.max_trucks || 1) === 1 ? '1 truck max' : `Max ${listing.max_trucks || 1} trucks`}</span>
            </div>
          </div>

          {/* Date/Time Selection Button */}
          <TimeSlotPicker
            listingId={listing.id}
            hourlyRate={listing.hourly_rate}
            dailyRate={listing.daily_rate}
            minBookingHours={listing.min_booking_hours}
            maxBookingHours={listing.max_booking_hours || 16}
            onSelectionChange={handleSelectionChange}
          />

          {/* Booking Summary */}
          {bookingSelection && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>
                    {format(new Date(bookingSelection.date), 'MMM dd, yyyy')} 
                    <br />
                    {bookingSelection.startTime} - {bookingSelection.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{bookingSelection.totalHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Venue fee:</span>
                  <span>£{bookingSelection.totalCost}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee:</span>
                  <span>£{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>£{totalWithFees.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Actions */}
          <div className="space-y-3">
            {bookingSelection ? (
              <Button 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-lg"
                onClick={handleBookNow}
              >
                Reserve Now
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Select your dates and times above to continue
                </p>
                <Button 
                  variant="outline" 
                  className="w-full h-12 cursor-not-allowed opacity-50"
                  disabled
                >
                  Choose dates first
                </Button>
              </div>
            )}
            
            <p className="text-xs text-gray-500 text-center">
              You won't be charged yet. Booking requires venue owner approval.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <CreditCard className="w-4 h-4 text-green-500" />
                <span>Competitive pricing</span>
              </span>
              <span className="text-gray-500">⭐⭐⭐⭐⭐</span>
            </div>
            <div className="text-xs text-gray-500">
              • Free cancellation up to 24 hours before booking
              <br />
              • Quick approval process
              <br />
              • Direct communication with venue owner
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Booking Form Modal */}
      {showBookingForm && bookingSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <BookingForm
                listing={listing}
                bookingSelection={bookingSelection}
                onBookingCreated={(bookingId) => {
                  setShowBookingForm(false)
                  setBookingSelection(null)
                  // Redirect to dashboard to show the booking
                  window.location.href = '/dashboard/vendor'
                }}
                onCancel={() => setShowBookingForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
} 