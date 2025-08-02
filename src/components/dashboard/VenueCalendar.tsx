'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Check, 
  X,
  Filter,
  Building2,
  TrendingUp
} from 'lucide-react'
import { format, isSameDay, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { confirmBooking, cancelBooking } from '@/lib/bookings'

interface Venue {
  id: string
  title: string
  city: string
  address: string
}

interface BookingEvent {
  id: string
  listing_id: string
  venue_title: string
  venue_address: string
  booking_date: string
  start_time: string
  end_time: string
  total_cost: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  vendor_id: string
  vendor_name: string
  vendor_phone?: string
  food_truck_name?: string
  cuisine_type?: string
  vendor_notes?: string
  venue_owner_notes?: string
}

interface VenueCalendarProps {
  ownerId: string
}

export function VenueCalendar({ ownerId }: VenueCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState<string>('all')
  const [bookings, setBookings] = useState<BookingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null)

  useEffect(() => {
    loadVenuesAndBookings()
  }, [ownerId])

  const loadVenuesAndBookings = async () => {
    try {
      setLoading(true)
      
      // Load venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('listings')
        .select('id, title, city, address')
        .eq('owner_id', ownerId)
        .eq('status', 'active')

      if (venuesError) throw venuesError

      // Load bookings with vendor details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          listing_id,
          booking_date,
          start_time,
          end_time,
          total_cost,
          status,
          listings!inner (
            title,
            address,
            owner_id
          ),
          users!vendor_id (
            first_name,
            last_name,
            phone,
            vendor_profiles (
              food_truck_name,
              cuisine_type
            )
          )
        `)
        .eq('listings.owner_id', ownerId)
        .order('booking_date', { ascending: true })

      if (bookingsError) throw bookingsError

      setVenues(venuesData || [])
      
      // Transform bookings data
      const transformedBookings: BookingEvent[] = (bookingsData || []).map(booking => ({
        id: booking.id,
        listing_id: booking.listing_id,
        venue_title: booking.listings.title,
        venue_address: booking.listings.address,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        total_cost: booking.total_cost,
        status: booking.status,
        vendor_id: 'vendor-id', // Placeholder for now
        vendor_name: `${booking.users?.first_name || ''} ${booking.users?.last_name || ''}`.trim(),
        vendor_phone: booking.users?.phone || undefined,
        food_truck_name: booking.users?.vendor_profiles?.food_truck_name || undefined,
        cuisine_type: booking.users?.vendor_profiles?.cuisine_type || undefined,
        vendor_notes: undefined, // Will be added later when column exists
        venue_owner_notes: undefined // Will be added later when column exists
      }))

      setBookings(transformedBookings)
    } catch (error) {
      console.error('Error loading calendar data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      if (selectedVenue !== 'all' && booking.listing_id !== selectedVenue) {
        return false
      }
      try {
        return isSameDay(parseISO(booking.booking_date), date)
      } catch (error) {
        console.error('Error parsing booking date:', booking.booking_date, error)
        return false
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500'
      case 'confirmed': return 'bg-blue-500'
      case 'completed': return 'bg-emerald-500'
      case 'cancelled': return 'bg-rose-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200'
      case 'confirmed': return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      case 'cancelled': return 'text-rose-700 bg-rose-50 border-rose-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId, 'Approved from calendar')
      toast.success('Booking approved successfully!')
      loadVenuesAndBookings()
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error approving booking:', error)
      toast.error('Failed to approve booking')
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId, 'Rejected by venue owner')
      toast.success('Booking rejected')
      loadVenuesAndBookings()
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error rejecting booking:', error)
      toast.error('Failed to reject booking')
    }
  }

  // Get booking days for calendar highlighting
  const getBookedDays = () => {
    const filteredBookings = bookings.filter(booking => 
      selectedVenue === 'all' || booking.listing_id === selectedVenue
    )
    
    const bookedDates = filteredBookings
      .map(booking => {
        try {
          return parseISO(booking.booking_date)
        } catch (error) {
          console.error('Error parsing booking date:', booking.booking_date, error)
          return null
        }
      })
      .filter(Boolean) as Date[]
    
    return bookedDates
  }

  // Get available days (future days without bookings)
  const getAvailableDays = () => {
    const today = startOfDay(new Date())
    const bookedDays = getBookedDays()
    const availableDays: Date[] = []
    
    // Generate the next 90 days and check which ones are available
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)
      
      const isBooked = bookedDays.some(bookedDate => 
        isSameDay(bookedDate, checkDate)
      )
      
      if (!isBooked) {
        availableDays.push(checkDate)
      }
    }
    
    return availableDays
  }

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : []
  const pendingCount = bookings.filter(b => b.status === 'pending' && (selectedVenue === 'all' || b.listing_id === selectedVenue)).length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed' && (selectedVenue === 'all' || b.listing_id === selectedVenue)).length

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Venue Calendar</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage bookings across {selectedVenue === 'all' ? 'all venues' : 'selected venue'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto min-w-0">
            <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm min-w-0 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger className="w-full sm:w-[200px] md:w-[240px] border-none shadow-none focus:ring-0 min-w-0">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[200px] max-w-[300px]">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">All Venues</span>
                    </div>
                  </SelectItem>
                  {venues.map(venue => (
                    <SelectItem key={venue.id} value={venue.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{venue.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-end w-full lg:w-auto">
              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-1 sm:mr-2 flex-shrink-0"></span>
                <span className="whitespace-nowrap">{pendingCount} Pending</span>
              </Badge>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 sm:mr-2 flex-shrink-0"></span>
                <span className="whitespace-nowrap">{confirmedCount} Confirmed</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Enhanced Calendar */}
        <Card className="xl:col-span-3 shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Booking Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-500 mt-4">Loading calendar...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    numberOfMonths={3}
                    pagedNavigation
                    fixedWeeks
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 min-w-fit"
                    modifiers={{
                      available: getAvailableDays(),
                      booked: getBookedDays()
                    }}
                    modifiersClassNames={{
                      available: "relative after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-emerald-500 after:rounded-full after:shadow-sm",
                      booked: "relative after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-rose-500 after:rounded-full after:shadow-sm"
                    }}
                  />
                </div>
                
                {/* Enhanced Legend */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Legend
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-gray-700">Available</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-gray-700">Booked</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-gray-700">Pending</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                      <span className="text-sm font-medium text-gray-700">Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Selected Day Details */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDateBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-emerald-700 font-semibold">Available Day</span>
                </div>
                <p className="text-gray-500 text-sm">
                  No bookings scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center gap-2 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span className="text-rose-700 font-semibold">Booked Day</span>
                  </div>
                </div>
                
                {selectedDateBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={`${getStatusTextColor(booking.status)} border font-medium`}>
                        {booking.status}
                      </Badge>
                      <span className="text-lg font-semibold text-gray-900">
                        £{booking.total_cost}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{booking.venue_title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span className="truncate">
                          {booking.food_truck_name || booking.vendor_name}
                        </span>
                      </div>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApproveBooking(booking.id)
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRejectBooking(booking.id)
                          }}
                          className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Venue Information
                  </h4>
                  <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedBooking.venue_title}</span>
                    </div>
                    <div className="text-gray-600 ml-6">
                      {selectedBooking.venue_address}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Booking Details
                  </h4>
                  <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span>{format(parseISO(selectedBooking.booking_date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{selectedBooking.start_time} - {selectedBooking.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-lg text-gray-900">£{selectedBooking.total_cost}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Vendor Information
                </h4>
                <div className="space-y-3 text-sm bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedBooking.vendor_name}</span>
                  </div>
                  {selectedBooking.food_truck_name && (
                    <div className="ml-6">
                      <span className="font-medium text-gray-600">Business:</span> {selectedBooking.food_truck_name}
                    </div>
                  )}
                  {selectedBooking.cuisine_type && (
                    <div className="ml-6">
                      <span className="font-medium text-gray-600">Cuisine:</span> {selectedBooking.cuisine_type}
                    </div>
                  )}
                  {selectedBooking.vendor_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedBooking.vendor_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.vendor_notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Vendor Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedBooking.vendor_notes}
                  </p>
                </div>
              )}

              {selectedBooking.venue_owner_notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Your Notes</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {selectedBooking.venue_owner_notes}
                  </p>
                </div>
              )}

              {selectedBooking.status === 'pending' && (
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={() => handleApproveBooking(selectedBooking.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Booking
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleRejectBooking(selectedBooking.id)}
                    className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                    size="lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 