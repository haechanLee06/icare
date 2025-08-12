"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import DiaryDetailModal from "./diary-detail-modal"
import { useDiaries } from "@/hooks/useDiaries"
import { useRouter } from "next/navigation"
import type { Diary } from "@/lib/supabase"

export default function CalendarInterface() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const router = useRouter()

  const { diaries, loading } = useDiaries()

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // 添加空白日期
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // 添加当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const hasDiary = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return diaries.some((diary) => diary.date === dateStr)
  }

  const getDiary = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return diaries.find((diary) => diary.date === dateStr)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const diary = getDiary(day)

    if (diary) {
      setSelectedDiary(diary)
    } else {
      // 创建新日记，跳转到编辑页面
      router.push(`/diary/edit?date=${dateStr}`)
    }
  }

  const handleEditDiary = (diary: Diary) => {
    router.push(`/diary/edit?date=${diary.date}&content=${encodeURIComponent(diary.content)}`)
    setSelectedDiary(null)
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          <p className="mt-2 text-stone-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full bg-amber-50">
        {/* 日历头部 */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-amber-100">
          <Button
            onClick={() => navigateMonth("prev")}
            variant="ghost"
            size="sm"
            className="text-stone-500 hover:text-stone-700"
          >
            <ChevronLeft size={20} />
          </Button>

          <h2 className="text-lg font-semibold text-stone-700">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>

          <Button
            onClick={() => navigateMonth("next")}
            variant="ghost"
            size="sm"
            className="text-stone-500 hover:text-stone-700"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 bg-white border-b border-amber-100">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-stone-600">
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="flex-grow grid grid-cols-7 bg-white">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-r border-b border-amber-100 ${
                day === null ? "bg-gray-50" : "hover:bg-amber-50 cursor-pointer"
              }`}
              onClick={() => day !== null && handleDayClick(day)}
            >
              {day && (
                <div className="h-full flex flex-col">
                  <div className="text-sm font-medium text-stone-700 mb-2">{day}</div>
                  {hasDiary(day) ? (
                    <div className="flex-1 bg-orange-100 rounded-lg p-2 border border-orange-200">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-orange-300 transition-colors">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="p-4 bg-white border-t border-amber-100">
          <div className="text-center text-stone-600">
            <p className="text-sm">
              本月已记录{" "}
              <span className="font-bold text-orange-500">
                {
                  diaries.filter((d) =>
                    d.date.startsWith(
                      `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
                    ),
                  ).length
                }
              </span>{" "}
              天日记
            </p>
          </div>
        </div>
      </div>

      {/* 日记详情模态框 */}
      {selectedDiary && (
        <DiaryDetailModal
          diary={selectedDiary}
          onClose={() => setSelectedDiary(null)}
          onEdit={() => handleEditDiary(selectedDiary)}
        />
      )}
    </>
  )
}
