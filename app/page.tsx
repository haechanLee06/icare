"use client"
import { useState } from "react"
import { Calendar, MessageCircle } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import CalendarInterface from "@/components/calendar-interface"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "calendar">("chat")

  return (
    <div className="flex flex-col h-screen bg-amber-50">
      {/* 主内容区域 */}
      <div className="flex-grow overflow-hidden">
        {activeTab === "chat" ? <ChatInterface /> : <CalendarInterface />}
      </div>

      {/* 底部导航栏 */}
      <div className="flex bg-white border-t border-amber-100 shadow-lg">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
            activeTab === "chat" ? "text-orange-400 bg-amber-50" : "text-stone-500 hover:text-orange-300"
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs mt-1 font-medium">心语</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 flex flex-col items-center py-3 px-4 transition-colors ${
            activeTab === "calendar" ? "text-orange-400 bg-amber-50" : "text-stone-500 hover:text-orange-300"
          }`}
        >
          <Calendar size={24} />
          <span className="text-xs mt-1 font-medium">日历</span>
        </button>
      </div>
    </div>
  )
}
