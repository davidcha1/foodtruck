'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleCalendar } from '@/components/ui/simple-calendar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Clock, 
  CalendarIcon, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Sun,
  Utensils,
  Moon,
  Calendar,
  ChevronDown
} from 'lucide-react'
import { format, addDays, isBefore, isAfter } from 'date-fns'
import { getAvailableTimeSlots, checkAvailability } from '@/lib/bookings'
import { calculateBookingCost } from '@/lib/bookings'

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

interface ServicePeriod {
  id: string
  name: string
  icon: any
  startTime: string
  endTime: string
  description: string
  popular?: boolean
}

interface TimeSlotPickerProps {
  listingId: string
  hourlyRate: number
  dailyRate: number
  minBookingHours?: number
  maxBookingHours?: number
  onSelectionChange?: (selection: {
    date: string
    startTime: string
    endTime: string
    totalHours: number
    totalCost: number
  } | null) => void
  selectedDate?: Date | null
  selectedStartTime?: string
  selectedEndTime?: string
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  listingId,
  hourlyRate,
  dailyRate,
  minBookingHours = 4,
  maxBookingHours = 16,
  onSelectionChange,
  selectedDate: initialDate,
  selectedStartTime: initialStartTime,
  selectedEndTime: initialEndTime
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null)
  const [selectedStartTime, setSelectedStartTime] = useState(initialStartTime || '')
  const [selectedEndTime, setSelectedEndTime] = useState(initialEndTime || '')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Use ref to avoid re-renders when onSelectionChange changes
  const onSelectionChangeRef = useRef(onSelectionChange)
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
  }, [onSelectionChange])

  // Define service periods that food trucks commonly need
  const servicePeriods: ServicePeriod[] = [
    {
      id: 'all-day',
      name: 'All Day',
      icon: Calendar,
      startTime: '07:00',
      endTime: '21:00',
      description: '7 AM - 9 PM (14 hours)',
      popular: true
    },
    {
      id: 'lunch-dinner',
      name: 'Lunch & Dinner',
      icon: Utensils,
      startTime: '11:00',
      endTime: '21:00',
      description: '11 AM - 9 PM (10 hours)'
    },
    {
      id: 'morning-lunch',
      name: 'Morning & Lunch',
      icon: Sun,
      startTime: '07:00',
      endTime: '15:00',
      description: '7 AM - 3 PM (8 hours)'
    },
    {
      id: 'lunch-only',
      name: 'Lunch Service',
      icon: Utensils,
      startTime: '11:00',
      endTime: '15:00',
      description: '11 AM - 3 PM (4 hours)'
    },
    {
      id: 'dinner-only',
      name: 'Dinner Service',
      icon: Moon,
      startTime: '17:00',
      endTime: '21:00',
      description: '5 PM - 9 PM (4 hours)'
    }
  ]

  // Load available slots for selected date
  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDate) return

    setLoading(true)
    setError(null)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const slots = await getAvailableTimeSlots(listingId, dateStr, 1)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading available slots:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Set a more user-friendly error message
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        setError('Network error. Please check your connection and try again.')
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
        setError('Permission denied. Please sign in and try again.')
      } else {
        setError(`Failed to load available time slots: ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }, [listingId, selectedDate])

  // Check availability for custom time range
  const checkCustomAvailability = useCallback(async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      onSelectionChangeRef.current?.(null)
      return
    }

    setCheckingAvailability(true)
    setError(null)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const isAvailable = await checkAvailability(
        listingId,
        dateStr,
        selectedStartTime,
        selectedEndTime
      )
      
      if (isAvailable) {
        const totalHours = calculateTotalHours(selectedStartTime, selectedEndTime)
        const totalCost = calculateBookingCost(
          hourlyRate,
          dailyRate,
          selectedStartTime,
          selectedEndTime,
          totalHours
        )
        
        onSelectionChangeRef.current?.({
          date: dateStr,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          totalHours,
          totalCost
        })
      } else {
        onSelectionChangeRef.current?.(null)
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setError('Failed to check availability. Please try again.')
      onSelectionChangeRef.current?.(null)
    } finally {
      setCheckingAvailability(false)
    }
  }, [listingId, selectedDate, selectedStartTime, selectedEndTime, hourlyRate, dailyRate])

  useEffect(() => {
    loadAvailableSlots()
  }, [loadAvailableSlots])

  // Debounce the availability check to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedDate && selectedStartTime && selectedEndTime) {
        checkCustomAvailability()
      } else {
        onSelectionChangeRef.current?.(null)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [selectedDate, selectedStartTime, selectedEndTime, checkCustomAvailability])

  // Calculate total hours between times
  const calculateTotalHours = (start: string, end: string): number => {
    const [startHour] = start.split(':').map(Number)
    const [endHour] = end.split(':').map(Number)
    return endHour - startHour
  }

  // Handle service period selection
  const handleServicePeriodSelect = (period: ServicePeriod) => {
    if (!selectedDate) return

    setSelectedPeriod(period.id)
    setSelectedStartTime(period.startTime)
    setSelectedEndTime(period.endTime)
  }

  // Check if a service period is available
  const isPeriodAvailable = (period: ServicePeriod): boolean => {
    if (!selectedDate || loading) return false
    
    return !availableSlots.some(slot => {
      const slotStart = slot.start
      const slotEnd = slot.end
      const periodStart = period.startTime
      const periodEnd = period.endTime
      
      // Check if period overlaps with any unavailable slot
      return !slot.available && (
        (periodStart >= slotStart && periodStart < slotEnd) ||
        (periodEnd > slotStart && periodEnd <= slotEnd) ||
        (periodStart <= slotStart && periodEnd >= slotEnd)
      )
    })
  }

  // Validate time selection
  const isValidTimeSelection = (): boolean => {
    if (!selectedStartTime || !selectedEndTime) return false
    
    const totalHours = calculateTotalHours(selectedStartTime, selectedEndTime)
    return totalHours >= minBookingHours && totalHours <= maxBookingHours
  }

  // Get availability status for current selection
  const getAvailabilityStatus = () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      return { status: 'none', message: 'Please select date and service period' }
    }

    if (!isValidTimeSelection()) {
      const totalHours = calculateTotalHours(selectedStartTime, selectedEndTime)
      return { 
        status: 'invalid', 
        message: `Booking must be ${minBookingHours}-${maxBookingHours} hours (current: ${totalHours}h)` 
      }
    }

    if (checkingAvailability) {
      return { status: 'checking', message: 'Checking availability...' }
    }

    const totalHours = calculateTotalHours(selectedStartTime, selectedEndTime)
    const totalCost = calculateBookingCost(hourlyRate, dailyRate, selectedStartTime, selectedEndTime, totalHours)
    const usesDailyRate = totalHours >= 8

    return { 
      status: 'available', 
      message: usesDailyRate 
        ? `Available - £${totalCost} (Daily Rate for ${totalHours}h)`
        : `Available - £${totalCost} for ${totalHours}h`,
      cost: totalCost,
      hours: totalHours,
      usesDailyRate
    }
  }

  const availabilityStatus = getAvailabilityStatus()

  // Format selected booking for display
  const getSelectionDisplay = () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      return 'Check availability'
    }
    
    const dateStr = format(selectedDate, 'MMM dd')
    const startTime = format(new Date(`2000-01-01T${selectedStartTime}`), 'h:mm a')
    const endTime = format(new Date(`2000-01-01T${selectedEndTime}`), 'h:mm a')
    
    return `${dateStr} • ${startTime} - ${endTime}`
  }

  const handleConfirmSelection = () => {
    if (availabilityStatus.status === 'available') {
      setIsModalOpen(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant={selectedDate && selectedStartTime && selectedEndTime ? "outline" : "default"}
            className={`w-full justify-between h-12 text-left ${
              !selectedDate || !selectedStartTime || !selectedEndTime 
                ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{getSelectionDisplay()}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DialogTrigger>

        {/* Modal Content */}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Date & Time</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Choose Date</span>
                </h3>
                <div className="flex justify-center">
                  <SimpleCalendar
                    selected={selectedDate || undefined}
                    onSelect={(date) => {
                      setSelectedDate(date || null)
                      setSelectedStartTime('')
                      setSelectedEndTime('')
                      setSelectedPeriod(null)
                    }}
                    disabled={(date: Date) => 
                      isBefore(date, new Date()) || 
                      isAfter(date, addDays(new Date(), 90))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Service Period Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Choose Time</span>
                  {selectedDate && (
                    <span className="text-sm font-normal text-gray-500">
                      {format(selectedDate, 'EEE, MMM dd')}
                    </span>
                  )}
                </h3>

                {!selectedDate ? (
                  <div className="flex items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="text-center">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select a date first</p>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-red mx-auto mb-3"></div>
                      <span className="text-sm text-gray-600">Checking availability...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {servicePeriods.map((period) => {
                      const isAvailable = isPeriodAvailable(period)
                      const isSelected = selectedPeriod === period.id
                      const totalHours = calculateTotalHours(period.startTime, period.endTime)
                      const cost = calculateBookingCost(hourlyRate, dailyRate, period.startTime, period.endTime, totalHours)
                      const usesDailyRate = totalHours >= 8

                      return (
                        <Button
                          key={period.id}
                          variant={isSelected ? "default" : "outline"}
                          disabled={!isAvailable}
                          onClick={() => handleServicePeriodSelect(period)}
                          className={`w-full h-auto p-4 flex items-center justify-between ${
                            !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <period.icon className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium flex items-center space-x-2">
                                <span>{period.name}</span>
                                {period.popular && (
                                  <Badge className="bg-warm-red text-white text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm opacity-80">
                                {period.description}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold">
                              £{cost}
                            </div>
                            {usesDailyRate && (
                              <div className="text-xs text-green-600">
                                daily rate
                              </div>
                            )}
                            {!isAvailable && (
                              <div className="text-xs text-red-500">
                                unavailable
                              </div>
                            )}
                          </div>
                        </Button>
                      )
                    })}

                    {/* Custom Time Range */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 p-3 border rounded">
                        Custom time range
                      </summary>
                      <div className="grid grid-cols-2 gap-4 mt-3 p-4 bg-gray-50 rounded">
                        <div>
                          <Label htmlFor="start-time" className="text-sm font-medium">Start Time</Label>
                          <select
                            id="start-time"
                            value={selectedStartTime}
                            onChange={(e) => {
                              setSelectedStartTime(e.target.value)
                              setSelectedPeriod(null)
                            }}
                            className="w-full p-3 border rounded text-sm mt-1"
                          >
                            <option value="">Select start time</option>
                            {Array.from({length: 17}, (_, i) => i + 6).map((hour) => {
                              const time = `${hour.toString().padStart(2, '0')}:00`
                              return (
                                <option key={time} value={time}>
                                  {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                                </option>
                              )
                            })}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="end-time" className="text-sm font-medium">End Time</Label>
                          <select
                            id="end-time"
                            value={selectedEndTime}
                            onChange={(e) => {
                              setSelectedEndTime(e.target.value)
                              setSelectedPeriod(null)
                            }}
                            className="w-full p-3 border rounded text-sm mt-1"
                          >
                            <option value="">Select end time</option>
                            {Array.from({length: 17}, (_, i) => i + 6).map((hour) => {
                              const time = `${hour.toString().padStart(2, '0')}:00`
                              if (!selectedStartTime || time > selectedStartTime) {
                                return (
                                  <option key={time} value={time}>
                                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                                  </option>
                                )
                              }
                              return null
                            })}
                          </select>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Status & Confirm */}
            {selectedDate && selectedStartTime && selectedEndTime && (
              <div className="border-t pt-6">
                <div className={`p-4 rounded-lg border ${
                  availabilityStatus.status === 'available' ? 'bg-green-50 border-green-200' :
                  availabilityStatus.status === 'checking' ? 'bg-blue-50 border-blue-200' :
                  availabilityStatus.status === 'invalid' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {availabilityStatus.status === 'available' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {availabilityStatus.status === 'checking' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                      {availabilityStatus.status === 'invalid' && <XCircle className="w-5 h-5 text-yellow-600" />}
                      
                      <span className={`font-medium ${
                        availabilityStatus.status === 'available' ? 'text-green-800' :
                        availabilityStatus.status === 'checking' ? 'text-blue-800' :
                        availabilityStatus.status === 'invalid' ? 'text-yellow-800' :
                        'text-gray-600'
                      }`}>
                        {availabilityStatus.message}
                      </span>
                    </div>

                    {availabilityStatus.status === 'available' && (
                      <Button onClick={handleConfirmSelection} className="bg-gray-900 hover:bg-gray-800">
                        Confirm Selection
                      </Button>
                    )}
                  </div>
                  
                  {availabilityStatus.status === 'available' && availabilityStatus.usesDailyRate && (
                    <div className="mt-2 text-sm text-green-700">
                      🎉 You're getting the daily rate! Perfect for longer service periods.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 