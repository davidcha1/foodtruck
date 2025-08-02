'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getVendorBookings, cancelBooking } from '@/lib/bookings'
import { BookingWithDetails } from '@/types'
import { 
  Calendar,
  Clock, 
  DollarSign, 
  MapPin,
  Phone,
  Mail,
  X,
  Eye,
  Navigation
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface VendorBookingsProps {
  vendorId: string
}

export const VendorBookings: React.FC<VendorBookingsProps> = ({ vendorId }) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null)

  // Load vendor's bookings
  const loadBookings = async () => {
    try {
      setLoading(true)
      const bookingsData = await getVendorBookings(vendorId)
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [vendorId])

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBooking(bookingId)
    try {
      await cancelBooking(bookingId, 'Cancelled by vendor')
      toast.success('Booking cancelled successfully!')
      setSelectedBooking(null)
      loadBookings() // Refresh data
    } catch (error) {
      toast.error('Failed to cancel booking')
    } finally {
      setCancellingBooking(null)
    }
  }

  // Filter bookings by status
  const filterBookings = (status?: string) => {
    if (!status) return bookings
    return bookings.filter(booking => booking.status === status)
  }

  // Get upcoming bookings (confirmed or pending, in the future)
  const getUpcomingBookings = () => {
    const now = new Date()
    return bookings.filter(booking => {
      const bookingDate = new Date(`${booking.booking_date}T${booking.start_time}`)
      return bookingDate > now && ['pending', 'confirmed'].includes(booking.status)
    }).slice(0, 3) // Show only next 3
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate booking stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + Number(b.total_cost), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-red"></div>
        <span className="ml-3 text-lg">Loading your bookings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${stats.totalSpent.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings Quick View */}
      {getUpcomingBookings().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingBookings().map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{booking.listing?.title}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(`${booking.booking_date}T${booking.start_time}`), 'PPP')} at {booking.start_time}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Management Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>

        {/* All Bookings */}
        <TabsContent value="all">
          <VendorBookingList 
            bookings={bookings}
            onViewBooking={setSelectedBooking}
            onCancelBooking={handleCancelBooking}
            cancellingBooking={cancellingBooking}
          />
        </TabsContent>

        {/* Pending Bookings */}
        <TabsContent value="pending">
          <VendorBookingList 
            bookings={filterBookings('pending')}
            onViewBooking={setSelectedBooking}
            onCancelBooking={handleCancelBooking}
            cancellingBooking={cancellingBooking}
            showCancelAction={true}
          />
        </TabsContent>

        {/* Confirmed Bookings */}
        <TabsContent value="confirmed">
          <VendorBookingList 
            bookings={filterBookings('confirmed')}
            onViewBooking={setSelectedBooking}
            onCancelBooking={handleCancelBooking}
            cancellingBooking={cancellingBooking}
          />
        </TabsContent>

        {/* Completed Bookings */}
        <TabsContent value="completed">
          <VendorBookingList 
            bookings={filterBookings('completed')}
            onViewBooking={setSelectedBooking}
          />
        </TabsContent>
      </Tabs>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">Booking Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {format(new Date(`${selectedBooking.booking_date}T${selectedBooking.start_time}`), 'PPP')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {selectedBooking.start_time} - {selectedBooking.end_time} 
                        ({selectedBooking.total_hours}h)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">${selectedBooking.total_cost}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Venue Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">Venue Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedBooking.listing?.title}</span>
                    </div>
                    <div className="text-gray-600">
                      <p>{selectedBooking.listing?.address}</p>
                      <p>{selectedBooking.listing?.city}, {selectedBooking.listing?.state}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedBooking.listing?.owner?.email}</span>
                    </div>
                    {selectedBooking.listing?.owner?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedBooking.listing.owner.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="space-y-2">
                  <h3 className="font-medium">Your Special Requests</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}

              {/* Venue Owner Notes */}
              {selectedBooking.venue_owner_notes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Venue Owner Notes</h3>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    {selectedBooking.venue_owner_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 border-t pt-4">
                {selectedBooking.listing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const address = `${selectedBooking.listing?.address}, ${selectedBooking.listing?.city}, ${selectedBooking.listing?.state}`
                      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                      window.open(mapsUrl, '_blank')
                    }}
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                )}
                
                {selectedBooking.status === 'pending' && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    disabled={cancellingBooking === selectedBooking.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Vendor Booking List Component
interface VendorBookingListProps {
  bookings: BookingWithDetails[]
  onViewBooking: (booking: BookingWithDetails) => void
  onCancelBooking?: (bookingId: string) => void
  cancellingBooking?: string | null
  showCancelAction?: boolean
}

const VendorBookingList: React.FC<VendorBookingListProps> = ({
  bookings,
  onViewBooking,
  onCancelBooking,
  cancellingBooking,
  showCancelAction = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
          <Button onClick={() => window.location.href = '/browse'}>
            Browse Venues
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-medium">{booking.listing?.title}</p>
                  <p className="text-sm text-gray-500">
                    {booking.listing?.city}, {booking.listing?.state}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">
                    {format(new Date(`${booking.booking_date}T${booking.start_time}`), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.start_time} - {booking.end_time}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">${booking.total_cost}</p>
                  <p className="text-sm text-gray-500">{booking.total_hours} hours</p>
                </div>
                
                <div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewBooking(booking)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                
                {showCancelAction && booking.status === 'pending' && onCancelBooking && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelBooking(booking.id)}
                    disabled={cancellingBooking === booking.id}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 