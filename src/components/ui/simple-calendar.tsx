'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function SimpleCalendar({ selected, onSelect, disabled, className }: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return selected || new Date()
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate()

  // Get previous month's last few days
  const prevMonth = new Date(year, month - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()

  // Generate calendar days
  const calendarDays: (Date | null)[] = []

  // Previous month's trailing days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    calendarDays.push(date)
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    calendarDays.push(date)
  }

  // Next month's leading days to fill the grid
  const remainingCells = 42 - calendarDays.length // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day)
    calendarDays.push(date)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isSelected = (date: Date) => {
    if (!selected) return false
    return date.toDateString() === selected.toDateString()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false
  }

  return (
    <div className={cn("p-4 bg-white rounded-lg border shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h2 className="text-lg font-semibold">
          {MONTHS[month]} {year}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.slice(0, 42).map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />
          
          const dayIsSelected = isSelected(date)
          const dayIsToday = isToday(date)
          const dayIsCurrentMonth = isCurrentMonth(date)
          const dayIsDisabled = isDisabled(date)

          return (
            <button
              key={`calendar-day-${index}`}
              onClick={() => {
                if (!dayIsDisabled && onSelect) {
                  onSelect(date)
                }
              }}
              disabled={dayIsDisabled}
              className={cn(
                "h-9 w-full text-sm rounded transition-colors",
                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                dayIsSelected && "bg-red-500 text-white hover:bg-red-600",
                dayIsToday && !dayIsSelected && "bg-gray-100 font-semibold",
                !dayIsCurrentMonth && "text-gray-400",
                dayIsDisabled && "text-gray-300 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
} 