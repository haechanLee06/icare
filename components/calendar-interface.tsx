"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import DiaryDetailModal from "./diary-detail-modal"
import DiaryEditModal from "./diary-edit-modal"

interface Diary {
  id: string
  content: string
  date: string // YYYY-MM-DD format
  images: string[]
  template: string
  highlight: string
  createdAt: string
}

// 模拟数据库存储
let mockDiaries: Diary[] = [
  {
    id: "1",
    content: "今天天气很好，去公园散步了，心情很放松。",
    date: "2025-08-01",
    images: [],
    template: "nature",
    highlight: "心情很放松",
    createdAt: "2025-08-01T10:00:00Z",
  },
  {
    id: "2",
    content: "完成了一个重要的工作项目，虽然过程有些辛苦，但看到成果的瞬间，一切都值了。",
    date: "2025-08-05", // 假设今天
    images: [],
    template: "warm",
    highlight: "看到成果的瞬间，一切都值了",
    createdAt: "2025-08-05T18:30:00Z",
  },
]

export default function CalendarInterface() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [diaries, setDiaries] = useState<Diary[]>(mockDiaries) // 使用模拟数据
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // 模拟获取日记，直接返回本地数据
  const fetchDiaries = () => {
    setDiaries([...mockDiaries])
  }

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

  const handleDiarySaved = (updatedDiaryContent: string, template: string, images: string[], highlight: string) => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    if (editingDiary) {
      // 更新现有日记
      mockDiaries = mockDiaries.map((d) =>
        d.id === editingDiary.id
          ? { ...d, content: updatedDiaryContent, template, images, highlight, updatedAt: new Date().toISOString() }
          : d,
      )
    } else {
      // 添加新日记
      const newDiary: Diary = {
        id: Date.now().toString(),
        content: updatedDiaryContent,
        date: dateStr,
        images,
        template,
        highlight,
        createdAt: new Date().toISOString(),
      }
      mockDiaries.push(newDiary)
    }
    fetchDiaries() // 刷新日记列表
    setShowEditModal(false)
    setEditingDiary(null)
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

  return (
    <>
      <div className="flex flex-col h-full bg-amber-50">
        {/* 头部 */}
        <div className="p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => navigateMonth("prev")}
              className="p-2 bg-transparent hover:bg-amber-100 text-stone-600 rounded-full"
            >
              <ChevronLeft size={20} />
            </Button>

            <h1 className="text-xl font-bold text-stone-700">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </h1>

            <Button
              onClick={() => navigateMonth("next")}
              className="p-2 bg-transparent hover:bg-amber-100 text-stone-600 rounded-full"
            >
              <ChevronRight size={20} />
            </Button>
          </div>

          {/* 星期表头 */}
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-stone-500 font-medium py-2">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* 日历网格 */}
        <div className="flex-grow p-6 pt-0">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <button
                    onClick={() => {
                      const diary = getDiary(day)
                      if (diary) {
                        setSelectedDiary(diary)
                      }
                    }}
                    className={`w-full h-full relative p-2 rounded-lg transition-colors ${
                      hasDiary(day)
                        ? "bg-orange-100 hover:bg-orange-200 text-orange-800"
                        : "hover:bg-amber-100 text-stone-600"
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {hasDiary(day) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="p-6 bg-white border-t border-amber-100">
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
              天
            </p>
          </div>
        </div>
      </div>

      {/* 日记详情模态框 */}
      <DiaryDetailModal
        diary={selectedDiary}
        isOpen={!!selectedDiary}
        onClose={() => setSelectedDiary(null)}
        onEdit={handleEditDiary}
      />

      {/* 日记编辑模态框 */}
      <DiaryEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialContent={editingDiary?.content || ""}
        onSave={(content, template, images, highlight) => handleDiarySaved(content, template, images, highlight)}
      />
    </>
  )
}
