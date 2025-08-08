"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Mock data for days with diary entries
  const diaryDays = [5, 12, 18, 23, 28]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ]

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-amber-100">
        <Link href="/">
          <MessageCircle className="w-6 h-6 text-stone-600" />
        </Link>
        <h1 className="text-xl font-semibold text-stone-700">日历</h1>
        <div className="w-6 h-6"></div>
      </div>

      {/* Calendar */}
      <div className="flex-grow p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={previousMonth} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-stone-700">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>
          <Button variant="ghost" onClick={nextMonth} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-xs font-medium text-stone-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const hasDiary = diaryDays.includes(day)

            return (
              <div
                key={day}
                className={`relative p-2 text-center rounded-full cursor-pointer transition-colors ${
                  hasDiary ? "hover:bg-amber-100" : "hover:bg-gray-100"
                }`}
              >
                <span className="text-stone-700">{day}</span>
                {hasDiary && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-center p-4 bg-white border-t border-amber-100">
        <div className="flex space-x-8">
          <Link href="/" className="flex flex-col items-center space-y-1">
            <MessageCircle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">心语</span>
          </Link>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 p-1 bg-orange-400 rounded">
              <div className="w-full h-full bg-white rounded-sm"></div>
            </div>
            <span className="text-xs text-orange-400 font-medium">日历</span>
          </div>
        </div>
      </div>
    </div>
  )
}
