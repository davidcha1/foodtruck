'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, Event } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getListingBookingsInRange } from '@/lib/bookings'
import { BookingWithDetails } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'

const localizer = momentLocalizer(moment)

// Custom toolbar component for the calendar
const CustomToolbar = ({ label, onNavigate, onView }: any) => {
  return (
    <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          Next
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
      </div>
      
      <h3 className="text-lg font-semibold">{label}</h3>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView('month')}
        >
          Month
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView('week')}
        >
          Week
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView('day')}
        >
          Day
        </Button>
      </div>
    </div>
  )
}

interface BookingEvent extends Event {
  booking: BookingWithDetails
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

interface BookingCalendarProps {
  listingId: string
  listingTitle?: string
  isOwnerView?: boolean
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  onSelectEvent?: (event: BookingEvent) => void
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  listingId,
  listingTitle,
  isOwnerView = false,
  onSelectSlot,
  onSelectEvent
}) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [events, setEvents] = useState<BookingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Load bookings for the current view
  const loadBookings = useCallback(async (start: Date, end: Date) => {
    try {
      setLoading(true)
      const startDate = format(start, 'yyyy-MM-dd')
      const endDate = format(end, 'yyyy-MM-dd')
      
      const bookingData = await getListingBookingsInRange(listingId, startDate, endDate)
      setBookings(bookingData)
      
      // Convert bookings to calendar events
      const calendarEvents: BookingEvent[] = bookingData.map(booking => ({
        id: booking.id,
                 title: isOwnerView 
           ? `${booking.vendor?.vendor_profile?.food_truck_name || `${booking.vendor?.first_name} ${booking.vendor?.last_name}`}` 
           : booking.listing?.title || 'Booking',
        start: new Date(`${booking.booking_date}T${booking.start_time}`),
        end: new Date(`${booking.booking_date}T${booking.end_time}`),
        resource: booking,
        booking,
        status: booking.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'
      }))
      
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [listingId, isOwnerView])

  // Load bookings when component mounts or date range changes
  useEffect(() => {
    const start = moment(currentDate).startOf('month').toDate()
    const end = moment(currentDate).endOf('month').toDate()
    loadBookings(start, end)
  }, [currentDate, loadBookings])

  // Handle calendar navigation
  const handleNavigate = (date: Date) => {
    setCurrentDate(date)
  }

  // Handle event selection
  const handleSelectEvent = (event: BookingEvent) => {
    setSelectedBooking(event.booking)
    onSelectEvent?.(event)
  }

  // Handle slot selection for new bookings
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo)
    }
  }

  // Event styling based on status
  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = '#3174ad'
    
    switch (event.status) {
      case 'pending':
        backgroundColor = '#f59e0b' // yellow
        break
      case 'confirmed':
        backgroundColor = '#10b981' // green
        break
      case 'cancelled':
        backgroundColor = '#ef4444' // red
        break
      case 'completed':
        backgroundColor = '#6b7280' // gray
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.status === 'cancelled' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Booking Calendar</span>
            {listingTitle && <span className="text-muted-text">- {listingTitle}</span>}
          </CardTitle>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Pending
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Confirmed
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Cancelled
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              Completed
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-red"></div>
              <span className="ml-2">Loading calendar...</span>
            </div>
          ) : (
            <div className="h-96">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                onNavigate={handleNavigate}
                eventPropGetter={eventStyleGetter}
                selectable={!!onSelectSlot}
                popup
                components={{
                  toolbar: CustomToolbar
                }}
                formats={{
                  timeGutterFormat: 'HH:mm',
                  eventTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
                    localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture)
                }}
                defaultView="week"
                views={['month', 'week', 'day']}
                step={60}
                showMultiDayTimes
                min={new Date(2024, 0, 1, 6, 0)} // 6 AM
                max={new Date(2024, 0, 1, 22, 0)} // 10 PM
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal/Panel */}
      {selectedBooking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Booking Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBooking(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span>
                    {format(new Date(`${selectedBooking.booking_date}T${selectedBooking.start_time}`), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Duration:</span>
                  <span>
                    {selectedBooking.start_time} - {selectedBooking.end_time} 
                    ({selectedBooking.total_hours}h)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={
                      selectedBooking.status === 'confirmed' ? 'default' :
                      selectedBooking.status === 'pending' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-medium">Cost:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${selectedBooking.total_cost}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {isOwnerView ? (
                  // Vendor details for venue owners
                  <div className="space-y-2">
                    <h4 className="font-medium">Vendor Information</h4>
                                         <div className="flex items-center space-x-2">
                       <User className="w-4 h-4 text-gray-500" />
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
                  </div>
                ) : (
                  // Venue details for vendors
                  <div className="space-y-2">
                    <h4 className="font-medium">Venue Information</h4>
                                         <div className="flex items-center space-x-2">
                       <MapPin className="w-4 h-4 text-gray-500" />
                       <span>{selectedBooking.listing?.title}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <User className="w-4 h-4 text-gray-500" />
                       <span>
                         {selectedBooking.listing?.owner?.first_name} {selectedBooking.listing?.owner?.last_name}
                       </span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Mail className="w-4 h-4 text-gray-500" />
                       <span>{selectedBooking.listing?.owner?.email}</span>
                     </div>
                  </div>
                )}

                {selectedBooking.special_requests && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Special Requests</h4>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.special_requests}
                    </p>
                  </div>
                )}

                {selectedBooking.venue_owner_notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Venue Owner Notes</h4>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.venue_owner_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 