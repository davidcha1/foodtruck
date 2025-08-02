"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-12 px-12",
        button_previous: cn(
          "h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg p-1 opacity-100 hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center",
          "absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
        ),
        button_next: cn(
          "h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg p-1 opacity-100 hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center", 
          "absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
        ),
        month_grid: "w-full border-collapse space-y-1 mt-4",
        weekdays: "flex border-b border-gray-100 pb-2 mb-2",
        weekday: "text-gray-500 rounded-md w-10 font-medium text-[0.75rem] uppercase tracking-wider text-center py-2",
        weeks: "flex flex-col space-y-1",
        week: "flex w-full mt-1",
        day: cn(
          "h-10 w-10 text-center text-sm p-0 relative rounded-lg",
          "hover:bg-gray-50 transition-colors duration-150",
          "focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          "h-10 w-10 p-0 font-medium aria-selected:opacity-100 rounded-lg transition-all duration-150",
          "hover:bg-gray-100 hover:scale-105"
        ),
        selected: cn(
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
          "focus:bg-blue-600 focus:text-white shadow-md"
        ),
        today: "bg-blue-50 text-blue-900 font-semibold border border-blue-200",
        outside: cn(
          "text-gray-300 opacity-50",
          "aria-selected:bg-gray-100 aria-selected:text-gray-400 aria-selected:opacity-30"
        ),
        disabled: "text-gray-300 opacity-50 cursor-not-allowed",
        range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-5 w-5 text-white" />
          }
          return <ChevronRight className="h-5 w-5 text-white" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 