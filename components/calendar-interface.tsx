"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import DiaryDetailModal from "./diary-detail-modal"
import DiaryEditModal from "./diary-edit-modal"
import { useDiaries } from "@/hooks/useDiaries"
import type { Diary } from "@/lib/supabase"

export default function CalendarInterface() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const { diaries, loading, addDiary, updateDiary } = useDiaries()

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

  const handleEditDiary = (diary: Diary) => {
    setEditingDiary(diary)
    setShowEditModal(true)
    setSelectedDiary(null) // 关闭详情模态框
  }

  const handleDiarySaved = async (updatedDiaryContent: string, template: string, images: string[], highlight: string) => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    try {
      if (editingDiary) {
        // 更新现有日记
        const { error } = await updateDiary(editingDiary.id, {
          content: updatedDiaryContent,
          template,
          images,
          highlight,
        })
        
        if (error) {
          alert("更新日记失败，请重试")
          return
        }
      } else {
        // 添加新日记
        const { error } = await addDiary({
          content: updatedDiaryContent,
          date: dateStr,
          template,
          images,
          highlight,
        })
        
        if (error) {
          alert("保存日记失败，请重试")
          return
        }
      }
      
      setShowEditModal(false)
      setEditingDiary(null)
    } catch (error) {
      console.error("保存日记失败:", error)
      alert("保存失败，请重试")
    }
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
      <div className="flex flex-col h-full">
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
              className={`min-h-[80px] p-2 border-r border-b border-amber-100 ${
                day === null ? "bg-gray-50" : "hover:bg-amber-50 cursor-pointer"
              }`}
              onClick={() => {
                if (day !== null) {
                  const diary = getDiary(day)
                  if (diary) {
                    setSelectedDiary(diary)
                  } else {
                    // 创建新日记
                    setEditingDiary(null)
                    setShowEditModal(true)
                  }
                }
              }}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-stone-700 mb-1">{day}</div>
                  {hasDiary(day) && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full mx-auto"></div>
                  )}
                </>
              )}
            </div>
          ))}
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

      {/* 日记编辑模态框 */}
      <DiaryEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingDiary(null)
        }}
        initialContent={editingDiary?.content || ""}
        onSave={handleDiarySaved}
      />
    </>
  )
}
