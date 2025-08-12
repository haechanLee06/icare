"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Calendar, MessageCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate, getTodayString } from "@/lib/supabase"

interface ChatSidebarProps {
  chatDates: string[]
  selectedDate: string
  onDateSelect: (date: string) => void
  onClearChat: (date: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export default function ChatSidebar({
  chatDates,
  selectedDate,
  onDateSelect,
  onClearChat,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const today = getTodayString()

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === formatDate(today)) {
      return "今天"
    } else if (dateStr === formatDate(yesterday)) {
      return "昨天"
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }

  const handleClearChat = (date: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`确定要清空 ${formatDisplayDate(date)} 的聊天记录吗？`)) {
      onClearChat(date)
    }
  }

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-white border-r border-amber-100 flex flex-col">
        {/* 折叠按钮 - 固定在顶部 */}
        <div className="flex-shrink-0 p-2 border-b border-amber-100">
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="w-full">
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* 日期按钮列表 - 可滚动 */}
        <div className="flex-1 flex flex-col items-center py-2 space-y-2 overflow-y-auto">
          {chatDates.slice(0, 20).map((date) => (
            <Button
              key={date}
              variant={selectedDate === date ? "default" : "ghost"}
              size="sm"
              onClick={() => onDateSelect(date)}
              className="w-8 h-8 p-0 flex-shrink-0"
            >
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 h-full bg-white border-r border-amber-100 flex flex-col">
      {/* 侧边栏头部 - 固定在顶部 */}
      <div className="flex-shrink-0 p-4 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-orange-400" />
          <h2 className="font-semibold text-stone-700">聊天记录</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
          <ChevronLeft size={16} />
        </Button>
      </div>

      {/* 今天按钮 - 固定 */}
      <div className="flex-shrink-0 p-4 border-b border-amber-100">
        <Button
          variant={selectedDate === today ? "default" : "outline"}
          className="w-full justify-start"
          onClick={() => onDateSelect(today)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          开始今天的对话
        </Button>
      </div>

      {/* 历史聊天列表 - 可滚动，占据剩余高度 */}
      <div className="flex-1 overflow-y-auto">
        {chatDates.length === 0 ? (
          <div className="p-4 text-center text-stone-500 text-sm">还没有聊天记录</div>
        ) : (
          <div className="p-2">
            {chatDates.map((date) => (
              <div
                key={date}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedDate === date ? "bg-orange-100 text-orange-800" : "hover:bg-amber-50"
                }`}
                onClick={() => onDateSelect(date)}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium truncate">{formatDisplayDate(date)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto flex-shrink-0"
                  onClick={(e) => handleClearChat(date, e)}
                >
                  <Trash2 className="w-3 h-3 text-stone-400 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
