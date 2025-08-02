import { supabase } from './supabase'

export interface DashboardStats {
  totalVenues: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
  thisMonthRevenue: number
  avgBookingValue: number
}

export interface RecentVenue {
  id: string
  title: string
  city: string
  bookingsCount: number
  lastBooking: string | null
  status: 'active' | 'inactive'
}

export const getDashboardStats = async (ownerId: string): Promise<DashboardStats> => {
  try {
    // Get total venues
    const { data: venues, error: venuesError } = await supabase
      .from('listings')
      .select('id')
      .eq('owner_id', ownerId)

    if (venuesError) {
      console.error('Error fetching venues:', venuesError)
      throw venuesError
    }

    // Get all bookings for this owner's venues
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        total_cost,
        status,
        booking_date,
        created_at,
        listings!inner (
          owner_id
        )
      `)
      .eq('listings.owner_id', ownerId)

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }

    // Calculate statistics with safe defaults
    const totalBookings = Array.isArray(bookings) ? bookings.length : 0
    const pendingBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'pending').length : 0
    const confirmedBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'confirmed').length : 0
    
    // Calculate total revenue from completed bookings
    const completedBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'completed') : []
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      const cost = Number(booking.total_cost) || 0
      return sum + cost
    }, 0)

    // Calculate this month's revenue
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const thisMonthRevenue = completedBookings
      .filter(booking => {
        try {
          const bookingDate = new Date(booking.booking_date)
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
        } catch (error) {
          console.warn('Invalid booking date:', booking.booking_date)
          return false
        }
      })
      .reduce((sum, booking) => {
        const cost = Number(booking.total_cost) || 0
        return sum + cost
      }, 0)

    // Calculate average booking value
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    return {
      totalVenues: Array.isArray(venues) ? venues.length : 0,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      thisMonthRevenue,
      avgBookingValue: Math.round(avgBookingValue)
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default stats instead of throwing to prevent UI breaking
    return {
      totalVenues: 0,
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      totalRevenue: 0,
      thisMonthRevenue: 0,
      avgBookingValue: 0
    }
  }
}

export const getRecentVenues = async (ownerId: string): Promise<RecentVenue[]> => {
  try {
    const { data: venues, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        city,
        status,
        created_at,
        bookings (
          id,
          booking_date,
          created_at
        )
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return venues?.map(venue => {
      const bookingsCount = venue.bookings?.length || 0
      const lastBooking = venue.bookings && venue.bookings.length > 0 
        ? venue.bookings
            .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())[0]
            .booking_date
        : null

      return {
        id: venue.id,
        title: venue.title,
        city: venue.city,
        bookingsCount,
        lastBooking,
        status: venue.status as 'active' | 'inactive'
      }
    }) || []
  } catch (error) {
    console.error('Error fetching recent venues:', error)
    throw error
  }
} 