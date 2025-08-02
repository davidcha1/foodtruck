'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BookingCalendar } from './BookingCalendar'
import { 
  getVenueOwnerBookings, 
  confirmBooking, 
  cancelBooking, 
  getBookingStats 
} from '@/lib/bookings'
import { BookingWithDetails } from '@/types'
import { 
  Calendar,
  Clock, 
  DollarSign, 
  TrendingUp,
  Check,
  X,
  Eye,
  Mail,
  Phone,
  MapPin,
  Truck
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface BookingManagementProps {
  ownerId: string
}

interface BookingStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  completed: number
  totalRevenue: number
}

export const BookingManagement: React.FC<BookingManagementProps> = ({ ownerId }) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [venueOwnerNotes, setVenueOwnerNotes] = useState('')

  // Load bookings and stats
  const loadBookings = async () => {
    try {
      setLoading(true)
      const [bookingsData, statsData] = await Promise.all([
        getVenueOwnerBookings(ownerId),
        getBookingStats(ownerId)
      ])
      
      setBookings(bookingsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [ownerId])

  // Handle booking confirmation
  const handleConfirmBooking = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await confirmBooking(bookingId, venueOwnerNotes)
      toast.success('Booking confirmed successfully!')
      setSelectedBooking(null)
      setVenueOwnerNotes('')
      loadBookings() // Refresh data
    } catch (error) {
      toast.error('Failed to confirm booking')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string, reason: string) => {
    setActionLoading(bookingId)
    try {
      await cancelBooking(bookingId, reason)
      toast.success('Booking cancelled successfully!')
      setSelectedBooking(null)
      loadBookings() // Refresh data
    } catch (error) {
      toast.error('Failed to cancel booking')
    } finally {
      setActionLoading(null)
    }
  }

  // Filter bookings by status
  const filterBookings = (status?: string) => {
    if (!status) return bookings
    return bookings.filter(booking => booking.status === status)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-red"></div>
        <span className="ml-3 text-lg">Loading bookings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
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
                <Check className="w-5 h-5 text-green-500" />
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
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking Management Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterBookings('pending').length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({filterBookings('confirmed').length})</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">All Venue Bookings</h3>
            <p className="text-sm text-gray-600 mb-4">
              View all bookings across your venues. Click on events to see details.
            </p>
            {/* Note: For now we'll show the booking list in calendar tab */}
            <BookingList 
              bookings={bookings}
              onViewBooking={setSelectedBooking}
            />
          </div>
        </TabsContent>

        {/* Pending Bookings */}
        <TabsContent value="pending">
          <BookingList 
            bookings={filterBookings('pending')}
            onViewBooking={setSelectedBooking}
            showActions={true}
            actionLoading={actionLoading}
            onConfirm={handleConfirmBooking}
            onCancel={handleCancelBooking}
          />
        </TabsContent>

        {/* Confirmed Bookings */}
        <TabsContent value="confirmed">
          <BookingList 
            bookings={filterBookings('confirmed')}
            onViewBooking={setSelectedBooking}
          />
        </TabsContent>

        {/* All Bookings */}
        <TabsContent value="all">
          <BookingList 
            bookings={bookings}
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

                {/* Vendor Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">Vendor Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span>
                        {selectedBooking.vendor?.vendor_profile?.food_truck_name || 
                         `${selectedBooking.vendor?.first_name} ${selectedBooking.vendor?.last_name}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedBooking.vendor?.email}</span>
                    </div>
                    {selectedBooking.vendor?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedBooking.vendor?.phone}</span>
                      </div>
                    )}
                    {selectedBooking.vendor?.vendor_profile?.cuisine_type && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Cuisine:</span>
                        <span className="capitalize">{selectedBooking.vendor.vendor_profile.cuisine_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="space-y-2">
                  <h3 className="font-medium">Special Requests</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}

              {/* Venue Owner Notes */}
              {selectedBooking.venue_owner_notes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Your Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {selectedBooking.venue_owner_notes}
                  </p>
                </div>
              )}

              {/* Actions for pending bookings */}
              {selectedBooking.status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="notes">Add notes for the vendor (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any instructions or information for the vendor..."
                      value={venueOwnerNotes}
                      onChange={(e) => setVenueOwnerNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleConfirmBooking(selectedBooking.id)}
                      disabled={actionLoading === selectedBooking.id}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelBooking(selectedBooking.id, 'Declined by venue owner')}
                      disabled={actionLoading === selectedBooking.id}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Booking List Component
interface BookingListProps {
  bookings: BookingWithDetails[]
  onViewBooking: (booking: BookingWithDetails) => void
  showActions?: boolean
  actionLoading?: string | null
  onConfirm?: (bookingId: string) => void
  onCancel?: (bookingId: string, reason: string) => void
}

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  onViewBooking,
  showActions = false,
  actionLoading,
  onConfirm,
  onCancel
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
          <p className="text-gray-500">No bookings match the current filter.</p>
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
                  <p className="font-medium">
                    {booking.vendor?.vendor_profile?.food_truck_name || 
                     `${booking.vendor?.first_name} ${booking.vendor?.last_name}`}
                  </p>
                  <p className="text-sm text-gray-500">{booking.vendor?.email}</p>
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
                
                {showActions && booking.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onConfirm?.(booking.id)}
                      disabled={actionLoading === booking.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onCancel?.(booking.id, 'Declined by venue owner')}
                      disabled={actionLoading === booking.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 