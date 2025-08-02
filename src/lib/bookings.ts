import { supabase } from './supabase'
import { Booking, BookingInsert, BookingUpdate, BookingWithDetails } from '@/types'

// Get all bookings for a listing on a specific date
export const getListingBookings = async (listingId: string, date?: string) => {
  try {
    console.log('getListingBookings called with:', { listingId, date })
    
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('listing_id', listingId)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (date) {
      query = query.eq('booking_date', date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }
    
    console.log('Query successful, found bookings:', data?.length || 0)
    return data as BookingWithDetails[]
    
  } catch (error) {
    console.error('Error in getListingBookings:', error)
    throw error
  }
}

// Get bookings for a date range
export const getListingBookingsInRange = async (
  listingId: string,
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      users!vendor_id (
        first_name,
        last_name,
        vendor_profiles (
          food_truck_name
        )
      )
    `)
    .eq('listing_id', listingId)
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)
    .in('status', ['pending', 'confirmed'])
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data as BookingWithDetails[]
}

// Check if a time slot is available
export const checkAvailability = async (
  listingId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
) => {
  let query = supabase
    .from('bookings')
    .select('id')
    .eq('listing_id', listingId)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed'])
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length === 0
}

// Get available time slots for a date
export const getAvailableTimeSlots = async (
  listingId: string,
  date: string,
  duration: number = 1 // hours
) => {
  try {
    const existingBookings = await getListingBookings(listingId, date)
    
    // Define operating hours (can be made configurable per listing)
    const startHour = 6 // 6 AM
    const endHour = 22 // 10 PM
    
    const availableSlots: Array<{ start: string; end: string; available: boolean }> = []
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + duration).toString().padStart(2, '0')}:00`
      
      // Check if this slot conflicts with existing bookings
      const isAvailable = !existingBookings.some(booking => {
        const bookingStart = booking.start_time
        const bookingEnd = booking.end_time
        
        return (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        )
      })
      
      availableSlots.push({
        start: startTime,
        end: endTime,
        available: isAvailable
      })
    }
    
    return availableSlots
  } catch (error) {
    console.error('Error in getAvailableTimeSlots:', error)
    throw error
  }
}

// Create a new booking
export const createBooking = async (bookingData: BookingInsert) => {
  console.log('createBooking called with:', bookingData)
  
  // First check availability
  const isAvailable = await checkAvailability(
    bookingData.listing_id,
    bookingData.booking_date,
    bookingData.start_time,
    bookingData.end_time
  )

  console.log('Availability check result:', isAvailable)

  if (!isAvailable) {
    throw new Error('This time slot is not available')
  }

  console.log('Attempting to insert booking into database...')
  
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select(`
      *,
      listings (
        title,
        hourly_rate,
        daily_rate,
        users!owner_id (
          first_name,
          last_name,
          email
        )
      ),
      users!vendor_id (
        first_name,
        last_name,
        email
      )
    `)
    .single()

  if (error) {
    console.error('Supabase error creating booking:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    console.error('Booking data that failed:', bookingData)
    throw new Error(`Failed to create booking: ${error.message}`)
  }
  
  console.log('Booking created successfully:', data)
  return data as BookingWithDetails
}

// Update a booking
export const updateBooking = async (id: string, updates: BookingUpdate) => {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      listings (
        title,
        hourly_rate,
        daily_rate,
        users!owner_id (
          first_name,
          last_name,
          email
        )
      ),
      users!vendor_id (
        first_name,
        last_name,
        email
      )
    `)
    .single()

  if (error) throw error
  return data as BookingWithDetails
}

// Get vendor's bookings
export const getVendorBookings = async (vendorId: string, status?: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      listings (
        title,
        address,
        city,
        state,
        hourly_rate,
        daily_rate,
        users!owner_id (
          first_name,
          last_name,
          email,
          phone
        )
      )
    `)
    .eq('vendor_id', vendorId)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BookingWithDetails[]
}

// Get venue owner's bookings
export const getVenueOwnerBookings = async (ownerId: string, status?: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      listings!inner (
        id,
        title,
        address,
        city,
        state
      ),
      users!vendor_id (
        first_name,
        last_name,
        email,
        phone,
        vendor_profiles (
          food_truck_name,
          cuisine_type
        )
      )
    `)
    .eq('listings.owner_id', ownerId)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BookingWithDetails[]
}

// Cancel a booking
export const cancelBooking = async (id: string, reason: string) => {
  return updateBooking(id, {
    status: 'cancelled',
    cancellation_reason: reason
  })
}

// Confirm a booking (venue owner action)
export const confirmBooking = async (id: string, notes?: string) => {
  return updateBooking(id, {
    status: 'confirmed',
    venue_owner_notes: notes
  })
}

// Mark booking as completed
export const completeBooking = async (id: string) => {
  return updateBooking(id, {
    status: 'completed'
  })
}

// Calculate booking cost
export const calculateBookingCost = (
  hourlyRate: number,
  dailyRate: number,
  startTime: string,
  endTime: string,
  totalHours: number
) => {
  // If booking is 8+ hours, use daily rate
  if (totalHours >= 8) {
    return dailyRate
  }
  
  // Otherwise use hourly rate
  return hourlyRate * totalHours
}

// Get booking statistics for a venue owner
export const getBookingStats = async (ownerId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('bookings')
    .select(`
      status,
      total_cost,
      booking_date,
      listings!inner (
        owner_id
      )
    `)
    .eq('listings.owner_id', ownerId)

  if (startDate) {
    query = query.gte('booking_date', startDate)
  }
  if (endDate) {
    query = query.lte('booking_date', endDate)
  }

  const { data, error } = await query

  if (error) throw error

  // Calculate statistics
  const stats = {
    total: data.length,
    pending: data.filter(b => b.status === 'pending').length,
    confirmed: data.filter(b => b.status === 'confirmed').length,
    cancelled: data.filter(b => b.status === 'cancelled').length,
    completed: data.filter(b => b.status === 'completed').length,
    totalRevenue: data
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + Number(b.total_cost), 0)
  }

  return stats
}